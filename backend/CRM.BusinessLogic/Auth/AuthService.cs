using System.IdentityModel.Tokens.Jwt; // Importuje klasy do obsługi tokenów JWT
using System.Security.Claims; // Importuje klasy do obsługi claims (oświadczeń) użytkownika
using System.Security.Cryptography; // Importuje funkcjonalności kryptograficzne
using System.Text; // Importuje klasy do obsługi kodowania tekstu
using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM
using Microsoft.Extensions.Configuration; // Importuje funkcjonalności konfiguracji
using Microsoft.IdentityModel.Tokens; // Importuje klasy do obsługi tokenów bezpieczeństwa
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using BCrypt.Net; // Importuje bibliotekę BCrypt do hashowania haseł
using CRM.BusinessLogic.Auth.Requests; // Importuje klasy żądań autoryzacji
using CRM.BusinessLogic.Services; // Importuje serwisy biznesowe

namespace CRM.BusinessLogic.Auth // Przestrzeń nazw dla funkcjonalności autoryzacji w warstwie biznesowej
{
    /// <summary>
    /// Serwis autoryzacji i uwierzytelniania użytkowników
    /// Klasa obsługuje logowanie, rejestrację, generowanie tokenów JWT oraz zarządzanie użytkownikami
    /// Implementuje interfejs IAuthService
    /// </summary>
    public class AuthService : IAuthService // Klasa publiczna implementująca interfejs IAuthService
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konfiguracja aplikacji
        /// Dostarcza dostęp do ustawień aplikacji (klucze JWT, connection strings, etc.)
        /// </summary>
        private readonly IConfiguration _config; // Interfejs konfiguracji aplikacji

        /// <summary>
        /// Serwis logowania systemowego
        /// Umożliwia zapisywanie logów aktywności użytkowników w systemie
        /// </summary>
        private readonly ILogService _logService; // Interfejs serwisu logowania

        /// <summary>
        /// Konstruktor klasy AuthService
        /// Inicjalizuje serwis z kontekstem bazy danych, konfiguracją i serwisem logowania przekazanymi przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        /// <param name="config">Konfiguracja aplikacji przekazana przez system dependency injection</param>
        /// <param name="logService">Serwis logowania przekazany przez system dependency injection</param>
        public AuthService(ApplicationDbContext context, IConfiguration config, ILogService logService)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
            _config = config; // Przypisuje przekazaną konfigurację do pola prywatnego
            _logService = logService; // Przypisuje przekazany serwis logowania do pola prywatnego
        }

        public async Task<User?> AuthenticateAsync(string username, string password, string? userAgent = null, string? ipAddress = null)
        {
            // Wyszukuje użytkownika w bazie danych po nazwie użytkownika (ignorując wielkość liter) wraz z jego rolą
            var user = await _context.Users
                .Include(u => u.Role) // Dołącza dane roli użytkownika
                .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower()); // Wyszukuje użytkownika po nazwie użytkownika, ignorując wielkość liter

            if (user == null) // Jeśli użytkownik nie został znaleziony
            {
                // Logowanie nieudanej próby logowania
                await LogFailedLoginAttempt(username, "Nieprawidłowa nazwa użytkownika", userAgent, ipAddress);
                return null;
            }

            // Sprawdza czy podane hasło pasuje do zahashowanego hasła w bazie danych
            var passwordMatch = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash); // Weryfikuje hasło używając BCrypt

            if (!passwordMatch) // Jeśli hasło nie pasuje
            {
                // Logowanie nieudanej próby logowania
                await LogFailedLoginAttempt(username, "Nieprawidłowe hasło", userAgent, ipAddress);
                return null;
            }

            // Pomyślne logowanie
            var loginHistory = new LoginHistory
            {
                UserId = user.Id,
                LoggedInAt = DateTime.UtcNow,
                IpAddress = ipAddress ?? "::1",
                UserAgent = userAgent,
                Browser = ParseBrowser(userAgent),
                OperatingSystem = ParseOperatingSystem(userAgent),
                DeviceType = ParseDeviceType(userAgent),
                IsSuccessful = true,
                Location = "Lokalne" // TODO: Implement IP geolocation
            };
            
            _context.LoginHistories.Add(loginHistory);
            await _context.SaveChangesAsync();

            return user; // Zwraca obiekt użytkownika - uwierzytelnienie powiodło się asynchronicznie bez blokowania wątku głównego 
        }

        private async Task LogFailedLoginAttempt(string username, string reason, string? userAgent, string? ipAddress)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user != null)
            {
                var failedLogin = new LoginHistory
                {
                    UserId = user.Id,
                    LoggedInAt = DateTime.UtcNow,
                    IpAddress = ipAddress ?? "::1", // TODO: Implement IP geolocation  - przypisac do logowania uzytkownika jego lokalizacje na podstawie IP adresu  
                    UserAgent = userAgent, // TODO: Implement IP geolocation  - przypisac do logowania uzytkownika jego lokalizacje na podstawie IP adresu  
                    Browser = ParseBrowser(userAgent), // opisz mi to 
                    //ParseBrowser - parsuje przeglądarkę użytkownika na podstawie UserAgent
                    //UserAgent - to jest string ktory zawiera informacje o przeglądarce użytkownika
                    //ParseBrowser - parsuje przeglądarkę użytkownika na podstawie UserAgent
                    OperatingSystem = ParseOperatingSystem(userAgent),
                    DeviceType = ParseDeviceType(userAgent),
                    IsSuccessful = false,
                    FailureReason = reason,
                    Location = "Lokalne" // TODO: Implement IP geolocation  - przypisac do logowania uzytkownika jego lokalizacje na podstawie IP adresu  
                };
                
                _context.LoginHistories.Add(failedLogin);
                await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych asynchronicznie bez blokowania wątku głównego          
            }
        }

        private string? ParseBrowser(string? userAgent)
        {
            if (string.IsNullOrEmpty(userAgent)) return null;
            
            userAgent = userAgent.ToLower();
            
            if (userAgent.Contains("chrome")) return "Chrome";
            if (userAgent.Contains("firefox")) return "Firefox";
            if (userAgent.Contains("safari")) return "Safari";
            if (userAgent.Contains("edge")) return "Edge";
            if (userAgent.Contains("opera")) return "Opera";
            if (userAgent.Contains("ie")) return "Internet Explorer";
            
            return "Nieznana";
        }

        private string? ParseOperatingSystem(string? userAgent)
        {
            if (string.IsNullOrEmpty(userAgent)) return null;
            
            userAgent = userAgent.ToLower();
            
            if (userAgent.Contains("windows")) return "Windows";
            if (userAgent.Contains("mac os")) return "macOS";
            if (userAgent.Contains("linux")) return "Linux";
            if (userAgent.Contains("android")) return "Android";
            if (userAgent.Contains("ios")) return "iOS";
            
            return "Nieznany";
        }

        private string? ParseDeviceType(string? userAgent)
        {
            if (string.IsNullOrEmpty(userAgent)) return null;
            
            userAgent = userAgent.ToLower();
            
            if (userAgent.Contains("mobile")) return "Mobile";
            if (userAgent.Contains("tablet")) return "Tablet";
            if (userAgent.Contains("android") || userAgent.Contains("ios")) return "Mobile";
            
            return "Desktop";
        }

        public string GenerateJwtToken(User user)
        {
            // Tworzy tablicę claims (oświadczeń) zawierających informacje o użytkowniku
            var claims = new[] // Tablica claims dla tokenu JWT
            {
                new Claim(ClaimTypes.Name, user.Username), // Nazwa użytkownika
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User"), // Rola użytkownika (domyślnie "User" jeśli rola jest null)
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()) // ID użytkownika jako string
            };

            // Tworzy klucz symetryczny do podpisywania tokenu z konfiguracji
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)); // Pobiera klucz JWT z konfiguracji
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256); // Tworzy poświadczenia podpisywania używając HMAC-SHA256

            // Tworzy token JWT z wszystkimi parametrami
            var token = new JwtSecurityToken( // Tworzy nowy token JWT
                issuer: _config["Jwt:Issuer"], // Emitent tokenu z konfiguracji
                audience: _config["Jwt:Audience"], // Odbiorca tokenu z konfiguracji
                claims: claims, // Claims (oświadczenia) użytkownika
                expires: DateTime.UtcNow.AddHours(2), // Czas wygaśnięcia tokenu (2 godziny od teraz)
                signingCredentials: creds); // Poświadczenia podpisywania

            // Konwertuje token JWT na string i zwraca go
            return new JwtSecurityTokenHandler().WriteToken(token); // Zwraca token JWT jako string
        }

        /// <summary>
        /// Metoda rejestracji nowego użytkownika
        /// Tworzy nowego użytkownika w systemie z podanymi danymi
        /// </summary>
        /// <param name="request">Dane nowego użytkownika (nazwa użytkownika, email, hasło, rola)</param>
        /// <returns>Nowo utworzony użytkownik lub null jeśli rejestracja się nie powiodła</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy rola o podanym ID nie istnieje</exception>
        public async Task<User?> RegisterAsync(RegisterRequest request) // Metoda asynchroniczna zwracająca nowego użytkownika lub null
        {
            // Sprawdzamy, czy rola, którą próbujemy przypisać, w ogóle istnieje
            var roleExists = await _context.Roles.AnyAsync(r => r.Id == request.RoleId); // Sprawdza czy rola o podanym ID istnieje
            if (!roleExists) // Jeśli rola nie istnieje
            {
                // Jeśli nie, nie możemy utworzyć użytkownika. To ważne zabezpieczenie.
                throw new InvalidOperationException($"Rola o ID {request.RoleId} nie istnieje."); // Rzuca wyjątek z komunikatem
            }

            // Sprawdza czy użytkownik o podanej nazwie już istnieje w systemie
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username); // Wyszukuje istniejącego użytkownika
            if (existingUser != null) return null; // Jeśli użytkownik już istnieje, zwraca null

            // Hashuje hasło użytkownika używając BCrypt
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password); // Tworzy hash hasła

            // Pobiera rolę z bazy danych
            var role = await _context.Roles.FindAsync(request.RoleId); // Wyszukuje rolę po ID
            if (role == null) // Jeśli rola nie została znaleziona (dodatkowe zabezpieczenie)
            {
                throw new InvalidOperationException($"Rola o ID {request.RoleId} nie istnieje."); // Rzuca wyjątek z komunikatem
            }

            // Tworzy nowy obiekt użytkownika z podanymi danymi
            var user = new User // Tworzy nowy obiekt User
            {
                Username = request.Username, // Ustawia nazwę użytkownika
                Email = request.Email, // Ustawia adres email
                PasswordHash = hashedPassword, // Ustawia zahashowane hasło
                RoleId = request.RoleId, // Ustawia ID roli
                Role = role // Ustawienie wymaganej właściwości Role
            };

            // 1. Dodajemy nowego użytkownika do "kolejki" zmian
            _context.Users.Add(user); // Dodaje nowego użytkownika do kontekstu Entity Framework

            // 👇 TUTAJ ZACZYNA SIĘ LOGIKA ZAPISU AKTYWNOŚCI
            // Po dodaniu użytkownika do kontekstu, ale przed zapisaniem zmian, tworzymy nowy wpis aktywności.
            // EF Core jest na tyle inteligentny, że zapisze oba obiekty (User i Activity) w jednej transakcji.
            var activity = new Activity // Tworzy nowy obiekt Activity
            {
                Note = $"Zarejestrowano nowego użytkownika: {user.Username}", // Ustawia notatkę o rejestracji
                // W tym przypadku nie wiemy, który zalogowany użytkownik to robi,
                // więc zostawiamy UserId puste lub przypisujemy ID systemowe, np. admina.
                // Dla uproszczenia, na razie zostawmy to puste, jeśli model na to pozwala.
                // Jeśli Twoja tabela `Activities` wymaga UserId, przypisz np. ID admina.
                // UserId = 1, 
            };
            _context.Activities.Add(activity); // Dodaje aktywność do kontekstu Entity Framework

            // 3. Zapisujemy WSZYSTKIE zmiany (użytkownika i aktywność) do bazy w jednej transakcji.
            await _context.SaveChangesAsync(); // Zapisuje wszystkie zmiany w bazie danych w jednej transakcji

            // Dodaj logowanie do SystemLog
            await _logService.LogAsync("Information", $"Nowy użytkownik {user.Username} (ID: {user.Id}) zarejestrowany.", "AuthService", user.Id); // Zapisuje log systemowy

            // Zwracamy nowo utworzonego użytkownika (teraz już z poprawnym ID z bazy)
            return user; // Zwraca nowo utworzonego użytkownika
        }

        /// <summary>
        /// Metoda pobierania użytkownika po ID
        /// Wyszukuje użytkownika w bazie danych po jego ID wraz z danymi roli
        /// </summary>
        /// <param name="userId">ID użytkownika do wyszukania</param>
        /// <returns>Obiekt użytkownika lub null jeśli nie został znaleziony</returns>
        public async Task<User?> GetUserByIdAsync(int userId) // Metoda asynchroniczna zwracająca użytkownika lub null
        {
            // Wyszukuje użytkownika po ID wraz z danymi roli
            return await _context.Users
                                 .Include(u => u.Role) // Dołącza dane roli użytkownika
                                 .FirstOrDefaultAsync(u => u.Id == userId); // Wyszukuje użytkownika po ID
        }

        /// <summary>
        /// Metoda aktualizacji danych użytkownika
        /// Aktualizuje informacje o użytkowniku (nazwa użytkownika, email, rola)
        /// </summary>
        /// <param name="userId">ID użytkownika do aktualizacji</param>
        /// <param name="request">Nowe dane użytkownika</param>
        /// <returns>Zaktualizowany użytkownik lub null jeśli użytkownik nie został znaleziony</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy rola o podanym ID nie istnieje</exception>
        public async Task<User?> UpdateUserAsync(int userId, UpdateUserRequest request) // Metoda asynchroniczna zwracająca zaktualizowanego użytkownika lub null
        {
            // Wyszukuje użytkownika po ID w bazie danych
            var user = await _context.Users.FindAsync(userId); // Wyszukuje użytkownika po ID
            if (user == null) // Jeśli użytkownik nie został znaleziony
            {
                return null; // Zwraca null
            }

            // Sprawdza czy rola o podanym ID istnieje
            var roleExists = await _context.Roles.AnyAsync(r => r.Id == request.RoleId); // Sprawdza czy rola istnieje
            if (!roleExists) // Jeśli rola nie istnieje
            {
                throw new InvalidOperationException($"Rola o ID {request.RoleId} nie istnieje."); // Rzuca wyjątek z komunikatem
            }

            // Aktualizuje dane użytkownika
            user.Username = request.Username; // Aktualizuje nazwę użytkownika
            user.Email = request.Email; // Aktualizuje adres email
            user.RoleId = request.RoleId; // Aktualizuje ID roli

            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
            return user; // Zwraca zaktualizowanego użytkownika
        }
    }
}