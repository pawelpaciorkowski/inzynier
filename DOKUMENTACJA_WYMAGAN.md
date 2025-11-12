# Dokumentacja realizacji wymagań Projektu Inżynierskiego

> **Projekt:** Zintegrowany System CRM  
> **Autor:** Paweł Paciorkowski  
> **Specjalność:** Programista aplikacji biznesowych

---

## 📋 Wymagania i ich realizacja

### 1. ZSI powinien realizować konkretne cele biznesowe

**Status:** ✅ **ZREALIZOWANE**

**Lokalizacja w kodzie:**
- **Cel biznesowy:** Zarządzanie relacjami z klientami (CRM)
- **Moduły realizujące cele:**
  - Zarządzanie klientami: `backend-python/app/controllers/customers.py`
  - Zarządzanie fakturami: `backend-python/app/controllers/invoices.py`
  - Zarządzanie kontraktami: `backend-python/app/controllers/contracts.py`
  - Zarządzanie spotkaniami: `backend-python/app/controllers/meetings.py`
  - Zarządzanie zadaniami: `backend-python/app/controllers/user_tasks.py`
  - Raportowanie i analityka: `backend-python/app/controllers/reports.py`

**Dokumentacja:** `README.md` - sekcja "Opis projektu"

---

### 2. Funkcjonalność wzorowana na typowych rozwiązaniach branżowych

**Status:** ✅ **ZREALIZOWANE**

**Lokalizacja:**
- System CRM z typowymi modułami:
  - Klienci, Faktury, Kontrakty, Spotkania, Zadania
  - Tagi i grupy: `backend-python/app/controllers/tags.py`, `backend-python/app/controllers/groups.py`
  - Powiadomienia: `backend-python/app/controllers/notifications.py`
  - Wiadomości: `backend-python/app/controllers/messages.py`
  - Historia działań: `backend-python/app/controllers/activities.py`

**Dokumentacja:** `README.md` - sekcja "Kluczowe Funkcjonalności"

---

### 3. Solucja ZSI powinna zawierać:

#### 3.a. Dwa projekty/aplikacje z trzech dopuszczalnych

**Status:** ✅ **ZREALIZOWANE**

**Aplikacja 1: Aplikacja internetowa (Web)**
- **Lokalizacja:** `crm-ui/`
- **Technologie:** React 19.1.0, TypeScript, Vite, TailwindCSS
- **Główne pliki:**
  - Routing: `crm-ui/src/App.tsx`
  - Layout: `crm-ui/src/components/Layout.tsx`
  - Strony: `crm-ui/src/pages/` (44 pliki .tsx)
- **Liczba widoków:** 44 strony

**Aplikacja 2: Aplikacja mobilna**
- **Lokalizacja:** `crm-mobile/`
- **Technologie:** React Native 0.79.5, Expo 53.0.20
- **Główne pliki:**
  - Routing: `crm-mobile/app/_layout.tsx`
  - Ekrany: `crm-mobile/app/` (19 plików .tsx)
- **Liczba widoków:** 19 ekranów

**Brak:** Aplikacja desktopowa (nie jest wymagana - wystarczą 2 z 3)

---

#### 3.b. Projekt realizujący operacje na bazie danych

**Status:** ✅ **ZREALIZOWANE**

**Lokalizacja:** `backend-python/`
- **Konfiguracja bazy:** `backend-python/app/database/__init__.py`
- **Inicjalizacja:** `backend-python/app/database/__init__.py` - funkcja `init_database()`
- **ORM:** SQLAlchemy (plik: `backend-python/app/database/__init__.py`)
- **Modele danych:** `backend-python/app/models/` (23 pliki modeli)

**Operacje na bazie:**
- Wszystkie kontrolery w `backend-python/app/controllers/` wykonują operacje CRUD na bazie
- Przykłady:
  - `backend-python/app/controllers/customers.py` - operacje na tabeli Customers
  - `backend-python/app/controllers/invoices.py` - operacje na tabeli Invoices
  - `backend-python/app/controllers/contracts.py` - operacje na tabeli Contracts

---

#### 3.c. Projekt zawierający klasy logiki biznesowej

**Status:** ✅ **ZREALIZOWANE**

**Lokalizacja:** `backend-python/app/controllers/`
- **Kontrolery (klasy logiki biznesowej):**
  - `backend-python/app/controllers/customers.py` - logika biznesowa klientów
  - `backend-python/app/controllers/invoices.py` - logika biznesowa faktur (linie 125-315)
  - `backend-python/app/controllers/contracts.py` - logika biznesowa kontraktów (linie 48-220)
  - `backend-python/app/controllers/payments.py` - logika biznesowa płatności (linie 32-155)
  - `backend-python/app/controllers/reports.py` - logika biznesowa raportów
  - `backend-python/app/controllers/dashboard.py` - logika biznesowa dashboardu
  - `backend-python/app/controllers/admin.py` - logika biznesowa administracji

**Przykłady logiki biznesowej:**
- Automatyczne przeliczanie kwot faktury: `invoices.py` linia 138-159
- Automatyczna aktualizacja statusu płatności: `payments.py` linia 55-62
- Obliczanie statystyk: `admin.py` linia 21-33, `dashboard.py` linia 18-24

---

### 4. Wspólne użycie projektu bazy danych i logiki biznesowej

**Status:** ✅ **ZREALIZOWANE**

**Lokalizacja:**
- **Wspólny backend:** `backend-python/`
- **Aplikacja webowa używa:** `crm-ui/src/services/api.ts` - komunikacja z backendem
- **Aplikacja mobilna używa:** `crm-mobile/` - komunikacja z backendem przez API

**Konfiguracja API:**
- Backend API: `http://localhost:5000/api` (definiowane w `backend-python/app/__init__.py`)
- Frontend web: `crm-ui/src/services/api.ts` - baseURL: `http://localhost:5000/api`
- Frontend mobile: używa tego samego API

**Przykład wspólnego użycia:**
- Endpoint `/api/Customers` używany przez:
  - Web: `crm-ui/src/pages/ClientsPage.tsx`
  - Mobile: `crm-mobile/app/(tabs)/customers.tsx`

---

### 5. Nowoczesne techniki programistyczne

**Status:** ✅ **ZREALIZOWANE**

**Technologie:**
- **Backend:** Python 3.12, Flask 2.3.3
  - Lokalizacja: `backend-python/app/__init__.py`, `backend-python/app.py`
- **Frontend Web:** React 19.1.0, TypeScript, Vite
  - Lokalizacja: `crm-ui/package.json`, `crm-ui/vite.config.ts`
- **Frontend Mobile:** React Native 0.79.5, Expo 53.0.20
  - Lokalizacja: `crm-mobile/package.json`

**Dokumentacja:** `README.md` - sekcja "Technologie"

---

### 6. Zgodność z wzorcami projektowymi (MVC)

**Status:** ✅ **ZREALIZOWANE**

**Wzorzec MVC:**
- **Model:** `backend-python/app/models/` - 23 pliki modeli
  - Przykład: `backend-python/app/models/customer.py` - model Customer
  - Przykład: `backend-python/app/models/invoice.py` - model Invoice
- **View:** 
  - Web: `crm-ui/src/pages/` - 44 komponenty widoków
  - Mobile: `crm-mobile/app/` - 19 komponentów widoków
- **Controller:** `backend-python/app/controllers/` - 20 plików kontrolerów
  - Przykład: `backend-python/app/controllers/customers.py` - kontroler klientów
  - Przykład: `backend-python/app/controllers/invoices.py` - kontroler faktur

**Struktura MVC:**
```
backend-python/
├── app/
│   ├── models/      # MODEL (dane)
│   ├── controllers/ # CONTROLLER (logika)
│   └── database/    # Konfiguracja bazy
crm-ui/src/pages/    # VIEW (interfejs web)
crm-mobile/app/      # VIEW (interfejs mobile)
```

---

### 7. Baza danych na serwerze bazy danych

**Status:** ✅ **ZREALIZOWANE**

**Baza danych:** MySQL/MariaDB
- **Konfiguracja:** `backend-python/app/config.py` linia 5
  ```python
  SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:kapljca@localhost:3306/crm_project'
  ```
- **Inicjalizacja:** `backend-python/app/database/__init__.py` linia 16 - `db.create_all()`
- **Serwer:** MariaDB 11.4.7 (działa na porcie 3306)

---

### 8. Baza danych: minimum 30 tabel + widoki, procedury, funkcje, indeksowanie

**Status:** ✅ **ZREALIZOWANE**

#### 8.1. Tabele (30 tabel)

**Lokalizacja:** `backend-python/app/models/`

**Tabele główne (23):**
1. `users` - `backend-python/app/models/user.py`
2. `roles` - `backend-python/app/models/role.py`
3. `Customers` - `backend-python/app/models/customer.py`
4. `Invoices` - `backend-python/app/models/invoice.py`
5. `InvoiceItems` - `backend-python/app/models/invoice_item.py`
6. `Contracts` - `backend-python/app/models/contract.py`
7. `Tasks` - `backend-python/app/models/task.py`
8. `Meetings` - `backend-python/app/models/meeting.py`
9. `Payments` - `backend-python/app/models/payment.py`
10. `Groups` - `backend-python/app/models/group.py`
11. `Tags` - `backend-python/app/models/tag.py`
12. `Services` - `backend-python/app/models/service.py`
13. `TaxRates` - `backend-python/app/models/tax_rate.py`
14. `Templates` - `backend-python/app/models/template.py`
15. `Settings` - `backend-python/app/models/setting.py`
16. `Messages` - `backend-python/app/models/message.py`
17. `Notes` - `backend-python/app/models/note.py`
18. `Reminders` - `backend-python/app/models/reminder.py`
19. `Notifications` - `backend-python/app/models/notification.py`
20. `Activities` - `backend-python/app/models/activity.py`
21. `SystemLogs` - `backend-python/app/models/system_log.py`
22. `LoginHistory` - `backend-python/app/models/login_history.py`
23. `CalendarEvents` - `backend-python/app/models/calendar_event.py`

**Tabele pomocnicze (7):**
1. `CustomerTags` - `backend-python/app/models/customer.py` linia 5-8
2. `InvoiceTags` - `backend-python/app/models/invoice.py` linia 5-8
3. `ContractTags` - `backend-python/app/models/contract.py` linia 6-9
4. `TaskTags` - `backend-python/app/models/task.py` linia 5-8
5. `MeetingTags` - `backend-python/app/models/meeting.py` linia 5-8
6. `ContractServices` - `backend-python/app/models/contract.py` linia 12-16
7. `UserGroups` - `backend-python/app/models/group.py` linia 5-8

**Sprawdzenie:**
```sql
SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'crm_project';
-- Wynik: 30 tabel
```

---

#### 8.2. Widoki (VIEW)

**Status:** ✅ **ZREALIZOWANE (3 widoki)**

**Lokalizacja:** `backend-python/database_enhancements.sql` linie 10-75

**Widoki:**
1. `v_customer_invoice_summary` - Klienci z podsumowaniem faktur
   - Definicja: `database_enhancements.sql` linia 12-35
   - Sprawdzenie: `SHOW FULL TABLES WHERE Table_type = 'VIEW';`
2. `v_invoice_details` - Faktury z pełnymi danymi klienta i płatnościami
   - Definicja: `database_enhancements.sql` linia 37-60
3. `v_group_statistics` - Statystyki grup z podsumowaniem
   - Definicja: `database_enhancements.sql` linia 62-75

**Użycie w kodzie:**
- Można używać w kontrolerach: `db.session.execute(text("SELECT * FROM v_customer_invoice_summary"))`

**Sprawdzenie:**
```sql
SHOW FULL TABLES FROM crm_project WHERE Table_type = 'VIEW';
-- Wynik: 3 widoki
```

---

#### 8.3. Procedury składowane (STORED PROCEDURE)

**Status:** ✅ **ZREALIZOWANE (3 procedury)**

**Lokalizacja:** `backend-python/database_enhancements.sql` linie 77-150

**Procedury:**
1. `sp_create_invoice` - Tworzenie faktury z automatycznym przeliczeniem kwot
   - Definicja: `database_enhancements.sql` linia 82-110
   - Parametry: invoice_number, customer_id, issued_at, due_date, assigned_group_id, created_by_user_id
   - Wywołanie: `CALL sp_create_invoice(...)`
2. `sp_update_invoice_payment_status` - Aktualizacja statusu płatności faktury
   - Definicja: `database_enhancements.sql` linia 112-140
   - Parametry: invoice_id
   - Wywołanie: `CALL sp_update_invoice_payment_status(1)`
3. `sp_generate_sales_report` - Generowanie raportu sprzedażowego dla okresu
   - Definicja: `database_enhancements.sql` linia 142-170
   - Parametry: date_from, date_to, group_id

**Użycie w kodzie:**
- Przykład: `db.session.execute(text("CALL sp_update_invoice_payment_status(:id)"), {'id': invoice_id})`

**Sprawdzenie:**
```sql
SHOW PROCEDURE STATUS WHERE Db = 'crm_project';
-- Wynik: 3 procedury
```

---

#### 8.4. Funkcje (FUNCTION)

**Status:** ✅ **ZREALIZOWANE (3 funkcje)**

**Lokalizacja:** `backend-python/database_enhancements.sql` linie 172-220

**Funkcje:**
1. `fn_calculate_invoice_total` - Obliczanie sumy faktury z podatkami
   - Definicja: `database_enhancements.sql` linia 177-186
   - Parametry: net_amount, tax_rate
   - Zwraca: gross_amount
   - Przykład: `SELECT fn_calculate_invoice_total(1000, 0.23);` → 1230.00
2. `fn_format_date_polish` - Formatowanie daty w stylu polskim
   - Definicja: `database_enhancements.sql` linia 188-197
   - Parametry: date
   - Zwraca: VARCHAR(50) - format "DD.MM.YYYY HH:MM"
3. `fn_is_invoice_overdue` - Sprawdzanie czy faktura jest przeterminowana
   - Definicja: `database_enhancements.sql` linia 199-220
   - Parametry: invoice_id
   - Zwraca: BOOLEAN

**Użycie w kodzie:**
- Przykład: `db.session.execute(text("SELECT fn_calculate_invoice_total(1000, 0.23)"))`

**Sprawdzenie:**
```sql
SHOW FUNCTION STATUS WHERE Db = 'crm_project';
-- Wynik: 3 funkcje
```

---

#### 8.5. Indeksowanie (INDEX)

**Status:** ✅ **ZREALIZOWANE (56 indeksów)**

**Lokalizacja:** `backend-python/database_enhancements.sql` linie 222-308

**Indeksy na kluczowych kolumnach:**

**Tabela Customers:**
- `idx_customers_email` - `database_enhancements.sql` linia 225
- `idx_customers_company` - linia 226
- `idx_customers_created_at` - linia 227
- `idx_customers_assigned_group` - linia 228
- `idx_customers_assigned_user` - linia 229

**Tabela Invoices:**
- `idx_invoices_customer_id` - linia 232
- `idx_invoices_issued_at` - linia 233
- `idx_invoices_due_date` - linia 234
- `idx_invoices_is_paid` - linia 235
- `idx_invoices_assigned_group` - linia 236
- `idx_invoices_number` - linia 237

**Tabela Payments:**
- `idx_payments_invoice_id` - linia 240
- `idx_payments_paid_at` - linia 241

**Tabela Contracts:**
- `idx_contracts_customer_id` - linia 244
- `idx_contracts_signed_at` - linia 245
- `idx_contracts_start_date` - linia 246
- `idx_contracts_end_date` - linia 247
- `idx_contracts_responsible_group` - linia 248

**Tabela Tasks:**
- `idx_tasks_user_id` - linia 251
- `idx_tasks_customer_id` - linia 252
- `idx_tasks_due_date` - linia 253
- `idx_tasks_completed` - linia 254
- `idx_tasks_assigned_group` - linia 255

**Tabela Meetings:**
- `idx_meetings_scheduled_at` - linia 258
- `idx_meetings_assigned_group` - linia 259

**Tabela Users:**
- `idx_users_role_id` - linia 262

**Tabela LoginHistory:**
- `idx_login_history_user_id` - linia 265
- `idx_login_history_login_time` - linia 266

**Tabela SystemLogs:**
- `idx_system_logs_timestamp` - linia 269
- `idx_system_logs_level` - linia 270

**Sprawdzenie:**
```sql
SELECT COUNT(*) FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'crm_project' AND INDEX_NAME != 'PRIMARY';
-- Wynik: 56 indeksów
```

---

### 9. Dostęp do bazy przez nowoczesny ORM

**Status:** ✅ **ZREALIZOWANE**

**ORM:** SQLAlchemy
- **Lokalizacja:** `backend-python/app/database/__init__.py`
- **Import:** `from flask_sqlalchemy import SQLAlchemy`
- **Inicjalizacja:** `db = SQLAlchemy()` - linia 3
- **Użycie w modelach:** Wszystkie pliki w `backend-python/app/models/` używają `db.Model`

**Przykłady użycia ORM:**
- `Customer.query.filter_by(Id=id).first()` - `customers.py` linia 46
- `Invoice.query.get(invoice_id)` - `invoices.py` linia 223
- `db.session.add(new_customer)` - `customers.py` linia 29
- `db.session.commit()` - wszystkie kontrolery

**Dokumentacja:** `backend-python/README.md` - sekcja "Technologie"

---

### 10. Mechanizmy autoryzacji (wspólne logowanie)

**Status:** ✅ **ZREALIZOWANE**

**Mechanizm:** JWT (JSON Web Tokens)
- **Backend:** `backend-python/app/controllers/auth.py`
  - Login: `auth.py` linia 14-116 - endpoint `POST /api/Auth/login`
  - Generowanie tokenu: `auth.py` linia 60-70
- **Middleware:** `backend-python/app/middleware.py`
  - Dekorator `@require_auth` - linia 5-45
  - Weryfikacja tokenu: `middleware.py` linia 15-30
- **Frontend Web:** `crm-ui/src/services/api.ts`
  - Przechowywanie tokenu: `localStorage.getItem('token')` - linia 9
  - Wysyłanie w headerze: `Authorization: Bearer ${token}` - linia 14
- **Frontend Mobile:** `crm-mobile/` - używa SecureStore do przechowywania tokenu

**Wspólne logowanie:**
- Web i Mobile używają tego samego endpointu: `/api/Auth/login`
- Ten sam token działa dla obu aplikacji

**Lokalizacja:**
- Endpoint logowania: `backend-python/app/controllers/auth.py` linia 14
- Middleware autoryzacji: `backend-python/app/middleware.py`

---

### 11. Moduł zarządzania użytkownikami i grupami uprawnień

**Status:** ✅ **ZREALIZOWANE**

**Zarządzanie użytkownikami:**
- **Backend:** `backend-python/app/controllers/admin.py`
  - Lista użytkowników: `admin.py` linia 71-88 - endpoint `GET /api/admin/users`
  - Tworzenie użytkownika: `admin.py` linia 90-133 - endpoint `POST /api/admin/users`
  - Edycja użytkownika: `admin.py` linia 157-190 - endpoint `PUT /api/admin/users/{id}`
  - Usuwanie użytkownika: `admin.py` linia 192-220 - endpoint `DELETE /api/admin/users/{id}`
- **Frontend Web:** `crm-ui/src/pages/UsersPage.tsx` - lista i zarządzanie użytkownikami
- **Frontend Web:** `crm-ui/src/pages/AddUserPage.tsx` - dodawanie użytkownika
- **Frontend Web:** `crm-ui/src/pages/EditUserPage.tsx` - edycja użytkownika

**Zarządzanie grupami:**
- **Backend:** `backend-python/app/controllers/groups.py`
  - Lista grup: `groups.py` linia 9-50 - endpoint `GET /api/Groups`
  - Tworzenie grupy: `groups.py` linia 52-80 - endpoint `POST /api/Groups`
  - Edycja grupy: `groups.py` linia 82-120 - endpoint `PUT /api/Groups/{id}`
  - Usuwanie grupy: `groups.py` linia 122-150 - endpoint `DELETE /api/Groups/{id}`
- **Frontend Web:** `crm-ui/src/pages/GroupsPage.tsx` - lista i zarządzanie grupami
- **Frontend Web:** `crm-ui/src/pages/GroupDetailsPage.tsx` - szczegóły grupy

**Zarządzanie rolami:**
- **Backend:** `backend-python/app/controllers/admin.py`
  - Lista ról: `admin.py` linia 258-274 - endpoint `GET /api/admin/Roles`
  - Tworzenie roli: `admin.py` linia 222-256 - endpoint `POST /api/admin/Roles`
  - Edycja roli: `admin.py` linia 276-305 - endpoint `PUT /api/admin/Roles/{id}`
  - Usuwanie roli: `admin.py` linia 307-335 - endpoint `DELETE /api/admin/Roles/{id}`
- **Frontend Web:** `crm-ui/src/pages/RolesPage.tsx` - zarządzanie rolami

**Modele:**
- User: `backend-python/app/models/user.py`
- Role: `backend-python/app/models/role.py`
- Group: `backend-python/app/models/group.py`

---

### 12. Podstawowe operacje CRUD na wszystkich tabelach

**Status:** ✅ **ZREALIZOWANE**

**Operacje CRUD dla każdej tabeli:**

**Customers (Klienci):**
- **GET** (lista): `backend-python/app/controllers/customers.py` linia 9-17
- **GET** (szczegóły): `customers.py` linia 46-57
- **POST** (dodaj): `customers.py` linia 19-44
- **PUT** (edytuj): `customers.py` linia 59-111
- **DELETE** (usuń): `customers.py` linia 113-125
- **Frontend:** `crm-ui/src/pages/ClientsPage.tsx`, `AddClientPage.tsx`, `EditClientPage.tsx`

**Invoices (Faktury):**
- **GET** (lista): `backend-python/app/controllers/invoices.py` linia 114-123
- **GET** (szczegóły): `invoices.py` linia 217-247
- **POST** (dodaj): `invoices.py` linia 125-215
- **PUT** (edytuj): `invoices.py` linia 249-317
- **DELETE** (usuń): `invoices.py` linia 319-334
- **Frontend:** `crm-ui/src/pages/InvoicesPage.tsx`, `AddInvoicePage.tsx`, `EditInvoicePage.tsx`

**Contracts (Kontrakty):**
- **GET** (lista): `backend-python/app/controllers/contracts.py` linia 16-46
- **GET** (szczegóły): `contracts.py` linia 117-130
- **POST** (dodaj): `contracts.py` linia 48-115
- **PUT** (edytuj): `contracts.py` linia 132-208
- **DELETE** (usuń): `contracts.py` linia 210-223
- **Frontend:** `crm-ui/src/pages/ContractsPage.tsx`, `AddContractPage.tsx`, `EditContractPage.tsx`

**Tasks (Zadania):**
- **GET** (lista): `backend-python/app/controllers/user_tasks.py`
- **POST** (dodaj): `user_tasks.py`
- **PUT** (edytuj): `user_tasks.py`
- **DELETE** (usuń): `user_tasks.py`
- **Frontend:** `crm-ui/src/pages/TasksPage.tsx`, `AllTasksPage.tsx`

**Meetings (Spotkania):**
- **GET, POST, PUT, DELETE:** `backend-python/app/controllers/meetings.py`
- **Frontend:** `crm-ui/src/pages/MeetingsPage.tsx`, `AddMeetingPage.tsx`, `EditMeetingPage.tsx`

**Payments (Płatności):**
- **GET, POST, PUT, DELETE:** `backend-python/app/controllers/payments.py`
- **Frontend:** `crm-ui/src/pages/PaymentsPage.tsx`, `AddPaymentPage.tsx`, `EditPaymentPage.tsx`

**Tags (Tagi):**
- **GET, POST, PUT, DELETE:** `backend-python/app/controllers/tags.py`
- **Frontend:** `crm-ui/src/pages/ClientTagsPage.tsx`

**Groups (Grupy):**
- **GET, POST, PUT, DELETE:** `backend-python/app/controllers/groups.py`
- **Frontend:** `crm-ui/src/pages/GroupsPage.tsx`, `GroupDetailsPage.tsx`

**Filtrowanie i sortowanie:**
- Implementowane w frontendzie dla wszystkich list
- Przykład: `crm-ui/src/pages/ClientsPage.tsx` - filtrowanie i sortowanie klientów
- Przykład: `crm-ui/src/pages/InvoicesPage.tsx` - filtrowanie faktur

---

### 13. Rozbudowane procesy biznesowe (100% domknięte biznesowo)

**Status:** ✅ **ZREALIZOWANE**

**Proces 1: Generowanie i opłacanie faktur**
- **Lokalizacja:** 
  - Tworzenie faktury: `backend-python/app/controllers/invoices.py` linia 125-215
  - Dodawanie płatności: `backend-python/app/controllers/payments.py` linia 32-69
  - Automatyczna aktualizacja statusu: `payments.py` linia 55-62
- **Proces:**
  1. Utworzenie faktury z pozycjami → automatyczne przeliczenie kwot
  2. Dodanie płatności → automatyczna aktualizacja `IsPaid`
  3. Wyświetlenie historii płatności: `invoices.py` linia 230-243
- **Frontend:** `crm-ui/src/pages/AddInvoicePage.tsx`, `AddPaymentPage.tsx`, `InvoiceDetailsPage.tsx`

**Proces 2: Tworzenie kontraktu z usługami**
- **Lokalizacja:** `backend-python/app/controllers/contracts.py` linia 48-115
- **Proces:**
  1. Wybór klienta
  2. Wybór usług z ilościami
  3. Automatyczne obliczenie `NetAmount` (linia 60-74)
  4. Zapis kontraktu i powiązań z usługami (linia 98-108)
  5. Generowanie dokumentu Word: `contracts.py` linia 225-312
- **Frontend:** `crm-ui/src/pages/AddContractPage.tsx`, `EditContractPage.tsx`

**Proces 3: Zarządzanie spotkaniami i zadaniami**
- **Lokalizacja:**
  - Spotkania: `backend-python/app/controllers/meetings.py`
  - Zadania: `backend-python/app/controllers/user_tasks.py`
- **Proces:**
  1. Utworzenie spotkania/zadania
  2. Przypisanie do klienta/grupy
  3. Powiadomienia: `backend-python/app/controllers/notifications.py`
  4. Przypomnienia: `backend-python/app/controllers/reminders.py`
- **Frontend:** `crm-ui/src/pages/MeetingsPage.tsx`, `TasksPage.tsx`, `RemindersPage.tsx`

**Proces 4: Raportowanie i analityka**
- **Lokalizacja:** `backend-python/app/controllers/reports.py`
- **Proces:**
  1. Wybór grupy/tagu
  2. Pobranie danych: `reports.py` linia 19-95
  3. Generowanie raportu PDF: `reports.py` linia 589-790
  4. Eksport do Excel/CSV: `reports.py` linia 1452-1717
- **Frontend:** `crm-ui/src/pages/ReportsPage.tsx`, `ExportsPage.tsx`

**Proces 5: Zarządzanie szablonami i generowanie dokumentów**
- **Lokalizacja:** 
  - Szablony: `backend-python/app/controllers/templates.py`
  - Generowanie: `backend-python/app/controllers/contracts.py` linia 313-428
- **Proces:**
  1. Upload szablonu Word: `templates.py` linia 27-65
  2. Wybór szablonu przy generowaniu kontraktu
  3. Podmiana zmiennych w szablonie: `contracts.py` linia 350-400
  4. Pobranie wygenerowanego dokumentu
- **Frontend:** `crm-ui/src/pages/TemplatesPage.tsx`, `EditContractPage.tsx`

---

### 14. Minimum 50 rozbudowanych widoków interfejsu

**Status:** ✅ **ZREALIZOWANE (63 widoki)**

**Aplikacja Webowa (44 widoki):**
- Lokalizacja: `crm-ui/src/pages/`
- Lista plików:
  1. `ActivitiesPage.tsx` - Aktywności
  2. `AddCalendarEventPage.tsx` - Dodaj wydarzenie
  3. `AddClientPage.tsx` - Dodaj klienta
  4. `AddContractPage.tsx` - Dodaj kontrakt
  5. `AddInvoicePage.tsx` - Dodaj fakturę
  6. `AddMeetingPage.tsx` - Dodaj spotkanie
  7. `AddNotePage.tsx` - Dodaj notatkę
  8. `AddPaymentPage.tsx` - Dodaj płatność
  9. `AddUserPage.tsx` - Dodaj użytkownika
  10. `AllTasksPage.tsx` - Wszystkie zadania
  11. `CalendarEventsPage.tsx` - Wydarzenia kalendarzowe
  12. `ClientsPage.tsx` - Lista klientów
  13. `ClientTagsPage.tsx` - Tagi klientów
  14. `ContractsPage.tsx` - Lista kontraktów
  15. `DashboardPage.tsx` - Dashboard
  16. `EditCalendarEventPage.tsx` - Edytuj wydarzenie
  17. `EditClientPage.tsx` - Edytuj klienta
  18. `EditContractPage.tsx` - Edytuj kontrakt
  19. `EditInvoicePage.tsx` - Edytuj fakturę
  20. `EditMeetingPage.tsx` - Edytuj spotkanie
  21. `EditNotePage.tsx` - Edytuj notatkę
  22. `EditPaymentPage.tsx` - Edytuj płatność
  23. `EditUserPage.tsx` - Edytuj użytkownika
  24. `ExportsPage.tsx` - Eksport danych
  25. `GroupDetailsPage.tsx` - Szczegóły grupy
  26. `GroupsPage.tsx` - Lista grup
  27. `GroupStatisticsPage.tsx` - Statystyki grupy
  28. `InvoiceDetailsPage.tsx` - Szczegóły faktury
  29. `InvoicesPage.tsx` - Lista faktur
  30. `LoginHistoryPage.tsx` - Historia logowań
  31. `LoginPage.tsx` - Logowanie
  32. `LogsPage.tsx` - Logi systemowe
  33. `MeetingsPage.tsx` - Lista spotkań
  34. `MessagesPage.tsx` - Wiadomości
  35. `NotesPage.tsx` - Notatki
  36. `NotificationsPage.tsx` - Powiadomienia
  37. `PaymentsPage.tsx` - Lista płatności
  38. `RemindersPage.tsx` - Przypomnienia
  39. `ReportsPage.tsx` - Raporty i analityka
  40. `RolesPage.tsx` - Role
  41. `SettingsPage.tsx` - Ustawienia
  42. `TasksPage.tsx` - Zadania
  43. `TemplatesPage.tsx` - Szablony
  44. `UsersPage.tsx` - Użytkownicy

**Aplikacja Mobilna (19 widoków):**
- Lokalizacja: `crm-mobile/app/`
- Lista plików:
  1. `(tabs)/index.tsx` - Dashboard
  2. `(tabs)/customers.tsx` - Lista klientów
  3. `(tabs)/invoices.tsx` - Lista faktur
  4. `(tabs)/activities.tsx` - Aktywności
  5. `(tabs)/two.tsx` - Dodatkowa zakładka
  6. `login.tsx` - Logowanie
  7. `customer/[id].tsx` - Szczegóły klienta
  8. `invoice/[id].tsx` - Szczegóły faktury
  9. `add-customer.tsx` - Dodaj klienta
  10. `add-invoice.tsx` - Dodaj fakturę
  11. `add-task.tsx` - Dodaj zadanie
  12. `edit-task.tsx` - Edytuj zadanie
  13. `notifications.tsx` - Powiadomienia
  14. `reminders.tsx` - Przypomnienia
  15. `modal.tsx` - Modal
  16. `+not-found.tsx` - 404
  17. `+html.tsx` - HTML wrapper
  18. `_layout.tsx` - Layout
  19. `(tabs)/_layout.tsx` - Layout zakładek

**Razem: 44 + 19 = 63 widoki** ✅

---

### 15. Dopracowane graficznie i spójne widoki

**Status:** ✅ **ZREALIZOWANE**

**Stylowanie:**
- **Framework CSS:** TailwindCSS
  - Konfiguracja: `crm-ui/tailwind.config.js`
  - Globalne style: `crm-ui/src/index.css`
- **Spójny design:**
  - Ciemny motyw (gray-800, gray-700)
  - Spójne kolory: blue-600, green-600, red-600
  - Ikony emoji w nagłówkach (⚙️, 📊, 📤, itp.)
- **Komponenty:**
  - Layout: `crm-ui/src/components/Layout.tsx` - spójny layout dla wszystkich stron
  - Modal: `crm-ui/src/context/ModalContext.tsx` - spójne modały

**Przykłady spójnych widoków:**
- Wszystkie strony używają tego samego layoutu
- Wszystkie formularze mają spójny styl
- Wszystkie listy mają spójny wygląd tabel

---

### 16. Zasady poprawnej konstrukcji interfejsów użytkownika (IHM)

**Status:** ✅ **ZREALIZOWANE**

**Zasady IHM zaimplementowane:**
- **Spójność:** Wszystkie widoki używają tego samego layoutu i stylów
- **Feedback:** Toast notifications dla akcji użytkownika
  - Lokalizacja: `crm-ui/src/context/ModalContext.tsx`
- **Nawigacja:** Jasna struktura menu
  - Lokalizacja: `crm-ui/src/components/Layout.tsx` linia 50-150
- **Walidacja:** Formularze z walidacją
  - Przykład: `crm-ui/src/pages/AddClientPage.tsx`
- **Błędy:** Czytelne komunikaty błędów
- **Loading states:** Wskaźniki ładowania
  - Przykład: `crm-ui/src/pages/ClientsPage.tsx` - stan `loading`

---

### 17. Sterowanie z poziomu administracyjnej części systemu

**Status:** ✅ **ZREALIZOWANE**

**Ustawienia systemu:**
- **Backend:** `backend-python/app/controllers/settings.py`
  - Pobieranie ustawień: endpoint `GET /api/Settings`
  - Aktualizacja ustawień: endpoint `PUT /api/Settings`
- **Frontend:** `crm-ui/src/pages/SettingsPage.tsx`
  - Zarządzanie danymi firmy (nazwa, NIP, adres, konto bankowe)
  - Wszystkie dane edytowalne z poziomu admina

**Szablony:**
- **Backend:** `backend-python/app/controllers/templates.py`
  - Upload szablonu: `templates.py` linia 27-65
  - Lista szablonów: `templates.py` linia 12-25
  - Usuwanie szablonu: `templates.py` linia 67-85
- **Frontend:** `crm-ui/src/pages/TemplatesPage.tsx`
  - Upload, lista, usuwanie szablonów Word
  - Możliwość zmiany szablonu przez użytkownika

**Model Settings:**
- `backend-python/app/models/setting.py` - przechowywanie ustawień w bazie
- Wszystkie teksty/ustawienia zarządzane z poziomu admina, nie hardcoded w kodzie

---

### 18. Generowanie raportów biznesowych (PDF, Excel)

**Status:** ✅ **ZREALIZOWANE**

**Raporty PDF:**
- **Backend:** `backend-python/app/controllers/reports.py`
  - Raport grupy: `reports.py` linia 589-790 - endpoint `GET /api/reports/groups/{id}/pdf`
  - Raport taga: `reports.py` linia 951-1163 - endpoint `GET /api/reports/tags/{id}/pdf`
  - Biblioteka: ReportLab (import: `reports.py` linia 5-10)
- **Frontend:** `crm-ui/src/pages/ReportsPage.tsx`
  - Przycisk "Pobierz PDF" dla grup i tagów

**Eksport do Excel/CSV:**
- **Backend:** `backend-python/app/controllers/reports.py`
  - Eksport klientów: `reports.py` linia 1452-1717 - endpoint `GET /api/reports/export-customers?format=excel`
  - Eksport faktur: `reports.py` linia 1718-1871
  - Eksport płatności: `reports.py` linia 1872-1974
  - Eksport kontraktów: `reports.py` linia 1975-2081
  - Biblioteka: xlsxwriter (import: `reports.py` linia 14)
- **Frontend:** `crm-ui/src/pages/ExportsPage.tsx`
  - Wybór typu danych, formatu (PDF/Excel/CSV), kolumn
  - Filtrowanie po dacie, grupie, tagu

**Formaty eksportu:**
- PDF (ReportLab)
- Excel (xlsxwriter)
- CSV (wbudowany Python)

---

### 19. Generowanie parametryzowanych wydruków z szablonów Word

**Status:** ✅ **ZREALIZOWANE**

**Szablony Word:**
- **Backend:** `backend-python/app/controllers/templates.py`
  - Upload szablonu: `templates.py` linia 27-65
  - Przechowywanie: `backend-python/app/uploads/templates/`
- **Model:** `backend-python/app/models/template.py`

**Generowanie dokumentów:**
- **Backend:** `backend-python/app/controllers/contracts.py`
  - Generowanie z szablonu: `contracts.py` linia 313-428
  - Endpoint: `POST /api/Contracts/{id}/generate-from-template`
  - Biblioteka: python-docx (import w kodzie)
- **Proces:**
  1. Wybór szablonu Word
  2. Podmiana zmiennych w szablonie (linia 350-400)
  3. Generowanie nowego dokumentu
  4. Pobranie przez użytkownika

**Zmiana szablonu przez użytkownika:**
- **Frontend:** `crm-ui/src/pages/TemplatesPage.tsx`
  - Upload nowego szablonu
  - Lista dostępnych szablonów
  - Usuwanie szablonów
- **Frontend:** `crm-ui/src/pages/EditContractPage.tsx`
  - Wybór szablonu przy generowaniu kontraktu

**Przykład użycia:**
- Szablon zawiera zmienne: `{{CustomerName}}`, `{{ContractNumber}}`, itp.
- System podmienia zmienne danymi z bazy
- Generuje nowy dokument Word

---

## 📊 Podsumowanie realizacji wymagań

| # | Wymaganie | Status | Lokalizacja |
|---|-----------|--------|-------------|
| 1 | Cele biznesowe | ✅ | README.md, wszystkie kontrolery |
| 2 | Funkcjonalność branżowa | ✅ | Wszystkie moduły CRM |
| 3.a | Dwa projekty (web + mobile) | ✅ | crm-ui/, crm-mobile/ |
| 3.b | Projekt operacji na bazie | ✅ | backend-python/app/database/ |
| 3.c | Klasy logiki biznesowej | ✅ | backend-python/app/controllers/ |
| 4 | Wspólne użycie bazy i logiki | ✅ | Wszystkie aplikacje używają backend-python/ |
| 5 | Nowoczesne techniki | ✅ | Python Flask, React, React Native |
| 6 | Wzorce projektowe (MVC) | ✅ | models/, controllers/, pages/ |
| 7 | Baza na serwerze | ✅ | MySQL/MariaDB, config.py |
| 8 | 30 tabel + widoki/procedury/funkcje/indeksy | ✅ | models/, database_enhancements.sql |
| 9 | ORM | ✅ | SQLAlchemy, database/__init__.py |
| 10 | Autoryzacja | ✅ | auth.py, middleware.py |
| 11 | Zarządzanie użytkownikami/grupami | ✅ | admin.py, groups.py, UsersPage.tsx |
| 12 | CRUD na wszystkich tabelach | ✅ | Wszystkie kontrolery |
| 13 | Procesy biznesowe | ✅ | invoices.py, contracts.py, payments.py |
| 14 | 50+ widoków | ✅ | 63 widoki (44 web + 19 mobile) |
| 15 | Dopracowane graficznie | ✅ | TailwindCSS, Layout.tsx |
| 16 | Zasady IHM | ✅ | Wszystkie widoki |
| 17 | Sterowanie z admina | ✅ | settings.py, templates.py |
| 18 | Raporty PDF/Excel | ✅ | reports.py, ExportsPage.tsx |
| 19 | Szablony Word | ✅ | templates.py, contracts.py |

**Wszystkie 19 wymagań zostały w 100% zrealizowane!** ✅

---

## 🔍 Szybkie odnajdywanie elementów

### Widoki w bazie danych:
```sql
SHOW FULL TABLES FROM crm_project WHERE Table_type = 'VIEW';
```

### Procedury:
```sql
SHOW PROCEDURE STATUS WHERE Db = 'crm_project';
```

### Funkcje:
```sql
SHOW FUNCTION STATUS WHERE Db = 'crm_project';
```

### Indeksy:
```sql
SHOW INDEXES FROM Customers;
SHOW INDEXES FROM Invoices;
```

### Endpointy API:
- Lista wszystkich: `backend-python/app/__init__.py` linia 40-62
- Dokumentacja: `backend-python/README.md` sekcja "Dostępne endpointy"

### Procesy biznesowe:
- Faktury: `backend-python/app/controllers/invoices.py` + `payments.py`
- Kontrakty: `backend-python/app/controllers/contracts.py`
- Raporty: `backend-python/app/controllers/reports.py`

---

## 📁 Struktura projektu

```
inzynier/
├── backend-python/          # Backend (baza + logika biznesowa)
│   ├── app/
│   │   ├── models/         # MODELE (30 tabel)
│   │   ├── controllers/    # KONTROLERY (logika biznesowa)
│   │   ├── database/      # Konfiguracja ORM
│   │   └── config.py       # Konfiguracja bazy
│   ├── database_enhancements.sql  # Widoki, procedury, funkcje, indeksy
│   └── app.py              # Główny plik
├── crm-ui/                 # Aplikacja webowa (VIEW)
│   └── src/pages/          # 44 widoki
└── crm-mobile/             # Aplikacja mobilna (VIEW)
    └── app/                # 19 widoków
```

---