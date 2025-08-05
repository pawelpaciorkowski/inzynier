using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM (Role, User, etc.)
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core

namespace CRM.BusinessLogic.Services.Admin // Przestrzeń nazw dla serwisów administracyjnych w warstwie biznesowej
{
    /// <summary>
    /// Serwis zarządzania rolami użytkowników
    /// Klasa implementująca interfejs IRoleService, obsługuje operacje CRUD na rolach
    /// oraz pobieranie statystyk i użytkowników przypisanych do ról
    /// </summary>
    public class RoleService : IRoleService // Klasa publiczna implementująca interfejs IRoleService
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konstruktor klasy RoleService
        /// Inicjalizuje serwis z kontekstem bazy danych przekazanym przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        public RoleService(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda pobierania wszystkich ról z systemu
        /// Zwraca listę wszystkich dostępnych ról w systemie CRM
        /// </summary>
        /// <returns>Lista wszystkich ról w systemie</returns>
        public async Task<List<Role>> GetAllAsync() // Metoda asynchroniczna zwracająca listę wszystkich ról
        {
            // Wykonuje zapytanie do bazy danych - pobiera wszystkie role
            return await _context.Roles.ToListAsync(); // Zwraca listę wszystkich ról z bazy danych
        }

        /// <summary>
        /// Metoda pobierania roli po ID
        /// Wyszukuje rolę w systemie na podstawie jej unikalnego identyfikatora
        /// </summary>
        /// <param name="id">ID roli do wyszukania</param>
        /// <returns>Obiekt roli lub null jeśli rola nie została znaleziona</returns>
        public async Task<Role?> GetByIdAsync(int id) // Metoda asynchroniczna zwracająca rolę lub null
        {
            // Wyszukuje rolę po ID w bazie danych
            return await _context.Roles.FindAsync(id); // Zwraca rolę o podanym ID lub null jeśli nie istnieje
        }

        /// <summary>
        /// Metoda tworzenia nowej roli w systemie
        /// Tworzy nową rolę z podanymi danymi i zapisuje ją w bazie danych
        /// </summary>
        /// <param name="dto">Dane nowej roli (nazwa, opis, uprawnienia)</param>
        /// <returns>Nowo utworzona rola</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy rola o podanej nazwie już istnieje</exception>
        public async Task<Role> CreateAsync(CreateRoleDto dto) // Metoda asynchroniczna zwracająca nową rolę
        {
            // Tworzy nowy obiekt roli z danymi z DTO
            var role = new Role // Tworzy nowy obiekt Role
            {
                Name = dto.Name, // Ustawia nazwę roli z DTO
                Description = dto.Description, // Ustawia opis roli z DTO
                Users = new List<User>() // Inicjalizuje pustą listę użytkowników dla nowej roli
            };
            
            _context.Roles.Add(role); // Dodaje nową rolę do kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje rolę w bazie danych
            return role; // Zwraca nowo utworzoną rolę
        }

        /// <summary>
        /// Metoda aktualizacji istniejącej roli
        /// Aktualizuje dane roli o podanym ID z nowymi informacjami
        /// </summary>
        /// <param name="id">ID roli do aktualizacji</param>
        /// <param name="dto">Nowe dane roli</param>
        /// <returns>True jeśli aktualizacja się powiodła, false w przeciwnym przypadku</returns>
        public async Task<bool> UpdateAsync(int id, UpdateRoleDto dto) // Metoda asynchroniczna zwracająca status operacji
        {
            // Wyszukuje istniejącą rolę po ID w bazie danych
            var existing = await _context.Roles.FindAsync(id); // Wyszukuje rolę o podanym ID
            if (existing == null) return false; // Jeśli rola nie istnieje, zwraca false

            // Aktualizuje dane roli
            existing.Name = dto.Name; // Aktualizuje nazwę roli
            existing.Description = dto.Description; // Aktualizuje opis roli
            
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
            return true; // Zwraca true - aktualizacja się powiodła
        }

        /// <summary>
        /// Metoda usuwania roli z systemu
        /// Usuwa rolę o podanym ID z bazy danych
        /// </summary>
        /// <param name="id">ID roli do usunięcia</param>
        /// <returns>True jeśli usunięcie się powiodło, false w przeciwnym przypadku</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy rola ma przypisanych użytkowników</exception>
        public async Task<bool> DeleteAsync(int id) // Metoda asynchroniczna zwracająca status operacji
        {
            // Wyszukuje rolę po ID w bazie danych
            var role = await _context.Roles.FindAsync(id); // Wyszukuje rolę o podanym ID
            if (role == null) return false; // Jeśli rola nie istnieje, zwraca false

            _context.Roles.Remove(role); // Usuwa rolę z kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych (fizyczne usunięcie roli)
            return true; // Zwraca true - usunięcie się powiodło
        }

        /// <summary>
        /// Metoda pobierania wszystkich ról wraz z liczbą przypisanych użytkowników
        /// Zwraca listę ról z informacją o tym, ile użytkowników ma przypisaną każdą rolę
        /// </summary>
        /// <returns>Lista ról z liczbą przypisanych użytkowników</returns>
        public async Task<List<RoleWithUserCountDto>> GetAllWithUserCountAsync() // Metoda asynchroniczna zwracająca listę ról z liczbą użytkowników
        {
            // Wykonuje zapytanie do bazy danych - pobiera role z liczbą użytkowników
            return await _context.Roles
                .Select(r => new RoleWithUserCountDto // Projektuje wyniki do DTO z liczbą użytkowników
                {
                    Id = r.Id, // ID roli
                    Name = r.Name, // Nazwa roli
                    Description = r.Description, // Opis roli
                    UsersCount = r.Users.Count() // Liczba użytkowników przypisanych do roli
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników
        }

        /// <summary>
        /// Metoda pobierania wszystkich użytkowników przypisanych do określonej roli
        /// Zwraca listę użytkowników którzy mają przypisaną rolę o podanym ID
        /// </summary>
        /// <param name="roleId">ID roli dla której pobierani są użytkownicy</param>
        /// <returns>Lista użytkowników z danymi roli</returns>
        public async Task<List<UserWithRoleDto>> GetUsersInRoleAsync(int roleId) // Metoda asynchroniczna zwracająca listę użytkowników w roli
        {
            // Wykonuje zapytanie do bazy danych - pobiera użytkowników z określonej roli
            return await _context.Users
                .Where(u => u.RoleId == roleId) // Filtruje użytkowników według ID roli
                .Select(u => new UserWithRoleDto // Projektuje wyniki do DTO użytkownika z rolą
                {
                    Id = u.Id, // ID użytkownika
                    Username = u.Username, // Nazwa użytkownika
                    Email = u.Email, // Adres email użytkownika
                    Role = u.Role.Name // Nazwa roli użytkownika
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników
        }
    }
}
