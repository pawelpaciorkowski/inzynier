# 📚 SZCZEGÓŁOWY OPIS METOD I FUNKCJI - CRM SYSTEM

**Ten dokument stanowi szczegółowy, rozbudowany opis wszystkich kluczowych metod, funkcji oraz sposobów ich użycia w projekcie CRM. Każda metoda została opisana zarówno pod kątem działania, praktycznych zastosowań oraz *dokładnych miejsc użycia w kodzie projektu* – z wieloma przykładami i dodatkowymi wyjaśnieniami.**  
Dzięki temu nawet osoby nietechniczne lub mniej doświadczone z łatwością zrozumieją, jak poszczególne metody wpływają na działanie całego systemu.

---

## 📋 SPIS TREŚCI

1. [Metody SQLAlchemy (ORM) – Praca z bazą danych](#1-metody-sqlalchemy-orm)
2. [Metody Flask – Obsługa żądań i odpowiedzi HTTP](#2-metody-flask)
3. [Metody Python - Wbudowane – Praca z danymi w Pythonie](#3-metody-python-wbudowane)
4. [Metody Reaktywne (React) – Frontend](#4-metody-reaktywne-react)
5. [Metody Bibliotek Zewnętrznych – Narzędzia dodatkowe](#5-metody-bibliotek-zewnętrznych)
6. [Własne Metody Projektu – Rozszerzenia specyficzne dla CRM](#6-własne-metody-projektu)
7. [Podsumowanie](#7-podsumowanie)

---

## 1. METODY SQLALCHEMY (ORM)

SQLAlchemy to zaawansowany Object Relational Mapper (ORM) – narzędzie łączące świat baz danych SQL z obiektami Pythona. Pozwala na czytanie, zapisywanie czy aktualizowanie danych z bazy w bardzo zwięzły i elastyczny sposób, unikając bezpośredniego pisania instrukcji SQL.

### 1.1. Query Methods – Sposoby pobierania i filtrowania danych z bazy

#### `Model.query.all()`
**Opis szczegółowy:**
- Pobiera **wszystkie rekordy (wiersze)** z tabeli bazy danych powiązanej z danym modelem Pythona (`Model` oznacza klasę reprezentującą konkretną tabelę, np. `Customer`).
- Zwraca **listę obiektów** Python (każdy obiekt odpowiada jednemu wierszowi w bazie).
- Jest to ekwiwalent instrukcji `SELECT * FROM TableName` w SQL.

**Wady i zalety:**
- Prosta w użyciu, ale w przypadku bardzo dużych tabel jej wywołanie może znacząco obciążyć pamięć (bo pobiera *wszystkie* dane).
- Zalecana do niewielkich lub średnich zbiorów danych, albo gdy użytkownik rzeczywiście chce pobrać całą tabelę.

**Przykład użycia:**
```python
customers = Customer.query.all()
# customers to lista zawierająca obiekty typu Customer reprezentujące wszystkich klientów z bazy.
# Zwraca: [Customer, Customer, Customer, ...]
# W SQL: SELECT * FROM Customers
```

**Struktura wywołania:**
- `Model.query` – rozpoczyna budowanie zapytania na tabeli.
- `.all()` – wykonuje zapytanie oraz konwertuje wyniki do typowej listy Pythona.

**W praktyce w projekcie (Plik: backend-python/app/controllers/customers.py):**
```python
def get_customers():
    customers = Customer.query.all()  # Pobiera wszystkich klientów
    # Następnie każdy klient zamieniany jest na słownik (dict) i wysyłany jako json
    return jsonify([c.to_dict() for c in customers])
```

---

#### `Model.query.get(id)`
**Opis szczegółowy:**
- Pobiera **jeden, konkretny rekord** z bazy na podstawie jego klucza głównego (najczęściej unikalne ID).
- Zwraca instancję obiektu modelu, jeśli rekord został znaleziony, lub `None`, jeśli nie istnieje taki rekord w tabeli.
- W SQL odpowiada zapytaniu `SELECT * FROM TableName WHERE id = ? LIMIT 1`

**Dodatkowe wyjaśnienie:**
- Wartość `id` powinna być kluczem głównym (primary key) danego modelu.
- Bardzo wydajne – wykorzystuje optymalizacje bazy.

**Przykład:**
```python
customer = Customer.query.get(123)
# customer będzie obiektem Customer o id=123 lub None, jeśli nie znajdzie rekordu.
```

**Zastosowanie w projekcie (backend-python/app/controllers/customers.py):**
```python
def get_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'error': 'Not found'}), 404
    # Tu można bezpiecznie używać customer, np. customer.name, ...
```

---

#### `Model.query.filter_by(**kwargs).first()`
**Opis szczegółowy:**
- Pobiera PIERWSZY rekord z tabeli, który spełnia podane prostym porównaniem warunki (argumenty nazwane w `filter_by`).
- Zwraca tylko jeden obiekt (lub `None`), nawet gdy warunków spełnia więcej rekordów.
- `filter_by` pozwala na łatwe i czytelne filtrowanie po wartościach klucz=wartość (np. po nazwie użytkownika).

**Przykład:**
```python
user = User.query.filter_by(username='admin').first()
# Pozwala sprawdzić, czy istnieje użytkownik o danej nazwie.
# SQL: SELECT * FROM users WHERE username = 'admin' LIMIT 1
```

**W projekcie CRM (backend-python/app/controllers/auth.py):**
```python
def login():
    user = User.query.filter_by(username=username).first()
    # Jeżeli user to None – nie istnieje użytkownik o podanym username.
```

---

#### `Model.query.filter(condition).all()`
**Opis szczegółowy:**
- Filtrowanie rekordów po ZŁOŻONYCH warunkach (m.in. operatory `<`, `>`, `like`, `in` itp.).
- Zwraca całą listę obiektów spełniających złożone kryteria.
- Umożliwia bardziej zaawansowane wyszukiwanie niż `filter_by`, np. szukanie po "części" nazwy, sprawdzanie wielu warunków logicznych itp.

**Przykład:**
```python
customers = Customer.query.filter(Customer.Name.like('%Kowalski%')).all()
# Zwraca listę klientów, których nazwisko zawiera "Kowalski"
```

**W projekcie (backend-python/app/controllers/customers.py / search endpoint):**
```python
def search_customers():
    query = request.args.get('q', '')
    customers = Customer.query.filter(Customer.Name.like(f'%{query}%')).all()
    return jsonify([c.to_dict() for c in customers])
```

---

#### `Model.query.filter(condition).order_by(column).all()`
**Opis szczegółowy:**
- Pozwala zwęzić wyniki zapytania (`filter`) ORAZ posortować je po wybranej kolumnie (`order_by`).
- Szczególnie przydatne do uzyskiwania posortowanej listy np. klientów według nazwiska lub faktur według daty.
- Domyślnie sortuje rosnąco; dla malejąco, używa się `column.desc()`.

**Przykład:**
```python
customers = Customer.query.order_by(Customer.Name).all()
# Lista klientów posortowana alfabetycznie po nazwisku.
# SQL: SELECT * FROM Customers ORDER BY Name
```

**W projekcie (backend-python/app/controllers/customers.py / get_sorted endpoint):**
```python
def get_customers_sorted():
    customers = Customer.query.order_by(Customer.Name).all()
    return jsonify([c.to_dict() for c in customers])
```

---

### 1.2. Session Methods – Operacje na sesji SQLAlchemy

W ORM SQLAlchemy zmiany w bazie danych (dodawanie, zmiana, usuwanie) przechodzą przez obiekt sesji (`db.session`). Daje to możliwość wykonania kilku zmian naraz, a także wycofania ich w razie błędu.

#### `db.session.add(object)`
**Opis szczegółowy:**
- Dodaje nowy obiekt modelu do sesji – czyli przygotowuje go do zapisania do bazy danych, ale nie wykonuje zapisu od razu!
- Obiekt jest jeszcze tylko "w pamięci"; zostanie faktycznie stworzony w bazie dopiero po `commit()`.

**Szczegółowy opis mechanizmu:**
1. Tworzony jest nowy obiekt modelu.
2. `db.session.add()` rejestruje ten obiekt w tzw. staging area (kolejka oczekujących na zapis).
3. Dopiero `db.session.commit()` przesyła wszystkie zmiany do bazy.

**Przykład:**
```python
new_customer = Customer(Name='Jan Kowalski', Email='jan@example.com')
db.session.add(new_customer)  # Rejestracja do późniejszego zapisu
db.session.commit()           # Teraz naprawdę zapisuje do bazy!
```

**Miejsce użycia w projekcie (backend-python/app/controllers/customers.py):**
```python
def create_customer():
    data = request.get_json()
    new_customer = Customer(Name=data['name'], Email=data['email'])
    db.session.add(new_customer)
    db.session.commit()
    return jsonify(new_customer.to_dict()), 201
```

---

#### `db.session.commit()`
**Opis szczegółowy:**
- Jest to KROK NIEZBĘDNY do wprowadzenia wcześniej przygotowanych operacji na bazie (dodania, modyfikacji, usunięcia) w życie.
- Zatwierdza wszystkie zmiany w sesji w ramach jednej transakcji, gwarantując spójność i bezpieczeństwo.

**Dodatkowe wyjaśnienia:**
- W razie błędu podczas commit – żadna z operacji nie zostanie zapisana.
- Zaleca się objęcie commit blokiem `try`/`except`, aby móc w razie potrzeby wykonać `rollback()`.

**Przykład:**
```python
db.session.add(new_customer)
db.session.add(new_invoice)
db.session.commit()  # Oba rekordy zostaną zapisane jednocześnie.
```

**W projekcie (backend-python/app/controllers/customers.py lub invoices.py):**
```python
try:
    db.session.add(item)
    db.session.commit()
except Exception:
    db.session.rollback()
    return jsonify({"error": "Błąd zapisu"}), 500
```

---

#### `db.session.delete(object)`
**Opis szczegółowy:**
- Oznacza dany obiekt do usunięcia (dodaje polecenie DELETE do staging area).
- Usunięcie następuje dopiero po `commit()`.
- Umożliwia wykonanie skomplikowanych operacji wielu kasowań w jednej transakcji.

**Przykład:**
```python
customer = Customer.query.get(123)
db.session.delete(customer)
db.session.commit()  # Fizycznie kasuje rekord z bazy.
```

**Miejsce użycia w projekcie (backend-python/app/controllers/customers.py):**
```python
def delete_customer(customer_id):
    customer = Customer.query.get(customer_id)
    db.session.delete(customer)
    db.session.commit()
    return jsonify({'deleted': True})
```

---

#### `db.session.rollback()`
**Opis szczegółowy:**
- Cofnięcie WSZYSTKICH oczekujących na zapis zmian w sesji od ostatniego commit.  
- Zapobiega zapisowi błędnych danych w bazie podczas błędów lub przerwanych transakcji.
- Zalecane przy obsłudze wyjątków.

**Rozbudowane wyjaśnienie:**
- Jeśli w trakcie zapisu kilku zmian pojawi się błąd (np. naruszenie unikalności), `rollback()` anuluje *wszystkie* zmiany jeszcze niezapisane w bieżącej sesji.
- Pozwala utrzymać bazę w spójnym stanie – żadne częściowe zmiany nie przechodzą do bazy.

**Przykład:**
```python
try:
    db.session.add(customer)
    db.session.commit()
except:
    db.session.rollback()  # Wycofanie wszystkich przygotowanych, ale niezapisanych zmian
```

**Miejsce użycia w projekcie (backend-python/app/controllers/customers.py):**
```python
def dangerous_operation():
    try:
        # ... zmiany na bazie
        db.session.commit()
    except:
        db.session.rollback()
        return jsonify({'error': 'Operacja cofnięta'}), 400
```

---

### 1.3. Relationship Methods – Praca z relacjami pomiędzy tabelami

#### `object.relationship_name`
**Opis szczegółowy:**
- Pozwala uzyskiwać powiązane dane bez pisania JOIN w SQL – po stronie Pythona, wystarczy sięgnąć po atrybut wskazany w relacji (np. `customer.invoices`).
- SQLAlchemy automatycznie generuje odpowiednie zapytania do bazy (np. pobiera wszystkie faktury wybranego klienta).
- Relacje definiuje się w modelach za pomocą `db.relationship` oraz `backref` (umożliwia dostęp w obie strony).

**Szczegółowy przykład:**
```python
class Customer(db.Model):
    # ...
    invoices = db.relationship('Invoice', backref='customer')

customer = Customer.query.get(123)
customer_invoices = customer.invoices  # Lista wszystkich faktur klienta o id = 123
# SQL wykonywane automatycznie: SELECT * FROM Invoices WHERE CustomerId = 123

invoice = Invoice.query.get(99)
invoice_customer = invoice.customer    # Obiekt Customer do którego należy faktura
```

**W projekcie (backend-python/app/models/customer.py):**  
Relacja z fakturami; wykorzystywane podczas pobierania pełnych danych klienta.

---

#### `db.session.refresh(object)`
**Opis szczegółowy:**
- **Odświeża** obiekt modelu Pythona danymi **najbardziej aktualnymi z bazy**.
- Przydatne, jeśli inny proces lub operacja zmodyfikowała dane bezpośrednio w bazie (poza aktualnym obiektem Python).
- Nadpisuje (cofa) ewentualne zmiany wprowadzane lokalnie przed zapisem.

**Przykład:**
```python
customer = Customer.query.get(123)
customer.Name = 'Nowe Imię'
db.session.refresh(customer)
# customer.Name zostaje ponownie ustawione na oryginalną wartość z bazy danych.
```

**Praktyczne miejsce użycia:**
- Synchronizacja stanu modelu po zewnętrznej zmianie w bazie, np. po obsłudze webhooków lub masowych aktualizacjach (backend-python/app/controllers/sync.py).

---

### 1.4. Model Methods – Własne narzędzia w modelach

#### `object.to_dict()`
**Opis szczegółowy:**
- Metoda własna każdej klasy modelu w projekcie, umożliwiająca łatwe zamienianie obiektu na zwykły słownik (`dict`) – czyli strukturę Python łatwą do przesyłania (np. do formatu JSON).
- To tzw. **serializacja** – przekształcanie obiektu w strukturę, którą można przesłać przez API lub zapisać.
- Pozwala wybrać, które pola modelu są widoczne na zewnątrz, a których nie należy udostępniać (np. hasła!).

**Przykład:**
```python
customer = Customer.query.get(123)
customer_dict = customer.to_dict()
# {'id': 123, 'name': 'Jan', 'email': 'jan@example.com'}
```

**Typowa definicja metody (backend-python/app/models/customer.py):**
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

**Wyjaśnienie praktyczne:**
- Dzięki `to_dict()` można przekazać dane dalej (np. do warstwy frontendowej React) bez ryzyka, że trafią tam wrażliwe lub zbędne dane z modelu.
- Miejsce użycia: wszystkie endpointy API zwracające dane klientów/rekordów.

---

## 2. METODY FLASK

Framework Flask odpowiada za przyjmowanie żądań z przeglądarki/frontendu, obsługę danych przesyłanych do serwera oraz generowanie odpowiedzi.

### 2.1. Request Methods – Odczyt danych z zapytań HTTP

#### `request.get_json()`
**Rozszerzony opis:**
- Pobiera cały "body" (ciało zapytania HTTP) i **próbuje przetworzyć go jako JSON**. Dane zwracane są jako **słownik Python** (dict).
- Najczęściej stosowane do odbierania danych przesyłanych przez klienta przy metodach POST/PUT/PATCH.
- Umożliwia wygodną pracę z danymi formularza przesłanego z aplikacji webowej.

**Łańcuch działania:**
1. Frontend przesyła JSON, np. `{"name": "Jan", "email": "jan@example.com"}`.
2. `request.get_json()` zmienia to na Pythona: `{'name': 'Jan', 'email': 'jan@example.com'}`.

**Przykład praktyczny:**
```python
data = request.get_json()
name = data.get('name')
email = data.get('email')
```

**Miejsce użycia w projekcie (backend-python/app/controllers/customers.py):**
```python
def create_customer():
    data = request.get_json()
    # ...
```

---

#### `request.args.get(key)`
**Rozszerzony opis:**
- Umożliwia pobieranie **parametrów z adresu URL** (tzw. query string, np. `?page=1&status=active`).
- Cały zestaw parametrów dostępny jest jako słownik (dict) `request.args`, a metoda `get` pozwala bezpiecznie pobrać konkretną wartość, podając opcjonalną wartość domyślną.

**Przykład praktyczny:**
```python
# Przy adresie: /api/Customers?status=active&page=2
status = request.args.get('status')  # 'active'
page = request.args.get('page', '1') # '2'; domyślnie 1 jeśli brak
```

**Typowe scenariusze:**
- Filtrowanie danych (np. po statusie, dacie),
- Paginacja (podział na strony).

**Miejsce użycia: backend-python/app/controllers/customers.py (paginacja/filtracja):**
```python
def get_customers():
    status = request.args.get('status')
    # ...
```

---

#### `request.headers.get(key)`
**Rozszerzony opis:**
- Pozwala pobierać wartości z **nagłówków HTTP**, które zwykle oprócz danych przesyłanych w body, zawierają kluczowe informacje o żądaniu (np. nagłówek autoryzacyjny Authorization, język preferowany przez użytkownika itd.).
- Kluczowe przy obsłudze uwierzytelniania, gdzie token JWT jest zwykle wysyłany właśnie w nagłówku.

**Przykład:**
```python
token = request.headers.get('Authorization')
```

**Sposób użycia:**
- Jeśli token nie zostanie przesłany – zwykle kończy się to błędem autoryzacji.

**Miejsce użycia: backend-python/app/middleware/auth.py i helpers/get_current_user.py**

---

### 2.2. Response Methods – Tworzenie odpowiedzi HTTP

#### `jsonify(data)`
**Rozszerzony opis:**
- Zamienia przekazane dane Pythona (dict, list, itd.) na standardową odpowiedź JSON, którą frontend może przetworzyć.
- Ustawia odpowiedni header Content-Type – dzięki temu klient (np. przeglądarka lub frontend) wie, że otrzymał JSON.
- Przyjmuje dowolne serializowalne dane; najczęściej słowniki lub tablice słowników.

**Praktyczne zastosowanie:**
- Szybka konwersja wyników zapytań do formatu akceptowanego przez frontend.
- Możliwość podania statusu HTTP razem z danymi.

**Przykład:**
```python
return jsonify({'message': 'Success'}), 200
# Odpowiedź: {"message": "Success"}, kod 200 OK
```

**W projekcie: zwracanie JSONa z każdego endpointu, np. backend-python/app/controllers/customers.py i invoices.py**

---

#### `send_file(path)`
**Rozszerzony opis:**
- Służy do zwracania plików (np. PDF, obrazy, generowane dokumenty) jako odpowiedzi HTTP – użytkownik może dzięki temu pobrać fakturę, raport czy załącznik.
- Ustawia odpowiedni typ odpowiedzi w nagłówkach.

**Przykład:**
```python
return send_file('/path/to/invoice.pdf', as_attachment=True)
# Plik zostanie przesłany do użytkownika jako załącznik do pobrania.
```

**Wyjaśnienie i miejsce użycia:**
- backend-python/app/controllers/reports.py (generowany PDF faktury, raportu):  
  ```python
  return send_file(pdf_path, as_attachment=True)
  ```

---

### 2.3. Route Methods – Rejestrowanie endpointów (adresów API)

#### `@blueprint.route('/path', methods=['GET'])`
**Opis szczegółowy:**
- Flask używa dekoratorów do rejestracji tzw. endpointów, czyli funkcji obsługujących konkretne adresy URL i metody HTTP (GET, POST, DELETE itd.).
- Dzięki tym dekoratorom kod obsługujący różne żądania HTTP jest bardzo przejrzysty.

**Przykład:**
```python
@customers_bp.route('/', methods=['GET'])
def get_customers():
    # obsługa żądania GET /api/Customers/
    ...

@customers_bp.route('/', methods=['POST'])
def create_customer():
    # obsługa żądania POST /api/Customers/
    ...

@customers_bp.route('/<int:id>', methods=['GET'])
def get_customer(id):
    # obsługa żądania GET /api/Customers/123
    ...
```

**Dodatkowe informacje:**
- `<int:id>` oznacza parametr dynamiczny (np. id rekordu),
- `methods=['GET', 'POST']` ustala jakie rodzaje żądań są możliwe na danym adresie.

**Miejsce użycia: backend-python/app/routes/customers.py oraz invoices.py**

---

## 3. METODY PYTHON – WBUDOWANE

Python oferuje wiele banalnie prostych, a bardzo potężnych metod do obsługi słowników (dict), list oraz ciągów znaków (string). Dzięki nim kod jest krótki i czytelny.

### 3.1. Dictionary Methods – Operacje na słownikach

#### `dict.get(key, default)`
**Opis rozszerzony:**
- Pozwala bezpiecznie pobierać wartości z dicta, nawet jeśli klucz nie istnieje (zamiast wyjątku zwraca `None` lub domyślną wartość).
- Przydatne do przetwarzania danych wejściowych od użytkownika lub z zewnętrznych API – nie ryzykujesz przerwania programu przez brakujące pole.

**Przykład różnicy:**
```python
data = {'name': 'Jan', 'email': 'jan@example.com'}
# "Bezpiecznie"
name = data.get('name')    # 'Jan'
phone = data.get('phone')  # None
phone = data.get('phone', 'brak tel')  # 'brak tel'

# "Niebezpiecznie"
name = data['name']   # ok
phone = data['phone'] # KeyError! Gdy nie ma tego klucza
```

**Miejsce stosowania: walidacja danych wejściowych we wszystkich endpointach obsługujących dane od użytkownika.**

---

#### `dict.items()`
**Opis rozszerzony:**
- Zwraca pary klucz–wartość jako *iterowalne krotki* (tuples), umożliwiając przejście przez wszystkie elementy słownika w pętli.
- Bardzo często używana do dynamicznego generowania danych, np. podczas budowy dynamicznych zapytań SQL lub generowania tabel/raportów.

**Przykład:**
```python
for key, value in data.items():
    print(f"{key}: {value}")
```

**W projekcie: generowanie dynamicznych raportów lub walidacja parametrów w backend-python/app/utils/report_builder.py**

---

### 3.2. List Methods – Operacje na listach

#### `list.append(item)`
**Opis rozszerzony:**
- Dodaje pojedynczy element na KONIEC listy.
- Najprostszy sposób na budowanie listy dynamicznie (np. podczas iterowania po rekordach z bazy).

**Przykład:**
```python
customers = []
customers.append(customer1)
customers.append(customer2)
# customers = [customer1, customer2]
```

**Stosowane, np. przy zbieraniu wyników batch-insert, raportów, listy ID w backend-python/app/controllers/bulk.py**

---

#### `list.extend(iterable)`
**Opis rozszerzony:**
- Dodaje *wszystkie* elementy z przekazanego iterable na koniec listy.
- W przeciwieństwie do `append`, nie dodaje pojedynczego elementu, tylko "rozszerza" listę.

**Przykład:**
```python
list1 = [1, 2]
list2 = [3, 4]
list1.extend(list2)
# list1 = [1, 2, 3, 4]
```

**Używane w przetwarzaniu zbiorczym, np. agregacja dużej ilości rekordów (app/controllers/bulk.py)**

---

#### `list.map(function)`
**Opis rozszerzony oraz typowa pythonowa wersja:**
- Python nie ma metody `.map` na liście, lecz *funkcję* map lub – i to jest powszechnie stosowane – **list comprehensions**.
- Pozwala wykonać operację na każdym elemencie i utworzyć z wyników nową listę.

**Przykład typowy w projekcie:**
```python
numbers = [1, 2, 3]
squared = [x**2 for x in numbers]   # [1, 4, 9]
# W projekcie:
customers = Customer.query.all()
return jsonify([c.to_dict() for c in customers])
```

**Miejsce użycia: niemal każdy endpoint zwracający wiele rekordów (zwraca jako listę słowników!)**

---

#### `list.filter(function)`
**Opis rozszerzony:**
- Filtrowanie listy – wybranie elementów, które spełniają określony warunek logiczny.
- Standardowo w Pythonie stosuje się **list comprehensions** z warunkiem.

**Przykład:**
```python
even = [x for x in numbers if x % 2 == 0]  # tylko liczby parzyste
```

**Używane np. w backend-python/app/utils/filtration.py - dynamiczna filtracja danych po listach**

---

### 3.3. String Methods – Operacje na łańcuchach znaków

#### `str.lower()`
- Zwraca kopię ciągu znaków zamienioną na małe litery.
- Przydatne np. przy porównywaniu tekstów niezależnie od wielkości znaków.

**Przykład:**
```python
text = "HELLO"
print(text.lower())  # hello
```

**Stosowane: walidacja emaili/reagowanie na niezależność wielkości liter w porównaniach nazw, backend-python/app/controllers/auth.py**

---

#### `str.upper()`
- Zwraca nowy tekst w wersji tylko wielkimi literami.

**Przykład:**
```python
text = "hello"
print(text.upper())  # HELLO
```

**Używane przy generowaniu kluczy, kodów zaproszeń, backend-python/app/utils/tokens.py**

---

#### `str.strip()`
- Usuwa wszelkie białe znaki (spacje, tabulatory, nowe linie) z początku i końca tekstu.
- Niezwykle użyteczne do czyszczenia użytkowych danych wejściowych.

**Przykład:**
```python
text = "  hello  "
print(text.strip()) # "hello"
```

**Stosowane: czyszczenie pól użytkownika podczas rejestracji/edycji (app/controllers/users.py)**

---

## 4. METODY REAKTYWNE (REACT)

React (biblioteka JavaScript/TypeScript do budowania interfejsów użytkownika) również korzysta z "metod" i tzw. hooków do zarządzania stanem, cyklem życia i reagowania na działania użytkownika.

### 4.1. React Hooks

#### `useState(initialValue)`
**Opis szczegółowy:**
- Pozwala utworzyć wewnętrzny (lokalny) stan (dane) powiązane z pojedynczym komponentem React (funkcyjnym).
- Zwraca dwuelementową tablicę: [wartość stanu, funkcja setter zmieniająca stan].  
Zmiana wartości stanu automatycznie powoduje ponowny render komponentu.

**Przykład:**
```typescript
const [count, setCount] = useState(0);
<button onClick={() => setCount(count + 1)}>
  Kliknięto {count} razy
</button>
```
- Tutaj po każdym kliknięciu przycisku count zwiększa się o 1.

**Miejsce użycia: frontend-react/src/pages/Customers.tsx, CustomerForm.tsx, itp.**  

---

#### `useEffect(callback, dependencies)`
**Opis szczegółowy:**
- Pozwala uruchomić kod w określonych momentach cyklu życia komponentu: po renderze, po zmianie stanu/propa lub tylko raz na początku.
- Typowe użycie: pobieranie danych z backendu, ustawianie nasłuchów zdarzeń, czyszczenie zasobów.
- Jeśli lista zależności (`dependencies`) jest pusta, kod odpala się tylko raz po zamontowaniu komponentu.

**Przykład:**
```typescript
useEffect(() => {
    fetchCustomers();
}, []);
```

**Występuje we wszystkich stronach pobierających dane w React, np. frontend-react/src/pages/Customers.tsx**

---

#### `useContext(Context)`
**Opis:**  
- Zapewnia dostęp do kontekstu globalnego – można w ten sposób "przekazać" dane (np. dane logowania, język interfejsu, ustawienia) każdemu komponentowi w aplikacji bez konieczności przekazywania ich jako propsy.

**Przykład:**
```typescript
const { user, token } = useContext(AuthContext);
```

**Miejsce użycia: frontend-react/src/context/AuthContext.tsx, używany w całej aplikacji do odczytu aktualnego zalogowanego użytkownika**

---

### 4.2. React Component Methods (dla klasowych komponentów)

#### `component.setState(newState)`
- Metoda do aktualizacji stanu w komponentach **klasowych** (React "klasyczny", przed hookami).
- Zmiana stanu wywołuje ponowny render.

**Przykład:**
```typescript
class MyComponent extends React.Component {
    constructor() {
        super();
        this.state = { count: 0 };
    }
    handleClick = () => {
        this.setState({ count: this.state.count + 1 });
    }
}
```

**Miejsce użycia: starsze/przykładowe komponenty lub migracja do `useState`.**

---

### 4.3. Event Handlers – Obsługa zdarzeń

#### `onClick={handler}`
- Przypisanie funkcji obsługującej zdarzenie kliknięcia na przycisku, linku, itp.

**Przykład:**
```typescript
<button onClick={() => alert('Kliknięto!')}>Kliknij</button>
```

**Występuje we wszystkich komponentach obsługujących klik (frontend-react/src/components, np. CustomerList.tsx)**

---

#### `onChange={handler}`
- Obsługa zmiany wartości inputa (pole tekstowe, select, itp.).

**Przykład:**
```typescript
<input value={name} onChange={e => setName(e.target.value)} />
```

**Miejsce użycia: formularze frontend-react/src/components/CustomerForm.tsx**

---

#### `onSubmit={handler}`
- Obsługa wysłania formularza (np. przycisk "Wyślij").

**Przykład:**
```typescript
<form onSubmit={handleSubmit}>...</form>
```

**Stosowane: obsługa wysyłki formularzy w CustomerForm, LoginForm (src/components).**

---

## 5. METODY BIBLIOTEK ZEWNĘTRZNYCH

W projekcie CRM korzystamy z wielu zewnętrznych bibliotek – poniżej najważniejsze metody wraz z miejscami ich użycia w kodzie.

### 5.1. JWT Methods

#### `jwt.encode(payload, secret, algorithm)`
**Rozszerzony opis:**
- Służy do generowania **JWT tokenów** – krótkich, zaszyfrowanych tekstowych "biletów", które klient (np. aplikacja webowa) przedstawia przy każdym żądaniu, aby potwierdzić swoją tożsamość.
- Token jest podpisany tajnym kluczem (secret) i zawiera zakodowane informacje o użytkowniku (payload – np. id, rolę).
- Kluczowe dla *stateless authentication* (serwer nie musi przechowywać sesji).

**Przykład:**
```python
payload = {'user_id': 123, 'role': 'Admin'}
token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
```

**Miejsce użycia: backend-python/app/controllers/auth.py podczas logowania**

---

#### `jwt.decode(token, secret, algorithms)`
**Opis rozszerzony:**
- Rozkodowuje token JWT podanego przez klienta – weryfikuje, czy jest poprawny, niepodrobiony, nie wygasł itd.
- Zwraca słownik z danymi użytkownika.

**Przykład:**
```python
payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
user_id = payload['user_id']
```

**Stosowanie: walidacja autoryzacji w backend-python/app/middleware/auth.py i helpers/get_current_user.py**

---

### 5.2. Werkzeug Security

#### `generate_password_hash(password)`
**Opis rozszerzony:**
- Zamienia widoczne hasło na specjalny, bezpieczny hash – uniemożliwia przechowywanie haseł wprost w bazie.
- Używa nowoczesnych algorytmów (bcrypt), trudnych do złamania.

**Przykład:**
```python
haslo_hash = generate_password_hash('myPassword123')
```

**Miejsce użycia: backend-python/app/controllers/auth.py podczas rejestracji użytkownika**

---

#### `check_password_hash(hash, password)`
- Sprawdza, czy podane hasło jest poprawne wobec przechowywanego w bazie hasha.
- Eliminacja potrzeby przechowywania prawdziwych haseł.

**Przykład:**
```python
is_valid = check_password_hash(haslo_hash, 'myPassword123')  # True lub False
```

**Stosowane w logowaniu użytkownika i walidacji hasła (backend-python/app/controllers/auth.py)**

---

### 5.3. Axios (HTTP Client do zapytań z frontendu JS/TS)

#### `axios.get(url)`
- Wysyła żądanie GET do wskazanego adresu (np. pobiera listę klientów).
- Zwraca obiekt response, w którym `response.data` to dane z backendu.

**Przykład:**
```typescript
const response = await axios.get('/api/Customers/');
const customers = response.data;
```

**Miejsce użycia: frontend-react/src/api/customers.ts, fetchCustomers w komponentach stron**

---

#### `axios.post(url, data)`
- Służy do wysyłania nowych danych na backend (np. tworzenia nowego klienta).
- Zwraca response podobnie jak get.

**Przykład:**
```typescript
await axios.post('/api/Customers/', { name: 'Jan', email: 'jan@example.com' });
```

**Stosowane: zapisywanie nowych klientów w komponentach formularzy (src/components/CustomerForm.tsx)**

---

#### `axios.delete(url)`
**Opis szeroki:**
- Pozwala na kasowanie zasobów po stronie backendu przez wysłanie żądania HTTP DELETE.
- Najczęściej przyjmuje url określający konkretny rekord (np. klienta o danym id).

**Przykład:**
```typescript
await axios.delete(`/api/Customers/${customerId}`);
```

**Dodatkowe możliwości:**
- Można opcjonalnie podać body (np. dodatkowe potwierdzenie).

**Zastosowanie:**
```typescript
const handleDelete = async (customerId: number) => {
    await axios.delete(`/api/Customers/${customerId}`);
    // Odśwież stan listy klientów itp.
};
```

**Miejsce użycia: obsługa kasowania w frontend-react/src/pages/Customers.tsx, CustomerList.tsx**

---

## 6. WŁASNE METODY PROJEKTU

### 6.1. Middleware Methods (dekoratory bezpieczeństwa)

#### `require_auth(f)`
- Jest to **dekorator** (specjalna funkcja "owijająca" inne funkcje endpointów), która wymaga przesłania poprawnego tokenu JWT w nagłówku żądania.
- Jeżeli tokenu brak lub jest nieprawidłowy – serwer odrzuca zapytanie kodem 401 (Unauthorized).
- Dzięki temu endpointy są dostępne tylko dla uwierzytelnionych użytkowników.

**Przykład definicji (backend-python/app/middleware/auth.py):**
```python
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Brak tokena'}), 401
        # ... dodatkowa weryfikacja np. przez jwt.decode
        return f(*args, **kwargs)
    return decorated
```

**Przykład użycia:**
```python
@customers_bp.route('/', methods=['GET'])
@require_auth
def get_customers():
    ...
```
**Wszystkie endpointy wymagające autoryzacji korzystają z require_auth (app/routes/**/\*.py).**

---

#### `get_current_user()`
- Pomocnicza funkcja, która z pobranego z nagłówka Authorization tokena JWT dekoduje i pobiera dane aktualnie zalogowanego użytkownika z bazy.
- Używana dla każdego endpointu, który wymaga wiedzy, kto jest aktualnie zalogowany (np. przy tworzeniu klienta: kto jest właścicielem rekordu).

**Przykład (backend-python/app/helpers/get_current_user.py):**
```python
def get_current_user():
    token = request.headers.get('Authorization')
    if not token:
        return None
    data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    user_id = data.get('sub')
    user = User.query.get(user_id)
    return user
```

**Używana w: obsłudze autoryzacji, ustalaniu właściciela rekordu w endpointach POST/PUT, np. create_customer.**

---

### 6.2. Model Methods

#### `to_dict()` – własna metoda serializująca w modelach

**Opis:**
- Każdy model w projekcie CRM implementuje metodę `to_dict()`.
- **Serializacja** to przekształcanie obiektu modelu na prosty słownik, który łatwo przekazać do frontendu lub zapisać do pliku JSON.
- Pozwala wybrać, które pola i relacje przekazywane są "na zewnątrz" (do API lub React), a które pozostają prywatne.

**Przykład serializacji:**
- Dla obiektu Customer zwraca:
  ```python
  {'id': 123, 'name': 'Jan', 'email': 'jan@example.com'}
  ```

**Wyjaśnienie w praktyce (backend-python/app/models/customer.py):**
```python
class Customer(db.Model):
    ...
    def to_dict(self):
        return {
            'id': self.Id,
            'name': self.Name,
            'email': self.Email
        }

# Pobranie i serializacja (backend-python/app/controllers/customers.py):
customer = Customer.query.get(123)
if customer:
    return jsonify(customer.to_dict())  # {"id": 123, "name": "Jan", "email": "jan@example.com"}
else:
    return jsonify({'error': 'Not found'}), 404
```

**Dodatkowe korzyści serializacji:**
- Chroni przed przypadkowym ujawnieniem poufnych danych (np. haseł),
- Upraszcza komunikację między serwerem i frontendem.
- Umożliwia eksportowanie danych do zewnętrznych systemów.

---

## 7. PODSUMOWANIE

Poniżej znajdziesz zwięzły przegląd najważniejszych metod w projekcie CRM wraz z informacją jakie obszary obejmują oraz *wskazaniem najważniejszych miejsc zastosowania w projekcie*:

### Metody SQLAlchemy (praca z bazą danych)
- `query.all()` – pobierz wszystkie rekordy z tabeli/modelu, (np. `get_customers` w app/controllers/customers.py)
- `query.get(id)` – pobierz jeden rekord po kluczu głównym, (np. `get_customer`)
- `query.filter_by()` – prosty filtr, (np. `login`)
- `query.filter().all()` – filtracja zaawansowana, (np. `search_customers`)
- `session.add()` – przygotuj obiekt do zapisu, (np. `create_customer`)
- `session.commit()` – zapisz zmiany (praktycznie zawsze po add/update/delete)
- `session.delete()` – usuń rekord (np. `delete_customer`)
- `session.rollback()` – wycofaj oczekujące zmiany (obsługa wyjątków)

### Metody Flask (obsługa żądań HTTP)
- `request.get_json()` – pobierz JSON z body żądania, (np. `create_customer`)
- `jsonify()` – zamień dane na odpowiedź JSON, (wszystkie endpointy API)
- `send_file()` – wyślij plik (np. generowanie raportu/faktury PDF)
- `@route()` – rejestracja endpointu (wszystkie trasy w app/routes/**/\*.py)

### Metody Python (wbudowane dane)
- `dict.get()` – bezpieczny dostęp do słownika (odbiór/zabezpieczanie danych wejściowych)
- `dict.items()` – iteracja po słowniku (dynamiczne generowanie danych, raporty)
- `list.append()`, `list.extend()` – rozwijanie list (batch-processing)
- list comprehensions – przetwarzanie/mapowanie/filtracja list (konwersja danych do JSON)
- `str.lower()/str.upper()/str.strip()` – operacje na tekstach (walidacja danych)

### Metody React (frontend)
- `useState()` – lokalny stan w komponencie (formularze, strony)
- `useEffect()` – efekty uboczne/praca z API (ładowanie danych)
- `useContext()` – globalny stan (logowanie, user info)
- obsługa zdarzeń: `onClick`, `onChange`, `onSubmit` (komponenty UI, formularze)

### Metody JWT i bezpieczeństwo
- `jwt.encode()` – tworzenie tokenów (logowanie)
- `jwt.decode()` – odczyt i weryfikacja tokenów (middleware, require_auth)
- `generate_password_hash()` / `check_password_hash()` – bezpieczne przechowywanie haseł (rejestracja/logowanie)

### Własne metody projektu CRM
- `require_auth()` – wymuszanie autoryzacji (dekoratory endpointów)
- `get_current_user()` – identyfikacja zalogowanego użytkownika (pobieranie danych użytkownika dla każdego requestu)
- `to_dict()` – serializacja danych do JSON (API/React)

---

**Niniejszy dokument kompleksowo i szczegółowo omawia każdą z metod używanych w projekcie CRM, dostarczając praktycznych przykładów, *dokładnych miejsc użycia w kodzie* i głębszych wyjaśnień – zarówno programistom, jak i osobom wdrażającym się w projekt. W przypadku pytań, kontaktuj się z zespołem backend/frontend.**
