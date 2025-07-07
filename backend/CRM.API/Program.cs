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
// ... (reszta serwisów)

// 4. CORS (Cross-Origin Resource Sharing) - BARDZIEJ ELASTYCZNA WERSJA
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        // Pobierz dozwolone adresy z appsettings.json
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new string[0];
        policy.WithOrigins(allowedOrigins)
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage(); // Dodaj, aby widzieć szczegółowe błędy w trybie deweloperskim
}

app.UseHttpsRedirection();
app.UseRouting(); // Ważne, aby było przed UseCors, UseAuthentication i UseAuthorization
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Nie ma potrzeby hardkodowania URL, jest to zarządzane przez launchSettings.json lub argumenty linii poleceń
// app.Urls.Add("http://localhost:8082");
app.Urls.Add("http://0.0.0.0:5000");

app.Run();