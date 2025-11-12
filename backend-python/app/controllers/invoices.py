from flask import Blueprint, request, jsonify, make_response
from app.middleware import require_auth
from app.database import db
from app.models import Invoice
from sqlalchemy.orm import joinedload
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from io import BytesIO
import os
from datetime import datetime
from decimal import Decimal

invoices_bp = Blueprint('invoices', __name__)

def register_polish_fonts():
    """Rejestruje polskie czcionki dla PDF"""
    try:
        # Próbuj zarejestrować czcionki DejaVu Sans
        font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
        bold_font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
        
        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))
        if os.path.exists(bold_font_path):
            pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', bold_font_path))
        return True
    except Exception as e:
        print(f"Nie udało się zarejestrować czcionek: {e}")
        return False

def fix_polish_chars(text):
    """Naprawia polskie znaki dla PDF"""
    if not text:
        return text
    return str(text).encode('utf-8').decode('utf-8')

def create_invoice_pdf(invoice):
    """Tworzy prosty PDF faktury"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    
    # Rejestruj polskie czcionki
    register_polish_fonts()
    
    # Style z polskimi czcionkami
    styles = getSampleStyleSheet()
    
    # Sprawdź czy DejaVu jest dostępne, jeśli nie użyj Helvetica
    if 'DejaVuSans-Bold' in pdfmetrics.getRegisteredFontNames():
        title_font = 'DejaVuSans-Bold'
        normal_font = 'DejaVuSans'
    else:
        title_font = 'Helvetica-Bold'
        normal_font = 'Helvetica'
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=title_font,
        fontSize=16
    )
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontName=normal_font,
        fontSize=10
    )
    
    # Elementy PDF
    elements = []
    
    # Tytuł
    elements.append(Paragraph("FAKTURA", title_style))
    elements.append(Spacer(1, 20))
    
    # Proste dane faktury
    elements.append(Paragraph(f"<b>Numer faktury:</b> {invoice.Number}", normal_style))
    elements.append(Paragraph(f"<b>Data wystawienia:</b> {invoice.IssuedAt.strftime('%d.%m.%Y') if invoice.IssuedAt else 'Brak daty'}", normal_style))
    elements.append(Paragraph(f"<b>Termin płatności:</b> {invoice.DueDate.strftime('%d.%m.%Y') if invoice.DueDate else 'Brak daty'}", normal_style))
    elements.append(Paragraph(f"<b>Status:</b> {'OPŁACONA' if invoice.IsPaid else 'OCZEKUJĄCA NA PŁATNOŚĆ'}", normal_style))
    elements.append(Paragraph(f"<b>Kwota faktury:</b> {float(invoice.TotalAmount):.2f} PLN" if invoice.TotalAmount else "0.00 PLN", normal_style))
    
    elements.append(Spacer(1, 20))
    
    # Dane klienta
    if invoice.customer:
        elements.append(Paragraph("DANE KLIENTA", title_style))
        elements.append(Paragraph(f"<b>Nazwa:</b> {invoice.customer.Name}", normal_style))
        elements.append(Paragraph(f"<b>Email:</b> {invoice.customer.Email or 'Brak'}", normal_style))
        elements.append(Paragraph(f"<b>Telefon:</b> {invoice.customer.Phone or 'Brak'}", normal_style))
        elements.append(Paragraph(f"<b>Firma:</b> {invoice.customer.Company or 'Brak'}", normal_style))
        elements.append(Paragraph(f"<b>Adres:</b> {invoice.customer.Address or 'Brak'}", normal_style))
    
    elements.append(Spacer(1, 20))
    
    # Pozycje faktury
    elements.append(Paragraph("POZYCJE FAKTURY", title_style))
    if invoice.invoice_items:
        for item in invoice.invoice_items:
            service_name = item.service.Name if item.service else 'Usługa'
            elements.append(Paragraph(f"• {service_name} - Ilość: {item.Quantity} - Cena: {float(item.UnitPrice):.2f} PLN", normal_style))
    else:
        elements.append(Paragraph("Brak pozycji", normal_style))
    
    # Buduj PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer

@invoices_bp.route('/', methods=['GET'])
@require_auth
def get_invoices():
    """Pobiera listę faktur, posortowaną od najnowszych (malejąco według ID)"""
    try:
        # Pobierz faktury z danymi klienta, sortując od najnowszych (największe ID na początku)
        invoices = Invoice.query.options(joinedload(Invoice.customer)).order_by(Invoice.Id.desc()).all()
        return jsonify([invoice.to_dict() for invoice in invoices]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/', methods=['POST'])
@require_auth
def create_invoice():
    """Tworzy nową fakturę z pozycjami"""
    try:
        data = request.get_json()

        from datetime import datetime
        from app.middleware import get_current_user_id
        from app.models import InvoiceItem, Service

        user_id = get_current_user_id()

        # Oblicz totalAmount na podstawie items
        items_data = data.get('items', [])
        total_amount = Decimal(0)

        for item_data in items_data:
            service_id = item_data.get('serviceId')
            if not service_id:
                return jsonify({'error': 'Brak serviceId w pozycji'}), 400
                
            service = Service.query.get(service_id)
            if not service:
                return jsonify({'error': f'Usługa o ID {service_id} nie istnieje'}), 400
                
            quantity = item_data.get('quantity', 1)
            tax_rate = service.TaxRate if service.TaxRate is not None else Decimal('0.23')
            
            unit_price = Decimal(str(service.Price))
            net_amount = unit_price * quantity
            tax_amount = net_amount * tax_rate
            gross_amount = net_amount + tax_amount

            total_amount += gross_amount

        # Oblicz datę płatności (domyślnie 14 dni od wystawienia)
        due_date = None
        if data.get('dueDate'):
            due_date = datetime.fromisoformat(data.get('dueDate').replace('Z', '+00:00'))
        else:
            # Domyślnie 14 dni od daty wystawienia
            from datetime import timedelta
            due_date = datetime.now() + timedelta(days=14)

        new_invoice = Invoice(
            Number=data.get('invoiceNumber'),
            TotalAmount=total_amount,  # Obliczona kwota
            IsPaid=data.get('isPaid', False),
            DueDate=due_date,
            CustomerId=data.get('customerId'),
            IssuedAt=datetime.now(),
            AssignedGroupId=data.get('assignedGroupId'),
            CreatedByUserId=user_id
        )

        db.session.add(new_invoice)
        db.session.flush()  # Zapisz aby dostać invoice.Id

        # Dodaj pozycje faktury (InvoiceItems)
        for item_data in items_data:
            service_id = item_data.get('serviceId')
            service = Service.query.get(service_id)
            if service:
                tax_rate = service.TaxRate if service.TaxRate is not None else Decimal('0.23')
                unit_price = service.Price  # Zapisz cenę z momentu utworzenia
                quantity = item_data.get('quantity', 1)
                
                net_amount = unit_price * quantity
                tax_amount = net_amount * tax_rate
                gross_amount = net_amount + tax_amount

                invoice_item = InvoiceItem(
                    InvoiceId=new_invoice.Id,
                    ServiceId=service.Id,
                    Quantity=quantity,
                    UnitPrice=unit_price,
                    Description=service.Name,
                    TaxRate=tax_rate,
                    NetAmount=net_amount,
                    TaxAmount=tax_amount,
                    GrossAmount=gross_amount
                )
                db.session.add(invoice_item)

        db.session.commit()

        return jsonify(new_invoice.to_dict(include_items=True)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/<int:invoice_id>', methods=['GET'])
@require_auth
def get_invoice(invoice_id):
    """Pobiera szczegóły faktury z pozycjami i płatnościami"""
    try:
        from app.models import Payment
        invoice = Invoice.query.options(joinedload(Invoice.customer)).get(invoice_id)
        if not invoice:
            return jsonify({'error': 'Faktura nie znaleziona'}), 404

        # Pobierz dane faktury
        invoice_data = invoice.to_dict(include_items=True)
        
        # Pobierz wszystkie płatności dla tej faktury
        payments = Payment.query.filter_by(InvoiceId=invoice_id).order_by(Payment.PaidAt.desc()).all()
        
        # Oblicz sumę zapłaconych kwot
        paid_amount = sum(float(payment.Amount) for payment in payments) if payments else 0.0
        
        # Oblicz pozostałą kwotę do zapłaty
        total_amount = float(invoice.TotalAmount) if invoice.TotalAmount else 0.0
        remaining_amount = total_amount - paid_amount
        
        # Dodaj informacje o płatnościach do odpowiedzi
        invoice_data['paidAmount'] = paid_amount
        invoice_data['remainingAmount'] = remaining_amount
        invoice_data['payments'] = [payment.to_dict() for payment in payments]

        return jsonify(invoice_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/<int:invoice_id>', methods=['PUT'])
@require_auth
def update_invoice(invoice_id):
    """Aktualizuje fakturę wraz z pozycjami"""
    try:
        invoice = Invoice.query.options(joinedload(Invoice.invoice_items)).get(invoice_id)
        if not invoice:
            return jsonify({'error': 'Faktura nie znaleziona'}), 404
        
        data = request.get_json()
        from app.models import InvoiceItem, Service

        # Aktualizuj podstawowe pola faktury
        if 'invoiceNumber' in data:
            invoice.Number = data['invoiceNumber']
        if 'isPaid' in data:
            invoice.IsPaid = data['isPaid']
        if 'dueDate' in data:
            from datetime import datetime
            invoice.DueDate = datetime.fromisoformat(data['dueDate'].replace('Z', '+00:00')) if data['dueDate'] else None
        if 'assignedGroupId' in data:
            invoice.AssignedGroupId = data['assignedGroupId']
        if 'customerId' in data:
            invoice.CustomerId = data['customerId']

        # Obsługa pozycji faktury
        if 'items' in data:
            # Usuń wszystkie istniejące pozycje faktury
            InvoiceItem.query.filter_by(InvoiceId=invoice_id).delete()
            db.session.flush()

            new_total_amount = Decimal(0)
            # Dodaj nowe pozycje faktury i przelicz TotalAmount
            for item_data in data['items']:
                service = Service.query.get(item_data['serviceId'])
                if service:
                    quantity = item_data.get('quantity', 1)
                    unit_price = Decimal(str(service.Price))
                    tax_rate = service.TaxRate if service.TaxRate is not None else Decimal('0.23')

                    net_amount = unit_price * quantity
                    tax_amount = net_amount * tax_rate
                    gross_amount = net_amount + tax_amount

                    invoice_item = InvoiceItem(
                        InvoiceId=invoice.Id,
                        ServiceId=service.Id,
                        Quantity=quantity,
                        UnitPrice=unit_price,
                        Description=service.Name,
                        TaxRate=tax_rate,
                        NetAmount=net_amount,
                        TaxAmount=tax_amount,
                        GrossAmount=gross_amount
                    )
                    db.session.add(invoice_item)
                    new_total_amount += gross_amount
                else:
                    db.session.rollback()
                    return jsonify({'error': f'Usługa o ID {item_data["serviceId"]} nie znaleziona.'}), 400
            
            invoice.TotalAmount = new_total_amount

        db.session.commit()
        
        return jsonify(invoice.to_dict(include_items=True)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/<int:invoice_id>', methods=['DELETE'])
@require_auth
def delete_invoice(invoice_id):
    """Usuwa fakturę"""
    try:
        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return jsonify({'error': 'Faktura nie znaleziona'}), 404
        
        db.session.delete(invoice)
        db.session.commit()
        
        return jsonify({'message': 'Faktura usunięta'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/<int:invoice_id>/pdf', methods=['GET'])
def generate_invoice_pdf(invoice_id):
    """Generuje PDF faktury"""
    try:
        print(f"PDF request dla faktury {invoice_id}")
        # Pobierz token z parametrów URL (potrzebne dla window.open w przeglądarce)
        token = request.args.get('token')
        print(f"Token: {token[:20] if token else 'BRAK'}...")
        if not token:
            return jsonify({'error': 'Brak tokenu autoryzacji'}), 401

        # Sprawdź autoryzację - użyj tej samej logiki co w middleware
        import jwt
        from app.config import Config
        try:
            # Dekoduj token
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id') or payload.get('sub')

            if not user_id:
                return jsonify({'error': 'Token nieprawidłowy'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token wygasł'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token nieprawidłowy'}), 401
        except Exception:
            return jsonify({'error': 'Nieprawidłowy token'}), 401

        # Pobierz fakturę z danymi klienta i pozycjami
        from sqlalchemy.orm import joinedload
        from app.models import InvoiceItem
        invoice = Invoice.query.options(
            joinedload(Invoice.customer),
            joinedload(Invoice.invoice_items).joinedload(InvoiceItem.service)
        ).get(invoice_id)
        if not invoice:
            return jsonify({'error': 'Faktura nie znaleziona'}), 404

        # Generuj PDF
        pdf_buffer = create_invoice_pdf(invoice)
        
        # Przygotuj odpowiedź
        response = make_response(pdf_buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        # Usuń polskie znaki z nazwy pliku
        safe_invoice_number = invoice.Number.replace('ą', 'a').replace('ć', 'c').replace('ę', 'e').replace('ł', 'l').replace('ń', 'n').replace('ó', 'o').replace('ś', 's').replace('ź', 'z').replace('ż', 'z')
        response.headers['Content-Disposition'] = f'inline; filename=faktura_{safe_invoice_number}.pdf'
        
        return response

    except Exception as e:
        return jsonify({'error': f'Błąd generowania PDF: {str(e)}'}), 500
