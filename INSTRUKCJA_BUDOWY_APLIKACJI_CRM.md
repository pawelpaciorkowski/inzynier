# 📊 INSTRUKCJA BUDOWY APLIKACJI CRM - PROJEKT INŻYNIERSKI

> **Autor:** Paweł Paciorkowski  
> **Kierunek:** Informatyka, IV rok  
> **Specjalność:** Programista aplikacji biznesowych

---

## 🎯 CEL PROJEKTU

Zbudowałem **kompletny system CRM** składający się z trzech głównych komponentów:
1. **Backend API** (Python Flask) - serce systemu
2. **Aplikacja Webowa** (React + TypeScript) - panel administracyjny
3. **Aplikacja Mobilna** (React Native + Expo) - dostęp mobilny

---

## 🏗️ ARCHITEKTURA SYSTEMU

### Schemat architektury:
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

---

## 🛠️ TECHNOLOGIE I BIBLIOTEKI

### Backend (Python Flask)
- **Flask 2.3.3** - prosty framework webowy
- **SQLAlchemy** - ORM do bazy danych
- **JWT** - autoryzacja użytkowników
- **bcrypt** - hashowanie haseł
- **PyMySQL** - driver MySQL

### Frontend Webowy (React)
- **React 19.1.0** - biblioteka UI
- **TypeScript** - typowanie statyczne
- **Vite** - bundler i dev server
- **TailwindCSS** - framework CSS
- **React Router** - routing
- **Axios** - komunikacja z API

### Aplikacja Mobilna (React Native)
- **React Native 0.79.5** - framework mobilny
- **Expo 53.0.20** - platforma deweloperska
- **Expo Router** - routing mobilny
- **expo-secure-store** - bezpieczne przechowywanie tokenów

---

## 📋 KROK PO KROKU - BUDOWA APLIKACJI

### KROK 1: PRZYGOTOWANIE ŚRODOWISKA

#### 1.1 Instalacja narzędzi
```bash
# Node.js (v18+)
# Python (v3.8+)
# Docker (opcjonalnie)
# Android Studio (dla aplikacji mobilnej)
```

#### 1.2 Struktura projektu
```
inzynier/
├── backend-python/     # Backend API
├── crm-ui/            # Aplikacja webowa
├── crm-mobile/        # Aplikacja mobilna
└── docker-compose.yml # Konteneryzacja
```

### KROK 2: BACKEND API (Python Flask)

#### 2.1 Inicjalizacja projektu
```bash
cd backend-python
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

#### 2.2 Główny plik aplikacji (`app.py`)
```python
# Główny plik aplikacji CRM w Python
from app import create_app
from app.database import db
from app.models import User, Role, Customer, Reminder

app = create_app()

def create_tables():
    """Tworzy tabele w bazie danych"""
    db.create_all()
    seed_database()

def seed_database():
    """Dodaje podstawowe dane do bazy"""
    # Tworzenie ról użytkowników
    if not Role.query.first():
        roles = [
            Role(name='Admin', description='Administrator systemu'),
            Role(name='User', description='Standardowy użytkownik')
        ]
        for role in roles:
            db.session.add(role)
        db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        create_tables()
    app.run(host='0.0.0.0', port=5000, debug=False)
```

#### 2.3 Konfiguracja aplikacji (`app/__init__.py`)
```python
def create_app():
    """Tworzy i konfiguruje aplikację Flask"""
    app = Flask(__name__)
    app.config.from_object(Config) 
    
    # Inicjalizuj bazę danych
    init_database(app)
    
    # Inicjalizuj JWT
    jwt = JWTManager(app)
    
    # Konfiguruj CORS
    CORS(app, origins=Config.CORS_ORIGINS)
    
    # Zarejestruj kontrolery
    from app.controllers import auth_bp, customers_bp, invoices_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/Auth')
    app.register_blueprint(customers_bp, url_prefix='/api/Customers')
    app.register_blueprint(invoices_bp, url_prefix='/api/Invoices')
    
    return app
```

#### 2.4 Modele danych (`app/models/user.py`)
```python
class User(db.Model):
    """Model użytkownika"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, nullable=False, unique=True)
    email = db.Column(db.Text, nullable=False, unique=True)
    password_hash = db.Column(db.Text, nullable=False)
    role_id = db.Column(db.Integer, nullable=False)
    
    def check_password(self, password):
        """Sprawdza hasło użytkownika"""
        import bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    @staticmethod
    def hash_password(password):
        """Hashuje hasło"""
        import bcrypt
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
```

#### 2.5 Kontrolery (`app/controllers/auth.py`)
```python
@auth_bp.route('/login', methods=['POST'])
def login():
    """Logowanie użytkownika"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Znajdź użytkownika
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        # Utwórz token JWT
        token = create_access_token(identity=user.id)
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role.name if user.role else None
            }
        }), 200
    
    return jsonify({'error': 'Nieprawidłowe dane logowania'}), 401
```

### KROK 3: APLIKACJA WEBOWA (React)

#### 3.1 Inicjalizacja projektu
```bash
cd crm-ui
npm install
npm run dev
```

#### 3.2 Główny komponent (`src/App.tsx`)
```typescript
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ModalProvider } from './context/ModalContext';
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <ModalProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </ModalProvider>
  );
}

export default App;
```

#### 3.3 Kontekst autoryzacji (`src/context/AuthContext.tsx`)
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
    const response = await api.post('/Auth/login', { username, password });
    const { token, user } = response.data;
    
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
  };

  const logout = () => {
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

#### 3.4 Serwis API (`src/services/api.ts`)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor dodający token do każdego requestu
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### 3.5 Strona logowania (`src/pages/LoginPage.tsx`)
```typescript
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Błąd logowania:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">Logowanie CRM</h1>
        <input
          type="text"
          placeholder="Nazwa użytkownika"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded"
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 bg-gray-700 text-white rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
          Zaloguj się
        </button>
      </form>
    </div>
  );
}
```

### KROK 4: APLIKACJA MOBILNA (React Native)

#### 4.1 Inicjalizacja projektu
```bash
cd crm-mobile
npm install
npx expo start
```

#### 4.2 Główny layout (`app/_layout.tsx`)
```typescript
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{
        headerStyle: { backgroundColor: '#1f2937' },
        headerTintColor: '#fff',
      }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
```

#### 4.3 Kontekst autoryzacji mobilnej (`context/AuthContext.tsx`)
```typescript
const API_URL = 'http://192.168.1.17:5000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/Auth/login`, { username, password });
    const { token, user } = response.data;
    
    setToken(token);
    setUser(user);
    await SecureStore.setItemAsync('token', token);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 4.4 Ekran logowania (`app/login.tsx`)
```typescript
export default function LoginScreen() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Diviruse007@');
  const { login } = useAuth();

  const onLoginPress = async () => {
    try {
      await login(username, password);
    } catch (e) {
      Alert.alert("Błąd logowania", "Nieprawidłowa nazwa użytkownika lub hasło.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRM Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa użytkownika"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Zaloguj się" onPress={onLoginPress} />
    </View>
  );
}
```

---

## 🔧 KLUCZOWE FUNKCJONALNOŚCI

### 1. System Autoryzacji
- **JWT Token** - bezpieczne logowanie
- **Role użytkowników** - Admin/User
- **Chronione trasy** - dostęp tylko dla zalogowanych

### 2. Zarządzanie Klientami
- **CRUD operacje** - tworzenie, edycja, usuwanie
- **Lista klientów** - z paginacją i filtrowaniem
- **Szczegóły klienta** - pełne informacje

### 3. Zarządzanie Fakturami
- **Tworzenie faktur** - z pozycjami
- **Generowanie PDF** - do druku
- **Status płatności** - opłacone/nieopłacone

### 4. System Zadań
- **Przypisywanie zadań** - do użytkowników
- **Status wykonania** - ukończone/oczekujące
- **Terminy** - z przypomnieniami

### 5. Powiadomienia
- **Modal system** - potwierdzenia i błędy
- **Real-time updates** - automatyczne odświeżanie
- **Toast notifications** - informacje dla użytkownika

---

## 🚀 URUCHAMIANIE APLIKACJI

### Opcja 1: Lokalne uruchomienie
```bash
# Backend
cd backend-python
python app.py

# Frontend
cd crm-ui
npm run dev

# Mobile
cd crm-mobile
npx expo start
```

### Opcja 2: Docker (zalecane)
```bash
docker-compose up -d
```

---

## 📊 STRUKTURA BAZY DANYCH

### Główne tabele:
- **users** - użytkownicy systemu
- **roles** - role użytkowników
- **customers** - klienci
- **invoices** - faktury
- **tasks** - zadania
- **reminders** - przypomnienia
- **notifications** - powiadomienia

---

## 🎨 INTERFEJS UŻYTKOWNIKA

### Aplikacja Webowa:
- **Dark theme** - ciemny motyw
- **Responsive design** - dostosowanie do ekranów
- **TailwindCSS** - nowoczesne style
- **Heroicons** - ikony

### Aplikacja Mobilna:
- **Native look** - natywny wygląd
- **Tab navigation** - nawigacja zakładkami
- **Touch gestures** - gesty dotykowe
- **Expo components** - gotowe komponenty

---

## 🔒 BEZPIECZEŃSTWO

### Implementowane zabezpieczenia:
- **JWT Token** - autoryzacja
- **bcrypt** - hashowanie haseł
- **CORS** - ochrona przed atakami
- **Input validation** - walidacja danych
- **SQL injection protection** - ORM SQLAlchemy

---

## 📱 FUNKCJONALNOŚCI MOBILNE

### Dostępne ekrany:
- **Logowanie** - autoryzacja
- **Moje zadania** - lista zadań użytkownika
- **Klienci** - lista klientów
- **Faktury** - lista faktur
- **Aktywności** - historia działań
- **Profil** - dane użytkownika

---

## 🧪 TESTING I DEBUGGING

### Narzędzia deweloperskie:
- **React DevTools** - debugowanie React
- **Expo DevTools** - debugowanie mobilne
- **Browser DevTools** - debugowanie webowe
- **Console logs** - logowanie błędów

---

## 📈 ROZSZERZALNOŚĆ

### Możliwe rozszerzenia:
- **Push notifications** - powiadomienia push
- **Real-time chat** - czat w czasie rzeczywistym
- **Advanced reporting** - zaawansowane raporty
- **Integration APIs** - integracje zewnętrzne
- **Multi-language** - wielojęzyczność

---

## 🎓 WNIOSKI I NAUKA

### Co nauczyłem się podczas budowy:
1. **Full-stack development** - pełny cykl deweloperski
2. **API design** - projektowanie interfejsów
3. **Database design** - projektowanie bazy danych
4. **Mobile development** - programowanie mobilne
5. **Authentication** - systemy autoryzacji
6. **State management** - zarządzanie stanem
7. **UI/UX design** - projektowanie interfejsów

### Użyte wzorce projektowe:
- **MVC** - Model-View-Controller
- **Repository Pattern** - wzorzec repozytorium
- **Context API** - zarządzanie stanem React
- **Hooks** - funkcjonalne komponenty
- **REST API** - architektura REST

---

## 🔧 ROZWIĄZYWANIE PROBLEMÓW

### Częste problemy i rozwiązania:

#### 1. Błąd CORS
```python
# W backend-python/app/__init__.py
CORS(app, origins=['http://localhost:8100', 'http://localhost:5173'])
```

#### 2. Błąd autoryzacji
```typescript
// Sprawdź czy token jest dodawany do requestów
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### 3. Błąd połączenia z bazą
```python
# Sprawdź connection string w config.py
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://user:password@localhost/database'
```

---

## 📚 DOKUMENTACJA I ZASOBY

### Przydatne linki:
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

### Narzędzia deweloperskie:
- **VS Code** - edytor kodu
- **Postman** - testowanie API
- **MySQL Workbench** - zarządzanie bazą
- **Android Studio** - emulator Android
- **Expo Go** - testowanie mobilne

---

## 🎯 PODSUMOWANIE

Zbudowałem **kompletny system CRM** używając nowoczesnych technologii:

### ✅ Co zostało zrealizowane:
- **Backend API** - pełna funkcjonalność CRUD
- **Aplikacja Webowa** - kompletny panel administracyjny
- **Aplikacja Mobilna** - dostęp z urządzeń mobilnych
- **System Autoryzacji** - bezpieczne logowanie
- **Baza Danych** - strukturalne przechowywanie danych
- **Responsive Design** - dostosowanie do różnych ekranów

### 🚀 Kluczowe osiągnięcia:
- **Prosty kod** - łatwy do zrozumienia i modyfikacji
- **Modularna architektura** - łatwa rozszerzalność
- **Nowoczesne technologie** - aktualne narzędzia
- **Dokumentacja** - szczegółowe komentarze
- **Bezpieczeństwo** - implementacja best practices

### 📈 Wartość biznesowa:
- **Automatyzacja procesów** - usprawnienie pracy
- **Centralizacja danych** - jedno miejsce informacji
- **Dostęp mobilny** - praca z dowolnego miejsca
- **Skalowalność** - możliwość rozbudowy
- **Utrzymywalność** - łatwe wprowadzanie zmian

---

## 🏛️ ARCHITEKTURA I WZORCE PROJEKTOWE

### 📋 **DLACZEGO TAKA BUDOWA?**

#### **1. Separacja Warstw (Layered Architecture)**
```
┌─────────────────────────────────────┐
│           PRESENTATION LAYER        │ ← Frontend (React)
├─────────────────────────────────────┤
│           BUSINESS LAYER            │ ← Kontrolery (Controllers)
├─────────────────────────────────────┤
│           DATA ACCESS LAYER         │ ← Modele (Models)
├─────────────────────────────────────┤
│           DATABASE LAYER            │ ← Baza danych (MariaDB)
└─────────────────────────────────────┘
```

**Dlaczego taka separacja?**
- ✅ **Łatwość utrzymania** - każda warstwa ma swoją odpowiedzialność
- ✅ **Testowanie** - można testować każdą warstwę osobno
- ✅ **Skalowalność** - można wymieniać warstwy niezależnie
- ✅ **Zespół** - różni programiści mogą pracować nad różnymi warstwami

#### **2. Wzorzec MVC (Model-View-Controller)**

**MODEL** - reprezentuje dane i logikę biznesową
```python
# Przykład: app/models/user.py
class User(db.Model):
    """Model użytkownika - reprezentuje tabelę w bazie danych"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, nullable=False, unique=True)
    email = db.Column(db.Text, nullable=False, unique=True)
    password_hash = db.Column(db.Text, nullable=False)
    role_id = db.Column(db.Integer, nullable=False)
    
    def check_password(self, password):
        """Logika biznesowa - sprawdzanie hasła"""
        import bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
```

**Dlaczego Modele?**
- ✅ **Enkapsulacja** - dane i metody razem
- ✅ **Walidacja** - sprawdzanie poprawności danych
- ✅ **Relacje** - definiowanie powiązań między tabelami
- ✅ **ORM** - automatyczne mapowanie obiekt-relacja

**CONTROLLER** - obsługuje żądania HTTP i logikę aplikacji
```python
# Przykład: app/controllers/auth.py
@auth_bp.route('/login', methods=['POST'])
def login():
    """Kontroler logowania - obsługuje żądanie HTTP"""
    try:
        data = request.get_json()
        
        # Walidacja danych wejściowych
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username i password są wymagane'}), 400
        
        # Logika biznesowa - znajdź użytkownika
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Nieprawidłowe dane logowania'}), 401
        
        # Generowanie tokenu JWT
        token = auth_service.generate_token(user)
        
        # Zwróć odpowiedź
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

**Dlaczego Kontrolery?**
- ✅ **Routing** - mapowanie URL na funkcje
- ✅ **Walidacja** - sprawdzanie danych wejściowych
- ✅ **Autoryzacja** - kontrola dostępu
- ✅ **Formatowanie** - przygotowanie odpowiedzi JSON

**VIEW** - interfejs użytkownika (React komponenty)
```typescript
// Przykład: src/pages/LoginPage.tsx
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);  // Wywołanie kontrolera
      navigate('/dashboard');
    } catch (error) {
      console.error('Błąd logowania:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">Logowanie CRM</h1>
        <input
          type="text"
          placeholder="Nazwa użytkownika"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
          Zaloguj się
        </button>
      </form>
    </div>
  );
}
```

**Dlaczego Komponenty React?**
- ✅ **Reużywalność** - komponenty można używać wielokrotnie
- ✅ **Stan** - zarządzanie stanem aplikacji
- ✅ **Interaktywność** - obsługa zdarzeń użytkownika
- ✅ **Responsywność** - dostosowanie do różnych ekranów

### 🏗️ **STRUKTURA KATALOGÓW - DLACZEGO TAKA?**

#### **Backend Python:**
```
backend-python/
├── app/
│   ├── controllers/     # Kontrolery - obsługa HTTP
│   ├── models/         # Modele - reprezentacja danych
│   ├── services/       # Serwisy - logika biznesowa
│   ├── database/       # Konfiguracja bazy danych
│   └── middleware.py   # Middleware - autoryzacja, CORS
├── app.py             # Główny plik aplikacji
└── requirements.txt   # Zależności Python
```

**Dlaczego taka struktura?**
- ✅ **Separation of Concerns** - każdy katalog ma swoją rolę
- ✅ **Skalowalność** - łatwo dodawać nowe funkcjonalności
- ✅ **Testowanie** - można testować każdy moduł osobno
- ✅ **Zespół** - różni programiści mogą pracować nad różnymi modułami

#### **Frontend React:**
```
crm-ui/src/
├── components/        # Komponenty wielokrotnego użytku
├── pages/            # Strony aplikacji
├── context/          # Kontekst React (stan globalny)
├── services/         # Serwisy API
├── utils/            # Funkcje pomocnicze
└── types/            # Definicje typów TypeScript
```

**Dlaczego taka struktura?**
- ✅ **Modularność** - każdy katalog ma swoją funkcję
- ✅ **Organizacja** - łatwo znaleźć potrzebny kod
- ✅ **Współpraca** - zespół wie gdzie co umieścić
- ✅ **Utrzymanie** - łatwe wprowadzanie zmian

### 🔧 **WZORCE PROJEKTOWE W APLIKACJI**

#### **1. Repository Pattern (Wzorzec Repozytorium)**
```python
# Przykład: app/services/auth_service.py
class AuthService:
    """Serwis autoryzacji - enkapsuluje logikę biznesową"""
    
    def generate_token(self, user):
        """Generuje token JWT dla użytkownika"""
        payload = {
            'sub': str(user.id),
            'username': user.username,
            'email': user.email,
            'role': user.role.name if user.role else None,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
    
    def verify_token(self, token):
        """Weryfikuje token JWT"""
        try:
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
```

**Dlaczego Repository Pattern?**
- ✅ **Enkapsulacja** - logika biznesowa w jednym miejscu
- ✅ **Testowanie** - łatwe mockowanie serwisów
- ✅ **Reużywalność** - serwisy można używać w różnych kontrolerach
- ✅ **Utrzymanie** - zmiany w logice w jednym miejscu

#### **2. Dependency Injection (Wstrzykiwanie Zależności)**
```python
# Przykład: app/controllers/auth.py
auth_service = AuthService()  # Wstrzyknięcie serwisu

@auth_bp.route('/login', methods=['POST'])
def login():
    # Użycie wstrzykniętego serwisu
    token = auth_service.generate_token(user)
```

**Dlaczego Dependency Injection?**
- ✅ **Loose Coupling** - luźne powiązania między komponentami
- ✅ **Testowanie** - łatwe zastępowanie zależności
- ✅ **Konfiguracja** - łatwa zmiana implementacji
- ✅ **Modularność** - komponenty są niezależne

#### **3. Context Pattern (Wzorzec Kontekstu) - React**
```typescript
// Przykład: src/context/AuthContext.tsx
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
    const response = await api.post('/Auth/login', { username, password });
    const { token, user } = response.data;
    
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Dlaczego Context Pattern?**
- ✅ **Global State** - globalny stan aplikacji
- ✅ **Props Drilling** - unikanie przekazywania props przez wiele komponentów
- ✅ **Reużywalność** - kontekst można używać w całej aplikacji
- ✅ **Performance** - optymalizacja re-renderów

#### **4. Hooks Pattern (Wzorzec Hooków) - React**
```typescript
// Przykład: src/hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Użycie w komponencie:
export default function LoginPage() {
  const { login } = useAuth();  // Użycie hooka
  // ...
}
```

**Dlaczego Hooks Pattern?**
- ✅ **Reużywalność** - logika może być używana w wielu komponentach
- ✅ **Separacja** - oddzielenie logiki od UI
- ✅ **Testowanie** - łatwe testowanie logiki
- ✅ **Czytelność** - kod jest bardziej czytelny

### 🗄️ **BAZA DANYCH - DLACZEGO TAKA STRUKTURA?**

#### **Relacyjna baza danych (MariaDB/MySQL):**
```sql
-- Przykład struktury tabel
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    address TEXT,
    assigned_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP
);
```

**Dlaczego relacyjna baza danych?**
- ✅ **ACID** - gwarancje spójności danych
- ✅ **Relacje** - powiązania między tabelami
- ✅ **Walidacja** - ograniczenia na poziomie bazy
- ✅ **Transakcje** - atomowe operacje
- ✅ **Skalowalność** - obsługa dużych ilości danych

#### **ORM (Object-Relational Mapping) - SQLAlchemy:**
```python
# Przykład: app/models/customer.py
class Customer(db.Model):
    """Model klienta - mapuje tabelę customers"""
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text)
    phone = db.Column(db.Text)
    company = db.Column(db.Text)
    address = db.Column(db.Text)
    assigned_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacja z użytkownikiem
    assigned_user = db.relationship('User', backref='customers')
    
    def to_dict(self):
        """Konwertuje model do słownika"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'company': self.company,
            'address': self.address,
            'assigned_user_id': self.assigned_user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
```

**Dlaczego ORM?**
- ✅ **Abstrakcja** - nie trzeba pisać SQL
- ✅ **Bezpieczeństwo** - ochrona przed SQL injection
- ✅ **Portability** - łatwa zmiana bazy danych
- ✅ **Relacje** - automatyczne mapowanie relacji
- ✅ **Walidacja** - sprawdzanie na poziomie modelu

### 🔐 **BEZPIECZEŃSTWO - DLACZEGO TAKIE ROZWIĄZANIA?**

#### **1. JWT (JSON Web Tokens):**
```python
# Generowanie tokenu
payload = {
    'sub': str(user.id),
    'username': user.username,
    'email': user.email,
    'role': user.role.name,
    'exp': datetime.utcnow() + timedelta(hours=24)
}
token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
```

**Dlaczego JWT?**
- ✅ **Stateless** - serwer nie przechowuje sesji
- ✅ **Skalowalność** - łatwe skalowanie poziome
- ✅ **Cross-domain** - działa między domenami
- ✅ **Self-contained** - token zawiera wszystkie dane

#### **2. Hashowanie haseł (bcrypt):**
```python
@staticmethod
def hash_password(password):
    """Hashuje hasło używając bcrypt"""
    import bcrypt
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(self, password):
    """Sprawdza hasło używając bcrypt"""
    import bcrypt
    return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
```

**Dlaczego bcrypt?**
- ✅ **Salt** - automatyczne dodawanie soli
- ✅ **Adaptive** - można zwiększać koszt
- ✅ **Secure** - sprawdzony algorytm
- ✅ **Slow** - opóźnia ataki brute force

#### **3. CORS (Cross-Origin Resource Sharing):**
```python
# Konfiguracja CORS
CORS(app, origins=[
    'http://localhost:8100',  # Frontend
    'http://localhost:5173',  # Vite dev server
    'http://192.168.1.17:5000'  # Mobile
])
```

**Dlaczego CORS?**
- ✅ **Bezpieczeństwo** - kontrola dostępu między domenami
- ✅ **Flexibility** - konfiguracja dozwolonych źródeł
- ✅ **Standards** - standardowe rozwiązanie
- ✅ **Browser Support** - wsparcie we wszystkich przeglądarkach

### 📱 **APLIKACJA MOBILNA - DLACZEGO REACT NATIVE?**

#### **React Native vs Native:**
```
┌─────────────────────────────────────┐
│           REACT NATIVE              │
│  ┌─────────────┐  ┌─────────────┐   │
│  │   Android   │  │     iOS     │   │
│  └─────────────┘  └─────────────┘   │
│           ↓              ↓          │
│  ┌─────────────────────────────────┐ │
│  │        JavaScript Bridge        │ │
│  └─────────────────────────────────┘ │
│           ↓                         │
│  ┌─────────────────────────────────┐ │
│  │        React Components         │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Dlaczego React Native?**
- ✅ **Code Reuse** - jeden kod dla iOS i Android
- ✅ **Performance** - natywna wydajność
- ✅ **Ecosystem** - bogaty ekosystem React
- ✅ **Development Speed** - szybki rozwój
- ✅ **Hot Reload** - natychmiastowe podglądanie zmian

#### **Expo - dlaczego Expo?**
```json
// app.json - konfiguracja Expo
{
  "expo": {
    "name": "CRM Mobile",
    "slug": "crm-mobile",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "sdkVersion": "53.0.0"
  }
}
```

**Dlaczego Expo?**
- ✅ **Easy Setup** - łatwa konfiguracja
- ✅ **Built-in APIs** - gotowe API (camera, location, etc.)
- ✅ **OTA Updates** - aktualizacje bez App Store
- ✅ **Development Tools** - narzędzia deweloperskie
- ✅ **Publishing** - łatwe publikowanie

### 🎨 **FRONTEND - DLACZEGO REACT + TYPESCRIPT?**

#### **React - dlaczego React?**
```typescript
// Przykład komponentu React
interface Props {
  title: string;
  onSave: (data: any) => void;
}

export const CustomerForm: React.FC<Props> = ({ title, onSave }) => {
  const [formData, setFormData] = useState({});
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h1>{title}</h1>
      {/* Form fields */}
    </form>
  );
};
```

**Dlaczego React?**
- ✅ **Component-based** - komponenty wielokrotnego użytku
- ✅ **Virtual DOM** - wydajne renderowanie
- ✅ **Ecosystem** - bogaty ekosystem
- ✅ **Community** - duża społeczność
- ✅ **Learning Curve** - stosunkowo łatwa nauka

#### **TypeScript - dlaczego TypeScript?**
```typescript
// Przykład typowania
interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'User';
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

const fetchUser = async (id: number): Promise<ApiResponse<User>> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};
```

**Dlaczego TypeScript?**
- ✅ **Type Safety** - sprawdzanie typów w czasie kompilacji
- ✅ **IntelliSense** - autouzupełnianie w IDE
- ✅ **Refactoring** - bezpieczne refaktoryzacje
- ✅ **Documentation** - typy jako dokumentacja
- ✅ **Error Prevention** - zapobieganie błędom

### 🚀 **DEPLOYMENT - DLACZEGO DOCKER?**

#### **Docker - konteneryzacja:**
```yaml
# docker-compose.yml
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
    build: ./backend
    ports:
      - "5001:5000"
    depends_on:
      - db
  
  crm-ui:
    build: ./crm-ui
    ports:
      - "5173:80"
    depends_on:
      - crm-api
```

**Dlaczego Docker?**
- ✅ **Consistency** - identyczne środowisko
- ✅ **Isolation** - izolacja aplikacji
- ✅ **Scalability** - łatwe skalowanie
- ✅ **Portability** - działa wszędzie
- ✅ **DevOps** - łatwe wdrożenie

### 📊 **MONITORING I LOGGING - DLACZEGO TAKIE ROZWIĄZANIA?**

#### **System logów:**
```python
# Przykład logowania
from app.controllers.logs import log_system_event

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        # Logika logowania
        user = User.query.filter_by(username=data['username']).first()
        
        # Logowanie zdarzenia
        log_system_event(
            level='Information',
            message=f'Użytkownik {user.username} zalogował się pomyślnie',
            user_id=user.id,
            ip_address=request.remote_addr
        )
        
        return jsonify({'token': token}), 200
    except Exception as e:
        log_system_event(
            level='Error',
            message=f'Błąd logowania: {str(e)}',
            ip_address=request.remote_addr
        )
        return jsonify({'error': 'Błąd logowania'}), 500
```

**Dlaczego system logów?**
- ✅ **Debugging** - łatwe znajdowanie błędów
- ✅ **Monitoring** - monitorowanie aplikacji
- ✅ **Audit** - śledzenie działań użytkowników
- ✅ **Performance** - analiza wydajności
- ✅ **Security** - wykrywanie ataków

### 🎯 **PODSUMOWANIE ARCHITEKTURY**

#### **Dlaczego wybrałem taką architekturę?**

1. **Prostota** - łatwa do zrozumienia i utrzymania
2. **Skalowalność** - można łatwo rozszerzać
3. **Testowanie** - każdy komponent można testować osobno
4. **Współpraca** - zespół może pracować nad różnymi częściami
5. **Standards** - używa sprawdzonych wzorców i technologii
6. **Performance** - optymalna wydajność
7. **Security** - wbudowane zabezpieczenia
8. **Maintainability** - łatwe wprowadzanie zmian

#### **Korzyści dla biznesu:**
- ✅ **Szybki rozwój** - szybkie dodawanie nowych funkcji
- ✅ **Niskie koszty** - łatwe utrzymanie
- ✅ **Wysoka jakość** - mniej błędów
- ✅ **Skalowalność** - rośnie z biznesem
- ✅ **Bezpieczeństwo** - ochrona danych

#### **Korzyści dla deweloperów:**
- ✅ **Łatwa nauka** - prosty kod
- ✅ **Szybki development** - gotowe wzorce
- ✅ **Debugging** - łatwe znajdowanie błędów
- ✅ **Refactoring** - bezpieczne zmiany
- ✅ **Documentation** - kod jest dokumentacją

---

**Ta architektura została wybrana, aby stworzyć system, który jest prosty w utrzymaniu, łatwy do rozszerzania i bezpieczny w użyciu. Każdy wzorzec i technologia ma swoje uzasadnienie i przyczynia się do ogólnej jakości systemu.**

---

**Projekt demonstruje umiejętności full-stack development, znajomość nowoczesnych technologii oraz zdolność do budowy kompletnych systemów biznesowych.**
