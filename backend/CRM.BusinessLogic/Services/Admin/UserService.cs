using CRM.Data;
using CRM.Data.Models;
using Microsoft.EntityFrameworkCore;
using CRM.BusinessLogic.Services; // Dodaj ten using

namespace CRM.BusinessLogic.Services.Admin
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogService _logService;

        public UserService(ApplicationDbContext context, ILogService logService)
        {
            _context = context;
            _logService = logService;
        }

        public async Task<User> CreateAsync(CreateUserDto dto)
        {
            var role = await _context.Roles.FindAsync(dto.RoleId);
            if (role == null)
                throw new Exception("Rola nie istnieje!");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = passwordHash,
                RoleId = dto.RoleId,
                Role = role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            await _logService.LogAsync("Information", $"Użytkownik {user.Username} (ID: {user.Id}) został utworzony przez administratora.", "UserService", user.Id);
            return user;
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users.Include(u => u.Role).ToListAsync();
        }

        public async Task<List<User>> GetAllWithRolesAsync()
        {
            return await _context.Users
                .Include(u => u.Role)
                .ToListAsync();
        }


        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> UpdateAsync(int id, UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.Username = dto.Username;
            user.Email = dto.Email;
            user.RoleId = dto.RoleId;

            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeUserPasswordAsync(int userId, string currentPassword, string newPassword)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return false;
            }

            if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            {
                return false;
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();

            await _logService.LogAsync("Information", $"Użytkownik {user.Username} ({user.Id}) zmienił hasło.", "UserService", user.Id);

            return true;
        }
    }
}
