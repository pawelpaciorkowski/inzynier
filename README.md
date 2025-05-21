---

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


---

## 🗄️ Baza danych – MySQL w Dockerze

Aplikacja korzysta z bazy danych **MySQL 8.4** uruchamianej lokalnie w kontenerze Docker.

### Jak uruchomić bazę?

1. **Upewnij się, że masz zainstalowanego Dockera.**
2. W terminalu wpisz:

   ```bash
   docker run --name crm-db \
     -e MYSQL_ROOT_PASSWORD=admin123 \
     -e MYSQL_DATABASE=crm_project \
     -p 3307:3306 \
     -d mysql:8.4
   ```

   > **Uwaga:** Jeżeli port 3307 jest zajęty, możesz go zmienić np. na 3308 (`-p 3308:3306`).

### Parametry połączenia

| Parametr    | Wartość       |
| ----------- | ------------- |
| Host        | `localhost`   |
| Port        | `3307`        |
| User        | `root`        |
| Hasło       | `admin123`    |
| Baza danych | `crm_project` |

### Przykładowa konfiguracja `.env`

```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=admin123
DB_NAME=crm_project
```

**Po uruchomieniu bazy backend aplikacji powinien działać bez dodatkowej konfiguracji**.
W razie problemów sprawdź, czy kontener jest uruchomiony i port nie jest blokowany przez firewall.

---
Okej, oto czysty, sformatowany kod Markdown do sekcji o Dockerze do wklejenia w README.md:

````markdown
## 🐳 Uruchamianie środowiska z Dockerem

Projekt CRM można wygodnie uruchomić w środowisku kontenerowym Docker, co zapewnia spójną konfigurację i izolację usług.

### Co zawiera `docker-compose`?

- baza danych MariaDB (MySQL kompatybilna)  
- backend ASP.NET Core 9.0  
- frontend React + Vite + nginx  

### Jak uruchomić całość?

Upewnij się, że masz zainstalowanego Dockera oraz Docker Compose.  

W katalogu głównym projektu (tam, gdzie jest `docker-compose.yml`) uruchom:

```bash
docker compose build
docker compose up -d
````

Sprawdź działanie kontenerów:

```bash
docker ps
```

Powinieneś zobaczyć działające usługi:

| Usługa      | Port kontenera | Port lokalny (host) |
| ----------- | -------------- | ------------------- |
| baza danych | 3306           | 3306                |
| backend API | 8080           | 5167                |
| frontend    | 80             | 5173                |

---

### Dostęp do aplikacji

* **Frontend:** [http://localhost:5173](http://localhost:5173)
  (Interfejs użytkownika React + Vite, serwowany przez nginx)

* **Backend API:** [http://localhost:5167/api](http://localhost:5167/api)
  (REST API ASP.NET Core)

* **Baza danych:** port 3306, dostęp lokalny (możesz użyć np. MySQL Workbench lub DBeaver)

---

### Konfiguracja połączenia z bazą danych w backendzie

W `docker-compose.yml` backend łączy się z bazą używając nazwy usługi `db` jako hosta (Docker DNS):

```yaml
environment:
  - ConnectionStrings__DefaultConnection=server=db;port=3306;database=crm_project;user=root;password=kapljca
```

### Wolumen danych

Dane bazy są przechowywane w wolumenie Docker, by zachować je między restartami kontenerów:

```yaml
volumes:
  dbdata:
```

---

### Debugowanie i logi

* Logi backendu:

```bash
docker logs -f inzynier-backend-1
```

* Wejście do kontenera backendu:

```bash
docker exec -it inzynier-backend-1 bash
```

* Logowanie do bazy w kontenerze:

```bash
docker exec -it inzynier-db-1 mysql -u root -p
# podaj hasło: kapljca
```

---

### Zalecenia

Po każdej zmianie frontendu:

```bash
cd crm-ui
npm run build
cd ..
docker compose build frontend
docker compose up -d
```

Po zmianach backendu:

```bash
docker compose build backend
docker compose up -d
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

