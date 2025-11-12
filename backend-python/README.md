# CRM Backend w Python

Prosty backend CRM napisany w Python używając Flask - idealny dla juniora!

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

3. Skonfiguruj połączenie w pliku `config.py`:
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
- `POST /api/auth/login` - logowanie
- `POST /api/auth/register` - rejestracja

### Przypomnienia
- `GET /api/reminders` - lista przypomnień
- `GET /api/reminders/{id}` - szczegóły przypomnienia
- `POST /api/reminders` - utwórz przypomnienie
- `PUT /api/reminders/{id}` - aktualizuj przypomnienie
- `DELETE /api/reminders/{id}` - usuń przypomnienie

### Klienci
- `GET /api/customers` - lista klientów
- `GET /api/customers/{id}` - szczegóły klienta
- `POST /api/customers` - utwórz klienta
- `PUT /api/customers/{id}` - aktualizuj klienta
- `DELETE /api/customers/{id}` - usuń klienta

## 🔐 Użytkownicy testowi

Po uruchomieniu aplikacji zostaną utworzeni użytkownicy testowi:

- **Admin**: `admin` / `admin123`
- **User**: `user` / `user123`

## 📁 Struktura projektu

```
backend-python/
├── app/
│   ├── controllers/     # Kontrolery (endpointy API)
│   ├── models/         # Modele danych
│   ├── services/       # Logika biznesowa
│   └── database/       # Konfiguracja bazy danych
├── config.py           # Konfiguracja aplikacji
├── app.py             # Główny plik aplikacji
└── requirements.txt   # Zależności Python
```

## 🛠️ Technologie

- **Flask** - prosty framework webowy
- **SQLAlchemy** - ORM do bazy danych
- **PyJWT** - tokeny JWT
- **bcrypt** - hashowanie haseł
- **MySQL** - baza danych

## 💡 Przykłady użycia

### Logowanie
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Utworzenie przypomnienia
```bash
curl -X POST http://localhost:5000/api/reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"note": "Zadzwoń do klienta", "remind_at": "2024-12-31T10:00:00Z"}'
```

## 🎯 Cechy

- ✅ Prosty kod - jakby napisał junior
- ✅ Brak niepotrzebnych komplikacji
- ✅ Podstawowe funkcje CRM
- ✅ Autoryzacja JWT
- ✅ CRUD dla klientów i przypomnień
- ✅ Automatyczne seedowanie danych testowych

## 🔧 Rozwój

To jest podstawowa wersja. Można łatwo dodać:
- Więcej modeli (faktury, kontrakty, spotkania)
- Walidację danych
- Testy jednostkowe
- Dokumentację API (Swagger)
- Logowanie
- Cache


























