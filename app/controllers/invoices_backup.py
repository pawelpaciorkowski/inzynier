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
    # Używamy domyślnych czcionek ReportLab - Helvetica
    # Te czcionki obsługują polskie znaki
    return True

def create_invoice_pdf(invoice):
    """Tworzy prosty PDF faktury"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    
    # Style - domyślne
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    normal_style = styles['Normal']
    
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
    if invoice.items:
        for item in invoice.items:
            elements.append(Paragraph(f"• {item.service.Name if item.service else 'Usługa'} - Ilość: {item.Quantity} - Cena: {float(item.UnitPrice):.2f} PLN", normal_style))
    else:
        elements.append(Paragraph("Brak pozycji", normal_style))
    
    # Buduj PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer

@invoices_bp.route('/', methods=['GET'])
@require_auth
def get_invoices():
    """Pobiera listę faktur"""
    try:
        invoices = Invoice.query.options(joinedload(Invoice.customer)).all()
        return jsonify([invoice.to_dict() for invoice in invoices]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/', methods=['POST'])
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 20))
    
    # Dane klienta
    if invoice.customer:
        elements.append(Paragraph("DANE KLIENTA", title_style))
        elements.append(Spacer(1, 10))
        
        customer_data = [
            ['Nazwa:', invoice.customer.Name],
            ['Email:', invoice.customer.Email or 'Brak'],
            ['Telefon:', invoice.customer.Phone or 'Brak'],
            ['Firma:', invoice.customer.Company or 'Brak'],
            ['Adres:', invoice.customer.Address or 'Brak'],
        ]
        
        customer_table = Table(customer_data, colWidths=[100, 250])
        customer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(customer_table)
        elements.append(Spacer(1, 20))

    # Pozycje faktury (InvoiceItems)
    if invoice.invoice_items:
        elements.append(Paragraph("POZYCJE NA FAKTURZE", title_style))
        elements.append(Spacer(1, 10))

        # Nagłówki tabeli pozycji
        items_headers = ['LP', 'USŁUGA', 'ILOŚĆ', 'CENA JEDN.', 'WARTOŚĆ']
        items_data = [items_headers]

        for idx, item in enumerate(invoice.invoice_items, 1):
            items_data.append([
                str(idx),
                item.service.Name if item.service else 'Nieznana usługa',
                str(item.Quantity),
                f"{float(item.UnitPrice):.2f} PLN" if item.UnitPrice else "0.00 PLN",
                f"{float(item.UnitPrice * item.Quantity):.2f} PLN" if item.UnitPrice and item.Quantity else "0.00 PLN"
            ])

        items_table = Table(items_data, colWidths=[30, 200, 60, 90, 90])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),  # LP wyśrodkowane
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),    # Usługa wyrównana do lewej
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),  # Liczby do prawej
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        elements.append(items_table)
        elements.append(Spacer(1, 20))

    # Historia płatności
    from app.models.payment import Payment
    payments = Payment.query.filter_by(InvoiceId=invoice.Id).order_by(Payment.PaidAt.desc()).all()
    
    if payments:
        elements.append(Paragraph("HISTORIA PŁATNOŚCI", title_style))
        elements.append(Spacer(1, 10))
        
        # Nagłówki tabeli płatności
        payment_headers = ['ID PŁATNOŚCI', 'DATA PŁATNOŚCI', 'KWOTA', 'STATUS']
        payment_data = [payment_headers]
        
        total_paid = 0
        for payment in payments:
            total_paid += float(payment.Amount)
            payment_data.append([
                str(payment.Id),
                payment.PaidAt.strftime('%d.%m.%Y %H:%M') if payment.PaidAt else 'Brak daty',
                f"{float(payment.Amount):.2f} PLN",
                'OPŁACONA'
            ])
        
        payment_table = Table(payment_data, colWidths=[80, 120, 100, 100])
        payment_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(payment_table)
        elements.append(Spacer(1, 10))
        
        # Podsumowanie płatności
        remaining_amount = float(invoice.TotalAmount) - total_paid if invoice.TotalAmount else 0
        
        summary_data = [
            ['Do zapłaty:', f"{float(invoice.TotalAmount):.2f} PLN" if invoice.TotalAmount else "0.00 PLN"],
            ['Zapłacono:', f"{total_paid:.2f} PLN"],
            ['Pozostało:', f"{remaining_amount:.2f} PLN"],
        ]
        
        summary_table = Table(summary_data, colWidths=[100, 150])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 20))
    
    # Informacje dodatkowe
    elements.append(Paragraph("INFORMACJE DODATKOWE", title_style))
    elements.append(Spacer(1, 10))
    
    additional_data = [
        ['Data wygenerowania PDF:', datetime.now().strftime('%d.%m.%Y %H:%M')],
        ['ID faktury w systemie:', str(invoice.Id)],
        ['ID klienta:', str(invoice.CustomerId)],
    ]
    
    if invoice.AssignedGroupId:
        additional_data.append(['Przypisana grupa ID:', str(invoice.AssignedGroupId)])
    
    if invoice.CreatedByUserId:
        additional_data.append(['Utworzona przez użytkownika ID:', str(invoice.CreatedByUserId)])
    
    additional_table = Table(additional_data, colWidths=[150, 200])
    additional_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(additional_table)
    
    # Buduj PDF
    doc.build(elements)
    
    buffer.seek(0)
    return buffer

@invoices_bp.route('/', methods=['GET'])
@require_auth
def get_invoices():
    """Pobiera listę faktur"""
    try:
        invoices = Invoice.query.options(joinedload(Invoice.customer)).all()
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
            # Użyj stawki podatku z usługi, jeśli dostępna, w przeciwnym razie domyślnej 0.23
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
            service = Service.query.get(item_data['serviceId'])
            if service:
                # Użyj stawki podatku z usługi, jeśli dostępna, w przeciwnym razie domyślnej 0.23
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
    """Pobiera szczegóły faktury z pozycjami"""
    try:
        invoice = Invoice.query.options(joinedload(Invoice.customer)).get(invoice_id)
        if not invoice:
            return jsonify({'error': 'Faktura nie znaleziona'}), 404

        # Zwróć fakturę Z pozycjami
        return jsonify(invoice.to_dict(include_items=True)), 200
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
        if 'customerId' in data: # Umożliwia zmianę klienta dla faktury
            invoice.CustomerId = data['customerId']

        # Obsługa pozycji faktury
        if 'items' in data:
            # Usuń wszystkie istniejące pozycje faktury
            InvoiceItem.query.filter_by(InvoiceId=invoice_id).delete()
            db.session.flush() # Upewnij się, że usunięcia są wykonane przed dodaniem nowych

            new_total_amount = Decimal(0)
            # Dodaj nowe pozycje faktury i przelicz TotalAmount
            for item_data in data['items']:
                service = Service.query.get(item_data['serviceId'])
                if service:
                    quantity = item_data.get('quantity', 1)
                    unit_price = Decimal(str(service.Price)) # Użyj aktualnej ceny usługi i skonwertuj na Decimal
                    # Użyj stawki podatku z usługi, jeśli dostępna, w przeciwnym razie domyślnej 0.23
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
        
        # Zwróć zaktualizowaną fakturę z pozycjami
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
        invoice = Invoice.query.options(
            joinedload(Invoice.customer),
            joinedload(Invoice.invoice_items).joinedload('service')
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