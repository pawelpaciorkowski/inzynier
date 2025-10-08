from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user
from app.database import db
from sqlalchemy import text

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/user', methods=['GET'])
@require_auth
def get_user_dashboard():
    """Pobiera dane dashboardu dla zwykłego użytkownika"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Pobierz podstawowe statystyki użytkownika
        stats = db.session.execute(text("""
            SELECT 
                (SELECT COUNT(*) FROM Tasks WHERE UserId = :user_id AND completed = 0) as pending_tasks,
                (SELECT COUNT(*) FROM Tasks WHERE UserId = :user_id AND completed = 1) as completed_tasks,
                (SELECT COUNT(*) FROM Reminders WHERE UserId = :user_id) as reminders_count,
                (SELECT COUNT(*) FROM Messages WHERE RecipientUserId = :user_id AND IsRead = 0) as unread_messages_count
        """), {'user_id': user.id}).fetchone()

        # Pobierz historię logowań
        login_history = db.session.execute(text("""
            SELECT LoginTime, IpAddress
            FROM LoginHistory
            WHERE UserId = :user_id
            ORDER BY LoginTime DESC
            LIMIT 5
        """), {'user_id': user.id}).fetchall()

        login_history_data = []
        for entry in login_history:
            login_history_data.append({
                'date': entry.LoginTime.isoformat() if entry.LoginTime else None,
                'ipAddress': entry.IpAddress
            })
        
        return jsonify({
            'tasksCount': stats[0] + stats[1], # Suma pending_tasks i completed_tasks
            'messagesCount': stats[3], # Liczba nieprzeczytanych wiadomości
            'remindersCount': stats[2], # Liczba przypomnień
            'loginHistory': login_history_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/', methods=['GET'])
@require_auth
def get_dashboard():
    """Pobiera dane dashboardu użytkownika"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Pobierz statystyki użytkownika
        stats = db.session.execute(text("""
            SELECT 
                (SELECT COUNT(*) FROM Tasks WHERE UserId = :user_id AND completed = 0) as pending_tasks,
                (SELECT COUNT(*) FROM Tasks WHERE UserId = :user_id AND completed = 1) as completed_tasks,
                (SELECT COUNT(*) FROM Reminders WHERE UserId = :user_id) as reminders_count,
                (SELECT COUNT(*) FROM Messages WHERE RecipientUserId = :user_id AND IsRead = 0) as unread_messages_count
        """), {'user_id': user.id}).fetchone()

        # Pobierz historię logowań
        login_history = db.session.execute(text("""
            SELECT LoginTime, IpAddress
            FROM LoginHistory
            WHERE UserId = :user_id
            ORDER BY LoginTime DESC
            LIMIT 5
        """), {'user_id': user.id}).fetchall()

        login_history_data = []
        for entry in login_history:
            login_history_data.append({
                'date': entry.LoginTime.isoformat() if entry.LoginTime else None,
                'ipAddress': entry.IpAddress
            })
        
        return jsonify({
            'tasksCount': stats[0] + stats[1], # Suma pending_tasks i completed_tasks
            'messagesCount': stats[3], # Liczba nieprzeczytanych wiadomości
            'remindersCount': stats[2], # Liczba przypomnień
            'loginHistory': login_history_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
