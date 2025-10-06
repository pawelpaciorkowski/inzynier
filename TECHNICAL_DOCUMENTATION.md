# 🔧 DOKUMENTACJA TECHNICZNA - SYSTEM CRM

> **Projekt Inżynierski:** Zintegrowany System CRM  
> **Autor:** Paweł Paciorkowski  
> **Data:** 2025-10-06

---

## 📋 SPIS TREŚCI

1. [Architektura Systemu](#architektura-systemu)
2. [Backend - Python Flask](#backend---python-flask)
3. [Frontend - React + TypeScript](#frontend---react--typescript)
4. [Mobile - React Native](#mobile---react-native)
5. [Baza Danych](#baza-danych)
6. [API Endpoints](#api-endpoints)
7. [Wzorce Projektowe](#wzorce-projektowe)
8. [Bezpieczeństwo](#bezpieczeństwo)

---

## 🏗️ ARCHITEKTURA SYSTEMU

### **Ogólna Architektura**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Aplikacja     │    │   Aplikacja     │    │   Backend API   │
│   Mobilna       │    │   Webowa        │    │   (Python)      │
│   (React Native)│    │   (React)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Baza Danych   │
                    │   (MariaDB)     │
                    └─────────────────┘
```

### **Komunikacja między warstwami:**
- **Frontend ↔ Backend:** HTTP/REST API + JWT
- **Mobile ↔ Backend:** HTTP/REST API + JWT
- **Backend ↔ Database:** SQLAlchemy ORM

---

## 🐍 BACKEND - PYTHON FLASK

### **Struktura Projektu**
```
backend-python/
├── app/
│   ├── __init__.py          # Inicjalizacja aplikacji Flask
│   ├── config.py            # Konfiguracja aplikacji
│   ├── database.py          # Konfiguracja bazy danych
│   ├── middleware.py        # Middleware autoryzacji
│   ├── models/              # Modele SQLAlchemy
│   │   ├── user.py
│   │   ├── customer.py
│   │   ├── task.py
│   │   └── ...
│   ├── controllers/         # Kontrolery API
│   │   ├── auth.py
│   │   ├── customers.py
│   │   ├── tasks.py
│   │   └── ...
│   └── services/            # Logika biznesowa
├── app.py                   # Główny plik aplikacji
└── requirements.txt         # Zależności Python
```

### **Kluczowe Pliki i Funkcje**

#### **1. app/__init__.py - Inicjalizacja Aplikacji**
```python
def create_app():
    """
    Tworzy i konfiguruje aplikację Flask
    
    Returns:
        Flask: Skonfigurowana instancja aplikacji Flask
        
    Funkcjonalności:
    - Konfiguracja Flask
    - Inicjalizacja bazy danych
    - Rejestracja blueprintów
    - Konfiguracja CORS
    - Konfiguracja JWT
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Inicjalizuj bazę danych
    init_database(app)
    
    # Inicjalizuj JWT
    jwt = JWTManager(app)
    
    # Konfiguruj CORS
    CORS(app, origins=Config.CORS_ORIGINS)
    
    return app
```

#### **2. app/middleware.py - Autoryzacja**
```python
def require_auth(f):
    """
    Dekorator wymagający autoryzacji JWT
    
    Args:
        f: Funkcja do zabezpieczenia
        
    Returns:
        decorated: Funkcja z autoryzacją
        
    Działanie:
    - Sprawdza token JWT w nagłówku Authorization
    - Dekoduje token i wyciąga ID użytkownika
    - Przekazuje ID użytkownika do funkcji przez g.current_user_id
    - Zwraca 401 w przypadku błędów autoryzacji
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Brak tokenu autoryzacji'}), 401
        
        try:
            token = token.replace('Bearer ', '')
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            g.current_user_id = payload['sub']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token wygasł'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Nieprawidłowy token'}), 401
        
        return f(*args, **kwargs)
    return decorated
```

#### **3. app/controllers/auth.py - Autentykacja**
```python
@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Endpoint logowania użytkownika
    
    Request Body:
        {
            "username": "string",
            "password": "string"
        }
        
    Response:
        {
            "token": "string",
            "user": {
                "id": number,
                "username": "string",
                "email": "string"
            }
        }
        
    Status Codes:
        - 200: Sukces
        - 400: Błędne dane wejściowe
        - 401: Nieprawidłowe dane logowania
        - 500: Błąd serwera
    """
    try:
        data = request.get_json()
        
        # Walidacja danych
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username i password są wymagane'}), 400
        
        # Znajdź użytkownika
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Nieprawidłowe dane logowania'}), 401
        
        # Generuj token JWT
        token = auth_service.generate_token(user)
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

#### **4. app/models/user.py - Model Użytkownika**
```python
class User(db.Model):
    """
    Model użytkownika systemu
    
    Tabela: users
    Pola:
        - id: Primary key
        - username: Nazwa użytkownika (unique)
        - email: Email (unique)
        - password_hash: Zahashowane hasło
        - role_id: ID roli użytkownika
        
    Metody:
        - check_password(): Sprawdza hasło
        - to_dict(): Konwertuje do słownika
    """
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, nullable=False, unique=True)
    email = db.Column(db.Text, nullable=False, unique=True)
    password_hash = db.Column(db.Text, nullable=False)
    role_id = db.Column(db.Integer, nullable=False)
    
    def check_password(self, password):
        """
        Sprawdza czy podane hasło jest prawidłowe
        
        Args:
            password (str): Hasło do sprawdzenia
            
        Returns:
            bool: True jeśli hasło jest prawidłowe
        """
        import bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """
        Konwertuje obiekt User do słownika
        
        Returns:
            dict: Reprezentacja użytkownika jako słownik
        """
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role_id': self.role_id
        }
```

---

## ⚛️ FRONTEND - REACT + TYPESCRIPT

### **Struktura Projektu**
```
crm-ui/
├── src/
│   ├── components/          # Komponenty wielokrotnego użytku
│   │   ├── Layout.tsx       # Główny layout aplikacji
│   │   ├── PrivateRoute.tsx # Zabezpieczone trasy
│   │   └── ...
│   ├── pages/               # Strony aplikacji
│   │   ├── LoginPage.tsx    # Strona logowania
│   │   ├── DashboardPage.tsx # Dashboard
│   │   └── ...
│   ├── context/             # React Context
│   │   ├── AuthContext.tsx  # Kontekst autoryzacji
│   │   └── ModalContext.tsx # Kontekst modali
│   ├── services/            # Serwisy API
│   │   └── api.ts           # Konfiguracja Axios
│   ├── utils/               # Funkcje pomocnicze
│   │   └── dateUtils.ts     # Narzędzia do dat
│   ├── App.tsx              # Główny komponent
│   └── main.tsx             # Punkt wejścia
├── package.json
└── vite.config.ts
```

### **Kluczowe Komponenty**

#### **1. src/context/AuthContext.tsx - Zarządzanie Autoryzacją**
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const login = async (username: string, password: string) => {
    /**
     * Loguje użytkownika do systemu
     * 
     * @param username - Nazwa użytkownika
     * @param password - Hasło
     * 
     * @throws Error - W przypadku błędu logowania
     */
    const response = await api.post('/Auth/login', { username, password });
    const { token, user } = response.data;
    
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    /**
     * Wylogowuje użytkownika z systemu
     * 
     * Działanie:
     * - Czyści stan użytkownika
     * - Usuwa token z localStorage
     * - Przekierowuje na stronę logowania
     */
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### **2. src/services/api.ts - Konfiguracja API**
```typescript
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor dodający token do każdego requestu
api.interceptors.request.use((config) => {
  /**
   * Automatycznie dodaje token JWT do nagłówków
   * 
   * Działanie:
   * - Pobiera token z localStorage
   * - Dodaje do nagłówka Authorization
   * - Format: "Bearer <token>"
   */
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor obsługujący błędy odpowiedzi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    /**
     * Obsługuje błędy odpowiedzi z API
     * 
     * Działanie:
     * - Sprawdza kod błędu 401 (Unauthorized)
     * - Automatycznie wylogowuje użytkownika
     * - Przekierowuje na stronę logowania
     */
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

#### **3. src/components/PrivateRoute.tsx - Zabezpieczone Trasy**
```typescript
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  /**
   * Komponent zabezpieczający trasy wymagające autoryzacji
   * 
   * Działanie:
   * - Sprawdza czy użytkownik jest zalogowany
   * - Przekierowuje na login jeśli nie jest
   * - Zachowuje URL docelowy dla przekierowania po logowaniu
   */
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

---

## 📱 MOBILE - REACT NATIVE

### **Struktura Projektu**
```
crm-mobile/
├── app/                     # Ekrany aplikacji (Expo Router)
│   ├── (tabs)/             # Nawigacja tabowa
│   │   ├── index.tsx       # Dashboard
│   │   ├── tasks.tsx       # Zadania
│   │   ├── customers.tsx   # Klienci
│   │   ├── activities.tsx  # Aktywności
│   │   └── two.tsx         # Profil
│   ├── login.tsx           # Ekran logowania
│   └── _layout.tsx         # Główny layout
├── components/             # Komponenty wielokrotnego użytku
├── context/                # React Context
│   └── AuthContext.tsx     # Kontekst autoryzacji
├── hooks/                  # Custom hooks
│   └── useReminders.tsx    # Hook do przypomnień
└── package.json
```

### **Kluczowe Komponenty**

#### **1. context/AuthContext.tsx - Autoryzacja Mobilna**
```typescript
const API_URL = 'http://10.0.2.2:8100'; // Android emulator → host

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    /**
     * Loguje użytkownika w aplikacji mobilnej
     * 
     * Różnice względem web:
     * - Używa SecureStore zamiast localStorage
     * - Inny URL API (Android emulator)
     * - Obsługa błędów przez Alert
     */
    const response = await axios.post(`${API_URL}/api/Auth/login`, { username, password });
    const { token, user } = response.data;
    
    setToken(token);
    setUser(user);
    await SecureStore.setItemAsync('token', token);
  };

  const logout = async () => {
    /**
     * Wylogowuje użytkownika z aplikacji mobilnej
     * 
     * Działanie:
     * - Czyści stan użytkownika
     * - Usuwa token z SecureStore
     * - Przekierowuje na ekran logowania
     */
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync('token');
  };
};
```

#### **2. hooks/useReminders.tsx - Zarządzanie Przypomnieniami**
```typescript
export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const fetchReminders = async () => {
    /**
     * Pobiera przypomnienia z API
     * 
     * Działanie:
     * - Wywołuje endpoint /api/Reminders
     * - Parsuje daty z formatu ISO
     * - Aktualizuje stan przypomnień
     */
    try {
      const response = await api.get('/Reminders');
      const parsedReminders = response.data.map((r: any) => ({
        ...r,
        remind_at: new Date(r.remind_at)
      }));
      setReminders(parsedReminders);
    } catch (error) {
      console.error('Błąd pobierania przypomnień:', error);
    }
  };

  const checkReminders = () => {
    /**
     * Sprawdza czy nadszedł czas na przypomnienie
     * 
     * Działanie:
     * - Porównuje czas przypomnienia z aktualnym
     * - Pokazuje Alert jeśli czas nadszedł
     * - Oznacza przypomnienie jako pokazane
     */
    const now = new Date();
    reminders.forEach(reminder => {
      if (reminder.remind_at <= now && !reminder.shown) {
        Alert.alert('⏰ Przypomnienie!', reminder.note);
        // Oznacz jako pokazane
        reminder.shown = true;
      }
    });
  };

  return { reminders, fetchReminders, checkReminders };
};
```

---

## 🗄️ BAZA DANYCH

### **Główne Tabele**

#### **1. users - Użytkownicy**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INT NOT NULL
);
```

#### **2. customers - Klienci**
```sql
CREATE TABLE customers (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name TEXT NOT NULL,
    Email TEXT,
    Phone TEXT,
    Company TEXT,
    Address TEXT,
    NIP TEXT,
    Representative TEXT,
    AssignedGroupId INT,
    AssignedUserId INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **3. tasks - Zadania**
```sql
CREATE TABLE tasks (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Title TEXT NOT NULL,
    Description TEXT,
    Completed BOOLEAN DEFAULT FALSE,
    DueDate DATE,
    AssignedUserId INT,
    CustomerId INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **4. invoices - Faktury**
```sql
CREATE TABLE invoices (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Number TEXT NOT NULL,
    CustomerId INT NOT NULL,
    TotalAmount DECIMAL(10,2),
    IsPaid BOOLEAN DEFAULT FALSE,
    IssuedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedByUserId INT
);
```

### **Relacje**
- **users → tasks** (1:N) - użytkownik może mieć wiele zadań
- **customers → invoices** (1:N) - klient może mieć wiele faktur
- **customers → tasks** (1:N) - klient może mieć wiele zadań
- **groups ← users** (M:N) - użytkownicy mogą należeć do wielu grup

---

## 🔌 API ENDPOINTS

### **Autoryzacja**
- `POST /api/Auth/login` - Logowanie
- `POST /api/Auth/register` - Rejestracja
- `POST /api/Auth/refresh` - Odświeżanie tokenu

### **Klienci**
- `GET /api/Customers` - Lista klientów
- `POST /api/Customers` - Dodawanie klienta
- `GET /api/Customers/{id}` - Szczegóły klienta
- `PUT /api/Customers/{id}` - Edycja klienta
- `DELETE /api/Customers/{id}` - Usuwanie klienta

### **Zadania**
- `GET /api/Tasks` - Lista zadań
- `POST /api/Tasks` - Dodawanie zadania
- `GET /api/Tasks/{id}` - Szczegóły zadania
- `PUT /api/Tasks/{id}` - Edycja zadania
- `DELETE /api/Tasks/{id}` - Usuwanie zadania

### **Faktury**
- `GET /api/Invoices` - Lista faktur
- `POST /api/Invoices` - Dodawanie faktury
- `GET /api/Invoices/{id}` - Szczegóły faktury
- `GET /api/Invoices/{id}/pdf` - PDF faktury

### **Raporty**
- `GET /api/reports/export-customers` - Eksport klientów
- `GET /api/reports/export-invoices` - Eksport faktur
- `GET /api/reports/groups/{id}/pdf` - Raport grupy PDF

---

## 🎨 WZORCE PROJEKTOWE

### **1. MVC (Model-View-Controller)**
- **Model:** SQLAlchemy models (app/models/)
- **View:** React components (crm-ui/src/pages/)
- **Controller:** Flask controllers (app/controllers/)

### **2. Repository Pattern**
```python
# app/models/base.py
class BaseModel(db.Model):
    """Bazowy model z wspólnymi metodami"""
    __abstract__ = True
    
    def to_dict(self):
        """Konwertuje model do słownika"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
    def save(self):
        """Zapisuje model do bazy danych"""
        db.session.add(self)
        db.session.commit()
    
    def delete(self):
        """Usuwa model z bazy danych"""
        db.session.delete(self)
        db.session.commit()
```

### **3. Dependency Injection**
```python
# app/services/auth_service.py
class AuthService:
    """Serwis autoryzacji"""
    
    def generate_token(self, user):
        """Generuje token JWT dla użytkownika"""
        payload = {
            'sub': user.id,
            'username': user.username,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
```

### **4. Observer Pattern (React Context)**
```typescript
// Zarządzanie globalnym stanem przez Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 🔐 BEZPIECZEŃSTWO

### **1. Autoryzacja JWT**
- **Token Structure:** Header.Payload.Signature
- **Expiration:** 24 godziny
- **Refresh:** Automatyczne odświeżanie
- **Storage:** SecureStore (mobile), localStorage (web)

### **2. Hashowanie Haseł**
```python
import bcrypt

def hash_password(password):
    """Hashuje hasło użytkownika"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt)

def check_password(password, password_hash):
    """Sprawdza hasło użytkownika"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
```

### **3. Walidacja Danych**
```python
def validate_email(email):
    """Waliduje format email"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Waliduje siłę hasła"""
    if len(password) < 8:
        return False, "Hasło musi mieć co najmniej 8 znaków"
    return True, "Hasło jest prawidłowe"
```

### **4. CORS Configuration**
```python
# app/__init__.py
CORS(app, origins=[
    'http://localhost:3000',  # React dev server
    'http://localhost:5173',  # Vite dev server
    'http://10.0.2.2:3000',  # Android emulator
])
```

### **5. SQL Injection Protection**
- **SQLAlchemy ORM** - automatyczna ochrona
- **Parameterized Queries** - bezpieczne zapytania
- **Input Validation** - walidacja danych wejściowych

---

## 📊 METRYKI PROJEKTU

### **Statystyki Kodu**
- **Backend (Python):** ~8,000 linii kodu
- **Frontend (TypeScript):** ~5,000 linii kodu
- **Mobile (TypeScript):** ~2,000 linii kodu
- **Łącznie:** ~15,000 linii kodu

### **Statystyki Funkcjonalności**
- **API Endpoints:** 50+
- **React Components:** 100+
- **Database Tables:** 20+
- **Mobile Screens:** 15+
- **PDF Reports:** 5 typów
- **Export Formats:** CSV, XLSX, PDF

### **Pokrycie Testowe**
- **Backend:** Manual testing przez Postman
- **Frontend:** Manual testing w przeglądarce
- **Mobile:** Testing na emulatorze Android

---

## 🚀 DEPLOYMENT

### **Docker Configuration**
```dockerfile
# backend-python/Dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8100

CMD ["python", "app.py"]
```

### **Docker Compose**
```yaml
version: "3.8"
services:
  db:
    image: mariadb:11
    environment:
      MARIADB_ROOT_PASSWORD: kapljca
      MARIADB_DATABASE: crm_project
    ports:
      - "3306:3306"
  
  crm-api:
    build: ./backend-python
    ports:
      - "8100:8100"
    depends_on:
      - db
```

### **Environment Variables**
```bash
# Backend
FLASK_ENV=production
DATABASE_URL=mysql+pymysql://user:pass@db:3306/crm_project
JWT_SECRET_KEY=your-secret-key

# Frontend
VITE_API_URL=http://localhost:8100
```

---

## 📝 WNIOSKI

### **Zalety Architektury**
1. **Modularność** - każdy komponent ma jasną rolę
2. **Skalowalność** - łatwe dodawanie nowych funkcji
3. **Bezpieczeństwo** - JWT + walidacja + hashowanie
4. **Cross-platform** - web + mobile z jednym backendem
5. **Prostota** - czytelny kod bez zbędnej złożoności

### **Możliwości Rozwoju**
1. **Real-time** - WebSockets dla powiadomień na żywo
2. **Caching** - Redis dla lepszej wydajności
3. **Monitoring** - logowanie i metryki
4. **CI/CD** - automatyzacja deploymentu
5. **Testing** - testy jednostkowe i integracyjne

### **Lekcje Nauczone**
1. **Planowanie** - dokładne zaplanowanie oszczędza czas
2. **Prostota** - prostsze rozwiązania są często lepsze
3. **Dokumentacja** - dobra dokumentacja to inwestycja
4. **Testowanie** - testowanie na bieżąco zapobiega błędom
5. **Iteracyjność** - lepiej zrobić coś prostego i ulepszać

---

**Ta dokumentacja techniczna zawiera kompletny opis architektury, implementacji i wzorców projektowych użytych w systemie CRM. Każda funkcja, metoda i komponent został szczegółowo opisany z wyjaśnieniem działania i celu użycia.**
