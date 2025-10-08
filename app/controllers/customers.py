from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user_id
from app.database import db
from app.models import Customer
from sqlalchemy import text

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/', methods=['GET'])
@require_auth
def get_customers():
    """Pobiera listę klientów"""
    try:
        customers = Customer.query.all()
        return jsonify([customer.to_dict() for customer in customers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/', methods=['POST'])
@require_auth
def create_customer():
    """Tworzy nowego klienta"""
    try:
        data = request.get_json()
        
        new_customer = Customer(
            Name=data.get('name'),
            Email=data.get('email'),
            Phone=data.get('phone'),
            Company=data.get('company'),
            Address=data.get('address'),
            NIP=data.get('nip'),
            Representative=data.get('representative'),
            AssignedGroupId=data.get('assignedGroupId'),
            AssignedUserId=data.get('assignedUserId')
        )
        
        db.session.add(new_customer)
        db.session.commit()
        
        return jsonify(new_customer.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/<int:customer_id>', methods=['GET'])
@require_auth
def get_customer(customer_id):
    """Pobiera szczegóły klienta"""
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Klient nie znaleziony'}), 404
        
        return jsonify(customer.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/<int:customer_id>', methods=['PUT'])
@require_auth
def update_customer(customer_id):
    """Aktualizuje klienta"""
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Klient nie znaleziony'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            customer.Name = data['name']
        if 'email' in data:
            customer.Email = data['email']
        if 'phone' in data:
            customer.Phone = data['phone']
        if 'company' in data:
            customer.Company = data['company']
        if 'address' in data:
            customer.Address = data['address']
        if 'nip' in data:
            customer.NIP = data['nip']
        if 'representative' in data:
            customer.Representative = data['representative']
        if 'assignedGroupId' in data:
            customer.AssignedGroupId = data['assignedGroupId']
        if 'assignedUserId' in data:
            customer.AssignedUserId = data['assignedUserId']
        
        db.session.commit()
        
        return jsonify(customer.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/<int:customer_id>', methods=['DELETE'])
@require_auth
def delete_customer(customer_id):
    """Usuwa klienta"""
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Klient nie znaleziony'}), 404
        
        db.session.delete(customer)
        db.session.commit()
        
        return jsonify({'message': 'Klient usunięty'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
