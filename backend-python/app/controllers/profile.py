from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user, get_current_user_id
from app.database import db
from app.models import User, LoginHistory
from werkzeug.security import generate_password_hash, check_password_hash

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/', methods=['GET'])
@require_auth
def get_profile():
    """Pobiera profil użytkownika"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/', methods=['PUT'])
@require_auth
def update_profile():
    """Aktualizuje profil użytkownika"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        data = request.get_json()
        
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        
        db.session.commit()
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/change-password', methods=['PUT'])
@require_auth
def change_password():
    """Zmienia hasło użytkownika"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Brak wymaganych danych'}), 400
        
        # Sprawdź obecne hasło
        if not check_password_hash(user.password_hash, current_password):
            return jsonify({'error': 'Nieprawidłowe obecne hasło'}), 400
        
        # Ustaw nowe hasło
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Hasło zostało zmienione'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/login-history', methods=['GET'])
@require_auth
def get_login_history():
    """Pobiera historię logowań użytkownika"""
    try:
        current_user_id = get_current_user_id()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Pobierz ostatnie 50 logowań
        login_history = LoginHistory.query.filter_by(UserId=current_user_id)\
                                        .order_by(LoginHistory.LoginTime.desc())\
                                        .limit(50).all()
        
        return jsonify([login.to_dict() for login in login_history]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/users-list', methods=['GET'])
@require_auth
def get_users_list():
    """Pobiera listę wszystkich użytkowników (dla wyboru przedstawiciela itp.)"""
    try:
        # Pobierz wszystkich użytkowników, sortując alfabetycznie
        users = User.query.order_by(User.username.asc()).all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500