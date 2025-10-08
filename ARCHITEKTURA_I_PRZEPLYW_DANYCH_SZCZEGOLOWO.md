# 🏗️ ARCHITEKTURA I PRZEPŁYW DANYCH - SZCZEGÓŁOWO

> **Cel:** Wytłumaczenie juniorowi jak dane przepływają przez system od frontendu do bazy i z powrotem
> **Dla kogo:** Obrona pracy - wyjaśnienie architektury każdemu

---

## 📋 SPIS TREŚCI

1. [Przepływ Logowania - Krok Po Kroku](#1-przepływ-logowania---krok-po-kroku)
2. [Przepływ CRUD Klientów](#2-przepływ-crud-klientów)
3. [Przepływ Generowania PDF](#3-przepływ-generowania-pdf)
4. [System Powiadomień - Real-time](#4-system-powiadomień---real-time)
5. [Architektura Bezpieczeństwa](#5-architektura-bezpieczeństwa)
6. [Pytania Obronne z Odpowiedziami](#6-pytania-obronne-z-odpowiedziami)

---

## 1. PRZEPŁYW LOGOWANIA - KROK PO KROKU

### 1.1 Kompletny Przepływ

```
┌─────────────┐
│   USER      │
│ wpisuje:    │
│ - username  │
│ - password  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ FRONTEND (React LoginPage.tsx)          │
│                                          │
│ const handleLogin = async () => {       │
│   const res = await api.post(           │
│     '/Auth/login',                      │
│     { username, password }              │
│   );                                     │
│ }                                        │
└──────┬───────────────────────────────────┘
       │ HTTP POST
       │ http://localhost:8100/api/Auth/login
       │ Body: {"username":"admin","password":"admin123"}
       │
       ▼ (Vite Proxy)
┌─────────────────────────────────────────┐
│ VITE DEV SERVER :8100                   │
│                                          │
│ proxy: {                                 │
│   '/api': 'http://localhost:5000'      │
│ }                                        │
└──────┬───────────────────────────────────┘
       │ Przekierowanie
       │ http://localhost:5000/api/Auth/login
       │
       ▼
┌─────────────────────────────────────────┐
│ BACKEND (Flask app.py :5000)            │
│                                          │
│ @auth_bp.route('/login', methods=['POST'])│
│ def login():                             │
│   # 1. Pobierz dane                     │
│   data = request.get_json()             │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ WALIDACJA                                │
│                                          │
│ if not username or not password:        │
│   return {'error': '...'}, 400          │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ BAZA DANYCH (MariaDB/SQLite)            │
│                                          │
│ SELECT * FROM users                      │
│ WHERE username = 'admin';                │
│                                          │
│ Result:                                  │
│ {                                        │
│   id: 1,                                 │
│   username: 'admin',                     │
│   password_hash: '$2b$12$...',          │
│   role_id: 1                             │
│ }                                        │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ WERYFIKACJA HASŁA (bcrypt)              │
│                                          │
│ bcrypt.checkpw(                          │
│   'admin123',                            │
│   '$2b$12$...'                           │
│ )                                        │
│ → True ✓                                 │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ GENEROWANIE JWT                          │
│                                          │
│ payload = {                              │
│   'user_id': 1,                          │
│   'username': 'admin',                   │
│   'role': 'Admin',                       │
│   'exp': now + 24h                       │
│ }                                        │
│                                          │
│ token = jwt.encode(                      │
│   payload,                               │
│   SECRET_KEY,                            │
│   algorithm='HS256'                      │
│ )                                        │
│                                          │
│ token = "eyJhbGc...XYZ"                  │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ ZAPIS LoginHistory                       │
│                                          │
│ INSERT INTO LoginHistory (               │
│   UserId, IpAddress, UserAgent,         │
│   Success, LoginTime                     │
│ ) VALUES (                               │
│   1, '127.0.0.1', 'Mozilla/...',        │
│   TRUE, '2025-10-06 14:30:00'           │
│ )                                        │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ RESPONSE (JSON)                          │
│                                          │
│ HTTP 200 OK                              │
│ {                                        │
│   "token": "eyJhbGc...XYZ",              │
│   "user": {                              │
│     "id": 1,                             │
│     "username": "admin",                 │
│     "email": "admin@example.com",        │
│     "role": "Admin"                      │
│   }                                      │
│ }                                        │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ FRONTEND (LoginPage.tsx)                │
│                                          │
│ localStorage.setItem('token', token);   │
│ window.location.href = '/dashboard';    │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ AUTHCONTEXT (AuthContext.tsx)           │
│                                          │
│ useEffect(() => {                        │
│   const token = localStorage.getItem('token');│
│   if (token) {                           │
│     const decoded = jwtDecode(token);   │
│     setUser({                            │
│       username: decoded.username,       │
│       role: decoded.role                │
│     });                                  │
│   }                                      │
│ }, []);                                  │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ DASHBOARD - Zalogowany!                 │
└─────────────────────────────────────────┘
```

### 1.2 Wyjaśnienie Każdego Kroku

#### Krok 1: User wpisuje dane
- Frontend renderuje formularz logowania
- useState przechowuje username i password
- Controlled inputs (value + onChange)

#### Krok 2: Frontend wysyła POST request
```typescript
const handleLogin = async () => {
    try {
        const response = await api.post('/Auth/login', {
            username: username,  // "admin"
            password: password   // "admin123"
        });
        // response.data = { token: "...", user: {...} }
    } catch (error) {
        // Obsługa błędów
    }
};
```

#### Krok 3: Vite Proxy przekierowuje
```typescript
// vite.config.ts
server: {
    proxy: {
        '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true
        }
    }
}
// /api/Auth/login → http://localhost:5000/api/Auth/login
```

#### Krok 4: Flask otrzymuje request
```python
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # data = {"username": "admin", "password": "admin123"}

    username = data['username']
    password = data['password']
```

#### Krok 5: Walidacja danych
```python
if not username or not password:
    return jsonify({'error': 'Username i password są wymagane'}), 400
```

#### Krok 6: Zapytanie do bazy (SQLAlchemy)
```python
user = User.query.filter_by(username=username).first()

# SQLAlchemy generuje SQL:
# SELECT id, username, password_hash, role_id
# FROM users
# WHERE username = ?
# LIMIT 1

# Zwraca:
# User(id=1, username='admin', password_hash='$2b$12$...', role_id=1)
```

#### Krok 7: Weryfikacja hasła (bcrypt)
```python
import bcrypt

# Porównaj wprowadzone hasło z hashem w bazie
is_valid = bcrypt.checkpw(
    password.encode('utf-8'),           # "admin123"
    user.password_hash.encode('utf-8')  # "$2b$12$..."
)

# bcrypt:
# 1. Wyciąga sól z hasha ($2b$12$...)
# 2. Hashuje wprowadzone hasło z tą samą solą
# 3. Porównuje hashe
# 4. Zwraca True/False
```

#### Krok 8: Generowanie JWT
```python
import jwt
from datetime import datetime, timedelta

payload = {
    'user_id': user.id,         # 1
    'username': user.username,   # "admin"
    'role': user.role.name,      # "Admin"
    'exp': datetime.utcnow() + timedelta(hours=24)  # Wygasa po 24h
}

token = jwt.encode(
    payload,
    Config.JWT_SECRET_KEY,  # "secret-key-change-in-production"
    algorithm='HS256'
)

# token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFkbWluIiwiZXhwIjoxNjIzOTc4ODAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
```

#### Krok 9: Zapis LoginHistory
```python
login_history = LoginHistory(
    UserId=user.id,                      # 1
    IpAddress=request.remote_addr,       # "127.0.0.1"
    UserAgent=request.headers.get('User-Agent'),  # "Mozilla/..."
    Success=True,
    LoginTime=datetime.utcnow()
)
db.session.add(login_history)
db.session.commit()

# SQL:
# INSERT INTO LoginHistory (UserId, IpAddress, UserAgent, Success, LoginTime)
# VALUES (1, '127.0.0.1', 'Mozilla/...', TRUE, '2025-10-06 14:30:00')
```

#### Krok 10: Odpowiedź JSON
```python
return jsonify({
    'token': token,
    'user': {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role.name
    }
}), 200
```

#### Krok 11: Frontend zapisuje token
```typescript
const { token, user } = response.data;

// Zapisz token w localStorage
localStorage.setItem('token', token);

// Redirect do dashboard (full page reload)
window.location.href = '/dashboard';
```

#### Krok 12: AuthContext ładuje użytkownika
```typescript
useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Dekoduj token
    const decoded = jwtDecode<JwtPayload>(token);

    // Sprawdź czy nie wygasł
    if (decoded.exp * 1000 < Date.now()) {
        logout();
        return;
    }

    // Ustaw użytkownika w stanie
    setUser({
        username: decoded.username,
        role: decoded.role
    });

    setLoading(false);
}, []);
```

#### Krok 13: Axios Interceptor dodaje token do requestów
```typescript
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Teraz każde zapytanie ma nagłówek:
// Authorization: Bearer eyJhbGc...XYZ
```

---

## 2. PRZEPŁYW CRUD KLIENTÓW

### 2.1 GET /api/Customers - Pobieranie Listy

```
┌─────────────┐
│ FRONTEND    │
│ ClientsPage │
│             │
│ useEffect(() => {
│   fetchCustomers();
│ }, []);
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────┐
│ Axios Request                     │
│                                   │
│ GET /api/Customers                │
│ Headers:                          │
│   Authorization: Bearer eyJ...    │
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ BACKEND                           │
│ @customers_bp.route('/')          │
│ @require_auth                     │
│ def get_customers():              │
│   # 1. Middleware sprawdza token  │
│   # 2. Pobiera wszystkich klientów│
│   customers = Customer.query.all()│
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ DATABASE                          │
│                                   │
│ SELECT * FROM Customers           │
│ ORDER BY CreatedAt DESC           │
│                                   │
│ Results: [                        │
│   {Id:1, Name:"Jan", Email:"..."},│
│   {Id:2, Name:"Anna", ...},       │
│   ...                             │
│ ]                                 │
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ BACKEND - Serializacja            │
│                                   │
│ return jsonify([                  │
│   customer.to_dict()              │
│   for customer in customers       │
│ ])                                │
│                                   │
│ Response: 200 OK                  │
│ [                                 │
│   {"id":1,"name":"Jan",...},      │
│   {"id":2,"name":"Anna",...}      │
│ ]                                 │
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ FRONTEND - Update State           │
│                                   │
│ setCustomers(response.data);      │
│                                   │
│ // React re-renderuje             │
│ <FlatList data={customers} />     │
└───────────────────────────────────┘
```

### 2.2 POST /api/Customers - Dodawanie Klienta

```
┌─────────────┐
│ USER        │
│ Wypełnia    │
│ formularz:  │
│ - name      │
│ - email     │
│ - phone     │
│ - company   │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────┐
│ FRONTEND AddClientPage            │
│                                   │
│ const handleSubmit = async () => {│
│   await api.post('/Customers/', {│
│     name, email, phone, company   │
│   });                             │
│ };                                │
└──────┬────────────────────────────┘
       │ POST /api/Customers/
       │ Body: {"name":"Jan Kowalski","email":"jan@..."}
       │
       ▼
┌──────────────────────────────────┐
│ BACKEND                           │
│ @customers_bp.route('/')          │
│ @require_auth                     │
│ def create_customer():            │
│   data = request.get_json()       │
│                                   │
│   # Tworzenie obiektu             │
│   customer = Customer(            │
│     Name=data['name'],            │
│     Email=data.get('email'),      │
│     Phone=data.get('phone'),      │
│     Company=data.get('company')   │
│   )                               │
│                                   │
│   db.session.add(customer)        │
│   db.session.commit()             │
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ DATABASE                          │
│                                   │
│ INSERT INTO Customers (           │
│   Name, Email, Phone, Company,    │
│   CreatedAt                       │
│ ) VALUES (                        │
│   'Jan Kowalski',                 │
│   'jan@example.com',              │
│   '123456789',                    │
│   'ABC Sp. z o.o.',               │
│   '2025-10-06 14:30:00'           │
│ )                                 │
│                                   │
│ RETURNING Id;  → 33               │
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ BACKEND - Response                │
│                                   │
│ return jsonify(                   │
│   customer.to_dict()              │
│ ), 201                            │
│                                   │
│ Response: 201 Created             │
│ {"id":33,"name":"Jan Kowalski",...}│
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ FRONTEND                          │
│                                   │
│ navigate('/klienci');             │
│ openToast('Klient dodany!');      │
└───────────────────────────────────┘
```

### 2.3 DELETE /api/Customers/:id - Usuwanie Klienta

```
┌─────────────┐
│ USER        │
│ Klika       │
│ "Usuń"      │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────┐
│ FRONTEND - Confirm Dialog         │
│                                   │
│ openModal({                       │
│   type: 'confirm',                │
│   title: 'Potwierdź usunięcie',  │
│   message: 'Czy na pewno?',       │
│   onConfirm: async () => {        │
│     await api.delete(`/Customers/${id}`);│
│     fetchCustomers();             │
│   }                               │
│ });                               │
└──────┬────────────────────────────┘
       │ User klika "Potwierdź"
       │
       ▼
┌──────────────────────────────────┐
│ Axios Request                     │
│                                   │
│ DELETE /api/Customers/33          │
│ Headers:                          │
│   Authorization: Bearer eyJ...    │
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ BACKEND                           │
│ @customers_bp.route('/<int:id>') │
│ @require_auth                     │
│ def delete_customer(id):          │
│   customer = Customer.query.get(id)│
│   if not customer:                │
│     return {'error':'...'}, 404   │
│                                   │
│   db.session.delete(customer)     │
│   db.session.commit()             │
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ DATABASE                          │
│                                   │
│ DELETE FROM Customers             │
│ WHERE Id = 33                     │
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ BACKEND - Response                │
│                                   │
│ return jsonify({                  │
│   'message': 'Klient usunięty'    │
│ }), 200                           │
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ FRONTEND                          │
│                                   │
│ fetchCustomers();  // Odśwież listę│
│ openToast('Klient usunięty');     │
└───────────────────────────────────┘
```

---

## 3. PRZEPŁYW GENEROWANIA PDF

### 3.1 Pobieranie PDF Faktury (Mobile)

```
┌─────────────┐
│ USER        │
│ Klika       │
│ "Pobierz    │
│  PDF"       │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ MOBILE InvoiceDetailScreen                │
│                                           │
│ const downloadPDF = async () => {         │
│   setIsDownloading(true);                 │
│                                           │
│   // 1. Pobierz PDF z API                │
│   const response = await api.get(         │
│     `/Invoices/${id}/pdf?token=${token}`,│
│     { responseType: 'blob' }              │
│   );                                      │
│ };                                        │
└──────┬────────────────────────────────────┘
       │ GET /api/Invoices/5/pdf?token=eyJ...
       │
       ▼
┌──────────────────────────────────────────┐
│ BACKEND - Manual Auth                     │
│                                           │
│ @invoices_bp.route('/<int:id>/pdf')      │
│ def generate_invoice_pdf(id):            │
│   # Manualna weryfikacja JWT z query     │
│   token = request.args.get('token')      │
│   payload = jwt.decode(token, SECRET_KEY)│
│                                           │
│   # Pobierz fakturę                       │
│   invoice = Invoice.query.options(       │
│     joinedload(Invoice.customer),        │
│     joinedload(Invoice.payments)         │
│   ).get(id)                               │
└──────┬────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ DATABASE                                  │
│                                           │
│ SELECT                                    │
│   Invoices.*,                             │
│   Customers.Name as customer_name,        │
│   Payments.*                              │
│ FROM Invoices                             │
│ LEFT JOIN Customers                       │
│   ON Invoices.CustomerId = Customers.Id  │
│ LEFT JOIN Payments                        │
│   ON Payments.InvoiceId = Invoices.Id    │
│ WHERE Invoices.Id = 5                     │
└──────┬────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ BACKEND - ReportLab                       │
│                                           │
│ def create_invoice_pdf(invoice):         │
│   buffer = BytesIO()                      │
│   doc = SimpleDocTemplate(buffer, A4)     │
│                                           │
│   elements = []                           │
│                                           │
│   # Tytuł                                 │
│   title = Paragraph("FAKTURA", styles)    │
│   elements.append(title)                  │
│                                           │
│   # Dane faktury (tabela)                │
│   data = [                                │
│     ['Numer:', invoice.Number],           │
│     ['Data:', invoice.IssuedAt],          │
│     ['Kwota:', f'{invoice.Total} PLN']    │
│   ]                                       │
│   table = Table(data)                     │
│   elements.append(table)                  │
│                                           │
│   # Build PDF                             │
│   doc.build(elements)                     │
│   buffer.seek(0)                          │
│   return buffer                           │
│                                           │
│ pdf_buffer = create_invoice_pdf(invoice)  │
└──────┬────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ BACKEND - HTTP Response                   │
│                                           │
│ response = make_response(pdf_buffer.read())│
│ response.headers['Content-Type'] =       │
│   'application/pdf'                       │
│ response.headers['Content-Disposition'] = │
│   'inline; filename=faktura_5.pdf'        │
│                                           │
│ return response                           │
└──────┬────────────────────────────────────┘
       │ Binary PDF data
       │
       ▼
┌──────────────────────────────────────────┐
│ MOBILE - FileReader                       │
│                                           │
│ // 2. Konwertuj Blob → Base64            │
│ const reader = new FileReader();          │
│ reader.readAsDataURL(response.data);      │
│ reader.onloadend = async () => {          │
│   const base64 =                          │
│     reader.result.split(',')[1];          │
│                                           │
│   // 3. Zapisz do FileSystem              │
│   const fileUri =                         │
│     FileSystem.documentDirectory +        │
│     `faktura_${id}.pdf`;                  │
│                                           │
│   await FileSystem.writeAsStringAsync(    │
│     fileUri,                              │
│     base64,                               │
│     {encoding: Base64}                    │
│   );                                      │
│                                           │
│   // 4. Udostępnij plik                   │
│   await Sharing.shareAsync(fileUri);      │
│ };                                        │
└──────┬────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ iOS/Android Share Sheet                   │
│                                           │
│ ┌────────────────────┐                    │
│ │ Udostępnij przez:  │                    │
│ ├────────────────────┤                    │
│ │ 📧 Mail            │                    │
│ │ 💬 Messages        │                    │
│ │ 📱 WhatsApp        │                    │
│ │ ☁️  iCloud Drive   │                    │
│ └────────────────────┘                    │
└───────────────────────────────────────────┘
```

### 3.2 Wyjaśnienie Techniczne

#### Dlaczego Blob → Base64 → FileSystem?
```
1. Backend zwraca binary PDF (application/pdf)
2. Axios otrzymuje jako Blob (binary large object)
3. React Native nie ma bezpośredniego dostępu do Blob
4. FileReader.readAsDataURL() konwertuje Blob → Data URL
5. Data URL format: "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK..."
6. Split(',')[1] wyciąga część Base64
7. FileSystem.writeAsStringAsync() zapisuje Base64 jako plik
8. Sharing.shareAsync() pokazuje system share sheet
```

#### Dlaczego token w query parameter?
```
// ❌ Problem: <embed src="/api/Invoices/5/pdf">
// Nie mogę dodać nagłówka Authorization do <embed>

// ✅ Rozwiązanie: /api/Invoices/5/pdf?token=eyJ...
// Token w URL (manualna weryfikacja w kontrolerze)
```

⚠️ **Uwaga bezpieczeństwa:** Token w URL może być logowany w access logs. W produkcji lepiej użyć:
- Short-lived tokens (exp: 1min)
- Lub signed URLs (AWS S3 style)

---

## 4. SYSTEM POWIADOMIEŃ - REAL-TIME

### 4.1 Polling Pattern (Użyty w Projekcie)

```
┌─────────────────────────────────────────┐
│ FRONTEND Layout.tsx                      │
│                                          │
│ useEffect(() => {                        │
│   const fetchNotifications = async () => {│
│     const response =                     │
│       await api.get('/Notifications/user');│
│     setNotifications(response.data);     │
│   };                                     │
│                                          │
│   fetchNotifications();  // Natychmiast  │
│                                          │
│   const interval = setInterval(          │
│     fetchNotifications,                  │
│     30000  // Co 30 sekund               │
│   );                                     │
│                                          │
│   return () => clearInterval(interval);  │
│ }, []);                                  │
└──────┬───────────────────────────────────┘
       │ Co 30s
       │
       ▼
┌──────────────────────────────────────────┐
│ BACKEND                                   │
│ @notifications_bp.route('/user')         │
│ @require_auth                             │
│ def get_user_notifications():            │
│   user_id = get_current_user_id()        │
│   notifications = Notification.query     │
│     .filter_by(UserId=user_id)           │
│     .order_by(                            │
│       Notification.CreatedAt.desc()      │
│     )                                     │
│     .limit(50)                            │
│     .all()                                │
│   return jsonify([n.to_dict()            │
│     for n in notifications])             │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ DATABASE                                  │
│                                           │
│ SELECT * FROM Notifications               │
│ WHERE UserId = 1                          │
│ ORDER BY CreatedAt DESC                   │
│ LIMIT 50                                  │
│                                           │
│ Results: [                                │
│   {Id:10, Message:"...", IsRead:false},   │
│   {Id:9, Message:"...", IsRead:true},     │
│   ...                                     │
│ ]                                         │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ FRONTEND - Wykrywanie Nowych             │
│                                           │
│ const prevNotifications = useRef([]);     │
│                                           │
│ useEffect(() => {                         │
│   const newNotifications =                │
│     notifications.filter(n =>             │
│       !prevNotifications.current          │
│         .find(prev => prev.id === n.id)   │
│     );                                    │
│                                           │
│   if (newNotifications.length > 0) {      │
│     setNewNotificationToast(              │
│       newNotifications[0]                 │
│     );                                    │
│     // Toast znika po 5s                  │
│   }                                       │
│                                           │
│   prevNotifications.current =             │
│     notifications;                        │
│ }, [notifications]);                      │
└───────────────────────────────────────────┘
```

### 4.2 Dlaczego Polling zamiast WebSockets?

| Feature | Polling (użyte) | WebSockets |
|---------|----------------|------------|
| Implementacja | ✅ Prosta (setInterval) | ❌ Złożona (socket.io) |
| Obciążenie | ⚠️ Request co 30s | ✅ Push tylko przy zmianie |
| Skalowalność | ✅ Stateless (load balancer friendly) | ⚠️ Sticky sessions |
| Realtime | ⚠️ Opóźnienie do 30s | ✅ Instant |
| Idealne dla | Powiadomienia (nie krytyczne) | Chat, Live updates |

**Decyzja:** Dla CRM powiadomienia nie muszą być instant. Opóźnienie 30s jest akceptowalne, a polling jest prostszy.

---

## 5. ARCHITEKTURA BEZPIECZEŃSTWA

### 5.1 Warstwy Bezpieczeństwa

```
┌─────────────────────────────────────────┐
│ WARSTWA 1: TRANSPORT                    │
│ ✅ HTTPS (produkcja)                    │
│ ✅ TLS 1.3                              │
│ ❌ HTTP (development tylko!)            │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ WARSTWA 2: CORS                         │
│ ✅ Whitelist origins                    │
│ ✅ credentials: true                    │
│ ✅ Preflight requests                   │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ WARSTWA 3: AUTORYZACJA JWT              │
│ ✅ @require_auth middleware             │
│ ✅ Token expiration (24h)               │
│ ✅ Signature verification (HS256)       │
│ ❌ Refresh tokens (TODO)                │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ WARSTWA 4: ROLE-BASED ACCESS            │
│ ✅ @require_admin decorator             │
│ ✅ User roles (Admin, User)             │
│ ⚠️ Brak row-level permissions           │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ WARSTWA 5: INPUT VALIDATION             │
│ ⚠️ Podstawowa walidacja (if not data)   │
│ ❌ Brak schema validation               │
│ ✅ SQLAlchemy ORM (SQL injection proof) │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ WARSTWA 6: PASSWORD SECURITY            │
│ ✅ bcrypt hashowanie                    │
│ ✅ Automatyczna sól                     │
│ ✅ Cost factor 12                       │
│ ⚠️ MD5 fallback (legacy)                │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ WARSTWA 7: AUDIT LOGGING                │
│ ✅ LoginHistory                         │
│ ✅ SystemLogs                           │
│ ✅ IP + UserAgent tracking              │
└─────────────────────────────────────────┘
```

### 5.2 Podatności i Mitigacje

#### XSS (Cross-Site Scripting)
```
Podatność:
<div>{customer.name}</div>
// customer.name = "<script>alert('XSS')</script>"

Mitigacja:
✅ React automatycznie escapuje (dangerouslySetInnerHTML not used)
✅ Backend: nie zwraca HTML, tylko JSON
⚠️ Backend: brak sanityzacji inputu
```

#### SQL Injection
```
Podatność:
query = f"SELECT * FROM users WHERE username = '{username}'"
// username = "admin' OR '1'='1"

Mitigacja:
✅ SQLAlchemy ORM (parametryzowane zapytania)
User.query.filter_by(username=username)
// → SELECT * FROM users WHERE username = ?
```

#### CSRF (Cross-Site Request Forgery)
```
Podatność:
<img src="http://crm.com/api/Customers/1/delete">

Mitigacja:
✅ JWT w Authorization header (nie w cookies)
⚠️ Brak CSRF tokens (ale nie potrzebne z JWT)
```

#### Rate Limiting
```
Podatność:
Brak limitu prób logowania → brute force

Mitigacja:
❌ Brak rate limiting w projekcie
✅ TODO: Flask-Limiter (5 prób/minutę)
```

---

## 6. PYTANIA OBRONNE Z ODPOWIEDZIAMI

### Q1: "Jak działa autoryzacja w Twojej aplikacji od A do Z?"

**Odpowiedź:**
1. User wpisuje username i password
2. Frontend wysyła POST /api/Auth/login
3. Backend weryfikuje hasło przez bcrypt.checkpw()
4. Backend generuje JWT z payload (user_id, role, exp)
5. Frontend zapisuje token w localStorage (web) lub SecureStore (mobile)
6. Przy każdym requeście Axios interceptor dodaje `Authorization: Bearer <token>`
7. Backend middleware @require_auth dekoduje token i sprawdza ważność
8. Jeśli valid → request przechodzi, jeśli nie → 401 Unauthorized

---

### Q2: "Dlaczego JWT zamiast sesji?"

**Odpowiedź:**
JWT jest stateless - serwer nie musi przechowywać sesji. To ważne przy skalowaniu:
- Mogę mieć 5 serwerów backend za load balancerem
- Każdy serwer może zweryfikować token bez współdzielonego state
- Nie potrzebuję Redis do session storage
- Token zawiera wszystkie dane (user_id, role) więc nie muszę query bazy przy każdym requeście

Wady JWT:
- Nie mogę "odwołać" tokena (rozwiązanie: krótki exp lub blacklist)
- Token może być większy niż session ID

---

### Q3: "Jak zabezpieczasz API przed nieautoryzowanym dostępem?"

**Odpowiedź:**
Używam dekoratora @require_auth na każdym chroniony endpointcie:
1. Sprawdza czy request ma nagłówek Authorization
2. Dekoduje JWT używając PyJWT
3. Sprawdza czy token nie wygasł (exp field)
4. Sprawdza podpis (signature verification z SECRET_KEY)
5. Jeśli wszystko OK → zapisuje user_id w Flask.g i wykonuje funkcję
6. Jeśli błąd → zwraca 401 Unauthorized

Dodatkowo:
- CORS ogranicza origins (tylko frontend może wysyłać requesty)
- HTTPS w produkcji (szyfrowanie transportu)
- bcrypt dla haseł (ochrona przy wycieku bazy)

---

### Q4: "Jak działają przypomnienia w aplikacji mobilnej?"

**Odpowiedź:**
Używam polling pattern:
1. Custom hook useReminders() pobiera przypomnienia z API co 2 minuty
2. useEffect z setInterval sprawdza co 1 minutę czy jest przypomnienie na ten czas
3. Porównuje rok, miesiąc, dzień, godzinę, minutę z remind_at
4. Jeśli match → wywołuje Alert.alert() (native alert)
5. Dodaje ID do shownReminders (aby nie pokazać ponownie)
6. shownReminders jest resetowany każdego dnia (lastCheckedDate)

Dlaczego nie push notifications?
- Prostsze w implementacji
- Nie wymaga konfiguracji FCM/APNs
- Działa tylko gdy app otwarty (wystarczające dla CRM)

---

### Q5: "Jak synchronizujesz dane między web a mobile?"

**Odpowiedź:**
Nie ma synchronizacji offline. Obie aplikacje używają tego samego backend API:
1. Web i mobile wysyłają zapytania do tego samego Flask backendu
2. Backend zwraca JSON z bazy danych
3. Każda zmiana jest od razu zapisana w bazie
4. Pull-to-refresh w mobile odświeża dane

To prostsza architektura niż offline-first:
- Nie muszę rozwiązywać konfliktów (conflict resolution)
- Nie muszę przechowywać danych lokalnie (AsyncStorage)
- Zawsze mam aktualne dane (single source of truth)

Dla offline support mógłbym dodać:
- AsyncStorage cache
- Sync queue (zapytania wykonane offline)
- Conflict resolution strategy

---

### Q6: "Dlaczego Vite zamiast Webpack?"

**Odpowiedź:**
Vite jest znacznie szybszy:
1. Dev server start: Webpack ~30s (bundluje wszystko), Vite ~1s (ES modules)
2. Hot Module Replacement: Webpack ~2s, Vite instant
3. Build: Webpack wolny, Vite używa esbuild (bardzo szybki)

Jak działa Vite:
- Zamiast bundlować wszystko, serwuje pliki on-demand
- Przeglądarki nowoczesne wspierają ES modules
- import { Button } from './Button' → przeglądarka pobiera tylko Button.js
- W produkcji bundluje przez Rollup (optymalizacja)

Prostszy config:
- Webpack: 100+ linii konfiguracji
- Vite: 10 linii (plugin react + tailwind + proxy)

---

### Q7: "Jak testowałeś aplikację?"

**Odpowiedź:**
**Backend:**
- Manual testing przez Postman
- Testy dla każdego endpointu (GET, POST, PUT, DELETE)
- Sprawdzanie responses (200, 400, 401, 404, 500)
- Testowanie edge cases (brak tokena, nieprawidłowe dane)

**Frontend Web:**
- Manual testing w przeglądarce (Chrome DevTools)
- Testowanie każdej strony i funkcji
- Responsive testing (mobile, tablet, desktop)
- Cross-browser testing (Chrome, Firefox, Safari)

**Mobile:**
- Testing na Android emulatorze
- Expo Go na fizycznym urządzeniu
- Testowanie synchronizacji z backendem

**Automated testing (TODO):**
- Backend: pytest + Flask test client
- Frontend: Vitest + React Testing Library
- E2E: Playwright lub Cypress

---

### Q8: "Jakie są największe wyzwania w projekcie?"

**Odpowiedź:**
1. **Integracja backend ↔ frontend**
   - CORS errors (rozwiązane przez Flask-CORS + Vite proxy)
   - Token management (rozwiązane przez interceptory)
   - JSON parsing (.NET $values format)

2. **Debugowanie błędów autoryzacji**
   - 401 errors trudne do zdiagnozowania
   - Dodałem extensive logging
   - Chrome DevTools Network tab

3. **Synchronizacja danych web ↔ mobile**
   - Pull-to-refresh dla consistency
   - Real-time updates (polling co 30s)

4. **PDF generation**
   - Polskie czcionki (DejaVu Sans)
   - Layout PDF (ReportLab learning curve)
   - Mobile sharing (Blob → Base64 → FileSystem)

---

### Q9: "Co byś zmienił/poprawił?"

**Odpowiedź:**
1. **Testy automatyczne** - pytest, Vitest, E2E
2. **React Query** - lepszy cache management, optimistic updates
3. **WebSockets** - zamiast pollingu dla powiadomień
4. **PostgreSQL** - zamiast SQLite (produkcja)
5. **Docker** - łatwiejszy deployment
6. **CI/CD** - GitHub Actions (auto tests + deploy)
7. **Walidacja** - schema validation (Pydantic backend, Zod frontend)
8. **Rate limiting** - Flask-Limiter (5 prób login/min)
9. **Refresh tokens** - długotrwałe sesje
10. **Error monitoring** - Sentry dla produkcji

---

### Q10: "Czy aplikacja jest gotowa do produkcji?"

**Odpowiedź:**
**Tak, ale z zastrzeżeniami:**

✅ **Gotowe:**
- Funkcjonalność (CRUD, autoryzacja, PDF, powiadomienia)
- Bezpieczeństwo podstawowe (JWT, bcrypt, CORS)
- UI/UX (responsive, intuicyjny)

⚠️ **Wymaga poprawek:**
1. Zmiana SECRET_KEY (env variable)
2. HTTPS (SSL certificate)
3. PostgreSQL (zamiast SQLite)
4. Rate limiting
5. Backup bazy danych
6. Monitoring i logging (Sentry, CloudWatch)
7. CDN dla statycznych plików
8. Load balancer (dla >100 użytkowników)

❌ **Brakuje:**
- Automated tests
- CI/CD pipeline
- Documentation API (Swagger)
- Admin panel (zarządzanie użytkownikami)

**Dla małej firmy (10-50 użytkowników):** Gotowe po poprawkach ⚠️
**Dla dużej firmy (>100 użytkowników):** Wymaga skalowania i testów ❌

---

**Ten dokument zawiera kompletny opis przepływu danych przez system oraz gotowe odpowiedzi na pytania obronne. Każdy przepływ jest wyjaśniony krok po kroku z wizualizacjami ASCII.**
