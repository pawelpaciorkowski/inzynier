# Przewodnik Testowania - Aplikacja CRM Backend

Kompletny przewodnik po testowaniu backendu aplikacji CRM napisanej w Pythonie.

## 📋 Spis treści

1. [Szybki start](#szybki-start)
2. [Instalacja](#instalacja)
3. [Uruchamianie testów](#uruchamianie-testów)
4. [Struktura testów](#struktura-testów)
5. [Przykłady użycia](#przykłady-użycia)
6. [Rozwiązywanie problemów](#rozwiązywanie-problemów)

## 🚀 Szybki start

```bash
# 1. Przejdź do katalogu backend-python
cd backend-python

# 2. Zainstaluj zależności testowe
pip install -r requirements-test.txt

# 3. Uruchom testy
pytest

# LUB użyj skryptu pomocniczego
./run_tests.sh
```

## 📦 Instalacja

### Krok 1: Instalacja Pythona

Upewnij się, że masz zainstalowanego Pythona 3.8 lub nowszego:

```bash
python3 --version
```

### Krok 2: Instalacja zależności

```bash
# Podstawowe zależności aplikacji
pip install -r requirements.txt

# Zależności testowe
pip install -r requirements-test.txt
```

### Krok 3: Weryfikacja instalacji

```bash
pytest --version
```

Powinieneś zobaczyć wersję pytest (7.4.3 lub nowszą).

## 🧪 Uruchamianie testów

### Podstawowe komendy

```bash
# Uruchom wszystkie testy
pytest

# Uruchom z szczegółowym outputem
pytest -v

# Uruchom konkretny plik testowy
pytest tests/test_auth.py

# Uruchom konkretny test
pytest tests/test_auth.py::TestAuthEndpoints::test_login_success

# Uruchom testy i zatrzymaj na pierwszym błędzie
pytest -x

# Uruchom testy i wyświetl print statements
pytest -s
```

### Użycie skryptu run_tests.sh

Stworzyłem wygodny skrypt do uruchamiania testów:

```bash
# Wszystkie testy
./run_tests.sh all

# Tylko testy autoryzacji
./run_tests.sh auth

# Tylko testy klientów
./run_tests.sh customers

# Tylko testy faktur
./run_tests.sh invoices

# Pozostałe endpointy
./run_tests.sh other

# Zaawansowane testy
./run_tests.sh advanced

# Testy z pokryciem kodu
./run_tests.sh coverage

# Szybkie testy (bez advanced)
./run_tests.sh quick

# Ponownie tylko nieudane testy
./run_tests.sh failed

# Pomoc
./run_tests.sh help
```

### Testy z pokryciem kodu (coverage)

```bash
# Wygeneruj raport pokrycia
pytest --cov=app --cov-report=html

# Otwórz raport w przeglądarce
firefox htmlcov/index.html
# lub
google-chrome htmlcov/index.html
```

## 📁 Struktura testów

```
backend-python/
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Fixtures i konfiguracja
│   ├── test_auth.py                # Testy autoryzacji
│   ├── test_customers.py           # Testy klientów
│   ├── test_invoices.py            # Testy faktur
│   ├── test_other_endpoints.py     # Pozostałe endpointy
│   ├── test_example_advanced.py    # Zaawansowane testy
│   └── README.md                   # Dokumentacja testów
├── pytest.ini                      # Konfiguracja pytest
├── run_tests.sh                    # Skrypt do uruchamiania testów
├── requirements-test.txt           # Zależności testowe
└── TESTING_GUIDE.md               # Ten plik
```

## 📚 Co testujemy?

### ✅ Testy autoryzacji (test_auth.py)
- Logowanie użytkownika
- Rejestracja nowego użytkownika
- Aktualizacja profilu
- Zmiana hasła
- Usunięcie konta
- Obsługa nieprawidłowych danych logowania

### ✅ Testy klientów (test_customers.py)
- Pobieranie listy klientów
- Tworzenie nowego klienta
- Pobieranie szczegółów klienta
- Aktualizacja danych klienta
- Usuwanie klienta
- Obsługa błędów (nieistniejący klient, brak autoryzacji)

### ✅ Testy faktur (test_invoices.py)
- Pobieranie listy faktur
- Tworzenie nowej faktury
- Pobieranie szczegółów faktury
- Aktualizacja faktury
- Usuwanie faktury
- Generowanie PDF faktury

### ✅ Testy pozostałych endpointów (test_other_endpoints.py)
- Groups (grupy)
- Services (usługi)
- Contracts (umowy)
- Notes (notatki)
- Messages (wiadomości)
- Tags (tagi)
- Notifications (powiadomienia)
- Activities (aktywności)
- Dashboard (pulpit)
- Profile (profil)
- Settings (ustawienia)
- Reminders (przypomnienia)
- Payments (płatności)
- Meetings (spotkania)
- Calendar Events (wydarzenia kalendarzowe)
- Templates (szablony)
- Logs (logi)
- Reports (raporty)

### ✅ Zaawansowane testy (test_example_advanced.py)
- Walidacja struktury odpowiedzi
- Paginacja, filtrowanie, sortowanie
- Obsługa błędów
- Równoczesne żądania
- Obsługa dużych danych
- Znaki specjalne
- Ochrona przed SQL Injection
- Ochrona przed XSS
- Rate limiting
- Walidacja Content-Type
- Testy wydajnościowe
- Walidacja danych (email, wymagane pola)

## 💡 Przykłady użycia

### Przykład 1: Uruchom wszystkie podstawowe testy

```bash
pytest tests/test_auth.py tests/test_customers.py tests/test_invoices.py -v
```

### Przykład 2: Uruchom tylko testy logowania

```bash
pytest tests/test_auth.py::TestAuthEndpoints::test_login_success -v
```

### Przykład 3: Uruchom testy z raportowaniem

```bash
pytest --tb=short --no-header -q
```

### Przykład 4: Uruchom testy w trybie debugowania

```bash
pytest --pdb tests/test_auth.py
```

### Przykład 5: Wygeneruj raport XML (do CI/CD)

```bash
pytest --junitxml=test-results.xml
```

## 🔧 Rozwiązywanie problemów

### Problem: ModuleNotFoundError: No module named 'app'

**Rozwiązanie:**
Upewnij się, że uruchamiasz testy z głównego katalogu projektu:

```bash
cd backend-python
pytest
```

### Problem: ModuleNotFoundError: No module named 'pytest'

**Rozwiązanie:**
Zainstaluj zależności testowe:

```bash
pip install -r requirements-test.txt
```

### Problem: Testy nie znajdują bazy danych MySQL

**Rozwiązanie:**
Testy używają bazy danych SQLite w pamięci (`:memory:`), nie wymagają MySQL.
Sprawdź czy `conftest.py` jest w folderze `tests/`.

### Problem: Token JWT wygasł

**Rozwiązanie:**
Fixtures generują nowe tokeny przy każdym uruchomieniu testów, więc to nie powinien być problem.
Jeśli występuje, sprawdź czy `JWT_SECRET_KEY` jest prawidłowo skonfigurowany w `app/config.py`.

### Problem: Import Error przy uruchamianiu testów

**Rozwiązanie:**
Upewnij się, że wszystkie zależności są zainstalowane:

```bash
pip install -r requirements.txt
pip install -r requirements-test.txt
```

### Problem: Testy przechodzą lokalnie, ale nie w CI/CD

**Rozwiązanie:**
Sprawdź czy w CI/CD:
- Zainstalowane są wszystkie zależności
- Używana jest prawidłowa wersja Pythona (3.8+)
- Zmienne środowiskowe są prawidłowo ustawione

### Problem: Testy są wolne

**Rozwiązanie:**
Użyj pytest-xdist do równoległego uruchamiania testów:

```bash
pip install pytest-xdist
pytest -n auto
```

## 📊 Interpretacja wyników

### Sukces ✅

```
================================ test session starts =================================
collected 50 items

tests/test_auth.py::TestAuthEndpoints::test_login_success PASSED             [ 2%]
tests/test_auth.py::TestAuthEndpoints::test_register_success PASSED          [ 4%]
...
================================ 50 passed in 5.23s ==================================
```

### Porażka ❌

```
================================ test session starts =================================
collected 50 items

tests/test_auth.py::TestAuthEndpoints::test_login_success FAILED             [ 2%]

==================================== FAILURES ========================================
_________________________ TestAuthEndpoints.test_login_success ______________________

    def test_login_success(self, client):
>       assert response.status_code == 200
E       assert 401 == 200

tests/test_auth.py:25: AssertionError
================================ 1 failed, 49 passed in 5.23s =========================
```

### Pominięte testy ⚠️

```
tests/test_auth.py::TestAuthEndpoints::test_future_feature SKIPPED           [100%]
```

## 🎯 Najlepsze praktyki

1. **Uruchamiaj testy często** - po każdej zmianie w kodzie
2. **Pisz testy przed fixami** - dla każdego buga napisz test, który go wykrywa
3. **Utrzymuj testy proste** - jeden test powinien testować jedną rzecz
4. **Używaj fixtures** - dla powtarzających się danych testowych
5. **Dokumentuj testy** - opisz co test sprawdza
6. **Sprawdzaj pokrycie kodu** - staraj się utrzymać >80% pokrycia

## 🔄 Integracja z CI/CD

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          cd backend-python
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      - name: Run tests
        run: |
          cd backend-python
          pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## 📝 Zgłaszanie problemów

Jeśli znajdziesz błąd w testach lub masz sugestie:

1. Sprawdź czy problem nie został już zgłoszony
2. Przygotuj minimalny przykład reprodukujący problem
3. Dołącz wersję Pythona i pytest
4. Opisz oczekiwane i rzeczywiste zachowanie

## 🎓 Dodatkowe zasoby

- [Dokumentacja pytest](https://docs.pytest.org/)
- [Dokumentacja Flask Testing](https://flask.palletsprojects.com/en/2.3.x/testing/)
- [Python Testing Best Practices](https://realpython.com/python-testing/)

## 📞 Wsparcie

Jeśli masz pytania lub potrzebujesz pomocy:

- Sprawdź dokumentację testów w `tests/README.md`
- Zobacz przykłady w `tests/test_example_advanced.py`
- Przeczytaj ten przewodnik jeszcze raz

---

**Powodzenia w testowaniu! 🚀**
