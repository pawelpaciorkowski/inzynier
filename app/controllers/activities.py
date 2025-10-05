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
    """Pobiera listę aktywności"""
    try:
        # Użyj poprawne nazwy kolumn z bazy danych
        activities = db.session.execute(text("""
            SELECT Id, Note, CreatedAt, UserId, CustomerId
            FROM Activities
            ORDER BY CreatedAt DESC
            LIMIT 50
        """)).fetchall()
        
        activities_list = []
        for activity in activities:
            activities_list.append({
                'id': activity[0],
                'title': activity[1],  # Note -> title dla frontendu
                'description': None,   # Brak opisu w bazie
                'activityDate': activity[2].isoformat() if activity[2] else None,  # CreatedAt -> activityDate
                'customerId': activity[4],  # CustomerId
                'customerName': None,  # Bez JOIN nie mamy nazwy klienta
                'userId': activity[3]   # UserId
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