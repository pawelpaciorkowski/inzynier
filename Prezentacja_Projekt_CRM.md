# 🎯 **PREZENTACJA PROJEKTU INŻYNIERSKIEGO**
## **Zintegrowany System CRM**

**Autor:** Paweł Paciorkowski  
**Kierunek:** Informatyka, IV rok  
**Specjalność:** Programista aplikacji biznesowych

---

## 1. 🎯 **CEL I UZASADNIENIE POWSTANIA DZIEŁA**

### **Cel główny:**
Stworzenie zaawansowanego, zintegrowanego systemu CRM (Customer Relationship Management) usprawniającego zarządzanie relacjami z klientami w małych i średnich przedsiębiorstwach.

### **Uzasadnienie:**
- **Automatyzacja procesów** - eliminacja manualnej pracy biurowej
- **Centralizacja danych** - wszystkie informacje o klientach w jednym miejscu
- **Mobilność** - dostęp do systemu z dowolnego miejsca
- **Skalowalność** - możliwość rozbudowy wraz z rozwojem firmy
- **Nowoczesne technologie** - wykorzystanie najnowszych rozwiązań IT

---

## 2. 🏢 **DZIEDZINA PROBLEMU - KONTEKST BIZNESOWY**

### **Problemy w zarządzaniu firmą:**
- ❌ **Rozproszenie danych** - informacje w różnych systemach i plikach
- ❌ **Brak synchronizacji** - różne wersje danych u różnych pracowników  
- ❌ **Niedostępność mobilna** - ograniczony dostęp poza biurem
- ❌ **Brak powiadomień** - przegapione terminy i zadania
- ❌ **Manualne procesy** - czasochłonne generowanie dokumentów

### **Potrzeby rynkowe:**
- ✅ **Małe i średnie firmy** potrzebują przystępnych cenowo rozwiązań CRM
- ✅ **Praca zdalna** wymaga dostępu do danych z różnych lokalizacji
- ✅ **Automatyzacja** kluczowa dla konkurencyjności
- ✅ **Integracja** różnych aspektów działalności firmy

---

## 3. 🔧 **OGÓLNA KONCEPCJA PROJEKTU**

### **Idea systemu:**
Trójwarstwowy system CRM składający się z:
1. **Backend API** - serce systemu z logiką biznesową
2. **Aplikacja webowa** - pełny panel administracyjny  
3. **Aplikacja mobilna** - dostęp do kluczowych funkcji

### **Kluczowe moduły:**
- 👥 **Zarządzanie klientami** - CRUD, segmentacja, historia
- 📋 **Zarządzanie zadaniami** - przypisywanie, śledzenie, powiadomienia
- 🧾 **Faktury i płatności** - automatyczne generowanie i śledzenie
- 📑 **Kontrakty** - szablony, generowanie, archiwizacja
- 💬 **Komunikacja** - wiadomości, powiadomienia, przypomnienia
- 📊 **Raporty** - analiza sprzedaży, wydajności, klientów

---

## 4. 🏗️ **ARCHITEKTURA SYSTEMU**

### **Architektura wielowarstwowa:**

```
┌─────────────────┐  ┌─────────────────┐
│   WEB FRONTEND  │  │ MOBILE FRONTEND │
│   (React)       │  │ (React Native)  │
└─────────┬───────┘  └─────────┬───────┘
          │                    │
          └──────┬─────────────┘
                 │ HTTP/REST API
          ┌──────▼─────────────────────┐
          │     BACKEND API            │
          │   (ASP.NET Core)           │
          │ ┌─────────┐ ┌────────────┐ │
          │ │ JWT     │ │ Validation │ │
          │ │ Auth    │ │ & Business │ │
          │ │         │ │ Logic      │ │
          │ └─────────┘ └────────────┘ │
          └──────┬─────────────────────┘
                 │ Entity Framework Core
          ┌──────▼─────────────────────┐
          │    DATABASE                │
          │   (MySQL/MariaDB)          │
          └────────────────────────────┘
```

### **Wzorce architektoniczne:**
- **MVC** (Model-View-Controller)
- **Repository Pattern** 
- **Dependency Injection**
- **RESTful API**
- **Single Page Application (SPA)**

---

## 5. 🗄️ **KONCEPCJA BAZY DANYCH**

### **Główne tabele:**
- **Users** - użytkownicy systemu z rolami
- **Customers** - dane klientów i kontaktowe
- **Tasks** - zadania przypisane użytkownikom
- **Contracts** - kontrakty i umowy
- **Invoices** - faktury i płatności  
- **Messages** - komunikacja wewnętrzna
- **Notifications** - system powiadomień
- **Reminders** - przypomnienia terminów

### **Relacje:**
- **Użytkownik** → **Zadania** (1:N)
- **Klient** → **Faktury** (1:N)
- **Klient** → **Kontrakty** (1:N)  
- **Użytkownik** → **Powiadomienia** (1:N)
- **Grupy** ← **Użytkownicy** → **Role** (M:N)

### **Cechy bazy:**
- ✅ **Normalizacja** - eliminacja redundancji
- ✅ **Indeksy** - optymalizacja wydajności
- ✅ **Constraints** - integralność danych
- ✅ **Soft Delete** - bezpieczne usuwanie
- ✅ **Audit Trail** - śledzenie zmian

---

## 6. 👤 **PREZENTACJA UŻYTKOWA**

### **Panel webowy - kluczowe ekrany:**

#### **Dashboard**
- 📊 Podsumowanie kluczowych wskaźników
- 📈 Wykresy sprzedaży i zadań
- 🔔 Najnowsze powiadomienia
- ⏰ Nadchodzące przypomnienia

#### **Zarządzanie klientami**
- 📋 Lista klientów z filtrowaniem
- ➕ Dodawanie nowych klientów
- ✏️ Edycja danych kontaktowych
- 🏷️ System tagów i kategorii

#### **Zadania**
- ✅ Lista zadań z statusami
- 👥 Przypisywanie do użytkowników
- 📅 Terminy realizacji
- 🔄 Śledzenie postępów

### **Aplikacja mobilna:**
- 🔐 **Logowanie** z zabezpieczonym tokenem
- 📱 **Lista zadań** - przeglądanie, edycja, oznaczanie
- 🔔 **Powiadomienia** - natychmiastowe alerty
- ⏰ **Przypomnienia** - alerts o terminach
- 👥 **Klienci** - podstawowe informacje kontaktowe

---

## 7. 💻 **PREZENTACJA TECHNICZNA**

### **Frontend Web (React):**
- **React 18** + **TypeScript** - typebezpieczeństwo
- **Vite** - szybki bundling i hot reload
- **TailwindCSS** - utility-first CSS framework
- **React Router** - nawigacja SPA
- **Axios** - HTTP client z interceptorami
- **React Context** - globalne zarządzanie stanem

### **Frontend Mobile (React Native):**
- **Expo SDK** - cross-platform development  
- **Expo Router** - file-based navigation
- **Expo Secure Store** - bezpieczne przechowywanie tokenów
- **React Native** - natywne komponenty
- **TypeScript** - typy dla lepszej jakości kodu

### **Backend (Python Flask):**
- **Python 3.12** - najnowsza wersja języka
- **Flask 2.3.3** - lekki framework webowy
- **SQLAlchemy** - ORM do bazy danych
- **JWT Authentication** - stateless autoryzacja
- **PyMySQL** - driver MySQL/MariaDB
- **bcrypt** - bezpieczne hashowanie haseł

### **Baza Danych:**
- **MySQL/MariaDB** - relacyjna baza danych
- **SQLAlchemy Migrations** - wersjonowanie schematu
- **Connection Pooling** - optymalizacja połączeń

### **DevOps:**
- **Docker** - konteneryzacja aplikacji
- **Docker Compose** - orkiestracja środowisk
- **Git** - system kontroli wersji
- **Environment Variables** - konfiguracja środowisk

---

## 8. 🌟 **NAJCIEKAWSZE ELEMENTY KODU**

### **1. System powiadomień w czasie rzeczywistym**
```typescript
// Hook do zarządzania przypomnieniami
const useReminders = () => {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [shownReminders, setShownReminders] = useState<number[]>(() => {
        const stored = localStorage.getItem('shownReminders');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const found = reminders.find(r => {
                if (shownReminders.includes(r.id)) return false;
                const reminderDate = new Date(r.remindAt);
                return reminderDate.getTime() === now.getTime();
            });
            
            if (found) {
                Alert.alert('⏰ Przypomnienie!', found.note);
                setShownReminders(prev => [...prev, found.id]);
            }
        };
        
        const interval = setInterval(checkReminders, 60000);
        return () => clearInterval(interval);
    }, [reminders, shownReminders]);
};
```

### **2. Persist storage z synchronizacją**
```csharp
// Automatyczne zapisywanie stanu do localStorage
useEffect(() => {
    localStorage.setItem('shownReminders', JSON.stringify(shownReminders));
}, [shownReminders]);
```

### **3. JWT Authentication z middleware**
```python
# app/middleware.py
def require_auth(f):
    """Dekorator wymagający autoryzacji"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Brak tokenu autoryzacji'}), 401
        
        try:
            token = token.replace('Bearer ', '')
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            g.current_user_id = payload['sub']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token wygasł'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Nieprawidłowy token'}), 401
        
        return f(*args, **kwargs)
    return decorated
```

### **4. Generowanie dokumentów PDF**
```python
# app/controllers/reports.py
def create_pdf_table(data, headers, title):
    """Tworzy tabelę PDF z polskimi znakami"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4))
    
    elements = []
    elements.append(Paragraph(title, title_style))
    elements.append(Spacer(1, 20))
    
    # Przygotuj dane tabeli
    table_data = [headers]
    for row in data:
        table_data.append(row)
    
    table = Table(table_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    return buffer
```

### **5. Cross-platform navigation**
```typescript
// Unified navigation dla web i mobile
const router = useRouter();
const navigate = useNavigate(); // Web
const push = router.push;       // Mobile

const handleNavigation = (path: string) => {
    if (Platform.OS === 'web') {
        navigate(path);
    } else {
        push(path);
    }
};
```

---

## 9. 📊 **WNIOSKI PO REALIZACJI**

### **Osiągnięte cele:**
✅ **Funkcjonalny system CRM** - wszystkie zaplanowane moduły działają  
✅ **Cross-platform** - aplikacja web i mobilna zsynchronizowane  
✅ **Bezpieczeństwo** - JWT auth, validation, autoryzacja  
✅ **Skalowalność** - architektura gotowa na rozbudowę  
✅ **UX/UI** - intuicyjny interfejs użytkownika  

### **Nabyte umiejętności:**
- 🎯 **Fullstack development** - backend + frontend + mobile
- 🏗️ **Architektura systemów** - wzorce projektowe, best practices  
- 🔐 **Bezpieczeństwo** - autentykacja, autoryzacja, walidacja
- 📱 **Mobile development** - React Native, cross-platform
- 🗄️ **Bazy danych** - projektowanie, optymalizacja, migracje
- 🐳 **DevOps** - Docker, środowiska, CI/CD

### **Wyzwania i rozwiązania:**
- **Problem:** Synchronizacja stanu między aplikacjami  
  **Rozwiązanie:** Shared API + localStorage/SecureStore

- **Problem:** Różnice w nawigacji web vs mobile  
  **Rozwiązanie:** Abstrakcja i unified interface

- **Problem:** Bezpieczeństwo tokenów JWT  
  **Rozwiązanie:** Secure storage + automatic refresh

### **Możliwości rozwoju:**
- 🔄 **Real-time updates** - WebSockets, SignalR
- 📊 **Advanced analytics** - dashboardy, wykresy
- 🔗 **Integracje** - email, SMS, systemy zewnętrzne
- 🤖 **AI/ML** - rekomendacje, predykcje
- ☁️ **Cloud deployment** - Azure, AWS

### **Wartość biznesowa:**
- 💰 **ROI** - automatyzacja procesów = oszczędność czasu
- 📈 **Efektywność** - lepsze zarządzanie klientami i zadaniami  
- 📱 **Mobilność** - praca z dowolnego miejsca
- 🔍 **Insights** - dane do podejmowania decyzji
- 🚀 **Konkurencyjność** - nowoczesne narzędzia pracy

---

## 🎬 **PODSUMOWANIE**

System CRM został **pomyślnie zrealizowany** zgodnie z założeniami projektowymi. 

**Rezultat:** Funkcjonalny, skalowalny system zarządzania relacjami z klientami, gotowy do wdrożenia w środowisku biznesowym.

**Znaczenie:** Projekt pokazuje pełny cykl rozwoju oprogramowania - od analizy wymagań, przez projektowanie architektury, implementację, po wdrożenie i testy.

---

**Dziękuję za uwagę!** 🙏

*Pytania i dyskusja* 