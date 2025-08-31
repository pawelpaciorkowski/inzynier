using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CRM.Data;
using CRM.Data.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using CRM.BusinessLogic.Auth.Requests;
using CRM.BusinessLogic.Services;

namespace CRM.BusinessLogic.Auth
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly ILogService _logService;

        public AuthService(ApplicationDbContext context, IConfiguration config, ILogService logService)
        {
            _context = context;
            _config = config;
            _logService = logService;
        }

        public async Task<User?> AuthenticateAsync(string username, string password, string? userAgent = null, string? ipAddress = null)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
            {
                // Logowanie nieudanej próby logowania
                await LogFailedLoginAttempt(username, "Nieprawidłowa nazwa użytkownika", userAgent, ipAddress);
                return null;
            }

            var passwordMatch = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

            if (!passwordMatch)
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

            return user;
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
                    IpAddress = ipAddress ?? "::1",
                    UserAgent = userAgent,
                    Browser = ParseBrowser(userAgent),
                    OperatingSystem = ParseOperatingSystem(userAgent),
                    DeviceType = ParseDeviceType(userAgent),
                    IsSuccessful = false,
                    FailureReason = reason,
                    Location = "Lokalne"
                };
                
                _context.LoginHistories.Add(failedLogin);
                await _context.SaveChangesAsync();
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
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User"),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<User?> RegisterAsync(RegisterRequest request)
        {
            // Sprawdzamy, czy rola, którą próbujemy przypisać, w ogóle istnieje
            var roleExists = await _context.Roles.AnyAsync(r => r.Id == request.RoleId);
            if (!roleExists)
            {
                // Jeśli nie, nie możemy utworzyć użytkownika. To ważne zabezpieczenie.
                throw new InvalidOperationException($"Rola o ID {request.RoleId} nie istnieje.");
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (existingUser != null) return null;

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var role = await _context.Roles.FindAsync(request.RoleId);
            if (role == null)
            {
                throw new InvalidOperationException($"Rola o ID {request.RoleId} nie istnieje.");
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = hashedPassword,
                RoleId = request.RoleId,
                Role = role // Ustawienie wymaganej właściwości Role
            };

            // 1. Dodajemy nowego użytkownika do "kolejki" zmian
            _context.Users.Add(user);

            // 👇 TUTAJ ZACZYNA SIĘ LOGIKA ZAPISU AKTYWNOŚCI
            // Po dodaniu użytkownika do kontekstu, ale przed zapisaniem zmian, tworzymy nowy wpis aktywności.
            // EF Core jest na tyle inteligentny, że zapisze oba obiekty (User i Activity) w jednej transakcji.
            var activity = new Activity
            {
                Note = $"Zarejestrowano nowego użytkownika: {user.Username}",
                // W tym przypadku nie wiemy, który zalogowany użytkownik to robi,
                // więc zostawiamy UserId puste lub przypisujemy ID systemowe, np. admina.
                // Dla uproszczenia, na razie zostawmy to puste, jeśli model na to pozwala.
                // Jeśli Twoja tabela `Activities` wymaga UserId, przypisz np. ID admina.
                // UserId = 1, 
            };
            _context.Activities.Add(activity);

            // 3. Zapisujemy WSZYSTKIE zmiany (użytkownika i aktywność) do bazy w jednej transakcji.
            await _context.SaveChangesAsync();

            // Dodaj logowanie do SystemLog
            await _logService.LogAsync("Information", $"Nowy użytkownik {user.Username} (ID: {user.Id}) zarejestrowany.", "AuthService", user.Id);

            // Zwracamy nowo utworzonego użytkownika (teraz już z poprawnym ID z bazy)
            return user;
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users
                                 .Include(u => u.Role)
                                 .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<User?> UpdateUserAsync(int userId, UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return null;
            }

            var roleExists = await _context.Roles.AnyAsync(r => r.Id == request.RoleId);
            if (!roleExists)
            {
                throw new InvalidOperationException($"Rola o ID {request.RoleId} nie istnieje.");
            }

            user.Username = request.Username;
            user.Email = request.Email;
            user.RoleId = request.RoleId;

            await _context.SaveChangesAsync();
            return user;
        }
    }
}