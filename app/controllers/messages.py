from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user_id
from app.database import db
from app.models import Message, User
from datetime import datetime

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/inbox', methods=['GET'])
@require_auth
def get_inbox():
    """Pobiera wiadomości otrzymane"""
    try:
        user_id = get_current_user_id()
        
        messages = Message.query.filter_by(RecipientUserId=user_id).order_by(Message.SentAt.desc()).all()
        return jsonify([message.to_dict() for message in messages]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/sent', methods=['GET'])
@require_auth
def get_sent():
    """Pobiera wiadomości wysłane"""
    try:
        user_id = get_current_user_id()
        
        messages = Message.query.filter_by(SenderUserId=user_id).order_by(Message.SentAt.desc()).all()
        return jsonify([message.to_dict() for message in messages]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/', methods=['POST'])
@require_auth
def send_message():
    """Wysyła wiadomość"""
    try:
        sender_id = get_current_user_id()
        data = request.get_json()
        
        # Pobierz obiekty użytkowników
        sender = User.query.get(sender_id)
        recipient = User.query.get(data.get('recipientUserId'))
        
        if not sender or not recipient:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 404
        
        new_message = Message(
            Subject=data.get('subject'),
            Body=data.get('body'),
            SenderUserId=sender_id,
            RecipientUserId=data.get('recipientUserId')
        )
        
        db.session.add(new_message)
        db.session.commit()
        
        # Dodaj powiadomienie dla odbiorcy
        try:
            from app.controllers.notifications import create_notification
            create_notification(
                user_id=data.get('recipientUserId'),
                message=f'Nowa wiadomość od {sender.username}: {data.get("subject")}'
            )
        except Exception as e:
            print(f"Błąd przy tworzeniu powiadomienia: {e}")
        
        # Dodaj log systemowy
        try:
            from app.controllers.logs import log_system_event
            log_system_event(
                level='Information',
                message=f'Wiadomość została wysłana',
                source='Python.Backend.MessagesController',
                user_id=sender_id,
                details=f'{{"recipient": "{recipient.username}", "subject": "{data.get("subject")}"}}'
            )
        except Exception as e:
            print(f"Błąd przy tworzeniu logu: {e}")
        
        return jsonify(new_message.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/<int:message_id>', methods=['GET'])
@require_auth
def get_message(message_id):
    """Pobiera szczegóły pojedynczej wiadomości"""
    try:
        user_id = get_current_user_id()

        # Pobierz wiadomość, jeśli użytkownik jest nadawcą lub odbiorcą
        message = Message.query.filter(
            (Message.Id == message_id) &
            ((Message.SenderUserId == user_id) | (Message.RecipientUserId == user_id))
        ).first()

        if not message:
            return jsonify({'error': 'Wiadomość nie znaleziona'}), 404

        return jsonify(message.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/<int:message_id>/read', methods=['PUT'])
@require_auth
def mark_as_read(message_id):
    """Oznacza wiadomość jako przeczytaną"""
    try:
        user_id = get_current_user_id()
        
        message = Message.query.filter_by(Id=message_id, RecipientUserId=user_id).first()
        if not message:
            return jsonify({'error': 'Wiadomość nie znaleziona'}), 404
        
        message.IsRead = True
        db.session.commit()
        
        return jsonify({'message': 'Wiadomość oznaczona jako przeczytana'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/<int:message_id>', methods=['DELETE'])
@require_auth
def delete_message(message_id):
    """Usuwa wiadomość"""
    try:
        user_id = get_current_user_id()
        
        message = Message.query.filter(
            (Message.Id == message_id) & 
            ((Message.SenderUserId == user_id) | (Message.RecipientUserId == user_id))
        ).first()
        
        if not message:
            return jsonify({'error': 'Wiadomość nie znaleziona'}), 404
        
        db.session.delete(message)
        db.session.commit()
        
        return jsonify({'message': 'Wiadomość usunięta'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
