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

namespace CRM.BusinessLogic.Auth
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<User?> AuthenticateAsync(string username, string password)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
            {
                return null;
            }

            var passwordMatch = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

            if (!passwordMatch)
            {
                return null;
            }

            var loginHistory = new LoginHistory
            {
                UserId = user.Id,
                LoggedInAt = DateTime.UtcNow,
                IpAddress = "::1"
            };
            _context.LoginHistories.Add(loginHistory);
            await _context.SaveChangesAsync();

            return user;
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
            // Sprawdź, czy użytkownik o podanej nazwie już istnieje
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return null; // Zwróć null, jeśli użytkownik istnieje
            }

            // NAJWAŻNIEJSZA ZMIANA: Szukamy roli o nazwie "User" bezpośrednio w bazie.
            var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "User");

            // Zabezpieczenie, gdyby rola "User" nie istniała w bazie.
            if (userRole == null)
            {
                throw new InvalidOperationException("Nie można znaleźć domyślnej roli 'User'. Upewnij się, że tabela 'roles' jest poprawnie wypełniona.");
            }

            // Tworzymy hash hasła
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Tworzymy nowego użytkownika
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = hashedPassword,
                // PRZYPISUJEMY ID ZNALEZIONEJ ROLI, a nie to, co przyszło w zapytaniu.
                RoleId = userRole.Id
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }
    }
}