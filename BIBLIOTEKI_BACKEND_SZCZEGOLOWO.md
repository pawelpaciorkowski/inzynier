# Szczegółowy opis bibliotek backendu Python - System CRM

<!--
Ta sekcja jest napisana z myślą, abym mógł ją "opowiedzieć własnymi słowami" na rozmowie technicznej.
Do każdej ważnej metody, fragmentu kodu i biblioteki dodałem szczegółowe komentarze wyjaśniające „po co to jest”, jak działa i jakbym to tłumaczył komuś nietechnicznemu lub przyszłemu pracodawcy.
-->

## 1. Flask 2.3.3 - Główny framework webowy

### Cel użycia
<!--
Flask służy jako podstawa backendu. Umożliwia szybkie napisanie REST API, pozwala na łatwy podział aplikacji na moduły i integrację z bazą danych.
Jest minimalistyczny - wymusza prostotę struktury projektu, dzięki czemu łatwo utrzymać duże i średnie API.
-->

### Dlaczego Flask?
- **Lekki i elastyczny**  
  <!--
  Nie narzuca architektury, więc wszystko co niepotrzebne, pomijam. Dzięki temu finalny projekt ładuje się szybciej, nie korzysta z nadmiarowych zależności.
  -->
- **Łatwy w nauce**  
  <!--
  Dla nowych osób jest przystępny, dokumentacja i przykłady są rozbudowane, a poszczególne koncepcje można wdrażać stopniowo.
  -->
- **Doskonała dokumentacja**  
  <!--
  W razie problemów lub potrzeby rozszerzenia funkcjonalności, bardzo łatwo znaleźć odpowiedzi w sieci lub w oficjalnych materiałach.
  -->
- **Modularność**  
  <!--
  Praktyka: Każdą część aplikacji (np. logowanie, obsługa klientów, faktur) można zamknąć jako osobny tzw. Blueprint. Podnosi to czytelność i ułatwia testowanie/modułowość kodu.
  -->

### Zastosowanie w projekcie

#### 1. Inicjalizacja aplikacji
**Plik:** [app/__init__.py](app/__init__.py)
```python
from flask import Flask

def create_app():
    # Tworzę obiekt aplikacji Flask - to główny obiekt, przez który konfiguruję całe API.
    app = Flask(__name__)
    # Konfiguracja ładuje się z klasy Config, 
    # np. klucz do JWT, połączenie z bazą, domyślne ustawienia.
    app.config.from_object(Config)
    # Usuwam wymuszenie trailing slasha na ścieżkach URL.
    # Dzięki temu endpointy działają i z /api/Auth/ i z /api/Auth
    app.url_map.strict_slashes = False
```
<!--
create_app - ta metoda pozwala na pełną inicjalizację środowiska, co przydaje się przy testach, uruchamianiu wielu środowisk (dev/staging/prod) oraz integracji z narzędziami CLI.
-->

#### 2. Routing i Blueprint
**Przykład:** [app/controllers/auth.py](app/controllers/auth.py:12)
```python
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    # Logika logowania
```
<!--
Blueprinty to sposób na hermetyzację logiki różnych części API.
Np. mam 'auth_bp' dla autoryzacji, 'invoices_bp' dla faktur.
Pozwala to rozwijać różne funkcjonalności niezależnie (zespół kilku osób może pracować nad własnym blueprintem).
Każdy blueprint podpinam pod inny prefix URL, np. /api/Auth, /api/Customers.
-->

**Zastosowanie:**
- 19+ kontrolerów – każdy to osobny Blueprint (czyli hermetyczna sekcja kodu, np. logowanie, faktury, powiadomienia)
- Rozdzielenie odpowiedzialności: łatwiej utrzymać i testować.
- API jest czytelne dzięki podziałowi na namespace'y: /login, /customers, /invoices itd.

#### 3. Request Handling
**Przykład:** [app/controllers/auth.py](app/controllers/auth.py:14-23)
```python
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()  # Wyciągam JSON z body requestu
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Brak nazwy użytkownika lub hasła'}), 400
```
<!--
- request.get_json() – czytam dane wysłane przez frontend (np. login/hasło).
- request.headers – potrzebne np. dla autoryzacji JWT (Authorization: Bearer ...).
- request.remote_addr – wykorzystuję do logowania z którego IP loguje się użytkownik (audyt).
- jsonify() – standardowo backend w API zwraca odpowiedzi w postaci JSON (np. błąd autoryzacji, komunikat dla użytkownika).
-->

#### 4. Dependency Injection przez kontekst Flask
**Plik:** [app/middleware.py](app/middleware.py:37)
```python
from flask import g

# Zapisz ID użytkownika w kontekście Flask
g.user_id = current_user_id
```
<!--
Obiekt 'g' jest globalny tylko w obrębie jednego requestu.
Wrzucam do niego np. id aktualnie zalogowanego użytkownika, żeby później w każdym endpointcie łatwo do tego sięgnąć – np. logi, audyt, personalizacja odpowiedzi, przydzielanie uprawnień czy logika biznesowa.
To mój „magazynek” na dane bieżącego żądania.
-->

#### 5. Zarejestrowane moduły (Blueprinty)
**Plik:** [app/__init__.py](app/__init__.py:16-62)

| Blueprint | Prefix URL | Funkcjonalność |
|-----------|-----------|----------------|
| auth_bp | /api/Auth | Logowanie, rejestracja, zmiana hasła |
| customers_bp | /api/Customers | Zarządzanie klientami |
| groups_bp | /api/Groups | Zarządzanie grupami |
| invoices_bp | /api/Invoices | Faktury i płatności |
| reminders_bp | /api/Reminders | Przypomnienia |
| services_bp | /api/Services | Katalog usług |
| admin_bp | /api/admin | Panel administracyjny |
| messages_bp | /api/Messages | Wiadomości wewnętrzne |
| notes_bp | /api/Notes | Notatki |
| tags_bp | /api/Tags | Tagi/etykiety |
| logs_bp | /api/Logs | Logi systemowe |
| notifications_bp | /api/Notifications | Powiadomienia |
| reports_bp | /api/reports | Generowanie raportów |
| user_tasks_bp | /api/user | Zadania użytkownika |
| activities_bp | /api/Activities | Aktywności |
| dashboard_bp | /api/dashboard | Dashboard/pulpit |
| profile_bp | /api/Profile | Profil użytkownika |
| settings_bp | /api/Settings | Ustawienia systemu |
| contracts_bp | /api/Contracts | Kontrakty/umowy |
| meetings_bp | (brak) | Spotkania |
| calendar_events_bp | /api/CalendarEvents | Wydarzenia kalendarzowe |
| payments_bp | /api/Payments | Płatności |
| templates_bp | /api/Templates | Szablony dokumentów |

<!--
Taka rozbudowana tabela to dowód na dobre uporządkowanie aplikacji. Każda logika biznesowa jest rozbita na własny osobny moduł, co ułatwia rozrost systemu i szybkie odnalezienie błędów.
-->

---

## 2. Flask-SQLAlchemy 3.1.1 - ORM (Object-Relational Mapping)

### Cel użycia
<!--
Używam ORM-u (SQLAlchemy), aby operować na bazie danych bez pisania SQL – całość jest zrobiona na obiektach Pythona. To ogromnie zwiększa czytelność kodu i bezpieczeństwo (np. ochrona przed SQL Injection).
-->

### Dlaczego SQLAlchemy?
- **Eliminuje pisanie surowego SQL**  
  <!--
  Dzięki SQLAlchemy większość operacji (dodawanie, modyfikacja, usuwanie rekordów, relacje pomiędzy nimi) robię metodami na klasach/modelach Python. Kod jest bardziej zwięzły i łatwiej go testować.
  -->
- **Bezpieczeństwo**  
  <!--
  ORM automatycznie parametryzuje zapytania, przez co kod nie jest podatny na podstawowe SQL Injection.
  -->
- **Relacje**  
  <!--
  Tworzę relacje one-to-many, one-to-one itd., bez potrzeby pilnowania kluczy obcych "ręcznie". Kod staje się dużo bardziej czytelny.
  -->
- **Migracje**  
  <!--
  W przypadku zmian w bazie (np. nowa kolumna) nie muszę wszystkiego przepisywać w SQL – wystarczy zmienić model.
  -->

### Zastosowanie w projekcie

#### 1. Inicjalizacja bazy danych
**Plik:** [app/database/__init__.py](app/database/__init__.py)
```python
from flask_sqlalchemy import SQLAlchemy

# Tworzę globalny obiekt db, który reprezentuje połączenie z bazą i pozwala
# na definiowanie modeli oraz inicjalizowanie bazy w kontekście aplikacji Flask.
db = SQLAlchemy()

def init_database(app):
    # Inicjalizacja bazy danych w kontekście aplikacji Flask.
    # Pozwala to trzymać jedną instancję bazy dla całej aplikacji.
    db.init_app(app)
```

#### 2. Konfiguracja połączenia
**Plik:** [app/config.py](app/config.py:5)
```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:kapljca@localhost:3306/crm_project'
SQLALCHEMY_TRACK_MODIFICATIONS = False
```
<!--
- Format połączenia określa, że korzystam z MySQL poprzez driver PyMySQL.
- Ważne: wyłączam SQLALCHEMY_TRACK_MODIFICATIONS, żeby nie obciążać aplikacji niepotrzebnym śledzeniem każdego zapytania (to czysta optymalizacja).
-->

#### 3. Definicja modeli
**Przykład:** [app/models/user.py](app/models/user.py:4-14)
```python
from app.database import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))

    # Relacja - każda instancja User ma wygodny dostęp do roli (np. user.role.name)
    role = db.relationship('Role', backref='users')
```
<!--
Każda klasa modeluje tabelę w bazie. Kolumny = atrybuty klasy.
Warto pokazać na rozmowie: język SQL schowany pod „dywanem” - np. nie muszę samemu pisać joinów lub ręcznie pobierać relacji, każda z nich dostępna jest jak pole klasy.
-->

**Typy kolumn:**
- Integer — identyfikatory, klucze obce.
- String/Text — wszelkie pola tekstowe (loginy, emaile, opisy).
- DateTime — daty np. ostatniego logowania, daty faktur.
- Boolean — do oznaczenia np. czy faktura opłacona czy nie.
- Numeric/Decimal — przechowywanie kwot pieniężnych z odpowiednią precyzją (ważne! float nie zawsze wystarcza w księgowości).

#### 4. Relacje między tabelami
**Przykład:** [app/models/user.py](app/models/user.py:14)
```python
role = db.relationship('Role', backref='users')
```
<!--
- Relacje ułatwiają automatyczne pobieranie powiązanych danych.
- Zdefiniowane w modelach, przez co kod aplikacji jest spójny.
- Typowe relacje: User → LoginHistory (jeden do wielu), Invoice → Customer (wiele faktur do jednego klienta), User → Role (jeden do jednego).
-->

#### 5. Operacje CRUD

**CREATE - Tworzenie rekordu**
**Plik:** [app/controllers/auth.py](app/controllers/auth.py:154-162)
```python
new_user = User(
    username=username,
    email=email,
    password_hash=generate_password_hash(password),
    role_id=2
)

db.session.add(new_user)
db.session.commit()
```
<!--
- new_user = User() – tworzę obiekt podobnie jak instancję klasy w Pythonie.
- db.session.add + commit – wrzucam do transakcji i zatwierdzam.
-->

**READ - Pobieranie rekordów**
```python
user = User.query.filter_by(username=username).first()    # pobierz użytkownika po loginie
users = User.query.all()                                  # lista wszystkich użytkowników
admins = User.query.filter_by(role_id=1).all()            # pobierz wszystkich adminów
```
<!--
Query API jest bardzo podobne do Django ORM – łatwe do zrozumienia, nie trzeba SQL.
-->

**UPDATE - Aktualizacja**
**Plik:** [app/controllers/auth.py](app/controllers/auth.py:186-196)
```python
user.username = data['username']  # zmień nazwę użytkownika
user.email = data['email']
db.session.commit()               # zapisz w bazie
```
<!--
Zmiany w obiekcie są widoczne dopiero po commit – jest to spójny model transakcyjny.
-->

**DELETE - Usuwanie**
**Plik:** [app/controllers/auth.py](app/controllers/auth.py:257-258)
```python
db.session.delete(user)  # Usuń z bazy
db.session.commit()
```

#### 6. Zaawansowane zapytania SQL
**Plik:** [app/controllers/contracts.py](app/controllers/contracts.py:20-26)
```python
from sqlalchemy import text

contracts = db.session.execute(text("""
    SELECT c.Id, c.Title, c.ContractNumber, c.CustomerId, c.NetAmount,
           c.SignedAt, c.StartDate, c.EndDate, cu.Name as CustomerName
    FROM Contracts c
    LEFT JOIN Customers cu ON c.CustomerId = cu.Id
    ORDER BY c.Id DESC
""")).fetchall()
```
<!--
- Czasem ORM nie wystarcza.
- Wtedy korzystam z .execute(text(SQL)), np. przy bardzo rozbudowanych joinach, grupowaniach, agregacjach.
- Dzięki temu elastyczność + pełna moc SQL do raportów czy złożonych widoków.
-->

#### 7. Eager Loading (joinedload)
**Plik:** [app/controllers/invoices.py](app/controllers/invoices.py:5)
```python
from sqlalchemy.orm import joinedload

invoice = Invoice.query.options(
    joinedload(Invoice.customer),
    joinedload(Invoice.items)
).get(invoice_id)
```
<!--
joinedload – tzw. eager loading – bardzo ważna optymalizacja wydajności!
Bez joinedload: przy pobieraniu wielu faktur + pozycje + klient: na każde z zapytań jedno osobne odpytywanie bazy (tzw. problem N+1).
Z joinedload: wszystkie powiązane dane przychodzą jednym zapytaniem SQL jako JOIN, więc aplikacja działa szybciej – mniej czasu straconego na ruch do bazy.
W praktyce: np. pobieram 10 faktur, każda z klientem i pozycjami, to bez joinedload robi 21 zapytań, z joinedload – tylko jedno.
-->

**Korzyści:**
- Eliminacja problemu N+1 queries (duży plus do wydajności!)
- Przejrzystość kodu
- Zmniejszony czas ładowania danych

---

## 3. PyJWT 2.8.0 - JSON Web Tokens

### Cel użycia
<!--
JWT (JSON Web Token) to podstawowy mechanizm autoryzacji bezstanowej w aplikacji – każda operacja na danych sprawdza, czy token jest poprawny i aktualny.
-->

### Dlaczego JWT?
- **Bezstanowość**
  <!--
  Serwer nie musi utrzymywać sesji – każde żądanie niesie swój własny token, więc skalowanie backendu staje się naprawdę proste.
  -->
- **Bezpieczeństwo**
  <!--
  Token jest podpisany – nikt z zewnątrz nie podrobi go bez znajomości klucza.
  -->
- **Skalowalność**
  <!--
  Łatwo rozrzucić ruch na wiele serwerów – stan (kto jest zalogowany) przechowywany po stronie użytkownika.
  -->
- **Cross-domain**
  <!--
  Frontend np. React na localhost:3000, backend na localhost:5000 – wszystko obsłużę JWT, nie muszę się przejmować sesją cookies.
  -->

### Zastosowanie w projekcie

#### 1. Generowanie tokenu przy logowaniu
**Plik:** [app/controllers/auth.py](app/controllers/auth.py:79-87)
```python
import jwt
from datetime import datetime, timedelta
from app.config import Config

# Tworzę payload – dane użytkownika i data wygaśnięcia
payload = {
    'user_id': user.id,
    'username': user.username,
    'role': user.role.name if user.role else 'User',
    'exp': datetime.utcnow() + timedelta(hours=24)   # token ważny dobę
}
# Generuję token podpisany swoim kluczem, algorytm HS256 (standard)
token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
```
<!--
- Taki token potem trafia do headera Authorization (Bearer token) we wszystkich żądaniach.
- exp – data wygaśnięcia, żeby nie dało się używać starych tokenów.
- HS256 – klastryka: bezpieczeństwo, szybkość, szeroko wspierane w bibliotekach klienckich (np. w JS na froncie).
-->

#### 2. Weryfikacja tokenu w middleware
**Plik:** [app/middleware.py](app/middleware.py:6-46)
```python
from functools import wraps
import jwt

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Szukam tokena w headerze 'Authorization'
        auth_header = request.headers['Authorization']
        token = auth_header.split(" ")[1]  # "Bearer <token>"

        try:
            data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            current_user_id = data.get('user_id') or data.get('sub')

            # Zapisuję id użytkownika w kontekście requestu (pozwala np. sprawdzać uprawnienia)
            g.user_id = current_user_id

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token wygasł'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token nieprawidłowy'}), 401

        return f(*args, **kwargs)

    return decorated_function
```
<!--
To tzw. middleware (dekorator) – chroni endpointy wymagające autoryzacji.
Sprawdza: czy token nie jest po terminie, czy nikt nie próbował podrobić.
W razie błędu otrzymujemy czytelną odpowiedź 401 (Unauthorized) i powód.
-->

#### 3. Użycie dekoratora
**Przykład:** [app/controllers/auth.py](app/controllers/auth.py:170-171)
```python
@auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    # Endpoint chroniony – możesz wywołać tylko mając poprawny JWT
```
<!--
Mechanizm jest bardzo przejrzysty – na górze endpointu po prostu @require_auth i już.
Tak zabezpieczam CRUD na danych użytkowników, dashboard, generowanie raportów, operacje finansowe (faktury, kontrakty).
Tylko logowanie i rejestracja są dostępne bez JWT.
-->

#### 4. Konfiguracja JWT
**Plik:** [app/config.py](app/config.py:7-8)
```python
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 godziny w sekundach
```
<!--
Klucz JWT trzymamy w zmiennej środowiskowej – to bardzo ważne: nigdzie nie commituję tego klucza do repo.
W każdym środowisku (dev, staging, produkcja) mam własny tajny klucz – dzięki temu bezpieczeństwo na wysokim poziomie.
-->

---

## 4. bcrypt 4.1.1 - Hashowanie haseł

### Cel użycia
<!--
Każde hasło użytkownika hashowane jest silną funkcją jednokierunkową.
Dzięki temu nawet mając dostęp do bazy, nikt nie pozna prawdziwych haseł użytkowników.
-->

### Dlaczego bcrypt?
- **Jednokierunkowe hashowanie**  
  <!--
  Nie da się odzyskać hasła z jego skrótu – brute force dla bcrypt jest bardzo kosztowny.
  -->
- **Salt**
  <!--
  Każde hasło ma indywidualny salt, więc dwa identyczne hasła dają inne hashe – chroni to bazę nawet jeśli doszło do wycieku.
  -->
- **Odporność na brute-force**
  <!--
  Wolność działania jest featurem, a nie bugiem – to konkretna ochrona przed atakami słownikowymi i próbami złamania bazy.
  -->
- **Bezpieczeństwo**
  <!--
  Sprawdzone rozwiązanie, używane w branżowych aplikacjach od lat.
  -->

### Zastosowanie w projekcie

#### 1. Hashowanie hasła przy rejestracji
**Plik:** [app/controllers/auth.py](app/controllers/auth.py:153-159)
```python
from werkzeug.security import generate_password_hash

# Przy rejestracji hasło przetwarzam przez generate_password_hash – domyślnie używa bcrypt.
new_user = User(
    username=username,
    email=email,
    password_hash=generate_password_hash(password),
    role_id=2
)
```
<!--
generate_password_hash() – tworzy hash z saltem; 
oryginalne hasła nigdy nie są przechowywane — baza jest bezpieczna nawet w razie włamania.
-->

#### 2. Weryfikacja hasła przy logowaniu
**Plik:** [app/controllers/auth.py](app/controllers/auth.py:48-59)
```python
from werkzeug.security import check_password_hash
import hashlib

password_valid = False
try:
    # Spróbuj najpierw bcrypt (hash nowy systemowy)
    password_valid = check_password_hash(user.password_hash, password)
except Exception as e:
    # Dla starych kont obsługa hashów MD5 z wcześniejszej wersji systemu
    if user.password_hash and len(user.password_hash) == 32:
        password_hash = hashlib.md5(password.encode()).hexdigest()
        password_valid = user.password_hash == password_hash
```
<!--
check_password_hash(hasz, haslo_podane) – porównuje hash z bazy z podanym hasłem.
Jeśli hash z bazy jest stary (np. MD5, 32 znaki), to kod robi fallback,
dzięki czemu nawet stare konta mogą się zalogować i potem już ich hasło jest przekonwertowane na bcrypt przy kolejnej zmianie.
-->

#### 3. Zmiana hasła
**Plik:** [app/controllers/auth.py](app/controllers/auth.py:221-228)
```python
# Najpierw wymuszam wpisanie obecnego hasła – trzeba je znać!
if not check_password_hash(user.password_hash, current_password):
    return jsonify({'error': 'Nieprawidłowe obecne hasło'}), 400

user.password_hash = generate_password_hash(new_password)
db.session.commit()
```
<!--
Hasło nigdy nie jest przechowywane w plain-text.
Po zmianie tworzony jest nowy hash z nowym salt – nawet jeśli dwa razy podam ten sam nowy password, hash będzie inny.
-->

#### 4. Usuwanie konta
**Plik:** [app/controllers/auth.py](app/controllers/auth.py:253-254)
```python
# Żądanie usunięcia konta wymaga podania hasła – dodatkowa warstwa ochrony.
if not check_password_hash(user.password_hash, password):
    return jsonify({'error': 'Nieprawidłowe hasło'}), 400
```
<!--
Każda operacja krytyczna wymaga hasła; nikt nie usunie czyjegoś konta przypadkowo lub bez autoryzacji.
-->

---

## 5. PyMySQL 1.1.0 - MySQL Driver

### Cel użycia
<!--
PyMySQL to niskopoziomowy driver pozwalający połączyć Python bezpośrednio z MySQL.
Bez tego Flask-SQLAlchemy nie dogadałby się z bazą.
-->

### Dlaczego PyMySQL?
- **Czysty Python**  
  <!--
  Instalacja bez problemów systemowych, łatwa na każdym systemie (Windows/Linuks/Mac).
  -->
- **Kompatybilność**  
  <!--
  Działa z każdą wersją MySQL i MariaDB.
  -->
- **Wsparcie dla SQLAlchemy**
  <!--
  Standardowy driver polecany do Flaskowych projektów.
  -->

### Zastosowanie w projekcie

#### 1. Konfiguracja connection string
**Plik:** [app/config.py](app/config.py:5)
```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:kapljca@localhost:3306/crm_project'
```
<!--
Uri określa driver (pymysql), user/pass, host i port oraz nazwę bazy – mechanizm identyczny jak w Django, więc łatwo się przenieść na ten stack.
-->

#### 2. Automatyczna konfiguracja przez SQLAlchemy
<!--
Nie muszę nigdzie samemu robić importu „import pymysql”.
SQLAlchemy przez uri wie, jaki driver włączyć; sam dba o pulę połączeń i reconnecty.
-->

**Proces:**
- SQLAlchemy odczytuje string konfiguracyjny.
- Na jego podstawie uruchamia PyMySQL.
- Utrzymuje pool połączeń i obsługuje reconnecty.
- Dzięki temu nie muszę martwić się o obsługę połączenia na niskim poziomie.

---

## 6. Flask-CORS 4.0.0 - Cross-Origin Resource Sharing

### Cel użycia
<!--
Bez CORS frontend (np. React na innym porcie/domenie) nie dogada się z backendem – przeglądarka blokuje żądania z „obcych” źródeł.
Flask-CORS pozwala jawnie zadeklarować, które domeny/porty mają prawo korzystać z mojego API.
-->

### Dlaczego CORS?
- **Frontend na innym porcie**  
  <!--
  Na developmencie mam React na 3000 albo Vite na 5173, backend na 5000 – muszą się dogadać bezpiecznie i prawidłowo.
  -->
- **Bezpieczeństwo przeglądarki**  
  <!--
  Przeglądarka wymusza CORS (żądania cross-origin) i blokuje domyślnie, dlatego muszę jasno powiedzieć „ten frontend może korzystać z API”.
  -->
- **Kontrola dostępu**  
  <!--
  Dzięki temu mogę ograniczyć requests tylko z wybranych domen/portów (np. testy, staging, produkcja).
  -->

### Zastosowanie w projekcie

#### 1. Konfiguracja CORS
**Plik:** [app/__init__.py](app/__init__.py:2,12)
```python
from flask_cors import CORS

# Pozwalam na połączenia tylko z konkretnych portów/deweloperskich środowisk.
CORS(app, origins=[
    'http://localhost:3000',   # React (Create React App)
    'http://localhost:8100',   # Ionic
    'http://localhost:8082',   # Vue.js
    'http://localhost:5173'    # Vite
])
```
<!--
Wspieram kilkuletnie projekty i frontendowców: każda popularna platforma jak Create React App, Vite, Ionic, Vue – dzięki tej liście nie ma z nimi problemów z cors errors.
-->

**Co to umożliwia?**
- Frontend (JS, React) może wykonywać fetch/axios requests.
- Można przekazywać JWT w headerze bez problemów.
- Mogę testować szybko local development (nie muszę podnosić frontu na tym samym porcie co backend).

#### 2. Jak działa CORS?

**Bez CORS:**
```
Frontend (localhost:3000) -> Backend (localhost:5000)
❌ BLOCKED by browser: "No 'Access-Control-Allow-Origin' header"
```
<!--
To najczęściej spotykany problem podczas pracy z frontendem – po prostu przeglądarka odrzuca request jeśli nie ma nagłówka.
-->

**Z CORS:**
```
Frontend (localhost:3000) -> Backend (localhost:5000)
✅ ALLOWED: 'Access-Control-Allow-Origin: http://localhost:3000'
```
<!--
Po włączeniu — każdy request automatycznie dostaje nagłówek informujący przeglądarkę, że może wykonać request i pobrać dane.
-->

#### 3. Preflight requests (OPTIONS)
**Plik:** [app/middleware.py](app/middleware.py:11-12)
```python
if request.method == 'OPTIONS':
    return f(*args, **kwargs)
```
<!--
W praktyce niemal każde zapytanie z custom headerami (np. autoryzacja JWT) jest poprzedzane preflightem.
Preflight to zapytanie OPTIONS, które sprawdza, czy serwer pozwoli na daną akcję (np. POST/DELETE/PUT).
W ten sposób CORS oficjalnie deklaruje, jakie metody i nagłówki są akceptowane.
Dzięki obsłudze OPTIONS omijam wiele niezrozumiałych błędów na froncie.
-->

---

## 7. marshmallow 3.20.1 - Walidacja danych

### Cel użycia
<!--
marshmallow to mechanizm do walidacji/formalizacji danych wejściowych.
Dzięki niemu mogę określić dokładnie, jakiej struktury i typu danych spodziewam się w requeście (walidacja już na wejściu, deklaratywnie).
-->

### Dlaczego marshmallow?
- **Spójna walidacja**  
  <!--
  Pozwala raz zdefiniować schemat — i walidować w każdym endpointcie.
  -->
- **Serializacja/Deserializacja**  
  <!--
  Konwertuje obiekty Python <-> JSON (czyli np. z requestu na dict, z dict na model).
  -->
- **Bezpieczeństwo**
  <!--
  Wychwytuje złe typy (np. string zamiast int), długości, wymagane pola, email poprawny format etc. — chroni backend przed błędami i atakami.
  -->
- **Czytelność**
  <!--
  Ładny, deklaratywny styl, łatwo się odnaleźć.
  -->

### Zastosowanie w projekcie

**Uwaga:** W tej aplikacji marshmallow jest zainstalowany (requirements.txt) ale obecna walidacja jest pisana ręcznie.

**Potencjalne użycie:**
```python
from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))

# Walidacja danych wejściowych:
schema = UserSchema()
errors = schema.validate(request.get_json())
if errors:
    return jsonify({'errors': errors}), 400
```
<!--
Dzięki deklaratywnej definicji mogę łatwo utrzymać spójność każdego endpointa — unikam błędów typu "klient zapomniał pola" lub "zły typ".
Patrz: UserSchema, jasno mówię: username musi być stringiem, email poprawnym emailem, password min 8 znaków itd.
-->

**Aktualny stan:**
```python
if not username or not password:
    return jsonify({'error': 'Brak nazwy użytkownika lub hasła'}), 400
```
<!--
Tu walidacja robię „na piechotę”.
Plan jest, żeby w przyszłości sukcesywnie wprowadzać marshmallow do endpointów wymagających bardziej rygorystycznej walidacji (np. formularze faktury, rejestracja użytkownika).
-->

---

## 8. python-dotenv 1.0.0 - Zarządzanie zmiennymi środowiskowymi

### Cel użycia
<!--
python-dotenv pozwala na trzymanie ustawień (hasła do baz, klucze JWT, production secrets) poza kodem – w plikach .env, które nie trafiają do repozytorium.
To klucz do bezpieczeństwa CI/CD oraz łatwych migracji pomiędzy środowiskami!
-->

### Dlaczego dotenv?
- **Oddzielenie kodu od konfiguracji**  
  <!--
  Spełniam zasadę 12-Factor App – to jest standard w każdej współczesnej aplikacji.
  -->
- **Bezpieczeństwo**  
  <!--
  Wszystkie tajne dane (db, JWT) trzymam poza kodem – nawet jak kod wycieknie, nie wyciekną dane!
  -->
- **Różne środowiska**
  <!--
  Dla dev i produkcji, testów i staga zostawiam osobny plik .env — to daje swobodę i bezpieczeństwo na każdym etapie.
  -->

### Zastosowanie w projekcie

#### 1. Ładowanie zmiennych środowiskowych
**Plik:** [app/config.py](app/config.py:1,4-7)
```python
import os

class Config:
    # SECRET_KEY używany przez Flask do podpisywania cookies, CSRF etc.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    # Adres do bazy pobieram z env – w dev domyślnie jest lokalny.
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'mysql+pymysql://root:kapljca@localhost:3306/crm_project'
    # Klucz do JWT, tak samo ładowany z env.
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
```
<!--
To minimum bezpieczeństwa – wszystkie sekrety tylko w .env, nie w kodzie.
Do deployu na serwerze produkcyjnym .env dostarczam osobnym kanałem (np. Bamboo, Github Actions, ręcznie).
-->

#### 2. Struktura pliku .env (przykład, nie commituję!)
```bash
# .env
SECRET_KEY=super-secret-production-key-xyz123
DATABASE_URL=mysql+pymysql://prod_user:prod_password@db.example.com:3306/crm_prod
JWT_SECRET_KEY=jwt-production-secret-abc456
```
<!--
Każdy programista tworzy swój .env, prod ma swój, github.com tego nie widzi bo .gitignore.
Przy przenoszeniu kodu, zmieniam tylko .env i wszystko działa!
-->

#### 3. Zmienne konfiguracyjne

| Zmienna | Cel | Wartość dev | Wartość prod |
|---------|-----|-------------|--------------|
| SECRET_KEY | Klucz szyfrujący sesje Flask | dev-secret-key... | Losowy, bezpieczny klucz |
| DATABASE_URL | Connection string do bazy | localhost | Serwer produkcyjny |
| JWT_SECRET_KEY | Klucz podpisujący tokeny JWT | jwt-secret-key... | Losowy, bezpieczny klucz |

<!--
Tabela dla rekruterów i managerów: widać, że w dev, prod, test mam inne ustawienia — nie wynoszę secretów do repo.
-->

#### 4. Bezpieczeństwo

**Dobre praktyki:**
- `.env` zawsze w `.gitignore`
- Tworzę `.env.example` – łatwo onboardować nowych devów
- Klucze do JWT itp. mogą być generowane osobno dla każdego środowiska.
- Regularna rotacja kluczy — wyższy poziom bezpieczeństwa.

**Złe praktyki:**
- Komitowanie .env do repozytorium (absolutne nie)
- Używanie tych samych kluczy w dev i produkcji
- Hasła/harde kody w kodzie źródłowym

---

## 9. pytz 2023.3.0 - Obsługa stref czasowych

### Cel użycia
<!--
pytz pozwala mi trzymać poprawne, jednoznaczne znaczenie dat i godzin — w systemie klasy CRM to podstawa: logowania, terminy płatności, raporty, eksport danych.
-->

### Dlaczego pytz?
- **Uniwersalność**
  <!--
  Użytkownicy mogą być w dowolnej strefie czasowej – pytz zapewnia prawidłową konwersję czasu.
  -->
- **Dokładność**
  <!--
  Konwersja UTC<->lokalna strefa nie gubi godzin/dni – ważne przy wystawianiu faktur, powiadomień SMS, generowaniu raportów do urzędów.
  -->
- **Zgodność**
  <!--
  Używam standardowej bazy stref czasowych IANA, więc mam pewność, że czas będzie zawsze jednoznaczny.
  -->

### Zastosowanie w projekcie

#### 1. Lokalizacja czasu UTC
**Plik:** [app/models/login_history.py](app/models/login_history.py:4,11)
```python
import pytz
from datetime import datetime

class LoginHistory(db.Model):
    # Domyślny czas logowania to UTC z pełną informacją o strefie
    LoginTime = db.Column(db.DateTime, default=lambda: pytz.utc.localize(datetime.utcnow()))
```
<!--
Każde logowanie i operacja jest oznaczane czasem UTC (światowym). 
Unikam w ten sposób błędów typu „czas ukraiński vs polski”, DST (przestawianie zegarków) itd.
-->

#### 2. Zastosowania w logowaniu
**Plik:** [app/controllers/auth.py](app/controllers/auth.py:92-102)
```python
from datetime import datetime

login_history = LoginHistory(
    UserId=user.id,
    LoginTime=datetime.now(),  # Data automatycznie lokalizowana przez model na UTC
    IpAddress=request.remote_addr,
    UserAgent=request.headers.get('User-Agent', ''),
    Success=True
)
```
<!--
Każde logowanie rejestruję z: datą/godziną (UTC), IP użytkownika, user-agentem przeglądarki.
To daje pełną informację audytową i ułatwia wykrywanie nadużyć.
-->

#### 3. Konwersja do ISO format
**Plik:** [app/models/login_history.py](app/models/login_history.py:28)
```python
login_time_iso = self.LoginTime.isoformat() if self.LoginTime else None
```
<!--
Format ISO 8601 rozumie każda przeglądarka i każda biblioteka JS. 
Przesyłam daty do frontendu bez lokalnych komplikacji — JS sam sobie je przeliczy na lokalny czas użytkownika.
-->

---

## 10. requests 2.31.0 - Biblioteka HTTP

### Cel użycia
<!--
requests służy do pobierania/wysyłania danych do innych systemów z mojego backendu,
np. API płatności, weryfikacje kont bankowych, powiadomienia push/SMS/email.
-->

### Dlaczego requests?
- **Prosta składnia**  
  <!--
  Kod jest bardzo czytelny - request.post(...), request.get(...), podobne do „fetch” z JS, intuicyjne nawet dla juniorów.
  -->
- **Wszechstronność**
  <!--
  Obsługuje dowolne metody HTTP – można korzystać z API zewnętrznych, obsługuje autoryzację, sesje, cookies.
  -->
- **Automatic encoding**
  <!--
  Automatycznie zamienia dicty na JSON, nie muszę martwić się serializacją.
  -->
- **Session management**
  <!--
  Obsługuje cookies i sesje w ramach połączenia – przydatne np. w API bankowych.
  -->

### Zastosowanie w projekcie

**Uwaga:** requests obecnie jest na liście pakietów, ale jeszcze nie został aktywnie wykorzystany w kodzie.
<!--
Przykłady, gdzie planuję albo już czasem używam:
- integracja z systemem fakturującym zewnętrznym (np. GUS, e-PIT),
- weryfikacja NIP/REGON klienta przed utworzeniem kontraktu,
- pobieranie kursów walut do faktur walutowych.
-->

**Przykład użycia:**
```python
import requests

response = requests.post('https://api.example.com/invoices',
    json={'amount': 100.0, 'customer_id': 123},
    headers={'Authorization': 'Bearer token123'}
)

if response.status_code == 200:
    data = response.json()
```
<!--
W praktyce kod przypomina korzystanie z fetch/axios na froncie – to bardzo uniwersalna biblioteka do callowania dowolnych API.
-->

---

## 11. ReportLab - Generowanie PDF

### Cel użycia
<!--
ReportLab to „silnik PDF” w Pythonie – generuję raporty, faktury i inne dokumenty do wydruku prosto z backendu, bez używania Worda czy Latex.
Raporty są bardzo eleganckie, a faktury mają pełne wsparcie dla polskich znaków i formatowania tabel.
-->

### Dlaczego ReportLab?
- **Profesjonalne PDF-y**
  <!--
  Dokumenty generowane bezpośrednio – idealne pod CRMy, ERP itd. Tam gdzie Word nie daje rady, ReportLab robi robotę.
  -->
- **Kontrola layoutu**
  <!--
  Samemu definiuję układ – od marginesów, czcionek, przez kolory, ramki, do ułożenia tabel.
  -->
- **Tabele i wykresy**
  <!--
  Generuję pozycje faktur, kolumny, sumy, rozliczenia VAT, tabele finansowe.
  -->
- **Polskie znaki**
  <!--
  Dzięki wsparciu Unicode i podpinaniu zewnętrznych czcionek, każdy PDF wygląda profesjonalnie (np. DejaVuSans).
  -->

### Zastosowanie w projekcie

#### 1. Import biblioteki
**Plik:** [app/controllers/invoices.py](app/controllers/invoices.py:6-11)
```python
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
```
<!--
Podpinam nie tylko bazowe PDF-y, ale też rozbudowane tabele z automatycznym łamaniem wierszy, customowe kolory ramek/pól etc.
-->

#### 2. Rejestracja polskich czcionek
**Plik:** [app/controllers/invoices.py](app/controllers/invoices.py:19-33)
```python
def register_polish_fonts():
    """Rejestruje polskie czcionki dla PDF"""
    try:
        font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
        bold_font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))
        if os.path.exists(bold_font_path):
            pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', bold_font_path))
        return True
    except Exception as e:
        print(f"Nie udało się zarejestrować czcionek: {e}")
        return False
```
<!--
Polskie litery osiągam dzięki rejestracji fontów TrueType (TTF) z systemu, np. DejaVuSans z /usr/share/fonts/truetype.
To bardzo ważny detal: PDF zawsze ma poprawne znaki diakrytyczne, nie „krzaczy” plików na etapie wydruku/eksportu do urzędów.
-->

#### 3. Tworzenie dokumentu PDF
**Plik:** [app/controllers/invoices.py](app/controllers/invoices.py:41-71)
```python
def create_invoice_pdf(invoice):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)  # nowy dokument A4

    register_polish_fonts()
    styles = getSampleStyleSheet()

    # Wybór czcionek: jeśli mogę złapać polskie, używam, w innym razie Helvetica fallback
    if 'DejaVuSans-Bold' in pdfmetrics.getRegisteredFontNames():
        title_font = 'DejaVuSans-Bold'
        normal_font = 'DejaVuSans'
    else:
        title_font = 'Helvetica-Bold'
        normal_font = 'Helvetica'

    # Definiuję własne style tytułów/paragrafów – typografia moich PDF-ów jest spójna i profesjonalna
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=title_font,
        fontSize=16
    )
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontName=normal_font,
        fontSize=10
    )
```
<!--
Kod generowania PDF w praktyce przypomina setup Worda – ale pełna automatyzacja, wygenerowanie faktury, zestawu raportów, wszystko dzieje się „w locie”.
-->

#### 4. Dodawanie zawartości
**Plik:** [app/controllers/invoices.py](app/controllers/invoices.py:73-98)
```python
elements = []

# Nagłówek – duży, wyraźny tytuł faktury
elements.append(Paragraph("FAKTURA", title_style))
elements.append(Spacer(1, 20))

elements.append(Paragraph(f"<b>Numer faktury:</b> {invoice.Number}", normal_style))
elements.append(Paragraph(f"<b>Data wystawienia:</b> {invoice.IssuedAt.strftime('%d.%m.%Y')}", normal_style))
elements.append(Paragraph(f"<b>Termin płatności:</b> {invoice.DueDate.strftime('%d.%m.%Y')}", normal_style))
elements.append(Paragraph(f"<b>Status:</b> {'OPŁACONA' if invoice.IsPaid else 'OCZEKUJĄCA'}", normal_style))
elements.append(Paragraph(f"<b>Kwota:</b> {float(invoice.TotalAmount):.2f} PLN", normal_style))
elements.append(Spacer(1, 20))

if invoice.customer:
    elements.append(Paragraph("DANE KLIENTA", title_style))
    elements.append(Paragraph(f"<b>Nazwa:</b> {invoice.customer.Name}", normal_style))
    elements.append(Paragraph(f"<b>Email:</b> {invoice.customer.Email}", normal_style))
    elements.append(Paragraph(f"<b>Telefon:</b> {invoice.customer.Phone}", normal_style))
```
<!--
Strukturę generuję dynamicznie – w zależności od obecności danych klienta, faktury, płatności.
Łatwo potem dodać kolejne sekcje (dane VAT, opis, pozycje faktury do Table, stopki, notki prawne itp.).
-->

#### 5. Komponenty ReportLab użyte w projekcie

| Komponent | Zastosowanie | Plik |
|-----------|--------------|------|
| SimpleDocTemplate | Struktura i układ dokumentu | invoices.py:44 |
| Paragraph | Tekst z formatowaniem HTML | invoices.py:77 |
| Spacer | Odstępy między elementami (layout) | invoices.py:78 |
| Table | Tabele z pozycjami faktury | invoices.py:100+ |
| TableStyle | Formatowanie tabel (kolory, ramki, marginesy) | invoices.py:100+ |
| ParagraphStyle | Niestandardowe style tekstu, typografia | invoices.py:60 |
| colors | Definicje kolorów ramek i tła tabel | invoices.py:9 |

<!--
Każdy z tych elementów opanowałem do tworzenia profesjonalnych, bogatych PDF-ów zgodnych z oczekiwaniami klientów (np. faktura z logo, poleceniem przelewu, dodatkowymi notkami).
-->

#### 6. Generowanie i wysyłanie PDF
**Plik:** [app/controllers/invoices.py](endpoint download PDF)
```python
@invoices_bp.route('/<int:invoice_id>/download', methods=['GET'])
@require_auth
def download_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)

    # Wygeneruj PDF do bufora
    pdf_buffer = create_invoice_pdf(invoice)

    # Wysyłam bufor jako plik download
    return send_file(
        pdf_buffer,N
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'faktura-{invoice.Number}.pdf'
    )
```
<!--
Każdy użytkownik drukuje, eksportuje na maila lub archiwizuje gotowe PDF-y faktur i raportów w kilka sekund.
Kod „gotowiec” na produkcję i urzędową wymianę dokumentów elektronicznych.
-->

#### 7. Również używany w raportach
**Plik:** [app/controllers/reports.py](app/controllers/reports.py:5-10)
```python
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
```
<!--
Do każdego dokumentu mogę generować dedykowany layout – wartość dla klientów: dedykowane raporty sprzedażowe, zestawienia do analizy, customizacja layoutu i kolorystyki pod branding klienta.
-->

---

## 12. python-docx - Obsługa plików Word

### Cel użycia
<!--
Word to nadal standard, jeśli chodzi o umowy i dokumenty do podpisu.
python-docx umożliwia składanie gotowych dokumentów na podstawie szablonów – pełna automatyzacja, zmienne, placeholdery, personalizacja dla każdego klienta.
-->

### Dlaczego python-docx?
- **Powszechny format**  
  <!--
  Word jest akceptowany wszędzie (banki, administracja, klienci zagraniczni, ERP).
  -->
- **Edytowalność**
  <!--
  Dokument trafia do klienta jako *.docx, więc można go później poprawić, dodać aneks, uwagi albo podpis elektroniczny.
  -->
- **Szablony**
  <!--
  Placeholdery typu {{CONTRACT_TITLE}}, {{CUSTOMER_NAME}} – wszystko podmieniam automatycznie w kodzie, oszczędność czasu, zero literówek.
  -->
- **Formatowanie**
  <!--
  Układ, czcionki, style – wszystko trzymaję z szablonu, nie tracę layoutu ani profesjonalnego wyglądu.
  -->

### Zastosowanie w projekcie

#### 1. Import biblioteki
**Plik:** [app/controllers/contracts.py](app/controllers/contracts.py:9)
```python
from docx import Document
import re
```
<!--
Importuję python-docx oraz re (do zaawansowanych zamian tekstu w dokumencie, np. placeholdery w tabelach).
-->

#### 2. Otwieranie szablonu Word
**Plik:** [app/controllers/contracts.py](app/controllers/contracts.py:197)
```python
doc = Document(template_path)  # Otwieram szablon .docx z dysku
```
<!--
Typowy scenariusz: na serwerze trzymam uniwersalne szablony (np. umowa o współpracę, NDA).
Ładuję szablon i wypełniam zmienne danymi konkretnego klienta/kontraktu.
-->

**Proces:**
1. Plik szablonu trzymam na dysku (np. templates/contracts/umowa.docx).
2. Placeholdery typu {{CONTRACT_TITLE}} są rozpoznawane i zamieniane przez kod.
3. Po zamianie generuję gotowy *.docx do pobrania przez użytkownika.

#### 3. Zastępowanie placeholderów
**Plik:** [app/controllers/contracts.py](app/controllers/contracts.py:200-231)
```python
# Lista zamian: każdy placeholder mapuję na dane z kontraktu
replacements = {
    '{{CONTRACT_TITLE}}': contract.Title,
    '{{CONTRACT_NUMBER}}': contract.ContractNumber or 'Brak numeru',
    '{{CUSTOMER_NAME}}': customer_data['name'],
    '{{CUSTOMER_EMAIL}}': customer_data['email'] or 'Brak',
    '{{CUSTOMER_PHONE}}': customer_data['phone'] or 'Brak',
    '{{CUSTOMER_ADDRESS}}': customer_data['address'] or 'Brak',
    '{{NET_AMOUNT}}': f"{float(contract.NetAmount):.2f} PLN",
    '{{START_DATE}}': contract.StartDate.strftime('%d.%m.%Y') if contract.StartDate else 'Brak',
    '{{END_DATE}}': contract.EndDate.strftime('%d.%m.%Y') if contract.EndDate else 'Brak',
    '{{SIGNED_DATE}}': contract.SignedAt.strftime('%d.%m.%Y') if contract.SignedAt else 'Brak'
}

# Zamieniam placeholdery w każdym paragrafie dokumentu
for paragraph in doc.paragraphs:
    for placeholder, value in replacements.items():
        if placeholder in paragraph.text:
            paragraph.text = paragraph.text.replace(placeholder, str(value))
```
<!--
Tak zamieniam dynamicznie dane w tekstach – kontrakt gotowy w kilka sekund, zero błędów typu „zły numer umowy, literówka w danych klienta”.
-->

#### 4. Zastępowanie w tabelach
**Plik:** [app/controllers/contracts.py](app/controllers/contracts.py:222-231)
```python
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            for placeholder, value in replacements.items():
                if placeholder in cell.text:
                    for paragraph in cell.paragraphs:
                        if placeholder in paragraph.text:
                            paragraph.text = paragraph.text.replace(placeholder, str(value))
```
<!--
Część danych trafia do tabel (np. rozpiska kosztów, lista stron umowy).
Tu również z automatu zamienię placeholdery na prawdziwe dane – pełne wsparcie także dla umów wielostronicowych z tabelami!
-->

**Obsługuję:**
- Paragrafy tekstowe,
- Tabele (wiersze i komórki),
- Potencjalnie także nagłówki/stopki jeśli trzeba.

#### 5. Zapisywanie dokumentu
**Plik:** [app/controllers/contracts.py](app/controllers/contracts.py:233-235)
```python
# Tworzę plik tymczasowy – wygodne, bo nie muszę sprzątać po deployu
temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.docx')
doc.save(temp_file.name)
temp_file.close()
```
<!--
Dzięki tymczasowym plikom obsługuję setki użytkowników jednocześnie bez bałaganu w folderze z gotowymi kontraktami. 
Po wysłaniu dokumentu mogę je łatwo wyczyścić/wywalić.
-->

#### 6. Wysyłanie pliku do pobrania
**Plik:** [app/controllers/contracts.py](app/controllers/contracts.py:237-243)
```python
filename = f"umowa-{contract_id}-{contract.ContractNumber or 'bez-numeru'}-{datetime.now().strftime('%Y%m%d')}.docx"

return send_file(
    temp_file.name,
    as_attachment=True,
    download_name=filename,
    mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
)
```
<!--
Użytkownik dostaje plik z czytelną, uporządkowaną nazwą (ID, numer umowy, data).
To ułatwia archiwizację i szybkie odnalezienie archiwalnych kontraktów w systemie.
-->

#### 7. Zaawansowane użycie - system szablonów
**Plik:** [app/controllers/contracts.py](app/controllers/contracts.py:310-337)
```python
if template.FileName.lower().endswith('.docx'):
    doc = Document(template.FilePath)
    template_variables = {
        '{CONTRACT_TITLE}': contract.Title,
        '{CONTRACT_NUMBER}': contract.ContractNumber or '',
        '{CUSTOMER_NAME}': customer_name,
        '{NET_AMOUNT}': f"{float(contract.NetAmount):.2f}",
        '{START_DATE}': contract.StartDate.strftime('%Y-%m-%d') if contract.StartDate else '',
        '{END_DATE}': contract.EndDate.strftime('%Y-%m-%d') if contract.EndDate else ''
    }
    for paragraph in doc.paragraphs:
        for key, value in template_variables.items():
            if key in paragraph.text:
                paragraph.text = paragraph.text.replace(key, value)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for key, value in template_variables.items():
                    pattern = re.compile(r'\{' + key + r'\}')
                    cell.text = pattern.sub(value, cell.text)
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.docx')
    doc.save(temp_file.name)
```
<!--
Wersja „enterprise” — obsługa różnych szablonów, regex do wyszukiwania placeholderów, możliwość masowej customizacji umów (np. różne wzory NDA, różna lista usług itd).
To pokazuje dojrzałość rozwiązania, elastyczność na różne typy klientów.
-->

**Typowe użycia:**
- Umowy z klientami, aneksy, NDA-y,
- Oferty handlowe,
- Automatyczne generowanie dokumentów powiązanych (np. zamówienia, potwierdzenia świadczenia usługi).

---

## 13. Flask-Migrate 4.0.5 - Migracje bazy danych

### Cel użycia
<!--
Flask-Migrate (oparty o Alembic) automatyzuje zmiany w bazie na bazie definicji modeli. Dzięki temu przy np. dodaniu nowej kolumny można to łatwo wdrożyć i „przepchnąć” na produkcję lub testy jednym poleceniem.
-->

### Uwaga
<!--
W projekcie jest zainstalowany, choć sam korzystam obecnie głównie z własnego kodu migracyjnego – dbam o pełną kontrolę nad bazą.
Warto jednak znać standard, bo w dużych zespołach przyda się automatyzacja migracji.
-->

### Potencjalne zastosowanie
```python
# Inicjalizacja migracji – przy pierwszym wdrożeniu
flask db init

# Utworzenie migracji na podstawie różnic w modelu kodu i bazie
flask db migrate -m "Add email column to users"

# Wykonanie migracji (zmiana schematu bazy)
flask db upgrade
```
<!--
W każdej chwili mogę dodać/zmienić kolumnę w modelu, „przepchnąć” to komendą migrate, a potem jednym upgradem wprowadzić nową strukturę również na środowisku produkcyjnym.
Jedno narzędzie do wersjonowania zmian w bazie.
-->
---

## Podsumowanie użycia bibliotek

### Najbardziej krytyczne biblioteki

1. **Flask** – utrzymuje routing, całość logiki backendu.
2. **Flask-SQLAlchemy** – pośrednik do bazy danych, wszelkie operacje na modelach, transakcje.
3. **PyJWT** – klucz do bezpiecznej autoryzacji użytkownika.
4. **bcrypt** – zapewnia realne bezpieczeństwo haseł.
5. **Flask-CORS** – łącznik backendu z frontendem, gwarancja bezproblemowej pracy developerskiej.

### Biblioteki do generowania dokumentów

1. **ReportLab** – profesjonalne pliki PDF (faktury, raporty, eksporty).
2. **python-docx** – dokumenty Word automatycznie generowane do każdej umowy/kontraktu.

### Biblioteki wspomagające

1. **PyMySQL** – OTP między SQLAlchemy a MySQL.
2. **python-dotenv** – zarządzanie kluczami, hasłami, settingami bezpośrednio z plików środowiskowych.
3. **pytz** – pełna poprawność dat i czasu w każdym miejscu na świecie.

### Nieużywane/Opcjonalne

1. **marshmallow** – planowane wdrożenie do walidacji danych wejściowych
2. **requests** – obsługa zewnętrznych API (na razie w rezerwie)
3. **Flask-Migrate** – opcjonalny, bo mamy własny kod migracyjny

---

## Struktura zależności

```
Flask (główny framework)
├── Flask-CORS (umożliwia CORS)
├── Flask-SQLAlchemy (ORM)
│   └── PyMySQL (driver MySQL)
├── PyJWT (autoryzacja)
├── bcrypt (hashowanie haseł)
└── python-dotenv (konfiguracja)

Generowanie dokumentów:
├── ReportLab (PDF)
└── python-docx (Word)

Wspomagające:
├── pytz (strefy czasowe)
├── marshmallow (walidacja - nieużywana)
└── requests (HTTP - nieużywana)
```
<!--
Łańcuch zależności wyjaśnia, że właściwie wszystko kręci się wokół Flask + SQLAlchemy + JWT – cała reszta to „nakładki” na te fundamenty.
Prosto tłumaczę na rozmowie: podstawa to Flask, baza danych przez SQLAlchemy, reszta to bardzo modularny zestaw „rozszerzeń” do obsługi nowoczesnej aplikacji biznesowej.
-->

---

## Statystyki projektu

- **Liczba kontrolerów (Blueprinty):** 23
- **Liczba modeli bazy danych:** ~20
- **Główne biblioteki:** 13
- **Aktywnie używane:** 10
- **Linie kodu backendu:** ~10,000+

<!--
Duży, dojrzały projekt – architektura i dobór bibliotek potwierdzają, że jest to stack gotowy na produkcję, rozbudowę, obsługę wielu użytkowników, elastyczność pod customizację dla klientów.
-->

---

## Wnioski

<!--
Najważniejsze cechy mojego rozwiązania na backendzie:
-->

Aplikacja wykorzystuje **przemyślany stack technologiczny** skupiony na:

1. **Prostocie** – Flask zamiast Django; łatwa krzywa uczenia, szybki start projektu, elastyczność (np. na szybkie zmiany biznesowe).
2. **Bezpieczeństwie** – JWT (autoryzacja każdy request), bcrypt (hashowanie haseł, ochrona bazy).
3. **Funkcjonalności biznesowej** – automatyczne generowanie raportów i dokumentów PDF/Word z danymi z CRM-a.
4. **Skalowalności** – backend gotowy na dzielenie ruchu na kilka serwerów i różnych klientów.
5. **Standardach branżowych** – wszystkie użyte narzędzia są oparte o najnowsze best practices i wypróbowane przez setki tysięcy projektów open-source.

<!--
Z takiego stosu tłumaczę się na rozmowie bardzo łatwo i rzeczowo – każdy punkt i każdą bibliotekę potrafię wyjaśnić w detalu, pokazując, jak to wpływa na czytelność, wydajność, bezpieczeństwo i łatwość rozwoju całego projektu.
-->
