using CRM.BusinessLogic.Auth.Requests;
using CRM.Data.Models;

namespace CRM.BusinessLogic.Auth
{
    public interface IAuthService
    {
        Task<User?> AuthenticateAsync(string username, string password, string? userAgent = null, string? ipAddress = null);
        string GenerateJwtToken(User user);
        Task<User?> RegisterAsync(RegisterRequest request);
        Task<User?> GetUserByIdAsync(int userId);
        Task<User?> UpdateUserAsync(int userId, UpdateUserRequest request);
    }
}
