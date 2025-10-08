# 🔍 SZCZEGÓŁOWY OPIS METOD I FUNKCJI - OBRONA

> **Projekt:** Zintegrowany System CRM
> **Autor:** Paweł Paciorkowski
> **Cel:** Szczegółowe wyjaśnienie każdej kluczowej metody i funkcji w systemie

---

## 📋 SPIS TREŚCI

1. [Backend - Inicjalizacja Aplikacji](#backend---inicjalizacja-aplikacji)
2. [Backend - Middleware i Autoryzacja](#backend---middleware-i-autoryzacja)
3. [Backend - Kontroler Uwierzytelniania](#backend---kontroler-uwierzytelniania)
4. [Frontend Web - Kontekst Autoryzacji](#frontend-web---kontekst-autoryzacji)
5. [Mobile - Kontekst Autoryzacji](#mobile---kontekst-autoryzacji)
6. [Backend - Modele Danych](#backend---modele-danych)
7. [Frontend - Komponenty i Routing](#frontend---komponenty-i-routing)

---

## 🐍 BACKEND - INICJALIZACJA APLIKACJI

### **Plik: `backend-python/app/__init__.py`**

#### **Funkcja `create_app()` - Factory Pattern**

```python
def create_app():
    """Tworzy i konfiguruje aplikację Flask"""
    app = Flask(__name__)
    app.config.from_object(Config)
    app.url_map.strict_slashes = False

    CORS(app, origins=['http://localhost:3000', 'http://localhost:8100',
                       'http://localhost:8082', 'http://localhost:5173'])

    init_database(app)

    # Importowanie i rejestrowanie blueprintów
    from app.controllers.auth import auth_bp
    from app.controllers.customers import customers_bp
    # ... inne importy

    app.register_blueprint(auth_bp, url_prefix='/api/Auth')
    app.register_blueprint(customers_bp, url_prefix='/api/Customers')
    # ... inne rejestracje

    return app
```

**Wyjaśnienie krok po kroku:**

1. **`app = Flask(__name__)`**
   - Tworzy instancję aplikacji Flask
   - `__name__` to nazwa modułu Python - Flask używa tego do określenia lokalizacji zasobów

2. **`app.config.from_object(Config)`**
   - Ładuje konfigurację z obiektu `Config` (klasa z pliku `config.py`)
   - Zawiera ustawienia jak: SECRET_KEY, DATABASE_URI, JWT_SECRET_KEY
   - Pozwala mieć różne konfiguracje dla development/production

3. **`app.url_map.strict_slashes = False`**
   - Wyłącza ścisłe sprawdzanie końcowych slashy w URL
   - `/api/Customers` i `/api/Customers/` będą traktowane tak samo
   - Ważne dla spójności API - klienci mogą nie dodawać slasha

4. **`CORS(app, origins=[...])`**
   - **CORS** = Cross-Origin Resource Sharing
   - Pozwala aplikacjom z innych domen (origins) łączyć się z API
   - Lista origins zawiera adresy lokalnych serwerów development:
     - `localhost:3000` - standardowy port React
     - `localhost:8100` - Expo mobile development
     - `localhost:8082` - alternatywny port Expo
     - `localhost:5173` - Vite development server
   - Bez CORS przeglądarka blokuje requesty z innych domen (security)

5. **`init_database(app)`**
   - Inicjalizuje połączenie z bazą danych
   - Tworzy tabele jeśli nie istnieją
   - Binduje SQLAlchemy ORM do aplikacji Flask

6. **`app.register_blueprint(auth_bp, url_prefix='/api/Auth')`**
   - **Blueprint** to moduł Flask grupujący powiązane endpointy
   - `auth_bp` zawiera endpointy logowania, rejestracji
   - `url_prefix` dodaje prefix do wszystkich ścieżek w blueprint
   - Przykład: `@auth_bp.route('/login')` → `/api/Auth/login`
   - Zalety blueprintów:
     - Modularność - łatwe zarządzanie kodem
     - Reużywalność - możliwość używania w wielu aplikacjach
     - Separation of concerns - każdy moduł odpowiada za swoją domenę

**Wzorzec Factory Pattern:**
- Zamiast tworzyć app globalnie, tworzymy funkcję `create_app()`
- Zalety:
  - Możliwość tworzenia wielu instancji app (dla testów)
  - Łatwiejsze przekazywanie różnych konfiguracji
  - Lepsze testowanie - każdy test może mieć świeżą instancję

---

## 🔐 BACKEND - MIDDLEWARE I AUTORYZACJA

### **Plik: `backend-python/app/middleware.py`**

#### **Dekorator `@require_auth` - Ochrona Endpointów**

```python
def require_auth(f):
    """Dekorator wymagający autoryzacji"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
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
```

**Wyjaśnienie krok po kroku:**

1. **`def require_auth(f):`**
   - To **dekorator** - funkcja, która "opakowuje" inną funkcję
   - Przyjmuje funkcję `f` (endpoint) i dodaje do niej funkcjonalność autoryzacji
   - Przykład użycia: `@require_auth` nad funkcją endpointu

2. **`@wraps(f)`**
   - Dekorator z `functools` zachowujący metadane oryginalnej funkcji
   - Bez tego `f.__name__` byłoby `decorated_function` zamiast prawdziwej nazwy
   - Ważne dla debugowania i dokumentacji

3. **`def decorated_function(*args, **kwargs):`**
   - Wewnętrzna funkcja, która faktycznie wykonuje sprawdzenie autoryzacji
   - `*args, **kwargs` przekazuje wszystkie argumenty do oryginalnej funkcji

4. **Wyciąganie tokena z nagłówka:**
   ```python
   auth_header = request.headers['Authorization']
   token = auth_header.split(" ")[1]
   ```
   - Standardowy format JWT: `Authorization: Bearer eyJhbGc...`
   - Rozdzielamy po spacji: `["Bearer", "eyJhbGc..."]`
   - Bierzemy drugi element `[1]` - sam token

5. **Dekodowanie tokena JWT:**
   ```python
   data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
   ```
   - `jwt.decode()` weryfikuje podpis tokena używając `JWT_SECRET_KEY`
   - Jeśli token jest sfałszowany lub zmieniony - wyrzuci `InvalidTokenError`
   - Jeśli token wygasł - wyrzuci `ExpiredSignatureError`
   - `algorithms=['HS256']` określa algorytm szyfrowania
   - **HMAC-SHA256** - symetryczne szyfrowanie (ten sam klucz do enkrypcji i dekrypcji)

6. **Zapisanie ID użytkownika w kontekście Flask:**
   ```python
   g.user_id = current_user_id
   ```
   - `g` (global) to specjalny obiekt Flask dostępny w całym request lifecycle
   - Każdy request ma swój własny `g` (thread-safe)
   - Endpoint może później użyć `g.user_id` aby wiedzieć kto jest zalogowany

7. **Obsługa błędów:**
   - **401 Unauthorized** - brak tokena lub token nieprawidłowy
   - Każdy rodzaj błędu (brak tokena, wygasły, nieprawidłowy) zwraca 401
   - Ważne: nie zdradzamy szczegółów błędu (security przez obscurity)

**Jak używać dekoratora:**
```python
@app.route('/api/Customers')
@require_auth  # ← Dodanie dekoratora chroni endpoint
def get_customers():
    user_id = g.user_id  # Dostęp do ID zalogowanego użytkownika
    # ... logika endpointu
```

---

#### **Funkcja `get_current_user()` - Pobieranie Użytkownika**

```python
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
```

**Wyjaśnienie:**

1. **Po co ta funkcja?**
   - `@require_auth` tylko sprawdza czy użytkownik jest zalogowany
   - Ta funkcja **pobiera pełny obiekt User z bazy danych**
   - Potrzebna gdy endpoint musi znać szczegóły użytkownika (email, role, itp.)

2. **Dwuetapowe pobieranie:**
   - Najpierw próbuje pobrać `user_id` z `g` (jeśli był `@require_auth`)
   - Jeśli nie ma w `g` - dekoduje token ręcznie
   - Ta elastyczność pozwala używać funkcji nawet bez `@require_auth`

3. **`User.query.get(user_id)`**
   - SQLAlchemy query pobierające użytkownika po ID (primary key)
   - `get()` zwraca `None` jeśli nie znajdzie - bezpieczne

**Przykład użycia:**
```python
@app.route('/api/Profile')
@require_auth
def get_profile():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'username': user.username,
        'email': user.email,
        'role': user.role.name
    })
```

---

## 🔑 BACKEND - KONTROLER UWIERZYTELNIANIA

### **Plik: `backend-python/app/controllers/auth.py`**

#### **Endpoint `/login` - Logowanie Użytkownika**

```python
@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint logowania"""
    try:
        # 1. Pobierz dane z requestu
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Brak nazwy użytkownika lub hasła'}), 400

        # 2. Znajdź użytkownika w bazie danych
        user = User.query.filter_by(username=username).first()

        if not user:
            # Zapisz nieudaną próbę logowania
            login_history = LoginHistory(
                UserId=None,
                LoginTime=datetime.now(),
                IpAddress=request.remote_addr,
                UserAgent=request.headers.get('User-Agent', ''),
                Success=False
            )
            db.session.add(login_history)
            db.session.commit()

            return jsonify({'error': 'Nieprawidłowe dane logowania'}), 401

        # 3. Sprawdź hasło
        password_valid = check_password_hash(user.password_hash, password)

        if not password_valid:
            # Zapisz nieudaną próbę
            login_history = LoginHistory(
                UserId=user.id,
                LoginTime=datetime.now(),
                IpAddress=request.remote_addr,
                UserAgent=request.headers.get('User-Agent', ''),
                Success=False
            )
            db.session.add(login_history)
            db.session.commit()

            return jsonify({'error': 'Nieprawidłowe dane logowania'}), 401

        # 4. Generuj token JWT
        payload = {
            'user_id': user.id,
            'username': user.username,
            'role': user.role.name if user.role else 'User',
            'exp': datetime.utcnow() + timedelta(hours=24)
        }

        token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')

        # 5. Zapisz udaną próbę logowania
        login_history = LoginHistory(
            UserId=user.id,
            LoginTime=datetime.now(),
            IpAddress=request.remote_addr,
            UserAgent=request.headers.get('User-Agent', ''),
            Success=True
        )
        db.session.add(login_history)
        db.session.commit()

        # 6. Zwróć token i dane użytkownika
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
```

**Szczegółowe wyjaśnienie każdego kroku:**

### **Krok 1: Pobieranie danych z requestu**

```python
data = request.get_json()
username = data.get('username')
password = data.get('password')
```

- **`request.get_json()`** parsuje JSON z body requestu
- Frontend wysyła: `{"username": "admin", "password": "pass123"}`
- Otrzymujemy Python dict: `{'username': 'admin', 'password': 'pass123'}`
- **`data.get('username')`** bezpiecznie pobiera wartość (zwraca `None` jeśli brak klucza)

**Walidacja:**
```python
if not username or not password:
    return jsonify({'error': 'Brak nazwy użytkownika lub hasła'}), 400
```
- Sprawdzamy czy oba pola są wypełnione
- **400 Bad Request** - błąd po stronie klienta (niepoprawne dane)

---

### **Krok 2: Szukanie użytkownika w bazie**

```python
user = User.query.filter_by(username=username).first()
```

**Co się dzieje:**
1. `User.query` - rozpoczyna query na tabeli `users`
2. `.filter_by(username=username)` - SQL: `WHERE username = 'admin'`
3. `.first()` - zwraca pierwszy wynik lub `None`

**Alternatywne podejścia:**
- `.all()` - zwróciłoby listę wszystkich pasujących (ale username jest unique)
- `.filter(User.username == username)` - bardziej zaawansowana składnia

**Dlaczego używamy SQLAlchemy zamiast raw SQL?**
```python
# ❌ Raw SQL - podatne na SQL injection
query = f"SELECT * FROM users WHERE username = '{username}'"
cursor.execute(query)

# ✅ SQLAlchemy - automatyczna ochrona przed SQL injection
user = User.query.filter_by(username=username).first()
```

SQLAlchemy używa **parametryzowanych zapytań** (prepared statements):
```sql
-- SQLAlchemy generuje:
SELECT * FROM users WHERE username = ?
-- i przekazuje parametr oddzielnie, bezpiecznie
```

---

### **Krok 3: Weryfikacja hasła**

```python
password_valid = check_password_hash(user.password_hash, password)
```

**Jak działa `check_password_hash`:**

1. **W bazie danych przechowujemy hash, nie hasło:**
   ```
   Użytkownik wpisuje: "mypassword123"
   W bazie: "pbkdf2:sha256:260000$xyz..."
   ```

2. **Funkcja `check_password_hash` robi:**
   ```python
   # Pseudokod
   def check_password_hash(stored_hash, password):
       # Wyciągnij sól z hashowanego hasła
       salt = extract_salt(stored_hash)

       # Zhashuj wprowadzone hasło z tą samą solą
       new_hash = hash_with_salt(password, salt)

       # Porównaj hashe
       return new_hash == stored_hash
   ```

3. **Dlaczego nie można odwrócić hashu?**
   - Hash to funkcja jednostronna: `hash("password") = "abc123..."`
   - Nie da się zrobić: `unhash("abc123...") = "password"`
   - Można tylko porównać hashe: czy `hash(wprowadzone) == hash(zapisane)`

**Przykład bcrypt hash:**
```
$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyB3QK8J8yEu
│  │  │                    │
│  │  │                    └─ Hash (31 znaków)
│  │  └─ Sól (22 znaki)
│  └─ Koszt (2^12 = 4096 iteracji)
└─ Algorytm (bcrypt)
```

---

### **Krok 4: Generowanie tokena JWT**

```python
payload = {
    'user_id': user.id,
    'username': user.username,
    'role': user.role.name if user.role else 'User',
    'exp': datetime.utcnow() + timedelta(hours=24)
}

token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
```

**Struktura JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFkbWluIiwiZXhwIjoxNzA5MzI0ODAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
└────────── HEADER ──────────┘ └─────────────────────── PAYLOAD ───────────────────────┘ └──────────── SIGNATURE ──────────┘
```

**Rozkodowany token:**

**Header:**
```json
{
  "alg": "HS256",  // Algorytm: HMAC-SHA256
  "typ": "JWT"     // Typ tokena: JWT
}
```

**Payload:**
```json
{
  "user_id": 1,
  "username": "admin",
  "role": "Admin",
  "exp": 1709324800  // Timestamp wygaśnięcia (24h od teraz)
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET_KEY
)
```

**Dlaczego JWT jest bezpieczny:**
1. **Payload jest base64 encoded, NIE encrypted** - każdy może go odczytać
2. **Bezpieczeństwo zapewnia SIGNATURE** - nikt nie może go zmienić bez SECRET_KEY
3. Jeśli ktoś zmieni payload, signature się nie zgodzi → token odrzucony

**Przykład ataku:**
```
Atakujący zmienia:
{"user_id": 1, "role": "Admin"} → {"user_id": 1, "role": "SuperAdmin"}

Token wynikowy ma nieprawidłowy podpis:
verify_signature(token, SECRET_KEY) → False
Server odrzuca token → 401 Unauthorized
```

---

### **Krok 5: Zapisywanie historii logowania**

```python
login_history = LoginHistory(
    UserId=user.id,
    LoginTime=datetime.now(),
    IpAddress=request.remote_addr,
    UserAgent=request.headers.get('User-Agent', ''),
    Success=True
)
db.session.add(login_history)
db.session.commit()
```

**Po co zapisujemy historię:**
- **Audyt bezpieczeństwa** - kto i kiedy się logował
- **Wykrywanie podejrzanych aktywności** - logowania z nowych IP
- **Compliance** - wymogi prawne (RODO, SOX)
- **Debugging** - analiza problemów użytkowników

**`request.remote_addr`:**
- IP adres klienta: `192.168.1.100`, `127.0.0.1`
- Jeśli za proxy/load balancer: `request.headers.get('X-Forwarded-For')`

**`User-Agent`:**
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```
Zawiera:
- System operacyjny: Windows 10
- Przeglądarka: Chrome 120
- Silnik renderujący: WebKit

---

## ⚛️ FRONTEND WEB - KONTEKST AUTORYZACJI

### **Plik: `crm-ui/src/context/AuthContext.tsx`**

#### **Komponent `AuthProvider` - Provider Kontekstu**

```typescript
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { openModal } = useModal();

    useEffect(() => {
        // Pobieramy token JWT z localStorage przeglądarki
        const token = localStorage.getItem("token");
        if (token) {
            try {
                // Dekodujemy token JWT aby wyciągnąć dane użytkownika
                const decoded = jwtDecode<JwtPayload>(token);

                // Pobierz dane użytkownika z tokenu
                const username = decoded.username || decoded.sub;
                const role = decoded.role;

                // Ustawiamy dane użytkownika w stanie
                setUser({
                    username: username || '',
                    role: role || '',
                });
            } catch (error) {
                // W przypadku błędu dekodowania (token nieprawidłowy/wygasły)
                console.error("Błąd dekodowania tokena:", error);
                localStorage.removeItem("token");
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
```

**Szczegółowe wyjaśnienie:**

### **React Context API - Po co?**

**Problem bez Context:**
```typescript
// App.tsx
function App() {
  const [user, setUser] = useState(null);

  return <Dashboard user={user} setUser={setUser} />;
}

// Dashboard.tsx
function Dashboard({ user, setUser }) {
  return <Sidebar user={user} setUser={setUser} />;
}

// Sidebar.tsx
function Sidebar({ user, setUser }) {
  return <UserMenu user={user} setUser={setUser} />;
}

// UserMenu.tsx - w końcu używamy!
function UserMenu({ user, setUser }) {
  return <div>{user.name}</div>;
}
```
**Prop drilling** - przekazywanie props przez wiele poziomów

**Rozwiązanie z Context:**
```typescript
// App.tsx
<AuthProvider>
  <Dashboard />
</AuthProvider>

// UserMenu.tsx - bezpośredni dostęp!
function UserMenu() {
  const { user } = useAuth();
  return <div>{user.name}</div>;
}
```

---

### **localStorage - Przechowywanie Tokena**

```typescript
const token = localStorage.getItem("token");
```

**Jak działa localStorage:**
- **Browser API** do przechowywania danych w przeglądarce
- Dane są **persistent** - zostają po zamknięciu przeglądarki
- **5-10MB** limitu (zależy od przeglądarki)
- **Synchroniczny API** - blokuje JS thread

**Alternatywy:**
1. **sessionStorage** - usuwa dane po zamknięciu karty
2. **Cookies** - automatycznie wysyłane z każdym requestem
3. **IndexedDB** - duża baza danych w przeglądarce

**Bezpieczeństwo localStorage:**
```typescript
// ✅ Bezpieczne dla JWT w header Authorization
localStorage.setItem("token", jwt);

// ❌ Podatne na XSS (Cross-Site Scripting)
// Jeśli atakujący wstrzyknie JS: localStorage.getItem("token")
```

**Ochrona przed XSS:**
1. **Content Security Policy (CSP)** - blokuje nieautoryzowany JS
2. **React automatycznie escapuje dane** - chroni przed `<script>` injection
3. **Sanityzacja inputów** - oczyszczanie danych od użytkownika

---

### **jwt-decode - Dekodowanie Tokena**

```typescript
const decoded = jwtDecode<JwtPayload>(token);
```

**Co robi `jwtDecode`:**
```typescript
// Token JWT:
"eyJhbGc...xyz"

// Po dekodowaniu:
{
  user_id: 1,
  username: "admin",
  role: "Admin",
  exp: 1709324800,
  iat: 1709238400
}
```

**WAŻNE:**
- **`jwtDecode` NIE weryfikuje podpisu** - tylko dekoduje base64
- Weryfikacja podpisu odbywa się na **backendzie**
- Frontend tylko **czyta** dane z tokenu dla UX (np. pokaż nazwę użytkownika)

**Weryfikacja wygaśnięcia:**
```typescript
if (decoded.exp * 1000 < Date.now()) {
  // Token wygasł
  localStorage.removeItem("token");
}
```
- `decoded.exp` to **Unix timestamp w sekundach**
- `Date.now()` zwraca **milisekundy**
- Dlatego mnożymy: `exp * 1000`

---

### **Axios Interceptor - Globalna Obsługa Błędów**

```typescript
const interceptor = axios.interceptors.response.use(
    response => response,  // Udane odpowiedzi - przekaż dalej
    error => {
        if (error.response) {
            const status = error.response.status;

            // Dla błędów 401 (Unauthorized) - wyloguj użytkownika
            if (status === 401) {
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
                setUser(null);
                return Promise.reject(error);
            }

            // Dla innych błędów - pokaż modal
            const message = error.response.data?.message || `Błąd serwera: ${status}`;
            openModal({
                type: 'error',
                title: `Błąd ${status}`,
                message: message,
            });
        }
        return Promise.reject(error);
    }
);
```

**Co to jest Interceptor:**
- **Middleware dla Axios** - przechwytuje wszystkie requesty/responses
- Uruchamia się **przed** `.then()` lub `.catch()` w komponencie
- Pozwala na **globalną logikę** bez duplikowania w każdym komponencie

**Flow z interceptorem:**
```
Component: api.get('/Customers')  // Używamy api, nie axios bezpośrednio
    ↓
Request Interceptor (dodaje token z localStorage)
    ↓
HTTP Request → Server (http://localhost:5000/api/Customers)
    ↓
HTTP Response ← Server
    ↓
Response Interceptor (sprawdza błędy, obsługuje 401)
    ↓
Component: .then(response => ...) lub .catch(error => ...)
```

**Dlaczego 401 → logout:**
- **401 Unauthorized** = token nieprawidłowy/wygasły
- Użytkownik musi się zalogować ponownie
- Automatyczny logout poprawia UX (nie trzeba klikać "wyloguj")

---

## 📱 MOBILE - KONTEKST AUTORYZACJI

### **Plik: `crm-mobile/context/AuthContext.tsx`**

#### **SecureStore - Bezpieczne Przechowywanie Tokena**

```typescript
const storage = {
    async setItem(key: string, value: string) {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    },
    async getItem(key: string) {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        } else {
            return await SecureStore.getItemAsync(key);
        }
    },
    async deleteItem(key: string) {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    },
};
```

**Dlaczego SecureStore jest bezpieczniejszy:**

**Android:**
- Używa **Android Keystore** - hardware-backed encryption
- Klucze przechowywane w **TEE (Trusted Execution Environment)** lub **Secure Element**
- **Biometric authentication** można włączyć

**iOS:**
- Używa **iOS Keychain** - zaszyfrowany storage
- Dane są **powiązane z aplikacją** - inne apki nie mają dostępu
- **Touch ID/Face ID** integracja

**localStorage (web):**
- **Niezaszyfrowane** - przechowywane jako plain text
- Dostępne przez JavaScript - podatne na XSS
- Ale: wystarczające dla web (security przez HTTPS + CSP)

---

#### **Funkcja `login()` - Logowanie w Mobile**

```typescript
const login = async (username: any, password: any) => {
    try {
        const result = await axios.post('/api/Auth/login', { username, password });
        const token = result.data.token;

        await storage.setItem(TOKEN_KEY, token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setAuthState({
            token: token,
            isAuthenticated: true,
            isLoading: false,
        });
    } catch (e) {
        console.error("Błąd logowania:", e);
        throw new Error("Logowanie nie powiodło się");
    }
};
```

**Szczegóły:**

1. **`await axios.post('/api/Auth/login', ...)`**
   - UWAGA: W mobile **używamy axios bezpośrednio** (w AuthContext skonfigurowane `axios.defaults.baseURL`)
   - W web frontend używamy `api` z `services/api.ts`
   - POST request do endpointu logowania
   - Wysyła JSON: `{"username": "admin", "password": "pass"}`
   - Zwraca: `{"token": "eyJhbGc...", "user": {...}}`

2. **`await storage.setItem(TOKEN_KEY, token)`**
   - Zapisuje token w SecureStore (na urządzeniu)
   - **Async operation** - czekamy na zakończenie
   - Token przetrwa zamknięcie aplikacji

3. **`axios.defaults.headers.common['Authorization']`**
   - Ustawia **globalny header dla wszystkich requestów**
   - Każdy kolejny request będzie miał: `Authorization: Bearer eyJhbGc...`
   - Nie trzeba ręcznie dodawać tokena do każdego zapytania

**Różnica między web a mobile:**
```typescript
// Web - synchroniczny
localStorage.setItem("token", token);

// Mobile - asynchroniczny (trzeba await)
await SecureStore.setItemAsync("token", token);
```

---

### **useEffect - Automatyczne Logowanie**

```typescript
useEffect(() => {
    const loadToken = async () => {
        const token = await storage.getItem(TOKEN_KEY);
        if (token) {
            try {
                const decodedToken: any = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    // Token wygasł
                    await storage.deleteItem(TOKEN_KEY);
                    setAuthState({ token: null, isAuthenticated: false, isLoading: false });
                } else {
                    // Token OK - automatyczne logowanie
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    setAuthState({ token: token, isAuthenticated: true, isLoading: false });
                }
            } catch (e) {
                await storage.deleteItem(TOKEN_KEY);
                setAuthState({ token: null, isAuthenticated: false, isLoading: false });
            }
        } else {
            setAuthState({ token: null, isAuthenticated: false, isLoading: false });
        }
    };
    loadToken();
}, []);
```

**Flow automatycznego logowania:**
```
User otwiera aplikację
    ↓
useEffect uruchamia loadToken()
    ↓
Sprawdź czy jest token w SecureStore
    ↓
Jeśli TAK → Zdekoduj token
    ↓
Sprawdź czy token NIE wygasł
    ↓
Jeśli OK → Ustaw Authorization header
    ↓
Ustaw isAuthenticated = true
    ↓
User widzi dashboard (bez logowania)
```

**Po co to?**
- **Lepszy UX** - user nie musi logować się za każdym razem
- **Persist session** - sesja przetrwa zamknięcie aplikacji
- **24h token** - przez 24h od logowania nie trzeba wpisywać hasła

---

## 📊 PODSUMOWANIE FLOW AUTORYZACJI

### **Pełny flow: Od logowania do chronionego requestu**

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. USER LOGUJE SIĘ                                                  │
└─────────────────────────────────────────────────────────────────────┘
    Frontend Web: api.post('/Auth/login', {username, password})
    Frontend Mobile: axios.post('/api/Auth/login', {username, password})
        ↓
    Backend: auth.py → login()
        ↓
    Sprawdź username w bazie
        ↓
    Weryfikuj hasło: check_password_hash(hash, password)
        ↓
    Generuj JWT: jwt.encode(payload, SECRET_KEY)
        ↓
    Zapisz historię logowania
        ↓
    Zwróć: {token: "eyJhbGc...", user: {...}}
        ↓
    Frontend Web: localStorage.setItem("token", token)
    Frontend Mobile: SecureStore.setItemAsync("my-jwt", token)
        ↓
    Ustaw header dla przyszłych requestów

┌─────────────────────────────────────────────────────────────────────┐
│ 2. USER OTWIERA STRONĘ Z KLIENTAMI                                  │
└─────────────────────────────────────────────────────────────────────┘
    Frontend Web: api.get('/Customers')
    Frontend Mobile: axios.get('/api/Customers')
        ↓
    Request Interceptor automatycznie dodaje: Authorization: Bearer eyJhbGc...
        ↓
    Backend: customers.py → get_customers()
        ↓
    Dekorator: @require_auth
        ↓
    Wyciągnij token z nagłówka Authorization
        ↓
    Dekoduj: jwt.decode(token, SECRET_KEY)
        ↓
    Sprawdź czy token NIE wygasł
        ↓
    Zapisz user_id w g.user_id
        ↓
    Wywołaj oryginalną funkcję: get_customers()
        ↓
    Pobierz klientów z bazy: Customer.query.all()
        ↓
    Zwróć: [{id: 1, name: "Jan"}, ...]
        ↓
    Frontend: Wyświetl listę klientów

┌─────────────────────────────────────────────────────────────────────┐
│ 3. TOKEN WYGASA                                                      │
└─────────────────────────────────────────────────────────────────────┘
    Frontend: api.get('/Customers') lub axios.get('/api/Customers')
        ↓
    Backend: jwt.decode(token) → ExpiredSignatureError
        ↓
    Zwróć: 401 Unauthorized
        ↓
    Frontend: Response Interceptor przechwytuje 401
        ↓
    localStorage.removeItem('token')
        ↓
    setUser(null)
        ↓
    Redirect do /login
```

---

**Ten dokument zawiera szczegółowe wyjaśnienia najważniejszych metod i funkcji w systemie CRM. Każda funkcja jest opisana krok po kroku z przykładami kodu i wyjaśnieniami technicznymi.**
