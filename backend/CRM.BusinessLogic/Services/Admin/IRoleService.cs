using CRM.Data.Models;

namespace CRM.BusinessLogic.Services.Admin
{
    public interface IRoleService
    {
        Task<List<Role>> GetAllAsync();
        Task<Role?> GetByIdAsync(int id);
        Task<Role> CreateAsync(Role role);
        Task<bool> UpdateAsync(int id, Role role);
        Task<bool> DeleteAsync(int id);
    }
}
