# OPIS PROCESU BUDOWY APLIKACJI CRM - KROK PO KROKU  
## Jak budowałem aplikację, dlaczego i jak działa kod - komentarze, wytłumaczenia i przykłady zastosowania w kodzie

---
**Autor:** Paweł Paciorkowski  
**Cel dokumentu:** Szczegółowe, zrozumiałe opisanie jak budowałem aplikację CRM – krok po kroku, z wyjaśnieniem decyzji technicznych oraz przykładami ich wdrożenia w kodzie, aby można to było łatwo opowiedzieć swoimi słowami promotorowi.

---

## SPIS TREŚCI

1. [Początki - Od czego zacząłem](#1-początki---od-czego-zacząłem)
2. [Budowa Backendu - Flask API](#2-budowa-backendu---flask-api)
3. [System autoryzacji JWT](#3-system-autoryzacji-jwt)
4. [Baza danych i modele](#4-baza-danych-i-modele)
5. [Kontrolery i logika biznesowa](#5-kontrolery-i-logika-biznesowa)
6. [Frontend - React aplikacja](#6-frontend---react-aplikacja)
7. [Aplikacja mobilna](#7-aplikacja-mobilna)
8. [Funkcje zaawansowane](#8-funkcje-zaawansowane)
9. [Testowanie i wdrożenie](#9-testowanie-i-wdrożenie)

---

## 1. POCZĄTKI - OD CZEGO ZACZĄŁEM

### 1.1. Analiza wymagań

- Na samym początku zebrałem wymagania do pracy inżynierskiej. Musiałem zaplanować, jakie elementy systemu są potrzebne, by końcowy produkt spełniał oczekiwania.
- Zdecydowałem, żeby aplikacja działała zarówno na komputerze (web), jak i na telefonie (aplikacja mobilna), a sam backend (czyli "mózg systemu") był wspólny dla wszystkich urządzeń.

**Dlaczego?**  
→ Takie podejście daje elastyczność – jeden serwer obsłuży różne aplikacje, łatwiej dodać kolejne platformy (np. tablet), można utrzymać spójną logikę i łatwiej rozwijać system w przyszłości.

**Przykład zastosowania w kodzie:**  
Podczas implementacji zaplanowałem, by backend miał endpointy wspólne dla weba i mobile — np. obie aplikacje korzystają z `/api/Auth/login`, `/api/Customers`, itp.

### 1.2. Wybór technologii

- Do każdego "kawałka" systemu dobrałem technologie na podstawie własnych doświadczeń, dostępnej dokumentacji oraz popularności danych rozwiązań.

**Backend: Python + Flask**  
Wybrałem *Flaska*, ponieważ:
- Flask jest prosty, lekki i łatwo można dodawać własną logikę – mam dużą kontrolę nad kodem.
- W przeciwieństwie do Django, Flask nie narzuca sztywnej struktury i łatwiej zacząć małe/średnie projekty API.

```python
# Przykład bardzo prostego startu aplikacji w Flasku:
app = Flask(__name__)
app.config.from_object(Config) # Ładuje ustawienia np. połączenie z bazą
```

**Frontend: React + TypeScript**  
- React jest obecnie najpopularniejszym narzędziem do tworzenia nowoczesnych interfejsów użytkownika, społeczność jest ogromna, więc łatwo znaleźć pomoc czy gotowe komponenty.
- TypeScript pozwala pisać "bezpieczniej" - sprawdza typy danych już podczas kodowania, dzięki czemu łatwiej unikać głupich błędów.

**Przykład zastosowania w kodzie:**  
Cały frontend to projekt w folderze `crm-ui/` oparty o React, a pliki mają rozszerzenia `.tsx`, np. `CustomersPage.tsx`.

**Aplikacja mobilna: React Native + Expo**  
- Stawiając na React Native mogę wykorzystywać dużo wiedzy i kodu z webowego frontendu.
- Expo pozwala szybko rozwijać aplikację na telefon, nie wymagając specjalnie konfigurowanych środowisk i zaawansowanych narzędzi Android/iOS.

**Przykład w kodzie:**  
Projekt mobilny znajduje się w folderze `crm-mobile/` i większość podstawowych widoków (np. lista klientów, ekran profilu) powiela strukturę komponentów z weba.

**Baza danych: MariaDB/MySQL**  
- Popularna, szybka, sprawdzona relacyjna baza danych, świetnie integruje się z Pythonem oraz dobrze obsługuje złożone relacje danych, które są potrzebne w aplikacji CRM.

**Przykład w kodzie:**  
W pliku `config.py` ustalam połączenie z bazą:  
```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://user:pass@localhost/crm_db'
```

---

## 2. BUDOWA BACKENDU - FLASK API

### 2.1. Struktura projektu

- Zanim napisałem pierwszą linijkę logiki, zaplanowałem strukturę katalogów – dzięki temu łatwiej wszystko znaleźć i zarządzać rozbudową kodu:

```
backend-python/
├── app/
│   ├── __init__.py          # Tworzenie aplikacji (tzw. factory)
│   ├── config.py            # Wszystkie ustawienia, np. do bazy, JWT
│   ├── database/
│   │   └── __init__.py      # Inicjalizacja ORM - SQLAlchemy
│   ├── models/              # Modele danych, czyli struktury bazy (np. User, Customer)
│   ├── controllers/         # Endpointy API, tu cała logika obsługi żądań
│   └── middleware.py        # Dekoratory i logika autoryzacji (np. require_auth)
```
*Dzięki temu mogłem łatwo odnaleźć fragment kodu odpowiedzialny za konkretną funkcjonalność.*

**Przykład w kodzie:**  
Gdy chcę edytować logikę autoryzacji, wchodzę do `middleware.py`. Gdy zmieniam endpointy do klientów – do `controllers/customers.py`.

---

### 2.2. Factory Pattern - create_app()

- Od razu wdrożyłem wzorzec *factory* dla instancji aplikacji.
- Funkcja `create_app()` pozwala łatwo i wielokrotnie tworzyć nowe instancje aplikacji – to bardzo ułatwia testowanie.

```python
def create_app():
    # Tworzenie nowej "czystej" instancji aplikacji Flask
    app = Flask(__name__)
    app.config.from_object(Config) # Ładuje ustawienia np. klucz JWT, baza danych
    app.url_map.strict_slashes = False # Łatwiejsza obsługa ścieżek URL
    
    # CORS – ustawiam z jakich adresów www (frontendowych) można korzystać z API
    CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])
    
    init_database(app) # Startuję połączenie z bazą
    
    # Rejestracja blueprintów (modułów) - podpinam pliki z endpointami
    from app.controllers.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/Auth')
    # i kolejne...
    from app.controllers.customers import customers_bp
    from app.controllers.invoices import invoices_bp
    from app.controllers.notifications import notifications_bp
    from app.controllers.products import products_bp
    from app.controllers.tasks import tasks_bp

    app.register_blueprint(customers_bp, url_prefix='/api/Customers')
    app.register_blueprint(invoices_bp, url_prefix='/api/Invoices')
    app.register_blueprint(notifications_bp, url_prefix='/api/Notifications')
    app.register_blueprint(products_bp, url_prefix='/api/Products')
    app.register_blueprint(tasks_bp, url_prefix='/api/Tasks')
    return app
```
**Przykład wdrożenia:**  
Cała aplikacja Flask tworzona jest zawsze przez `create_app()`, tak samo w testach jednostkowych tworzę środowisko uruchomieniowe wołając tą funkcję z inną konfiguracją.

---

## 3. SYSTEM AUTORYZACJI JWT

### 3.1. Dlaczego JWT?

**Wyjaśnienie prostymi słowami:**

- Typowe, stare logowanie (np. przez "ciasteczka" i sesje) oznacza, że serwer musi pamiętać do kogo należy każde połączenie – komplikuje to system przy wielu serwerach i np. aplikacjach mobilnych, które nie obsługują cookies w standardowy sposób.
- Dlatego używam JWT: serwer nie musi nigdzie "zapisywać" kto jest zalogowany – każdy kto się uwierzytelni dostaje specjalny, podpisany cyfrowo *token* z zaszyfrowanymi informacjami (np. ID użytkownika, rola, czas ważności). W każdej kolejnej prośbie klient ten token przesyła, a serwer potrafi “odczytać” z niego niezbędne dane i sprawdzić, czy ktoś jest zalogowany i czy jego uprawnienia są odpowiednie.

**Przykład w kodzie:**  
Po zalogowaniu user dostaje od backendu taki token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 12,
    "username": "pawel",
    "role": "Admin"
  }
}
```
Wszelkie żądania do API (np. pobranie klientów) muszą zawierać header:  
`Authorization: Bearer <token>`

---

### 3.2. Logowanie – jak to działa w kodzie?  
- Stworzyłem endpoint `/api/Auth/login`.  
- Po poprawnym logowaniu (wprowadzeniu loginu i hasła) aplikacja zwraca klientowi token JWT oraz podstawowe info o użytkowniku.

**Krok po kroku + przykłady kodu:**

1. Frontend wysyła POST z loginem i hasłem:
    ```js
    api.post('/Auth/login', { username, password });
    ```
2. Backend waliduje dane:
    ```python
    data = request.get_json()
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Brak danych'}), 400
    ```
3. Szuka usera w bazie:
    ```python
    user = User.query.filter_by(username=data['username']).first()
    ```
4. Sprawdza hasło (bcrypt):
    ```python
    if not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Złe hasło'}), 401
    ```
5. Generuje token JWT:
    ```python
    payload = {'user_id': user.id, 'role': user.role.name, 'exp': datetime.utcnow() + timedelta(hours=24)}
    token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
    ```
6. Odpowiada:
    ```python
    return jsonify({'token': token, 'user': user.to_dict()})
    ```
Frontend zapisuje token w stanie globalnym (`AuthContext`) i używa przy każdym żądaniu.

---

### 3.3. Middleware autoryzacji – require_auth

**Dekorator – o co chodzi w prostych słowach?**  
- To specjalna funkcja, którą "owijam" inne funkcje (endpointy API), aby dodawać powtarzalną logikę, np. sprawdzanie uprawnień użytkownika.
- Zamiast w każdej funkcji powielać kod: “pobierz token, sprawdź, gdy nieprawidłowy – odmów”, robię to raz i “podpinam” dekorator do wszystkich endpointów, które mają być chronione.

**Przykład zastosowania w kodzie:**
```python
@customers_bp.route('/', methods=['GET'])
@require_auth  # <-- to właśnie dekorator
def get_customers():
    # Tutaj już wiem, że użytkownik jest zalogowany! Mogę korzystać np. z g.user_id
    customers = Customer.query.all()
    return jsonify([c.to_dict() for c in customers])
```
Jeśli użytkownik nie dołączy tokenu, dostanie błąd 401. Całe sprawdzanie wykonuje dekorator.

---

## 4. BAZA DANYCH I MODELE

### 4.1. Po co ORM, czyli SQLAlchemy?

- Gdybym pisał aplikację “po staremu”, każda operacja na bazie wymagałaby ręcznego konstruowania zapytań SQL, mapowania każdej kolumny z tabeli na klucze słownika, pilnowania kolejności pól w tabeli itd.
- ORM (Object-Relational Mapping) załatwia to za mnie: zamiast pracować z “suchymi danymi”, mogę pisać “po pythonowemu” – tworzyć i edytować obiekty, a zapis/odczyt z bazy “dzieje się w tle”.

**Przykład różnicy w kodzie:**

- Tradycyjne SQL:
    ```python
    cursor.execute("SELECT * FROM Customers WHERE id = %s", (customer_id,))
    row = cursor.fetchone()
    customer = {'id': row[0], ... }
    ```
- ORM w SQLAlchemy:
    ```python
    customer = Customer.query.get(customer_id)
    customer_dict = customer.to_dict()
    ```

---

### 4.2. Modele – jak wygląda User?

Definicja obiektu bazy danych w SQLAlchemy:
```python
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True) # Unikalny klucz
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Relacja do role
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    role = db.relationship('Role', backref='users')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role.name if self.role else None
        }
```
**Przykład użycia:**  
Gdy chcę pobrać zalogowanego użytkownika po ID, w kodzie piszę:  
```python
user = User.query.get(user_id)
dane = user.to_dict()
```

---

### 4.3. Model Customer – bardziej złożone relacje

- Model Customer pokazuje jak można łatwo powiązać klienta z innymi tabelami (np. przypisany user/opiekun, grupa, faktury, tagi).

Przykład modelu:
```python
class Customer(db.Model):
    __tablename__ = 'Customers'
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(255))
    Phone = db.Column(db.String(50))
    Company = db.Column(db.String(255))
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    AssignedUserId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    AssignedGroupId = db.Column(db.Integer, db.ForeignKey('Groups.Id'), nullable=True)

    assigned_user = db.relationship('User', foreign_keys=[AssignedUserId])
    assigned_group = db.relationship('Group', foreign_keys=[AssignedGroupId])
    invoices = db.relationship('Invoice', backref='customer')
    tags = db.relationship('Tag', secondary=customer_tags, backref='customers')

    def to_dict(self, include_relations=False):
        data = {
            'id': self.Id,
            'name': self.Name,
            'email': self.Email,
            'phone': self.Phone,
            'company': self.Company,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }
        if include_relations:
            data['tags'] = [tag.to_dict() for tag in self.tags]
            data['invoices'] = [inv.to_dict() for inv in self.invoices]
        return data
```
**Przykład użycia:**  
Wyświetlenie szczegółów klienta wraz z powiązanymi fakturami:
```python
customer = Customer.query.get(customer_id)
return jsonify(customer.to_dict(include_relations=True))
```

---

## 5. KONTROLERY I LOGIKA BIZNESOWA

### 5.1. CRUD dla klientów (Customers)

- Kontroler to miejsce, gdzie obsługuję żądania z zewnątrz, np. “dodaj klienta”, “pobierz klientów”, “usuń”, itd.

**CRUD w kodzie:**

**CREATE – tworzenie nowego klienta**
```python
@customers_bp.route('/', methods=['POST'])
@require_auth
def add_customer():
    data = request.get_json()
    if not data.get('name'):
        return jsonify({'error': 'Brak imienia'}), 400
    customer = Customer(Name=data['name'], Email=data.get('email'))
    db.session.add(customer)
    db.session.commit()
    return jsonify(customer.to_dict()), 201
```
**READ – pobranie listy klientów**
```python
@customers_bp.route('/', methods=['GET'])
@require_auth
def get_customers():
    customers = Customer.query.all()
    return jsonify([c.to_dict() for c in customers])
```
**UPDATE – edycja klienta**
```python
@customers_bp.route('/<int:id>', methods=['PUT'])
@require_auth
def update_customer(id):
    customer = Customer.query.get(id)
    if not customer:
        return jsonify({'error': 'Nie znaleziono klienta'}), 404
    data = request.get_json()
    if data.get('name'):
        customer.Name = data['name']
    db.session.commit()
    return jsonify(customer.to_dict())
```
**DELETE – usuwanie klienta**
```python
@customers_bp.route('/<int:id>', methods=['DELETE'])
@require_auth
def delete_customer(id):
    customer = Customer.query.get(id)
    if not customer:
        return jsonify({'error': 'Brak takiego klienta'}), 404
    db.session.delete(customer)
    db.session.commit()
    return '', 204
```

---

### 5.2. Zaawansowane pobieranie danych (filtrowanie i sortowanie)

- Endpoint dla pobierania klientów obsługuje różne opcje:  
  → Mogę podać np. `?group_id=5` aby zobaczyć tylko klientów z tej grupy,  
  → albo `?search=kowalski` by znaleźć klientów po fragmencie tekstu w imieniu/emailu,
  → albo `?sort_by=Name&order=desc` by posortować listę po wybranym polu.

**Przykład obsługi tych parametrów w kodzie:**
```python
@customers_bp.route('/', methods=['GET'])
@require_auth
def get_customers():
    query = Customer.query
    if group_id := request.args.get('group_id'):
        query = query.filter_by(AssignedGroupId=group_id)
    if search := request.args.get('search'):
        query = query.filter(Customer.Name.ilike(f"%{search}%"))
    sort_field = request.args.get('sort_by', 'Name')
    order = request.args.get('order', 'asc')
    if order == 'desc':
        query = query.order_by(desc(getattr(Customer, sort_field)))
    else:
        query = query.order_by(getattr(Customer, sort_field))
    customers = query.all()
    return jsonify([c.to_dict() for c in customers])
```

---

## 6. FRONTEND – REACT APLIKACJA

### 6.1. Struktura projektu frontendowego

```
crm-ui/
├── src/
│   ├── components/      # Małe „klocki” do budowy UI - przyciski, modale, tabele
│   ├── pages/           # Główne ekrany (np. lista klientów, szczegóły faktury)
│   ├── context/         # Przechowywanie globalnego stanu (np. zalogowany użytkownik)
│   ├── services/        # Komunikacja z backendem (API) – wszystko leci tutaj
│   └── App.tsx          # Punkt wejścia aplikacji
```
- Dzięki temu kod jest podzielony na logiczne części i łatwo dodać nowe funkcjonalności bez mieszania wszystkiego w jednym pliku.

**Przykład w kodzie:**  
Gdy tworzę nowy komponent (np. przycisk lub modal), ląduje on w folderze `components/` i może być łatwo wstawiony do kilku widoków.

---

### 6.2. Context API – gdzie i jak użyłem w kodzie? (obsługa logowania/wylogowania)

- React Context API zastosowałem jako główny mechanizm do zarządzania stanem sesji użytkownika: logowanie, wylogowanie, przechowywanie tokenu JWT i danych o zalogowanym użytkowniku.
- Przykładowo, cały context i funkcje pomocnicze umieściłem w pliku `src/context/AuthContext.tsx` (frontend web) oraz `crm-mobile/context/AuthContext.tsx` (aplikacja mobilna).
- Wszystkie komponenty, które potrzebują wiedzieć, kto jest zalogowany, albo wywołać logout/logowanie, pobierają dane właśnie z tego kontekstu (przez hook `useAuth()`).

**Przykład kodu:**
```tsx
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout, token } = useAuth();
  // ...dalsza logika ekranu profilu
}
```
Gdy wywołam `logout()`, cały stan użytkownika i token czyszczą się we wszystkich komponentach.

---

### 6.3. Komunikacja z backendem – Axios

- Chciałem, aby wysyłanie żądań do API było łatwe i nie powodowało powielania kodu.
- Z tego powodu stworzyłem specjalny *service* z wykorzystaniem biblioteki Axios, który:
    - automatycznie ustawia bazowy adres API,
    - automatycznie dołącza token JWT do każdego żądania,
    - obsługuje globalnie błędy (np. token wygasł – automatycznie przekierowuje do logowania).

**Przykład fragmentu kodu:**
```typescript
import axios from 'axios';

// Utworzenie instancji
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor dołączający token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// Użycie: 
api.get('/Customers/')
```

---

### 6.4. Komponent CustomersPage – prosty widok

- Komponent pobiera z serwera listę klientów, obsługuje ładowanie i błędy.
- Wyświetla wyniki w tabeli, wykorzystując proste elementy HTML.
- Stan komponentu (np. czy czekam na odpowiedź, czy jest błąd, jakie są dane) przechowywany jest w *hookach* (useState).

**Przykład uproszczonego kodu:**
```tsx
const [customers, setCustomers] = useState([]);
useEffect(() => {
  api.get('/Customers/')
    .then(res => setCustomers(res.data))
    .catch(setError);
}, []);
return (
  <table>
    <tbody>
      {customers.map(c => <tr key={c.id}><td>{c.name}</td></tr>)}
    </tbody>
  </table>
);
```

---

## 7. APLIKACJA MOBILNA

- Aplikacja mobilna tworzona jest z wykorzystaniem **React Native** i **Expo**.
- Dzięki temu kod większości komponentów mogę współdzielić z webowym frontendem (React) – nauka raz, kodowanie raz.

**Ważniejsze elementy – przykłady kodu:**
- Bezpieczne przechowywanie tokenu JWT – w `crm-mobile/context/AuthContext.tsx` używam:
  ```typescript
  import * as SecureStore from 'expo-secure-store';
  await SecureStore.setItemAsync('jwtToken', token);
  ```
- Strukturę ekranów buduję poprzez foldery (np. każdy widok to nowy plik w `/app/(tabs)/`).

---

## 8. FUNKCJE ZAAWANSOWANE

### 8.1. Raporty PDF z ReportLab

- W moim systemie mogę generować faktury w formie profesjonalnych plików PDF.  
- Biblioteka ReportLab pozwala tworzyć całe dokumenty “z kodu” – mogę dodać własne logo, tabelki z pozycjami, podsumowania finansowe itd.

**Przykład kodu:**
```python
from reportlab.pdfgen import canvas
from io import BytesIO

def create_invoice_pdf(invoice):
    buffer = BytesIO()
    c = canvas.Canvas(buffer)
    c.drawString(100, 800, "FAKTURA VAT")
    c.drawString(100, 750, f"Odbiorca: {invoice.customer.Name}")
    # ... dalsze elementy
    c.save()
    buffer.seek(0)
    return buffer
```
PDF jest od razu zwracany z endpointu API do pobrania przez użytkownika.

### 8.2. Umowy na podstawie szablonów Word – python-docx

- Typowym zadaniem w CRM jest generowanie umów – tak, żeby zawsze się zgadzały dane, kwoty, klient itd.
- Rozwiązuję to przez wypełnianie szablonów Worda – na gotowym pliku z placeholderami (np. `{{CUSTOMER_NAME}}`) podmieniam kodem odpowiednie fragmenty na dane z bazy, a gotowy dokument wraca do użytkownika gotowy do wydruku lub wysłania.

**Przykład kodu:**
```python
from docx import Document

def generuj_umowe(customer):
    doc = Document('templates/umowa_wzor.docx')
    for p in doc.paragraphs:
        if "{{CUSTOMER_NAME}}" in p.text:
            p.text = p.text.replace("{{CUSTOMER_NAME}}", customer.Name)
    doc.save(f'umowa_{customer.Id}.docx')
```

---

## 9. TESTOWANIE I WDROŻENIE

### 9.1. Testy backendu (pytest)

- Kluczowe funkcje systemu mają testy automatyczne – oznacza to, że mogę jednym poleceniem sprawdzić, czy wszystko działa jak trzeba, np. po wprowadzeniu zmian w kodzie.
- Testy na backendzie Flask wykorzystują testową bazę w pamięci (wszystko dzieje się szybko, nic nie zostaje na dysku), tworzę i usuwam potrzebne dane "w locie".

**Przykład kodu testowego:**
```python
def test_create_customer(client):
    res = client.post('/api/Customers/', json={'name': 'Nowy Klient'})
    assert res.status_code == 201
    data = res.get_json()
    assert data['name'] == 'Nowy Klient'
```
Dzięki testom wyłapuję szybko regresje i błędy w API.



## PODSUMOWANIE – KLUCZOWE DECYZJE I WNIOSKI

### Technologie – uzasadnienia wyboru (w prostych słowach) + przykłady kodowe:

- **Python + Flask:** minimum zbędnej roboty, prosty w nauce i użyciu, duże wsparcie społeczności.
    - *Przykład:*  
      ```python
      app = Flask(__name__)
      app.config.from_object(Config)
      ```
- **React + TypeScript:** szybki interfejs użytkownika, mniej błędów dzięki typom, łatwość rozbudowy.
    - *Przykład komponentu:*
      ```tsx
      type Customer = { id: number; name: string };
      const CustomerItem: React.FC<{customer: Customer}> = ({customer}) => (
        <div>{customer.name}</div>
      );
      ```
- **SQLAlchemy:** nie myślę o zapytaniach SQL – działa “pythonicznie”, więc mniej błędów, sprawniej koduję relacje.
    - *Przykład:*
      ```python
      customers = Customer.query.filter_by(company="X").all()
      ```
- **JWT:** logowanie działa wszędzie – na webie, mobile, w chmurze – prosto, bez pilnowania sesji po stronie serwera.
    - *Przykład użycia headera:*
      ```
      Authorization: Bearer <token>
      ```
- **Docker:** każdy uruchomi aplikację identycznie – czy to u mnie, czy w chmurze, czy na serwerze produkcji.
    - *Przykład fragmentu Dockerfile:*
      ```
      FROM python:3.11
      COPY . /app
      WORKDIR /app
      RUN pip install -r requirements.txt
      CMD flask run --host=0.0.0.0
      ```

### Wzorce projektowe użyte w projekcie – opis działania i przykłady:

- **Factory Pattern (Wzorzec Fabryki)**  
  Ten wzorzec polega na tworzeniu obiektów (np. aplikacji Flask) przy użyciu jednej, centralnej funkcji-konfiguratora. Dzięki temu każda nowa instancja aplikacji powstaje w ten sam, kontrolowany sposób. Umożliwia to łatwe testowanie i modyfikowanie konfiguracji bez zmieniania kodu w wielu miejscach.  
  **Przykład:**  
  ```python
  def create_app():
      app = Flask(__name__)
      app.config.from_object(Config)
      # ... reszta inicjalizacji
      return app
  ```
  W testach mogę wtedy wywołać `create_app(test_config)` i otrzymać oddzielną instancję do sprawdzenia.

- **Repository Pattern (Repozytorium)**  
  Pozwala oddzielić logikę aplikacji od szczegółów związanych z bazą danych. Dzięki temu, zamiast pisać zapytania SQL bezpośrednio w kontrolerach, korzystam z modeli (ORM) i metod „repozytorium”. Jeśli kiedyś zmieni się np. SQL na MongoDB, wystarczy wymienić „repozytorium” – bez konieczności grzebania w całej aplikacji.  
  **Przykład:**  
  ```python
  class UserRepository:
      @staticmethod
      def get_by_id(user_id):
          return User.query.get(user_id)
  # Użycie:
  user = UserRepository.get_by_id(user_id)
  ```
  a nie:
  ```python
  cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
  ```
  Kod pozostaje czytelny i niezależny od technologii bazy.

- **Decorator Pattern (Dekorator)**  
  Umożliwia „doklejanie” powtarzalnej logiki (np. sprawdzenie autoryzacji) do różnych funkcji, bez powielania kodu. W praktyce – jeden dekorator dodaję do wielu endpointów, a logika (np. walidacja tokenu JWT) jest w jednym miejscu.  
  **Przykład:**  
  ```python
  @require_auth
  def get_customers():
      # tylko zalogowany użytkownik może wywołać tę funkcję
      ...
  ```
- **MVC Pattern (Model-View-Controller – Model-Widok-Kontroler)**  
  To sposób organizacji kodu, gdzie:  
    - **Model:** odpowiada za logikę danych i operacje na bazie (np. klasy User, Invoice, Customer).
    - **View:** prezentuje dane użytkownikowi (w aplikacji webowej – komponenty React; w API – odpowiedzi JSON; w mobile – widoki React Native).
    - **Controller:** obsługuje żądania, łączy model z widokiem i decyduje co zrobić z danymi.  
  **Przykład:**  
  - Jeśli użytkownik żąda `GET /api/Customers`:
      - Kontroler (endpoint w Flasku) odbiera żądanie
      - Model (np. Customer.query.all()) pobiera dane z bazy
      - Kontroler zwraca dane jako JSON (do widoku, np. w React)
  
  Taki podział ułatwia rozwój – mogę zmieniać warstwę prezentacji bez wpływu na logikę danych i na odwrót.

---

### Statystyki projektu (dla pokazania rozmiaru i złożoności):

- **15 000+ linii kodu** – znaczna ilość kodu, całość rozbudowana
    - *Przykład: foldery i pliki kodu backend + frontend + mobile*
- **50+ endpointów API** – mnóstwo punktów wyjścia (adresów) do obsługi różnych przypadków
    - *Np. /api/Customers, /api/Invoices, /api/Notifications*
- **100+ komponentów React** – bogaty i rozproszony frontend
    - *Każda podstrona/podmodal osobny plik (np. CustomerRow.tsx, AddInvoiceModal.tsx)*
- **22 tabele w bazie** – odzwierciedlenie skomplikowanych relacji biznesowych
    - *Każda klasa modelu to osobna tabela*
- **89% testów przechodzi** – wysoka jakość i stabilność kodu
    - *Pokrycie testami sprawdzam przez narzędzie coverage.py lub pytest*

---

### Wnioski końcowe

- Cały proces był przemyślany właśnie po to, by łatwo wytłumaczyć każdemu, dlaczego wybrałem takie, a nie inne technologie i wzorce.  
- Każdy element systemu (backend, frontend, mobile) może funkcjonować niezależnie, ale razem tworzą spójną całość.
- Zastosowałem popularne rozwiązania, zgodne z dobrymi praktykami branżowymi, ale każdą decyzję mogę uzasadnić konkretną potrzebą projektu.
- Całość napisana jest przejrzyście, łatwa do dalszego rozwijania i zgodna z oczekiwaniami praktycznej aplikacji biznesowej.

---

**Dokument przygotował:** Paweł Paciorkowski  
**Data:** 2025  
**Cel:** Szczegółowe, zrozumiałe przedstawienie procesu budowy oraz działania kodu aplikacji CRM – wraz z praktycznymi przykładami z kodu.
