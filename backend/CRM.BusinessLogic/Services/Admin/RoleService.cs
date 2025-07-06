using CRM.Data;
using CRM.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace CRM.BusinessLogic.Services.Admin
{
    public class RoleService : IRoleService
    {
        private readonly ApplicationDbContext _context;

        public RoleService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Role>> GetAllAsync()
        {
            return await _context.Roles.ToListAsync();
        }

        public async Task<Role?> GetByIdAsync(int id)
        {
            return await _context.Roles.FindAsync(id);
        }

        public async Task<Role> CreateAsync(CreateRoleDto dto)
        {
            var role = new Role
            {
                Name = dto.Name,
                Description = dto.Description,
                Users = new List<User>()
            };
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
            return role;
        }


        public async Task<bool> UpdateAsync(int id, UpdateRoleDto dto)
        {
            var existing = await _context.Roles.FindAsync(id);
            if (existing == null) return false;

            existing.Name = dto.Name;
            existing.Description = dto.Description;
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return false;

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<RoleWithUserCountDto>> GetAllWithUserCountAsync()
        {
            return await _context.Roles
                .Select(r => new RoleWithUserCountDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    UsersCount = r.Users.Count()
                })
                .ToListAsync();
        }

        public async Task<List<UserWithRoleDto>> GetUsersInRoleAsync(int roleId)
        {
            return await _context.Users
                .Where(u => u.RoleId == roleId)
                .Select(u => new UserWithRoleDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role.Name
                })
                .ToListAsync();
        }

    }
}
