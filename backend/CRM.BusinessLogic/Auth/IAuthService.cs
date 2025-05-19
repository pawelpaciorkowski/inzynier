using CRM.Data.Models;

namespace CRM.BusinessLogic.Auth
{
    public interface IAuthService
    {
        Task<User?> AuthenticateAsync(string username, string password);
        string GenerateJwtToken(User user);
        Task<User?> RegisterAsync(RegisterRequest request);
    }
}
