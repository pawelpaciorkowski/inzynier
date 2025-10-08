from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user
from app.database import db
from sqlalchemy import text

dashboard_bp = Blueprint('dashboard', __name__)

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
                (SELECT COUNT(*) FROM tasks WHERE user_id = :user_id AND completed = 0) as pending_tasks,
                (SELECT COUNT(*) FROM tasks WHERE user_id = :user_id AND completed = 1) as completed_tasks,
                (SELECT COUNT(*) FROM Reminders WHERE UserId = :user_id) as reminders_count,
                (SELECT COUNT(*) FROM Notifications WHERE UserId = :user_id AND IsRead = 0) as unread_notifications
        """), {'user_id': user.id}).fetchone()
        
        return jsonify({
            'pendingTasks': stats[0],
            'completedTasks': stats[1],
            'remindersCount': stats[2],
            'unreadNotifications': stats[3]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
