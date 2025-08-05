using CRM.Data.Models; // Importuje modele danych CRM (User, Role, etc.)

namespace CRM.BusinessLogic.Services.Admin // Przestrzeń nazw dla serwisów administracyjnych w warstwie biznesowej
{
    /// <summary>
    /// Interfejs serwisu zarządzania użytkownikami
    /// Definiuje kontrakt dla wszystkich operacji związanych z zarządzaniem użytkownikami w systemie CRM
    /// Implementowany przez klasę UserService
    /// </summary>
    public interface IUserService // Interfejs publiczny definiujący kontrakt serwisu zarządzania użytkownikami
    {
        /// <summary>
        /// Metoda pobierania wszystkich użytkowników z systemu
        /// Zwraca listę wszystkich zarejestrowanych użytkowników w systemie CRM
        /// </summary>
        /// <returns>Lista wszystkich użytkowników w systemie</returns>
        Task<List<User>> GetAllAsync(); // Metoda asynchroniczna zwracająca listę wszystkich użytkowników

        /// <summary>
        /// Metoda pobierania użytkownika po ID
        /// Wyszukuje użytkownika w systemie na podstawie jego unikalnego identyfikatora
        /// </summary>
        /// <param name="id">ID użytkownika do wyszukania</param>
        /// <returns>Obiekt użytkownika lub null jeśli użytkownik nie został znaleziony</returns>
        Task<User?> GetByIdAsync(int id); // Metoda asynchroniczna zwracająca użytkownika lub null

        /// <summary>
        /// Metoda tworzenia nowego użytkownika w systemie
        /// Tworzy nowego użytkownika z podanymi danymi i zapisuje go w bazie danych
        /// </summary>
        /// <param name="dto">Dane nowego użytkownika (nazwa użytkownika, email, hasło, rola)</param>
        /// <returns>Nowo utworzony użytkownik</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy użytkownik o podanej nazwie lub emailu już istnieje</exception>
        Task<User> CreateAsync(CreateUserDto dto); // Metoda asynchroniczna zwracająca nowego użytkownika

        /// <summary>
        /// Metoda aktualizacji istniejącego użytkownika
        /// Aktualizuje dane użytkownika o podanym ID z nowymi informacjami
        /// </summary>
        /// <param name="id">ID użytkownika do aktualizacji</param>
        /// <param name="dto">Nowe dane użytkownika</param>
        /// <returns>True jeśli aktualizacja się powiodła, false w przeciwnym przypadku</returns>
        Task<bool> UpdateAsync(int id, UpdateUserDto dto); // Metoda asynchroniczna zwracająca status operacji

        /// <summary>
        /// Metoda usuwania użytkownika z systemu
        /// Usuwa użytkownika o podanym ID z bazy danych
        /// </summary>
        /// <param name="id">ID użytkownika do usunięcia</param>
        /// <returns>True jeśli usunięcie się powiodło, false w przeciwnym przypadku</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy użytkownik ma przypisane aktywne dane (klienci, faktury, etc.)</exception>
        Task<bool> DeleteAsync(int id); // Metoda asynchroniczna zwracająca status operacji

        /// <summary>
        /// Metoda pobierania wszystkich użytkowników wraz z ich rolami
        /// Zwraca listę użytkowników z dołączonymi danymi ich ról
        /// </summary>
        /// <returns>Lista użytkowników z danymi ról</returns>
        Task<List<User>> GetAllWithRolesAsync(); // Metoda asynchroniczna zwracająca listę użytkowników z rolami

        /// <summary>
        /// Metoda zmiany hasła użytkownika
        /// Zmienia hasło użytkownika po weryfikacji aktualnego hasła
        /// </summary>
        /// <param name="userId">ID użytkownika którego hasło ma zostać zmienione</param>
        /// <param name="currentPassword">Aktualne hasło użytkownika do weryfikacji</param>
        /// <param name="newPassword">Nowe hasło użytkownika</param>
        /// <returns>True jeśli zmiana hasła się powiodła, false w przeciwnym przypadku</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy aktualne hasło jest niepoprawne</exception>
        Task<bool> ChangeUserPasswordAsync(int userId, string currentPassword, string newPassword); // Metoda asynchroniczna zwracająca status operacji

    }
}
