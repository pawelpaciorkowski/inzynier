# 🔐 SYSTEM UPRAWNIEŃ I RÓL - DOKUMENTACJA

## 📋 **PRZEGLĄD SYSTEMU**

System CRM implementuje **3-poziomową hierarchię uprawnień** z jasno zdefiniowanymi granicami dostępu:

- **Admin** - Pełny dostęp administracyjny
- **Manager** - Pośredni poziom uprawnień  
- **User** - Standardowy użytkownik

---

## 🏗️ **ARCHITEKTURA UPRAWNIEŃ**

### **Modele danych:**

#### **Role (roles)**

```python
# backend-python/app/models/role.py
class Role(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)  # Admin, User, Manager
    Description = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.Description
        }
```

#### **User z przypisaną rolą**

```python
# backend-python/app/models/user.py
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))  # Klucz obcy do roli
    
    # Relacja z rolą
    role = db.relationship('Role', backref='users')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role.name if self.role else None  # Nazwa roli
        }
```

---

## 🛡️ **DEKORATORY AUTORYZACJI**

### **Podstawowy dekorator autoryzacji**

```python
# backend-python/app/middleware.py
from functools import wraps
from flask import request, jsonify
import jwt

def require_auth(f):
    """Dekorator wymagający autoryzacji JWT"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Sprawdź header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer TOKEN
            except IndexError:
                return jsonify({'error': 'Nieprawidłowy format tokenu'}), 401
        
        if not token:
            return jsonify({'error': 'Brak tokenu autoryzacji'}), 401
        
        try:
            # Dekoduj token JWT
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            current_user_id = data['user_id']
            
            # Sprawdź czy użytkownik istnieje
            from app.models import User
            current_user = User.query.get(current_user_id)
            if not current_user:
                return jsonify({'error': 'Użytkownik nie istnieje'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token wygasł'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Nieprawidłowy token'}), 401
        
        # Dodaj użytkownika do kontekstu
        g.current_user = current_user
        return f(*args, **kwargs)
    
    return decorated_function
```

### **Dekorator dla administratorów**

```python
def require_admin(f):
    """Dekorator wymagający uprawnień administratora"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Najpierw sprawdź autoryzację
        if not require_auth(f):
            return jsonify({'error': 'Wymagana autoryzacja'}), 401
        
        # Sprawdź rolę administratora
        user_role = get_current_user_role()
        if user_role != 'Admin':
            return jsonify({'error': 'Wymagane uprawnienia administratora'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user_role():
    """Pobiera rolę aktualnego użytkownika"""
    from flask import g
    if hasattr(g, 'current_user') and g.current_user:
        if g.current_user.role:
            return g.current_user.role.name
    return None
```

---

## 🔒 **KONTROLE DOSTĘPU W KONTROLERACH**

### **1. Zarządzanie użytkownikami (tylko Admin)**

```python
# backend-python/app/controllers/admin.py
@admin_bp.route('/users', methods=['GET'])
@require_auth
def get_users():
    """Pobiera listę wszystkich użytkowników (tylko dla administratora)"""
    try:
        user = get_current_user()
        
        # 🔒 KONTROLA DOSTĘPU - tylko Admin
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['POST'])
@require_auth
def create_user():
    """Tworzy nowego użytkownika (tylko dla administratora)"""
    try:
        user = get_current_user()
        data = request.get_json()
        
        # 🔒 KONTROLA DOSTĘPU - tylko Admin
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        # Walidacja danych
        if not data or 'username' not in data or 'email' not in data:
            return jsonify({'error': 'Brak wymaganych danych'}), 400
        
        # Sprawdź czy użytkownik już istnieje
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Użytkownik o tej nazwie już istnieje'}), 400
        
        # Utwórz nowego użytkownika
        role_id = data.get('role_id', 2)  # Domyślnie User
        
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            role_id=role_id
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'Użytkownik został utworzony',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
```

### **2. Zarządzanie rolami (tylko Admin)**

```python
@admin_bp.route('/Roles', methods=['POST'])
@require_auth
def create_role():
    """Tworzy nową rolę (tylko dla administratora)"""
    try:
        user = get_current_user()
        data = request.get_json()
        
        # 🔒 KONTROLA DOSTĘPU - tylko Admin
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        if not data or 'name' not in data:
            return jsonify({'error': 'Brak wymaganych danych'}), 400
        
        name = data['name']
        description = data.get('description', '')
        
        # Sprawdź czy rola już istnieje
        if Role.query.filter_by(name=name).first():
            return jsonify({'error': 'Rola o tej nazwie już istnieje'}), 400
        
        # Utwórz nową rolę
        new_role = Role(
            name=name,
            Description=description
        )
        
        db.session.add(new_role)
        db.session.commit()
        
        return jsonify({
            'message': 'Rola została utworzona',
            'role': new_role.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
```

### **3. Logi systemowe (tylko Admin)**

```python
# backend-python/app/controllers/logs.py
@logs_bp.route('/', methods=['GET'])
@require_auth
def get_logs():
    """Pobiera logi systemowe (tylko dla administratora)"""
    try:
        user = get_current_user()
        
        # 🔒 KONTROLA DOSTĘPU - tylko Admin
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        logs = SystemLog.query.order_by(SystemLog.Timestamp.desc()).limit(1000).all()
        return jsonify([log.to_dict() for log in logs]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@logs_bp.route('/export', methods=['GET'])
@require_auth
def export_logs():
    """Eksportuje logi do Excel (tylko dla administratora)"""
    try:
        user = get_current_user()
        
        # 🔒 KONTROLA DOSTĘPU - tylko Admin
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        # Logika eksportu do Excel...
        logs = SystemLog.query.all()
        
        # Utwórz plik Excel w pamięci
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet('Logi Systemowe')
        
        # Nagłówki
        headers = ['ID', 'Poziom', 'Wiadomość', 'Źródło', 'Użytkownik', 'Szczegóły', 'Data']
        for col, header in enumerate(headers):
            worksheet.write(0, col, header)
        
        # Dane
        for row, log in enumerate(logs, 1):
            worksheet.write(row, 0, log.Id)
            worksheet.write(row, 1, log.Level)
            worksheet.write(row, 2, log.Message)
            worksheet.write(row, 3, log.Source)
            worksheet.write(row, 4, log.UserId or 'System')
            worksheet.write(row, 5, log.Details or '')
            worksheet.write(row, 6, log.Timestamp.strftime('%Y-%m-%d %H:%M:%S'))
        
        workbook.close()
        output.seek(0)
        
        response = make_response(output.read())
        response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        response.headers['Content-Disposition'] = 'attachment; filename=logi_systemowe.xlsx'
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### **4. Spotkania (Admin może edytować wszystkie, User tylko swoje)**

```python
# backend-python/app/controllers/meetings.py
@meetings_bp.route('/<int:meeting_id>', methods=['PUT'])
@require_auth
def update_meeting(meeting_id):
    """Aktualizuje spotkanie"""
    try:
        meeting = Meeting.query.get(meeting_id)
        if not meeting:
            return jsonify({'error': 'Spotkanie nie znalezione'}), 404
        
        user = get_current_user()
        data = request.get_json()
        
        # 🔒 KONTROLA DOSTĘPU - Admin może edytować wszystkie, User tylko swoje
        is_admin = user and user.role and user.role.name == 'Admin'
        
        if not is_admin:
            # User może edytować tylko swoje spotkania
            if meeting.CreatedByUserId != user.id:
                return jsonify({'error': 'Możesz edytować tylko swoje spotkania'}), 403
        
        # Aktualizuj dane spotkania
        if 'topic' in data:
            meeting.Topic = data['topic']
        if 'scheduledAt' in data:
            meeting.ScheduledAt = datetime.fromisoformat(data['scheduledAt'])
        if 'customerId' in data:
            meeting.CustomerId = data['customerId']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Spotkanie zostało zaktualizowane',
            'meeting': meeting.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@meetings_bp.route('/<int:meeting_id>', methods=['DELETE'])
@require_auth
def delete_meeting(meeting_id):
    """Usuwa spotkanie"""
    try:
        meeting = Meeting.query.get(meeting_id)
        if not meeting:
            return jsonify({'error': 'Spotkanie nie znalezione'}), 404
        
        user = get_current_user()
        
        # 🔒 KONTROLA DOSTĘPU - Admin może usuwać wszystkie, User tylko swoje
        is_admin = user and user.role and user.role.name == 'Admin'
        
        if not is_admin:
            # User może usuwać tylko swoje spotkania
            if meeting.CreatedByUserId != user.id:
                return jsonify({'error': 'Możesz usuwać tylko swoje spotkania'}), 403
        
        db.session.delete(meeting)
        db.session.commit()
        
        return jsonify({'message': 'Spotkanie zostało usunięte'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
```

---

## 📊 **TABELA UPRAWNIEŃ**

| Funkcja | Admin | Manager | User |
|---------|-------|---------|------|
| **Zarządzanie użytkownikami** | ✅ | ❌ | ❌ |
| **Zarządzanie rolami** | ✅ | ❌ | ❌ |
| **Panel administracyjny** | ✅ | ❌ | ❌ |
| **Logi systemowe** | ✅ | ❌ | ❌ |
| **Eksport logów** | ✅ | ❌ | ❌ |
| **Zarządzanie klientami** | ✅ | ✅ | ✅ |
| **Zarządzanie fakturami** | ✅ | ✅ | ✅ |
| **Zarządzanie płatnościami** | ✅ | ✅ | ✅ |
| **Zarządzanie kontraktami** | ✅ | ✅ | ✅ |
| **Własne spotkania** | ✅ | ✅ | ✅ |
| **Cudze spotkania** | ✅ | ❓ | ❌ |
| **Własne zadania** | ✅ | ✅ | ✅ |
| **Cudze zadania** | ✅ | ❓ | ❌ |
| **Przypomnienia** | ✅ | ✅ | ✅ |
| **Notatki** | ✅ | ✅ | ✅ |
| **Ustawienia profilu** | ✅ | ✅ | ✅ |

---

## 🔧 **FUNKCJE POMOCNICZE**

### **Pobieranie aktualnego użytkownika**

```python
# backend-python/app/middleware.py
from flask import g

def get_current_user():
    """Pobiera aktualnego użytkownika z kontekstu"""
    if hasattr(g, 'current_user'):
        return g.current_user
    return None

def get_current_user_id():
    """Pobiera ID aktualnego użytkownika"""
    user = get_current_user()
    return user.id if user else None

def get_current_user_role():
    """Pobiera rolę aktualnego użytkownika"""
    user = get_current_user()
    if user and user.role:
        return user.role.name
    return None
```

### **Sprawdzanie uprawnień w kontrolerach**

```python
# Przykład użycia w kontrolerze
@some_bp.route('/protected-endpoint', methods=['GET'])
@require_auth
def protected_endpoint():
    user = get_current_user()
    
    # Sprawdź rolę administratora
    if user.role.name != 'Admin':
        return jsonify({'error': 'Brak uprawnień administratora'}), 403
    
    # Logika dla administratora...
    return jsonify({'data': 'admin_data'}), 200
```

---

## 🚨 **KODY BŁĘDÓW**

| Kod | Opis | Przykład |
|-----|------|----------|
| **401** | Brak autoryzacji | `{'error': 'Brak tokenu autoryzacji'}` |
| **403** | Brak uprawnień | `{'error': 'Brak uprawnień administratora'}` |
| **404** | Zasób nie znaleziony | `{'error': 'Użytkownik nie znaleziony'}` |

---

## 🔐 **BEZPIECZEŃSTWO**

### **Zasady bezpieczeństwa:**

1. **Zawsze sprawdzaj autoryzację** przed sprawdzeniem roli
2. **Używaj dekoratorów** `@require_auth` i `@require_admin`
3. **Waliduj dane wejściowe** przed przetwarzaniem
4. **Loguj próby nieautoryzowanego dostępu**
5. **Używaj HTTPS** w produkcji
6. **Regularnie rotuj tokeny JWT**

### **Przykład bezpiecznego endpointu:**

```python
@admin_bp.route('/sensitive-data', methods=['GET'])
@require_auth  # 1. Sprawdź autoryzację
def get_sensitive_data():
    user = get_current_user()
    
    # 2. Sprawdź rolę administratora
    if user.role.name != 'Admin':
        # 3. Loguj próbę nieautoryzowanego dostępu
        log_system_event('SECURITY', f'Próba nieautoryzowanego dostępu do /sensitive-data przez użytkownika {user.username}')
        return jsonify({'error': 'Brak uprawnień administratora'}), 403
    
    # 4. Zwróć dane tylko dla administratora
    return jsonify({'sensitive_data': 'top_secret'}), 200
```

---

## 📝 **PODSUMOWANIE**

System uprawnień implementuje **zasada najmniejszych uprawnień** - użytkownicy mają dostęp tylko do tego, co jest im potrzebne do wykonywania pracy. Administrator ma pełny dostęp do systemu, podczas gdy zwykli użytkownicy mogą pracować tylko ze swoimi danymi.

**Kluczowe elementy:**

- ✅ **3-poziomowa hierarchia ról** (Admin, Manager, User)
- ✅ **Dekoratory autoryzacji** (`@require_auth`, `@require_admin`)
- ✅ **Kontrola dostępu na poziomie endpointów**
- ✅ **Bezpieczne sprawdzanie uprawnień**
- ✅ **Logowanie prób nieautoryzowanego dostępu**
