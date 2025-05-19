---

### ✅ **Plik `README.md`**

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

Aplikacja zawiera panel administracyjny z autoryzacją użytkowników, zaawansowanym routingiem, widokami podzielonymi na sekcje oraz dynamicznym interfejsem użytkownika.

---

## 💡 Technologie

### Frontend:
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

---

## 📂 Struktura projektu

```

projekt-inzynierski/
├── backend/              # Projekt ASP.NET Core (API + logika biznesowa + EF)
├── crm-ui/               # Projekt frontendowy (Vite + React)
├── .gitignore
└── README.md             # Ten plik

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

Projekt stworzony na potrzeby obrony pracy inżynierskiej. Wykorzystywanie fragmentów kodu do celów edukacyjnych dozwolone.
Dalsze komercyjne użycie wymaga zgody autora.

---

## 📬 Kontakt

Jeśli masz pytania dotyczące projektu, zapraszam do kontaktu poprzez platformę uczelni lub GitLaba.

---

## 🚧 Status projektu

Projekt jest w trakcie aktywnej realizacji – co tydzień dodawane są nowe funkcjonalności, poprawki oraz moduły zgodne z wymaganiami pracy inżynierskiej.


---


