from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user
from app.database import db
from app.models import Reminder
from datetime import datetime

reminders_bp = Blueprint('reminders', __name__)

@reminders_bp.route('/', methods=['GET'])
@require_auth
def get_reminders():
    """Pobiera listę przypomnień użytkownika"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        reminders = Reminder.query.filter_by(UserId=user.id).order_by(Reminder.RemindAt.asc()).all()
        return jsonify([reminder.to_dict() for reminder in reminders]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reminders_bp.route('/', methods=['POST'])
@require_auth
def create_reminder():
    """Tworzy nowe przypomnienie"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        data = request.get_json()
        
        # Sprawdź czy remindAt jest podane (obsługujemy oba formaty: remindAt i remind_at)
        remind_at = data.get('remindAt') or data.get('remind_at')
        if not remind_at:
            return jsonify({'error': 'Pole RemindAt jest wymagane'}), 400
        
        new_reminder = Reminder(
            Note=data.get('note'),
            RemindAt=datetime.fromisoformat(remind_at.replace('Z', '')),
            UserId=user.id
        )
        
        db.session.add(new_reminder)
        db.session.commit()
        
        return jsonify(new_reminder.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reminders_bp.route('/<int:reminder_id>', methods=['GET'])
@require_auth
def get_reminder(reminder_id):
    """Pobiera szczegóły przypomnienia"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        reminder = Reminder.query.filter_by(Id=reminder_id, UserId=user.id).first()
        if not reminder:
            return jsonify({'error': 'Przypomnienie nie znalezione'}), 404
        
        return jsonify(reminder.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reminders_bp.route('/<int:reminder_id>', methods=['PUT'])
@require_auth
def update_reminder(reminder_id):
    """Aktualizuje przypomnienie"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        reminder = Reminder.query.filter_by(Id=reminder_id, UserId=user.id).first()
        if not reminder:
            return jsonify({'error': 'Przypomnienie nie znalezione'}), 404
        
        data = request.get_json()
        
        if 'note' in data:
            reminder.Note = data['note']
        if 'remindAt' in data or 'remind_at' in data:
            remind_at_value = data.get('remindAt') or data.get('remind_at')
            if remind_at_value:
                reminder.RemindAt = datetime.fromisoformat(remind_at_value.replace('Z', ''))
            else:
                return jsonify({'error': 'Pole RemindAt nie może być puste'}), 400
        
        db.session.commit()
        
        return jsonify(reminder.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@reminders_bp.route('/<int:reminder_id>', methods=['DELETE'])
@require_auth
def delete_reminder(reminder_id):
    """Usuwa przypomnienie"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        reminder = Reminder.query.filter_by(Id=reminder_id, UserId=user.id).first()
        if not reminder:
            return jsonify({'error': 'Przypomnienie nie znalezione'}), 404
        
        db.session.delete(reminder)
        db.session.commit()
        
        return jsonify({'message': 'Przypomnienie usunięte'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
