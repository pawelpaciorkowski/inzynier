using CRM.Data.Models;

namespace CRM.BusinessLogic.Services.Admin
{
    public interface IRoleService
    {
        Task<List<Role>> GetAllAsync();
        Task<Role?> GetByIdAsync(int id);
        Task<Role> CreateAsync(CreateRoleDto dto);
        Task<bool> UpdateAsync(int id, UpdateRoleDto dto);
        Task<bool> DeleteAsync(int id);
        Task<List<RoleWithUserCountDto>> GetAllWithUserCountAsync();
        Task<List<UserWithRoleDto>> GetUsersInRoleAsync(int roleId);
    }
}
