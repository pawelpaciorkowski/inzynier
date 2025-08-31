// Import przestrzeni nazw dla kontekstu bazy danych CRM
using CRM.Data;
// Import serwisów logiki biznesowej aplikacji CRM
using CRM.BusinessLogic.Services;
// Import Entity Framework Core do obsługi bazy danych
using Microsoft.EntityFrameworkCore;
// Import mechanizmu uwierzytelniania JWT Bearer
using Microsoft.AspNetCore.Authentication.JwtBearer;
// Import tokenów Microsoft Identity Model do walidacji JWT
using Microsoft.IdentityModel.Tokens;
// Import do obsługi kodowania tekstu (potrzebne dla kluczy JWT)
using System.Text;
// Import serwisów uwierzytelniania i autoryzacji
using CRM.BusinessLogic.Auth;
// Import serwisów administracyjnych
using CRM.BusinessLogic.Services.Admin;
// Import dla konfiguracji OpenAPI/Swagger
using Microsoft.OpenApi.Models; // Dodaj ten using

// Tworzenie buildera aplikacji webowej z przekazanymi argumentami linii poleceń
var builder = WebApplication.CreateBuilder(args);

// --- Rejestracja serwisów w kontenerze DI (Dependency Injection) ---

// 1. Konfiguracja bazy danych MySQL
// Pobieranie connection string z pliku konfiguracyjnego appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// Rejestracja kontekstu bazy danych ApplicationDbContext w kontenerze DI
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    // Konfiguracja MySQL z automatycznym wykrywaniem wersji serwera
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
           // Włączenie logowania wrażliwych danych (tylko dla development)
           .EnableSensitiveDataLogging());

// 2. Konfiguracja kontrolerów MVC z ustawieniami JSON
// Rejestracja serwisów kontrolerów w kontenerze DI
builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Zachowanie referencji obiektów w JSON (obsługa cykli referencyjnych)
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
    // Konwersja nazw właściwości na camelCase dla zgodności z konwencjami JavaScript/TypeScript
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase; // Ta linia konwertuje na camelCase
});

// 3. Rejestracja serwisów logiki biznesowej w kontenerze DI
// Każdy serwis rejestrowany jako Scoped - jedna instancja na request HTTP
// Serwis do zarządzania klientami (CRUD operacje na Customer)
builder.Services.AddScoped<ICustomerService, CustomerService>();
// Serwis uwierzytelniania i autoryzacji użytkowników
builder.Services.AddScoped<IAuthService, AuthService>();
// Serwis do zarządzania użytkownikami systemu
builder.Services.AddScoped<IUserService, UserService>();
// Serwis do generowania plików PDF faktur
builder.Services.AddScoped<InvoicePdfService>();
// Serwis do zarządzania rolami użytkowników
builder.Services.AddScoped<IRoleService, RoleService>();
// Serwis do logowania aktywności w systemie
builder.Services.AddScoped<ILogService, LogService>();
// Serwis do generowania dokumentów (Word, PDF)
builder.Services.AddScoped<DocumentGenerationService>();
// Serwis do eksportu danych do formatów CSV
builder.Services.AddScoped<ICsvExportService, CsvExportService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHostedService<NotificationBackgroundService>();

// 4. Konfiguracja CORS (Cross-Origin Resource Sharing)
// Umożliwia aplikacjom frontend (React, React Native) komunikację z API
builder.Services.AddCors(options =>
{
    // Dodanie domyślnej polityki CORS
    options.AddDefaultPolicy(policy =>
    {
        // Dozwolone origins dla aplikacji webowej i mobilnej
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175", "http://localhost:8081", "http://localhost:5000")
              // Zezwolenie na wszystkie nagłówki HTTP
              .AllowAnyHeader()
              // Zezwolenie na wszystkie metody HTTP (GET, POST, PUT, DELETE)
              .AllowAnyMethod()
              // Zezwolenie na przesyłanie credentials (cookies, authorization headers)
              .AllowCredentials();
    });
});

// 5. Konfiguracja uwierzytelniania JWT (JSON Web Token)
// Pobieranie klucza JWT z pliku konfiguracyjnego
var jwtKey = builder.Configuration["Jwt:Key"];
// Walidacja czy klucz JWT został poprawnie skonfigurowany
if (string.IsNullOrEmpty(jwtKey))
{
    // Rzucenie wyjątku w przypadku braku klucza - zapobiega uruchomieniu aplikacji
    // bez prawidłowej konfiguracji bezpieczeństwa
    throw new ArgumentNullException(nameof(jwtKey), "Klucz 'Jwt:Key' nie może być pusty. Sprawdź appsettings.json.");
}

// Rejestracja serwisu uwierzytelniania z domyślnym schematem JWT Bearer
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme) // Ustawienie domyślnego schematu
    // Konfiguracja obsługi tokenów JWT Bearer
    .AddJwtBearer(options =>
    {
        // Parametry walidacji tokenów JWT
        options.TokenValidationParameters = new TokenValidationParameters
        {
            // Walidacja wydawcy tokenu (issuer)
            ValidateIssuer = true,
            // Walidacja odbiorcy tokenu (audience)
            ValidateAudience = true,
            // Walidacja czasu ważności tokenu
            ValidateLifetime = true,
            // Walidacja klucza podpisu cyfrowego
            ValidateIssuerSigningKey = true,
            // Oczekiwany wydawca tokenu z konfiguracji
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            // Oczekiwany odbiorca tokenu z konfiguracji
            ValidAudience = builder.Configuration["Jwt:Audience"],
            // Klucz symetryczny do weryfikacji podpisu tokenu
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
// Dodanie serwisu autoryzacji (sprawdzania uprawnień)
builder.Services.AddAuthorization();


// 6. Konfiguracja dokumentacji API - Swagger/OpenAPI
// Eksploracja endpointów API do generowania dokumentacji
builder.Services.AddEndpointsApiExplorer();
// Konfiguracja generatora dokumentacji Swagger
builder.Services.AddSwaggerGen(c =>
{
    // Definicja dokumentu OpenAPI z podstawowymi informacjami
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CRM.API", Version = "v1" });
    // Definicja schematu bezpieczeństwa Bearer JWT dla Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        // Nazwa nagłówka HTTP zawierającego token
        Name = "Authorization",
        // Typ schematu bezpieczeństwa - HTTP
        Type = SecuritySchemeType.Http,
        // Schemat uwierzytelniania - Bearer
        Scheme = "bearer",
        // Format tokenu - JWT
        BearerFormat = "JWT",
        // Lokalizacja tokenu - nagłówek HTTP
        In = ParameterLocation.Header,
        // Opis dla użytkowników Swagger UI
        Description = "Wprowadź token JWT z prefiksem 'Bearer '.",
    });
    // Wymaganie bezpieczeństwa dla wszystkich endpointów API
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            // Referencja do zdefiniowanego schematu Bearer
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            // Pusta tablica scope'ów (wszystkie uprawnienia)
            new string[] {}
        }
    });
});


// --- Budowanie aplikacji i konfiguracja pipeline'u HTTP ---

// Tworzenie instancji aplikacji z skonfigurowanymi serwisami
var app = builder.Build();

// Włączenie generowania dokumentacji Swagger JSON
app.UseSwagger();
// Włączenie interfejsu użytkownika Swagger UI
app.UseSwaggerUI();

// Konfiguracja specyficzna dla środowiska deweloperskiego
if (app.Environment.IsDevelopment())
{
    // Wyświetlanie szczegółowych informacji o błędach w trybie deweloperskim
    app.UseDeveloperExceptionPage(); // Dodaj, aby widzieć szczegółowe błędy w trybie deweloperskim
}

// Przekierowanie HTTP na HTTPS dla bezpieczeństwa
app.UseHttpsRedirection();
// Włączenie routingu - musi być przed CORS, Authentication i Authorization
app.UseRouting(); // Ważne, aby było przed UseCors, UseAuthentication i UseAuthorization
// Stosowanie polityki CORS zdefiniowanej wcześniej
app.UseCors();
// Włączenie middleware uwierzytelniania (weryfikacja tokenów JWT)
app.UseAuthentication();
// Włączenie middleware autoryzacji (sprawdzanie uprawnień)
app.UseAuthorization();
// Mapowanie kontrolerów do odpowiadających im tras URL
app.MapControllers();

// Inicjalizacja i seedowanie danych początkowych w bazie danych
// Utworzenie scope'a dla dostępu do serwisów (wzorzec Scoped Service)
using (var scope = app.Services.CreateScope())
{
    // Pobranie provider'a serwisów z utworzonego scope'a
    var services = scope.ServiceProvider;
    try
    {
        // Pobranie kontekstu bazy danych z kontenera DI
        var context = services.GetRequiredService<ApplicationDbContext>();
        // Zastosowanie wszystkich oczekujących migracji bazy danych
        context.Database.Migrate(); // Upewnij się, że migracje są zastosowane

        // Seedowanie ról użytkowników - tylko jeśli tabela jest pusta
        if (!context.Roles.Any())
        {
            // Dodanie podstawowych ról w systemie CRM
            context.Roles.AddRange(
                // Rola administratora z pełnymi uprawnieniami
                new CRM.Data.Models.Role { Name = "Admin", Description = "Administrator systemu", Users = new List<CRM.Data.Models.User>() },
                // Rola standardowego użytkownika z ograniczonymi uprawnieniami
                new CRM.Data.Models.Role { Name = "User", Description = "Standardowy użytkownik", Users = new List<CRM.Data.Models.User>() },
                // Rola menedżera z uprawnieniami do zarządzania zespołem
                new CRM.Data.Models.Role { Name = "Manager", Description = "Menedżer", Users = new List<CRM.Data.Models.User>() },
                // Rola sprzedawcy z dostępem do funkcji sprzedażowych
                new CRM.Data.Models.Role { Name = "Sprzedawca", Description = "Sprzedawca", Users = new List<CRM.Data.Models.User>() }
            );
            // Zapisanie zmian w bazie danych
            context.SaveChanges();
        }

        // Seedowanie użytkowników
        if (!context.Users.Any())
        {
            var userRole = context.Roles.FirstOrDefault(r => r.Name == "User");
            var adminRole = context.Roles.FirstOrDefault(r => r.Name == "Admin");
            var managerRole = context.Roles.FirstOrDefault(r => r.Name == "Manager");
            var sprzedawcaRole = context.Roles.FirstOrDefault(r => r.Name == "Sprzedawca");
            
            if (userRole != null && adminRole != null && managerRole != null && sprzedawcaRole != null)
            {
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword("user123");
                context.Users.AddRange(
                    new CRM.Data.Models.User
                    {
                        Username = "user",
                        Email = "user@example.com",
                        PasswordHash = hashedPassword,
                        RoleId = userRole.Id,
                        Role = userRole
                    },
                    new CRM.Data.Models.User
                    {
                        Username = "admin",
                        Email = "admin@example.com",
                        PasswordHash = hashedPassword,
                        RoleId = adminRole.Id,
                        Role = adminRole
                    },
                    new CRM.Data.Models.User
                    {
                        Username = "manager",
                        Email = "manager@example.com",
                        PasswordHash = hashedPassword,
                        RoleId = managerRole.Id,
                        Role = managerRole
                    },
                    new CRM.Data.Models.User
                    {
                        Username = "sprzedawca",
                        Email = "sprzedawca@example.com",
                        PasswordHash = hashedPassword,
                        RoleId = sprzedawcaRole.Id,
                        Role = sprzedawcaRole
                    }
                );
                context.SaveChanges();
            }
        }

        // Seedowanie grup
        if (!context.Groups.Any())
        {
            context.Groups.AddRange(
                new CRM.Data.Models.Group { Name = "Sprzedaż", Description = "Zespół sprzedaży", UserGroups = new List<CRM.Data.Models.UserGroup>() },
                new CRM.Data.Models.Group { Name = "Marketing", Description = "Zespół marketingu", UserGroups = new List<CRM.Data.Models.UserGroup>() },
                new CRM.Data.Models.Group { Name = "Wsparcie", Description = "Zespół wsparcia technicznego", UserGroups = new List<CRM.Data.Models.UserGroup>() }
            );
            context.SaveChanges();
        }

        // Seedowanie tagów
        if (!context.Tags.Any())
        {
            context.Tags.AddRange(
                new CRM.Data.Models.Tag { Name = "VIP", Color = "#FFD700", Description = "Klient VIP" },
                new CRM.Data.Models.Tag { Name = "Nowy", Color = "#00FF00", Description = "Nowy klient" },
                new CRM.Data.Models.Tag { Name = "Pilne", Color = "#FF0000", Description = "Pilne zadanie" },
                new CRM.Data.Models.Tag { Name = "Długoterminowy", Color = "#0000FF", Description = "Projekt długoterminowy" }
            );
            context.SaveChanges();
        }

        // Seedowanie klientów
        if (!context.Customers.Any())
        {
            var groups = context.Groups.ToList();
            var tags = context.Tags.ToList();
            
            var customers = new List<CRM.Data.Models.Customer>
            {
                new CRM.Data.Models.Customer
                {
                    Name = "Jan Kowalski",
                    Email = "jan.kowalski@example.com",
                    Phone = "+48 123 456 789",
                    Company = "Kowalski Sp. z o.o.",
                    Address = "ul. Przykładowa 1, 00-001 Warszawa",
                    AssignedGroupId = groups.FirstOrDefault()?.Id ?? 1,
                    AssignedUserId = context.Users.FirstOrDefault()?.Id ?? 1
                },
                new CRM.Data.Models.Customer
                {
                    Name = "Anna Nowak",
                    Email = "anna.nowak@example.com",
                    Phone = "+48 987 654 321",
                    Company = "Nowak Consulting",
                    Address = "ul. Testowa 5, 30-001 Kraków",
                    AssignedGroupId = groups.Skip(1).FirstOrDefault()?.Id ?? 1,
                    AssignedUserId = context.Users.FirstOrDefault()?.Id ?? 1
                },
                new CRM.Data.Models.Customer
                {
                    Name = "Piotr Wiśniewski",
                    Email = "piotr.wisniewski@example.com",
                    Phone = "+48 555 123 456",
                    Company = "Wiśniewski Solutions",
                    Address = "ul. Próbna 10, 80-001 Gdańsk",
                    AssignedGroupId = groups.Skip(2).FirstOrDefault()?.Id ?? 1,
                    AssignedUserId = context.Users.FirstOrDefault()?.Id ?? 1
                }
            };

            context.Customers.AddRange(customers);
            context.SaveChanges();

            // Dodanie tagów do klientów
            var customerTags = new List<CRM.Data.Models.CustomerTag>();
            foreach (var customer in customers)
            {
                customerTags.Add(new CRM.Data.Models.CustomerTag
                {
                    CustomerId = customer.Id,
                    TagId = tags.FirstOrDefault()?.Id ?? 1
                });
            }
            context.CustomerTags.AddRange(customerTags);
            context.SaveChanges();
        }

        // Seedowanie faktur
        if (!context.Invoices.Any())
        {
            var customers = context.Customers.ToList();
            var groups = context.Groups.ToList();
            var users = context.Users.ToList();
            var tags = context.Tags.ToList();

            var invoices = new List<CRM.Data.Models.Invoice>
            {
                new CRM.Data.Models.Invoice
                {
                    Number = "F/2024/001",
                    CustomerId = customers.FirstOrDefault()?.Id ?? 1,
                    AssignedGroupId = groups.FirstOrDefault()?.Id ?? 0,
                    CreatedByUserId = users.FirstOrDefault()?.Id,
                    TotalAmount = 1500.00m,
                    IsPaid = true,
                    IssuedAt = DateTime.Now.AddDays(-30),
                    DueDate = DateTime.Now.AddDays(-15)
                },
                new CRM.Data.Models.Invoice
                {
                    Number = "F/2024/002",
                    CustomerId = customers.Skip(1).FirstOrDefault()?.Id ?? 1,
                    AssignedGroupId = groups.Skip(1).FirstOrDefault()?.Id,
                    CreatedByUserId = users.FirstOrDefault()?.Id,
                    TotalAmount = 2500.00m,
                    IsPaid = false,
                    IssuedAt = DateTime.Now.AddDays(-15),
                    DueDate = DateTime.Now.AddDays(15)
                },
                new CRM.Data.Models.Invoice
                {
                    Number = "F/2024/003",
                    CustomerId = customers.Skip(2).FirstOrDefault()?.Id ?? 1,
                    AssignedGroupId = groups.Skip(2).FirstOrDefault()?.Id,
                    CreatedByUserId = users.FirstOrDefault()?.Id,
                    TotalAmount = 800.00m,
                    IsPaid = true,
                    IssuedAt = DateTime.Now.AddDays(-7),
                    DueDate = DateTime.Now.AddDays(23)
                }
            };

            context.Invoices.AddRange(invoices);
            context.SaveChanges();

            // Dodanie tagów do faktur
            var invoiceTags = new List<CRM.Data.Models.InvoiceTag>();
            foreach (var invoice in invoices)
            {
                invoiceTags.Add(new CRM.Data.Models.InvoiceTag
                {
                    InvoiceId = invoice.Id,
                    TagId = tags.Skip(1).FirstOrDefault()?.Id ?? 1
                });
            }
            context.InvoiceTags.AddRange(invoiceTags);
            context.SaveChanges();
        }

        // Seedowanie zadań
        if (!context.Tasks.Any())
        {
            var customers = context.Customers.ToList();
            var groups = context.Groups.ToList();
            var users = context.Users.ToList();
            var tags = context.Tags.ToList();

            var tasks = new List<CRM.Data.Models.TaskItem>
            {
                new CRM.Data.Models.TaskItem
                {
                    Title = "Kontakt z klientem",
                    Description = "Nawiązać kontakt z klientem w sprawie nowej oferty",
                    CustomerId = customers.FirstOrDefault()?.Id ?? 1,
                    AssignedGroupId = groups.FirstOrDefault()?.Id ?? 0,
                    UserId = users.FirstOrDefault()?.Id ?? 0,
                    DueDate = DateTime.Now.AddDays(7),
                    Completed = false
                },
                new CRM.Data.Models.TaskItem
                {
                    Title = "Przygotowanie raportu",
                    Description = "Przygotować raport miesięczny",
                    CustomerId = customers.Skip(1).FirstOrDefault()?.Id ?? 1,
                    AssignedGroupId = groups.Skip(1).FirstOrDefault()?.Id ?? 0,
                    UserId = users.FirstOrDefault()?.Id ?? 0,
                    DueDate = DateTime.Now.AddDays(3),
                    Completed = true
                },
                new CRM.Data.Models.TaskItem
                {
                    Title = "Analiza rynku",
                    Description = "Przeprowadzić analizę konkurencji",
                    CustomerId = customers.Skip(2).FirstOrDefault()?.Id ?? 1,
                    AssignedGroupId = groups.Skip(2).FirstOrDefault()?.Id ?? 0,
                    UserId = users.FirstOrDefault()?.Id ?? 0,
                    DueDate = DateTime.Now.AddDays(14),
                    Completed = false
                }
            };

            context.Tasks.AddRange(tasks);
            context.SaveChanges();

            // Dodanie tagów do zadań
            var taskTags = new List<CRM.Data.Models.TaskTag>();
            foreach (var task in tasks)
            {
                taskTags.Add(new CRM.Data.Models.TaskTag
                {
                    TaskId = task.Id,
                    TagId = tags.Skip(2).FirstOrDefault()?.Id ?? 1
                });
            }
            context.TaskTags.AddRange(taskTags);
            context.SaveChanges();
        }

        // Seedowanie kontraktów
        if (!context.Contracts.Any())
        {
            var customers = context.Customers.ToList();
            var groups = context.Groups.ToList();
            var users = context.Users.ToList();
            var tags = context.Tags.ToList();

            var contracts = new List<CRM.Data.Models.Contract>
            {
                new CRM.Data.Models.Contract
                {
                    Title = "Umowa o świadczenie usług",
                    ContractNumber = "K/2024/001",
                    CustomerId = customers.FirstOrDefault()?.Id ?? 1,
                    ResponsibleGroupId = groups.FirstOrDefault()?.Id ?? 0,
                    CreatedByUserId = users.FirstOrDefault()?.Id ?? 0,
                    NetAmount = 5000.00m,
                    SignedAt = DateTime.Now.AddDays(-60),
                    StartDate = DateTime.Now.AddDays(-30),
                    EndDate = DateTime.Now.AddDays(335)
                },
                new CRM.Data.Models.Contract
                {
                    Title = "Umowa partnerska",
                    ContractNumber = "K/2024/002",
                    CustomerId = customers.Skip(1).FirstOrDefault()?.Id ?? 1,
                    ResponsibleGroupId = groups.Skip(1).FirstOrDefault()?.Id ?? 0,
                    CreatedByUserId = users.FirstOrDefault()?.Id ?? 0,
                    NetAmount = 8000.00m,
                    SignedAt = DateTime.Now.AddDays(-45),
                    StartDate = DateTime.Now.AddDays(-15),
                    EndDate = DateTime.Now.AddDays(350)
                }
            };

            context.Contracts.AddRange(contracts);
            context.SaveChanges();

            // Dodanie tagów do kontraktów
            var contractTags = new List<CRM.Data.Models.ContractTag>();
            foreach (var contract in contracts)
            {
                contractTags.Add(new CRM.Data.Models.ContractTag
                {
                    ContractId = contract.Id,
                    TagId = tags.Skip(3).FirstOrDefault()?.Id ?? 1
                });
            }
            context.ContractTags.AddRange(contractTags);
            context.SaveChanges();
        }

        // Seedowanie spotkań
        if (!context.Meetings.Any())
        {
            var customers = context.Customers.ToList();
            var groups = context.Groups.ToList();
            var users = context.Users.ToList();
            var tags = context.Tags.ToList();

            var meetings = new List<CRM.Data.Models.Meeting>
            {
                new CRM.Data.Models.Meeting
                {
                    Topic = "Prezentacja oferty",
                    CustomerId = customers.FirstOrDefault()?.Id ?? 1,
                    AssignedGroupId = groups.FirstOrDefault()?.Id ?? 0,
                    CreatedByUserId = users.FirstOrDefault()?.Id ?? 0,
                    ScheduledAt = DateTime.Now.AddDays(5)
                },
                new CRM.Data.Models.Meeting
                {
                    Topic = "Omówienie projektu",
                    CustomerId = customers.Skip(1).FirstOrDefault()?.Id ?? 1,
                    AssignedGroupId = groups.Skip(1).FirstOrDefault()?.Id ?? 0,
                    CreatedByUserId = users.FirstOrDefault()?.Id ?? 0,
                    ScheduledAt = DateTime.Now.AddDays(10)
                }
            };

            context.Meetings.AddRange(meetings);
            context.SaveChanges();

            // Dodanie tagów do spotkań
            var meetingTags = new List<CRM.Data.Models.MeetingTag>();
            foreach (var meeting in meetings)
            {
                meetingTags.Add(new CRM.Data.Models.MeetingTag
                {
                    MeetingId = meeting.Id,
                    TagId = tags.FirstOrDefault()?.Id ?? 1
                });
            }
            context.MeetingTags.AddRange(meetingTags);
            context.SaveChanges();
        }

        // Seedowanie notatek
        if (!context.Notes.Any())
        {
            var customers = context.Customers.ToList();
            var users = context.Users.ToList();

            var notes = new List<CRM.Data.Models.Note>
            {
                new CRM.Data.Models.Note
                {
                    Content = "Klient zainteresowany nową ofertą. Należy skontaktować się w przyszłym tygodniu.",
                    CustomerId = customers.FirstOrDefault()?.Id ?? 1,
                    UserId = users.FirstOrDefault()?.Id ?? 1,
                    CreatedAt = DateTime.Now.AddDays(-2)
                },
                new CRM.Data.Models.Note
                {
                    Content = "Omówiono szczegóły projektu. Klient oczekuje wyceny do końca miesiąca.",
                    CustomerId = customers.Skip(1).FirstOrDefault()?.Id ?? 1,
                    UserId = users.FirstOrDefault()?.Id ?? 1,
                    CreatedAt = DateTime.Now.AddDays(-1)
                },
                new CRM.Data.Models.Note
                {
                    Content = "Wysłano dokumentację techniczną. Klient potwierdził otrzymanie.",
                    CustomerId = customers.Skip(2).FirstOrDefault()?.Id ?? 1,
                    UserId = users.FirstOrDefault()?.Id ?? 1,
                    CreatedAt = DateTime.Now.AddHours(-6)
                }
            };

            context.Notes.AddRange(notes);
            context.SaveChanges();
        }

        // Seedowanie przypomnień
        if (!context.Reminders.Any())
        {
            var users = context.Users.ToList();

            var reminders = new List<CRM.Data.Models.Reminder>
            {
                new CRM.Data.Models.Reminder
                {
                    Note = "Przypomnienie o spotkaniu z klientem VIP",
                    RemindAt = DateTime.Now.AddDays(1),
                    UserId = users.FirstOrDefault()?.Id ?? 1
                },
                new CRM.Data.Models.Reminder
                {
                    Note = "Sprawdzić status płatności za fakturę F/2024/002",
                    RemindAt = DateTime.Now.AddDays(3),
                    UserId = users.FirstOrDefault()?.Id ?? 1
                },
                new CRM.Data.Models.Reminder
                {
                    Note = "Przygotować raport miesięczny",
                    RemindAt = DateTime.Now.AddDays(7),
                    UserId = users.FirstOrDefault()?.Id ?? 1
                }
            };

            context.Reminders.AddRange(reminders);
            context.SaveChanges();
        }

        // Seedowanie płatności
        if (!context.Payments.Any())
        {
            var invoices = context.Invoices.ToList();

            var payments = new List<CRM.Data.Models.Payment>
            {
                new CRM.Data.Models.Payment
                {
                    InvoiceId = invoices.FirstOrDefault()?.Id ?? 1,
                    Amount = 1500.00m,
                    PaidAt = DateTime.Now.AddDays(-20)
                },
                new CRM.Data.Models.Payment
                {
                    InvoiceId = invoices.Skip(2).FirstOrDefault()?.Id ?? 1,
                    Amount = 800.00m,
                    PaidAt = DateTime.Now.AddDays(-5)
                }
            };

                    context.Payments.AddRange(payments);
        context.SaveChanges();
    }

    // Seedowanie logów systemowych
    if (!context.SystemLogs.Any())
    {
        var users = context.Users.ToList();
        var firstUser = users.FirstOrDefault();

        var systemLogs = new List<CRM.Data.Models.SystemLog>
        {
            new CRM.Data.Models.SystemLog
            {
                Timestamp = DateTime.UtcNow.AddHours(-2),
                Level = "Information",
                Message = "System CRM został uruchomiony pomyślnie",
                Source = "CRM.API.Program",
                UserId = firstUser?.Id,
                Details = "{\"version\": \"1.0.0\", \"environment\": \"Development\"}"
            },
            new CRM.Data.Models.SystemLog
            {
                Timestamp = DateTime.UtcNow.AddHours(-1),
                Level = "Information",
                Message = "Baza danych została zainicjalizowana",
                Source = "CRM.API.Program",
                UserId = firstUser?.Id,
                Details = "{\"tables\": [\"Users\", \"Customers\", \"Invoices\", \"Contracts\"]}"
            },
            new CRM.Data.Models.SystemLog
            {
                Timestamp = DateTime.UtcNow.AddMinutes(-30),
                Level = "Warning",
                Message = "Wykryto próbę nieautoryzowanego dostępu do API",
                Source = "CRM.API.Controllers.AuthController",
                Details = "{\"ip\": \"192.168.1.100\", \"endpoint\": \"/api/Auth/login\"}"
            },
            new CRM.Data.Models.SystemLog
            {
                Timestamp = DateTime.UtcNow.AddMinutes(-15),
                Level = "Information",
                Message = "Użytkownik zalogował się pomyślnie",
                Source = "CRM.API.Controllers.AuthController",
                UserId = firstUser?.Id,
                Details = "{\"username\": \"admin\", \"ip\": \"127.0.0.1\"}"
            },
            new CRM.Data.Models.SystemLog
            {
                Timestamp = DateTime.UtcNow.AddMinutes(-10),
                Level = "Information",
                Message = "Utworzono nowego klienta",
                Source = "CRM.API.Controllers.CustomersController",
                UserId = firstUser?.Id,
                Details = "{\"customerName\": \"Firma ABC\", \"customerId\": 1}"
            },
            new CRM.Data.Models.SystemLog
            {
                Timestamp = DateTime.UtcNow.AddMinutes(-5),
                Level = "Error",
                Message = "Błąd podczas generowania raportu PDF",
                Source = "CRM.BusinessLogic.Services.ReportService",
                UserId = firstUser?.Id,
                Details = "{\"error\": \"File not found\", \"reportType\": \"invoice\"}"
            }
        };

        context.SystemLogs.AddRange(systemLogs);
        context.SaveChanges();
    }
}
catch (Exception ex)
{
    // Pobranie serwisu loggera z kontenera DI
    var logger = services.GetRequiredService<ILogger<Program>>();
    // Logowanie błędu seedowania z pełnym stack trace
    logger.LogError(ex, "An error occurred while seeding the database.");
}

// Konfiguracja adresu URL, na którym aplikacja będzie nasłuchiwać
// 0.0.0.0:5000 oznacza nasłuchiwanie na wszystkich interfejsach sieciowych na porcie 5000
app.Urls.Add("http://0.0.0.0:5000");

// Uruchomienie aplikacji ASP.NET Core - blokujące wywołanie
app.Run();