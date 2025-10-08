from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user_id
from app.database import db
from app.models import Notification

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/user', methods=['GET'])
@require_auth
def get_user_notifications():
    """Pobiera powiadomienia użytkownika"""
    try:
        user_id = get_current_user_id()
        
        notifications = Notification.query.filter_by(UserId=user_id).order_by(Notification.CreatedAt.desc()).all()
        return jsonify([notification.to_dict() for notification in notifications]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/unread-count', methods=['GET'])
@require_auth
def get_unread_count():
    """Pobiera liczbę nieprzeczytanych powiadomień"""
    try:
        user_id = get_current_user_id()
        
        count = Notification.query.filter_by(UserId=user_id, IsRead=False).count()
        return jsonify({'count': count}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@require_auth
def mark_notification_as_read(notification_id):
    """Oznacza powiadomienie jako przeczytane"""
    try:
        user_id = get_current_user_id()
        
        notification = Notification.query.filter_by(Id=notification_id, UserId=user_id).first()
        if not notification:
            return jsonify({'error': 'Powiadomienie nie znalezione'}), 404
        
        notification.IsRead = True
        db.session.commit()
        
        return jsonify({'message': 'Powiadomienie oznaczone jako przeczytane'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@require_auth
def delete_notification(notification_id):
    """Usuwa powiadomienie"""
    try:
        user_id = get_current_user_id()
        
        notification = Notification.query.filter_by(Id=notification_id, UserId=user_id).first()
        if not notification:
            return jsonify({'error': 'Powiadomienie nie znalezione'}), 404
        
        db.session.delete(notification)
        db.session.commit()
        
        return jsonify({'message': 'Powiadomienie usunięte'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/mark-as-read/<int:notification_id>', methods=['POST'])
@require_auth
def mark_notification_as_read_post(notification_id):
    """Oznacza powiadomienie jako przeczytane (alias dla kompatybilności z frontendem)"""
    try:
        user_id = get_current_user_id()
        
        notification = Notification.query.filter_by(Id=notification_id, UserId=user_id).first()
        if not notification:
            return jsonify({'error': 'Powiadomienie nie znalezione'}), 404
        
        notification.IsRead = True
        db.session.commit()
        
        return jsonify({'message': 'Powiadomienie oznaczone jako przeczytane'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def create_notification(user_id, message):
    """Funkcja pomocnicza do tworzenia powiadomień"""
    try:
        notification = Notification(
            Message=message,
            UserId=user_id
        )
        
        db.session.add(notification)
        db.session.commit()
    except Exception as e:
        print(f"Błąd przy tworzeniu powiadomienia: {e}")
        db.session.rollback()