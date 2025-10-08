# 📖 SZCZEGÓŁOWA DOKUMENTACJA TECHNICZNA - OBRONA PRACY INŻYNIERSKIEJ

> **Projekt:** Zintegrowany System CRM
> **Autor:** Paweł Paciorkowski
> **Cel:** Kompletna dokumentacja techniczna do obrony pracy - wyjaśnienie każdej metody, biblioteki i wzorca projektowego

---

## 📋 SPIS TREŚCI

1. [Przegląd Systemu](#1-przegląd-systemu)
2. [Backend - Python Flask - Szczegółowa Analiza](#2-backend---python-flask---szczegółowa-analiza)
3. [Frontend - React TypeScript - Szczegółowa Analiza](#3-frontend---react-typescript---szczegółowa-analiza)
4. [Mobile - React Native Expo - Szczegółowa Analiza](#4-mobile---react-native-expo---szczegółowa-analiza)
5. [Biblioteki i Zależności - Pełne Wyjaśnienia](#5-biblioteki-i-zależności---pełne-wyjaśnienia)
6. [Architektura i Przepływ Danych](#6-architektura-i-przepływ-danych)
7. [Bezpieczeństwo - Szczegółowa Analiza](#7-bezpieczeństwo---szczegółowa-analiza)
8. [Pytania Obronne - Przygotowanie](#8-pytania-obronne---przygotowanie)

---

## 1. PRZEGLĄD SYSTEMU

### 1.1 Architektura Wysokiego Poziomu

```
┌─────────────────────────────────────────────────────────────┐
│                    WARSTWA PREZENTACJI                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Web Application │         │ Mobile App       │         │
│  │  React 19 + TS   │         │ React Native 0.79│         │
│  │  Port: 8100      │         │ Expo 53          │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                          ▼ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                   WARSTWA LOGIKI BIZNESOWEJ                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Python Flask Backend                                │  │
│  │  - 22 kontrolery (Blueprinty)                       │  │
│  │  - Middleware autoryzacji (JWT)                     │  │
│  │  - Port: 5000                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ▼ SQLAlchemy ORM
┌─────────────────────────────────────────────────────────────┐
│                      WARSTWA DANYCH                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MariaDB 11 / SQLite                                 │  │
│  │  - 23 tabele                                         │  │
│  │  - Relacje Foreign Key                              │  │
│  │  - Port: 3306 (MariaDB)                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Kluczowe Liczby

| Metryka | Wartość |
|---------|---------|
| **Backend (Python)** | ~8,000 linii kodu |
| **Frontend (TypeScript)** | ~5,000 linii kodu |
| **Mobile (TypeScript)** | ~2,000 linii kodu |
| **RAZEM** | ~15,000 linii kodu |
| **Kontrolery Backend** | 22 blueprinty |
| **Modele Backend** | 23 modele SQLAlchemy |
| **Strony Frontend** | 45+ komponentów |
| **Ekrany Mobile** | 15+ ekranów |
| **API Endpoints** | 50+ endpointów |
| **Tabele Bazy Danych** | 23 tabele |

---

## 2. BACKEND - PYTHON FLASK - SZCZEGÓŁOWA ANALIZA

### 2.1 Biblioteki Backend - Pełne Wyjaśnienia

#### Flask (3.0.x) - Framework Webowy

**Co to jest?**
- Mikro-framework do tworzenia aplikacji webowych w Pythonie
- "Mikro" = zawiera tylko podstawowe funkcje, reszta przez rozszerzenia
- WSGI-compatible (Web Server Gateway Interface)

**Jak działa?**
```python
from flask import Flask
app = Flask(__name__)  # Tworzy aplikację

@app.route('/api/hello')  # Dekorator routingu
def hello():
    return {'message': 'Hello'}  # Zwraca JSON

app.run()  # Uruchamia dev server
```

**Kluczowe koncepty:**
1. **Routing** - `@app.route(url, methods)` mapuje URL na funkcję
2. **Request Object** - `request.get_json()`, `request.headers` - dostęp do danych żądania
3. **Response** - `jsonify()` konwertuje dict na JSON response
4. **Blueprinty** - modularyzacja aplikacji (kontrolery)
5. **Context** - `g` (global context), `request` (request context)

**Dlaczego Flask?**
- ✅ Prosty w nauce (minimalistyczny API)
- ✅ Elastyczny (dodajesz tylko co potrzebujesz)
- ✅ Idealny dla REST API
- ✅ Duża społeczność i dokumentacja

---

#### SQLAlchemy (2.0.x) - ORM

**Co to jest ORM?**
- Object-Relational Mapping
- Mapuje klasy Pythona na tabele SQL
- Abstrakcja nad SQL - piszesz Python zamiast SQL

**Jak działa?**
```python
# Definicja modelu
class Customer(db.Model):
    __tablename__ = 'Customers'
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)

# CRUD Operations
customer = Customer(Name='Jan Kowalski')  # Create
db.session.add(customer)
db.session.commit()

customer = Customer.query.get(32)  # Read
customer.Name = 'Jan Nowak'  # Update
db.session.commit()

db.session.delete(customer)  # Delete
db.session.commit()
```

**Kluczowe metody:**
| Metoda | SQL Equivalent | Przykład |
|--------|----------------|----------|
| `query.all()` | `SELECT *` | `Customer.query.all()` |
| `query.get(id)` | `SELECT WHERE id=?` | `Customer.query.get(32)` |
| `query.filter_by()` | `SELECT WHERE ...` | `Task.query.filter_by(UserId=2)` |
| `query.first()` | `SELECT LIMIT 1` | `User.query.filter_by(username='admin').first()` |
| `db.session.add()` | `INSERT` | `db.session.add(new_customer)` |
| `db.session.commit()` | `COMMIT` | `db.session.commit()` |
| `db.session.rollback()` | `ROLLBACK` | `db.session.rollback()` |

**Zalety ORM:**
- ✅ Nie piszesz surowego SQL
- ✅ Ochrona przed SQL Injection (parametryzowane zapytania)
- ✅ Łatwa migracja między bazami (SQLite → PostgreSQL)
- ✅ Czytelniejszy kod Python

**Eager Loading (joinedload):**
```python
# ❌ Problem N+1 queries
invoices = Invoice.query.all()
for invoice in invoices:
    print(invoice.customer.name)  # +1 zapytanie za każdym razem!

# ✅ Rozwiązanie - joinedload
from sqlalchemy.orm import joinedload
invoices = Invoice.query.options(joinedload(Invoice.customer)).all()
# Jedno zapytanie z JOIN
```

---

#### PyJWT (2.8.x) - JSON Web Tokens

**Co to jest JWT?**
- Standard autoryzacji (RFC 7519)
- Token składa się z 3 części: Header.Payload.Signature
- Base64 encoded, podpisany kluczem tajnym

**Struktura JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MjM5Nzg4MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
└────────── HEADER ──────────┘ └────────── PAYLOAD ──────────┘ └────────── SIGNATURE ─────────┘
```

**Header:**
```json
{
  "alg": "HS256",  // Algorytm podpisu (HMAC SHA256)
  "typ": "JWT"     // Typ tokenu
}
```

**Payload:**
```json
{
  "user_id": 1,           // ID użytkownika
  "username": "admin",     // Nazwa użytkownika
  "role": "Admin",         // Rola
  "exp": 1623978800,       // Expiration time (Unix timestamp)
  "iat": 1623892400        // Issued at (Unix timestamp)
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  SECRET_KEY
)
```

**Generowanie JWT w projekcie:**
```python
import jwt
from datetime import datetime, timedelta

def generate_token(user):
    payload = {
        'user_id': user.id,
        'username': user.username,
        'role': user.role.name,
        'exp': datetime.utcnow() + timedelta(hours=24)  # Wygasa po 24h
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token
```

**Weryfikacja JWT:**
```python
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization').replace('Bearer ', '')

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            g.user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token wygasł'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Nieprawidłowy token'}), 401

        return f(*args, **kwargs)
    return decorated
```

**Dlaczego JWT?**
- ✅ **Stateless** - serwer nie przechowuje sesji
- ✅ **Skalowalne** - brak shared state między serwerami
- ✅ **Self-contained** - token zawiera wszystkie dane
- ✅ **Cross-domain** - działa między różnymi domenami

**Bezpieczeństwo JWT:**
- ⚠️ Payload jest WIDOCZNY (Base64 ≠ szyfrowanie) - nie przechowuj wrażliwych danych
- ⚠️ Używaj HTTPS (token przesyłany w plain text)
- ⚠️ SECRET_KEY musi być silny i tajny
- ⚠️ Krótki czas życia (exp) - w projekcie 24h

---

#### bcrypt (4.0.x) - Hashowanie Haseł

**Co to jest bcrypt?**
- Algorytm hashowania haseł
- Adaptacyjny - można zwiększać trudność w czasie
- Automatyczne generowanie soli (salt)

**Jak działa?**
```python
import bcrypt

# Hashowanie hasła
password = "moje_haslo"
salt = bcrypt.gensalt()  # Generuje losową sól
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
# Wynik: b'$2b$12$...' (60 znaków)

# Weryfikacja hasła
is_valid = bcrypt.checkpw(password.encode('utf-8'), hashed)
# True jeśli hasło pasuje
```

**Format bcrypt hash:**
```
$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW
│ │ │  │                                           │
│ │ │  │                                           └─ Hash (31 znaków)
│ │ │  └─ Sól (22 znaki)
│ │ └─ Koszt (work factor = 2^12 iteracji)
│ └─ Wersja bcrypt
└─ Identyfikator algoritmu
```

**Cost Factor (Work Factor):**
- Domyślnie: 12 (2^12 = 4096 iteracji)
- Wyższy = wolniejszy = bezpieczniejszy
- W projekcie: 12 (optymalne ~100ms)

**Dlaczego bcrypt, a nie MD5/SHA256?**
| Algorytm | Szybkość | Sól | Adaptacyjny | Bezpieczeństwo |
|----------|----------|-----|-------------|----------------|
| MD5 | ⚡⚡⚡ Bardzo szybki | ❌ Brak | ❌ Nie | ❌ Łamany |
| SHA256 | ⚡⚡⚡ Bardzo szybki | ❌ Brak | ❌ Nie | ⚠️ Dla haseł słaby |
| bcrypt | 🐢 Wolny (celowo!) | ✅ Auto | ✅ Tak | ✅ Silny |

**Przykład z projektu:**
```python
# app/controllers/auth.py
from werkzeug.security import generate_password_hash, check_password_hash

# Hashowanie przy rejestracji
password_hash = generate_password_hash(password)  # Używa bcrypt

# Weryfikacja przy logowaniu
if check_password_hash(user.password_hash, password):
    # Hasło poprawne
```

---

#### Flask-CORS (4.0.x) - Cross-Origin Resource Sharing

**Co to jest CORS?**
- Mechanizm bezpieczeństwa przeglądarki
- Blokuje zapytania między różnymi domenami (origins)
- Zapobiega atakom CSRF (Cross-Site Request Forgery)

**Problem:**
```
Frontend:  http://localhost:8100
Backend:   http://localhost:5000

❌ Browser: "CORS policy: No 'Access-Control-Allow-Origin' header"
```

**Rozwiązanie w projekcie:**
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[
    'http://localhost:3000',   # React dev server
    'http://localhost:5173',   # Vite dev server
    'http://localhost:8100',   # Frontend
    'http://10.0.2.2:8100',   # Android emulator
])
```

**Co robi CORS?**
Dodaje nagłówki HTTP do odpowiedzi:
```http
Access-Control-Allow-Origin: http://localhost:8100
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Preflight Request (OPTIONS):**
```
Browser → OPTIONS /api/Customers
          ↓
Backend → 200 OK
          Access-Control-Allow-Origin: ...
          Access-Control-Allow-Methods: ...
          ↓
Browser → POST /api/Customers (actual request)
```

**Dlaczego potrzebny?**
- ✅ Frontend i backend na różnych portach (8100 vs 5000)
- ✅ Bezpieczeństwo - kontrola kto może wysyłać requesty
- ✅ W produkcji: tylko dozwolone domeny

---

#### ReportLab (4.0.x) - Generowanie PDF

**Co to jest ReportLab?**
- Biblioteka Python do generowania PDF
- Low-level API (pełna kontrola nad layoutem)
- Używana do faktur w projekcie

**Przykład z projektu:**
```python
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.colors import HexColor
from io import BytesIO

def create_invoice_pdf(invoice):
    buffer = BytesIO()  # Buffer w pamięci (nie zapisuje na dysk)
    doc = SimpleDocTemplate(buffer, pagesize=A4)

    elements = []  # Lista elementów PDF
    styles = getSampleStyleSheet()

    # 1. Tytuł
    title = Paragraph("<b>FAKTURA</b>", styles['Heading1'])
    elements.append(title)
    elements.append(Spacer(1, 20))  # Odstęp 20px

    # 2. Dane faktury
    data = [
        ['Numer:', invoice.Number],
        ['Data wystawienia:', invoice.IssuedAt.strftime('%d.%m.%Y')],
        ['Termin płatności:', invoice.DueDate.strftime('%d.%m.%Y')],
        ['Status:', 'Zapłacona' if invoice.IsPaid else 'Oczekuje'],
        ['Kwota:', f'{invoice.TotalAmount:.2f} PLN']
    ]

    table = Table(data, colWidths=[150, 350])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#000000')),
        ('FONTNAME', (0, 0), (-1, -1), 'DejaVuSans'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, HexColor('#d1d5db'))
    ]))
    elements.append(table)

    # 3. Build PDF
    doc.build(elements)
    buffer.seek(0)  # Przewiń na początek bufora
    return buffer
```

**Kluczowe komponenty:**
- **SimpleDocTemplate** - dokument PDF
- **Paragraph** - tekst z formatowaniem
- **Table** - tabela z danymi
- **Spacer** - odstępy między elementami
- **TableStyle** - style tabeli (kolory, ramki, czcionki)

**Polskie czcionki:**
```python
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Rejestracja czcionki DejaVu Sans (obsługuje polskie znaki)
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
```

**Dlaczego ReportLab?**
- ✅ Pełna kontrola nad layoutem PDF
- ✅ Programatyczne generowanie (nie trzeba edytować template)
- ✅ Obsługa polskich znaków (DejaVu Sans)
- ✅ W pamięci (BytesIO) - nie zapisuje na dysk

---

#### python-docx (1.1.x) - Generowanie Dokumentów Word

**Co to jest python-docx?**
- Biblioteka do tworzenia i edycji plików .docx (Microsoft Word)
- Używana do generowania umów w projekcie

**Przykład z projektu:**
```python
from docx import Document
from io import BytesIO

def generate_contract(template_path, data):
    """
    Generuje umowę zastępując placeholdery danymi

    Args:
        template_path: ścieżka do szablonu .docx
        data: dict z danymi do podstawienia

    Returns:
        BytesIO buffer z wygenerowanym dokumentem
    """
    doc = Document(template_path)

    # Zastąp placeholdery w paragrafach
    for paragraph in doc.paragraphs:
        for key, value in data.items():
            placeholder = f'{{{key}}}'  # {NUMER_UMOWY}
            if placeholder in paragraph.text:
                paragraph.text = paragraph.text.replace(placeholder, str(value))

    # Zastąp placeholdery w tabelach
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for key, value in data.items():
                    placeholder = f'{{{key}}}'
                    if placeholder in cell.text:
                        cell.text = cell.text.replace(placeholder, str(value))

    # Zapisz do bufora
    output = BytesIO()
    doc.save(output)
    output.seek(0)
    return output
```

**Przykład użycia:**
```python
# Szablon umowy (template.docx):
"""
UMOWA NR {NUMER_UMOWY}

Strony umowy:
1. {NAZWA_FIRMY}
2. {NAZWA_KLIENTA}

Data zawarcia: {DATA_ZAWARCIA}
Wartość umowy: {WARTOSC_UMOWY} PLN
"""

# Generowanie:
data = {
    'NUMER_UMOWY': '2025/01/001',
    'NAZWA_FIRMY': 'CRM Solutions Sp. z o.o.',
    'NAZWA_KLIENTA': 'ABC Sp. z o.o.',
    'DATA_ZAWARCIA': '06.10.2025',
    'WARTOSC_UMOWY': '10000.00'
}

buffer = generate_contract('templates/umowa.docx', data)
```

**Dlaczego python-docx?**
- ✅ Szablony .docx (łatwe do edycji przez użytkownika)
- ✅ Programatyczne zastępowanie danych
- ✅ Zachowuje formatowanie szablonu
- ✅ Obsługuje tabele, style, czcionki

---

### 2.2 Kluczowe Metody Backend - Szczegółowe Wyjaśnienia

#### Metoda: `create_app()` - Factory Pattern

**Lokalizacja:** `backend-python/app/__init__.py`

**Pełny kod:**
```python
def create_app():
    """
    Tworzy i konfiguruje aplikację Flask (Factory Pattern)

    Returns:
        Flask: Skonfigurowana instancja aplikacji

    Funkcjonalności:
        1. Inicjalizuje Flask z konfiguracją
        2. Wyłącza strict_slashes (URL z/bez slash)
        3. Konfiguruje CORS dla dozwolonych origins
        4. Inicjalizuje bazę danych SQLAlchemy
        5. Rejestruje 22 blueprinty (kontrolery)
        6. Definiuje główny endpoint '/'
    """
    app = Flask(__name__)

    # 1. Ładuje konfigurację z klasy Config
    app.config.from_object(Config)

    # 2. Wyłącza strict_slashes
    # /api/Customers i /api/Customers/ = to samo
    app.url_map.strict_slashes = False

    # 3. Konfiguruje CORS
    CORS(app, origins=[
        'http://localhost:3000',
        'http://localhost:8100',
        'http://localhost:8082',
        'http://localhost:5173'
    ])

    # 4. Inicjalizuje bazę danych
    init_database(app)

    # 5. Rejestruje blueprinty
    from app.controllers.auth import auth_bp
    from app.controllers.customers import customers_bp
    # ... 20 więcej

    app.register_blueprint(auth_bp, url_prefix='/api/Auth')
    app.register_blueprint(customers_bp, url_prefix='/api/Customers')
    # ... reszta blueprintów

    # 6. Główny endpoint
    @app.route('/')
    def index():
        return jsonify({
            'message': 'CRM API',
            'version': '1.0',
            'endpoints': ['/api/Auth', '/api/Customers', ...]
        })

    return app
```

**Dlaczego Factory Pattern?**
- ✅ Łatwe testowanie (możesz stworzyć wiele instancji z różnymi konfiguracjami)
- ✅ Możliwość wielu środowisk (dev, test, prod)
- ✅ Czytelniejszy kod (wszystko w jednym miejscu)

**Pytania obronne:**
- **Q:** Dlaczego używasz factory pattern zamiast globalnej instancji app?
- **A:** Bo factory pattern pozwala mi tworzyć wiele instancji aplikacji z różnymi konfiguracjami. To ważne przy testowaniu - mogę stworzyć app testową z inną bazą danych. Także łatwiej zarządzać środowiskami (development, production).

---

#### Metoda: `@require_auth` - Dekorator Autoryzacji

**Lokalizacja:** `backend-python/app/middleware.py`

**Pełny kod:**
```python
def require_auth(f):
    """
    Dekorator wymagający autoryzacji JWT

    Args:
        f: Funkcja do zabezpieczenia

    Returns:
        decorated: Funkcja z autoryzacją

    Działanie:
        1. Wyciąga token z nagłówka Authorization
        2. Dekoduje JWT używając PyJWT
        3. Sprawdza ważność tokenu (exp)
        4. Zapisuje user_id w kontekście Flask (g.user_id)
        5. Zwraca 401 przy błędach

    Użycie:
        @customers_bp.route('/', methods=['GET'])
        @require_auth  # ← Token sprawdzony PRZED wykonaniem funkcji
        def get_customers():
            user_id = get_current_user_id()  # Dostępne w g.user_id
            # ...
    """
    @wraps(f)  # Zachowuje metadane oryginalnej funkcji
    def decorated(*args, **kwargs):
        # 1. Pobierz token z nagłówka
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Brak tokenu autoryzacji'}), 401

        try:
            # 2. Usuń prefix "Bearer "
            token = token.replace('Bearer ', '')

            # 3. Dekoduj token JWT
            payload = jwt.decode(
                token,
                Config.JWT_SECRET_KEY,  # Klucz tajny
                algorithms=['HS256']     # Algorytm
            )

            # 4. Wyciągnij user_id z payload
            # Obsługa różnych kluczy (.NET: 'sub', Python: 'user_id')
            user_id = payload.get('user_id') or payload.get('sub')

            # 5. Zapisz w kontekście Flask
            g.user_id = user_id

        except jwt.ExpiredSignatureError:
            # Token wygasł
            return jsonify({'error': 'Token wygasł'}), 401
        except jwt.InvalidTokenError:
            # Token nieprawidłowy (błędny podpis, format, etc.)
            return jsonify({'error': 'Nieprawidłowy token'}), 401

        # 6. Wykonaj oryginalną funkcję
        return f(*args, **kwargs)

    return decorated
```

**Jak działa `@wraps`?**
```python
from functools import wraps

# ❌ Bez @wraps
def decorator(f):
    def wrapper(*args, **kwargs):
        return f(*args, **kwargs)
    return wrapper

@decorator
def my_function():
    """Dokumentacja"""
    pass

print(my_function.__name__)  # 'wrapper' (zła nazwa!)

# ✅ Z @wraps
def decorator(f):
    @wraps(f)  # ← Kopiuje __name__, __doc__, etc.
    def wrapper(*args, **kwargs):
        return f(*args, **kwargs)
    return wrapper

@decorator
def my_function():
    """Dokumentacja"""
    pass

print(my_function.__name__)  # 'my_function' (poprawna nazwa!)
```

**Flask Context (g):**
```python
from flask import g

# W middleware:
g.user_id = 42

# W kontrolerze:
user_id = g.user_id  # 42

# g jest request-local - każde żądanie ma własne g
```

**Pytania obronne:**
- **Q:** Jak działa dekorator w Pythonie?
- **A:** Dekorator to funkcja, która "opakowuje" inną funkcję i dodaje jej dodatkową funkcjonalność. W moim projekcie `@require_auth` sprawdza token JWT przed wykonaniem funkcji. Używam `@wraps` z functools aby zachować metadane oryginalnej funkcji jak __name__ i __doc__.

- **Q:** Dlaczego używasz JWT zamiast sesji?
- **A:** JWT jest stateless - serwer nie musi przechowywać sesji. To ważne przy skalowaniu poziomym - mogę mieć wiele serwerów i każdy może zweryfikować token bez współdzielonego state. Token zawiera wszystkie potrzebne dane (user_id, role) więc nie trzeba odpytywać bazy przy każdym requeście.

---

#### Metoda: `login()` - Endpoint Logowania

**Lokalizacja:** `backend-python/app/controllers/auth.py`

**Pełny kod z komentarzami:**
```python
@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Endpoint logowania użytkownika

    Request Body (JSON):
        {
            "username": "admin",
            "password": "haslo123"
        }

    Response (200 OK):
        {
            "token": "eyJhbGc...",
            "user": {
                "id": 1,
                "username": "admin",
                "email": "admin@example.com",
                "role": "Admin"
            }
        }

    Response (401 Unauthorized):
        {
            "error": "Nieprawidłowa nazwa użytkownika lub hasło"
        }

    Działanie:
        1. Pobiera username i password z JSON body
        2. Waliduje czy oba pola są wypełnione
        3. Wyszukuje użytkownika w bazie po username
        4. Sprawdza hasło (bcrypt)
        5. Generuje token JWT (ważny 24h)
        6. Zapisuje LoginHistory (IP, UserAgent, Success)
        7. Zwraca token + dane użytkownika
    """
    try:
        # 1. Pobierz dane z requestu
        data = request.get_json()

        # 2. Walidacja danych wejściowych
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({
                'error': 'Username i password są wymagane'
            }), 400

        username = data['username']
        password = data['password']

        # 3. Znajdź użytkownika w bazie
        user = User.query.filter_by(username=username).first()

        # 4. Sprawdź czy użytkownik istnieje i hasło się zgadza
        if not user:
            # Zapisz nieudaną próbę logowania
            login_history = LoginHistory(
                UserId=None,
                IpAddress=request.remote_addr,
                UserAgent=request.headers.get('User-Agent'),
                Success=False
            )
            db.session.add(login_history)
            db.session.commit()

            # Zwróć generyczny błąd (nie zdradzaj czy user istnieje)
            return jsonify({
                'error': 'Nieprawidłowa nazwa użytkownika lub hasło'
            }), 401

        # Sprawdź hasło
        if not check_password_hash(user.password_hash, password):
            # Jeśli hash nie działa, spróbuj MD5 fallback (legacy)
            import hashlib
            if user.password_hash != hashlib.md5(password.encode()).hexdigest():
                # Zapisz nieudaną próbę
                login_history = LoginHistory(
                    UserId=user.id,
                    IpAddress=request.remote_addr,
                    UserAgent=request.headers.get('User-Agent'),
                    Success=False
                )
                db.session.add(login_history)
                db.session.commit()

                return jsonify({
                    'error': 'Nieprawidłowa nazwa użytkownika lub hasło'
                }), 401

        # 5. Generuj token JWT
        token_payload = {
            'user_id': user.id,
            'username': user.username,
            'role': user.role.name,
            'exp': datetime.utcnow() + timedelta(hours=24)  # Wygasa po 24h
        }
        token = jwt.encode(
            token_payload,
            Config.JWT_SECRET_KEY,
            algorithm='HS256'
        )

        # 6. Zapisz udaną próbę logowania
        login_history = LoginHistory(
            UserId=user.id,
            IpAddress=request.remote_addr,
            UserAgent=request.headers.get('User-Agent'),
            Success=True
        )
        db.session.add(login_history)
        db.session.commit()

        # 7. Loguj zdarzenie systemowe
        from app.controllers.logs import log_system_event
        log_system_event(
            'Information',
            f'Użytkownik {user.username} zalogował się',
            'auth.login',
            user.id
        )

        # 8. Zwróć token i dane użytkownika
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role.name
            }
        }), 200

    except Exception as e:
        # Loguj błąd
        print(f'Błąd logowania: {str(e)}')
        return jsonify({'error': 'Błąd serwera'}), 500
```

**Kluczowe decyzje bezpieczeństwa:**

1. **Generyczny komunikat błędu**
```python
# ❌ ZŁE (ujawnia czy user istnieje)
if not user:
    return jsonify({'error': 'User nie istnieje'}), 401
if not check_password(password):
    return jsonify({'error': 'Błędne hasło'}), 401

# ✅ DOBRE (ten sam komunikat)
return jsonify({'error': 'Nieprawidłowa nazwa użytkownika lub hasło'}), 401
```

2. **LoginHistory (audit log)**
- Zapisuje WSZYSTKIE próby logowania (udane i nieudane)
- IP Address (request.remote_addr)
- User-Agent (przeglądarka, system)
- Timestamp (datetime.utcnow)

3. **MD5 Fallback (legacy)**
```python
# Dla starych haseł (przed migracją na bcrypt)
if user.password_hash != hashlib.md5(password.encode()).hexdigest():
    # Nieprawidłowe hasło
```
⚠️ **Uwaga:** MD5 jest przestarzały i niebezpieczny! To tylko fallback dla starych kont.

**Pytania obronne:**
- **Q:** Jak zabezpieczasz hasła użytkowników?
- **A:** Używam bcrypt do hashowania haseł z automatyczną solą. bcrypt jest wolny algorytm, co utrudnia ataki brute-force. Nie przechowuję haseł w formie jawnej - tylko hash. Przy logowaniu porównuję hash wprowadzonego hasła z hashem w bazie używając bcrypt.checkpw.

- **Q:** Dlaczego zapisujesz nieudane próby logowania?
- **A:** To część systemu audytu bezpieczeństwa. Zapisuję IP, User-Agent i timestamp wszystkich prób logowania. To pozwala wykrywać ataki brute-force - jeśli widzę wiele nieudanych prób z tego samego IP, mogę zablokować adres. Także użytkownik może sprawdzić swoją historię logowań i zobaczyć czy ktoś próbował się włamać.

---

### 2.3 Wzorce Projektowe Backend

#### 2.3.1 MVC (Model-View-Controller)

**Implementacja w projekcie:**
```
Model      → app/models/         (Customer, Task, Invoice)
View       → Frontend (React)    (CustomerList, TaskCard)
Controller → app/controllers/    (customers_bp, tasks_bp)
```

**Nie jest to czysty MVC**, bo:
- View jest osobną aplikacją (frontend React)
- Backend zwraca JSON, nie HTML
- Bardziej precyzyjnie: **REST API Architecture**

**Przykład przepływu:**
```
1. Frontend: GET /api/Customers/
2. Controller (customers.py): @customers_bp.route('/')
3. Model (Customer): Customer.query.all()
4. Database: SELECT * FROM Customers
5. Model: [customer1, customer2, ...]
6. Controller: [customer.to_dict() for customer in customers]
7. Response: JSON [{"id": 1, "name": "Jan"}, ...]
8. Frontend: Renderuje listę klientów
```

---

#### 2.3.2 Repository Pattern (przez ORM)

**Co to jest Repository?**
- Warstwa abstrakcji nad bazą danych
- Ukrywa szczegóły implementacji SQL
- Zapewnia czysty interfejs CRUD

**W projekcie:** SQLAlchemy to robi automatycznie

```python
# Repository Pattern (gdybym implementował ręcznie)
class CustomerRepository:
    def get_all(self):
        return Customer.query.all()

    def get_by_id(self, customer_id):
        return Customer.query.get(customer_id)

    def create(self, data):
        customer = Customer(**data)
        db.session.add(customer)
        db.session.commit()
        return customer

    def update(self, customer_id, data):
        customer = self.get_by_id(customer_id)
        for key, value in data.items():
            setattr(customer, key, value)
        db.session.commit()
        return customer

    def delete(self, customer_id):
        customer = self.get_by_id(customer_id)
        db.session.delete(customer)
        db.session.commit()

# Użycie:
repo = CustomerRepository()
customers = repo.get_all()
```

**W projekcie używam SQLAlchemy bezpośrednio:**
```python
# To samo, krócej:
customers = Customer.query.all()
customer = Customer.query.get(customer_id)
```

**Zalety Repository:**
- ✅ Łatwa zmiana bazy danych (SQLite → PostgreSQL → MongoDB)
- ✅ Łatwiejsze testowanie (mock repository)
- ✅ DRY (Don't Repeat Yourself)

---

#### 2.3.3 Blueprint Pattern (Modularyzacja)

**Co to jest Blueprint?**
- Sposób organizacji kodu Flask w moduły
- Każda funkcjonalność w osobnym pliku
- Możliwość ponownego użycia w innych projektach

**Struktura projektu:**
```
app/controllers/
├── auth.py          # auth_bp
├── customers.py     # customers_bp
├── tasks.py         # tasks_bp
├── invoices.py      # invoices_bp
└── ...
```

**Definicja blueprintu:**
```python
# app/controllers/customers.py
from flask import Blueprint

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/', methods=['GET'])
@require_auth
def get_customers():
    # Logika pobierania klientów
    pass

@customers_bp.route('/', methods=['POST'])
@require_auth
def create_customer():
    # Logika tworzenia klienta
    pass
```

**Rejestracja blueprintu:**
```python
# app/__init__.py
from app.controllers.customers import customers_bp

app.register_blueprint(customers_bp, url_prefix='/api/Customers')

# Teraz:
# GET  /api/Customers/     → get_customers()
# POST /api/Customers/     → create_customer()
# GET  /api/Customers/32   → get_customer(32)
```

**Zalety Blueprint:**
- ✅ Kod podzielony na moduły (łatwiej znaleźć)
- ✅ Możliwość pracy wielu programistów równolegle
- ✅ Łatwiejsze testowanie pojedynczych modułów
- ✅ Możliwość reużycia w innych projektach

**Pytania obronne:**
- **Q:** Dlaczego używasz blueprintów?
- **A:** Bo pozwalają mi podzielić aplikację na logiczne moduły. Zamiast jednego wielkiego pliku mam 22 osobne kontrolery - każdy odpowiada za jedną funkcjonalność (auth, customers, invoices). To ułatwia nawigację w kodzie i testowanie. Także mogę łatwo dodać nowy moduł bez ruszania reszty kodu.

---

[KONTYNUACJA W NASTĘPNEJ CZĘŚCI - dokument zbyt długi]

Czy chcesz, abym kontynuował szczegółową dokumentację dla frontendu i mobile, czy wolisz, żebym najpierw zapisał tę część?
