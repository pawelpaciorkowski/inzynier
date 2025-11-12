from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user_id
from app.database import db
from app.models.user import User
from app.models.setting import Setting
from datetime import datetime
import json

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/', methods=['GET'])
@require_auth
def get_settings():
    """Pobierz ustawienia użytkownika"""
    try:
        user_id = get_current_user_id()
        user = User.query.filter_by(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'Użytkownik nie został znaleziony'}), 404
        
        # Pobierz dane firmy z tabeli Settings
        company_settings = Setting.query.filter(Setting.Key.in_(['CompanyName', 'CompanyNIP', 'CompanyAddress', 'CompanyBankAccount'])).all()
        company_data = {setting.Key: setting.Value for setting in company_settings}
        
        # Zwróć podstawowe ustawienia użytkownika i dane firmy
        settings = {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role.name if user.role else 'User',
            'timezone': 'Europe/Warsaw',  # Domyślna strefa czasowa
            'language': 'pl',  # Domyślny język
            'notifications_enabled': True,  # Domyślnie włączone
            'email_notifications': True,  # Domyślnie włączone
            'theme': 'light',  # Domyślny motyw
            'CompanyName': company_data.get('CompanyName', ''),
            'CompanyNIP': company_data.get('CompanyNIP', ''),
            'CompanyAddress': company_data.get('CompanyAddress', ''),
            'CompanyBankAccount': company_data.get('CompanyBankAccount', '')
        }
        
        return jsonify(settings), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/', methods=['PUT', 'POST'])
@require_auth
def update_settings():
    """Zaktualizuj ustawienia użytkownika"""
    try:
        user_id = get_current_user_id()
        user = User.query.filter_by(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'Użytkownik nie został znaleziony'}), 404
        
        data = request.get_json()
        
        # Aktualizuj podstawowe dane użytkownika
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        
        # Aktualizuj dane firmy w tabeli Settings
        company_keys = ['CompanyName', 'CompanyNIP', 'CompanyAddress', 'CompanyBankAccount']
        for key in company_keys:
            if key in data:
                setting = Setting.query.filter_by(Key=key).first()
                if setting:
                    setting.Value = data[key]
                else:
                    # Utwórz nowe ustawienie jeśli nie istnieje
                    new_setting = Setting(
                        Key=key,
                        Value=data[key]
                    )
                    db.session.add(new_setting)
        
        db.session.commit()
        
        return jsonify({'message': 'Ustawienia zostały zaktualizowane'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/theme', methods=['PUT'])
@require_auth
def update_theme():
    """Zaktualizuj motyw użytkownika"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        
        theme = data.get('theme', 'light')
        
        if theme not in ['light', 'dark']:
            return jsonify({'error': 'Nieprawidłowy motyw'}), 400
        
        # W rzeczywistej aplikacji zapisałbyś to w bazie danych
        # Na razie zwracamy potwierdzenie
        return jsonify({'message': f'Motyw zmieniony na {theme}'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/notifications', methods=['PUT'])
@require_auth
def update_notification_settings():
    """Zaktualizuj ustawienia powiadomień"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        
        notifications_enabled = data.get('notifications_enabled', True)
        email_notifications = data.get('email_notifications', True)
        
        # W rzeczywistej aplikacji zapisałbyś to w bazie danych
        # Na razie zwracamy potwierdzenie
        return jsonify({
            'message': 'Ustawienia powiadomień zostały zaktualizowane',
            'notifications_enabled': notifications_enabled,
            'email_notifications': email_notifications
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/language', methods=['PUT'])
@require_auth
def update_language():
    """Zaktualizuj język użytkownika"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        
        language = data.get('language', 'pl')
        
        if language not in ['pl', 'en']:
            return jsonify({'error': 'Nieprawidłowy język'}), 400
        
        # W rzeczywistej aplikacji zapisałbyś to w bazie danych
        # Na razie zwracamy potwierdzenie
        return jsonify({'message': f'Język zmieniony na {language}'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/timezone', methods=['PUT'])
@require_auth
def update_timezone():
    """Zaktualizuj strefę czasową użytkownika"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        
        timezone = data.get('timezone', 'Europe/Warsaw')
        
        # Lista obsługiwanych stref czasowych
        valid_timezones = [
            'Europe/Warsaw',
            'Europe/London',
            'Europe/Berlin',
            'America/New_York',
            'America/Los_Angeles',
            'Asia/Tokyo',
            'UTC'
        ]
        
        if timezone not in valid_timezones:
            return jsonify({'error': 'Nieprawidłowa strefa czasowa'}), 400
        
        # W rzeczywistej aplikacji zapisałbyś to w bazie danych
        # Na razie zwracamy potwierdzenie
        return jsonify({'message': f'Strefa czasowa zmieniona na {timezone}'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/export', methods=['GET'])
@require_auth
def export_user_data():
    """Eksportuj dane użytkownika"""
    try:
        user_id = get_current_user_id()
        user = User.query.filter_by(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'Użytkownik nie został znaleziony'}), 404
        
        # Eksportuj podstawowe dane użytkownika
        user_data = {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role.name if user.role else 'User',
            'export_date': datetime.utcnow().isoformat()
        }
        
        return jsonify(user_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/delete-account', methods=['DELETE'])
@require_auth
def delete_account():
    """Usuń konto użytkownika"""
    try:
        user_id = get_current_user_id()
        user = User.query.filter_by(id=user_id).first()
        
        if not user:
            return jsonify({'error': 'Użytkownik nie został znaleziony'}), 404
        
        # W rzeczywistej aplikacji dodałbyś tutaj logikę usuwania
        # Na razie zwracamy potwierdzenie
        return jsonify({'message': 'Konto zostało usunięte'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
