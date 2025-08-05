using CRM.Data.Models; // Importuje modele danych CRM (Role, User, etc.)

namespace CRM.BusinessLogic.Services.Admin // Przestrzeń nazw dla serwisów administracyjnych w warstwie biznesowej
{
    /// <summary>
    /// Interfejs serwisu zarządzania rolami użytkowników
    /// Definiuje kontrakt dla wszystkich operacji związanych z zarządzaniem rolami w systemie CRM
    /// Implementowany przez klasę RoleService
    /// </summary>
    public interface IRoleService // Interfejs publiczny definiujący kontrakt serwisu zarządzania rolami
    {
        /// <summary>
        /// Metoda pobierania wszystkich ról z systemu
        /// Zwraca listę wszystkich dostępnych ról w systemie CRM
        /// </summary>
        /// <returns>Lista wszystkich ról w systemie</returns>
        Task<List<Role>> GetAllAsync(); // Metoda asynchroniczna zwracająca listę wszystkich ról

        /// <summary>
        /// Metoda pobierania roli po ID
        /// Wyszukuje rolę w systemie na podstawie jej unikalnego identyfikatora
        /// </summary>
        /// <param name="id">ID roli do wyszukania</param>
        /// <returns>Obiekt roli lub null jeśli rola nie została znaleziona</returns>
        Task<Role?> GetByIdAsync(int id); // Metoda asynchroniczna zwracająca rolę lub null

        /// <summary>
        /// Metoda tworzenia nowej roli w systemie
        /// Tworzy nową rolę z podanymi danymi i zapisuje ją w bazie danych
        /// </summary>
        /// <param name="dto">Dane nowej roli (nazwa, opis, uprawnienia)</param>
        /// <returns>Nowo utworzona rola</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy rola o podanej nazwie już istnieje</exception>
        Task<Role> CreateAsync(CreateRoleDto dto); // Metoda asynchroniczna zwracająca nową rolę

        /// <summary>
        /// Metoda aktualizacji istniejącej roli
        /// Aktualizuje dane roli o podanym ID z nowymi informacjami
        /// </summary>
        /// <param name="id">ID roli do aktualizacji</param>
        /// <param name="dto">Nowe dane roli</param>
        /// <returns>True jeśli aktualizacja się powiodła, false w przeciwnym przypadku</returns>
        Task<bool> UpdateAsync(int id, UpdateRoleDto dto); // Metoda asynchroniczna zwracająca status operacji

        /// <summary>
        /// Metoda usuwania roli z systemu
        /// Usuwa rolę o podanym ID z bazy danych
        /// </summary>
        /// <param name="id">ID roli do usunięcia</param>
        /// <returns>True jeśli usunięcie się powiodło, false w przeciwnym przypadku</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy rola ma przypisanych użytkowników</exception>
        Task<bool> DeleteAsync(int id); // Metoda asynchroniczna zwracająca status operacji

        /// <summary>
        /// Metoda pobierania wszystkich ról wraz z liczbą przypisanych użytkowników
        /// Zwraca listę ról z informacją o tym, ile użytkowników ma przypisaną każdą rolę
        /// </summary>
        /// <returns>Lista ról z liczbą przypisanych użytkowników</returns>
        Task<List<RoleWithUserCountDto>> GetAllWithUserCountAsync(); // Metoda asynchroniczna zwracająca listę ról z liczbą użytkowników

        /// <summary>
        /// Metoda pobierania wszystkich użytkowników przypisanych do określonej roli
        /// Zwraca listę użytkowników którzy mają przypisaną rolę o podanym ID
        /// </summary>
        /// <param name="roleId">ID roli dla której pobierani są użytkownicy</param>
        /// <returns>Lista użytkowników z danymi roli</returns>
        Task<List<UserWithRoleDto>> GetUsersInRoleAsync(int roleId); // Metoda asynchroniczna zwracająca listę użytkowników w roli
    }
}
