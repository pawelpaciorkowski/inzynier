# CRM Backend w Python

Backend API dla systemu CRM napisany w Python przy użyciu Flask.

## Szybki start

### 1. Instalacja zależności

```bash
# Utwórz środowisko wirtualne
python -m venv venv

# Aktywuj środowisko wirtualne
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Zainstaluj zależności
pip install -r requirements.txt
```

### 2. Konfiguracja bazy danych

**WAŻNE:** W katalogu `backend-python/` znajduje się gotowy dump bazy danych (`crm_project_dump.sql`), który zawiera pełną strukturę bazy wraz z przykładowymi danymi, widokami, procedurami i funkcjami. **Zalecane jest użycie tego dumpu** zamiast tworzenia pustej bazy.

#### Opcja A: Przywrócenie bazy z gotowego dumpu (ZALECANE)

1. **Zainstaluj MySQL/MariaDB** (jeśli nie masz)

2. **Utwórz pustą bazę danych**:
```sql
CREATE DATABASE crm_project;
```

3. **Przywróć bazę z dumpu**:
```bash
mysql -u root -p -h 127.0.0.1 crm_project < crm_project_dump.sql
```

> **Uwaga:** Jeśli masz problem z socketem MySQL, użyj `-h 127.0.0.1` aby połączyć się przez TCP/IP zamiast socketu.

4. **Skonfiguruj połączenie** w pliku `app/config.py`:
```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://TWÓJ_UŻYTKOWNIK:TWOJE_HASŁO@localhost:3306/crm_project'
```

Przykład:
```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:mojehaslo@localhost:3306/crm_project'
```

#### Opcja B: Utworzenie pustej bazy danych (jeśli nie chcesz używać dumpu)

1. **Zainstaluj MySQL/MariaDB** (jeśli nie masz)

2. **Utwórz bazę danych**:
```sql
CREATE DATABASE crm_project;
```

3. **Skonfiguruj połączenie** w pliku `app/config.py`:
```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://TWÓJ_UŻYTKOWNIK:TWOJE_HASŁO@localhost:3306/crm_project'
```

Przykład:
```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:mojehaslo@localhost:3306/crm_project'
```

4. **Zainstaluj rozszerzenia bazy danych** (widoki, procedury, funkcje, indeksy):
```bash
mysql -u root -p -h 127.0.0.1 crm_project < database_enhancements.sql
```

### 3. Uruchomienie

```bash
python app.py
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5000`

## Dostępne endpointy

### Autoryzacja (`/api/Auth`)
- `POST /api/Auth/login` - logowanie
- `POST /api/Auth/register` - rejestracja
- `PUT /api/Auth/profile` - aktualizacja profilu
- `PUT /api/Auth/change-password` - zmiana hasła
- `DELETE /api/Auth/delete-account` - usunięcie konta

### Klienci (`/api/Customers`)
- `GET /api/Customers` - lista klientów
- `GET /api/Customers/{id}` - szczegóły klienta
- `POST /api/Customers` - utwórz klienta
- `PUT /api/Customers/{id}` - aktualizuj klienta
- `DELETE /api/Customers/{id}` - usuń klienta

### Faktury (`/api/Invoices`)
- `GET /api/Invoices` - lista faktur
- `GET /api/Invoices/{id}` - szczegóły faktury
- `POST /api/Invoices` - utwórz fakturę
- `PUT /api/Invoices/{id}` - aktualizuj fakturę
- `DELETE /api/Invoices/{id}` - usuń fakturę
- `GET /api/Invoices/{id}/pdf` - generuj PDF faktury

### Kontrakty (`/api/Contracts`)
- `GET /api/Contracts` - lista kontraktów
- `GET /api/Contracts/{id}` - szczegóły kontraktu
- `POST /api/Contracts` - utwórz kontrakt
- `PUT /api/Contracts/{id}` - aktualizuj kontrakt
- `DELETE /api/Contracts/{id}` - usuń kontrakt
- `GET /api/Contracts/{id}/generate-document` - generuj dokument
- `POST /api/Contracts/{id}/generate-from-template` - generuj z szablonu

### Przypomnienia (`/api/Reminders`)
- `GET /api/Reminders` - lista przypomnień
- `GET /api/Reminders/{id}` - szczegóły przypomnienia
- `POST /api/Reminders` - utwórz przypomnienie
- `PUT /api/Reminders/{id}` - aktualizuj przypomnienie
- `DELETE /api/Reminders/{id}` - usuń przypomnienie

### Zadania (`/api/user/tasks`)
- `GET /api/user/tasks` - lista zadań użytkownika
- `GET /api/user/tasks/{id}` - szczegóły zadania
- `POST /api/user/tasks` - utwórz zadanie
- `PUT /api/user/tasks/{id}` - aktualizuj zadanie
- `DELETE /api/user/tasks/{id}` - usuń zadanie

### Raporty (`/api/reports`)
- `GET /api/reports/export-customers` - eksport klientów (CSV/Excel/PDF)
- `GET /api/reports/export-invoices` - eksport faktur (CSV/Excel/PDF)
- `GET /api/reports/export-contracts` - eksport kontraktów (CSV/Excel/PDF)
- `GET /api/reports/export-tasks` - eksport zadań (CSV/Excel/PDF)
- `GET /api/reports/export-meetings` - eksport spotkań (CSV/Excel/PDF)
- `GET /api/reports/export-notes` - eksport notatek (CSV/Excel/PDF)
- `GET /api/reports/export-payments` - eksport płatności (CSV/Excel/PDF)
- `GET /api/reports/groups/{id}/pdf` - raport PDF grupy
- `GET /api/reports/tags/{id}/pdf` - raport PDF tagu

### Tagi (`/api/Tags`)
- `GET /api/Tags` - lista tagów
- `GET /api/Tags/{id}` - szczegóły tagu
- `POST /api/Tags` - utwórz tag
- `PUT /api/Tags/{id}` - aktualizuj tag
- `DELETE /api/Tags/{id}` - usuń tag

### Szablony (`/api/Templates`)
- `GET /api/Templates` - lista szablonów
- `GET /api/Templates/{id}` - szczegóły szablonu
- `POST /api/Templates` - utwórz szablon
- `PUT /api/Templates/{id}` - aktualizuj szablon
- `DELETE /api/Templates/{id}` - usuń szablon
- `GET /api/Templates/{id}/download` - pobierz szablon

### Płatności (`/api/Payments`)
- `GET /api/Payments` - lista płatności
- `GET /api/Payments/{id}` - szczegóły płatności
- `POST /api/Payments` - utwórz płatność
- `PUT /api/Payments/{id}` - aktualizuj płatność
- `DELETE /api/Payments/{id}` - usuń płatność

### Inne moduły
- Grupy (`/api/Groups`)
- Spotkania (`/api/Meetings`)
- Usługi (`/api/Services`)
- Notatki (`/api/Notes`)
- Wiadomości (`/api/Messages`)
- Powiadomienia (`/api/Notifications`)
- Aktywności (`/api/Activities`)
- Wydarzenia kalendarzowe (`/api/CalendarEvents`)
- Panel administracyjny (`/api/admin`)
- Profil (`/api/Profile`)
- Ustawienia (`/api/Settings`)
- Dashboard (`/api/dashboard`)
- Logi systemowe (`/api/Logs`)

## Tworzenie użytkownika administratora

Aby utworzyć użytkownika administratora, uruchom:

```bash
python create_admin.py
```

Domyślne dane logowania:
- **Username**: `admin`
- **Password**: `Diviruse007@`

## Struktura projektu

```
backend-python/
├── app/
│   ├── controllers/     # Kontrolery (endpointy API)
│   ├── models/         # Modele danych SQLAlchemy
│   ├── database/       # Konfiguracja bazy danych
│   ├── uploads/        # Przesłane pliki (szablony)
│   ├── config.py       # Konfiguracja aplikacji
│   ├── middleware.py   # Middleware autoryzacji
│   └── utils.py        # Funkcje pomocnicze
├── tests/              # Testy jednostkowe
├── app.py             # Główny plik aplikacji
├── create_admin.py    # Skrypt tworzenia administratora
└── requirements.txt   # Zależności Python
```

## Technologie

- **Flask** - framework webowy
- **SQLAlchemy** - ORM do bazy danych
- **PyJWT** - tokeny JWT do autoryzacji
- **bcrypt** - hashowanie haseł
- **PyMySQL** - sterownik MySQL
- **ReportLab** - generowanie raportów PDF
- **python-docx** - generowanie dokumentów Word

## Przykłady użycia

### Logowanie
```bash
curl -X POST http://localhost:5000/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Diviruse007@"}'
```

### Utworzenie przypomnienia
```bash
curl -X POST http://localhost:5000/api/Reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"note": "Zadzwoń do klienta", "remind_at": "2024-12-31T10:00:00Z"}'
```

## Funkcjonalności

- RESTful API z pełną obsługą CRUD
- Autoryzacja JWT z obsługą ról (Admin/User)
- Zarządzanie klientami, faktury, kontrakty, spotkania
- System zadań i przypomnień
- Generowanie raportów PDF
- Generowanie dokumentów Word z szablonów
- System tagów i grup
- Historia logowań i logi systemowe
- Powiadomienia i wiadomości
- Panel administracyjny

## Dump bazy danych

W katalogu `backend-python/` znajduje się gotowy dump bazy danych (`crm_project_dump.sql`), który zawiera:
- **30 tabel** z pełną strukturą i przykładowymi danymi
- **3 widoki** (v_customer_invoice_summary, v_invoice_details, v_group_statistics)
- **3 procedury składowane** (sp_create_invoice, sp_update_invoice_payment_status, sp_generate_sales_report)
- **3 funkcje** (fn_calculate_invoice_total, fn_format_date_polish, fn_is_invoice_overdue)
- **Wszystkie dane** potrzebne do testowania aplikacji

**Zalecane jest użycie tego dumpu** do inicjalizacji bazy danych, ponieważ zawiera kompletną strukturę wraz z przykładowymi danymi.

### Przywracanie bazy z dumpu

```bash
mysql -u root -p -h 127.0.0.1 crm_project < crm_project_dump.sql
```

> **Uwaga:** Jeśli masz problem z socketem MySQL, użyj `-h 127.0.0.1` aby połączyć się przez TCP/IP zamiast socketu.

## Rozszerzenia bazy danych

Jeśli tworzysz bazę od zera (bez użycia dumpu), aby spełnić wszystkie wymagania projektu, należy zainstalować widoki, procedury, funkcje i indeksy:

```bash
mysql -u root -p -h 127.0.0.1 crm_project < database_enhancements.sql
```

> **Uwaga:** Jeśli używasz gotowego dumpu (`crm_project_dump.sql`), rozszerzenia są już w nim zawarte i nie musisz uruchamiać tego skryptu.

## Backup bazy danych

### Tworzenie kopii zapasowej (dump)

**Windows:**
```bash
mysqldump -u TWÓJ_UŻYTKOWNIK -p crm_project > backup_crm_YYYY-MM-DD.sql
```

**Linux/Mac:**
```bash
mysqldump -u TWÓJ_UŻYTKOWNIK -p crm_project > backup_crm_$(date +%Y-%m-%d).sql
```

Przykład:
```bash
mysqldump -u root -p crm_project > backup_crm_2024-12-20.sql
```

### Przywracanie z kopii zapasowej

```bash
mysql -u TWÓJ_UŻYTKOWNIK -p crm_project < backup_crm_YYYY-MM-DD.sql
```

Przykład:
```bash
mysql -u root -p crm_project < backup_crm_2024-12-20.sql
```

> **Uwaga:** System automatycznie utworzy wszystkie potrzebne tabele przy pierwszym uruchomieniu (`python app.py`).
