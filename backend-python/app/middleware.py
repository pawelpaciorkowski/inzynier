from functools import wraps
from flask import request, jsonify, g
import jwt
from app.config import Config

def require_auth(f):
    """Dekorator wymagający autoryzacji"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Pomiń autoryzację dla zapytań OPTIONS (CORS pre-flight)
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)

        token = None
        
        # Sprawdź nagłówek Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Format: "Bearer <token>"
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Token nieprawidłowy'}), 401
        
        if not token:
            return jsonify({'error': 'Brak tokenu autoryzacji'}), 401
        
        try:
            # Dekoduj token
            data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            current_user_id = data.get('user_id') or data.get('sub')
            
            if not current_user_id:
                return jsonify({'error': 'Token nieprawidłowy'}), 401
            
            # Zapisz ID użytkownika w kontekście Flask
            g.user_id = current_user_id
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token wygasł'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token nieprawidłowy'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user_id():
    """Pobiera ID aktualnego użytkownika z kontekstu Flask"""
    return getattr(g, 'user_id', None)

def get_current_user_role():
    """Pobiera rolę aktualnego użytkownika"""
    from app.models import User
    user_id = get_current_user_id()
    if user_id:
        user = User.query.get(user_id)
        if user and user.role:
            return user.role.name
    return None

def get_current_user():
    """Pobiera obiekt aktualnego użytkownika z bazy danych"""
    from app.models import User
    user_id = get_current_user_id()
    if not user_id:
        # Sprawdź czy jest token w nagłówku
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        try:
            # Wyciągnij token
            token = auth_header.split(' ')[1]
            # Zdekoduj token
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            # Pobierz user_id z tokenu
            user_id = payload.get('user_id') or int(payload.get('sub', 0))
        except:
            return None
    
    if user_id:
        return User.query.get(user_id)
    return None

def require_admin(f):
    """Dekorator wymagający uprawnień administratora"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not require_auth(f):
            return jsonify({'error': 'Wymagana autoryzacja'}), 401
        
        user_role = get_current_user_role()
        if user_role != 'Admin':
            return jsonify({'error': 'Wymagane uprawnienia administratora'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function
