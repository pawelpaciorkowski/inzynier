# 📊 Zintegrowany System CRM – Projekt Inżynierski

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
└── README.md
```

---

## 💻 Uruchamianie aplikacji

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

# Uruchom API (będzie działać na http://localhost:5000)
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

# Uruchom aplikację
npx expo start
```
> **Uwaga:** Upewnij się, że masz lokalnie działającą instancję bazy danych MySQL/MariaDB i zaktualizowałeś konfigurację połączenia w backendzie.

---

## 🚧 Status projektu

Projekt jest **ukończony i gotowy do obrony**. Wszystkie kluczowe moduły zostały zaimplementowane i przetestowane. System jest w pełni funkcjonalny i gotowy do wdrożenia w środowisku biznesowym.

## 📚 Dokumentacja

Szczegółowa dokumentacja backendu znajduje się w pliku **[backend-python/README.md](backend-python/README.md)**.

## 📊 Metryki projektu

- **Liczba endpointów API:** 50+
- **Liczba tabel w bazie:** 20+
- **Liczba komponentów React:** 100+
- **Liczba ekranów mobilnych:** 15+
- **Liczba linii kodu:** 15,000+
- **Czas realizacji:** 6 miesięcy