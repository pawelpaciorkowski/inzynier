# CRM Backend w Python

Backend API dla systemu CRM napisany w Python przy użyciu Flask.

## 🚀 Szybki start

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

1. Zainstaluj MySQL
2. Utwórz bazę danych:
```sql
CREATE DATABASE crm_db;
```

3. Skonfiguruj połączenie w pliku `app/config.py`:
```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://username:password@localhost:3306/crm_db'
```

### 3. Uruchomienie

```bash
python app.py
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5000`

## 📋 Dostępne endpointy

### Autoryzacja
- `POST /api/Auth/login` - logowanie
- `POST /api/Auth/register` - rejestracja

### Klienci
- `GET /api/Customers` - lista klientów
- `GET /api/Customers/{id}` - szczegóły klienta
- `POST /api/Customers` - utwórz klienta
- `PUT /api/Customers/{id}` - aktualizuj klienta
- `DELETE /api/Customers/{id}` - usuń klienta

### Przypomnienia
- `GET /api/Reminders` - lista przypomnień
- `GET /api/Reminders/{id}` - szczegóły przypomnienia
- `POST /api/Reminders` - utwórz przypomnienie
- `PUT /api/Reminders/{id}` - aktualizuj przypomnienie
- `DELETE /api/Reminders/{id}` - usuń przypomnienie

### Inne moduły
- Faktury (`/api/Invoices`)
- Kontrakty (`/api/Contracts`)
- Spotkania (`/api/Meetings`)
- Zadania (`/api/user/tasks`)
- Raporty (`/api/reports`)
- Tagi (`/api/Tags`)
- Szablony (`/api/Templates`)
- Płatności (`/api/Payments`)

## 🔐 Tworzenie użytkownika administratora

Aby utworzyć użytkownika administratora, uruchom:

```bash
python create_admin.py
```

Domyślne dane logowania:
- **Username**: `admin`
- **Password**: `Diviruse007@`

## 📁 Struktura projektu

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

## 🛠️ Technologie

- **Flask** - framework webowy
- **SQLAlchemy** - ORM do bazy danych
- **PyJWT** - tokeny JWT do autoryzacji
- **bcrypt** - hashowanie haseł
- **PyMySQL** - sterownik MySQL
- **ReportLab** - generowanie raportów PDF
- **python-docx** - generowanie dokumentów Word

## 💡 Przykłady użycia

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

## 🎯 Funkcjonalności

- ✅ RESTful API z pełną obsługą CRUD
- ✅ Autoryzacja JWT z obsługą ról (Admin/User)
- ✅ Zarządzanie klientami, faktury, kontrakty, spotkania
- ✅ System zadań i przypomnień
- ✅ Generowanie raportów PDF
- ✅ Generowanie dokumentów Word z szablonów
- ✅ System tagów i grup
- ✅ Historia logowań i logi systemowe
- ✅ Powiadomienia i wiadomości
- ✅ Panel administracyjny
