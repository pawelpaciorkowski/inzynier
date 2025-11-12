from flask import Blueprint, request, jsonify
from app.middleware import require_auth
from app.database import db
from app.models import Payment
from datetime import datetime
from sqlalchemy.orm import joinedload

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/', methods=['GET'])
@require_auth
def get_payments():
    """Pobiera listę płatności, opcjonalnie filtrowaną według invoiceId"""
    try:
        # Pobierz parametr invoiceId z query string
        invoice_id = request.args.get('invoiceId', type=int)
        
        # Rozpocznij zapytanie z joinedload dla relacji invoice
        query = Payment.query.options(joinedload(Payment.invoice))
        
        # Jeśli podano invoiceId, filtruj według niego
        if invoice_id is not None:
            query = query.filter_by(InvoiceId=invoice_id)
        
        # Sortuj i pobierz wyniki
        payments = query.order_by(Payment.PaidAt.desc()).all()
        
        return jsonify([payment.to_dict() for payment in payments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/', methods=['POST'])
@require_auth
def create_payment():
    """Tworzy nową płatność i automatycznie aktualizuje status faktury"""
    try:
        data = request.get_json()
        
        # Pobierz fakturę, aby sprawdzić jej stan
        from app.models import Invoice
        invoice = Invoice.query.get(data.get('invoiceId'))
        if not invoice:
            return jsonify({'error': 'Faktura nie znaleziona'}), 404
        
        # Utwórz nową płatność
        new_payment = Payment(
            InvoiceId=data.get('invoiceId'),
            PaidAt=datetime.fromisoformat(data.get('paymentDate').replace('Z', '')) if data.get('paymentDate') else datetime.now(),
            Amount=data.get('amount')
        )
        
        db.session.add(new_payment)
        db.session.flush()  # Zapisz płatność, aby móc ją uwzględnić w sumie
        
        # Oblicz sumę wszystkich płatności dla tej faktury
        total_paid = db.session.query(db.func.sum(Payment.Amount)).filter_by(InvoiceId=invoice.Id).scalar() or 0
        
        # Jeśli suma płatności >= kwota faktury, oznacz jako opłaconą
        if total_paid >= invoice.TotalAmount:
            invoice.IsPaid = True
        else:
            invoice.IsPaid = False
        
        db.session.commit()
        
        return jsonify(new_payment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/<int:payment_id>', methods=['GET'])
@require_auth
def get_payment(payment_id):
    """Pobiera szczegóły płatności"""
    try:
        payment = Payment.query.options(joinedload(Payment.invoice)).get(payment_id)
        if not payment:
            return jsonify({'error': 'Płatność nie znaleziona'}), 404
        
        return jsonify(payment.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/<int:payment_id>', methods=['PUT'])
@require_auth
def update_payment(payment_id):
    """Aktualizuje płatność i automatycznie aktualizuje status faktury"""
    try:
        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({'error': 'Płatność nie znaleziona'}), 404
        
        data = request.get_json()
        
        if 'amount' in data:
            payment.Amount = data['amount']
        if 'paymentDate' in data:
            payment.PaidAt = datetime.fromisoformat(data['paymentDate'].replace('Z', '')) if data['paymentDate'] else None
        
        db.session.flush()
        
        # Pobierz fakturę i zaktualizuj jej status
        from app.models import Invoice
        invoice = Invoice.query.get(payment.InvoiceId)
        if invoice:
            # Oblicz sumę wszystkich płatności dla tej faktury
            total_paid = db.session.query(db.func.sum(Payment.Amount)).filter_by(InvoiceId=invoice.Id).scalar() or 0
            
            # Jeśli suma płatności >= kwota faktury, oznacz jako opłaconą
            if total_paid >= invoice.TotalAmount:
                invoice.IsPaid = True
            else:
                invoice.IsPaid = False
        
        db.session.commit()
        
        return jsonify(payment.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/<int:payment_id>', methods=['DELETE'])
@require_auth
def delete_payment(payment_id):
    """Usuwa płatność i automatycznie aktualizuje status faktury"""
    try:
        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({'error': 'Płatność nie znaleziona'}), 404
        
        # Zapisz invoice_id przed usunięciem płatności
        invoice_id = payment.InvoiceId
        
        db.session.delete(payment)
        db.session.flush()
        
        # Pobierz fakturę i zaktualizuj jej status
        from app.models import Invoice
        invoice = Invoice.query.get(invoice_id)
        if invoice:
            # Oblicz sumę wszystkich pozostałych płatności dla tej faktury
            total_paid = db.session.query(db.func.sum(Payment.Amount)).filter_by(InvoiceId=invoice.Id).scalar() or 0
            
            # Jeśli suma płatności >= kwota faktury, oznacz jako opłaconą
            if total_paid >= invoice.TotalAmount:
                invoice.IsPaid = True
            else:
                invoice.IsPaid = False
        
        db.session.commit()
        
        return jsonify({'message': 'Płatność usunięta'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500