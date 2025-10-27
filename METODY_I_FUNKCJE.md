# 📚 SZCZEGÓŁOWY OPIS METOD I FUNKCJI - CRM SYSTEM

**Dokument opisujący wszystkie metody, funkcje i ich działanie po kropce w projekcie CRM**

---

## 📋 SPIS TREŚCI

1. [Metody SQLAlchemy (ORM)](#1-metody-sqlalchemy-orm)
2. [Metody Flask](#2-metody-flask)
3. [Metody Python - Wbudowane](#3-metody-python-wbudowane)
4. [Metody Reaktywne (React)](#4-metody-reaktywne-react)
5. [Metody Bibliotek Zewnętrznych](#5-metody-bibliotek-zewnętrznych)
6. [Własne Metody Projektu](#6-własne-metody-projektu)

---

## 1. METODY SQLALCHEMY (ORM)

### 1.1. Query Methods - Metody Zapytań

#### `Model.query.all()`
**Co robi:**
- Pobiera WSZYSTKIE rekordy z tabeli reprezentowanej przez model
- Zwraca listę obiektów Python reprezentujących wiersze bazy danych

**Przykład:**
```python
customers = Customer.query.all()
# Zwraca: [Customer, Customer, Customer, ...]
# SQL: SELECT * FROM Customers
```

**Składnia:**
- `query` - dostęp do Query Builder'a SQLAlchemy
- `.all()` - metoda wykonująca zapytanie i zwracająca wszystkie wyniki jako lista

**Użycie w projekcie:**
```python
# backend-python/app/controllers/customers.py
def get_customers():
    customers = Customer.query.all()  # Pobiera wszystkich klientów
    return jsonify([c.to_dict() for c in customers])
```

---

#### `Model.query.get(id)`
**Co robi:**
- Pobiera JEDEN rekord z tabeli na podstawie primary key (ID)
- Zwraca obiekt modelu lub `None` jeśli nie znaleziono

**Przykład:**
```python
customer = Customer.query.get(123)
# Zwraca: Customer object lub None
# SQL: SELECT * FROM Customers WHERE Id = 123
```

**Składnia:**
- `query` - Query Builder
- `.get(id)` - metoda pobierająca po ID

**Użycie w projekcie:**
```python
# backend-python/app/controllers/customers.py
def get_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'error': 'Not found'}), 404
```

---

#### `Model.query.filter_by(**kwargs).first()`
**Co robi:**
- Filtruje rekordy po podanych kryteriach
- `.first()` - zwraca tylko PIERWSZY rekord lub `None`

**Przykład:**
```python
user = User.query.filter_by(username='admin').first()
# Zwraca: User object lub None
# SQL: SELECT * FROM users WHERE username = 'admin' LIMIT 1
```

**Składnia:**
- `query` - Query Builder
- `.filter_by(**kwargs)` - filtrowanie po polach (operator =)
- `.first()` - zwraca pierwszy wynik

**Użycie w projekcie:**
```python
# backend-python/app/controllers/auth.py
def login():
    user = User.query.filter_by(username=username).first()
    # Znajduje użytkownika po nazwie
```

---

#### `Model.query.filter(condition).all()`
**Co robi:**
- Filtruje rekordy po skomplikowanych warunkach
- Zwraca listę wszystkich pasujących rekordów

**Przykład:**
```python
customers = Customer.query.filter(Customer.Name.like('%Kowalski%')).all()
# Zwraca: Lista Customer objects
# SQL: SELECT * FROM Customers WHERE Name LIKE '%Kowalski%'
```

**Składnia:**
- `query` - Query Builder
- `.filter(condition)` - filtrowanie po złożonych warunkach (>, <, like, in, etc.)
- `.all()` - zwraca wszystkie wyniki

---

#### `Model.query.filter(condition).order_by(column).all()`
**Co robi:**
- Filtruje i sortuje rekordy
- `.order_by()` - sortuje po kolumnie

**Przykład:**
```python
customers = Customer.query.order_by(Customer.Name).all()
# Zwraca: Lista posortowana alfabetycznie po Name
# SQL: SELECT * FROM Customers ORDER BY Name
```

**Składnia:**
- `.order_by(column)` - sortowanie rosnąco
- `.order_by(column.desc())` - sortowanie malejąco

---

### 1.2. Session Methods - Metody Sesji

#### `db.session.add(object)`
**Co robi:**
- Dodaje nowy obiekt do sesji SQLAlchemy (do zapisu)
- Nie zapisuje jeszcze do bazy! Trzeba wywołać `commit()`

**Przykład:**
```python
new_customer = Customer(Name='Jan Kowalski', Email='jan@example.com')
db.session.add(new_customer)  # Dodaje do sesji (staging area)
db.session.commit()  # Zapisuje do bazy
# SQL: INSERT INTO Customers (Name, Email) VALUES ('Jan Kowalski', 'jan@example.com')
```

**Składnia:**
- `db.session` - obiekt sesji SQLAlchemy
- `.add(object)` - dodaje obiekt do staging area

**Mechanizm działania:**
1. Tworzenie obiektu Python (nie w bazie jeszcze)
2. `db.session.add()` - dodanie do sesji
3. `db.session.commit()` - SQL INSERT

**Użycie w projekcie:**
```python
# backend-python/app/controllers/customers.py
def create_customer():
    data = request.get_json()
    customer = Customer(Name=data['name'], Email=data['email'])
    db.session.add(customer)  # Przygotowanie do zapisu
    db.session.commit()  # Zapis do bazy
```

---

#### `db.session.commit()`
**Co robi:**
- Wykonuje wszystkie zmiany oczekujące w sesji (INSERT, UPDATE, DELETE)
- Zapisuje trwale do bazy danych

**Przykład:**
```python
db.session.add(new_customer)
db.session.add(new_invoice)
db.session.commit()  # Zap obie operacje do bazy
# SQL: INSERT INTO ...; INSERT INTO ...
```

**Składnia:**
- `db.session.commit()` - wykonuje i zatwierdza transakcję

**Ważne:**
- BEZ `commit()` - zmiany NIE są zapisywane!
- `commit()` - zatwierdza wszystkie zmiany w sesji

---

#### `db.session.delete(object)`
**Co robi:**
- Oznacza obiekt do USUNIĘCIA
- Nie usuwa od razu! Trzeba wywołać `commit()`

**Przykład:**
```python
customer = Customer.query.get(123)
db.session.delete(customer)  # Oznacza do usunięcia
db.session.commit()  # SQL DELETE
# SQL: DELETE FROM Customers WHERE Id = 123
```

**Składnia:**
- `db.session.delete(object)` - oznacza obiekt do usunięcia

---

#### `db.session.rollback()`
**Co robi:**
- Anuluje WSZYSTKIE zmiany w sesji
- Cofa wszystko co było dodane/zmienione od ostatniego `commit()`

**Przykład:**
```python
db.session.add(customer1)
db.session.add(customer2)
db.session.rollback()  # Anuluje wszystko!
# Żadne zmiany nie zostały zapisane
```

**Użycie w projekcie:**
```python
try:
    db.session.add(customer)
    db.session.commit()
except:
    db.session.rollback()  # Wycofaj przy błędzie
```

---

### 1.3. Relationship Methods - Metody Relacji

#### `object.relationship_name`
**Co robi:**
- Dostęp do powiązanych rekordów przez relację
- SQLAlchemy automatycznie wykonuje JOIN

**Przykład:**
```python
customer = Customer.query.get(123)
customer_invoices = customer.invoices  # Automatyczny JOIN!
# SQL: SELECT * FROM Invoices WHERE CustomerId = 123
```

**Składnia:**
- `object.relationship_name` - dostęp przez nazwę relacji zdefiniowanej w modelu

**Definicja w modelu:**
```python
class Customer(db.Model):
    # ...
    invoices = db.relationship('Invoice', backref='customer')

# Użycie:
customer.invoices  # Lista faktur klienta
invoice.customer   # Obiekt klienta (dzięki backref)
```

---

#### `db.session.refresh(object)`
**Co robi:**
- Odświeża obiekt z bazy danych
- Ładuje najnowsze dane i relacje

**Przykład:**
```python
customer = Customer.query.get(123)
customer.Name = 'Nowe imię'
db.session.refresh(customer)  # Wczytuje ORYGINALNE dane z bazy
# customer.Name będzie takie jak było w bazie (przed zmianą)
```

**Składnia:**
- `db.session.refresh(object)` - reload danych z bazy

---

### 1.4. Model Methods - Metody Modelu

#### `object.to_dict()`
**Co robi:**
- Konwertuje obiekt modelu SQLAlchemy do słownika Python
- Używane do serializacji do JSON

**Przykład:**
```python
customer = Customer.query.get(123)
customer_dict = customer.to_dict()
# Zwraca: {'id': 123, 'name': 'Jan', 'email': 'jan@example.com'}
```

**Definicja w modelu:**
```python
class Customer(db.Model):
    # ...
    def to_dict(self):
        return {
            'id': self.Id,
            'name': self.Name,
            'email': self.Email
        }
```

**Użycie w projekcie:**
```python
# backend-python/app/controllers/customers.py
customers = Customer.query.all()
return jsonify([c.to_dict() for c in customers])
# Zwraca JSON z listą słowników
```

---

## 2. METODY FLASK

### 2.1. Request Methods

#### `request.get_json()`
**Co robi:**
- Pobiera dane JSON z body żądania HTTP (POST, PUT)
- Parsuje JSON do słownika Python

**Przykład:**
```python
# Request: POST /api/Customers/
# Body: {"name": "Jan", "email": "jan@example.com"}

data = request.get_json()
# data = {'name': 'Jan', 'email': 'jan@example.com'}
```

**Składnia:**
- `request` - global object Flask z danymi żądania
- `.get_json()` - parsuje body jako JSON

**Użycie w projekcie:**
```python
# backend-python/app/controllers/customers.py
def create_customer():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
```

---

#### `request.args.get(key)`
**Co robi:**
- Pobiera parametr z URL (query string)
- URL: `/api/Customers?status=active`

**Przykład:**
```python
# URL: /api/Customers?status=active&page=1
status = request.args.get('status')  # 'active'
page = request.args.get('page')      # '1'
page = request.args.get('page', '1')  # '1' (default value)
```

**Składnia:**
- `request.args` - słownik z parametrami URL
- `.get(key, default)` - pobiera wartość lub default

**Użycie w projekcie:**
```python
# backend-python/app/controllers/customers.py
status = request.args.get('status')
if status:
    customers = Customer.query.filter_by(Status=status).all()
```

---

#### `request.headers.get(key)`
**Co robi:**
- Pobiera wartość nagłówka HTTP

**Przykład:**
```python
token = request.headers.get('Authorization')
# Pobiera: 'Bearer eyJhbGciOiJIUzI1NiIs...'
```

**Użycie w projekcie:**
```python
# backend-python/app/middleware.py
token = request.headers.get('Authorization')
if not token:
    return jsonify({'error': 'Brak tokena'}), 401
```

---

### 2.2. Response Methods

#### `jsonify(data)`
**Co robi:**
- Konwertuje dane Python (dict, list) do odpowiedzi JSON
- Ustawia header `Content-Type: application/json`

**Przykład:**
```python
return jsonify({'message': 'Success'}), 200
# Response: {"message": "Success"}
# Status: 200 OK
```

**Składnia:**
- `jsonify(data)` - konwertuje do JSON
- `jsonify(data), status_code` - z kodem statusu

**Użycie w projekcie:**
```python
# backend-python/app/controllers/customers.py
return jsonify({'error': 'Not found'}), 404
return jsonify(customer.to_dict()), 200
```

---

#### `send_file(path)`
**Co robi:**
- Wysyła plik jako odpowiedź HTTP (PDF, DOCX, etc.)

**Przykład:**
```python
return send_file('/path/to/invoice.pdf', as_attachment=True)
# Wysyła plik PDF do pobrania
```

**Użycie w projekcie:**
```python
# backend-python/app/controllers/invoices.py
def download_pdf(invoice_id):
    pdf_path = f'invoices/{invoice_id}.pdf'
    return send_file(pdf_path, as_attachment=True)
```

---

### 2.3. Route Methods

#### `@blueprint.route('/path', methods=['GET'])`
**Co robi:**
- Rejestruje endpoint w Flask
- Definiuje URL i metody HTTP

**Przykład:**
```python
@customers_bp.route('/', methods=['GET'])
def get_customers():
    # Endpoint: GET /api/Customers/
    pass

@customers_bp.route('/', methods=['POST'])
def create_customer():
    # Endpoint: POST /api/Customers/
    pass

@customers_bp.route('/<int:id>', methods=['GET'])
def get_customer(id):
    # Endpoint: GET /api/Customers/123
    pass
```

**Składnia:**
- `@blueprint.route(path, methods)` - dekorator Flask
- `methods=['GET', 'POST']` - dozwolone metody HTTP
- `<int:id>` - path parameter (integer)

---

## 3. METODY PYTHON - WBUDOWANE

### 3.1. Dictionary Methods

#### `dict.get(key, default)`
**Co robi:**
- Pobiera wartość ze słownika
- Zwraca `default` jeśli klucz nie istnieje (nie rzuca wyjątku)

**Przykład:**
```python
data = {'name': 'Jan', 'email': 'jan@example.com'}
name = data.get('name')  # 'Jan'
phone = data.get('phone')  # None
phone = data.get('phone', '123456789')  # '123456789' (default)
```

**vs. `dict[key]`:**
```python
# dict[key] rzuca wyjątek jeśli brak klucza
name = data['name']  # 'Jan' ✓
phone = data['phone']  # KeyError! ✗

# dict.get() bezpieczne
phone = data.get('phone')  # None ✓
phone = data.get('phone', 'default')  # 'default' ✓
```

---

#### `dict.items()`
**Co robi:**
- Zwraca pary (klucz, wartość) ze słownika

**Przykład:**
```python
data = {'name': 'Jan', 'email': 'jan@example.com'}
for key, value in data.items():
    print(f"{key}: {value}")
# Output:
# name: Jan
# email: jan@example.com
```

---

### 3.2. List Methods

#### `list.append(item)`
**Co robi:**
- Dodaje element na końcu listy

**Przykład:**
```python
customers = []
customers.append(customer1)
customers.append(customer2)
# customers = [customer1, customer2]
```

---

#### `list.extend(iterable)`
**Co robi:**
- Dodaje wszystkie elementy z iterable na końcu listy

**Przykład:**
```python
list1 = [1, 2]
list2 = [3, 4]
list1.extend(list2)
# list1 = [1, 2, 3, 4]
```

---

#### `list.map(function)`
**Co robi:**
- Tworzy nową listę przez aplikację funkcji do każdego elementu

**Przykład:**
```python
numbers = [1, 2, 3, 4]
squared = [x**2 for x in numbers]
# squared = [1, 4, 9, 16]
```

**W projekcie:**
```python
customers = Customer.query.all()
return jsonify([c.to_dict() for c in customers])
# List comprehension: zamienia każdy obiekt na dict
```

---

#### `list.filter(function)`
**Co robi:**
- Tworzy nową listę z elementów spełniających warunek

**Przykład:**
```python
numbers = [1, 2, 3, 4, 5]
even = [x for x in numbers if x % 2 == 0]
# even = [2, 4]
```

---

### 3.3. String Methods

#### `str.lower()`
**Co robi:**
- Konwertuje string na małe litery

**Przykład:**
```python
text = "HELLO"
lower_text = text.lower()  # 'hello'
```

---

#### `str.upper()`
**Co robi:**
- Konwertuje string na wielkie litery

**Przykład:**
```python
text = "hello"
upper_text = text.upper()  # 'HELLO'
```

---

#### `str.strip()`
**Co robi:**
- Usuwa białe znaki z początku i końca

**Przykład:**
```python
text = "  hello  "
stripped = text.strip()  # 'hello'
```

---

## 4. METODY REAKTYWNE (REACT)

### 4.1. React Hooks

#### `useState(initialValue)`
**Co robi:**
- Tworzy stan lokalny w komponencie React
- Zwraca [wartość, setter]

**Przykład:**
```typescript
const [count, setCount] = useState(0);
// count = 0 (wartość)
// setCount = funkcja do zmiany

<button onClick={() => setCount(count + 1)}>
    Kliknięto {count} razy
</button>
```

**Składnia:**
- `const [value, setValue] = useState(initial)`
- `value` - aktualna wartość stanu
- `setValue(newValue)` - funkcja aktualizująca

---

#### `useEffect(callback, dependencies)`
**Co robi:**
- Wykonuje kod PO renderze komponentu
- Side effects (API calls, subscriptions)

**Przykład:**
```typescript
useEffect(() => {
    // Ten kod wykonuje się PO renderze
    fetchCustomers();
}, []);  // Puste [] = tylko raz po mount
```

**Składnia:**
- `useEffect(() => {...}, dependencies)`
- Jeśli dependencies się zmieniają, effect wykonuje się ponownie

**Cykl życia:**
1. Render komponentu
2. useEffect wykonuje się
3. Update dependencies → useEffect ponownie

---

#### `useContext(Context)`
**Co robi:**
- Dostęp do globalnego stanu (Context API)

**Przykład:**
```typescript
const { user, token } = useContext(AuthContext);
// Pobiera wartości z globalnego context
```

---

### 4.2. React Component Methods

#### `component.setState(newState)`
**Co robi:**
- Aktualizuje stan w class component

**Przykład:**
```typescript
class MyComponent extends React.Component {
    constructor() {
        this.state = { count: 0 };
    }
    
    handleClick = () => {
        this.setState({ count: this.state.count + 1 });
    }
}
```

---

### 4.3. Event Handlers

#### `onClick={handler}`
**Co robi:**
- Obsługuje kliknięcie myszy

**Przykład:**
```typescript
<button onClick={() => console.log('Clicked')}>
    Kliknij
</button>
```

---

#### `onChange={handler}`
**Co robi:**
- Obsługuje zmianę w input

**Przykład:**
```typescript
<input 
    value={name}
    onChange={(e) => setName(e.target.value)}
/>
```

---

#### `onSubmit={handler}`
**Co robi:**
- Obsługuje submit formularza

**Przykład:**
```typescript
<form onSubmit={handleSubmit}>
    <button type="submit">Wyślij</button>
</form>
```

---

## 5. METODY BIBLIOTEK ZEWNĘTRZNYCH

### 5.1. JWT Methods

#### `jwt.encode(payload, secret, algorithm)`
**Co robi:**
- Generuje JWT token

**Przykład:**
```python
import jwt

payload = {'user_id': 123, 'role': 'Admin'}
token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
# Zwraca: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Użycie w projekcie:**
```python
# backend-python/app/controllers/auth.py
def login():
    # ...
    token = jwt.encode(
        {'sub': user.id, 'username': user.username},
        SECRET_KEY,
        algorithm='HS256'
    )
```

---

#### `jwt.decode(token, secret, algorithms)`
**Co robi:**
- Dekoduje i weryfikuje JWT token

**Przykład:**
```python
payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
# Zwraca: {'sub': 123, 'username': 'admin'}
```

**Użycie w projekcie:**
```python
# backend-python/app/middleware.py
def require_auth(f):
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = data['sub']
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token wygasł'}), 401
```

---

### 5.2. Werkzeug Security

#### `generate_password_hash(password)`
**Co robi:**
- Haszuje hasło (bcrypt)

**Przykład:**
```python
from werkzeug.security import generate_password_hash

password_hash = generate_password_hash('myPassword123')
# Zwraca: '$2b$12$...' (hash)
```

---

#### `check_password_hash(hash, password)`
**Co robi:**
- Weryfikuje hasło

**Przykład:**
```python
from werkzeug.security import check_password_hash

is_valid = check_password_hash(password_hash, 'myPassword123')
# Zwraca: True/False
```

**Użycie w projekcie:**
```python
# backend-python/app/controllers/auth.py
def login():
    if check_password_hash(user.password_hash, password):
        # Hasło poprawne
        pass
```

---

### 5.3. Axios (HTTP Client)

#### `axios.get(url)`
**Co robi:**
- Wysyła GET request

**Przykład:**
```typescript
const response = await axios.get('/api/Customers/');
const customers = response.data;
```

---

#### `axios.post(url, data)`
**Co robi:**
- Wysyła POST request

**Przykład:**
```typescript
const response = await axios.post('/api/Customers/', {
    name: 'Jan',
    email: 'jan@example.com'
});
```

---

#### `axios.delete(url)`
**Co robi:**
- Wysyła żądanie HTTP DELETE na podany adres URL
- Służy do usuwania zasobu (np. klienta, faktury) na backendzie

**Przykład:**
```typescript
await axios.delete(`/api/Customers/${customerId}`);
```

**Składnia:**
- `axios.delete(url)` – podstawowa forma; wysyła DELETE bez body
- `axios.delete(url, { data })` – (opcjonalnie) pozwala wysłać body z danymi do backendu

**Użycie w projekcie:**
```typescript
// Usuwanie klienta o konkretnym ID
const handleDelete = async (customerId: number) => {
    await axios.delete(`/api/Customers/${customerId}`);
    // Aktualizacja stanu, odświeżenie listy klientów
};
```

**Zwraca:**
- Obietnicę (Promise) z odpowiedzią (response) HTTP backendu


**Co robi:**
- Wysyła DELETE request

**Przykład:**
```typescript
await axios.delete(`/api/Customers/${customerId}`);
```

---

## 6. WŁASNE METODY PROJEKTU

### 6.1. Middleware Methods

#### `require_auth(f)` 
// require_auth(f) to specjalny "dekorator" w Pythonie, który sprawdza, czy użytkownik dołączył poprawny token JWT przy wysyłaniu zapytania do serwera. 
// Jeżeli tokenu nie ma lub jest nieprawidłowy – użytkownik nie dostanie odpowiedzi (dostanie błąd 401). 
// Dzięki temu tylko zalogowani użytkownicy mogą korzystać z chronionych endpointów naszej aplikacji.

**Co robi:**
- Dekorator wymagający autoryzacji
- Weryfikuje JWT token

**Definicja:**
```python
# backend-python/app/middleware.py
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Brak tokena'}), 401
        # ... weryfikacja tokena
        return f(*args, **kwargs)
    return decorated
```

**Użycie:**
```python
@customers_bp.route('/', methods=['GET'])
@require_auth  # Wymagana autoryzacja
def get_customers():
    pass
```

---

#### `get_current_user()`
**Co robi:**
- Pobiera obecnie zalogowanego użytkownika

**Definicja:**
```python
# backend-python/app/middleware.py
def get_current_user():
    token = request.headers.get('Authorization')
    if not token:
        return None
    data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    user_id = data.get('sub')
    user = User.query.get(user_id)
    return user
```

**Użycie:**
```python
def create_customer():
    user = get_current_user()
    customer = Customer(..., CreatedBy=user.id)
```

---

### 6.2. Model Methods

#### `to_dict()` - Własna metoda w każdym modelu
**Co robi:**
- Serializuje obiekt do słownika 
<!-- co to serializacja ?  -->  
Serializacja do dict (metoda `to_dict()`) to proces zamiany obiektu Pythona (np. instancji modelu bazy danych) na zwykły słownik (`dict`), którego wartości reprezentują atrybuty tego obiektu. Dzięki temu możemy łatwo przesłać dane w formacie JSON do frontendu lub innego systemu (np. przez API REST).

**Przykład:**
- Obiekt typu `Customer` (np. z bazy danych) ma pola: `id`, `name`, `email`.
- Metoda `to_dict()` zwraca: `{'id': 123, 'name': 'Jan', 'email': 'jan@example.com'}`

**Zastosowanie serializacji:**
- Przesyłanie danych do React (frontend)
- Zapisywanie do plików JSON
- Uproszczenie komunikacji między serwerem a klientem

**W skrócie:**  
Serializacja to zamiana obiektu (np. klasy) na strukturę, którą można łatwo przesłać lub zapisać (np. słownik lub JSON).


**Definicja:**
```python
# backend-python/app/models/customer.py
class Customer(db.Model):
    # ...
    def to_dict(self):
        return {
            'id': self.Id,
            'name': self.Name,
            'email': self.Email
        }
```

**Użycie:**
```python
customer = Customer.query.get(123)
# customer = Customer.query.get(123)
# Wyjaśnienie:
# Ten kod pobiera jeden obiekt (rekord klienta) o ID=123 z bazy danych za pomocą SQLAlchemy.
# Działa to w następujący sposób:
# - `Customer` to klasa modelu reprezentująca tabelę `customers` w bazie danych.
# - `.query` umożliwia wykonywanie zapytań do tej tabeli.
# - `.get(123)` pobiera rekord o kluczu głównym równym 123 (czyli klienta o ID 123).
# Jeśli nie ma takiego rekordu, wartość `customer` będzie równa `None`.

return jsonify(customer.to_dict())
# Zwraca: {"id": 123, "name": "Jan", "email": "jan@example.com"}
```

---

## 7. PODSUMOWANIE

### Metody SQLAlchemy
- `query.all()` - wszystkie rekordy
- `query.get(id)` - pojedynczy rekord
- `query.filter_by()` - filtrowanie
- `session.add()` - dodanie
- `session.commit()` - zapis
- `session.delete()` - usunięcie

### Metody Flask
- `request.get_json()` - dane z body
- `jsonify()` - odpowiedź JSON
- `@route()` - rejestracja endpointu

### Metody React
- `useState()` - stan lokalny
- `useEffect()` - side effects
- `useContext()` - globalny stan

### Metody JWT
- `jwt.encode()` - generowanie tokena
- `jwt.decode()` - dekodowanie tokena

### Własne Metody
- `require_auth()` - autoryzacja
- `get_current_user()` - bieżący użytkownik
- `to_dict()` - serializacja modelu

---

**Dokument obejmuje wszystkie kluczowe metody używane w projekcie CRM.**

