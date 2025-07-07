# 📊 Zintegrowany System CRM – Projekt Inżynierski

> Autor: **Paweł Paciorkowski** > Kierunek: Informatyka, IV rok  
> Specjalność: Programista aplikacji biznesowych

---

## 🧩 Opis projektu

**Zintegrowany System CRM** to zaawansowana platforma stworzona w ramach pracy inżynierskiej, której celem jest usprawnienie i automatyzacja kluczowych procesów biznesowych związanych z zarządzaniem relacjami z klientem.

Aplikacja składa się z trzech głównych, w pełni zintegrowanych komponentów:
1.  **Backend RESTful API** w technologii **ASP.NET Core**, pełniący rolę serca systemu, obsługujący logikę biznesową i komunikację z bazą danych.
2.  **Aplikacja webowa** w technologii **React + TypeScript**, stanowiąca rozbudowany panel do zarządzania wszystkimi aspektami systemu.
3.  **Aplikacja mobilna** w technologii **React Native (Expo)**, zapewniająca dostęp do kluczowych funkcji z urządzeń mobilnych.

System został zaprojektowany z myślą o spełnieniu rygorystycznych wymagań akademickich oraz biznesowych, kładąc nacisk na nowoczesne technologie, dobre praktyki architektoniczne i realną użyteczność.

---

## 💡 Technologie

| Kategoria | Technologia |
| :--- | :--- |
| **Frontend (Web)** | React, TypeScript, Vite, TailwindCSS, React Router, Axios, Heroicons |
| **Backend** | ASP.NET Core 9.0, Entity Framework Core, C# |
| **Baza Danych** | MariaDB (MySQL) |
| **API** | REST, JWT Token Authorization, Swagger (OpenAPI) |
| **Mobilna** | React Native, Expo, Expo Router, `expo-secure-store` |
| **Generowanie Plików** | **QuestPDF** (dla raportów PDF), **DocX** (dla szablonów .docx) |
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
├── backend/        # Projekt ASP.NET Core (API + logika biznesowa + EF Core)
├── crm-ui/         # Webowy frontend (Vite + React)
├── crm-mobile/     # Mobilna aplikacja (Expo + React Native)
├── .gitignore
├── docker-compose.yml
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
**Ważne:** Po pierwszym uruchomieniu kontenerów, upewnij się, że migracje bazy danych zostały zastosowane. Możesz to zrobić, wchodząc do kontenera backendu i uruchamiając komendę:
```bash
# Wejdź do kontenera backendu (nazwa serwisu z docker-compose.yml, np. 'backend')
docker exec -it <nazwa_kontenera_backendu> bash

# Wewnątrz kontenera, przejdź do katalogu projektu CRM.API i zastosuj migracje
# (Zakładając, że projekt jest w /app/CRM.API w kontenerze)
cd /app/CRM.API
dotnet ef database update
exit
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
cd backend

# Zbuduj projekt
dotnet build

# Uruchom API (będzie działać na http://localhost:5167)
# Ta komenda automatycznie zastosuje migracje bazy danych przy starcie.
dotnet run --project CRM.API
```

### 2. Frontend (Web)
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

# Ustaw zmienną środowiskową dla adresu API
# Utwórz plik .env w katalogu crm-mobile i dodaj do niego:
# EXPO_PUBLIC_API_URL=http://TWOJE_IP_KOMPUTERA:5000
# Zastąp TWOJE_IP_KOMPUTERA adresem IP, pod którym działa Twój backend (np. 192.168.1.14).
# Upewnij się, że port 5000 jest dostępny w Twojej sieci lokalnej.

# Uruchom serwer deweloperski Expo
npx expo start
```
> **Uwaga:** Przy uruchomieniu manualnym upewnij się, że masz lokalnie działającą instancję bazy danych MySQL/MariaDB i zaktualizowałeś `ConnectionString` w pliku `appsettings.json` w backendzie.

---

## 🚧 Status projektu

Projekt jest w fazie **aktywnego rozwoju**. Kluczowe moduły zostały zaimplementowane, a kolejne funkcjonalności są dodawane regularnie w celu spełnienia wszystkich wymagań pracy inżynierskiej.