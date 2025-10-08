from flask import Blueprint, request, jsonify
from app.middleware import require_auth
from app.database import db
from app.models import Service

services_bp = Blueprint('services', __name__)

@services_bp.route('/', methods=['GET'])
@require_auth
def get_services():
    """Pobiera listę usług"""
    try:
        services = Service.query.all()
        return jsonify([service.to_dict() for service in services]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@services_bp.route('/', methods=['POST'])
@require_auth
def create_service():
    """Tworzy nową usługę"""
    try:
        data = request.get_json()
        
        new_service = Service(
            Name=data.get('name'),
            Price=data.get('price')
        )
        
        db.session.add(new_service)
        db.session.commit()
        
        return jsonify(new_service.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@services_bp.route('/<int:service_id>', methods=['GET'])
@require_auth
def get_service(service_id):
    """Pobiera szczegóły usługi"""
    try:
        service = Service.query.get(service_id)
        if not service:
            return jsonify({'error': 'Usługa nie znaleziona'}), 404
        
        return jsonify(service.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@services_bp.route('/<int:service_id>', methods=['PUT'])
@require_auth
def update_service(service_id):
    """Aktualizuje usługę"""
    try:
        service = Service.query.get(service_id)
        if not service:
            return jsonify({'error': 'Usługa nie znaleziona'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            service.Name = data['name']
        if 'price' in data:
            service.Price = data['price']
        
        db.session.commit()
        
        return jsonify(service.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@services_bp.route('/<int:service_id>', methods=['DELETE'])
@require_auth
def delete_service(service_id):
    """Usuwa usługę (soft delete)"""
    try:
        service = Service.query.get(service_id)
        if not service:
            return jsonify({'error': 'Usługa nie znaleziona'}), 404
        
        db.session.delete(service)
        db.session.commit()
        
        return jsonify({'message': 'Usługa usunięta'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
