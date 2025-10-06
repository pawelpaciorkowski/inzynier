# 📊 Zintegrowany System CRM – Projekt Inżynierski

[![Status](https://img.shields.io/badge/Status-Production%20Ready-green)](https://github.com/pawelpaciorkowski/inzynier)
[![Backend](https://img.shields.io/badge/Backend-Python%20Flask-blue)](https://flask.palletsprojects.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-61dafb)](https://reactjs.org/)
[![Mobile](https://img.shields.io/badge/Mobile-React%20Native-61dafb)](https://reactnative.dev/)
[![Database](https://img.shields.io/badge/Database-MariaDB-003545)](https://mariadb.org/)

> **Autor:** Paweł Paciorkowski  
> **Kierunek:** Informatyka, IV rok  
> **Specjalność:** Programista aplikacji biznesowych

---

## 🧩 Opis projektu

**Zintegrowany System CRM** to zaawansowana platforma stworzona w ramach pracy inżynierskiej, której celem jest usprawnienie i automatyzacja kluczowych procesów biznesowych związanych z zarządzaniem relacjami z klientem.

Aplikacja składa się z trzech głównych, w pełni zintegrowanych komponentów:
1.  **Backend RESTful API** w technologii **Python Flask**, pełniący rolę serca systemu, obsługujący logikę biznesową i komunikację z bazą danych.
2.  **Aplikacja webowa** w technologii **React + TypeScript**, stanowiąca rozbudowany panel do zarządzania wszystkimi aspektami systemu.
3.  **Aplikacja mobilna** w technologii **React Native (Expo)**, zapewniająca dostęp do kluczowych funkcji z urządzeń mobilnych.

System został zaprojektowany z myślą o spełnieniu rygorystycznych wymagań akademickich oraz biznesowych, kładąc nacisk na nowoczesne technologie, dobre praktyki architektoniczne i realną użyteczność.

---

## 💡 Technologie

| Kategoria | Technologia |
| :--- | :--- |
| **Frontend (Web)** | React 19.1.0, TypeScript, Vite, TailwindCSS, React Router, Axios, Heroicons |
| **Backend** | Python 3.12, Flask 2.3.3, SQLAlchemy, PyMySQL |
| **Baza Danych** | MariaDB (MySQL) |
| **API** | REST, JWT Token Authorization |
| **Mobilna** | React Native 0.79.5, Expo 53.0.20, Expo Router, expo-secure-store |
| **Generowanie Plików** | **ReportLab** (PDF), **python-docx** (szablony .docx) |
| **Autoryzacja** | JWT, bcrypt |
| **Konteneryzacja** | Docker, Docker Compose |

---

## 📌 Kluczowe Funkcjonalności

-   **Pełna obsługa CRUD** dla kluczowych modułów:
    -   👥 **Klienci:** Dodawanie, edycja, listowanie, usuwanie.
    -   📑 **Kontrakty:** Pełne zarządzanie umowami z nowymi, rozbudowanymi polami.
    -   🧾 **Faktury:** Możliwość tworzenia faktur i powiązania ich z klientami.
    -   ✅ **Zadania:** Zarządzanie zadaniami (dla admina i użytkownika) w aplikacji webowej i mobilnej.
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

## 📂 Struktura projektu

```
inzynier/
├── backend-python/ # Backend API (Python Flask + SQLAlchemy)
├── crm-ui/         # Webowy frontend (Vite + React + TypeScript)
├── crm-mobile/     # Mobilna aplikacja (Expo + React Native)
├── .gitignore
├── docker-compose.yml
├── DOCUMENTATION_INDEX.md  # Spis treści dokumentacji
└── README.md
```

---

## 🐳 Uruchamianie Środowiska (Zalecane: Docker Compose)

Projekt został w pełni skonfigurowany do uruchomienia w środowisku kontenerowym, co jest najprostszym i najszybszym sposobem na start.

### Wymagania
- Zainstalowany **Docker** i **Docker Compose**.

### Uruchomienie
W głównym katalogu projektu (tam, gdzie znajduje się plik `docker-compose.yml`) uruchom komendy:

```bash
# Zbuduj obrazy dla wszystkich serwisów
docker compose build

# Uruchom wszystkie kontenery w tle
docker compose up -d
```
Po chwili wszystkie serwisy będą dostępne pod następującymi adresami:

-   **Aplikacja Webowa (Frontend):** [http://localhost:5173](http://localhost:5173)
-   **API (Backend):** [http://localhost:5167](http://localhost:5167)
-   **Swagger (Dokumentacja API):** [http://localhost:5167/swagger](http://localhost:5167/swagger)
-   **Baza Danych (MariaDB):** Dostępna na porcie `3306` dla `localhost`

---

## 💻 Uruchamianie manualne (bez Dockera)

Jeśli nie chcesz używać Dockera, możesz uruchomić każdą część aplikacji osobno.

### 1. Backend
```bash
# Przejdź do folderu backendu
cd backend-python

# Utwórz środowisko wirtualne
python -m venv venv
source venv/bin/activate  # Linux/Mac
# lub
venv\Scripts\activate     # Windows

# Zainstaluj zależności
pip install -r requirements.txt

# Uruchom API (będzie działać na http://localhost:8100)
python app.py
```

### 2. Frontend
```bash
# Otwórz nowy terminal i przejdź do folderu crm-ui
cd crm-ui

# Zainstaluj zależności
npm install

# Uruchom serwer deweloperski (będzie działać na http://localhost:5173)
npm run dev
```

### 3. Aplikacja Mobilna
```bash
# Otwórz nowy terminal i przejdź do folderu crm-mobile
cd crm-mobile

# Zainstaluj zależności
npm install

# Uruchom aplikację (będzie działać na http://localhost:8081)
npx expo start
```
> **Uwaga:** Przy uruchomieniu manualnym upewnij się, że masz lokalnie działającą instancję bazy danych MySQL/MariaDB i zaktualizowałeś konfigurację połączenia w backendzie.

---

## 🚧 Status projektu

Projekt jest **ukończony i gotowy do obrony**. Wszystkie kluczowe moduły zostały zaimplementowane i przetestowane. System jest w pełni funkcjonalny i gotowy do wdrożenia w środowisku biznesowym.

## 📚 Dokumentacja

Kompletna dokumentacja projektu znajduje się w pliku **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)**.

### Główne dokumenty:
- 📄 **[Prezentacja_Projekt_CRM.md](Prezentacja_Projekt_CRM.md)** - Główna prezentacja projektu
- 📄 **[JAK_BUDOWAŁEM_APLIKACJĘ_KROK_PO_KROKU.md](JAK_BUDOWAŁEM_APLIKACJĘ_KROK_PO_KROKU.md)** - Proces budowy krok po kroku
- 📄 **[backend-python/README.md](backend-python/README.md)** - Dokumentacja backendu

## 🎓 Przygotowanie do obrony

Wszystkie niezbędne dokumenty i instrukcje znajdziesz w **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)**.

## 📊 Metryki projektu

- **Liczba endpointów API:** 50+
- **Liczba tabel w bazie:** 20+
- **Liczba komponentów React:** 100+
- **Liczba ekranów mobilnych:** 15+
- **Liczba linii kodu:** 15,000+
- **Czas realizacji:** 6 miesięcy