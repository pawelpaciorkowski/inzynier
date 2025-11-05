# 🎯 SZYBKI PRZEWODNIK NA OBRONĘ - NAJWAŻNIEJSZE PUNKTY

## 1. CO TO JEST APLIKACJA? (30 sekund)

**System CRM (Customer Relationship Management)** - system do zarządzania relacjami z klientami:
- Zarządzanie klientami, fakturami, umowami
- System zadań i przypomnień
- Generowanie dokumentów (PDF, DOCX)
- Raportowanie i statystyki
- Działa na komputerze (web) i telefonie (mobile)

---

## 2. ARCHITEKTURA (1 minuta)

### Trójwarstwowa architektura:

```
┌─────────────────────────────────┐
│  WARSTWA PREZENTACJI            │
│  - Aplikacja webowa (React)     │
│  - Aplikacja mobilna (React Native)│
└──────────────┬──────────────────┘
               │ HTTP/REST + JWT
               ▼
┌─────────────────────────────────┐
│  WARSTWA LOGIKI BIZNESOWEJ      │
│  - RESTful API (Flask)          │
│  - Blueprints (organizacja)     │
│  - Controllers (endpointy)      │
└──────────────┬──────────────────┘
               │ ORM (SQLAlchemy)
               ▼
┌─────────────────────────────────┐
│  WARSTWA DANYCH                 │
│  - MariaDB/MySQL                │
│  - Modele (SQLAlchemy)          │
└─────────────────────────────────┘
```

---

## 3. TECHNOLOGIE (30 sekund)

### Backend:
- **Python Flask** - framework webowy
- **SQLAlchemy** - ORM (mapowanie obiektów na bazę danych)
- **JWT** - autoryzacja (tokeny)
- **bcrypt** - szyfrowanie haseł
- **ReportLab** - generowanie PDF
- **python-docx** - generowanie dokumentów Word

### Frontend Web:
- **React + TypeScript** - biblioteka do UI
- **Vite** - narzędzie do budowania
- **TailwindCSS** - stylowanie
- **Axios** - komunikacja z API

### Mobile:
- **React Native + Expo** - aplikacja mobilna
- **Expo Router** - nawigacja
- **Expo SecureStore** - bezpieczne przechowywanie tokenów

---

## 4. KLUCZOWE FUNKCJONALNOŚCI (1 minuta)

1. **Zarządzanie klientami** - CRUD, tagi, przedstawiciele
2. **Faktury i płatności** - tworzenie, śledzenie płatności
3. **Umowy** - zarządzanie kontraktami z automatycznym naliczaniem
4. **Zadania i przypomnienia** - system zadań z powiadomieniami
5. **Raporty** - eksport do CSV/Excel/PDF
6. **Generowanie dokumentów** - PDF faktur, umowy z szablonów
7. **System grup** - zarządzanie zespołami
8. **Kalendarz i spotkania** - zarządzanie terminami
9. **System powiadomień** - powiadomienia w czasie rzeczywistym
10. **Historia logowań i logi** - bezpieczeństwo i audyt

---

## 5. CO SAM ROBISZ - KLUCZOWE KONCEPCJE (2 minuty)

### Blueprint (organizacja kodu):
- **Po co?** Organizacja kodu - każda funkcjonalność w osobnym pliku
- **Przykład:** `customers_bp`, `invoices_bp`, `reports_bp`
- **Korzyści:** Czytelność, łatwość współpracy, skalowalność

### Model vs Controller:
- **Model** (`app/models/`) - definicja struktury danych w bazie
  - Przykład: `class Customer(db.Model)` - definiuje kolumny, relacje
  - Metoda `to_dict()` - konwersja do JSON
- **Controller** (`app/controllers/`) - obsługa żądań HTTP
  - Przykład: `@customers_bp.route('/')` - endpoint GET/POST/PUT/DELETE
  - Używa modeli do operacji na danych

### ORM vs Raw SQL:
- **ORM** - dla prostych operacji (CRUD)
  - Przykład: `Customer.query.get(id)` - czytelny kod Python
  - Bezpieczeństwo - automatyczna ochrona przed SQL Injection
- **Raw SQL** - dla złożonych zapytań (raporty, statystyki)
  - Przykład: Złożone agregacje, dynamiczne zapytania
  - Gdzie: `reports.py`, `admin.py` (dashboardy, statystyki)

### Autoryzacja JWT:
- **Jak działa:** Użytkownik loguje się → otrzymuje token JWT → token w każdym żądaniu
- **Dekorator `@require_auth`** - sprawdza token przed każdym endpointem
- **Bezpieczeństwo:** Token zawiera dane użytkownika (id, role), ważność czasowa

---

## 6. BEZPIECZEŃSTWO (30 sekund)

1. **JWT Token** - autoryzacja wszystkich endpointów
2. **bcrypt** - hasła hashowane (nie można ich odczytać)
3. **CORS** - kontrola dostępu z różnych domen
4. **ORM** - ochrona przed SQL Injection
5. **Walidacja danych** - sprawdzanie danych wejściowych
6. **Role użytkowników** - Admin vs User (różne uprawnienia)

---

## 7. NAJWAŻNIEJSZE ROZWIĄZANIA TECHNICZNE (1 minuta)

### 1. Dynamiczne zapytania SQL (raporty):
- Budowanie zapytania w pętli w zależności od wybranych kolumn
- Użycie `text()` z SQLAlchemy dla elastyczności
- Przykład: `export_customers`, `export_contracts`

### 2. Generowanie PDF z polskimi znakami:
- Rejestracja czcionek DejaVu Sans
- Formatowanie tabel z ReportLab
- Automatyczne dzielenie na strony dla dużych tabel

### 3. Generowanie umów z szablonów:
- Upload szablonów .docx
- Dynamiczne wypełnianie pól (klient, firma, daty)
- Zastępowanie placeholderów (`{{customerName}}` → "Jan Kowalski")

### 4. System powiadomień:
- Context API w React - globalny stan
- Komponent Modal - reużywalny dla wszystkich powiadomień
- Automatyczne powiadomienia przy zdarzeniach

### 5. Synchronizacja danych (mobile):
- `useFocusEffect` - automatyczne odświeżanie po powrocie na ekran
- Zapobieganie nieskończonym pętlom (useRef, flagi)
- Przykład: Lista klientów odświeża się po edycji

---

## 8. STRUKTURA BAZY DANYCH (30 sekund)

### Główne tabele:
- `Users` - użytkownicy systemu
- `Customers` - klienci
- `Invoices` - faktury
- `Contracts` - umowy
- `Tasks` - zadania
- `Groups` - grupy/zespoły
- `Tags` - tagi do kategoryzacji
- `Payments` - płatności

### Relacje:
- **One-to-Many:** Klient → Faktury (jeden klient, wiele faktur)
- **Many-to-Many:** Klienci ↔ Tagi (tabela `CustomerTags`)
- **Foreign Keys:** Powiązania między tabelami (np. `Invoice.CustomerId`)

---

## 9. CO MÓWIĆ NA OBRONIE - STRUKTURA ODPOWIEDZI

### 1. Wprowadzenie (1 minuta):
"Mój system CRM to aplikacja do zarządzania relacjami z klientami. Składa się z trzech części: aplikacji webowej w React, aplikacji mobilnej w React Native, oraz backendu w Python Flask. Architektura jest trójwarstwowa - prezentacja, logika biznesowa i warstwa danych."

### 2. Technologie (1 minuta):
"Backend używa Flask z SQLAlchemy jako ORM. Autoryzacja oparta na tokenach JWT. Frontend webowy to React z TypeScript, a mobilna wersja to React Native z Expo. Baza danych to MariaDB/MySQL."

### 3. Organizacja kodu (1 minuta):
"Kod backendu jest zorganizowany w Blueprinty - każda funkcjonalność ma swój moduł (customers, invoices, reports). Modele definiują strukturę danych, a kontrolery obsługują żądania HTTP. Używam ORM dla prostych operacji, a raw SQL dla złożonych raportów."

### 4. Kluczowe funkcjonalności (2 minuty):
"System umożliwia pełne zarządzanie klientami, fakturami, umowami i zadaniami. Generuję dokumenty PDF i Word z szablonów. System raportów pozwala eksportować dane do CSV, Excel i PDF. Aplikacja mobilna synchronizuje się z backendem i automatycznie odświeża dane."

### 5. Bezpieczeństwo (30 sekund):
"Bezpieczeństwo zapewnia autoryzacja JWT, hasła są hashowane bcrypt, wszystkie endpointy wymagają autoryzacji, a ORM chroni przed SQL Injection."

---

## 10. TYPOWE PYTANIA I ODPOWIEDZI

### Q: Dlaczego użyłeś ORM zamiast samego SQL?
A: "ORM upraszcza kod, zapewnia bezpieczeństwo (ochrona przed SQL Injection) i ułatwia zarządzanie relacjami. Raw SQL używam tylko dla złożonych zapytań w raportach, gdzie potrzebuję pełnej kontroli i optymalizacji."

### Q: Jak działa autoryzacja?
A: "Użytkownik loguje się, otrzymuje token JWT, który zawiera jego ID i rolę. Token jest wysyłany w każdym żądaniu. Dekorator `@require_auth` sprawdza token przed wykonaniem endpointu. Hasła są hashowane bcrypt - nie można ich odczytać."

### Q: Jak synchronizujesz dane między web a mobile?
A: "Oba frontendy używają tego samego API REST. Aplikacja mobilna używa `useFocusEffect` do automatycznego odświeżania danych po powrocie na ekran. Używam flag i refs w React, aby uniknąć nieskończonych pętli."

### Q: Jak generujesz dokumenty?
A: "PDF generuję z ReportLab - rejestruję polskie czcionki, tworzę tabele i formatuję dane. Umowy generuję z szablonów .docx - użytkownik uploaduje szablon, a ja zastępuję placeholdery danymi z bazy."

### Q: Jak działa system raportów?
A: "Raporty budują dynamiczne zapytania SQL w zależności od wybranych kolumn. Użytkownik wybiera kolumny i format (CSV/Excel/PDF), a system generuje odpowiedni plik. Używam raw SQL dla elastyczności w dynamicznych zapytaniach."

### Q: Czym jest Blueprint?
A: "Blueprint to sposób organizacji kodu w Flask. Każda funkcjonalność ma swój moduł - customers, invoices, reports. To ułatwia zarządzanie kodem, współpracę w zespole i dodawanie nowych funkcji."

---

## 11. NAJWAŻNIEJSZE NUMERY (do zapamiętania)

- **3 warstwy** architektury
- **20+ Blueprintów** w backendzie
- **10+ głównych funkcjonalności**
- **3 formaty eksportu** (CSV, Excel, PDF)
- **2 platformy** (Web + Mobile)
- **JWT** - autoryzacja
- **ORM** - SQLAlchemy
- **bcrypt** - szyfrowanie haseł

---

## 12. PUNKTY DO PODKREŚLENIA

✅ **Samodzielność** - wszystkie funkcje samodzielnie zaimplementowane
✅ **Bezpieczeństwo** - JWT, bcrypt, walidacja
✅ **Skalowalność** - modularna architektura (Blueprints)
✅ **Elastyczność** - dynamiczne raporty, szablony dokumentów
✅ **Kompletność** - pełny system CRUD dla wszystkich modułów
✅ **Dokumentacja** - kompletna dokumentacja kodu
✅ **Testy** - testy backendu (pytest)

---

## 13. CO POKAZAĆ NA DEMO (jeśli będą pytać)

1. Logowanie (web + mobile)
2. Dodanie klienta
3. Utworzenie faktury
4. Dodanie płatności → odświeżenie w mobile
5. Generowanie raportu PDF
6. Eksport do Excel
7. System zadań i przypomnień
8. Panel administracyjny

---

## 14. NAJWAŻNIEJSZE SŁOWA KLUCZOWE

- **Architektura trójwarstwowa**
- **RESTful API**
- **JWT autoryzacja**
- **ORM (SQLAlchemy)**
- **Blueprint (organizacja)**
- **Model-View-Controller**
- **React + TypeScript**
- **React Native + Expo**
- **Dynamiczne zapytania**
- **Generowanie dokumentów**

---

## 15. STRUKTURA ODPOWIEDZI NA PYTANIA

1. **Zrozum pytanie** - upewnij się, że dobrze zrozumiałeś
2. **Krótka odpowiedź** - 1-2 zdania
3. **Szczegóły techniczne** - jeśli pytają o szczegóły
4. **Przykład z kodu** - jeśli możesz, podaj przykład

**Przykład:**
Q: "Jak działa autoryzacja?"
A: "Autoryzacja oparta na tokenach JWT. Użytkownik loguje się, otrzymuje token, który zawiera jego ID i rolę. Każdy endpoint ma dekorator `@require_auth`, który sprawdza token przed wykonaniem. Token jest wysyłany w nagłówku Authorization."

---

## ✅ CHECKLIST PRZED OBRONĄ

- [ ] Zrozumiałem architekturę (3 warstwy)
- [ ] Wiem co to Blueprint i po co go używam
- [ ] Wiem różnicę między Modelem a Kontrolerem
- [ ] Wiem kiedy używam ORM, a kiedy raw SQL
- [ ] Wiem jak działa autoryzacja JWT
- [ ] Znam główne funkcjonalności (10+)
- [ ] Wiem jak generuję dokumenty (PDF, DOCX)
- [ ] Wiem jak działają raporty
- [ ] Potrafię wyjaśnić synchronizację web-mobile
- [ ] Znam najważniejsze technologie

---

## 🎯 NAJWAŻNIEJSZE - CO POWIEDZIEĆ NA POCZĄTKU (2 minuty)

"Mój system CRM to aplikacja do zarządzania relacjami z klientami. Składa się z trzech części: aplikacji webowej w React, aplikacji mobilnej w React Native, oraz backendu w Python Flask.

Architektura jest trójwarstwowa - warstwa prezentacji (React/React Native), warstwa logiki biznesowej (Flask API), i warstwa danych (MariaDB/MySQL).

Backend jest zorganizowany w Blueprinty - każda funkcjonalność ma swój moduł. Modele definiują strukturę danych, a kontrolery obsługują żądania HTTP. Używam ORM (SQLAlchemy) dla prostych operacji, a raw SQL dla złożonych raportów.

System umożliwia pełne zarządzanie klientami, fakturami, umowami, zadaniami. Generuję dokumenty PDF i Word. Raporty eksportują dane do CSV, Excel i PDF. Autoryzacja oparta na JWT, hasła hashowane bcrypt.

Wszystkie funkcjonalności zostały zaimplementowane samodzielnie, kod jest zorganizowany i udokumentowany."

---

**POWODZENIA! 🍀**

