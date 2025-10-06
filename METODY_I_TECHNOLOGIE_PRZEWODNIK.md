# 📚 PRZEWODNIK PO METODACH I TECHNOLOGIACH - System CRM

> **Cel dokumentu**: Kompletny przewodnik po wszystkich metodach, technologiach i wzorcach projektowych użytych w systemie CRM. Idealny do nauki i obrony pracy inżynierskiej.

**Data aktualizacji**: 2025-10-06
**Autor**: Projekt inżynierski - System CRM

---

## 📑 SPIS TREŚCI

1. [Architektura systemu](#architektura-systemu)
2. [Backend - Python/Flask](#backend---pythonflask)
3. [Frontend Web - React/TypeScript](#frontend-web---reacttypescript)
4. [Aplikacja Mobilna - React Native/Expo](#aplikacja-mobilna---react-nativeexpo)
5. [Baza danych - SQLite](#baza-danych---sqlite)
6. [Autoryzacja i bezpieczeństwo](#autoryzacja-i-bezpieczeństwo)
7. [Wzorce projektowe](#wzorce-projektowe)
8. [Metody i algorytmy](#metody-i-algorytmy)
9. [Biblioteki i narzędzia](#biblioteki-i-narzędzia)
10. [Pytania na obronę - FAQ](#pytania-na-obronę---faq)

---

## 1. ARCHITEKTURA SYSTEMU

### 1.1 Wzorzec: **Architektura trójwarstwowa (3-tier)**

```
┌─────────────────────────────────────────┐
│  WARSTWA PREZENTACJI                    │
│  - Frontend Web (React)                 │
│  - Aplikacja mobilna (React Native)     │
└────────────────┬────────────────────────┘
                 │ HTTP/REST API
┌────────────────▼────────────────────────┐
│  WARSTWA LOGIKI BIZNESOWEJ              │
│  - Backend (Python/Flask)               │
│  - Kontrolery, Serwisy                  │
└────────────────┬────────────────────────┘
                 │ ORM (SQLAlchemy)
┌────────────────▼────────────────────────┐
│  WARSTWA DANYCH                         │
│  - Baza danych (SQLite)                 │
│  - Modele danych                        │
└─────────────────────────────────────────┘
```

**Dlaczego ta architektura?**
- ✅ Separacja odpowiedzialności (Separation of Concerns)
- ✅ Łatwa wymiana komponentów (np. SQLite → PostgreSQL)
- ✅ Skalowalność - każda warstwa może być skalowana niezależnie
- ✅ Testowanie - każda warstwa testowana osobno

**Pytania na obronę**:
- **Q**: Dlaczego wybrałeś architekturę 3-warstwową?
- **A**: Bo zapewnia separację odpowiedzialności, ułatwia testowanie i skalowanie. Frontend nie zna szczegółów bazy danych, backend nie wie jak wygląda UI.

---

## 2. BACKEND - PYTHON/FLASK

### 2.1 Framework: **Flask**

**Co to jest Flask?**
- Mikro-framework do tworzenia aplikacji webowych w Pythonie
- Minimalistyczny - zawiera tylko niezbędne funkcje
- Rozszerzalny przez biblioteki (Flask-CORS, Flask-JWT)

**Przykład użycia**:
```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello World'})
```

**Dlaczego Flask, a nie Django?**
- ✅ Lżejszy - nie ma niepotrzebnych funkcji
- ✅ Prostszy do nauki
- ✅ Większa kontrola nad strukturą projektu
- ✅ Idealny dla REST API

### 2.2 ORM: **SQLAlchemy**

**Co to jest ORM?**
- Object-Relational Mapping
- Tłumaczy obiekty Pythona na zapytania SQL
- Nie musisz pisać surowego SQL

**Przykład**:
```python
# Zamiast SQL:
# SELECT * FROM Customers WHERE id = 1

# Piszesz:
customer = Customer.query.get(1)
```

**Definicja modelu**:
```python
from app.database import db

class Customer(db.Model):
    __tablename__ = 'Customers'

    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(100), nullable=False)
    Email = db.Column(db.String(100), unique=True)
    Phone = db.Column(db.String(20))
```

**Metody SQLAlchemy używane w projekcie**:

| Metoda | Co robi | Przykład |
|--------|---------|----------|
| `query.get(id)` | Pobiera rekord po ID | `Customer.query.get(32)` |
| `query.all()` | Pobiera wszystkie rekordy | `Customer.query.all()` |
| `query.filter_by()` | Filtruje wyniki | `Task.query.filter_by(UserId=2)` |
| `query.first()` | Pobiera pierwszy wynik | `User.query.filter_by(username='admin').first()` |
| `db.session.add()` | Dodaje nowy rekord | `db.session.add(new_customer)` |
| `db.session.commit()` | Zapisuje zmiany | `db.session.commit()` |
| `db.session.rollback()` | Cofa zmiany | `db.session.rollback()` |
| `db.session.delete()` | Usuwa rekord | `db.session.delete(customer)` |

**Pytania na obronę**:
- **Q**: Co to jest ORM i jakie ma zalety?
- **A**: ORM to warstwa abstrakcji między kodem a bazą danych. Zalety: nie piszemy SQL, kod jest czytelniejszy, łatwiejsza migracja między bazami, zabezpieczenie przed SQL Injection.

### 2.3 Wzorzec: **Blueprint (Moduły)**

**Co to jest Blueprint?**
- Sposób organizacji kodu Flask w moduły
- Każda funkcjonalność w osobnym pliku

**Struktura projektu**:
```
app/
├── controllers/
│   ├── auth.py          # Logowanie, rejestracja
│   ├── customers.py     # CRUD klientów
│   ├── tasks.py         # CRUD zadań
│   ├── invoices.py      # Faktury
│   └── notifications.py # Powiadomienia
└── __init__.py          # Rejestracja blueprintów
```

**Przykład Blueprint**:
```python
# controllers/customers.py
from flask import Blueprint

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/', methods=['GET'])
def get_customers():
    # Logika pobierania klientów
    pass

# __init__.py
from app.controllers.customers import customers_bp
app.register_blueprint(customers_bp, url_prefix='/api/Customers')
```

**Dlaczego Blueprint?**
- ✅ Kod podzielony na moduły (łatwiej znaleźć)
- ✅ Możliwość pracy wielu programistów równolegle
- ✅ Łatwiejsze testowanie pojedynczych modułów

### 2.4 Middleware: **Dekoratory autoryzacji**

**Co to jest Middleware?**
- Kod wykonywany przed/po głównej funkcji
- W Flasku: dekoratory

**Dekorator `@require_auth`**:
```python
from functools import wraps
import jwt

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Brak tokenu'}), 401

        try:
            # Weryfikuj token
            payload = jwt.decode(token.replace('Bearer ', ''),
                               Config.JWT_SECRET_KEY,
                               algorithms=['HS256'])
            request.user_id = payload['user_id']
        except:
            return jsonify({'error': 'Nieprawidłowy token'}), 401

        return f(*args, **kwargs)
    return decorated
```

**Użycie**:
```python
@customers_bp.route('/', methods=['GET'])
@require_auth  # ← To sprawdza token PRZED wykonaniem funkcji
def get_customers():
    user_id = get_current_user_id()  # Pobierz ID z tokenu
    # ... reszta logiki
```

**Pytania na obronę**:
- **Q**: Co to jest dekorator w Pythonie?
- **A**: To funkcja, która "opakowuje" inną funkcję i dodaje jej funkcjonalność. W moim projekcie używam `@require_auth` do automatycznej weryfikacji tokenów JWT.

---

## 3. FRONTEND WEB - REACT/TYPESCRIPT

### 3.1 Framework: **React**

**Co to jest React?**
- Biblioteka JavaScript do budowy interfejsów
- Komponentowy - UI składa się z małych, reużywalnych komponentów
- Deklaratywny - opisujesz "jak ma wyglądać", nie "jak to zrobić"

**Przykład komponentu**:
```tsx
function CustomerCard({ customer }) {
    return (
        <div className="card">
            <h3>{customer.name}</h3>
            <p>{customer.email}</p>
        </div>
    );
}
```

### 3.2 Język: **TypeScript**

**Dlaczego TypeScript zamiast JavaScript?**
- ✅ Statyczne typowanie - błędy wykrywane przed uruchomieniem
- ✅ Lepsze podpowiedzi w IDE (IntelliSense)
- ✅ Kod bardziej czytelny i bezpieczny

**Przykład**:
```typescript
// JavaScript - wszystko jest `any`, łatwo o błąd
function addCustomer(name, email) {
    return { name, email };
}

// TypeScript - typy wymuszają poprawność
interface Customer {
    name: string;
    email: string;
}

function addCustomer(name: string, email: string): Customer {
    return { name, email };
}
```

### 3.3 Wzorzec: **Hooki React**

**Co to są hooki?**
- Funkcje specjalne React do zarządzania stanem i efektami ubocznymi
- Używane w komponentach funkcyjnych

**Najważniejsze hooki w projekcie**:

#### **useState** - zarządzanie stanem lokalnym
```tsx
const [customers, setCustomers] = useState<Customer[]>([]);
//     ↑ aktualna wartość
//                  ↑ funkcja do zmiany wartości
```

**Jak działa?**
- Przechowuje dane komponentu
- Zmiana stanu → ponowne renderowanie komponentu

**Przykład z projektu**:
```tsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Gdy pobierasz dane:
setLoading(true);
try {
    const data = await api.get('/Customers');
    setCustomers(data);
} catch (err) {
    setError(err.message);
} finally {
    setLoading(false);
}
```

#### **useEffect** - efekty uboczne
```tsx
useEffect(() => {
    // Kod wykonywany po renderowaniu
    fetchCustomers();
}, []);  // ← [] = tylko raz (po zamontowaniu)
```

**Kiedy używać useEffect?**
- Pobieranie danych z API
- Subskrypcje (websockets)
- Timery (setInterval)
- Manipulacja DOM

**Przykład z projektu**:
```tsx
useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
        const response = await api.get('/user/tasks');
        setTasks(response.data);
    };

    fetchData();
}, [token]); // ← uruchom ponownie gdy zmieni się `token`
```

#### **useCallback** - memoizacja funkcji
```tsx
const fetchCustomers = useCallback(async () => {
    const response = await api.get('/Customers');
    setCustomers(response.data);
}, []);  // Funkcja nie zmieni się między renderowaniami
```

**Dlaczego useCallback?**
- ✅ Zapobiega niepotrzebnemu ponownemu tworzeniu funkcji
- ✅ Optymalizacja wydajności
- ✅ Niezbędne gdy funkcja jest zależnością useEffect

### 3.4 Wzorzec: **Context API**

**Problem**: Przekazywanie danych przez wiele komponentów ("prop drilling")

```tsx
// ❌ Bez Context - męczące
<App token={token}>
  <Layout token={token}>
    <Header token={token}>
      <UserMenu token={token} />
    </Header>
  </Layout>
</App>
```

**Rozwiązanie**: Context API

```tsx
// ✅ Z Context - elegancko
<AuthProvider>  {/* Token dostępny wszędzie */}
  <App>
    <Layout>
      <Header>
        <UserMenu />  {/* Pobiera token z useAuth() */}
      </Header>
    </Layout>
  </App>
</AuthProvider>
```

**Implementacja Context (przykład z projektu)**:
```tsx
// context/AuthContext.tsx
const AuthContext = createContext<AuthContextType>({
    token: null,
    isAuthenticated: false,
    login: async () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);

    const login = async (username, password) => {
        const response = await api.post('/Auth/login', { username, password });
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook do używania context
export const useAuth = () => useContext(AuthContext);
```

**Użycie**:
```tsx
function Header() {
    const { token, logout } = useAuth();

    return (
        <div>
            <p>Zalogowany jako: {token}</p>
            <button onClick={logout}>Wyloguj</button>
        </div>
    );
}
```

### 3.5 Wzorzec: **Axios Interceptors**

**Co to są interceptory?**
- Middleware dla zapytań HTTP
- Wykonywane PRZED wysłaniem lub PO otrzymaniu odpowiedzi

**Przykład z projektu (services/api.ts)**:
```typescript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Interceptor REQUEST - dodaje token do każdego zapytania
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Interceptor RESPONSE - obsługuje błędy 401
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Automatyczne wylogowanie
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
```

**Korzyści**:
- ✅ Nie musisz ręcznie dodawać tokena w każdym zapytaniu
- ✅ Centralne zarządzanie błędami
- ✅ Kod DRY (Don't Repeat Yourself)

**Pytania na obronę**:
- **Q**: Dlaczego używasz interceptorów zamiast dodawać token ręcznie?
- **A**: Bo interceptory wykonują się automatycznie dla każdego zapytania. Unikam duplikacji kodu i błędów - nie mogę zapomnieć dodać tokena.

---

## 4. APLIKACJA MOBILNA - REACT NATIVE/EXPO

### 4.1 Framework: **React Native**

**Czym różni się React Native od React?**

| Cecha | React (Web) | React Native (Mobile) |
|-------|-------------|----------------------|
| Renderowanie | DOM (`<div>`, `<p>`) | Natywne komponenty (`<View>`, `<Text>`) |
| Stylowanie | CSS | StyleSheet (podobny do CSS) |
| Nawigacja | React Router | Expo Router |
| Storage | localStorage | SecureStore / AsyncStorage |
| API | fetch/axios | fetch/axios (to samo!) |

**Przykład komponentu**:
```tsx
// React (Web)
<div className="container">
    <p>Hello</p>
</div>

// React Native (Mobile)
<View style={styles.container}>
    <Text>Hello</Text>
</View>
```

### 4.2 Platforma: **Expo**

**Co to jest Expo?**
- Zestaw narzędzi do budowy aplikacji React Native
- Nie musisz konfigurować Xcode/Android Studio
- Szybkie testowanie przez aplikację Expo Go

**Kluczowe biblioteki Expo w projekcie**:

| Biblioteka | Do czego służy | Przykład użycia |
|-----------|----------------|-----------------|
| `expo-router` | Routing/nawigacja | `router.push('/customers')` |
| `expo-secure-store` | Bezpieczne przechowywanie (token) | `SecureStore.setItemAsync('token', jwt)` |
| `expo-file-system` | Zarządzanie plikami | Pobieranie PDF faktur |
| `expo-sharing` | Udostępnianie plików | Wysyłanie faktury mailem |

### 4.3 Nawigacja: **Expo Router (File-based)**

**Jak działa routing oparty na plikach?**

```
app/
├── (tabs)/
│   ├── index.tsx          → / (zadania)
│   ├── customers.tsx      → /customers
│   └── invoices.tsx       → /invoices
├── customer/
│   └── [id].tsx           → /customer/32 (dynamiczny)
├── add-task.tsx           → /add-task
└── login.tsx              → /login
```

**Przykład nawigacji**:
```tsx
import { useRouter } from 'expo-router';

function CustomerList() {
    const router = useRouter();

    return (
        <TouchableOpacity
            onPress={() => router.push({
                pathname: '/customer/[id]',
                params: { id: 32 }
            })}
        >
            <Text>Zobacz klienta</Text>
        </TouchableOpacity>
    );
}
```

### 4.4 Wzorzec: **SecureStore dla tokenów JWT**

**Problem**: `localStorage` nie istnieje w React Native

**Rozwiązanie**: `expo-secure-store` (szyfrowane przechowywanie)

**Implementacja (context/AuthContext.tsx)**:
```tsx
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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
    }
};
```

**Pytania na obronę**:
- **Q**: Dlaczego używasz SecureStore zamiast AsyncStorage?
- **A**: Bo SecureStore szyfruje dane, co jest konieczne dla tokenów JWT. AsyncStorage przechowuje dane w plain text - niebezpieczne dla danych wrażliwych.

---

## 5. BAZA DANYCH - SQLITE

### 5.1 Dlaczego SQLite?

**Zalety**:
- ✅ Brak instalacji serwera - to jeden plik
- ✅ Łatwe backupy - skopiuj plik
- ✅ Idealne dla małych/średnich aplikacji
- ✅ Szybkie (wszystko w pamięci)

**Wady** (trzeba znać!):
- ❌ Brak równoczesnych zapisów (1 writer)
- ❌ Brak zaawansowanych funkcji (PostgreSQL ma więcej)
- ❌ Limit rozmiaru ~140 TB (wystarczy dla CRM)

### 5.2 Struktura bazy

**Główne tabele**:
```
Customers      - Klienci
Users          - Użytkownicy systemu
Tasks          - Zadania
Invoices       - Faktury
InvoiceItems   - Pozycje faktur
Services       - Usługi/Produkty
Payments       - Płatności
Activities     - Historia aktywności
Notifications  - Powiadomienia
Reminders      - Przypomnienia
```

**Relacje**:
```
Customer 1 -------- N Task
Customer 1 -------- N Invoice
Invoice  1 -------- N InvoiceItem
InvoiceItem N ---- 1 Service
```

### 5.3 Migracje vs Skrypt tworzący

**W projekcie**: Skrypt `init_db.py` (nie migracje)

```python
# init_db.py
from app import create_app
from app.database import db

app = create_app()
with app.app_context():
    db.drop_all()  # Usuń stare tabele
    db.create_all() # Stwórz nowe
```

**Dlaczego nie Alembic (migracje)?**
- To projekt edukacyjny - prostota > zaawansowanie
- Łatwe "zaczynanie od zera" podczas testowania
- W produkcji używałbym Alembic

**Pytania na obronę**:
- **Q**: Czy w produkcji użyłbyś SQLite?
- **A**: Nie dla dużej aplikacji. SQLite jest świetne dla prototypów i małych systemów (do ~100k rekordów). Dla produkcji wybrałbym PostgreSQL (wsparcie dla wielu użytkowników, replikacja, pełny ACID).

---

## 6. AUTORYZACJA I BEZPIECZEŃSTWO

### 6.1 JWT (JSON Web Token)

**Co to jest JWT?**
- Token zakodowany w formacie JSON
- Składa się z 3 części oddzielonych kropkami

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MjM5Nzg4MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
└────────────── HEADER ──────────────┘ └────────── PAYLOAD ──────────┘ └────────── SIGNATURE ─────────┘
```

**Struktura**:
1. **Header** - algorytm (HS256) i typ (JWT)
2. **Payload** - dane (user_id, role, exp)
3. **Signature** - podpis (weryfikacja autentyczności)

**Generowanie JWT (backend)**:
```python
import jwt
from datetime import datetime, timedelta

def generate_token(user_id, username, role):
    payload = {
        'user_id': user_id,
        'username': username,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=24)  # Wygasa po 24h
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token
```

**Weryfikacja JWT (middleware)**:
```python
def require_auth(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization').replace('Bearer ', '')

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            request.user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token wygasł'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Nieprawidłowy token'}), 401

        return f(*args, **kwargs)
    return decorated
```

**Pytania na obronę**:
- **Q**: Dlaczego JWT, a nie sesje?
- **A**: JWT jest stateless - serwer nie musi przechowywać sesji. Skaluje się lepiej (możliwość load balancingu). Token zawiera wszystkie potrzebne dane.

- **Q**: Czy JWT jest bezpieczne?
- **A**: Tak, pod warunkiem: (1) używasz HTTPS, (2) SECRET_KEY jest tajny, (3) tokeny mają krótki czas życia (exp), (4) nie przechowujesz wrażliwych danych w payload (są widoczne!).

### 6.2 Hashowanie haseł: **bcrypt**

**Nigdy nie przechowuj haseł w plaintext!**

```python
import bcrypt

# Rejestracja - hashowanie hasła
password = "moje_haslo"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
# Zapisz `hashed` do bazy

# Logowanie - weryfikacja hasła
stored_hash = user.PasswordHash  # Z bazy danych
if bcrypt.checkpw(password.encode('utf-8'), stored_hash):
    print("Hasło poprawne!")
else:
    print("Hasło nieprawidłowe!")
```

**Dlaczego bcrypt?**
- ✅ Wolny algorytm (utrudnia brute-force)
- ✅ Salt automatycznie generowany
- ✅ Odporny na rainbow tables

### 6.3 CORS (Cross-Origin Resource Sharing)

**Problem**: Przeglądarka blokuje zapytania między różnymi domenami

```
Frontend: http://localhost:3000
Backend:  http://localhost:5000

❌ CORS Error: Origin 'http://localhost:3000' blocked!
```

**Rozwiązanie**: `Flask-CORS`

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])  # Pozwól tylko frontendowi
```

**Pytania na obronę**:
- **Q**: Co to jest CORS i dlaczego jest potrzebny?
- **A**: CORS to mechanizm bezpieczeństwa przeglądarki. Zapobiega atakom typu CSRF. Muszę go skonfigurować, bo frontend i backend działają na różnych portach (3000 vs 5000).

---

## 7. WZORCE PROJEKTOWE

### 7.1 MVC (Model-View-Controller) - częściowo

**Struktura backendu**:
```
Model      → app/models/         (Customer, Task, Invoice)
View       → Frontend (React)    (CustomerList, TaskCard)
Controller → app/controllers/    (customers_bp, tasks_bp)
```

**Nie jest to czysty MVC**, bo:
- View jest osobną aplikacją (frontend)
- Backend = REST API (zwraca JSON, nie HTML)

**Bardziej precyzyjnie**: **API-First Architecture**

### 7.2 Repository Pattern (w ORM)

**Co to jest Repository?**
- Warstwa abstrakcji nad bazą danych
- Ukrywa szczegóły implementacji

**Przykład** (nie zaimplementowany explicite, ale SQLAlchemy to robi):
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
```

**W projekcie**: SQLAlchemy to robi automatycznie (`Customer.query.*`)

### 7.3 Singleton Pattern (dla bazy danych)

**Co to jest Singleton?**
- Wzorzec zapewniający jedną instancję klasy

**W projekcie**: `db = SQLAlchemy()` (jedna instancja)

```python
# app/database.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()  # ← Singleton

# Wszędzie importujesz TĘ SAMĄ instancję
from app.database import db
```

### 7.4 Factory Pattern (dla Flask app)

```python
# app/__init__.py
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)

    # Rejestracja blueprintów
    from app.controllers.auth import auth_bp
    from app.controllers.customers import customers_bp
    app.register_blueprint(auth_bp, url_prefix='/api/Auth')
    app.register_blueprint(customers_bp, url_prefix='/api/Customers')

    return app
```

**Dlaczego Factory?**
- ✅ Łatwe testowanie (różne konfiguracje)
- ✅ Możliwość wielu instancji (dev, test, prod)

**Pytania na obronę**:
- **Q**: Jakie wzorce projektowe użyłeś?
- **A**: (1) MVC/API-First dla struktury, (2) Repository przez ORM, (3) Singleton dla bazy, (4) Factory dla aplikacji Flask, (5) Decorator dla middleware autoryzacji, (6) Context API dla React.

---

## 8. METODY I ALGORYTMY

### 8.1 Generowanie PDF faktur: **ReportLab**

**Algorytm tworzenia PDF**:
```python
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO

def create_invoice_pdf(invoice):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)

    # 1. Nagłówek
    pdf.drawString(50, 800, f"Faktura nr {invoice.Number}")

    # 2. Dane klienta
    pdf.drawString(50, 750, f"Klient: {invoice.customer.Name}")

    # 3. Tabela pozycji
    y = 700
    for item in invoice.items:
        pdf.drawString(50, y, f"{item.service.Name}")
        pdf.drawString(300, y, f"{item.Quantity} x {item.UnitPrice}")
        y -= 20

    # 4. Suma
    pdf.drawString(300, y-20, f"SUMA: {invoice.TotalAmount} PLN")

    pdf.save()
    buffer.seek(0)
    return buffer
```

### 8.2 Generowanie umów: **python-docx**

**Algorytm zastępowania placeholderów**:
```python
from docx import Document

def generate_contract(template_path, data):
    doc = Document(template_path)

    # Zastąp placeholdery w paragrafach
    for paragraph in doc.paragraphs:
        for key, value in data.items():
            if f"{{{key}}}" in paragraph.text:
                paragraph.text = paragraph.text.replace(f"{{{key}}}", str(value))

    # Zastąp w tabelach
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for key, value in data.items():
                    if f"{{{key}}}" in cell.text:
                        cell.text = cell.text.replace(f"{{{key}}}", str(value))

    # Zapisz
    output = BytesIO()
    doc.save(output)
    return output
```

### 8.3 System przypomnień: **Polling**

**Algorytm sprawdzania przypomnień** (mobile):
```tsx
useEffect(() => {
    const checkReminders = () => {
        const now = new Date();

        reminders.forEach(reminder => {
            const reminderDate = new Date(reminder.remind_at);

            // Czy to TEN sam dzień, godzina i minuta?
            if (reminderDate.getDate() === now.getDate() &&
                reminderDate.getHours() === now.getHours() &&
                reminderDate.getMinutes() === now.getMinutes()) {

                Alert.alert('⏰ Przypomnienie', reminder.note);
            }
        });
    };

    // Sprawdź co minutę
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
}, [reminders]);
```

**Dlaczego polling, a nie WebSockets?**
- Prostsze w implementacji
- Wystarczające dla przypomnień (nie real-time chat)
- Mniejsze obciążenie serwera

### 8.4 Wyszukiwanie: **Filtrowanie po stronie klienta**

**Algorytm wyszukiwania klientów** (frontend):
```tsx
const searchCustomers = (query: string) => {
    if (query.trim() === '') {
        return allCustomers;  // Brak filtra = wszyscy
    }

    const lowercased = query.toLowerCase();

    return allCustomers.filter(customer =>
        customer.name.toLowerCase().includes(lowercased) ||
        customer.email.toLowerCase().includes(lowercased) ||
        (customer.nip && customer.nip.includes(query))
    );
};
```

**Dlaczego frontend, a nie backend?**
- ✅ Szybsze (brak opóźnienia sieciowego)
- ✅ Mniej obciążenia serwera
- ✅ Wyszukiwanie "live" przy pisaniu

**Kiedy wyszukiwanie na backendzie?**
- Duża ilość danych (>1000 rekordów)
- Złożone zapytania SQL (JOIN, agregacje)
- Paginacja

---

## 9. BIBLIOTEKI I NARZĘDZIA

### 9.1 Backend (Python)

| Biblioteka | Wersja | Do czego służy |
|-----------|--------|----------------|
| Flask | 3.0+ | Framework webowy |
| SQLAlchemy | 2.0+ | ORM - Object-Relational Mapping |
| Flask-CORS | 4.0+ | Obsługa CORS |
| PyJWT | 2.8+ | Generowanie/weryfikacja JWT |
| bcrypt | 4.0+ | Hashowanie haseł |
| ReportLab | 4.0+ | Generowanie PDF |
| python-docx | 1.1+ | Generowanie DOCX (umowy) |

### 9.2 Frontend Web (React)

| Biblioteka | Wersja | Do czego służy |
|-----------|--------|----------------|
| React | 18.3+ | Framework UI |
| TypeScript | 5.5+ | Statyczne typowanie |
| Vite | 5.3+ | Build tool (szybszy niż Webpack) |
| React Router | 6.24+ | Routing |
| Axios | 1.7+ | HTTP requests |
| date-fns | 3.6+ | Formatowanie dat |
| Tailwind CSS | 3.4+ | Utility-first CSS framework |

### 9.3 Mobile (React Native)

| Biblioteka | Wersja | Do czego służy |
|-----------|--------|----------------|
| React Native | 0.74+ | Framework mobilny |
| Expo | 51.0+ | Platforma deweloperska |
| Expo Router | 3.5+ | Routing oparty na plikach |
| Expo SecureStore | 13.0+ | Szyfrowane przechowywanie |
| Expo FileSystem | 17.0+ | Zarządzanie plikami |
| Axios | 1.7+ | HTTP requests |
| date-fns | 3.6+ | Formatowanie dat |

### 9.4 Narzędzia deweloperskie

| Narzędzie | Do czego służy |
|-----------|----------------|
| Git | Kontrola wersji |
| VS Code | Edytor kodu |
| Postman | Testowanie API |
| Chrome DevTools | Debug frontendu |
| React DevTools | Debug React |
| Python venv | Środowisko wirtualne |
| npm/npx | Menedżer pakietów Node.js |

---

## 10. PYTANIA NA OBRONĘ - FAQ

### 10.1 Architektura

**Q1: Dlaczego wybrałeś architekturę trójwarstwową?**

**A**: Bo zapewnia:
1. **Separację odpowiedzialności** - frontend nie zna bazy, backend nie zna UI
2. **Łatwą wymianę komponentów** - mogę zmienić SQLite na PostgreSQL bez dotykania frontendu
3. **Skalowalność** - każda warstwa może być skalowana niezależnie
4. **Łatwiejsze testowanie** - testuję każdą warstwę osobno

**Q2: Dlaczego REST API, a nie GraphQL?**

**A**: REST jest:
- Prostszy w implementacji (to projekt edukacyjny)
- Lepiej udokumentowany (więcej tutoriali)
- Wystarczający dla CRUD operacji
- Łatwiejszy do debugowania

GraphQL byłby lepszy gdyby:
- Frontend potrzebował bardzo różnych danych (underfetching/overfetching)
- Było wielu różnych klientów (mobile, web, desktop)

### 10.2 Backend

**Q3: Dlaczego Flask, a nie Django?**

**A**: Flask jest:
- **Lżejszy** - zawiera tylko to czego potrzebuję
- **Prostszy** - łatwiejszy do nauki (to moja pierwsza aplikacja Flask)
- **Bardziej elastyczny** - pełna kontrola nad strukturą
- **Idealny dla API** - Django jest przerostem dla REST API

Django wybrałbym gdyby:
- Potrzebowałem panelu admina (Django ma wbudowany)
- Budował full-stack w Pythonie (templates + backend)

**Q4: Dlaczego SQLite, a nie PostgreSQL?**

**A**: SQLite jest:
- **Prosty** - jeden plik, brak instalacji serwera
- **Wystarczający** - dla <100k rekordów działa świetnie
- **Łatwy backup** - skopiuj plik
- **Idealny do prototypu**

PostgreSQL wybrałbym dla produkcji bo:
- Obsługuje wielu użytkowników równocześnie
- Pełny ACID, transakcje
- Replikacja, skalowanie
- Zaawansowane typy danych

**Q5: Jak zabezpieczasz API przed atakami?**

**A**:
1. **JWT** - autoryzacja (tylko zalogowani)
2. **bcrypt** - hashowanie haseł (nie plaintext)
3. **CORS** - tylko frontend może wysyłać requesty
4. **ORM** - zapobiega SQL Injection (parametryzowane zapytania)
5. **HTTPS** w produkcji (szyfrowanie transmisji)
6. **Walidacja danych** - sprawdzam dane przed zapisem

### 10.3 Frontend

**Q6: Dlaczego TypeScript zamiast JavaScript?**

**A**: TypeScript:
- **Wykrywa błędy** przed uruchomieniem (statyczne typowanie)
- **Lepsze podpowiedzi** w IDE (IntelliSense)
- **Samoodokumentujący** kod (typy = dokumentacja)
- **Łatwiejszy refactoring** (IDE wie co zmienić)

Przykład:
```typescript
// ❌ JavaScript - błąd wykryty w runtime
function add(a, b) { return a + b; }
add("2", "3");  // "23" zamiast 5

// ✅ TypeScript - błąd wykryty od razu
function add(a: number, b: number): number { return a + b; }
add("2", "3");  // ❌ Error: Argument of type 'string' is not assignable
```

**Q7: Czym różni się React od React Native?**

**A**:

| Cecha | React | React Native |
|-------|-------|--------------|
| Platforma | Web (przeglądarka) | Mobile (iOS, Android) |
| Renderowanie | DOM (`<div>`, `<p>`) | Natywne komponenty (`<View>`, `<Text>`) |
| Stylowanie | CSS | StyleSheet (podobny do CSS) |
| Nawigacja | React Router | Expo Router |
| Storage | localStorage | SecureStore |

**Podobieństwa**:
- Ten sam język (JavaScript/TypeScript)
- Te same hooki (useState, useEffect)
- Ten sam paradygmat (komponenty, props, state)
- Ta sama logika biznesowa

**Q8: Dlaczego używasz Context API?**

**A**: Bo zapobiega "prop drilling":

```tsx
// ❌ Bez Context - męczące
<App token={token}>
  <Layout token={token}>
    <Header token={token} />
  </Layout>
</App>

// ✅ Z Context - elegancko
<AuthProvider>
  <App>
    <Layout>
      <Header />  {/* Pobiera token z useAuth() */}
    </Layout>
  </App>
</AuthProvider>
```

### 10.4 Mobile

**Q9: Dlaczego Expo, a nie czysty React Native?**

**A**: Expo:
- **Prostsze** - nie musisz konfigurować Xcode/Android Studio
- **Szybsze testowanie** - aplikacja Expo Go
- **Gotowe biblioteki** - SecureStore, FileSystem, Sharing
- **OTA updates** - aktualizacje bez App Store

**Wady Expo** (trzeba znać!):
- Większy rozmiar APK
- Nie wszystkie natywne moduły
- Ograniczenia w customizacji

**Kiedy czysty React Native?**
- Potrzebujesz specyficznych natywnych modułów
- Bardzo zaawansowana customizacja
- Aplikacja krytyczna pod względem rozmiaru

**Q10: Jak obsługujesz różnice iOS vs Android?**

**A**: React Native + Expo robią to automatycznie, ale mogę użyć:

```tsx
import { Platform } from 'react-native';

const styles = StyleSheet.create({
    container: {
        paddingTop: Platform.OS === 'ios' ? 20 : 0  // iOS ma notch
    }
});

// Lub
if (Platform.OS === 'ios') {
    // Kod dla iOS
} else {
    // Kod dla Android
}
```

### 10.5 Bezpieczeństwo

**Q11: Czy JWT jest bezpieczne?**

**A**: **Tak**, pod warunkiem:
1. ✅ **HTTPS** - szyfrowana transmisja
2. ✅ **SECRET_KEY tajny** - nigdy w repo
3. ✅ **Krótki exp** - token wygasa po 24h
4. ✅ **Nie wrażliwe dane w payload** - payload jest widoczny (Base64)
5. ✅ **SecureStore** w mobile - szyfrowane przechowywanie

**Zagrożenia** (trzeba znać!):
- ❌ XSS (Cross-Site Scripting) - złośliwy JS może ukraść token z localStorage
- ❌ Token w URL - nigdy nie przekazuj tokena w URL (oprócz PDF)
- ❌ Brak odwołania - nie mogę "odwołać" tokena (rozwiązanie: blacklist lub krótki exp)

**Q12: Dlaczego hashujesz hasła bcrypt, a nie MD5/SHA256?**

**A**:
- **bcrypt jest WOLNY** - utrudnia brute-force (celowo ~100ms)
- **Automatyczny salt** - każde hasło ma unikalny salt
- **Odporny na rainbow tables** - prekomputowane hashe nie zadziałają

MD5/SHA256:
- ❌ Zbyt szybkie (miliony prób/sekundę)
- ❌ Przeznaczone do checksumów, nie haseł

### 10.6 Wydajność

**Q13: Jak optymalizujesz wydajność frontendu?**

**A**:
1. **useCallback/useMemo** - memoizacja funkcji/wartości
2. **Lazy loading** - ładowanie komponentów on-demand
3. **Debouncing** - opóźnienie wyszukiwania (nie szukaj po każdej literze)
4. **Paginacja** - ładowanie 50 rekordów na stronę, nie wszystkich
5. **Optimistic updates** - natychmiastowa aktualizacja UI (potem serwer)

**Q14: Jak optymalizujesz wydajność backendu?**

**A**:
1. **Indexy w bazie** - szybsze wyszukiwanie
2. **Eager loading** - `joinedload()` zapobiega N+1 queries
3. **Caching** - wyniki często używanych zapytań
4. **Paginacja** - limit 100 rekordów na request

### 10.7 Testowanie

**Q15: Czy pisałeś testy?**

**Szczera odpowiedź**:
"Nie w pełni - to projekt edukacyjny skupiony na funkcjonalności. W produkcji napisałbym:
- **Unit testy** - dla funkcji biznesowych (pytest)
- **Integration testy** - dla endpointów API (pytest + Flask test client)
- **E2E testy** - dla krytycznych scenariuszy (Playwright)"

**Q16: Jak testujesz API ręcznie?**

**A**: Używam **Postman**:
1. Tworzę kolekcję requestów
2. Zapisuję token w zmiennej środowiskowej
3. Testuję wszystkie endpointy (GET, POST, PUT, DELETE)
4. Sprawdzam edge cases (brak tokena, nieprawidłowe dane)

### 10.8 Deployment

**Q17: Jak wdrożyłbyś aplikację na produkcję?**

**A**:

**Backend**:
- **Serwer**: VPS (Digital Ocean, AWS EC2) lub PaaS (Heroku, Railway)
- **WSGI**: Gunicorn (production server Flask)
- **Reverse proxy**: Nginx (SSL, load balancing)
- **Baza**: Migracja SQLite → PostgreSQL
- **Zmienne środowiskowe**: `.env` file (SECRET_KEY, DATABASE_URL)

**Frontend Web**:
- **Hosting**: Vercel, Netlify, Cloudflare Pages
- **Build**: `npm run build` → statyczne pliki
- **CDN**: Automatycznie (Vercel/Netlify)

**Mobile**:
- **iOS**: App Store Connect (wymaga konto Apple Developer $99/rok)
- **Android**: Google Play Console ($25 one-time)
- **Build**: `eas build --platform all`

**Q18: Jak zapewniasz CI/CD?**

**A**: (jeśli pytają o zaawansowane)
- **GitHub Actions** - automatyczne testy + build
- **Pre-commit hooks** - linting, formatowanie
- **Staged deployment** - dev → staging → production
- **Rollback plan** - backup bazy, poprzednia wersja kodu

---

## 📊 METRYKI PROJEKTU

### Linie kodu (przybliżone)

| Komponent | Linie kodu | Pliki |
|-----------|-----------|-------|
| Backend (Python) | ~5,000 | 25 |
| Frontend Web (React) | ~8,000 | 40 |
| Mobile (React Native) | ~6,000 | 30 |
| **RAZEM** | **~19,000** | **95** |

### Funkcjonalności

- ✅ **Autoryzacja JWT** - logowanie, rejestracja
- ✅ **CRUD Klientów** - dodawanie, edycja, usuwanie, wyszukiwanie
- ✅ **CRUD Zadań** - to-do list z przypomnieniami
- ✅ **Faktury** - generowanie PDF, płatności
- ✅ **Umowy** - generowanie DOCX z szablonów
- ✅ **Powiadomienia** - system powiadomień w czasie rzeczywistym
- ✅ **Przypomnienia** - alerts w aplikacji mobilnej
- ✅ **Dashboard** - statystyki, wykresy
- ✅ **Role użytkowników** - Admin, User
- ✅ **Historia aktywności** - logi akcji

### Technologie

- **Backend**: Python 3.12, Flask 3.0, SQLAlchemy 2.0, SQLite
- **Frontend**: React 18.3, TypeScript 5.5, Vite 5.3, Tailwind CSS
- **Mobile**: React Native 0.74, Expo 51, TypeScript 5.5
- **Autoryzacja**: JWT (PyJWT), bcrypt
- **PDF/DOCX**: ReportLab, python-docx
- **HTTP**: Axios, Flask-CORS

---

## 🎯 KLUCZOWE RZECZY DO ZAPAMIĘTANIA

### Top 10 rzeczy które musisz wiedzieć:

1. **Architektura 3-warstwowa** - prezentacja, logika, dane
2. **JWT** - stateless authorization, token ma payload + signature
3. **ORM (SQLAlchemy)** - obiekty Pythona ↔ tabele SQL
4. **React Hooks** - useState, useEffect, useCallback
5. **Context API** - globalne state (token, user)
6. **Axios Interceptors** - automatyczne dodawanie tokena
7. **Bcrypt** - hashowanie haseł (wolny = bezpieczny)
8. **Blueprint** - modularyzacja backendu
9. **SecureStore** - szyfrowane storage w mobile
10. **CORS** - pozwala frontend ↔ backend różne porty

### Najczęstsze błędy które poprawiłem:

1. ❌ Token w plaintext → ✅ Bcrypt
2. ❌ Duplikacja nagłówków → ✅ Interceptory
3. ❌ Prop drilling → ✅ Context API
4. ❌ Brak walidacji → ✅ TypeScript + backend validation
5. ❌ SQL Injection → ✅ ORM parametryzacja

### Pytania "pułapki" i odpowiedzi:

**Q**: "Czy to skalowalne?"
**A**: "Dla małych/średnich firm (do 100 użytkowników) - tak. Dla tysięcy użytkowników potrzebowałbym: (1) PostgreSQL zamiast SQLite, (2) Redis cache, (3) Load balancer, (4) CDN dla statyki"

**Q**: "Dlaczego nie użyłeś [zaawansowana technologia]?"
**A**: "To projekt edukacyjny - skupiłem się na solidnych podstawach i działającej aplikacji. W komercyjnym projekcie rozważyłbym [technologia], ale wymagałaby [czas/złożoność]"

**Q**: "Co byś zmienił?"
**A**: "1) Dodał testy automatyczne, 2) Migracja na PostgreSQL, 3) Docker dla łatwego deploymentu, 4) CI/CD pipeline, 5) Więcej walidacji po stronie backendu"

---

## 📚 MATERIAŁY DO DALSZEJ NAUKI

### Polecane kursy/książki:

1. **Flask**: "Flask Web Development" - Miguel Grinberg
2. **React**: "React dokumentacja oficjalna" - react.dev
3. **TypeScript**: "TypeScript Handbook" - typescriptlang.org
4. **React Native**: "React Native dokumentacja" - reactnative.dev
5. **SQLAlchemy**: "Essential SQLAlchemy" - Jason Myers

### Dokumentacje:

- Flask: https://flask.palletsprojects.com
- React: https://react.dev
- React Native: https://reactnative.dev
- Expo: https://docs.expo.dev
- SQLAlchemy: https://docs.sqlalchemy.org

---

**Powodzenia na obronie! 🎓**

*Jeśli będziesz miał pytania - wróć do tego dokumentu. Zawiera wszystko czego potrzebujesz.*
