Jasne, przygotowałem kompleksowy opis Twojej aplikacji, idealny do omówienia podczas code review z promotorem. Skupiłem się na architekturze, kluczowych technologiach i najciekawszych rozwiązaniach, które zaimplementowałeś.

---

## Dokumentacja Aplikacji CRM

### 1. Wprowadzenie i Cel Aplikacji

Celem projektu było stworzenie prostego systemu CRM (Customer Relationship Management) w architekturze Klient-Serwer. Aplikacja składa się z dwóch głównych części:

* **Backend (API):** Zbudowany w technologii .NET, odpowiedzialny za logikę biznesową, zarządzanie danymi i uwierzytelnianie.
* **Frontend (Aplikacja Mobilna):** Stworzony przy użyciu React Native z Expo, zapewniający interfejs użytkownika do interakcji z systemem.

Aplikacja umożliwia zarządzanie klientami, zadaniami, fakturami oraz powiadomieniami, z podziałem na role i zabezpieczeniem dostępu.

---

### 2. Backend: .NET Web API

Backend stanowi serce systemu, dostarczając RESTful API do komunikacji z aplikacją mobilną.

#### **Architektura i Technologie**

* **Język/Framework:** C# z ASP.NET Core Web API.
* **Dostęp do danych:** Entity Framework Core (EF Core) z podejściem "Code-First". Definicje modeli C# służą jako schemat dla bazy danych.
* **Baza Danych:** `ApplicationDbContext` jest centralnym punktem koordynującym zapytania do bazy danych za pomocą EF Core.
* **Uwierzytelnianie:** System oparty na **tokenach JWT (JSON Web Tokens)**, co jest standardem w nowoczesnych aplikacjach.

#### **Kluczowe Komponenty**

**a) Modele (`/Models`)**

Definiują strukturę danych w aplikacji. Każda klasa odpowiada tabeli w bazie danych.

* `User.cs`: Przechowuje dane użytkowników, w tym login i hash hasła.
* `Customer.cs`: Reprezentuje klientów firmy.
* `Task.cs`, `Invoice.cs`, `Notification.cs`: Reprezentują inne kluczowe obiekty biznesowe, często powiązane z klientami lub użytkownikami.

**b) Kontrolery (`/Controllers`)**

Implementują logikę API, definiując tzw. "endpoints", czyli adresy, z którymi łączy się aplikacja mobilna.

* **Struktura:** Każdy kontroler używa atrybutów `[Route("api/[controller]")]` i `[ApiController]`, co standaryzuje adresy URL.
* **Zabezpieczenia:** Kluczowy atrybut **`[Authorize]`** jest używany na poziomie całych kontrolerów lub pojedynczych metod, aby zapewnić, że tylko zalogowani użytkownicy (z ważnym tokenem JWT) mogą uzyskać dostęp do danych.

**Najciekawsze rozwiązania w kontrolerach:**

* **`AuthController.cs`**:
    * **Endpoint `/login`**: To tutaj dzieje się "magia" logowania. Metoda przyjmuje login i hasło, weryfikuje je z danymi w bazie, a jeśli są poprawne, **generuje token JWT**. Token ten zawiera informacje o użytkowniku (np. ID, rolę) i jest podpisany tajnym kluczem, co gwarantuje jego autentyczność. Następnie jest odsyłany do aplikacji mobilnej.
    * **Endpoint `/register`**: Umożliwia rejestrację nowych użytkowników, haszując hasło przed zapisem do bazy, co jest kluczowe dla bezpieczeństwa.

* **`CustomersController.cs` (i inne podobne)**:
    * Implementują operacje **CRUD** (Create, Read, Update, Delete) za pomocą metod HTTP (`[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpDelete]`).
    * Intensywnie korzystają z `ApplicationDbContext` do wykonywania operacji na bazie danych w sposób asynchroniczny (`async`/`await`), co zapewnia wysoką wydajność serwera.

---

### 3. Frontend: Aplikacja Mobilna (React Native + Expo)

Frontend to nowoczesna aplikacja mobilna napisana w TypeScript, wykorzystująca framework Expo do uproszczenia procesu budowy i rozwoju.

#### **Architektura i Technologie**

* **Framework:** React Native z Expo.
* **Język:** TypeScript, zapewniający bezpieczeństwo typów i lepszą organizację kodu.
* **Nawigacja:** **Expo Router** – to jedno z najciekawszych i najnowocześniejszych rozwiązań. Zamiast skomplikowanej konfiguracji nawigacji w kodzie, struktura aplikacji opiera się na **strukturze plików i folderów** w katalogu `app`.
* **Komunikacja z API:** Biblioteka `axios` do wykonywania zapytań HTTP do backendu.
* **Zarządzanie stanem:** React Context (`AuthContext`) do globalnego zarządzania stanem sesji użytkownika.

#### **Kluczowe Komponenty i Rozwiązania**

**a) Nawigacja oparta na plikach (Expo Router)**

To centralny punkt architektury frontendu. Struktura folderu `app` bezpośrednio definiuje trasy w aplikacji.

* **Grupy Tras (Route Groups):** Zastosowałeś bardzo elegancki wzorzec, tworząc foldery `(auth)` i `(protected)`.
    * `(auth)`: Zawiera ekrany dostępne dla niezalogowanych użytkowników (np. `login.tsx`).
    * `(protected)`: Zawiera wszystkie ekrany dostępne tylko po zalogowaniu (np. taby z klientami, fakturami).
    * Nawiasy w nazwach folderów sprawiają, że nie są one częścią adresu URL, służą jedynie do organizacji kodu.

* **Layouty (`_layout.tsx`):**
    * **`app/_layout.tsx` (Główny Layout):** Działa jak **strażnik (gatekeeper)** całej aplikacji. To tutaj zaimplementowana jest kluczowa logika, która decyduje, czy pokazać użytkownikowi ekrany z grupy `(auth)` czy `(protected)`.
    * **`app/(protected)/_layout.tsx`**: Działa jak "pusta ramka" dla chronionej sekcji. Jego jedynym celem jest renderowanie komponentu `<Slot />`, który wyświetla dalszą część drzewa nawigacji (w tym przypadku layout z zakładkami).
    * **`app/(protected)/(tabs)/_layout.tsx`**: Ten plik definiuje i konfiguruje nawigator z zakładkami (`<Tabs>`), określając, jakie ekrany (np. `customers.tsx`) mają być dostępne jako taby na dole ekranu.

**b) Zarządzanie Sesją Użytkownika (`AuthContext.tsx`)**

To jest "mózg" sesji użytkownika w aplikacji mobilnej.

* **Cel:** Dostarcza globalny stan (`token`, `isAuthenticated`, `isLoading`) oraz funkcje (`login`, `logout`) do każdego komponentu w aplikacji.
* **`useEffect` na starcie:** Przy pierwszym uruchomieniu aplikacja próbuje wczytać token z bezpiecznej pamięci urządzenia.
* **Bezpieczne przechowywanie tokena:** Użyłeś biblioteki **`expo-secure-store`**. To bardzo ważne z punktu widzenia bezpieczeństwa – na urządzeniach mobilnych tokeny JWT nigdy nie powinny być przechowywane w zwykłym `AsyncStorage`, ponieważ nie jest on szyfrowany. `SecureStore` wykorzystuje natywne mechanizmy systemu (jak Keychain na iOS) do bezpiecznego przechowywania danych.
* **Funkcja `login`:** Wywołuje zapytanie do `api/Auth/login`, a po otrzymaniu tokena zapisuje go w `SecureStore` i aktualizuje globalny stan, co powoduje automatyczne przekierowanie użytkownika.
* **Nagłówki `axios`:** Po zalogowaniu token jest automatycznie dodawany do domyślnych nagłówków `axios`, dzięki czemu każde kolejne zapytanie do API jest już uwierzytelnione.

**c) Przykładowy Ekran (`customers.tsx`)**

Ten ekran doskonale ilustruje, jak wszystkie elementy układanki współpracują ze sobą.

1.  Używa hooka `useAuth()`, aby uzyskać dostęp do tokena potrzebnego do komunikacji z API.
2.  Wykorzystuje `useState` do zarządzania lokalnym stanem: listą klientów, stanem ładowania i ewentualnymi błędami.
3.  Używa `useEffect` w połączeniu z `useCallback`, aby efektywnie pobrać listę klientów z backendu (`/api/Customers`) zaraz po wyświetleniu ekranu.
4.  Wyświetla dane w komponencie `<FlatList>`, który jest zoptymalizowany do renderowania długich list.

---

### 4. Podsumowanie i Najciekawsze Rozwiązania 🌟

Podczas rozmowy z promotorem warto podkreślić następujące punkty jako kluczowe i świadczące o nowoczesnym podejściu do tworzenia aplikacji:

1.  **Separacja Backend/Frontend:** Jasny podział odpowiedzialności między logiką serwerową w .NET a interfejsem użytkownika w React Native.
2.  **Bezpieczeństwo oparte na JWT:** Implementacja standardowego i bezpiecznego mechanizmu uwierzytelniania od generacji tokena na backendzie, po jego bezpieczne przechowywanie na frontendzie.
3.  **Nowoczesna nawigacja w Expo Router:** Wykorzystanie grup tras do eleganckiego oddzielenia części publicznej od prywatnej, co jest znacznie czystszym rozwiązaniem niż tradycyjne, skomplikowane konfiguracje nawigacji.
4.  **Centralne zarządzanie stanem sesji:** Użycie React Context do stworzenia jednego, wiarygodnego źródła informacji o stanie zalogowania użytkownika, dostępnego w całej aplikacji.
5.  **Podejście "Code-First" z EF Core:** Ułatwienie zarządzania schematem bazy danych i jego ewolucją wraz z rozwojem aplikacji.

Ten projekt to świetny przykład pełnej aplikacji full-stack, demonstrujący znajomość kluczowych technologii i wzorców projektowych. Powodzenia na code review!
