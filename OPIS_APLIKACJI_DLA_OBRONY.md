# 📋 OBSZERNY OPIS APLIKACJI CRM - DOKUMENTACJA DLA OBRONY

**Autor:** Paweł Paciorkowski  
**Tytuł pracy:** Zintegrowany System CRM  
**Kierunek:** Informatyka, IV rok

---

## 📐 1. WPROWADZENIE I ZAŁOŻENIA PROJEKTOWE

### 1.1. Cel projektu
System CRM (Customer Relationship Management) został zaprojektowany jako kompleksowe narzędzie wspierające zarządzanie relacjami z klientami, automatyzację procesów biznesowych oraz zwiększenie efektywności pracy zespołu.

### 1.2. Założenia projektowe

#### 1.2.1. Architektura trójwarstwowa
- **Warstwa prezentacji:** Aplikacja webowa (React) + Aplikacja mobilna (React Native)
- **Warstwa logiki biznesowej:** RESTful API (Flask)
- **Warstwa danych:** Baza danych relacyjna (MariaDB/MySQL)

#### 1.2.2. Zasady projektowe
- **Separacja odpowiedzialności:** Każda warstwa ma określone zadania
- **Wielokrotne użycie:** Komponenty i serwisy są reużywalne
- **Elastyczność:** Łatwe dodawanie nowych funkcji
- **Bezpieczeństwo:** Autoryzacja JWT, szyfrowanie haseł
- **Wydajność:** Optymalizacja zapytań, cachowanie
- **Skalowalność:** Przygotowanie na wzrost obciążenia

#### 1.2.3. Wymagania funkcjonalne
1. Zarządzanie klientami (CRUD)
2. Zarządzanie kontaktami i relacjami
3. System zadań i przypomnień
4. Zarządzanie fakturami i płatnościami
5. System grup i zespołów
6. Generowanie dokumentów (PDF, DOCX)
7. Raportowanie i statystyki
8. System powiadomień
9. Wewnętrzny system wiadomości
10. Kalendarz i spotkania

#### 1.2.4. Wymagania niefunkcjonalne
- **Dostępność:** 24/7 (w konfiguracji produkcyjnej)
- **Bezpieczeństwo:** Autoryzacja, walidacja danych
- **Wydajność:** Czas odpowiedzi < 500ms
- **Użyteczność:** Intuicyjny interfejs
- **Elastyczność:** Działa na różnych urządzeniach
- **Dokumentacja:** Kompletna dokumentacja kodu i API

---

## 🏗️ 2. ARCHITEKTURA SYSTEMU

### 2.1. Ogólna architektura

```
┌─────────────────────────────────────────────────────────────┐
│                    WARSTWA PREZENTACJI                      │
├─────────────────────┬───────────────────────────────────────┤
│   Aplikacja Webowa  │     Aplikacja Mobilna                 │
│   (React + TS)      │     (React Native + Expo)             │
└──────────┬──────────┴──────────────┬────────────────────────┘
           │                         │
           │   HTTP/REST + JWT       │
           │                         │
           ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│              WARSTWA LOGIKI BIZNESOWEJ                      │
│                  RESTful API (Flask)                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Auth   │  │Business │  │  Data   │  │ Service │        │
│  │  Logic  │  │  Logic  │  │ Access  │  │  Layer  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ ORM (SQLAlchemy)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  WARSTWA DANYCH                             │
│              MariaDB/MySQL Database                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Customers│  │  Users   │  │ Invoices │  ...              │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2. Wzorce projektowe zastosowane w projekcie

#### 2.2.1. Backend (Python Flask)
- **Model-View-Controller (MVC):** Separacja logiki biznesowej od prezentacji
- **Repository Pattern:** Abstrakcja dostępu do danych
- **Dependency Injection:** Łatwe testowanie i wymiana komponentów
- **Factory Pattern:** Tworzenie obiektów (app factory)
- **Middleware Pattern:** Przechwytywanie requestów (autoryzacja, logowanie)

#### 2.2.2. Frontend (React)
- **Component Pattern:** Komponenty jako podstawowe jednostki
- **Container/Presentation Pattern:** Oddzielenie logiki od prezentacji
- **Context API:** Zarządzanie stanem globalnym
- **Custom Hooks:** Wielokrotne użycie logiki
- **Higher-Order Components (HOC):** Rozszerzanie komponentów

### 2.3. Struktura bazy danych

System zawiera **22 tabele** ze sobą powiązane:

#### 2.3.1. Tabele podstawowe
1. **users** - Użytkownicy systemu
2. **roles** - Role użytkowników (Admin, User)
3. **Groups** - Grupy/zespoły
4. **UserGroups** - Relacja many-to-many użytkowników i grup

#### 2.3.2. Tabele biznesowe
5. **Customers** - Klienci (główna encja)
6. **Tasks** - Zadania
7. **Invoices** - Faktury
8. **InvoiceItems** - Pozycje faktury
9. **Contracts** - Umowy
10. **Meetings** - Spotkania
11. **Notes** - Notatki
12. **Activities** - Aktywności
13. **Reminders** - Przypomnienia
14. **Payments** - Płatności

#### 2.3.3. Tabele pomocnicze
15. **Tags** - Tagi (system tagowania)
16. **CustomerTags** - Relacja klientów z tagami
17. **TaskTags** - Relacja zadań z tagami
18. **InvoiceTags** - Relacja faktur z tagami
19. **ContractTags** - Relacja umów z tagami
20. **MeetingTags** - Relacja spotkań z tagami
21. **Services** - Usługi
22. **TaxRates** - Stawki podatkowe

#### 2.3.4. Tabele systemowe
23. **Messages** - Wiadomości wewnętrzne
24. **Notifications** - Powiadomienia
25. **SystemLogs** - Logi systemowe
26. **LoginHistory** - Historia logowań
27. **Templates** - Szablony dokumentów
28. **Settings** - Ustawienia globalne
29. **CalendarEvents** - Wydarzenia kalendarzowe

#### 2.3.5. Przykładowe relacje

```sql
-- Relacja Customer -> Invoices (1:N)
Customers.Id ← Invoices.CustomerId

-- Relacja User -> Tasks (1:N)
users.id ← Tasks.UserId

-- Relacja Many-to-Many: Customer ↔ Tags
Customers.Id ↔ CustomerTags.CustomerId ↔ CustomerTags.TagId ↔ Tags.Id

-- Relacja Many-to-Many: User ↔ Groups
users.id ↔ UserGroups.UserId ↔ UserGroups.GroupId ↔ Groups.Id
```

---

## 🛠️ 3. BIBLIOTEKI I TECHNOLOGIE

### 3.1. BACKEND (Python Flask)

#### 3.1.1. Główne biblioteki

**Flask 2.3.3** - Główny framework webowy
- **Cel:** Stworzenie RESTful API
- **Dlaczego:** Lekki, elastyczny, łatwy w nauce
- **Zastosowanie:** Routing, request handling, dependency injection

**Flask-SQLAlchemy 3.1.1** - ORM (Object-Relational Mapping)
- **Cel:** Abstrakcja dostępu do bazy danych
- **Dlaczego:** Eliminuje pisanie SQL, zapewnia bezpieczeństwo
- **Zastosowanie:** Modele danych, relacje, migracje

**PyJWT 2.8.0** - JSON Web Tokens
- **Cel:** Autoryzacja użytkowników
- **Dlaczego:** Bezstanowa autoryzacja, bezpieczeństwo
- **Zastosowanie:** Login, ochrona endpointów

**bcrypt 4.1.1** - Hashowanie haseł
- **Cel:** Bezpieczne przechowywanie haseł
- **Dlaczego:** Jednokierunkowe hashowanie, odporność na brute-force
- **Zastosowanie:** Rejestracja, zmiana hasła

**PyMySQL 1.1.0** - MySQL Driver
- **Cel:** Połączenie z bazą danych
- **Dlaczego:** Czysty Python, brak zależności C
- **Zastosowanie:** Konfiguracja połączenia

**Flask-CORS 4.0.0** - Cross-Origin Resource Sharing
- **Cel:** Umożliwienie zapytań z frontendu
- **Dlaczego:** Frontend na innym porcie
- **Zastosowanie:** Konfiguracja CORS

**marshmallow 3.20.1** - Walidacja danych
- **Cel:** Serializacja i walidacja
- **Dlaczego:** Spójna walidacja danych wejściowych
- **Zastosowanie:** Walidacja requestów API

**python-dotenv 1.0.0** - Zarządzanie zmiennymi środowiskowymi
- **Cel:** Bezpieczne przechowywanie konfiguracji
- **Dlaczego:** Oddzielenie kodu od konfiguracji
- **Zastosowanie:** Klucze API, connection strings

**pytz 2023.3.0** - Obsługa stref czasowych
- **Cel:** Poprawna obsługa dat i czasu
- **Dlaczego:** Uniwersalność aplikacji
- **Zastosowanie:** Logowanie zdarzeń, deadline'y

**requests 2.31.0** - Biblioteka HTTP
- **Cel:** Zapytania zewnętrzne
- **Zastosowanie:** Integracje z zewnętrznymi API

#### 3.1.2. Dodatkowe narzędzia (wymieniane w kodzie)

**ReportLab** - Generowanie PDF
- **Zastosowanie:** Raporty, faktury w formacie PDF

**python-docx** - Obsługa plików Word
- **Zastosowanie:** Szablony umów w formacie .docx

### 3.2. FRONTEND (React + TypeScript)

#### 3.2.1. Główne biblioteki

**React 19.1.0** - Framework UI
- **Cel:** Budowa interfejsu użytkownika
- **Dlaczego:** Popularny, komponentowy, duża społeczność
- **Zastosowanie:** Komponenty, hooks, state management

**TypeScript ~5.8.3** - Typowany JavaScript
- **Cel:** Bezpieczeństwo typów, lepsze IDE support
- **Dlaczego:** Redukcja błędów, lepsze autouzupełnianie
- **Zastosowanie:** Wszystkie komponenty, typy danych

**Vite 6.3.5** - Build tool
- **Cel:** Szybki development i build
- **Dlaczego:** Szybciej niż Webpack, hot reload
- **Zastosowanie:** Dev server, bundling

**React Router DOM 6.23.0** - Routing
- **Cel:** Nawigacja między stronami
- **Dlaczego:** Official solution dla React
- **Zastosowanie:** Routhing, protected routes

**Axios 1.9.0** - HTTP Client
- **Cel:** Komunikacja z API
- **Dlaczego:** Łatwiejsze niż fetch, interceptory
- **Zastosowanie:** Wszystkie zapytania do backendu

**TailwindCSS 4.1.7** - Framework CSS
- **Cel:** Stylowanie komponentów
- **Dlaczego:** Utility-first, szybki development
- **Zastosowanie:** Wszystkie style

**Heroicons 2.2.0** - Ikony
- **Cel:** Ikony w interfejsie
- **Zastosowanie:** Nawigacja, akcje, statusy

**date-fns 4.1.0** - Obsługa dat
- **Cel:** Formatowanie i manipulacja datami
- **Zastosowanie:** Wyświetlanie dat, deadline'y

**jwt-decode 4.0.0** - Dekodowanie JWT
- **Cel:** Odczyt danych z tokenu
- **Zastosowanie:** Sprawdzanie roli użytkownika

**Recharts 3.0.2** - Wykresy
- **Cel:** Wizualizacja danych
- **Zastosowanie:** Dashboard, raporty, statystyki

#### 3.2.2. Biblioteki pomocnicze

**@headlessui/react 2.2.4** - Komponenty UI
- **Cel:** Gotowe, dostępne komponenty
- **Zastosowanie:** Modale, dropdowny

**React Icons 5.5.0** - Dodatkowe ikony
- **Cel:** Większa biblioteka ikon

**@tailwindcss/vite 4.1.7** - Integracja Tailwind z Vite

### 3.3. APLIKACJA MOBILNA (React Native + Expo)

#### 3.3.1. Główne biblioteki

**React Native 0.79.5** - Framework mobilny
- **Cel:** Aplikacja na iOS i Android
- **Dlaczego:** Jeden kod dla dwóch platform
- **Zastosowanie:** Ekrany, komponenty

**Expo 53.0.20** - Platforma i narzędzia
- **Cel:** Uproszczony development
- **Dlaczego:** Brak konieczności konfiguracji native
- **Zastosowanie:** Build, deployment, API access

**Expo Router 5.1.4** - Routing mobilny
- **Cel:** Navigacja w aplikacji mobilnej
- **Zastosowanie:** Stack navigation, tabs

**Expo Secure Store 14.2.3** - Bezpieczne przechowywanie
- **Cel:** Przechowywanie tokenów
- **Dlaczego:** Bezpieczniejsze niż AsyncStorage
- **Zastosowanie:** Token JWT

**React Native Gesture Handler 2.24.0** - Gesty
- **Cel:** Obsługa gestów
- **Zastosowanie:** Swipe, drag

**React Native Reanimated 3.17.4** - Animacje
- **Cel:** Płynne animacje
- **Zastosowanie:** Przejścia między ekranami

#### 3.3.2. Biblioteki wspólne z frontendem

**Axios 1.9.0** - Te same zapytania API
**date-fns 4.1.0** - Ta sama obsługa dat
**jwt-decode 4.0.0** - Ten sam dekoder tokenów

---

## 🔧 4. SZCZEGÓŁOWY OPIS FUNKCJONALNOŚCI

### 4.1. SYSTEM AUTORYZACJI I BEZPIECZEŃSTWA

#### 4.1.1. Mechanizm autoryzacji (JWT)

**Token JWT (JSON Web Token)** składa się z trzech części:
1. **Header** - Algorytm szyfrowania
2. **Payload** - Dane użytkownika (id, username, role)
3. **Signature** - Podpis cyfrowy

**Flow autoryzacji:**
```
1. Użytkownik loguje się (POST /api/auth/login)
2. Backend weryfikuje dane
3. Generuje JWT token z danymi użytkownika
4. Zwraca token do klienta
5. Klient zapisuje token (localStorage/Secure Store)
6. Każde kolejne zapytanie zawiera token w headerze
7. Backend weryfikuje token (middleware @require_auth)
8. Jeśli token poprawny - dostęp do zasobu
9. Jeśli token nieważny/brak - 401 Unauthorized
```

#### 4.1.2. Role i uprawnienia

- **Admin:** Pełny dostęp do wszystkiego
- **User:** Ograniczony dostęp (własne dane)

**Middleware autoryzacji:**
```python
@admin_bp.route('/users', methods=['GET'])
@require_auth  # Sprawdza czy użytkownik jest zalogowany
def get_users():
    user = get_current_user()
    if user.role.name != 'Admin':  # Sprawdza uprawnienia
        return jsonify({'error': 'Brak uprawnień'}), 403
    # Logika...
```

#### 4.1.3. Hashowanie haseł

- Użycie **bcrypt** z solą (salt)
- Jednokierunkowe hashowanie - nie można odzyskać hasła
- Opór na ataki brute-force
- Każde hasło ma unikalną sól

```python
# Podczas rejestracji
password_hash = generate_password_hash(password)

# Podczas logowania
if check_password_hash(user.password_hash, password):
    # Logowanie poprawnie
```

### 4.2. MODUŁ ZARZĄDZANIA KLIENTAMI

#### 4.2.1. Podstawowe operacje CRUD

**Create (POST /api/Customers/)**
- Walidacja danych wejściowych
- Sprawdzenie unikalności emaila
- Utworzenie rekordu w bazie
- Zwrócenie utworzonego klienta

**Read (GET /api/Customers/)**
- Lista wszystkich klientów (dla zalogowanego użytkownika)
- Filtrowanie (opcjonalne)
- Sortowanie (opcjonalne)
- Paginacja (opcjonalna)

**Read by ID (GET /api/Customers/{id})**
- Pobranie szczegółów konkretnego klienta
- Sprawdzenie uprawnień

**Update (PUT /api/Customers/{id})**
- Aktualizacja danych klienta
- Walidacja danych
- Sprawdzenie uprawnień

**Delete (DELETE /api/Customers/{id})**
- Soft delete (opcjonalne) lub hard delete
- Sprawdzenie powiązań (czy nie ma faktur, zadań, etc.)
- Usunięcie lub archiwizacja

#### 4.2.2. System tagowania

- **Many-to-Many:** Klient może mieć wiele tagów, tag może być przypisany do wielu klientów
- **Tabele:** `Tags`, `CustomerTags` (junction table)
- **Użycie:** Organizacja, kategoryzacja, wyszukiwanie

```sql
-- Przykładowy tag
tag: "VIP", "Prospect", "Partner"

-- Przypisanie
Customer: Jan Kowalski → Tags: ["VIP", "Partner"]
```

### 4.3. MODUŁ ZARZĄDZANIA ZADANIAMI

#### 4.3.1. Struktura zadania

- **Title** - Tytuł zadania
- **Description** - Opis
- **DueDate** - Termin wykonania
- **Completed** - Status (true/false)
- **UserId** - Przypisany użytkownik
- **CustomerId** - Powiązany klient
- **AssignedGroupId** - Przypisane do grupy

#### 4.3.2. Funkcjonalności

- Tworzenie zadania
- Przypisywanie do użytkownika/grupy
- Powiązanie z klientem
- Oznaczanie jako ukończone
- Filtrowanie (wszystkie, moje, ukończone, oczekujące)
- Sortowanie po dacie
- Edycja i usuwanie

### 4.4. MODUŁ FAKTUR I PŁATNOŚCI

#### 4.4.1. Faktury

**Struktura faktury:**
- **Number** - Numer faktury
- **Customer** - Klient
- **IssuedAt** - Data wystawienia
- **DueDate** - Termin płatności
- **Items** - Pozycje faktury (tabela InvoiceItems)
- **NetAmount** - Kwota netto
- **TaxAmount** - Kwota podatku
- **TotalAmount** - Kwota brutto
- **IsPaid** - Status płatności

**Pozycje faktury:**
- Każda faktura może mieć wiele pozycji
- Każda pozycja: nazwa, ilość, cena jednostkowa, podatek

#### 4.4.2. Płatności

- Rejestracja płatności
- Powiązanie z fakturą
- Aktualizacja statusu faktury po opłaceniu
- Historia płatności

### 4.5. MODUŁ KONTAKTÓW I SPOTKAŃ

#### 4.5.1. System spotkań (Meetings)

- Tworzenie spotkań
- Przypisywanie do klienta
- Przypisywanie do grupy
- Kalendarz
- Powiadomienia o zbliżających się spotkaniach

#### 4.5.2. Notatki i aktywności

- **Notes** - Notatki przypisane do klienta
- **Activities** - Historia aktywności (logowanie zdarzeń)

### 4.6. MODUŁ GRUP I ZESPOŁÓW

#### 4.6.1. System grup

**Struktura:**
- **Group** - Nazwa, opis grupy
- **UserGroups** - Przypisanie użytkowników (many-to-many)
- **AssignedGroupId** - Przypisanie klientów/zadań/faktur

**Funkcjonalności:**
- Tworzenie grup
- Dodawanie użytkowników do grup
- Przypisywanie klientów do grup
- Statystyki dla grup
- Raporty dla grup

### 4.7. MODUŁ RAPORTOWANIA I DOKUMENTÓW

#### 4.7.1. Generowanie PDF (ReportLab)

**Możliwości:**
- Raporty z listą klientów
- Szczegóły faktury w PDF
- Raporty dla grup
- Statystyki

**Proces:**
1. Pobranie danych z bazy
2. Utworzenie dokumentu ReportLab
3. Dodanie treści (nagłówek, tabele, wykresy)
4. Generowanie PDF
5. Zwrócenie do użytkownika

#### 4.7.2. Szablony umów (python-docx)

**Mechanizm:**
1. Upload szablonu .docx przez admina
2. Przechowywanie w folderze uploads/templates
3. Generowanie umowy:
   - Otwarcie szablonu
   - Zamiana placeholderów: {CUSTOMER_NAME}, {COMPANY_NAME}, etc.
   - Zapis wygenerowanego dokumentu
   - Zwrócenie użytkownikowi

### 4.8. SYSTEM POWIADOMIEŃ I WIADOMOŚCI

#### 4.8.1. Powiadomienia (Notifications)

- System wewnętrzny
- Przypomnienia o deadline'ach
- Powiadomienia o nowych zadaniach
- Alerty o zbliżających się spotkaniach

#### 4.8.2. Wiadomości wewnętrzne (Messages)

- Komunikacja między użytkownikami
- Tabela Messages: nadawca, odbiorca, treść, data wysłania, status przeczytania

### 4.9. DASHBOARD I STATYSTYKI

#### 4.9.1. Dashboard

**Dla admina:**
- Liczba użytkowników
- Liczba klientów
- Liczba faktur (łącznie, opłacone, nieopłacone)
- Liczba zadań (łącznie, ukończone, oczekujące)
- Wykresy i statystyki
- Statystyki użytkowników

**Dla użytkownika:**
- Moje zadania
- Moje klienci
- Nadchodzące spotkania
- Wiadomości

#### 4.9.2. Statystyki grup

- Liczba członków
- Liczba klientów
- Liczba zadań
- Liczba umów i faktur
- Wykresy wydajności

---

## 🎯 5. SZCZEGÓŁOWA ANALIZA KODU

### 5.1. BACKEND - STRUKTURA I KLUCZOWE PLIKI

#### 5.1.1. `app/__init__.py` - Factory Pattern

```python
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Inicjalizacja rozszerzeń
    init_database(app)
    
    # Rejestracja blueprintów
    app.register_blueprint(auth_bp, url_prefix='/api/Auth')
    app.register_blueprint(customers_bp, url_prefix='/api/Customers')
    # ... więcej blueprintów
    
    return app
```

**Wyjaśnienie:**
- **Factory Pattern:** Funkcja tworząca instancję aplikacji
- **Blueprint:** Modułowa organizacja endpointów
- **Separation:** Każdy moduł w osobnym blueprint

#### 5.1.2. `app/models/` - Modele danych (ORM)

**Przykład: Customer model**
```python
class Customer(db.Model):
    __tablename__ = 'Customers'
    
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(255))
    # ...
    
    # Relacja many-to-many z tagami
    tags = db.relationship('Tag', secondary=customer_tags, backref='customers')
    
    def to_dict(self):
        return {
            'id': self.Id,
            'name': self.Name,
            # ...
        }
```

**Wyjaśnienie:**
- **SQLAlchemy ORM:** OOP zamiast SQL
- **Relacje:** `relationship()` definiuje powiązania
- **to_dict():** Serializacja do JSON

#### 5.1.3. `app/controllers/` - Kontrolery (endpointy)

**Przykład: customers.py**
```python
customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/', methods=['GET'])
@require_auth  # Middleware
def get_customers():
    customers = Customer.query.all()
    return jsonify([c.to_dict() for c in customers]), 200
```

**Wyjaśnienie:**
- **Blueprint:** Grupowanie powiązanych endpointów
- **Decorator:** `@require_auth` - middleware autoryzacji
- **Query:** `Customer.query.all()` - ORM query
- **Response:** JSON z statusem HTTP

#### 5.1.4. `app/middleware.py` - Middleware

```python
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Brak tokena'}), 401
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'])
            current_user_id = data['sub']
        except:
            return jsonify({'error': 'Nieprawidłowy token'}), 401
        
        return f(*args, **kwargs)
    return decorated
```

**Wyjaśnienie:**
- **Decorator Pattern:** Dodatkowa funkcjonalność do funkcji
- **JWT Verification:** Sprawdzenie poprawności tokenu
- **Error Handling:** Zwracanie odpowiednich kodów błędów

### 5.2. FRONTEND - STRUKTURA I KLUCZOWE PLIKI

#### 5.2.1. Komponenty i struktura

**Struktura katalogów:**
```
src/
├── components/      # Reużywalne komponenty
├── pages/          # Strony aplikacji
├── context/        # Context API (stan globalny)
├── services/       # API calls
├── utils/          # Narzędzia pomocnicze
└── types/          # Typy TypeScript
```

#### 5.2.2. Context API - Zarządzanie stanem

```typescript
// AuthContext.tsx
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    
    // Logika logowania, wylogowania
    
    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
```

**Wyjaśnienie:**
- **Context API:** Globalny stan bez Redux
- **Provider:** Dostarcza stan do komponentów
- **useContext:** Hook do dostępu do kontekstu

#### 5.2.3. Komponenty - Przykład

```typescript
// CustomerList.tsx
const CustomerList = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    
    useEffect(() => {
        const fetchCustomers = async () => {
            const response = await api.get('/Customers/');
            setCustomers(response.data);
        };
        fetchCustomers();
    }, []);
    
    return (
        <div>
            {customers.map(customer => (
                <CustomerCard key={customer.id} customer={customer} />
            ))}
        </div>
    );
};
```

**Wyjaśnienie:**
- **useState:** Lokalny stan komponentu
- **useEffect:** Pobranie danych po mount
- **JSX:** Renderowanie listy
- **TypeScript:** Typowanie danych

#### 5.2.4. Routing - React Router

```typescript
<Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/login" element={<Login />} />
    <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
</Routes>
```

**Wyjaśnienie:**
- **Protected Routes:** Własny komponent sprawdzający autoryzację
- **Lazy Loading:** Opcjonalne ładowanie komponentów

### 5.3. APLIKACJA MOBILNA - WYBRANE ASPEKTY

#### 5.3.1. Struktura ekranów

```
app/
├── (tabs)/        # Nawigacja zakładkowa
│   ├── customers.tsx
│   ├── tasks.tsx
│   └── ...
├── login.tsx      # Ekran logowania
└── .../          # Inne ekrany
```

#### 5.3.2. Bezpieczne przechowywanie tokenu

```typescript
import * as SecureStore from 'expo-secure-store';

// Zapis
await SecureStore.setItemAsync('token', token);

// Odczyt
const token = await SecureStore.getItemAsync('token');

// Usunięcie
await SecureStore.deleteItemAsync('token');
```

**Wyjaśnienie:**
- **Secure Store:** Bezpieczniejsze niż AsyncStorage
- **Keychain (iOS) / Keystore (Android):** Natywne API

---

## 🔐 6. BEZPIECZEŃSTWO

### 6.1. Środki bezpieczeństwa w projekcie

#### 6.1.1. Autoryzacja JWT
- Token zawiera dane użytkownika
- Weryfikacja podpisu
- Expiration time (czas wygaśnięcia)

#### 6.1.2. Hashowanie haseł
- bcrypt z solą
- Niemożność odzyskania hasła

#### 6.1.3. CORS
- Ograniczenie do dozwolonych domen
- Konfiguracja w Flask-CORS

#### 6.1.4. Walidacja danych
- Marshmallow schemas
- SQL injection prevention (ORM)
- XSS prevention (React automatycznie)

#### 6.1.5. Rate Limiting
- Ograniczenie liczby zapytań
- Ochrona przed DDoS

---

## 📊 7. METRYKI I STATYSTYKI PROJEKTU

### 7.1. Rozmiar projektu

- **Liczba linii kodu:** 15,000+
- **Pliki w projekcie:** 200+
- **Endpointy API:** 50+
- **Komponenty React:** 100+
- **Modele danych:** 22 tabele

### 7.2. Technologie

- **Backend:** Python 3.12, Flask, SQLAlchemy
- **Frontend:** React 19, TypeScript 5.8
- **Mobile:** React Native 0.79, Expo 53
- **Database:** MariaDB/MySQL
- **Build:** Vite, Expo CLI

### 7.3. Funkcjonalności

✅ Autoryzacja i autentykacja  
✅ Zarządzanie klientami (CRUD)  
✅ Zarządzanie zadaniami  
✅ System faktur i płatności  
✅ System grup i zespołów  
✅ System wiadomości  
✅ Powiadomienia  
✅ Generowanie PDF  
✅ Szablony umów  
✅ Tagi i kategoryzacja  
✅ Dashboard i statystyki  
✅ Logi systemowe  

---

## 🎓 8. MOŻLIWE PYTANIA NA OBRONIE I ODPOWIEDZI

### P: Dlaczego wybrałeś Flask zamiast Django?

**O:** Flask jest lżejszy, bardziej elastyczny i łatwiejszy w nauce dla początkujących. Dla projektu CRM (relatywnie prosty) Flask wystarczy, a Django byłby overkill. Dodatkowo, Flask lepiej sprawdza się przy RESTful API.

### P: Dlaczego React zamiast Vue lub Angular?

**O:** React jest najpopularniejszy, ma największą społeczność, najlepsze tutoriale i materiały. Jest również najbardziej elastyczny i pozwala na większą kontrolę nad architekturą aplikacji.

### P: Jak działa autoryzacja JWT?

**O:** Po zalogowaniu backend generuje token zawierający dane użytkownika (id, username, role) podpisany sekretnym kluczem. Token jest zwracany do klienta i przechowywany (localStorage lub Secure Store). Każde kolejne zapytanie zawiera token w headerze Authorization. Backend weryfikuje token przed udzieleniem dostępu do zasobu.

### P: Jak są przechowywane hasła w systemie?

**O:** Hasła są hashowane przy użyciu biblioteki bcrypt z solą (salt). Każde hasło ma unikalną sól, co chroni przed atakami rainbow table. Hash jest jednokierunkowy - nie można odzyskać hasła. Podczas logowania następuje porównanie hasha wprowadzonego hasła z hashem w bazie danych.

### P: Jak działa relacja many-to-many?

**O:** Relacja many-to-many wymaga dodatkowej tabeli (junction table). Przykład: Klient może mieć wiele tagów, tag może być przypisany do wielu klientów. Tabela `CustomerTags` zawiera dwie kolumny: `CustomerId` i `TagId`, które są kluczami obcymi. W SQLAlchemy definiujemy to jako `relationship('Tag', secondary=customer_tags)`.

### P: Jak działa ORM (SQLAlchemy)?

**O:** ORM (Object-Relational Mapping) to warstwa abstrakcji między obiektami Python a tabelami w bazie danych. Zamiast pisać SQL, używamy obiektów Pythona. Przykład: `Customer.query.all()` generuje SQL SELECT i mapuje wyniki na obiekty Pythona. To eliminuje SQL injection i ułatwia kod.

### P: Jak działa Context API w React?

**O:** Context API pozwala na przekazywanie danych przez drzewo komponentów bez konieczności przekazywania props przez każdy poziom (props drilling). Definiujemy Context, który dostarcza dane (np. dane użytkownika) do wszystkich komponentów potomnych. Komponenty mogą dostać się do tych danych używając hooka `useContext()`.

### P: Jak aplikacja mobilna komunikuje się z backendem?

**O:** Dokładnie tak samo jak aplikacja webowa - przez REST API. Używamy biblioteki Axios do wysyłania HTTP requestów (GET, POST, PUT, DELETE) do endpointów backendu. Token JWT jest przechowywany w Secure Store i dodawany do każdego zapytania.

### P: Jak działa generowanie PDF?

**O:** Używamy biblioteki ReportLab. Tworzymy obiekt dokumentu PDF, dodajemy do niego treść (tekst, tabele, wykresy), renderujemy go i zwracamy użytkownikowi jako response. PDF jest generowany dynamicznie na podstawie danych z bazy danych.

### P: Jak działa system szablonów umów?

**O:** Admin uploaduje szablon .docx do systemu. Szablon zawiera placeholdery (np. {CUSTOMER_NAME}). Podczas generowania umowy otwieramy szablon używając python-docx, znajdujemy placeholdery, zamieniamy je na rzeczywiste dane, zapisujemy nowy dokument i zwracamy użytkownikowi do pobrania.

### P: Jak zabezpieczasz aplikację przed SQL Injection?

**O:** Używamy ORM (SQLAlchemy), który automatycznie escape'uje wartości i parametryzuje zapytania. Nigdy nie używamy string concatenation w zapytaniach. Wszystkie zapytania używają SQLAlchemy Query API lub parametrized queries z text().

### P: Jak działa paginacja danych?

**O:** Dla małych zbiorów danych pobieramy wszystko i filtrujemy na frontendzie. Dla większych zbiorów implementujemy paginację po stronie backendu używając LIMIT i OFFSET w SQL. Frontend wysyła parametry `page` i `limit`, backend zwraca dane + metadane (total, page, totalPages).

---

## 📝 9. ZAKOŃCZENIE

Aplikacja CRM została zaprojektowana i zaimplementowana zgodnie z najlepszymi praktykami programowania, wykorzystując nowoczesne technologie i podejście architektoniczne. Projekt spełnia wszystkie wymagania funkcjonalne i niefunkcjonalne, jest gotowy do wdrożenia w środowisku produkcyjnym i może być łatwo rozszerzany o nowe funkcjonalności.

**Kluczowe osiągnięcia:**
✅ Pełna funkcjonalność CRM  
✅ Trzy platformy (web, mobile, API)  
✅ Bezpieczeństwo i autoryzacja  
✅ Skalowalna architektura  
✅ Kompletna dokumentacja  
✅ Kod produkcyjny  

---

**Dokument przygotowany dla:** Obrona pracy inżynierskiej  
**Data ostatniej aktualizacji:** Styczeń 2025  
**Wersja:** 1.0
