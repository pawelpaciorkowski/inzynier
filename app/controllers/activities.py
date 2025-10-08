from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user_id
from app.database import db
from app.models import Activity, Customer, User
from sqlalchemy import text
from datetime import datetime

activities_bp = Blueprint('activities', __name__)

@activities_bp.route('/', methods=['GET'])
@require_auth
def get_activities():
    """Pobiera listę aktywności z nazwami klientów i użytkowników"""
    try:
        # JOIN z tabelami Customers i Users aby pobrać nazwy
        activities = db.session.execute(text("""
            SELECT 
                a.Id, 
                a.Note, 
                a.CreatedAt, 
                a.UserId, 
                a.CustomerId,
                c.Name as CustomerName,
                u.username as UserName
            FROM Activities a
            LEFT JOIN Customers c ON a.CustomerId = c.Id
            LEFT JOIN users u ON a.UserId = u.id
            ORDER BY a.CreatedAt DESC
            LIMIT 50
        """)).fetchall()
        
        activities_list = []
        for activity in activities:
            activities_list.append({
                'id': activity[0],
                'note': activity[1],  # Note - opis aktywności
                'createdAt': activity[2].isoformat() if activity[2] and hasattr(activity[2], 'isoformat') else str(activity[2]) if activity[2] else None,  # CreatedAt
                'customerId': activity[4],  # CustomerId
                'customerName': activity[5] if activity[5] else 'Brak klienta',  # CustomerName z JOIN
                'userId': activity[3],   # UserId
                'userName': activity[6] if activity[6] else 'Nieznany użytkownik'  # UserName z JOIN
            })
        
        return jsonify(activities_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@activities_bp.route('/', methods=['POST'])
@require_auth
def create_activity():
    """Tworzy nową aktywność"""
    try:
        current_user_id = get_current_user_id()
        data = request.get_json()
        
        if not data or 'title' not in data:
            return jsonify({'error': 'Brak wymaganych danych'}), 400
        
        new_activity = Activity(
            title=data['title'],
            description=data.get('description'),
            activity_date=datetime.fromisoformat(data['activityDate'].replace('Z', '+00:00')) if data.get('activityDate') else datetime.utcnow(),
            customer_id=data.get('customerId'),
            user_id=current_user_id
        )
        
        db.session.add(new_activity)
        db.session.commit()
        
        return jsonify({
            'id': new_activity.id,
            'title': new_activity.title,
            'description': new_activity.description,
            'activityDate': new_activity.activity_date.isoformat(),
            'customerId': new_activity.customer_id,
            'userId': new_activity.user_id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@activities_bp.route('/<int:activity_id>', methods=['PUT'])
@require_auth
def update_activity(activity_id):
    """Aktualizuje aktywność"""
    try:
        activity = Activity.query.get_or_404(activity_id)
        data = request.get_json()
        
        if 'note' in data:
            activity.Note = data['note']
        if 'customerId' in data:
            activity.CustomerId = data['customerId']
        
        db.session.commit()
        
        return jsonify({'message': 'Aktywność została zaktualizowana', 'activity': activity.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@activities_bp.route('/<int:activity_id>', methods=['DELETE'])
@require_auth
def delete_activity(activity_id):
    """Usuwa aktywność"""
    try:
        activity = Activity.query.get_or_404(activity_id)
        
        db.session.delete(activity)
        db.session.commit()
        
        return jsonify({'message': 'Aktywność została usunięta'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500