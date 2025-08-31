using CRM.BusinessLogic.Auth.Requests; // Importuje klasy żądań autoryzacji (RegisterRequest, UpdateUserRequest)
using CRM.Data.Models; // Importuje modele danych CRM (User, Role, etc.)

namespace CRM.BusinessLogic.Auth // Przestrzeń nazw dla funkcjonalności autoryzacji w warstwie biznesowej
{
    /// <summary>
    /// Interfejs serwisu autoryzacji i uwierzytelniania użytkowników
    /// Definiuje kontrakt dla wszystkich operacji związanych z autoryzacją w systemie CRM
    /// Implementowany przez klasę AuthService
    /// </summary>
    public interface IAuthService // Interfejs publiczny definiujący kontrakt serwisu autoryzacji
    {
        Task<User?> AuthenticateAsync(string username, string password, string? userAgent = null, string? ipAddress = null);
        string GenerateJwtToken(User user);
        Task<User?> RegisterAsync(RegisterRequest request);
        Task<User?> GetUserByIdAsync(int userId);
        Task<User?> UpdateUserAsync(int userId, UpdateUserRequest request);
    }
}
