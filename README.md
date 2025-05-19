Świetnie, że dodałeś już aplikację mobilną! Poniżej:

---

### ✅ 1. **Usuń duplikat folderu**

Obecnie masz strukturę:
`crm-mobile/crm-mobile`
Przenieś zawartość *wewnętrznego* folderu `crm-mobile` o jeden poziom wyżej:

```bash
# z poziomu głównego katalogu projektu
mv crm-mobile/crm-mobile/* crm-mobile/
rm -r crm-mobile/crm-mobile
```

---

### ✅ 2. **Poprawiony `README.md` (z opisem mobilki)**

```markdown
# 📊 CRM Panel – Projekt Inżynierski

> Autor: **Paweł Paciorkowski**  
> Kierunek: Informatyka, IV rok  
> Specjalność: Programista aplikacji biznesowych  
> Temat: **Zintegrowany system CRM dla zarządzania klientami, użytkownikami i zadaniami**

---

## 🧩 Opis projektu

System CRM (Customer Relationship Management) został zaprojektowany jako zintegrowana platforma do zarządzania:
- klientami i ich danymi,
- zadaniami przypisanymi użytkownikom,
- rolami i grupami uprawnień,
- dokumentami i płatnościami,
- komunikacją i aktywnością w systemie.

Aplikacja zawiera panel administracyjny z autoryzacją użytkowników, zaawansowanym routingiem, widokami podzielonymi na sekcje oraz dynamicznym interfejsem użytkownika. Rozwijana jest także wersja **mobilna**.

---

## 💡 Technologie

### Frontend (Web):
- ⚛️ React + TypeScript + Vite
- 💨 TailwindCSS
- 🧭 React Router
- 💬 Heroicons
- 🔐 JWT Auth (Context API)

### Backend:
- 🟦 ASP.NET Core 9.0
- 🧠 Entity Framework Core
- 🐬 MySQL
- 🔐 JWT Token Authorization
- 🔄 RESTful API
- 📑 Swagger (OpenAPI)

### Mobilna (Expo):
- 📱 React Native + Expo
- 🗂️ Navigation (TypeScript)
- 🔐 JWT Auth (planowane)
- 📦 Obsługa Android/iOS/Web

---

## 📂 Struktura projektu

```

projekt-inzynierski/
├── backend/        # Projekt ASP.NET Core (API + logika biznesowa + EF Core)
├── crm-ui/         # Webowy frontend (Vite + React)
├── crm-mobile/     # Mobilna aplikacja (Expo + React Native + TypeScript)
├── .gitignore
└── README.md       # Ten plik

````

---

## 🔐 Moduł uwierzytelniania

- Rejestracja i logowanie z JWT
- Role użytkowników (Admin, User)
- Middleware w API zabezpieczające dostęp do zasobów

---

## 📌 Kluczowe funkcjonalności

| Moduł               | Opis                                                                 |
|--------------------|----------------------------------------------------------------------|
| 👥 Klienci          | Lista, dodawanie, tagowanie klientów                                 |
| 🔐 Użytkownicy      | Lista, edycja, przypisywanie ról i grup                              |
| 📋 Zadania          | Moje zadania i wszystkie zadania w systemie                          |
| 🧾 Dokumenty        | Kontrakty, faktury, płatności                                         |
| 📅 Kalendarz        | Wydarzenia, spotkania, przypomnienia                                 |
| 🧠 System           | Historia logowań, logi systemowe, ustawienia                         |
| 💬 Komunikacja     | Wiadomości, notatki, powiadomienia                                   |
| 🧩 Eksporty i raporty | Generowanie raportów i eksporty danych do PDF/Excel                  |

---

## 📦 Uruchamianie lokalnie

### Frontend (Vite)
```bash
cd crm-ui
npm install
npm run dev
````

### Backend (.NET)

```bash
cd backend
dotnet build
dotnet run
```

### Mobilna aplikacja (Expo)

```bash
cd crm-mobile
npm install
npm run web    # lub: npm run android / npm run ios
```

---

## 📈 Wymagania formalne (zgodne z uczelnią)

✅ 30+ tabel w bazie danych
✅ Operacje CRUD na wszystkich encjach
✅ Wspólna baza danych i logika dla aplikacji
✅ 50+ interfejsów użytkownika
✅ Role, grupy, uprawnienia
✅ Eksport danych i generowanie szablonów

---

## 📄 Licencja

Projekt stworzony na potrzeby obrony pracy inżynierskiej.
Wykorzystywanie fragmentów kodu do celów edukacyjnych dozwolone.
Dalsze komercyjne użycie wymaga zgody autora.

---

## 📬 Kontakt

Jeśli masz pytania dotyczące projektu, zapraszam do kontaktu poprzez platformę uczelni lub GitLaba.

---

## 🚧 Status projektu

Projekt jest w trakcie **aktywnej realizacji** – co tydzień dodawane są nowe funkcjonalności, poprawki oraz moduły zgodne z wymaganiami pracy inżynierskiej.

---

