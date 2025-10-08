from flask import Blueprint, request, jsonify
from app.database import db
from app.models import User, LoginHistory
from app.config import Config
from app.middleware import require_auth
import jwt
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash
from app.utils import get_device_info
import hashlib

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint logowania"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Brak nazwy użytkownika lub hasła'}), 400
        
        # Znajdź użytkownika
        user = User.query.filter_by(username=username).first()
        
        if not user:
            # Zapisz nieudaną próbę logowania dla nieistniejącego użytkownika
            try:
                login_history = LoginHistory(
                    UserId=None,
                    LoginTime=datetime.now(),
                    IpAddress=request.remote_addr,
                    UserAgent=request.headers.get('User-Agent', ''),
                    Success=False
                )
                db.session.add(login_history)
                db.session.commit()
            except Exception as e:
                print(f"Błąd przy zapisywaniu nieudanej próby logowania: {e}")
                db.session.rollback()
            
            return jsonify({'error': 'Nieprawidłowe dane logowania'}), 401
        
        # Sprawdź hasło - obsługa różnych formatów hash
        password_valid = False
        try:
            # Próbuj użyć check_password_hash
            password_valid = check_password_hash(user.password_hash, password)
        except Exception as e:
            # Jeśli check_password_hash nie działa, sprawdź czy to prosty hash
            print(f"Password check error: {e}")
            # Dla prostych przypadków, sprawdź MD5 hash
            if user.password_hash and len(user.password_hash) == 32:
                password_hash = hashlib.md5(password.encode()).hexdigest()
                password_valid = user.password_hash == password_hash
            else:
                password_valid = False
        
        if not password_valid:
            # Zapisz nieudaną próbę logowania
            try:
                login_history = LoginHistory(
                    UserId=user.id if user else None,
                    LoginTime=datetime.now(),
                    IpAddress=request.remote_addr,
                    UserAgent=request.headers.get('User-Agent', ''),
                    Success=False
                )
                db.session.add(login_history)
                db.session.commit()
            except Exception as e:
                print(f"Błąd przy zapisywaniu nieudanej próby logowania: {e}")
                db.session.rollback()
            
            return jsonify({'error': 'Nieprawidłowe dane logowania'}), 401
        
        # Generuj token JWT
        payload = {
            'user_id': user.id,
            'username': user.username,
            'role': user.role.name if user.role else 'User',
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        
        token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
        
        # Pobierz informacje o urządzeniu
        device_info = get_device_info(request.headers.get('User-Agent', ''))
        
        # Zapisz historię logowania
        try:
            login_history = LoginHistory(
                UserId=user.id,
                LoginTime=datetime.now(),
                IpAddress=request.remote_addr,
                UserAgent=request.headers.get('User-Agent', ''),
                Success=True
            )
            db.session.add(login_history)
            db.session.commit()
        except Exception as e:
            print(f"Błąd przy zapisywaniu historii logowania: {e}")
            db.session.rollback()
        
        # Loguj zdarzenie systemowe
        try:
            from app.controllers.logs import log_system_event
            log_system_event(
                level='Information',
                message=f'Użytkownik {username} zalogował się',
                source='Python.Backend.AuthController',
                user_id=user.id,
                details=f'{{"device": "{device_info}", "ip": "{request.remote_addr}"}}'
            )
        except Exception as e:
            print(f"Błąd przy logowaniu zdarzenia: {e}")
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role.name if user.role else 'User'
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint rejestracji"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({'error': 'Brak wymaganych danych'}), 400
        
        # Sprawdź czy użytkownik już istnieje
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Użytkownik o tej nazwie już istnieje'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Użytkownik o tym emailu już istnieje'}), 400
        
        # Utwórz nowego użytkownika
        from werkzeug.security import generate_password_hash
        new_user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            role_id=2  # Domyślnie User
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'message': 'Użytkownik został utworzony'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    """Aktualizuje profil użytkownika"""
    try:
        from app.middleware import get_current_user
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        data = request.get_json()
        
        if 'username' in data:
            # Sprawdź czy nazwa użytkownika nie jest zajęta
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Nazwa użytkownika już istnieje'}), 400
            user.username = data['username']
        
        if 'email' in data:
            # Sprawdź czy email nie jest zajęty
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Email już istnieje'}), 400
            user.email = data['email']
        
        db.session.commit()
        
        return jsonify({'message': 'Profil zaktualizowany', 'user': user.to_dict()}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['PUT'])
@require_auth
def change_password():
    """Zmienia hasło użytkownika"""
    try:
        from app.middleware import get_current_user
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
        from werkzeug.security import generate_password_hash
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Hasło zostało zmienione'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/delete-account', methods=['DELETE'])
@require_auth
def delete_account():
    """Usuwa konto użytkownika"""
    try:
        from app.middleware import get_current_user
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        data = request.get_json()
        password = data.get('password')
        
        if not password:
            return jsonify({'error': 'Hasło jest wymagane do usunięcia konta'}), 400
        
        # Sprawdź hasło
        if not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Nieprawidłowe hasło'}), 400
        
        # Usuń użytkownika
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Konto zostało usunięte'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
