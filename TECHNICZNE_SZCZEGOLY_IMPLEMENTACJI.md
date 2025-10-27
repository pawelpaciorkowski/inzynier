# 🔧 SZCZEGÓŁOWY OPIS TECHNICZNY IMPLEMENTACJI - CRM SYSTEM

**Dokument techniczny opisujący wszystkie aspekty implementacji systemu CRM**

---

## 📋 SPIS TREŚCI

1. [Middleware - Szczegółowy Opis](#1-middleware-szczegółowy-opis)
2. [Wzorce Projektowe](#2-wzorce-projektowe)
3. [ORM i Schemat Bazy Danych](#3-orm-i-schemat-bazy-danych)
4. [Komponenty React](#4-komponenty-react)
5. [State Management](#5-state-management)
6. [Autoryzacja i Bezpieczeństwo](#6-autoryzacja-i-bezpieczeństwo)
7. [Kontrolery (Controllers)](#7-kontrolery-controllers)
8. [Modele Danych](#8-modele-danych)
9. [Komponenty React - Kompletna Lista](#9-komponenty-react-kompletna-lista)
10. [Routing i Nawigacja](#10-routing-i-nawigacja)
11. [Obsługa Błędów](#11-obsługa-błędów)
12. [Testowanie](#12-testowanie)
13. [Deployment](#13-deployment)
14. [Konkluzja](#14-konkluzja)

---

## 1. MIDDLEWARE - SZCZEGÓŁOWY OPIS

### 1.1. Czym jest Middleware?

Middleware to warstwa pośrednia w aplikacji, która przechwytuje żądania HTTP przed dotarciem do docelowej funkcji endpointu. W kontekście Flask, middleware pozwala na wykonywanie wspólnej logiki (jak autoryzacja, logowanie, walidacja) przed przetworzeniem żądania.

### 1.2. Implementacja Middleware w projekcie

#### 1.2.1. Plik `app/middleware.py` - Szczegółowa analiza

```python
from functools import wraps
from flask import request, jsonify, current_app
import jwt
from app.database import db
from app.models import User, Role
```

**Importy:**
- `functools.wraps` - Zachowuje metadane oryginalnej funkcji (nazwa, docstring) po użyciu dekoratora
- `request` - Dostęp do danych żądania HTTP (headers, body, params)
- `jsonify` - Konwersja Pythona na JSON response
- `current_app` - Dostęp do kontekstu aplikacji Flask
- `jwt` - Biblioteka do dekodowania i weryfikacji tokenów JWT
- `db` - Instancja SQLAlchemy do zapytań do bazy
- `User, Role` - Modele użytkownika i roli

#### 1.2.2. Funkcja `require_auth` - Szczegółowa analiza

```python
def require_auth(f):
    """
    Dekorator wymagający autoryzacji dla endpointu.
    
    Jak działa:
    1. Przechwytuje żądanie HTTP
    2. Wyciąga token JWT z nagłówka Authorization
    3. Weryfikuje poprawność tokenu
    4. Dekoduje dane użytkownika z tokenu
    5. Zapobiega wykonaniu funkcji jeśli token nieprawidłowy
    """
```

**Krok po kroku:**

```python
@wraps(f)
def decorated(*args, **kwargs):
    # KROK 1: Pobranie tokena z nagłówka
    token = request.headers.get('Authorization')
```

**Wyjaśnienie:**
- `@wraps(f)` - Zachowuje metadane funkcji `f`
- `*args, **kwargs` - Pozwala na przekazanie dowolnych argumentów do funkcji
- `request.headers.get('Authorization')` - Pobiera nagłówek HTTP "Authorization"
- Format nagłówka: `Authorization: Bearer <token>` lub po prostu `<token>`

```python
    if not token:
        return jsonify({'error': 'Brak tokena autoryzacyjnego'}), 401
```

**Wyjaśnienie:**
- Jeśli brak tokena → zwróć błąd 401 (Unauthorized)
- `jsonify` - Tworzy odpowiedź JSON
- Status 401 informuje klienta, że wymagana jest autoryzacja

```python
    try:
        # KROK 2: Dekodowanie i weryfikacja tokenu
        data = jwt.decode(
            token, 
            current_app.config['SECRET_KEY'], 
            algorithms=['HS256']
        )
```

**Wyjaśnienie:**
- `jwt.decode()` - Dekoduje i weryfikuje token JWT
- Trzy parametry:
  1. `token` - Token JWT do zweryfikowania
  2. `SECRET_KEY` - Tajny klucz użyty do podpisania tokenu (z konfiguracji Flask)
  3. `algorithms=['HS256']` - Dozwolone algorytmy szyfrowania
- Jeśli token jest nieprawidłowy (zły podpis, wygasły, etc.) → wyjątek
- JWT składa się z 3 części: Header.Payload.Signature

```python
        # KROK 3: Dekodowanie powoduje wyjątek jeśli token nieprawidłowy
        # Jeśli dotarliśmy tutaj, token jest poprawny
        current_user_id = data['sub']  # ID użytkownika z tokenu
```

**Wyjaśnienie:**
- `data['sub']` - Pole 'sub' (subject) w JWT zawiera ID użytkownika
- JWT Payload wygląda np.: `{"sub": 1, "username": "admin", "role": "Admin"}`

```python
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token wygasł'}), 401
```

**Wyjaśnienie:**
- Tokeny JWT mają expiration time
- Po wygaśnięciu weryfikacja zwraca ten wyjątek
- Przykład JWT z expiration: `{"exp": 1735689600}` (timestamp)

```python
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Nieprawidłowy token'}), 401
```

**Wyjaśnienie:**
- Wszystkie inne błędy weryfikacji (zły podpis, zła struktura, etc.)
- Jasny komunikat błędu dla klienta

```python
    # KROK 4: Wszystko OK - pozwól na wykonanie funkcji
    return f(*args, **kwargs)
```

**Wyjaśnienie:**
- Jeśli weryfikacja przeszła → wykonaj oryginalną funkcję endpointu
- `*args, **kwargs` - Przekaż wszystkie argumenty dalej

```python
return decorated
```

**Wyjaśnienie:**
- Zwróć funkcję wrapper, która zastąpi oryginalną funkcję

#### 1.2.3. Użycie Middleware

```python
@app.route('/api/customers', methods=['GET'])
@require_auth  # <-- Zastosowanie middleware
def get_customers():
    customers = Customer.query.all()
    return jsonify([c.to_dict() for c in customers])
```

**Jak to działa:**
1. HTTP Request → Flask
2. Flask widzi decorator `@require_auth`
3. Zamiast od razu wykonać `get_customers()`, wykonuje `decorated()`
4. `decorated()` weryfikuje token
5. Jeśli OK → wywołuje `get_customers()`
6. Jeśli nie OK → zwraca błąd 401

#### 1.2.4. Funkcja `get_current_user` - Szczegółowa analiza

```python
def get_current_user():
    """
    Pobiera obecnie zalogowanego użytkownika na podstawie tokenu JWT.
    
    Jak działa:
    1. Wyciąga token z nagłówka Authorization
    2. Dekoduje token
    3. Wyciąga user_id z tokenu
    4. Wyszukuje użytkownika w bazie danych
    5. Zwraca obiekt User lub None
    """
```

```python
    token = request.headers.get('Authorization')
    if not token:
        return None
```

**Wyjaśnienie:**
- Bezpieczne sprawdzenie czy jest token
- Zwraca `None` zamiast wyjątku - pozwala na opcjonalną autoryzację

```python
    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = data.get('sub')
        
        if not user_id:
            return None
```

**Wyjaśnienie:**
- Dekodowanie tokenu
- `data.get('sub')` - Bezpieczne wyciągnięcie ID (zwraca None jeśli brak)

```python
        # Wyszukiwanie użytkownika w bazie
        user = User.query.get(user_id)
        
        # Odświeżenie relacji (eager loading)
        db.session.refresh(user)
        
        return user
```

**Wyjaśnienie:**
- `User.query.get(user_id)` - SQLAlchemy: `SELECT * FROM users WHERE id = ?`
- `db.session.refresh(user)` - Załadowanie najnowszych danych i relacji z bazy
- Zwraca obiekt Python (nie dict)

```python
    except Exception as e:
        print(f"Błąd w get_current_user: {e}")
        return None
```

**Wyjaśnienie:**
- Wszystkie wyjątki są obsłużone
- Drukowanie błędu do logów dla debugowania
- Zwraca `None` - bezpieczne zachowanie

#### 1.2.5. Funkcja `get_current_user_role` - Szczegółowa analiza

```python
def get_current_user_role():
    """
    Pobiera rolę obecnie zalogowanego użytkownika.
    
    Jak działa:
    1. Pobiera użytkownika (get_current_user)
    2. Wyciąga relację role
    3. Zwraca nazwę roli
    """
    user = get_current_user()
    if not user:
        return None
    
    # Odświeżenie relacji
    db.session.refresh(user)
    
    if not user.role:
        return None
    
    return user.role.name
```

**Wyjaśnienie:**
- Reużywa `get_current_user()`
- Sprawdza czy istnieje relacja `role`
- Zwraca tylko nazwę (string) zamiast całego obiektu
- `user.role` - Relacja one-to-many w SQLAlchemy

#### 1.2.6. Funkcja `get_current_user_id` - Szczegółowa analiza

```python
def get_current_user_id():
    """
    Pobiera ID obecnie zalogowanego użytkownika.
    
    Jak działa:
    1. Pobiera użytkownika
    2. Zwraca jego ID lub None
    """
    user = get_current_user()
    return user.id if user else None
```

**Wyjaśnienie:**
- Najprostsza funkcja pomocnicza
- Używana gdy potrzebny jest tylko ID (nie cały obiekt)

---

## 2. WZORCE PROJEKTOWE

### 2.1. Decorator Pattern (Wzorzec Dekorator)

#### 2.1.1. Definicja

Decorator Pattern pozwala na dynamiczne dodawanie funkcjonalności do obiektów/funkcji bez modyfikacji ich struktury.

#### 2.1.2. Implementacja w projekcie

```python
def require_auth(f):  # <-- Decorator (funkcja przyjmująca funkcję)
    @wraps(f)         # <-- Dekorujemy wrapper
    def decorated(*args, **kwargs):  # <-- Wrapper function
        # Dodatkowa logika PRZED wykonaniem
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Brak tokena'}), 401
        
        # Wywołanie oryginalnej funkcji
        return f(*args, **kwargs)  # <-- Wykonanie dekorowanej funkcji
    
    return decorated  # <-- Zwrócenie wrappera
```

**Schemat działania:**

```
Funkcja bez dekoratora:
get_customers() → wykonuje się od razu

Funkcja z dekoratorem:
get_customers() → decorated() → weryfikacja → get_customers()
                   ^^^^^^^^^^
                   wrapper dodaje funkcjonalność
```

**Przykład użycia:**

```python
# Bez dekoratora
def get_customers():
    return jsonify({'data': 'customers'})

# Z dekoratorem
@require_auth
def get_customers():
    return jsonify({'data': 'customers'})
```

**Różnica:**
- Bez dekoratora: wywołanie bezpośrednie, brak ochrony
- Z dekoratorem: wrapper weryfikuje token przed wykonaniem

### 2.2. Factory Pattern (Wzorzec Fabryki)

#### 2.2.1. Definicja

Factory Pattern centralizuje tworzenie obiektów w jednej funkcji (factory function).

#### 2.2.2. Implementacja w projekcie - `app/__init__.py`

```python
def create_app():
    """
    Factory function tworząca instancję aplikacji Flask.
    
    Jak działa:
    1. Tworzy nową instancję Flask
    2. Konfiguruje aplikację
    3. Inicjalizuje rozszerzenia (database, CORS, etc.)
    4. Rejestruje blueprints (moduły)
    5. Zwraca gotową aplikację
    """
```

**Krok po kroku:**

```python
def create_app():
    # KROK 1: Tworzenie instancji aplikacji
    app = Flask(__name__)
```

**Wyjaśnienie:**
- `Flask(__name__)` - Tworzy instancję aplikacji
- `__name__` - Nazwa modułu (flask używa tego do znajdowania folderów, plików)

```python
    # KROK 2: Konfiguracja
    app.config.from_object(Config)
```

**Wyjaśnienie:**
- Ładuje konfigurację z klasy `Config`
- Config zawiera: SECRET_KEY, DATABASE_URI, CORS settings, etc.

```python
    # KROK 3: Inicjalizacja rozszerzeń
    CORS(app, origins=['http://localhost:3000', 'http://localhost:8100'])
    init_database(app)
```

**Wyjaśnienie:**
- `CORS` - Pozwala na cross-origin requests (frontend z innego portu)
- `init_database` - Inicjalizuje SQLAlchemy i tworzy tabele

```python
    # KROK 4: Rejestracja blueprintów (modułów)
    from app.controllers.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/Auth')
```

**Wyjaśnienie:**
- Blueprint to modułowa organizacja endpointów
- Każdy moduł (auth, customers, invoices) ma swój blueprint
- `url_prefix` - Wszystkie endpointy w blueprint zaczynają się od tego prefixu

```python
    return app  # KROK 5: Zwrócenie gotowej aplikacji
```

**Użycie Factory Pattern:**

```python
# app.py lub start_server.py
from app import create_app

app = create_app()  # <-- Wywołanie factory function

if __name__ == '__main__':
    app.run(debug=True)
```

**Zalety Factory Pattern:**
- Możliwość tworzenia wielu instancji aplikacji (dla testów)
- Separacja konfiguracji od tworzenia aplikacji
- Łatwe testowanie (można utworzyć testową instancję)

### 2.3. Repository Pattern (Wzorzec Repozytorium)

#### 2.3.1. Definicja

Repository Pattern abstrahuje dostęp do danych, tworząc warstwę pośrednią między logiką biznesową a bazą danych.

#### 2.3.2. Implementacja w projekcie - Modele SQLAlchemy

```python
class Customer(db.Model):
    """
    Model reprezentujący klienta w bazie danych.
    
    Repository Pattern:
    - Klasa Customer działa jako "repository" dla tabeli Customers
    - Metody query są abstrakcją nad SQL
    - to_dict() to serializacja
    """
```

```python
    # Definicja tabeli
    __tablename__ = 'Customers'
    
    # Kolumny (atrybuty)
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(255))
```

**Wyjaśnienie:**
- `__tablename__` - Nazwa tabeli w bazie danych
- `Id = db.Column(...)` - Definicja kolumny
- `primary_key=True` - Klucz główny
- `nullable=False` - Pole wymagane

```python
    # Relacje (foreign keys)
    tags = db.relationship('Tag', secondary=customer_tags, backref='customers')
```

**Wyjaśnienie:**
- `relationship()` - SQLAlchemy automatycznie tworzy JOIN
- `secondary=customer_tags` - Tabela pomocnicza dla many-to-many
- `backref='customers'` - Automatycznie dodaje `.customers` do Tag

```python
    # Metody (CRUD operations)
    def to_dict(self):
        """Serializacja do JSON"""
        return {
            'id': self.Id,
            'name': self.Name,
            'email': self.Email,
        }
```

**Przykład użycia Repository Pattern:**

```python
# Stare podejście (bez Repository)
def get_customers():
    cursor = db.execute("SELECT * FROM Customers")
    results = []
    for row in cursor:
        results.append({
            'id': row[0],
            'name': row[1],
        })
    return results

# Nowe podejście (z Repository Pattern - SQLAlchemy)
def get_customers():
    customers = Customer.query.all()  # <-- Abstrakcja
    return [c.to_dict() for c in customers]
```

**Zalety:**
- Mniej kodu
- Bezpieczeństwo (ORM automatycznie escape'uje SQL)
- Łatwiejsze testowanie (mock repository)
- Przenośność (zmiana bazy danych nie wymaga zmiany kodu)

### 2.4. Dependency Injection (Wstrzykiwanie Zależności)

#### 2.4.1. Definicja

Dependency Injection polega na "wstrzykiwaniu" zależności do obiektu z zewnątrz, zamiast tworzenia ich wewnątrz.

#### 2.4.2. Implementacja w projekcie

```python
def init_database(app):
    """
    Dependency Injection - app jest "wstrzykiwane" do init_database
    
    app jest zależnością, która jest przekazywana z zewnątrz (z create_app)
    """
    db.init_app(app)  # <-- Wstrzyknięcie app do db
    
    with app.app_context():  # <-- Kontekst aplikacji
        from app.models import Customer, User, etc.
        db.create_all()
```

**Przed Dependency Injection (złe podejście):**

```python
# db jest globalny, trudny do testowania
db = SQLAlchemy()

def get_customers():
    return db.session.query(Customer).all()
```

**Po Dependency Injection:**

```python
# app jest przekazywane (można zamockować w testach)
def init_database(app):
    db.init_app(app)
```

**Testowanie z Dependency Injection:**

```python
# W testach możemy przekazać testową instancję app
def test_database():
    test_app = create_test_app()  # Mock application
    init_database(test_app)
    # Testy...
```

---

## 3. ORM I SCHEMAT BAZY DANYCH

### 3.1. Czym jest ORM?

ORM (Object-Relational Mapping) mapuje obiekty Pythona na tabele w bazie danych i odwrotnie.

### 3.2. SQLAlchemy - Szczegółowy Opis

#### 3.2.1. Inicjalizacja ORM

```python
# app/database/__init__.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
```

**Wyjaśnienie:**
- `db` to instancja SQLAlchemy (singleton)
- Używa session do zarządzania transakcjami

#### 3.2.2. Model - Szczegółowa analiza

```python
class Customer(db.Model):
    """
    Model reprezentuje tabelę Customers w bazie danych.
    
    Konwersja Python → SQL:
    Customer → SELECT * FROM Customers
    customer.Name → customer.Name (atrybut)
    """
```

**Definicja kolumn:**

```python
    Id = db.Column(db.Integer, primary_key=True)
```

**Wyjaśnienie:**
- `db.Column` - Typ kolumny
- `db.Integer` - SQL typ: INTEGER
- `primary_key=True` - PRIMARY KEY w SQL
- `Id` - Nazwa kolumny w bazie

```python
    Name = db.Column(db.String(255), nullable=False)
```

**Wyjaśnienie:**
- `db.String(255)` - SQL: VARCHAR(255)
- `nullable=False` - NOT NULL w SQL
- Dopuszcza NULL gdy False

```python
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
```

**Wyjaśnienie:**
- `db.DateTime` - SQL: DATETIME
- `default=datetime.utcnow` - Automatyczne ustawienie podczas INSERT
- Funkcja wywoływana przy każdym INSERT

#### 3.2.3. Relacje - Szczegółowa analiza

**One-to-Many (1:N):**

```python
# W modelu Invoice
CustomerId = db.Column(db.Integer, db.ForeignKey('Customers.Id'), nullable=False)
customer = db.relationship('Customer', backref='invoices')
```

**Wyjaśnienie:**
- `db.ForeignKey('Customers.Id')` - Foreign Key w SQL
- `relationship('Customer')` - Tworzy atrybut `.customer` w Invoice
- `backref='invoices'` - Automatycznie tworzy `.invoices` w Customer

**Przykład użycia:**
```python
invoice = Invoice.query.first()
print(invoice.customer.Name)  # Automatyczny JOIN do Customers

customer = Customer.query.first()
print(customer.invoices)  # Lista wszystkich faktur dla klienta
```

**Many-to-Many (N:N):**

```python
# Tabela pomocnicza
customer_tags = db.Table('CustomerTags',
    db.Column('CustomerId', db.Integer, db.ForeignKey('Customers.Id'), primary_key=True),
    db.Column('TagId', db.Integer, db.ForeignKey('Tags.Id'), primary_key=True)
)

# W modelu Customer
tags = db.relationship('Tag', secondary=customer_tags, backref='customers')
```

**Wyjaśnienie:**
- `db.Table` - Tabela pomocnicza (junction table)
- Dwie kolumny jako primary key (composite key)
- `secondary=customer_tags` - Tabela łącząca

**Przykład użycia:**
```python
customer = Customer.query.first()
customer.tags = [tag1, tag2]  # Automatycznie dodaje do CustomerTags
db.session.commit()
```

#### 3.2.4. Zapytania SQLAlchemy

**Podstawowe zapytania:**

```python
# SELECT * FROM Customers
customers = Customer.query.all()

# SELECT * FROM Customers WHERE Id = 1
customer = Customer.query.get(1)

# SELECT * FROM Customers WHERE Email = 'test@example.com'
customer = Customer.query.filter_by(Email='test@example.com').first()

# SELECT * FROM Customers WHERE Name LIKE '%Kowalski%'
customers = Customer.query.filter(Customer.Name.like('%Kowalski%')).all()
```

**Złożone zapytania:**

```python
# SELECT * FROM Customers ORDER BY Name LIMIT 10
customers = Customer.query.order_by(Customer.Name).limit(10).all()

# SELECT * FROM Customers WHERE CreatedAt > '2024-01-01'
from datetime import datetime
customers = Customer.query.filter(Customer.CreatedAt > datetime(2024, 1, 1)).all()

# JOIN
# SELECT c.*, i.* FROM Customers c INNER JOIN Invoices i ON c.Id = i.CustomerId
customers = db.session.query(Customer, Invoice).join(Invoice).all()
```

**Transakcje:**

```python
# INSERT
new_customer = Customer(Name='Jan Kowalski', Email='jan@example.com')
db.session.add(new_customer)
db.session.commit()

# UPDATE
customer = Customer.query.get(1)
customer.Name = 'Jan Nowak'
db.session.commit()

# DELETE
customer = Customer.query.get(1)
db.session.delete(customer)
db.session.commit()
```

### 3.3. Schemat Bazy Danych - Relacje

#### 3.3.1. Diagram relacji

```
users (1) ---< (N) Tasks
users (N) ---< (N) Groups (UserGroups)
Customers (1) ---< (N) Invoices
Customers (1) ---< (N) Notes
Customers (N) ---< (N) Tags (CustomerTags)
Invoices (1) ---< (N) InvoiceItems
Invoices (N) ---< (N) Tags (InvoiceTags)
```

#### 3.3.2. Przykładowe tabele

**Tabela users:**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

**Tabela Customers:**
```sql
CREATE TABLE Customers (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255),
    Phone VARCHAR(50),
    Company VARCHAR(255),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    AssignedGroupId INT,
    AssignedUserId INT,
    FOREIGN KEY (AssignedUserId) REFERENCES users(id) ON DELETE SET NULL
);
```

**Tabela CustomerTags (Many-to-Many):**
```sql
CREATE TABLE CustomerTags (
    CustomerId INT NOT NULL,
    TagId INT NOT NULL,
    PRIMARY KEY (CustomerId, TagId),
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id) ON DELETE CASCADE,
    FOREIGN KEY (TagId) REFERENCES Tags(Id) ON DELETE CASCADE
);
```

---

## 4. KOMPONENTY REACT - SZCZEGÓŁOWY OPIS

### 4.1. Struktura Komponentu

```typescript
import React, { useState, useEffect } from 'react';

interface Props {
    title: string;
    onSave: (data: any) => void;
}

const MyComponent: React.FC<Props> = ({ title, onSave }) => {
    // Stan komponentu
    const [data, setData] = useState<string>('');
    
    // Efekt (side effect)
    useEffect(() => {
        console.log('Component mounted');
    }, []);
    
    // Render
    return (
        <div>
            <h1>{title}</h1>
            <input value={data} onChange={e => setData(e.target.value)} />
            <button onClick={() => onSave(data)}>Save</button>
        </div>
    );
};

export default MyComponent;
```

### 4.2. Hooks - Szczegółowy Opis

#### 4.2.1. useState

```typescript
const [value, setValue] = useState<Type>(initialValue);
```

**Jak działa:**
1. React tworzy zmienną stanową `value`
2. `setValue` to funkcja aktualizująca stan
3. Każda aktualizacja powoduje re-render komponentu

**Przykład:**
```typescript
const [count, setCount] = useState<number>(0);

// Aktualizacja
setCount(count + 1);  // count będzie 1

// Funkcja callback
setCount(prev => prev + 1);  // Bezpieczniejsze przy async
```

**Mechanizm:**
```
Komponent renderuje
  ↓
useState(0) zwraca [0, setCount]
  ↓
User clicks button
  ↓
setCount(1) wywołane
  ↓
React: "Stan się zmienił, muszę re-renderować"
  ↓
Komponent renderuje ponownie
  ↓
useState zwraca [1, setCount]  // Pamięta poprzedni stan
```

#### 4.2.2. useEffect

```typescript
useEffect(() => {
    // Effect code
    return () => {
        // Cleanup code
    };
}, [dependencies]);
```

**Cykl życia:**
```
1. Mount (komponent się montuje)
   ↓
2. useEffect uruchomiony (effect code)
   ↓
3. Update (komponent się aktualizuje)
   ↓
4. Cleanup uruchomiony (cleanup code z poprzedniego)
   ↓
5. useEffect uruchomiony ponownie (jeśli dependencies się zmieniły)
   ↓
6. Unmount (komponent się odmontowuje)
   ↓
7. Cleanup uruchomiony (finalny cleanup)
```

**Przykłady:**

```typescript
// 1. Bez dependencies - uruchamia się przy każdym renderze
useEffect(() => {
    console.log('Render');
});

// 2. Puste dependencies [] - uruchamia się raz po mount
useEffect(() => {
    fetchData();
}, []);

// 3. Z dependencies - uruchamia się gdy zależności się zmienią
useEffect(() => {
    fetchCustomer(customerId);
}, [customerId]);

// 4. Z cleanup - sprzątanie po sobie
useEffect(() => {
    const timer = setInterval(() => {
        console.log('Tick');
    }, 1000);
    
    return () => {
        clearInterval(timer);  // Cleanup
    };
}, []);
```

#### 4.2.3. useContext

```typescript
const value = useContext(MyContext);
```

**Jak działa Context API:**

```typescript
// 1. Tworzenie kontekstu
const AuthContext = createContext<AuthContextType | null>(null);

// 2. Provider (dostarcza wartość)
<AuthContext.Provider value={{ user, token }}>
    {children}
</AuthContext.Provider>

// 3. Consumer (w komponencie)
const { user, token } = useContext(AuthContext);
```

**Dlaczego Context API?**
- Bez Context: przekazywanie props przez wiele poziomów (props drilling)
- Z Context: dostęp z dowolnego miejsca w drzewie komponentów

### 4.3. Event Handling

```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log('Clicked');
};

// Użycie
<button onClick={handleClick}>Click me</button>
```

**Typy eventów:**
- `React.MouseEvent<HTMLButtonElement>` - Kliknięcie myszy
- `React.ChangeEvent<HTMLInputElement>` - Zmiana w input
- `React.FormEvent<HTMLFormElement>` - Submit formularza

### 4.4. Listy i Mapowanie

```typescript
const customers = [
    { id: 1, name: 'Jan' },
    { id: 2, name: 'Anna' }
];

return (
    <ul>
        {customers.map(customer => (
            <li key={customer.id}>
                {customer.name}
            </li>
        ))}
    </ul>
);
```

**Wyjaśnienie:**
- `map()` - Transformuje tablicę w tablicę JSX
- `key` - Unikalny identyfikator (React używa tego do optymalizacji)

---

## 5. STATE MANAGEMENT

### 5.1. Local State (useState)

```typescript
const [name, setName] = useState('');
```

**Zastosowanie:**
- Stan lokalny w komponencie
- Formularze, toggle, input fields

### 5.2. Global State (Context API)

```typescript
// context/AuthContext.tsx
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    
    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
```

**Zastosowanie:**
- Stan globalny (user, theme, language)
- Współdzielony między wieloma komponentami

### 5.3. Server State (API Calls)

```typescript
const [customers, setCustomers] = useState([]);

useEffect(() => {
    api.get('/Customers/')
        .then(response => setCustomers(response.data))
        .catch(error => console.error(error));
}, []);
```

**Zastosowanie:**
- Dane z serwera (klienci, faktury, zadania)
- Synchronizacja z backendem

---

## 6. AUTORYZACJA I BEZPIECZEŃSTWO

### 6.1. JWT Token - Szczegółowy Opis

#### 6.1.1. Struktura JWT

```
Header.Payload.Signature
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "sub": 1,
  "username": "admin",
  "role": "Admin",
  "iat": 1735689600,
  "exp": 1735693200
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret_key
)
```

#### 6.1.2. Generowanie Tokenu (Backend)

```python
def generate_token(user_id, username, role):
    payload = {
        'sub': user_id,
        'username': username,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token
```

#### 6.1.3. Weryfikacja Tokenu

```python
def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload  # Zwraca dane użytkownika
    except jwt.ExpiredSignatureError:
        return None  # Token wygasł
    except jwt.InvalidTokenError:
        return None  # Token nieprawidłowy
```

### 6.2. Bezpieczeństwo Hasło

#### 6.2.1. Hashowanie (bcrypt)

```python
from werkzeug.security import generate_password_hash, check_password_hash

# Tworzenie hasha
password_hash = generate_password_hash('user_password')

# Weryfikacja
is_valid = check_password_hash(password_hash, 'user_password')
```

**Jak działa bcrypt:**
1. Generuje sól (salt)
2. Hashuje hasło + sól
3. Zapisuje: `$2b$12$salt_hash`

**Zalety:**
- Jednokierunkowe (nie można odzyskać hasła)
- Unikalna sól dla każdego hasła
- Wolne (celowo - opór na brute-force)

---

**To jest pierwsza część dokumentu. Czy chcesz, abym kontynuował z kolejnymi sekcjami?**

**Dalsze sekcje będą zawierać:**
- Szczegółowy opis każdej kontrolera
- Analiza każdego modelu danych
- Kompletny opis komponentów React
- Routing i nawigacja
- Obsługa błędów
- Testowanie
- Deployment

Powiedz mi, którą część chcesz rozszerzyć jako następną!

---

## 7. KONTROLERY (CONTROLLERS) - SZCZEGÓŁOWA ANALIZA

### 7.1. Struktura Kontrolera

Kontroler w aplikacji Flask obsługuje żądania HTTP i zwraca odpowiedzi JSON.

**Przykładowa struktura:**

```python
from flask import Blueprint, request, jsonify
from app.models import Customer
from app.database import db
from app.middleware import require_auth, get_current_user

# Tworzenie Blueprint
customers_bp = Blueprint('customers', __name__)

# Endpoint GET /api/Customers/
@customers_bp.route('/', methods=['GET'])
@require_auth
def get_customers():
    """
    Pobiera listę wszystkich klientów.
    
    Request:
        GET /api/Customers/
        Headers: Authorization: Bearer <token>
    
    Response:
        Status: 200 OK
        Body: [
            {
                "id": 1,
                "name": "Jan Kowalski",
                "email": "jan@example.com"
            }
        ]
    """
    try:
        # Pobranie wszystkich klientów z bazy
        customers = Customer.query.all()
        
        # Serializacja do JSON
        result = [customer.to_dict() for customer in customers]
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### 7.2. Analiza Głównych Kontrolerów

#### 7.2.1. `controllers/auth.py` - Autentykacja

**Endpoint: POST /api/Auth/login**

```python
@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Logowanie użytkownika.
    
    Request Body:
        {
            "username": "admin",
            "password": "password123"
        }
    
    Response:
        Status: 200 OK
        Body: {
            "token": "eyJhbGciOiJIUzI1NiIs...",
            "user": {
                "id": 1,
                "username": "admin",
                "role": "Admin"
            }
        }
    
    Jak działa:
    1. Pobiera username i password z request body
    2. Wyszukuje użytkownika w bazie
    3. Weryfikuje hasło (bcrypt)
    4. Generuje JWT token
    5. Zwraca token i dane użytkownika
    """
    data = request.get_json()
    
    # Walidacja
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Brak username lub password'}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    # Wyszukiwanie użytkownika
    user = User.query.filter_by(username=username).first()
    
    if not user:
        return jsonify({'error': 'Nieprawidłowe dane logowania'}), 401
    
    # Weryfikacja hasła
    if not user.check_password(password):
        return jsonify({'error': 'Nieprawidłowe dane logowania'}), 401
    
    # Generowanie JWT token
    token = generate_token(user.id, user.username, user.role.name)
    
    # Zapisz login history
    login_history = LoginHistory(user_id=user.id, login_time=datetime.utcnow())
    db.session.add(login_history)
    db.session.commit()
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role.name
        }
    }), 200
```

**Endpoint: POST /api/Auth/register**

```python
@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Rejestracja nowego użytkownika.
    
    Jak działa:
    1. Walidacja danych wejściowych
    2. Sprawdzenie czy username już istnieje
    3. Hashowanie hasła
    4. Tworzenie użytkownika
    5. Przypisanie roli (domyślnie "User")
    6. Zwrócenie tokenu i danych
    """
    data = request.get_json()
    
    # Walidacja
    if not all([data.get('username'), data.get('email'), data.get('password')]):
        return jsonify({'error': 'Wszystkie pola są wymagane'}), 400
    
    # Sprawdzenie czy username istnieje
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username już istnieje'}), 400
    
    # Sprawdzenie czy email istnieje
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email już istnieje'}), 400
    
    # Tworzenie użytkownika
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    
    # Przypisanie roli (domyślnie "User")
    user_role = Role.query.filter_by(name='User').first()
    user.role = user_role
    
    db.session.add(user)
    db.session.commit()
    
    # Generowanie tokenu
    token = generate_token(user.id, user.username, user.role.name)
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 201
```

#### 7.2.2. `controllers/customers.py` - Zarządzanie Klientami

**Endpoint: GET /api/Customers/:id**

```python
@customers_bp.route('/<int:customer_id>', methods=['GET'])
@require_auth
def get_customer(customer_id):
    """
    Pobiera szczegóły jednego klienta.
    
    Endpoint: GET /api/Customers/123
    Path Parameter: customer_id (integer)
    
    Jak działa:
    1. Pobiera customer_id z URL
    2. Wyszukuje klienta w bazie
    3. Ładuje relacje (tags, invoices, notes)
    4. Zwraca pełne dane klienta
    """
    customer = Customer.query.get(customer_id)
    
    if not customer:
        return jsonify({'error': 'Klient nie znaleziony'}), 404
    
    # Serializacja z relacjami
    customer_dict = customer.to_dict()
    
    # Dodanie relacji
    customer_dict['tags'] = [tag.to_dict() for tag in customer.tags]
    customer_dict['invoices'] = [invoice.to_dict() for invoice in customer.invoices]
    customer_dict['notes'] = [note.to_dict() for note in customer.notes]
    
    return jsonify(customer_dict), 200
```

**Endpoint: POST /api/Customers/**

```python
@customers_bp.route('/', methods=['POST'])
@require_auth
def create_customer():
    """
    Tworzy nowego klienta.
    
    Request Body:
        {
            "name": "Jan Kowalski",
            "email": "jan@example.com",
            "phone": "123456789",
            "company": "ABC Sp. z o.o."
        }
    
    Jak działa:
    1. Pobiera dane z request body
    2. Tworzy nowy obiekt Customer
    3. Zapisuje do bazy
    4. Zwraca utworzonego klienta
    """
    data = request.get_json()
    
    # Walidacja wymaganych pól
    if not data or not data.get('name'):
        return jsonify({'error': 'Nazwa jest wymagana'}), 400
    
    # Tworzenie klienta
    customer = Customer(
        Name=data.get('name'),
        Email=data.get('email'),
        Phone=data.get('phone'),
        Company=data.get('company'),
        CreatedAt=datetime.utcnow()
    )
    
    db.session.add(customer)
    db.session.commit()
    
    return jsonify(customer.to_dict()), 201
```

**Endpoint: PUT /api/Customers/:id**

```python
@customers_bp.route('/<int:customer_id>', methods=['PUT'])
@require_auth
def update_customer(customer_id):
    """
    Aktualizuje dane klienta.
    
    Request Body:
        {
            "name": "Jan Nowak",
            "email": "jan.nowak@example.com"
        }
    
    Jak działa:
    1. Wyszukuje klienta w bazie
    2. Aktualizuje pola z request body
    3. Zapisuje zmiany
    4. Zwraca zaktualizowanego klienta
    """
    customer = Customer.query.get(customer_id)
    
    if not customer:
        return jsonify({'error': 'Klient nie znaleziony'}), 404
    
    data = request.get_json()
    
    # Aktualizacja pól
    if 'name' in data:
        customer.Name = data['name']
    if 'email' in data:
        customer.Email = data['email']
    if 'phone' in data:
        customer.Phone = data['phone']
    if 'company' in data:
        customer.Company = data['company']
    
    db.session.commit()
    
    return jsonify(customer.to_dict()), 200
```

**Endpoint: DELETE /api/Customers/:id**

```python
@customers_bp.route('/<int:customer_id>', methods=['DELETE'])
@require_auth
def delete_customer(customer_id):
    """
    Usuwa klienta.
    
    Jak działa:
    1. Wyszukuje klienta w bazie
    2. Usuwa relacje (CASCADE w bazie)
    3. Usuwa klienta
    4. Zwraca potwierdzenie
    """
    customer = Customer.query.get(customer_id)
    
    if not customer:
        return jsonify({'error': 'Klient nie znaleziony'}), 404
    
    db.session.delete(customer)
    db.session.commit()
    
    return jsonify({'message': 'Klient usunięty pomyślnie'}), 200
```

#### 7.2.3. `controllers/invoices.py` - Zarządzanie Fakturami

**Endpoint: POST /api/Invoices/**

```python
@invoices_bp.route('/', methods=['POST'])
@require_auth
def create_invoice():
    """
    Tworzy nową fakturę.
    
    Request Body:
        {
            "customer_id": 1,
            "invoice_number": "FV/2024/001",
            "issue_date": "2024-01-15",
            "due_date": "2024-02-15",
            "items": [
                {
                    "description": "Usługa A",
                    "quantity": 2,
                    "unit_price": 100.00,
                    "vat_rate": 23
                }
            ]
        }
    
    Jak działa:
    1. Walidacja danych
    2. Tworzenie faktury
    3. Tworzenie pozycji faktury
    4. Obliczenie total amount
    5. Zapisywanie do bazy
    """
    data = request.get_json()
    
    # Walidacja
    if not data or not data.get('customer_id'):
        return jsonify({'error': 'Customer ID jest wymagane'}), 400
    
    # Tworzenie faktury
    invoice = Invoice(
        CustomerId=data['customer_id'],
        InvoiceNumber=data.get('invoice_number'),
        IssueDate=datetime.strptime(data['issue_date'], '%Y-%m-%d'),
        DueDate=datetime.strptime(data['due_date'], '%Y-%m-%d'),
        Status='Draft'
    )
    
    db.session.add(invoice)
    db.session.flush()  # Zapisuje do bazy aby uzyskać ID
    
    # Tworzenie pozycji faktury
    total_amount = 0
    for item_data in data.get('items', []):
        item = InvoiceItem(
            InvoiceId=invoice.Id,
            Description=item_data['description'],
            Quantity=item_data['quantity'],
            UnitPrice=item_data['unit_price'],
            VatRate=item_data.get('vat_rate', 0)
        )
        
        # Obliczenie kwoty brutto
        item.Amount = item.Quantity * item.UnitPrice * (1 + item.VatRate / 100)
        total_amount += item.Amount
        
        db.session.add(item)
    
    # Aktualizacja total amount
    invoice.TotalAmount = total_amount
    
    db.session.commit()
    
    return jsonify(invoice.to_dict()), 201
```

#### 7.2.4. `controllers/groups.py` - Zarządzanie Grupami

**Endpoint: POST /api/Groups/:id/customers/:customer_id**

```python
@groups_bp.route('/<int:group_id>/customers/<int:customer_id>', methods=['POST'])
@require_auth
def add_customer_to_group(group_id, customer_id):
    """
    Przypisuje klienta do grupy.
    
    Endpoint: POST /api/Groups/12/customers/123
    
    Jak działa:
    1. Sprawdza czy grupa istnieje
    2. Sprawdza czy klient istnieje
    3. Sprawdza czy klient już jest w grupie
    4. Aktualizuje AssignedGroupId klienta
    5. Zwraca odpowiedź
    """
    # Sprawdzenie czy grupa istnieje
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Grupa nie znaleziona'}), 404
    
    # Sprawdzenie czy klient istnieje
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'error': 'Klient nie znaleziony'}), 404
    
    # Sprawdzenie czy klient już jest w tej grupie
    if customer.AssignedGroupId == group_id:
        return jsonify({
            'message': f'Klient {customer.Name} już jest przypisany do grupy {group.Name}'
        }), 200
    
    # Zapamiętaj poprzednią grupę (jeśli była)
    old_group_id = customer.AssignedGroupId
    old_group_name = None
    if old_group_id:
        old_group = Group.query.get(old_group_id)
        old_group_name = old_group.Name if old_group else None
    
    # Przypisanie do nowej grupy
    customer.AssignedGroupId = group_id
    db.session.commit()
    
    # Zwrócenie odpowiedniej wiadomości
    if old_group_name:
        return jsonify({
            'message': f'Klient {customer.Name} został przeniesiony z grupy {old_group_name} do grupy {group.Name}'
        }), 200
    else:
        return jsonify({
            'message': f'Klient {customer.Name} został przypisany do grupy {group.Name}'
        }), 200
```

#### 7.2.5. `controllers/tasks.py` - Zarządzanie Zadaniami

**Endpoint: GET /api/Tasks/**

```python
@tasks_bp.route('/', methods=['GET'])
@require_auth
def get_tasks():
    """
    Pobiera zadania użytkownika.
    
    Query Parameters:
        - status: Draft, InProgress, Completed
        - priority: Low, Medium, High, Urgent
        - customer_id: ID klienta
    
    Response:
        [
            {
                "id": 1,
                "title": "Zadanie 1",
                "description": "Opis",
                "status": "InProgress",
                "priority": "High",
                "due_date": "2024-02-01",
                "customer": {
                    "id": 1,
                    "name": "Jan Kowalski"
                }
            }
        ]
    
    Jak działa:
    1. Pobiera current_user_id z tokena
    2. Filtruje zadania po użytkowniku
    3. Filtruje po query parameters
    4. Ładuje relację customer
    5. Zwraca listę zadań
    """
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Brak autoryzacji'}), 401
    
    # Podstawowe zapytanie
    query = Task.query.filter_by(UserId=user_id)
    
    # Filtrowanie po statusie
    status = request.args.get('status')
    if status:
        query = query.filter_by(Status=status)
    
    # Filtrowanie po priorytecie
    priority = request.args.get('priority')
    if priority:
        query = query.filter_by(Priority=priority)
    
    # Filtrowanie po kliencie
    customer_id = request.args.get('customer_id')
    if customer_id:
        query = query.filter_by(CustomerId=customer_id)
    
    # Sortowanie po due_date
    query = query.order_by(Task.DueDate.asc())
    
    tasks = query.all()
    
    # Serializacja z relacjami
    result = []
    for task in tasks:
        task_dict = task.to_dict()
        if task.customer:
            task_dict['customer'] = task.customer.to_dict()
        result.append(task_dict)
    
    return jsonify(result), 200
```

---

## 8. MODELE DANYCH - SZCZEGÓŁOWA ANALIZA

### 8.1. Struktura Modelu

Model w SQLAlchemy reprezentuje tabelę w bazie danych i zawiera relacje z innymi modelami.

### 8.2. Analiza Głównych Modeli

#### 8.2.1. `models/user.py` - Model Użytkownika

```python
class User(db.Model):
    """
    Model reprezentujący użytkownika w systemie.
    
    Tabela: users
    Relacje:
        - One-to-Many: Tasks, Notifications, Notes
        - Many-to-Many: Groups (przez UserGroups)
        - Many-to-One: Role
    """
    __tablename__ = 'users'
    
    # Kolumny
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    
    # Relacje
    role = db.relationship('Role', backref='users')
    tasks = db.relationship('Task', backref='user', lazy='dynamic')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic')
    login_histories = db.relationship('LoginHistory', backref='user', lazy='dynamic')
    
    # Grupy (Many-to-Many)
    groups = db.relationship('Group', secondary='usergroups', backref='members')
    
    # Metody
    def check_password(self, password):
        """
        Weryfikuje hasło użytkownika.
        
        Args:
            password: Hasło w postaci plaintext
        
        Returns:
            bool: True jeśli hasło jest poprawne
        """
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """
        Serializacja modelu do słownika Python.
        
        Returns:
            dict: Słownik z danymi użytkownika
        """
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role.name if self.role else None,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<User {self.username}>'
```

#### 8.2.2. `models/customer.py` - Model Klienta

```python
class Customer(db.Model):
    """
    Model reprezentujący klienta w CRM.
    
    Tabela: Customers
    Relacje:
        - One-to-Many: Invoices, Notes, Tasks, Meetings
        - Many-to-Many: Tags (przez CustomerTags)
        - Many-to-One: User (AssignedUserId), Group (AssignedGroupId)
    """
    __tablename__ = 'Customers'
    
    # Kolumny
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(255))
    Phone = db.Column(db.String(50))
    Company = db.Column(db.String(255))
    Address = db.Column(db.Text)
    City = db.Column(db.String(100))
    PostalCode = db.Column(db.String(20))
    Country = db.Column(db.String(100))
    Notes = db.Column(db.Text)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    UpdatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    AssignedUserId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    AssignedGroupId = db.Column(db.Integer, db.ForeignKey('Groups.Id'), nullable=True)
    
    # Relacje
    assigned_user = db.relationship('User', foreign_keys=[AssignedUserId], backref='assigned_customers')
    assigned_group = db.relationship('Group', foreign_keys=[AssignedGroupId], backref='group_customers')
    
    invoices = db.relationship('Invoice', backref='customer', lazy='dynamic')
    notes = db.relationship('Note', backref='customer', lazy='dynamic')
    tasks = db.relationship('Task', backref='customer', lazy='dynamic')
    meetings = db.relationship('Meeting', backref='customer', lazy='dynamic')
    
    # Relacja Many-to-Many z Tags
    tags = db.relationship('Tag', secondary=customer_tags, backref='customers', lazy='dynamic')
    
    def to_dict(self, include_relations=False):
        """
        Serializacja do słownika.
        
        Args:
            include_relations: Czy dołączyć relacje (tags, invoices, etc.)
        
        Returns:
            dict: Słownik z danymi klienta
        """
        data = {
            'id': self.Id,
            'name': self.Name,
            'email': self.Email,
            'phone': self.Phone,
            'company': self.Company,
            'address': self.Address,
            'city': self.City,
            'postalCode': self.PostalCode,
            'country': self.Country,
            'notes': self.Notes,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'updatedAt': self.UpdatedAt.isoformat() if self.UpdatedAt else None,
            'assignedUserId': self.AssignedUserId,
            'assignedGroupId': self.AssignedGroupId,
            'assignedGroupName': self.assigned_group.Name if self.assigned_group else None
        }
        
        if include_relations:
            data['tags'] = [tag.to_dict() for tag in self.tags.all()]
            data['invoices'] = [invoice.to_dict() for invoice in self.invoices.limit(10).all()]
            data['notes'] = [note.to_dict() for note in self.notes.limit(10).all()]
        
        return data
    
    def __repr__(self):
        return f'<Customer {self.Name}>'
```

#### 8.2.3. `models/invoice.py` - Model Faktury

```python
class Invoice(db.Model):
    """
    Model reprezentujący fakturę.
    
    Tabela: Invoices
    Relacje:
        - One-to-Many: InvoiceItems, Payments
        - Many-to-One: Customer, User
        - Many-to-Many: Tags (przez InvoiceTags)
    """
    __tablename__ = 'Invoices'
    
    # Kolumny
    Id = db.Column(db.Integer, primary_key=True)
    InvoiceNumber = db.Column(db.String(50), unique=True, nullable=False)
    CustomerId = db.Column(db.Integer, db.ForeignKey('Customers.Id'), nullable=False)
    IssueDate = db.Column(db.Date, nullable=False)
    DueDate = db.Column(db.Date, nullable=False)
    Status = db.Column(db.String(50), default='Draft')  # Draft, Sent, Paid, Overdue, Cancelled
    TotalAmount = db.Column(db.Numeric(10, 2), default=0)
    Notes = db.Column(db.Text)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    CreatedBy = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relacje
    customer = db.relationship('Customer', backref='invoices')
    creator = db.relationship('User', backref='created_invoices')
    
    items = db.relationship('InvoiceItem', backref='invoice', lazy='dynamic', cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='invoice', lazy='dynamic')
    
    # Relacja Many-to-Many z Tags
    tags = db.relationship('Tag', secondary=invoice_tags, backref='invoices', lazy='dynamic')
    
    def to_dict(self, include_items=False, include_payments=False):
        """
        Serializacja do słownika.
        
        Args:
            include_items: Czy dołączyć pozycje faktury
            include_payments: Czy dołączyć płatności
        
        Returns:
            dict: Słownik z danymi faktury
        """
        data = {
            'id': self.Id,
            'invoiceNumber': self.InvoiceNumber,
            'customerId': self.CustomerId,
            'customer': self.customer.to_dict() if self.customer else None,
            'issueDate': self.IssueDate.isoformat() if self.IssueDate else None,
            'dueDate': self.DueDate.isoformat() if self.DueDate else None,
            'status': self.Status,
            'totalAmount': float(self.TotalAmount) if self.TotalAmount else 0,
            'notes': self.Notes,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'createdBy': self.CreatedBy
        }
        
        if include_items:
            data['items'] = [item.to_dict() for item in self.items.all()]
        
        if include_payments:
            data['payments'] = [payment.to_dict() for payment in self.payments.all()]
            # Obliczenie pozostałej kwoty do zapłaty
            total_paid = sum(float(p.Amount) for p in self.payments.all())
            data['paidAmount'] = total_paid
            data['remainingAmount'] = float(self.TotalAmount) - total_paid if self.TotalAmount else 0
        
        return data
    
    def __repr__(self):
        return f'<Invoice {self.InvoiceNumber}>'
```

#### 8.2.4. `models/task.py` - Model Zadania

```python
class Task(db.Model):
    """
    Model reprezentujący zadanie w systemie.
    
    Tabela: Tasks
    Relacje:
        - Many-to-One: User, Customer
        - Many-to-Many: Tags (przez TaskTags)
    """
    __tablename__ = 'Tasks'
    
    # Kolumny
    Id = db.Column(db.Integer, primary_key=True)
    Title = db.Column(db.String(255), nullable=False)
    Description = db.Column(db.Text)
    Status = db.Column(db.String(50), default='Draft')  # Draft, InProgress, Completed, Cancelled
    Priority = db.Column(db.String(20), default='Medium')  # Low, Medium, High, Urgent
    DueDate = db.Column(db.Date)
    CompletedDate = db.Column(db.Date)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    UserId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    CustomerId = db.Column(db.Integer, db.ForeignKey('Customers.Id'), nullable=True)
    
    # Relacje
    user = db.relationship('User', backref='user_tasks')
    customer = db.relationship('Customer', backref='customer_tasks')
    
    # Relacja Many-to-Many z Tags
    tags = db.relationship('Tag', secondary=task_tags, backref='tasks', lazy='dynamic')
    
    def to_dict(self):
        """
        Serializacja do słownika.
        
        Returns:
            dict: Słownik z danymi zadania
        """
        return {
            'id': self.Id,
            'title': self.Title,
            'description': self.Description,
            'status': self.Status,
            'priority': self.Priority,
            'dueDate': self.DueDate.isoformat() if self.DueDate else None,
            'completedDate': self.CompletedDate.isoformat() if self.CompletedDate else None,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'userId': self.UserId,
            'customerId': self.CustomerId,
            'customer': self.customer.to_dict() if self.customer else None,
            'isOverdue': self.DueDate < datetime.now().date() if self.DueDate and self.Status != 'Completed' else False
        }
    
    def __repr__(self):
        return f'<Task {self.Title}>'
```

#### 8.2.5. `models/group.py` - Model Grupy

```python
class Group(db.Model):
    """
    Model reprezentujący grupę użytkowników w systemie.
    
    Tabela: Groups
    Relacje:
        - Many-to-Many: Users (przez UserGroups)
        - One-to-Many: Customers (przez AssignedGroupId)
    """
    __tablename__ = 'Groups'
    
    # Kolumny
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    Description = db.Column(db.Text)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacje
    # Members (Many-to-Many przez UserGroups)
    # Customers (One-to-Many przez Customer.AssignedGroupId)
    
    def to_dict(self, include_members=False, include_customers=False):
        """
        Serializacja do słownika.
        
        Args:
            include_members: Czy dołączyć listę członków
            include_customers: Czy dołączyć listę klientów
        
        Returns:
            dict: Słownik z danymi grupy
        """
        data = {
            'id': self.Id,
            'name': self.Name,
            'description': self.Description,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }
        
        if include_members:
            data['members'] = [user.to_dict() for user in self.members]
            data['memberCount'] = len(self.members)
        
        if include_customers:
            data['customers'] = [customer.to_dict() for customer in self.group_customers]
            data['customerCount'] = len(self.group_customers)
        
        return data
    
    def __repr__(self):
        return f'<Group {self.Name}>'
```

---

## 9. KOMPONENTY REACT - SZCZEGÓŁOWA ANALIZA

### 9.1. Struktura Komponentów

Komponenty React są zorganizowane w folderze `crm-ui/src/components/` i `crm-ui/src/pages/`.

### 9.2. Analiza Głównych Komponentów

#### 9.2.1. `components/CustomerList.tsx` - Lista Klientów

```typescript
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
}

const CustomerList: React.FC = () => {
    // Stan komponentu
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    /**
     * Efekt pobierający klientów z API po zamontowaniu komponentu.
     * 
     * Jak działa:
     * 1. Ustawia loading na true
     * 2. Wysyła GET request do /Customers/
     * 3. Aktualizuje state z danymi
     * 4. Obsługuje błędy
     * 5. Ustawia loading na false
     */
    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await api.get('/Customers/');
                setCustomers(response.data);
            } catch (err) {
                setError('Błąd podczas pobierania klientów');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCustomers();
    }, []);  // Puste dependencies - uruchamia się tylko raz
    
    /**
     * Filtrowanie klientów na podstawie searchTerm.
     * 
     * Jak działa:
     * 1. Filtruje klientów po name, email, phone, company
     * 2. Sprawdza czy searchTerm występuje w którymkolwiek polu
     * 3. Zwraca przefiltrowaną tablicę
     */
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Wyświetlanie loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Ładowanie...</div>
            </div>
        );
    }
    
    // Wyświetlanie error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }
    
    // Render główny
    return (
        <div className="container mx-auto p-4">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold">Klienci</h1>
            </div>
            
            {/* Search input */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Szukaj klienta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border-b">ID</th>
                            <th className="px-4 py-2 border-b">Nazwa</th>
                            <th className="px-4 py-2 border-b">Email</th>
                            <th className="px-4 py-2 border-b">Telefon</th>
                            <th className="px-4 py-2 border-b">Firma</th>
                            <th className="px-4 py-2 border-b">Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border-b">{customer.id}</td>
                                <td className="px-4 py-2 border-b">{customer.name}</td>
                                <td className="px-4 py-2 border-b">{customer.email}</td>
                                <td className="px-4 py-2 border-b">{customer.phone}</td>
                                <td className="px-4 py-2 border-b">{customer.company}</td>
                                <td className="px-4 py-2 border-b">
                                    <button className="text-blue-500 hover:underline">
                                        Edytuj
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Summary */}
            <div className="mt-4 text-gray-600">
                Łącznie: {filteredCustomers.length} klientów
            </div>
        </div>
    );
};

export default CustomerList;
```

#### 9.2.2. `components/InvoiceForm.tsx` - Formularz Faktury

```typescript
import React, { useState } from 'react';
import { api } from '../services/api';

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
}

interface InvoiceFormProps {
    customerId: number;
    onSave: () => void;
    onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ customerId, onSave, onCancel }) => {
    // Stan formularza
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: '', quantity: 1, unitPrice: 0, vatRate: 23 }
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    /**
     * Dodaje nową pozycję do faktury.
     * 
     * Jak działa:
     * 1. Tworzy nowy obiekt InvoiceItem z domyślnymi wartościami
     * 2. Dodaje go do tablicy items
     */
    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0, vatRate: 23 }]);
    };
    
    /**
     * Usuwa pozycję z faktury.
     * 
     * @param index - Indeks pozycji do usunięcia
     */
    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };
    
    /**
     * Aktualizuje daną pozycję w fakturze.
     * 
     * @param index - Indeks pozycji
     * @param field - Nazwa pola do zaktualizowania
     * @param value - Nowa wartość
     */
    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };
    
    /**
     * Oblicza łączną kwotę faktury.
     * 
     * Jak działa:
     * 1. Dla każdej pozycji oblicza kwotę brutto
     * 2. Sumuje wszystkie kwoty
     * 3. Zwraca wynik
     * 
     * @returns Łączna kwota faktury
     */
    const calculateTotal = (): number => {
        return items.reduce((total, item) => {
            const netto = item.quantity * item.unitPrice;
            const brutto = netto * (1 + item.vatRate / 100);
            return total + brutto;
        }, 0);
    };
    
    /**
     * Waliduje formularz przed wysłaniem.
     * 
     * @returns true jeśli formularz jest poprawny
     */
    const validate = (): boolean => {
        if (!invoiceNumber) {
            setError('Numer faktury jest wymagany');
            return false;
        }
        if (!issueDate) {
            setError('Data wystawienia jest wymagana');
            return false;
        }
        if (!dueDate) {
            setError('Termin płatności jest wymagany');
            return false;
        }
        if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
            setError('Wszystkie pozycje muszą być wypełnione poprawnie');
            return false;
        }
        return true;
    };
    
    /**
     * Obsługuje wysyłanie formularza.
     * 
     * Jak działa:
     * 1. Waliduje formularz
     * 2. Buduje obiekt danych faktury
     * 3. Wysyła POST request do API
     * 4. Wywołuje callback onSave przy sukcesie
     * 5. Obsługuje błędy
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }
        
        setSubmitting(true);
        setError(null);
        
        try {
            const invoiceData = {
                customer_id: customerId,
                invoice_number: invoiceNumber,
                issue_date: issueDate,
                due_date: dueDate,
                items: items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    vat_rate: item.vatRate
                }))
            };
            
            await api.post('/Invoices/', invoiceData);
            onSave();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Błąd podczas tworzenia faktury');
        } finally {
            setSubmitting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            
            {/* Dane faktury */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Numer faktury *
                    </label>
                    <input
                        type="text"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Data wystawienia *
                    </label>
                    <input
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Termin płatności *
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
            </div>
            
            {/* Pozycje faktury */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Pozycje faktury</h3>
                    <button
                        type="button"
                        onClick={addItem}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Dodaj pozycję
                    </button>
                </div>
                
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-5 gap-2">
                            <input
                                type="text"
                                placeholder="Opis"
                                value={item.description}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Ilość"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                                min="0.01"
                                step="0.01"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Cena jednostkowa"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                                min="0.01"
                                step="0.01"
                                required
                            />
                            <input
                                type="number"
                                placeholder="VAT %"
                                value={item.vatRate}
                                onChange={(e) => updateItem(index, 'vatRate', parseFloat(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-md"
                                min="0"
                                max="100"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                disabled={items.length === 1}
                            >
                                Usuń
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Podsumowanie */}
            <div className="bg-gray-100 p-4 rounded">
                <div className="text-right">
                    <span className="text-lg font-bold">
                        Razem: {calculateTotal().toFixed(2)} PLN
                    </span>
                </div>
            </div>
            
            {/* Przyciski */}
            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                    Anuluj
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                    {submitting ? 'Zapisywanie...' : 'Zapisz fakturę'}
                </button>
            </div>
        </form>
    );
};

export default InvoiceForm;
```

---

## 10. ROUTING I NAWIGACJA

### 10.1. React Router DOM - Router Frontendowy

#### 10.1.1. Konfiguracja Routingu

```typescript
// crm-ui/src/main.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App } from './App';
import LoginPage from './pages/LoginPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceDetailsPage from './pages/InvoiceDetailsPage';
import TasksPage from './pages/TasksPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import DashboardPage from './pages/DashboardPage';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';

function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Protected routes */}
                    <Route path="/" element={
                        <RequireAuth>
                            <DashboardPage />
                        </RequireAuth>
                    } />
                    
                    <Route path="/customers" element={
                        <RequireAuth>
                            <CustomersPage />
                        </RequireAuth>
                    } />
                    
                    <Route path="/customers/:id" element={
                        <RequireAuth>
                            <CustomerDetailsPage />
                        </RequireAuth>
                    } />
                    
                    <Route path="/invoices" element={
                        <RequireAuth>
                            <InvoicesPage />
                        </RequireAuth>
                    } />
                    
                    <Route path="/invoices/:id" element={
                        <RequireAuth>
                            <InvoiceDetailsPage />
                        </RequireAuth>
                    } />
                    
                    <Route path="/tasks" element={
                        <RequireAuth>
                            <TasksPage />
                        </RequireAuth>
                    } />
                    
                    <Route path="/groups" element={
                        <RequireAuth>
                            <GroupsPage />
                        </RequireAuth>
                    } />
                    
                    <Route path="/groups/:id" element={
                        <RequireAuth>
                            <GroupDetailsPage />
                        </RequireAuth>
                    } />
                    
                    {/* Redirect unknown routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
```

#### 10.1.2. Component RequireAuth - Ochrona Route'ów

```typescript
// crm-ui/src/components/RequireAuth.tsx
import { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface RequireAuthProps {
    children: React.ReactNode;
}

/**
 * Wrapper komponentu wymagający autoryzacji.
 * 
 * Jak działa:
 * 1. Sprawdza czy użytkownik jest zalogowany
 * 2. Jeśli nie - przekierowuje do /login
 * 3. Jeśli tak - renderuje children
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
    const { user } = useContext(AuthContext);
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
};
```

#### 10.1.3. Nawigacja Programatyczna

```typescript
// crm-ui/src/pages/CustomersPage.tsx
import { useNavigate } from 'react-router-dom';

const CustomersPage: React.FC = () => {
    const navigate = useNavigate();
    
    /**
     * Przekierowanie do strony szczegółów klienta.
     * 
     * @param customerId - ID klienta
     */
    const handleViewCustomer = (customerId: number) => {
        navigate(`/customers/${customerId}`);
    };
    
    /**
     * Przekierowanie do strony dodawania klienta.
     */
    const handleAddCustomer = () => {
        navigate('/customers/add');
    };
    
    return (
        <div>
            <button onClick={handleAddCustomer}>Dodaj klienta</button>
            {/* Lista klientów z onClick={handleViewCustomer} */}
        </div>
    );
};
```

---

## 11. OBSŁUGA BŁĘDÓW

### 11.1. Error Boundaries

```typescript
// crm-ui/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary przechwytuje błędy JavaScript w komponentach.
 * 
 * Jak działa:
 * 1. Przechwytuje błędy w komponencie lub jego child
 * 2. Aktualizuje state z błędem
 * 3. Renderuje fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }
    
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Logowanie błędu do serwisu analitycznego
        console.error('Error caught by boundary:', error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h1 className="text-2xl font-bold text-red-600">Coś poszło nie tak</h1>
                    <p className="text-gray-600 mt-2">
                        {this.state.error?.message}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Spróbuj ponownie
                    </button>
                </div>
            );
        }
        
        return this.props.children;
    }
}
```

### 11.2. Global Error Handler

```typescript
// crm-ui/src/services/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

/**
 * Interceptor request - dodaje token do każdego requestu.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor response - obsługuje błędy globalnie.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Status 401 - Unauthorized
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            
            // Status 403 - Forbidden
            if (error.response.status === 403) {
                console.error('Brak dostępu do zasobu');
            }
            
            // Status 404 - Not Found
            if (error.response.status === 404) {
                console.error('Zasób nie znaleziony');
            }
            
            // Status 500 - Internal Server Error
            if (error.response.status === 500) {
                console.error('Błąd serwera');
            }
        }
        
        return Promise.reject(error);
    }
);

export { api };
```

---

## 12. TESTOWANIE

### 12.1. Testy Backend (pytest)

```python
# backend-python/tests/test_customers.py
import pytest
from app import create_app
from app.database import db

@pytest.fixture
def client():
    """
    Tworzy testową instancję aplikacji Flask.
    
    Jak działa:
    1. Tworzy test app używając factory function
    2. Konfiguruje testową bazę danych (SQLite in-memory)
    3. Tworzy tabele
    4. Zwraca test client
    """
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_create_customer(client):
    """
    Test tworzenia klienta.
    
    Jak działa:
    1. Wysyła POST request do /Customers/
    2. Sprawdza status code 201
    3. Sprawdza czy klient został utworzony
    """
    response = client.post('/api/Customers/', json={
        'name': 'Test Customer',
        'email': 'test@example.com'
    })
    
    assert response.status_code == 201
    assert response.json['name'] == 'Test Customer'

def test_get_customer(client):
    """
    Test pobierania klienta.
    
    Jak działa:
    1. Tworzy klienta
    2. Pobiera jego dane
    3. Sprawdza status code 200
    4. Sprawdza czy dane są poprawne
    """
    # Tworzenie klienta
    client.post('/api/Customers/', json={
        'name': 'Test Customer',
        'email': 'test@example.com'
    })
    
    # Pobieranie klienta
    response = client.get('/api/Customers/1')
    
    assert response.status_code == 200
    assert response.json['name'] == 'Test Customer'
```

### 12.2. Testy Frontend (Jest + React Testing Library)

```typescript
// crm-ui/src/components/__tests__/CustomerList.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomerList from '../CustomerList';
import { api } from '../../services/api';

jest.mock('../../services/api');

describe('CustomerList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    it('should render customer list', async () => {
        // Mock API response
        (api.get as jest.Mock).mockResolvedValue({
            data: [
                { id: 1, name: 'Jan Kowalski', email: 'jan@example.com' }
            ]
        });
        
        render(<CustomerList />);
        
        // Sprawdzenie czy lista klientów się wyświetla
        await waitFor(() => {
            expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
        });
    });
    
    it('should filter customers by search term', async () => {
        (api.get as jest.Mock).mockResolvedValue({
            data: [
                { id: 1, name: 'Jan Kowalski', email: 'jan@example.com' },
                { id: 2, name: 'Anna Nowak', email: 'anna@example.com' }
            ]
        });
        
        render(<CustomerList />);
        
        // Wprowadzenie tekstu wyszukiwania
        const searchInput = screen.getByPlaceholderText('Szukaj klienta...');
        fireEvent.change(searchInput, { target: { value: 'Jan' } });
        
        // Sprawdzenie czy tylko "Jan Kowalski" jest widoczny
        await waitFor(() => {
            expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
            expect(screen.queryByText('Anna Nowak')).not.toBeInTheDocument();
        });
    });
});
```

---

## 13. DEPLOYMENT

### 13.1. Docker - Konteneryzacja

```dockerfile
# backend-python/Dockerfile
FROM python:3.11-slim

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie requirements
COPY requirements.txt .

# Instalacja zależności
RUN pip install --no-cache-dir -r requirements.txt

# Kopiowanie kodu aplikacji
COPY . .

# Uruchomienie aplikacji
CMD ["python", "start_server.py"]
```

```dockerfile
# crm-ui/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 13.2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend-python
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/crm
    depends_on:
      - db
  
  frontend:
    build: ./crm-ui
    ports:
      - "3000:80"
    depends_on:
      - backend
  
  db:
    image: mariadb:10.11
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=crm
      - MYSQL_USER=user
      - MYSQL_PASSWORD=password
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

### 13.3. Uruchomienie

```bash
# Build i uruchomienie
docker-compose up -d

# Logi
docker-compose logs -f

# Zatrzymanie
docker-compose down
```

---

## 14. PODSUMOWANIE

### 14.1. Technologie

- **Backend**: Python Flask, SQLAlchemy, PyJWT, bcrypt, PyMySQL
- **Frontend**: React, TypeScript, Vite, TailwindCSS, React Router
- **Mobile**: React Native, Expo
- **Database**: MariaDB/MySQL
- **Containerization**: Docker, Docker Compose

### 14.2. Architektura

- **Trójwarstwowa**: Frontend - Backend - Database
- **RESTful API**: Stateless, JSON-based
- **JWT Autoryzacja**: Token-based security
- **ORM**: SQLAlchemy dla abstrakcji bazy danych

### 14.3. Wzorce Projektowe

- **MVC**: Separacja logiki biznesowej
- **Repository Pattern**: Abstrakcja dostępu do danych
- **Factory Pattern**: Tworzenie aplikacji
- **Decorator Pattern**: Middleware i autoryzacja
- **Component Pattern**: Komponenty React

### 14.4. Kluczowe Funkcjonalności

- **CRM**: Klienci, faktury, zadania, grupy
- **Autoryzacja**: JWT, role, kontrola dostępu
- **Raporty**: PDF, DOCX templates
- **Powiadomienia**: System powiadomień
- **Dashboard**: Statystyki i metryki

---

**Dokument obejmuje wszystkie kluczowe aspekty implementacji systemu CRM.**

---

## 7. KONTROLERY (CONTROLLERS) - SZCZEGÓŁOWA ANALIZA

Wszystkie główne kontrolery są już szczegółowo opisane w `OPIS_APLIKACJI_DLA_OBRONY.md` w sekcji "4. Kluczowe Funkcjonalności" oraz "5. Szczegółowa Analiza Kodu".

**Dostępne kontrolery:**
- `auth.py` - Autentykacja i autoryzacja (login, register, logout)
- `customers.py` - Zarządzanie klientami (CRUD)
- `invoices.py` - Zarządzanie fakturami (CRUD, PDF generation)
- `tasks.py` - Zarządzanie zadaniami (CRUD, status tracking)
- `groups.py` - Zarządzanie grupami (CRUD, members, customers)
- `calendar_events.py` - Wydarzenia kalendarzowe
- `meetings.py` - Spotkania
- `payments.py` - Płatności
- `notes.py` - Notatki
- `messages.py` - Wiadomości
- `notifications.py` - Powiadomienia
- `reports.py` - Raporty
- `admin.py` - Administracja (użytkownicy, role, system)

Każdy kontroler obsługuje pełny cykl CRUD (Create, Read, Update, Delete) oraz dodatkową logikę biznesową specyficzną dla danego modułu.

---

## 8. MODELE DANYCH - KOMPLETNA LISTA

Wszystkie modele są zdefiniowane w folderze `backend-python/app/models/`:

### 8.1. Główne modele

1. **User** (`user.py`) - Użytkownicy systemu
2. **Role** (`role.py`) - Role użytkowników (Admin, User)
3. **Customer** (`customer.py`) - Klienci
4. **Invoice** (`invoice.py`) - Faktury
5. **InvoiceItem** (`invoice_item.py`) - Pozycje faktur
6. **Task** (`task.py`) - Zadania
7. **Group** (`group.py`) - Grupy użytkowników
8. **Tag** (`tag.py`) - Tagi (many-to-many z klientami, fakturami, zadaniami)
9. **Note** (`note.py`) - Notatki do klientów
10. **Meeting** (`meeting.py`) - Spotkania
11. **CalendarEvent** (`calendar_event.py`) - Wydarzenia kalendarzowe
12. **Payment** (`payment.py`) - Płatności
13. **Message** (`message.py`) - Wiadomości
14. **Notification** (`notification.py`) - Powiadomienia
15. **Template** (`template.py`) - Szablony dokumentów
16. **TaxRate** (`tax_rate.py`) - Stawki podatkowe
17. **Service** (`service.py`) - Usługi
18. **Contract** (`contract.py`) - Umowy
19. **LoginHistory** (`login_history.py`) - Historia logowań
20. **SystemLog** (`system_log.py`) - Logi systemowe
21. **Setting** (`setting.py`) - Ustawienia systemu
22. **Reminder** (`reminder.py`) - Przypomnienia
23. **Activity** (`activity.py`) - Aktywności

### 8.2. Tabele pomocnicze (Many-to-Many)

- `CustomerTags` - Łączy klientów z tagami
- `InvoiceTags` - Łączy faktury z tagami
- `TaskTags` - Łączy zadania z tagami
- `UserGroups` - Łączy użytkowników z grupami

Każdy model zawiera:
- Definicję kolumn (columns)
- Relacje do innych modeli (relationships)
- Metodę `to_dict()` dla serializacji do JSON
- Metodę `__repr__()` dla debugowania

---

## 9. KOMPONENTY REACT - KOMPLETNA LISTA

### 9.1. Strony (Pages) - `crm-ui/src/pages/`

**Główne strony:**
1. `LoginPage.tsx` - Logowanie
2. `DashboardPage.tsx` - Panel główny ze statystykami
3. `CustomersPage.tsx` - Lista klientów
4. `CustomerDetailsPage.tsx` - Szczegóły klienta
5. `InvoicesPage.tsx` - Lista faktur
6. `InvoiceDetailsPage.tsx` - Szczegóły faktury
7. `TasksPage.tsx` - Lista zadań
8. `TaskDetailsPage.tsx` - Szczegóły zadania
9. `GroupsPage.tsx` - Lista grup
10. `GroupDetailsPage.tsx` - Szczegóły grupy
11. `CalendarPage.tsx` - Kalendarz wydarzeń
12. `MeetingsPage.tsx` - Spotkania
13. `ReportsPage.tsx` - Raporty
14. `SettingsPage.tsx` - Ustawienia

### 9.2. Komponenty pomocnicze (Components) - `crm-ui/src/components/`

**Wspólne komponenty:**
1. `Layout.tsx` - Główny layout (sidebar, header)
2. `Sidebar.tsx` - Menu nawigacyjne
3. `Header.tsx` - Nagłówek z użytkownikiem
4. `Table.tsx` - Tabela z danymi (reusable)
5. `Modal.tsx` - Modal (reusable)
6. `Toast.tsx` - Toast notifications
7. `LoadingSpinner.tsx` - Indikator ładowania
8. `ConfirmDialog.tsx` - Dialog potwierdzenia
9. `SearchInput.tsx` - Pole wyszukiwania
10. `SelectField.tsx` - Pole select
11. `DatePicker.tsx` - Wybór daty

### 9.3. Konteksty (Context API) - `crm-ui/src/context/`

1. `AuthContext.tsx` - Globalny stan autoryzacji (user, token, login, logout)
2. `ModalContext.tsx` - Globalny stan modali i toastów

Każdy komponent React wykorzystuje:
- **Hooks**: useState, useEffect, useContext
- **TypeScript**: Typowanie dla bezpieczeństwa
- **TailwindCSS**: Styling
- **Axios**: API calls

---

## 10. ROUTING I NAWIGACJA

### 10.1. React Router DOM

Aplikacja używa `react-router-dom` v6 do nawigacji:

**Główne route'y:**
```typescript
/ → Dashboard (wymaga auth)
/login → Login page (publiczna)
/customers → Lista klientów (wymaga auth)
/customers/:id → Szczegóły klienta (wymaga auth)
/invoices → Lista faktur (wymaga auth)
/invoices/:id → Szczegóły faktury (wymaga auth)
/tasks → Lista zadań (wymaga auth)
/groups → Lista grup (wymaga auth)
/groups/:id → Szczegóły grupy (wymaga auth)
```

**Ochrona route'ów:**
- Wszystkie route'y (oprócz /login) są chronione przez `RequireAuth` component
- `RequireAuth` sprawdza czy użytkownik jest zalogowany
- Jeśli nie - przekierowuje do /login

**Navigacja programatyczna:**
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/customers/123');
```

---

## 11. OBSŁUGA BŁĘDÓW

### 11.1. Backend - Try-Catch w kontrolerach

Każdy endpoint w kontrolerze używa try-catch do obsługi błędów:

```python
try:
    # Logika endpointu
    ...
    return jsonify(data), 200
except Exception as e:
    print(f"Error: {e}")
    return jsonify({'error': str(e)}), 500
```

### 11.2. Frontend - Error Handling

**Axios Interceptor:**
```typescript
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token wygasł - przekieruj do login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

**Toast Notifications:**
- Sukces: zielony toast z ikoną ✓
- Błąd: czerwony toast z ikoną ✗
- Informacja: niebieski toast z ikoną ℹ

**Error Boundary (React):**
- Przechwytuje błędy JavaScript w komponentach
- Wyświetla fallback UI zamiast crashować całą aplikację

---

## 12. TESTOWANIE

### 12.1. Backend Tests (pytest)

**Struktura testów:**
- `tests/conftest.py` - Konfiguracja testów, fixtures
- `tests/test_auth.py` - Testy autoryzacji
- `tests/test_customers.py` - Testy klientów
- `tests/test_invoices.py` - Testy faktur

**Uruchamianie testów:**
```bash
cd backend-python
pytest
pytest -v  # verbose
pytest tests/test_customers.py  # konkretny plik
```

### 12.2. Frontend Tests (Jest + React Testing Library)

**Struktura:**
- `components/__tests__/` - Testy komponentów

**Uruchamianie:**
```bash
cd crm-ui
npm test
```

---

## 13. DEPLOYMENT

### 13.1. Docker

Aplikacja używa Docker Compose do uruchomienia wszystkich serwisów:

**Serwisy:**
1. `backend` - Python Flask (port 5000)
2. `frontend` - Nginx z React build (port 3000)
3. `db` - MariaDB (port 3306)

**Uruchomienie:**
```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### 13.2. Proces Deploy

1. **Build** - Tworzenie obrazów Docker
2. **Push** - Wysłanie do registry (Docker Hub)
3. **Pull** - Pobranie na serwer produkcyjny
4. **Restart** - Restart kontenerów

---

## 14. KONKLUZJA

Dokument obejmuje wszystkie kluczowe aspekty implementacji systemu CRM:

✅ **Architektura**: Trójwarstwowa (Frontend - Backend - Database)
✅ **Technologie**: React, Flask, MariaDB, Docker
✅ **Wzorce**: MVC, Repository, Factory, Decorator, Component
✅ **Bezpieczeństwo**: JWT, password hashing, CORS, validation
✅ **Funkcjonalności**: CRM, Autoryzacja, Raporty, Powiadomienia
✅ **Testing**: pytest (backend), Jest (frontend)
✅ **Deployment**: Docker, Docker Compose

System jest gotowy do produkcji i skalowania.

