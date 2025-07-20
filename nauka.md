# 📚 Dokumentacja Techniczna - System CRM

## 🏗️ Architektura Systemu

### Struktura Projektu
```
inzynier/
├── backend/                    # Backend .NET Core
│   ├── CRM.API/               # Główna aplikacja API
│   ├── CRM.BusinessLogic/     # Logika biznesowa
│   └── CRM.Data/              # Warstwa danych (Entity Framework)
├── crm-ui/                    # Frontend React + TypeScript
├── crm-mobile/                # Aplikacja mobilna (React Native/Expo)
└── docker-compose.yml         # Konfiguracja Docker
```

## 🎯 Technologie

### Backend (.NET Core)
- **Framework**: ASP.NET Core 8.0
- **Baza danych**: MySQL (Entity Framework Core)
- **Autentykacja**: JWT (JSON Web Tokens)
- **API**: RESTful API z kontrolerami
- **Logowanie**: Serilog
- **CORS**: Cross-Origin Resource Sharing

### Frontend (Web)
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Icons**: Heroicons

### Mobile
- **Framework**: React Native + Expo
- **Navigation**: Expo Router
- **HTTP Client**: Axios
- **State Management**: React Context API

## 🗄️ Model Danych

### Główne Encje

#### User (Użytkownik)
```csharp
public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public int RoleId { get; set; }
    public Role Role { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

#### Customer (Klient)
```csharp
public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string? Phone { get; set; }
    public string? Company { get; set; }
    public string? Address { get; set; }
    public string? NIP { get; set; }
    public int? AssignedGroupId { get; set; }
    public int? AssignedUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public virtual ICollection<CustomerTag> CustomerTags { get; set; }
}
```

#### Invoice (Faktura)
```csharp
public class Invoice
{
    public int Id { get; set; }
    public string Number { get; set; }
    public int CustomerId { get; set; }
    public DateTime IssuedAt { get; set; }
    public DateTime DueDate { get; set; }
    public bool IsPaid { get; set; }
    public decimal TotalAmount { get; set; }
    public int? AssignedGroupId { get; set; }
    public int? CreatedByUserId { get; set; }
    public virtual Customer Customer { get; set; }
    public virtual ICollection<InvoiceItem> Items { get; set; }
}
```

#### TaskItem (Zadanie)
```csharp
public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public bool Completed { get; set; }
    public int UserId { get; set; }
    public int CustomerId { get; set; }
    public int? AssignedGroupId { get; set; }
    public virtual User User { get; set; }
    public virtual Customer Customer { get; set; }
}
```

### System Grup i Tagów

#### Group (Grupa)
```csharp
public class Group
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public virtual ICollection<UserGroup> UserGroups { get; set; }
}
```

#### Tag (Tag)
```csharp
public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Color { get; set; }
    public string Description { get; set; }
}
```

## 🔐 System Autentykacji

### JWT Token Structure
```json
{
  "sub": "user_id",
  "username": "user_username",
  "role": "user_role",
  "exp": "expiration_timestamp",
  "iat": "issued_at_timestamp"
}
```

### Role-Based Access Control (RBAC)
- **Admin**: Pełny dostęp do wszystkich funkcji
- **Sprzedawca**: Dostęp do klientów, faktur, zadań, raportów
- **User**: Podstawowy dostęp do swoich danych

## 🚀 API Endpoints

### Autentykacja
```
POST /api/auth/login          # Logowanie użytkownika
POST /api/auth/register       # Rejestracja (tylko admin)
```

### Dashboard
```
GET /api/admin/dashboard      # Dane dashboardu (różne dla każdej roli)
```

### Klienci
```
GET    /api/customers         # Lista klientów
GET    /api/customers/{id}    # Szczegóły klienta
POST   /api/customers         # Dodanie klienta
PUT    /api/customers/{id}    # Edycja klienta
DELETE /api/customers/{id}    # Usunięcie klienta
```

### Faktury
```
GET    /api/invoices          # Lista faktur
GET    /api/invoices/{id}     # Szczegóły faktury
POST   /api/invoices          # Dodanie faktury
PUT    /api/invoices/{id}     # Edycja faktury
DELETE /api/invoices/{id}     # Usunięcie faktury
```

### Zadania
```
GET    /api/admin/tasks       # Wszystkie zadania (admin)
GET    /api/user/tasks        # Zadania użytkownika
POST   /api/user/tasks        # Dodanie zadania
PUT    /api/user/tasks/{id}   # Edycja zadania
DELETE /api/user/tasks/{id}   # Usunięcie zadania
```

### Raporty
```
GET /api/reports/dashboard           # Dashboard raportów
GET /api/reports/groups/{id}/customers  # Raport klientów grupy
GET /api/reports/groups/{id}/sales      # Raport sprzedaży grupy
GET /api/reports/tags/{id}/customers    # Raport klientów taga
GET /api/reports/tags/{id}/invoices     # Raport faktur taga
```

## 🎨 Frontend Architecture

### Struktura Komponentów

#### Layout System
```typescript
// Layout.tsx - Główny layout aplikacji
- Header z nawigacją
- Sidebar z menu
- Main content area
- Toast notifications
- Reminder system
```

#### Dashboard Components
```typescript
// DashboardPage.tsx - Główna strona dashboardu
- AdminDashboard.tsx    # Dashboard dla administratora
- SalesDashboard.tsx    # Dashboard dla sprzedawcy
- UserDashboard.tsx     # Dashboard dla użytkownika
```

#### Context Providers
```typescript
// AuthContext.tsx - Zarządzanie autentykacją
- User state
- Login/logout functions
- Token management

// ModalContext.tsx - Zarządzanie modalnymi oknami
- Toast notifications
- Modal dialogs
- Error handling
```

### State Management

#### React Context Pattern
```typescript
// Przykład AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    // Logika logowania
  };

  const logout = () => {
    // Logika wylogowania
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Routing System
```typescript
// App.tsx - Główny router
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/klienci" element={<ClientsPage />} />
    <Route path="/faktury" element={<InvoicesPage />} />
    <Route path="/zadania" element={<TasksPage />} />
    <Route path="/raporty" element={<ReportsPage />} />
    {/* ... więcej tras */}
  </Route>
</Routes>
```

## 📱 Mobile App Architecture

### Expo Router Structure
```
app/
├── (tabs)/           # Tab navigation
│   ├── index.tsx     # Tasks tab
│   ├── customers.tsx # Customers tab
│   ├── invoices.tsx  # Invoices tab
│   └── activities.tsx # Activities tab
├── login.tsx         # Login screen
├── add-task.tsx      # Add task modal
└── notifications.tsx # Notifications screen
```

### Mobile State Management
```typescript
// AuthContext.tsx - Podobny do web, ale dostosowany do mobile
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // AsyncStorage dla persystencji tokenu
  useEffect(() => {
    loadStoredToken();
  }, []);
};
```

## 🔧 Konfiguracja i Deployment

### Environment Variables
```env
# Backend (.env)
ConnectionStrings__DefaultConnection=Server=localhost;Database=crm_db;Uid=root;Pwd=password;
JwtSettings__SecretKey=your-secret-key-here
JwtSettings__Issuer=your-issuer
JwtSettings__Audience=your-audience

# Frontend (.env)
VITE_API_URL=http://localhost:5000
```

### Docker Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend/CRM.API
    ports:
      - "5000:5000"
    environment:
      - ConnectionStrings__DefaultConnection=Server=db;Database=crm_db;Uid=root;Pwd=password;
    depends_on:
      - db

  frontend:
    build: ./crm-ui
    ports:
      - "5173:5173"
    depends_on:
      - backend

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: crm_db
    ports:
      - "3306:3306"
```

## 🗃️ Baza Danych

### Migrations
```bash
# Tworzenie migracji
dotnet ef migrations add InitialCreate

# Aplikowanie migracji
dotnet ef database update
```

### Seed Data
```csharp
// Program.cs - Automatyczne seedowanie danych
if (!context.Roles.Any())
{
    context.Roles.AddRange(
        new Role { Name = "Admin", Description = "Administrator systemu" },
        new Role { Name = "Sprzedawca", Description = "Sprzedawca" },
        new Role { Name = "User", Description = "Standardowy użytkownik" }
    );
    context.SaveChanges();
}
```

## 🔍 System Raportowania

### Dashboard Reports
```typescript
// ReportsPage.tsx - Kompleksowy system raportów
interface DashboardData {
  summary: {
    totalCustomers: number;
    totalInvoices: number;
    totalTasks: number;
    totalInvoiceValue: number;
    paidInvoiceValue: number;
  };
  topGroups: Array<{
    id: number;
    name: string;
    customerCount: number;
    invoiceCount: number;
  }>;
  topTags: Array<{
    id: number;
    name: string;
    totalUsage: number;
  }>;
}
```

### Group Reports
```typescript
interface GroupReport {
  summary: {
    totalCustomers: number;
    totalInvoicesSales: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
  };
  customers: Array<CustomerData>;
  invoices: Array<InvoiceData>;
  tasks: Array<TaskData>;
}
```

## 🛡️ Bezpieczeństwo

### JWT Token Security
```csharp
// Program.cs - Konfiguracja JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]))
        };
    });
```

### CORS Configuration
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:8081")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

## 📊 Monitoring i Logowanie

### Serilog Configuration
```csharp
// Program.cs - Konfiguracja logowania
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/crm-.txt", rollingInterval: RollingInterval.Day));
```

### Error Handling
```typescript
// ErrorBoundary.tsx - Obsługa błędów React
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
}
```

## 🚀 Deployment i CI/CD

### Build Process
```bash
# Backend
cd backend/CRM.API
dotnet build
dotnet run

# Frontend
cd crm-ui
npm install
npm run build
npm run dev

# Mobile
cd crm-mobile
npm install
npx expo start
```

### Production Considerations
- HTTPS configuration
- Database connection pooling
- Static file serving
- API rate limiting
- Health checks
- Backup strategies

## 📈 Performance Optimization

### Frontend Optimizations
- React.memo dla komponentów
- useMemo i useCallback dla kosztownych operacji
- Lazy loading komponentów
- Code splitting
- Image optimization

### Backend Optimizations
- Entity Framework query optimization
- Caching strategies
- Database indexing
- Async/await patterns
- Connection pooling

## 🔧 Troubleshooting

### Common Issues

#### 404 Errors
- Sprawdź routing w kontrolerach
- Upewnij się, że proxy jest skonfigurowane
- Sprawdź czy backend jest uruchomiony

#### CORS Errors
- Sprawdź konfigurację CORS w backendzie
- Upewnij się, że origins są poprawnie skonfigurowane

#### Database Connection Issues
- Sprawdź connection string
- Upewnij się, że baza danych jest uruchomiona
- Sprawdź migracje

#### JWT Token Issues
- Sprawdź secret key
- Sprawdź expiration time
- Sprawdź issuer i audience

## 📚 Przyszłe Rozwinięcia

### Planowane Funkcjonalności
- [ ] System powiadomień push
- [ ] Integracja z kalendarzem
- [ ] System workflow
- [ ] Advanced reporting
- [ ] Multi-tenant architecture
- [ ] API versioning
- [ ] GraphQL support
- [ ] Real-time notifications (SignalR)

### Technical Debt
- [ ] Unit tests coverage
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance monitoring
- [ ] Security audit
- [ ] Code documentation
- [ ] API documentation (Swagger)

---

## 🎯 Podsumowanie

System CRM to kompleksowa aplikacja webowa i mobilna zbudowana w architekturze mikroserwisowej. Wykorzystuje nowoczesne technologie i wzorce projektowe, zapewniając skalowalność, bezpieczeństwo i łatwość utrzymania.

### Kluczowe Zalety:
- ✅ Modułowa architektura
- ✅ Responsive design
- ✅ Cross-platform (Web + Mobile)
- ✅ Role-based access control
- ✅ Comprehensive reporting
- ✅ Real-time data synchronization
- ✅ Scalable database design

### Technologie:
- **Backend**: .NET Core, Entity Framework, MySQL
- **Frontend**: React, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo
- **Security**: JWT, CORS, Role-based auth
- **Deployment**: Docker, Docker Compose 