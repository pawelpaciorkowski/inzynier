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
    """Pobiera listę płatności"""
    try:
        payments = Payment.query.options(joinedload(Payment.invoice)).order_by(Payment.PaidAt.desc()).all()
        return jsonify([payment.to_dict() for payment in payments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/', methods=['POST'])
@require_auth
def create_payment():
    """Tworzy nową płatność"""
    try:
        data = request.get_json()
        
        new_payment = Payment(
            InvoiceId=data.get('invoiceId'),
            PaidAt=datetime.fromisoformat(data.get('paymentDate').replace('Z', '')) if data.get('paymentDate') else datetime.now(),
            Amount=data.get('amount')
        )
        
        db.session.add(new_payment)
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
    """Aktualizuje płatność"""
    try:
        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({'error': 'Płatność nie znaleziona'}), 404
        
        data = request.get_json()
        
        if 'amount' in data:
            payment.Amount = data['amount']
        if 'paymentDate' in data:
            payment.PaidAt = datetime.fromisoformat(data['paymentDate'].replace('Z', '')) if data['paymentDate'] else None
        
        db.session.commit()
        
        return jsonify(payment.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/<int:payment_id>', methods=['DELETE'])
@require_auth
def delete_payment(payment_id):
    """Usuwa płatność"""
    try:
        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({'error': 'Płatność nie znaleziona'}), 404
        
        db.session.delete(payment)
        db.session.commit()
        
        return jsonify({'message': 'Płatność usunięta'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500