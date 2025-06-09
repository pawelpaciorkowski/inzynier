using CRM.Data.Models;

namespace CRM.BusinessLogic.Services.Admin
{
    public interface IUserService
    {
        Task<List<User>> GetAllAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User> CreateAsync(CreateUserDto dto);
        Task<bool> UpdateAsync(int id, UpdateUserDto dto);
        Task<bool> DeleteAsync(int id);
        Task<List<User>> GetAllWithRolesAsync();
        Task<bool> ChangeUserPasswordAsync(int userId, string currentPassword, string newPassword);

    }
}
