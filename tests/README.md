# Testy Aplikacji CRM - Backend Python

Ten folder zawiera kompleksowy zestaw testów dla wszystkich endpointów API backendu CRM napisanego w Pythonie.

## Struktura testów

```
tests/
├── __init__.py
├── conftest.py                    # Konfiguracja pytest i fixtures
├── test_auth.py                   # Testy autoryzacji (login, register, profile)
├── test_customers.py              # Testy endpointów klientów
├── test_invoices.py               # Testy endpointów faktur
└── test_other_endpoints.py        # Testy pozostałych endpointów
```

## Instalacja zależności testowych

1. Zainstaluj zależności testowe:

```bash
cd backend-python
pip install -r requirements-test.txt
```

2. Upewnij się, że zainstalowane są również podstawowe zależności:

```bash
pip install -r requirements.txt
```

## Uruchamianie testów

### Uruchom wszystkie testy

```bash
pytest
```

### Uruchom testy z szczegółowym outputem

```bash
pytest -v
```

### Uruchom konkretny plik testowy

```bash
pytest tests/test_auth.py
pytest tests/test_customers.py
pytest tests/test_invoices.py
```

### Uruchom konkretny test

```bash
pytest tests/test_auth.py::TestAuthEndpoints::test_login_success
```

### Uruchom testy z pokryciem kodu (coverage)

```bash
pytest --cov=app --cov-report=html
```

Po uruchomieniu, raport pokrycia będzie dostępny w `htmlcov/index.html`.

### Uruchom testy z wyświetlaniem print statements

```bash
pytest -s
```

### Uruchom testy i zatrzymaj się na pierwszym błędzie

```bash
pytest -x
```

## Co testują poszczególne pliki?

### test_auth.py
- ✅ POST `/api/Auth/login` - logowanie użytkownika
- ✅ POST `/api/Auth/register` - rejestracja nowego użytkownika
- ✅ PUT `/api/Auth/profile` - aktualizacja profilu
- ✅ PUT `/api/Auth/change-password` - zmiana hasła
- ✅ DELETE `/api/Auth/delete-account` - usunięcie konta

### test_customers.py
- ✅ GET `/api/Customers/` - pobieranie listy klientów
- ✅ POST `/api/Customers/` - tworzenie nowego klienta
- ✅ GET `/api/Customers/{id}` - pobieranie szczegółów klienta
- ✅ PUT `/api/Customers/{id}` - aktualizacja klienta
- ✅ DELETE `/api/Customers/{id}` - usuwanie klienta

### test_invoices.py
- ✅ GET `/api/Invoices/` - pobieranie listy faktur
- ✅ POST `/api/Invoices/` - tworzenie nowej faktury
- ✅ GET `/api/Invoices/{id}` - pobieranie szczegółów faktury
- ✅ PUT `/api/Invoices/{id}` - aktualizacja faktury
- ✅ DELETE `/api/Invoices/{id}` - usuwanie faktury
- ✅ GET `/api/Invoices/{id}/pdf` - generowanie PDF faktury

### test_other_endpoints.py
Testy dla pozostałych endpointów:
- Groups, Services, Contracts
- Notes, Messages, Tags
- Notifications, Activities
- Dashboard, Profile, Settings
- Reminders, Payments, Meetings
- Calendar Events, Templates
- Logs, Reports

## Fixtures dostępne w testach

### Fixtures z conftest.py:

- `app` - instancja aplikacji Flask do testów
- `client` - klient testowy Flask
- `admin_token` - token JWT dla użytkownika admin
- `user_token` - token JWT dla zwykłego użytkownika
- `auth_headers_admin` - nagłówki HTTP z tokenem admina
- `auth_headers_user` - nagłówki HTTP z tokenem użytkownika

### Przykład użycia:

```python
def test_get_customers(client, auth_headers_admin):
    response = client.get('/api/Customers/', headers=auth_headers_admin)
    assert response.status_code == 200
```

## Dane testowe

Podczas inicjalizacji testów automatycznie tworzone są:

- **Role**: Admin (id=1), User (id=2)
- **Użytkownicy**:
  - Admin: username='admin', password='admin123'
  - User: username='user', password='user123'
- **Grupa testowa**: id=1, Name='Test Group'
- **Klient testowy**: id=1, Name='Test Customer'
- **Usługa testowa**: id=1, Name='Test Service', Price=100.00

## Konfiguracja testów

Testy wykorzystują bazę danych SQLite w pamięci (`:memory:`), więc:
- Są szybkie
- Nie modyfikują produkcyjnej bazy danych
- Każdy test zaczyna się od czystego stanu

## Debugowanie testów

### Wyświetl output z testów:
```bash
pytest -s tests/test_auth.py
```

### Uruchom tylko nieudane testy z ostatniego uruchomienia:
```bash
pytest --lf
```

### Uruchom testy w trybie debugowania:
```bash
pytest --pdb
```

## Wymagania

- Python 3.8+
- pytest 7.4.3+
- pytest-flask 1.3.0+
- pytest-cov 4.1.0+
- Wszystkie zależności z `requirements.txt`

## Rozszerzanie testów

Aby dodać nowe testy:

1. Utwórz nowy plik `test_*.py` w folderze `tests/`
2. Zaimportuj potrzebne fixtures z `conftest.py`
3. Utwórz klasę testową (opcjonalnie)
4. Napisz funkcje testowe zaczynające się od `test_`

Przykład:

```python
import json

class TestMyEndpoints:
    def test_my_endpoint(self, client, auth_headers_admin):
        response = client.get('/api/MyEndpoint/', headers=auth_headers_admin)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
```

## Continuous Integration

Testy można łatwo zintegrować z CI/CD:

```yaml
# Przykład dla GitHub Actions
- name: Run tests
  run: |
    pip install -r requirements.txt
    pip install -r requirements-test.txt
    pytest --cov=app --cov-report=xml
```

## Problemy i rozwiązania

### Problem: `ModuleNotFoundError: No module named 'app'`
**Rozwiązanie**: Uruchom testy z głównego katalogu projektu:
```bash
cd backend-python
pytest
```

### Problem: Testy nie znajdują bazy danych
**Rozwiązanie**: Testy używają bazy w pamięci, nie wymagają konfiguracji MySQL.

### Problem: Token JWT wygasł
**Rozwiązanie**: Fixtures generują nowe tokeny przy każdym uruchomieniu testów.

## Kontakt

W razie pytań lub problemów, sprawdź dokumentację pytest: https://docs.pytest.org/
