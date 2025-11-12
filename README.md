# Zintegrowany System CRM – Projekt Inżynierski

> **Autor:** Paweł Paciorkowski  
> **Kierunek:** Informatyka, IV rok  
> **Specjalność:** Programista aplikacji biznesowych

---

## Opis projektu

**Zintegrowany System CRM** to zaawansowana platforma stworzona w ramach pracy inżynierskiej, której celem jest usprawnienie i automatyzacja kluczowych procesów biznesowych związanych z zarządzaniem relacjami z klientem.

Aplikacja składa się z trzech głównych, w pełni zintegrowanych komponentów:
1.  **Backend RESTful API** w technologii **Python Flask**, pełniący rolę serca systemu, obsługujący logikę biznesową i komunikację z bazą danych.
2.  **Aplikacja webowa** w technologii **React + TypeScript**, stanowiąca rozbudowany panel do zarządzania wszystkimi aspektami systemu.
3.  **Aplikacja mobilna** w technologii **React Native (Expo)**, zapewniająca dostęp do kluczowych funkcji z urządzeń mobilnych.

System został zaprojektowany z myślą o spełnieniu rygorystycznych wymagań akademickich oraz biznesowych, kładąc nacisk na nowoczesne technologie, dobre praktyki architektoniczne i realną użyteczność.

---

## Technologie

| Kategoria | Technologia |
| :--- | :--- |
| **Frontend (Web)** | React 19.1.0, TypeScript, Vite, TailwindCSS, React Router, Axios, Heroicons |
| **Backend** | Python 3.12, Flask 2.3.3, SQLAlchemy, PyMySQL |
| **Baza Danych** | MariaDB (MySQL) |
| **API** | REST, JWT Token Authorization |
| **Mobilna** | React Native 0.79.5, Expo 53.0.20, Expo Router, expo-secure-store |
| **Generowanie Plików** | **ReportLab** (PDF), **python-docx** (szablony .docx) |
| **Autoryzacja** | JWT, bcrypt |

---

## Kluczowe Funkcjonalności

-   **Pełna obsługa CRUD** dla kluczowych modułów:
    -   **Klienci:** Dodawanie, edycja, listowanie, usuwanie.
    -   **Kontrakty:** Pełne zarządzanie umowami z nowymi, rozbudowanymi polami.
    -   **Faktury:** Możliwość tworzenia faktur i powiązania ich z klientami.
    -   **Zadania:** Zarządzanie zadaniami (dla admina i użytkownika) w aplikacji webowej i mobilnej.
-   **Zaawansowany system autoryzacji:**
    -   Logowanie i rejestracja oparte na tokenach **JWT**.
    -   Role użytkowników (**Admin**, **User**) z zabezpieczonymi endpointami w API.
-   **System powiadomień:**
    -   Globalny, reużywalny **komponent `Modal`** oparty na React Context do wyświetlania potwierdzeń i błędów.
-   **Moduł raportowania i dokumentów:**
    -   **Generowanie raportów PDF** z listą klientów.
    -   **Generowanie spersonalizowanych umów** na podstawie dynamicznych szablonów `.docx`.
    -   System do zarządzania szablonami (upload, listowanie, usuwanie).
-   **Panel Ustawień:**
    -   Możliwość globalnego zarządzania danymi firmy (używanymi w dokumentach).
    * Formularz do bezpiecznej zmiany hasła dla zalogowanego użytkownika.
-   **Aplikacja mobilna:**
    -   W pełni działający system logowania i zarządzania sesją.
    -   Interaktywna lista zadań (wyświetlanie, oznaczanie jako ukończone, usuwanie, edycja).

---

## Struktura projektu

```
inzynier/
├── backend-python/ # Backend API (Python Flask + SQLAlchemy)
├── crm-ui/         # Webowy frontend (Vite + React + TypeScript)
├── crm-mobile/     # Mobilna aplikacja (Expo + React Native)
├── .gitignore
└── README.md
```

---

## Uruchamianie aplikacji

### Wymagania wstępne
- **Python 3.12** (lub nowszy)
- **Node.js** (lub nowszy)
- **MySQL/MariaDB** (lokalnie zainstalowany)
- **npm** (zazwyczaj dołączony do Node.js)

### Krok 1: Przygotowanie bazy danych

**WAŻNE:** W katalogu `backend-python/` znajduje się gotowy dump bazy danych (`crm_project_dump.sql`), który zawiera pełną strukturę bazy wraz z przykładowymi danymi. **Zalecane jest użycie tego dumpu** zamiast tworzenia pustej bazy.

#### Opcja A: Przywrócenie bazy z gotowego dumpu (ZALECANE)

1. **Zainstaluj MySQL/MariaDB** (jeśli nie masz):
   - Windows: Pobierz z [mysql.com](https://dev.mysql.com/downloads/installer/)
   - Linux: `sudo apt-get install mysql-server` (Ubuntu/Debian) lub `sudo yum install mysql-server` (CentOS/RHEL)
   - Mac: `brew install mysql`

2. **Uruchom MySQL/MariaDB**:
   - Linux: `sudo systemctl start mariadb` lub `sudo service mysql start`
   - Windows: Uruchom z menu Start lub Services
   - Mac: `brew services start mysql`

3. **Utwórz pustą bazę danych**:
   ```sql
   CREATE DATABASE crm_project;
   ```

4. **Przywróć bazę z dumpu**:
   ```bash
   cd backend-python
   mysql -u root -p -h 127.0.0.1 crm_project < crm_project_dump.sql
   ```
   
   > **Uwaga:** Jeśli masz problem z socketem MySQL, użyj `-h 127.0.0.1` aby połączyć się przez TCP/IP zamiast socketu.

5. **Skonfiguruj połączenie** w pliku `backend-python/app/config.py`:
   ```python
   SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://TWÓJ_UŻYTKOWNIK:TWOJE_HASŁO@localhost:3306/crm_project'
   ```
   Przykład: `mysql+pymysql://root:mojehaslo@localhost:3306/crm_project`

#### Opcja B: Utworzenie pustej bazy danych (jeśli nie chcesz używać dumpu)

1. **Zainstaluj MySQL/MariaDB** (jeśli nie masz)

2. **Uruchom MySQL/MariaDB**

3. **Utwórz bazę danych**:
   ```sql
   CREATE DATABASE crm_project;
   ```

4. **Skonfiguruj połączenie** w pliku `backend-python/app/config.py`:
   ```python
   SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://TWÓJ_UŻYTKOWNIK:TWOJE_HASŁO@localhost:3306/crm_project'
   ```
   Przykład: `mysql+pymysql://root:mojehaslo@localhost:3306/crm_project`

5. **Zainstaluj rozszerzenia bazy danych** (widoki, procedury, funkcje, indeksy):
   ```bash
   cd backend-python
   mysql -u root -p -h 127.0.0.1 crm_project < database_enhancements.sql
   ```

### Krok 2: Backend (API)

Otwórz terminal i wykonaj:

```bash
cd backend-python
python -m venv venv
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

Następnie:
```bash
pip install -r requirements.txt
python create_admin.py
python app.py
```

> **Ważne:** Uruchom `python create_admin.py` **przed** pierwszym uruchomieniem aplikacji, aby utworzyć konto administratora.

Backend działa na: **http://localhost:5000**

### Krok 3: Frontend (Aplikacja Webowa)

Otwórz **nowy terminal** i wykonaj:

```bash
cd crm-ui
npm install
npm run dev
```

Frontend działa na: **http://localhost:5173**

### Krok 4: Aplikacja Mobilna (opcjonalnie)

Otwórz **trzeci terminal** i wykonaj:

```bash
cd crm-mobile
npm install
npx expo start
```

Zeskanuj kod QR w aplikacji Expo Go na telefonie

---

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
cd backend-python
mysql -u root -p -h 127.0.0.1 crm_project < crm_project_dump.sql
```

> **Uwaga:** Jeśli masz problem z socketem MySQL, użyj `-h 127.0.0.1` aby połączyć się przez TCP/IP zamiast socketu.

## Backup bazy danych (tworzenie nowego dumpu)

### Tworzenie kopii zapasowej (dump)

**Windows:**
```bash
mysqldump -u TWÓJ_UŻYTKOWNIK -p -h 127.0.0.1 --routines --triggers crm_project > backup_crm_YYYY-MM-DD.sql
```

**Linux/Mac:**
```bash
mysqldump -u TWÓJ_UŻYTKOWNIK -p -h 127.0.0.1 --routines --triggers crm_project > backup_crm_$(date +%Y-%m-%d).sql
```

Przykład:
```bash
mysqldump -u root -p -h 127.0.0.1 --routines --triggers crm_project > backup_crm_2024-12-20.sql
```

> **Uwaga:** Flaga `--routines` zapewnia, że procedury i funkcje również zostaną uwzględnione w dumpie.

### Przywracanie z kopii zapasowej

```bash
mysql -u TWÓJ_UŻYTKOWNIK -p -h 127.0.0.1 crm_project < backup_crm_YYYY-MM-DD.sql
```

Przykład:
```bash
mysql -u root -p -h 127.0.0.1 crm_project < backup_crm_2024-12-20.sql
```

---

## Dokumentacja

Szczegółowa dokumentacja backendu znajduje się w pliku **[backend-python/README.md](backend-python/README.md)**.

## Metryki projektu

- **Liczba endpointów API:** 100+
- **Liczba tabel w bazie:** 30 (23 główne + 7 pomocniczych)
- **Liczba widoków w bazie:** 3 (v_customer_invoice_summary, v_invoice_details, v_group_statistics)
- **Liczba procedur składowanych:** 3 (sp_create_invoice, sp_update_invoice_payment_status, sp_generate_sales_report)
- **Liczba funkcji w bazie:** 3 (fn_calculate_invoice_total, fn_format_date_polish, fn_is_invoice_overdue)
- **Liczba indeksów:** 20+ na kluczowych kolumnach
- **Liczba komponentów React:** 100+
- **Liczba ekranów mobilnych:** 19
- **Liczba widoków interfejsu:** 63 (44 web + 19 mobile)
- **Liczba linii kodu:** 15,000+
- **Czas realizacji:** 6 miesięcy

## Rozszerzenia bazy danych

Aby spełnić wszystkie wymagania projektu, należy zainstalować widoki, procedury, funkcje i indeksy:

```bash
cd backend-python
mysql -u root -p -h 127.0.0.1 crm_project < database_enhancements.sql
```

> **Uwaga:** Jeśli masz problem z socketem MySQL, użyj `-h 127.0.0.1` aby połączyć się przez TCP/IP zamiast socketu.

Szczegółowa dokumentacja realizacji wszystkich wymagań znajduje się w pliku **[DOKUMENTACJA_WYMAGAN.md](DOKUMENTACJA_WYMAGAN.md)**.