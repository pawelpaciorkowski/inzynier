from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user_id
from app.database import db
from app.models import Meeting
from app.models.user import User
from app.models.role import Role
from datetime import datetime
from functools import wraps

meetings_bp = Blueprint('meetings', __name__)

def conditional_auth(f):
    """Dekorator sprawdzający autoryzację tylko dla GET/POST, nie dla OPTIONS"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)
        else:
            return require_auth(f)(*args, **kwargs)
    return decorated_function

@meetings_bp.route('/api/Meetings', methods=['GET', 'OPTIONS'])
@meetings_bp.route('/api/Meetings/', methods=['GET', 'OPTIONS'])
@conditional_auth
def get_meetings():
    """Pobiera listę spotkań"""
    try:
        # Obsługa żądań OPTIONS dla CORS preflight
        if request.method == 'OPTIONS':
            return '', 200
            
        meetings = Meeting.query.order_by(Meeting.ScheduledAt.desc()).all()
        return jsonify([meeting.to_dict() for meeting in meetings]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@meetings_bp.route('/api/Meetings', methods=['POST', 'OPTIONS'])
@meetings_bp.route('/api/Meetings/', methods=['POST', 'OPTIONS'])
@conditional_auth
def create_meeting():
    """Tworzy nowe spotkanie"""
    try:
        # Obsługa żądań OPTIONS dla CORS preflight
        if request.method == 'OPTIONS':
            return '', 200
            
        user_id = get_current_user_id()
        data = request.get_json()
        
        new_meeting = Meeting(
            Topic=data.get('topic'),
            ScheduledAt=datetime.fromisoformat(data.get('scheduledAt').replace('Z', '')) if data.get('scheduledAt') else None,
            CustomerId=data.get('customerId'),
            AssignedGroupId=data.get('assignedGroupId'),
            CreatedByUserId=user_id
        )
        
        db.session.add(new_meeting)
        db.session.commit()
        
        return jsonify(new_meeting.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@meetings_bp.route('/api/Meetings/<int:meeting_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
@meetings_bp.route('/api/Meetings/<int:meeting_id>/', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
@conditional_auth
def handle_single_meeting(meeting_id):
    """Obsługuje pojedyncze spotkanie (GET, PUT, DELETE)"""
    try:
        # Obsługa żądań OPTIONS dla CORS preflight
        if request.method == 'OPTIONS':
            return '', 200
            
        user_id = get_current_user_id()
        
        if request.method == 'GET':
            meeting = Meeting.query.get(meeting_id)
            if not meeting:
                return jsonify({'error': 'Spotkanie nie znalezione'}), 404
            
            return jsonify(meeting.to_dict()), 200
            
        elif request.method == 'PUT':
            # Sprawdź czy użytkownik jest adminem
            user = User.query.get(user_id)
            is_admin = user and user.role and user.role.name == 'Admin'
            
            # Admin może edytować wszystkie spotkania, inni tylko swoje
            if is_admin:
                meeting = Meeting.query.filter_by(Id=meeting_id).first()
            else:
                meeting = Meeting.query.filter_by(Id=meeting_id, CreatedByUserId=user_id).first()
            
            if not meeting:
                return jsonify({'error': 'Spotkanie nie znalezione'}), 404
            
            data = request.get_json()
            
            if 'topic' in data:
                meeting.Topic = data['topic']
            if 'scheduledAt' in data:
                meeting.ScheduledAt = datetime.fromisoformat(data['scheduledAt'].replace('Z', '')) if data['scheduledAt'] else None
            if 'customerId' in data:
                meeting.CustomerId = data['customerId']
            if 'assignedGroupId' in data:
                meeting.AssignedGroupId = data['assignedGroupId']
            
            db.session.commit()
            
            return jsonify(meeting.to_dict()), 200
            
        elif request.method == 'DELETE':
            # Sprawdź czy użytkownik jest adminem
            user = User.query.get(user_id)
            is_admin = user and user.role and user.role.name == 'Admin'
            
            # Admin może usuwać wszystkie spotkania, inni tylko swoje
            if is_admin:
                meeting = Meeting.query.filter_by(Id=meeting_id).first()
            else:
                meeting = Meeting.query.filter_by(Id=meeting_id, CreatedByUserId=user_id).first()
            
            if not meeting:
                return jsonify({'error': 'Spotkanie nie znalezione'}), 404
            
            db.session.delete(meeting)
            db.session.commit()
            
            return jsonify({'message': 'Spotkanie usunięte'}), 200
        
        return jsonify({'error': 'Metoda nieobsługiwana'}), 405
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
