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
        /// <summary>
        /// Metoda uwierzytelniania użytkownika
        /// Sprawdza czy podane dane logowania są poprawne i zwraca użytkownika lub null
        /// </summary>
        /// <param name="username">Nazwa użytkownika do uwierzytelnienia</param>
        /// <param name="password">Hasło użytkownika do uwierzytelnienia</param>
        /// <returns>Obiekt użytkownika jeśli uwierzytelnienie się powiodło, null w przeciwnym przypadku</returns>
        Task<User?> AuthenticateAsync(string username, string password); // Metoda asynchroniczna zwracająca użytkownika lub null

        /// <summary>
        /// Metoda generowania tokenu JWT dla użytkownika
        /// Tworzy token JWT zawierający informacje o użytkowniku i jego uprawnieniach
        /// </summary>
        /// <param name="user">Użytkownik dla którego generowany jest token</param>
        /// <returns>Token JWT jako string</returns>
        string GenerateJwtToken(User user); // Metoda zwracająca token JWT jako string

        /// <summary>
        /// Metoda rejestracji nowego użytkownika
        /// Tworzy nowego użytkownika w systemie z podanymi danymi
        /// </summary>
        /// <param name="request">Dane nowego użytkownika (nazwa użytkownika, email, hasło, rola)</param>
        /// <returns>Nowo utworzony użytkownik lub null jeśli rejestracja się nie powiodła</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy rola o podanym ID nie istnieje</exception>
        Task<User?> RegisterAsync(RegisterRequest request); // Metoda asynchroniczna zwracająca nowego użytkownika lub null

        /// <summary>
        /// Metoda pobierania użytkownika po ID
        /// Wyszukuje użytkownika w bazie danych po jego ID wraz z danymi roli
        /// </summary>
        /// <param name="userId">ID użytkownika do wyszukania</param>
        /// <returns>Obiekt użytkownika lub null jeśli nie został znaleziony</returns>
        Task<User?> GetUserByIdAsync(int userId); // Metoda asynchroniczna zwracająca użytkownika lub null

        /// <summary>
        /// Metoda aktualizacji danych użytkownika
        /// Aktualizuje informacje o użytkowniku (nazwa użytkownika, email, rola)
        /// </summary>
        /// <param name="userId">ID użytkownika do aktualizacji</param>
        /// <param name="request">Nowe dane użytkownika</param>
        /// <returns>Zaktualizowany użytkownik lub null jeśli użytkownik nie został znaleziony</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy rola o podanym ID nie istnieje</exception>
        Task<User?> UpdateUserAsync(int userId, UpdateUserRequest request); // Metoda asynchroniczna zwracająca zaktualizowanego użytkownika lub null
    }
}
