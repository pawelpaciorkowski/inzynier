from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user_id
from app.database import db
from app.models import Note

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/', methods=['GET'])
@require_auth
def get_notes():
    """Pobiera listę notatek"""
    try:
        notes = Note.query.order_by(Note.CreatedAt.desc()).all()
        return jsonify([note.to_dict() for note in notes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/', methods=['POST'])
@require_auth
def create_note():
    """Tworzy nową notatkę"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        
        new_note = Note(
            Content=data.get('content'),
            CustomerId=data.get('customerId'),
            UserId=user_id
        )
        
        db.session.add(new_note)
        db.session.commit()
        
        return jsonify(new_note.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/<int:note_id>', methods=['GET'])
@require_auth
def get_note(note_id):
    """Pobiera szczegóły notatki"""
    try:
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'error': 'Notatka nie znaleziona'}), 404
        
        return jsonify(note.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/<int:note_id>', methods=['PUT'])
@require_auth
def update_note(note_id):
    """Aktualizuje notatkę"""
    try:
        user_id = get_current_user_id()
        note = Note.query.filter_by(Id=note_id, UserId=user_id).first()
        
        if not note:
            return jsonify({'error': 'Notatka nie znaleziona'}), 404
        
        data = request.get_json()
        
        if 'content' in data:
            note.Content = data['content']
        
        db.session.commit()
        
        return jsonify(note.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notes_bp.route('/<int:note_id>', methods=['DELETE'])
@require_auth
def delete_note(note_id):
    """Usuwa notatkę"""
    try:
        user_id = get_current_user_id()
        note = Note.query.filter_by(Id=note_id, UserId=user_id).first()
        
        if not note:
            return jsonify({'error': 'Notatka nie znaleziona'}), 404
        
        db.session.delete(note)
        db.session.commit()
        
        return jsonify({'message': 'Notatka usunięta'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500