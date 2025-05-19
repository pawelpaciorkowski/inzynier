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

## 🛠️ Funkcjonalności (planowane)

* Logowanie użytkownika (JWT)
* Lista zadań przypisanych użytkownikowi
* Lista klientów i dane kontaktowe
* Powiadomienia push (Expo Notifications)
* Synchronizacja z backendem REST API

---

## 📬 Kontakt

Jeśli masz pytania, napisz przez platformę uczelni lub GitLaba.

---

## 🧪 Status

Projekt mobilny jest w fazie wstępnej. Docelowo będzie zawierać uproszczone wersje kluczowych widoków dostępnych w wersji webowej systemu CRM.

````

