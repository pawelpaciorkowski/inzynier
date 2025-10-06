---

# 📱 CRM Mobile – Aplikacja mobilna (Expo)

> Część projektu inżynierskiego: **Zintegrowany system CRM**  
> Moduł: **Mobilna wersja systemu CRM**  
> Autor: **Paweł Paciorkowski**

---

## 🚀 Opis aplikacji

Mobilna wersja systemu CRM umożliwia dostęp do podstawowych funkcjonalności platformy z poziomu urządzenia mobilnego.  
Projekt oparty na **React Native + Expo** z wykorzystaniem **nawigacji** i **TypeScript**.

---

## 📦 Struktura katalogów

```

crm-mobile/
├── app/           # Główne widoki ekranów
├── assets/        # Ikony, grafiki, czcionki
├── components/    # Komponenty wielokrotnego użytku
├── constants/     # Stałe, kolory, typy
├── node\_modules/  # Pakiety npm (ignorowane przez git)
├── app.json       # Konfiguracja Expo
├── package.json   # Skrypty, zależności
└── tsconfig.json  # Konfiguracja TypeScript

````

---

## 🔧 Instalacja

Zalecana wersja Node: **v18+**  
Zainstaluj Expo CLI (jeśli jeszcze nie masz):

```bash
npm install -g expo-cli
````

---

## ▶️ Uruchomienie

Z katalogu `crm-mobile`:

```bash
npm install         # instalacja zależności
npm run web         # uruchomienie w przeglądarce (testowo)
npm run android     # emulator Androida lub urządzenie z Expo Go
npm run ios         # (macOS) emulator iOS lub Expo Go
```

📱 Aby testować na telefonie:

* zainstaluj aplikację **Expo Go** z Google Play / App Store
* zeskanuj QR kod z terminala po uruchomieniu

---

## 🛠️ Zaimplementowane Funkcjonalności

✅ **Logowanie użytkownika (JWT)**
- Bezpieczne logowanie z tokenem JWT
- Automatyczne przechowywanie sesji w SecureStore
- Logowanie z różnych urządzeń

✅ **Lista zadań**
- Wyświetlanie zadań przypisanych użytkownikowi
- Oznaczanie zadań jako ukończone
- Dodawanie nowych zadań
- Edycja i usuwanie zadań

✅ **Lista klientów**
- Przeglądanie klientów
- Szczegóły kontaktu
- Podstawowe informacje biznesowe

✅ **Przypomnienia**
- System przypomnień z powiadomieniami
- Automatyczne alerty o terminach
- Zarządzanie przypomnieniami

✅ **Powiadomienia**
- Ikona powiadomień z licznikiem nieprzeczytanych
- Lista powiadomień
- Oznaczanie jako przeczytane

✅ **Aktywności**
- Historia aktywności użytkownika
- Logi działań w systemie
- Szczegóły operacji

✅ **Synchronizacja z backendem**
- Pełna integracja z REST API
- Automatyczna synchronizacja danych
- Obsługa błędów sieciowych

---

## 📱 Screenshots

### Ekran logowania
- Prosty formularz logowania
- Automatyczne wypełnianie danych testowych
- Obsługa błędów autoryzacji

### Dashboard
- Przegląd zadań
- Najnowsze przypomnienia
- Szybki dostęp do funkcji

### Zadania
- Lista zadań z statusami
- Filtrowanie i sortowanie
- Akcje: edycja, usuwanie, oznaczanie

### Klienci
- Lista klientów z podstawowymi danymi
- Szczegóły kontaktu
- Historia interakcji

---

## 🧪 Status

✅ **Projekt ukończony i gotowy do produkcji**

Aplikacja mobilna jest w pełni funkcjonalna i zsynchronizowana z backendem. Wszystkie zaplanowane funkcjonalności zostały zaimplementowane i przetestowane.

````

