using CRM.Data;
using CRM.BusinessLogic.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CRM.BusinessLogic.Auth;
using CRM.BusinessLogic.Services.Admin;
using Microsoft.OpenApi.Models; // Dodaj ten using

var builder = WebApplication.CreateBuilder(args);

// --- Rejestracja serwisów ---

// 1. Baza Danych
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
           .EnableSensitiveDataLogging());

// 2. Kontrolery
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase; // Ta linia konwertuje na camelCase
});

// 3. Serwisy biznesowe (bez zmian)
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<InvoicePdfService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<ILogService, LogService>();
builder.Services.AddScoped<DocumentGenerationService>();
builder.Services.AddScoped<ICsvExportService, CsvExportService>();

// Plik: backend/CRM.API/Program.cs

// 4. CORS (Cross-Origin Resource Sharing) - WERSJA Z HARDKODOWANIEM
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        // Bezpośrednio podajemy dozwolone adresy, omijając pliki konfiguracyjne
        policy.WithOrigins("http://localhost:5173", "http://localhost:8081")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 5. Autentykacja JWT - BEZPIECZNIEJSZA WERSJA
// Pobierz klucz z konfiguracji i upewnij się, że nie jest pusty
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    // Rzuć wyjątek, aby aplikacja nie uruchomiła się bez klucza.
    // To natychmiast pokaże Ci błąd w logach zamiast enigmatycznego błędu 500.
    throw new ArgumentNullException(nameof(jwtKey), "Klucz 'Jwt:Key' nie może być pusty. Sprawdź appsettings.json.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme) // Ustawienie domyślnego schematu
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();


// 6. Swagger / OpenAPI (bez większych zmian, kosmetyka)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CRM.API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Wprowadź token JWT z prefiksem 'Bearer '.",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});


// --- Budowanie aplikacji i konfiguracja pipeline'u HTTP ---

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // Dodaj, aby widzieć szczegółowe błędy w trybie deweloperskim
}

app.UseHttpsRedirection();
app.UseRouting(); // Ważne, aby było przed UseCors, UseAuthentication i UseAuthorization
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seedowanie danych
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate(); // Upewnij się, że migracje są zastosowane

        // Seedowanie ról
        if (!context.Roles.Any())
        {
            context.Roles.AddRange(
                new CRM.Data.Models.Role { Name = "Admin", Description = "Administrator systemu", Users = new List<CRM.Data.Models.User>() },
                new CRM.Data.Models.Role { Name = "User", Description = "Standardowy użytkownik", Users = new List<CRM.Data.Models.User>() },
                new CRM.Data.Models.Role { Name = "Manager", Description = "Menedżer", Users = new List<CRM.Data.Models.User>() },
                new CRM.Data.Models.Role { Name = "Sprzedawca", Description = "Sprzedawca", Users = new List<CRM.Data.Models.User>() }
            );
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
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.Urls.Add("http://0.0.0.0:5000");

app.Run();