from functools import wraps
from flask import Blueprint, request, jsonify
from app.database import db
from app.models.calendar_event import CalendarEvent
from app.middleware import require_auth, get_current_user_id
from datetime import datetime
from functools import wraps
import json

calendar_events_bp = Blueprint('calendar_events', __name__)



@calendar_events_bp.route('/', methods=['GET', 'OPTIONS'])
@calendar_events_bp.route('', methods=['GET', 'OPTIONS'])
@require_auth
def get_calendar_events():
    """Pobierz wszystkie wydarzenia kalendarza dla zalogowanego użytkownika"""
    # Obsługa żądań OPTIONS (CORS pre-flight)
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Pobierz parametry filtrowania
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = CalendarEvent.query.filter_by(UserId=user_id)
        
        if start_date:
            start_date_obj = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(CalendarEvent.Start >= start_date_obj)
            
        if end_date:
            end_date_obj = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(CalendarEvent.End <= end_date_obj)
        
        events = query.order_by(CalendarEvent.Start).all()
        
        return jsonify([event.to_dict() for event in events]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@calendar_events_bp.route('/', methods=['POST', 'OPTIONS'])
@calendar_events_bp.route('', methods=['POST', 'OPTIONS'])
@require_auth
def create_calendar_event():
    """Utwórz nowe wydarzenie kalendarza"""
    # Obsługa żądań OPTIONS (CORS pre-flight)
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        data = request.get_json()
        
        # Walidacja wymaganych pól
        required_fields = ['title', 'start', 'end']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Pole {field} jest wymagane'}), 400
        
        # Utwórz nowe wydarzenie
        event = CalendarEvent(
            Title=data['title'],
            Start=datetime.fromisoformat(data['start'].replace('Z', '+00:00')),
            End=datetime.fromisoformat(data['end'].replace('Z', '+00:00')),
            UserId=user_id
        )
        
        db.session.add(event)
        db.session.commit()
        
        return jsonify(event.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@calendar_events_bp.route('/<int:event_id>', methods=['GET'])
@require_auth
def get_calendar_event(event_id):
    """Pobierz konkretne wydarzenie kalendarza"""
    try:
        user_id = get_current_user_id()
        event = CalendarEvent.query.filter_by(Id=event_id, UserId=user_id).first()
        
        if not event:
            return jsonify({'error': 'Wydarzenie nie zostało znalezione'}), 404
            
        return jsonify(event.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@calendar_events_bp.route('/<int:event_id>', methods=['PUT'])
@require_auth
def update_calendar_event(event_id):
    """Zaktualizuj wydarzenie kalendarza"""
    try:
        user_id = get_current_user_id()
        event = CalendarEvent.query.filter_by(Id=event_id, UserId=user_id).first()
        
        if not event:
            return jsonify({'error': 'Wydarzenie nie zostało znalezione'}), 404
        
        data = request.get_json()
        
        # Aktualizuj pola
        if 'title' in data:
            event.Title = data['title']
        if 'description' in data:
            event.Description = data['description']
        if 'start' in data:
            event.Start = datetime.fromisoformat(data['start'].replace('Z', '+00:00'))
        if 'end' in data:
            event.End = datetime.fromisoformat(data['end'].replace('Z', '+00:00'))
        if 'is_all_day' in data:
            event.AllDay = data['is_all_day']
        
        db.session.commit()
        
        return jsonify(event.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@calendar_events_bp.route('/<int:event_id>', methods=['DELETE'])
@require_auth
def delete_calendar_event(event_id):
    """Usuń wydarzenie kalendarza"""
    try:
        user_id = get_current_user_id()
        event = CalendarEvent.query.filter_by(Id=event_id, UserId=user_id).first()
        
        if not event:
            return jsonify({'error': 'Wydarzenie nie zostało znalezione'}), 404
        
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({'message': 'Wydarzenie zostało usunięte'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@calendar_events_bp.route('/<int:event_id>/complete', methods=['POST'])
@require_auth
def complete_calendar_event(event_id):
    """Oznacz wydarzenie jako zakończone"""
    try:
        user_id = get_current_user_id()
        event = CalendarEvent.query.filter_by(Id=event_id, UserId=user_id).first()
        
        if not event:
            return jsonify({'error': 'Wydarzenie nie zostało znalezione'}), 404
        
        # Note: Model nie ma pól is_completed i completed_at, więc pomijamy tę funkcjonalność
        pass
        
        db.session.commit()
        
        return jsonify(event.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
