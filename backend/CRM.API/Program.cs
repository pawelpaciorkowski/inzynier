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
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// 2. Kontrolery
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
});

// 3. Serwisy biznesowe (bez zmian)
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<InvoicePdfService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<ILogService, LogService>();

// Plik: backend/CRM.API/Program.cs

// 4. CORS (Cross-Origin Resource Sharing) - WERSJA Z HARDKODOWANIEM
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        // Bezpośrednio podajemy dozwolone adresy, omijając pliki konfiguracyjne
        policy.WithOrigins("http://localhost:5173", "http://localhost:8081")
              .AllowAnyHeader()
              .AllowAnyMethod();
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
                new CRM.Data.Models.Role { Name = "User", Description = "Standardowy użytkownik", Users = new List<CRM.Data.Models.User>() }
            );
            context.SaveChanges();
        }

        // Seedowanie użytkowników
        if (!context.Users.Any())
        {
            var userRole = context.Roles.FirstOrDefault(r => r.Name == "User");
            if (userRole != null)
            {
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword("user123");
                context.Users.Add(new CRM.Data.Models.User
                {
                    Username = "user",
                    Email = "user@example.com",
                    PasswordHash = hashedPassword,
                    RoleId = userRole.Id,
                    Role = userRole
                });
                context.SaveChanges();
            }
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