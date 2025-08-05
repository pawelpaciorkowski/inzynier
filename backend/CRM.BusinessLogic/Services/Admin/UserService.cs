using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM (User, Role, etc.)
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using CRM.BusinessLogic.Services; // Importuje serwisy biznesowe (ILogService)

namespace CRM.BusinessLogic.Services.Admin // Przestrzeń nazw dla serwisów administracyjnych w warstwie biznesowej
{
    /// <summary>
    /// Serwis zarządzania użytkownikami
    /// Klasa implementująca interfejs IUserService, obsługuje operacje CRUD na użytkownikach
    /// oraz zarządzanie hasłami i logowanie aktywności użytkowników
    /// </summary>
    public class UserService : IUserService // Klasa publiczna implementująca interfejs IUserService
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Serwis logowania aktywności użytkowników
        /// Używany do zapisywania logów o operacjach wykonywanych na użytkownikach
        /// </summary>
        private readonly ILogService _logService; // Pole tylko do odczytu - serwis logowania

        /// <summary>
        /// Konstruktor klasy UserService
        /// Inicjalizuje serwis z kontekstem bazy danych i serwisem logowania przekazanymi przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        /// <param name="logService">Serwis logowania przekazany przez system dependency injection</param>
        public UserService(ApplicationDbContext context, ILogService logService)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
            _logService = logService; // Przypisuje przekazany serwis logowania do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda tworzenia nowego użytkownika w systemie
        /// Tworzy nowego użytkownika z podanymi danymi i zapisuje go w bazie danych
        /// </summary>
        /// <param name="dto">Dane nowego użytkownika (nazwa użytkownika, email, hasło, rola)</param>
        /// <returns>Nowo utworzony użytkownik</returns>
        /// <exception cref="Exception">Rzucany gdy rola o podanym ID nie istnieje</exception>
        public async Task<User> CreateAsync(CreateUserDto dto) // Metoda asynchroniczna zwracająca nowego użytkownika
        {
            // Sprawdza czy rola o podanym ID istnieje w bazie danych
            var role = await _context.Roles.FindAsync(dto.RoleId); // Wyszukuje rolę po ID
            if (role == null) // Jeśli rola nie istnieje
                throw new Exception("Rola nie istnieje!"); // Rzuca wyjątek z komunikatem

            // Hashuje hasło użytkownika używając BCrypt
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password); // Tworzy bezpieczny hash hasła

            // Tworzy nowy obiekt użytkownika z podanymi danymi
            var user = new User // Tworzy nowy obiekt User
            {
                Username = dto.Username, // Ustawia nazwę użytkownika z DTO
                Email = dto.Email, // Ustawia adres email z DTO
                PasswordHash = passwordHash, // Ustawia zahashowane hasło
                RoleId = dto.RoleId, // Ustawia ID roli z DTO
                Role = role // Ustawia obiekt roli (relacja nawigacyjna)
            };

            _context.Users.Add(user); // Dodaje nowego użytkownika do kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje użytkownika w bazie danych
            
            // Loguje utworzenie użytkownika
            await _logService.LogAsync("Information", $"Użytkownik {user.Username} (ID: {user.Id}) został utworzony przez administratora.", "UserService", user.Id); // Zapisuje log o utworzeniu użytkownika
            
            return user; // Zwraca nowo utworzonego użytkownika
        }

        /// <summary>
        /// Metoda pobierania wszystkich użytkowników z systemu
        /// Zwraca listę wszystkich zarejestrowanych użytkowników wraz z ich rolami
        /// </summary>
        /// <returns>Lista wszystkich użytkowników z danymi ról</returns>
        public async Task<List<User>> GetAllAsync() // Metoda asynchroniczna zwracająca listę wszystkich użytkowników
        {
            // Wykonuje zapytanie do bazy danych - pobiera wszystkich użytkowników z rolami
            return await _context.Users.Include(u => u.Role).ToListAsync(); // Zwraca listę użytkowników z dołączonymi danymi ról
        }

        /// <summary>
        /// Metoda pobierania wszystkich użytkowników wraz z ich rolami
        /// Zwraca listę użytkowników z dołączonymi danymi ich ról
        /// </summary>
        /// <returns>Lista użytkowników z danymi ról</returns>
        public async Task<List<User>> GetAllWithRolesAsync() // Metoda asynchroniczna zwracająca listę użytkowników z rolami
        {
            // Wykonuje zapytanie do bazy danych - pobiera użytkowników z rolami
            return await _context.Users
                .Include(u => u.Role) // Dołącza dane roli dla każdego użytkownika
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników
        }

        /// <summary>
        /// Metoda pobierania użytkownika po ID
        /// Wyszukuje użytkownika w systemie na podstawie jego unikalnego identyfikatora
        /// </summary>
        /// <param name="id">ID użytkownika do wyszukania</param>
        /// <returns>Obiekt użytkownika z danymi roli lub null jeśli użytkownik nie został znaleziony</returns>
        public async Task<User?> GetByIdAsync(int id) // Metoda asynchroniczna zwracająca użytkownika lub null
        {
            // Wyszukuje użytkownika po ID w bazie danych wraz z danymi roli
            return await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id); // Zwraca użytkownika o podanym ID z rolą lub null
        }

        /// <summary>
        /// Metoda tworzenia nowego użytkownika (przeciążenie)
        /// Tworzy nowego użytkownika z gotowym obiektem User
        /// </summary>
        /// <param name="user">Gotowy obiekt użytkownika do zapisania</param>
        /// <returns>Nowo utworzony użytkownik</returns>
        public async Task<User> CreateAsync(User user) // Metoda asynchroniczna zwracająca nowego użytkownika (przeciążenie)
        {
            _context.Users.Add(user); // Dodaje gotowego użytkownika do kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje użytkownika w bazie danych
            return user; // Zwraca nowo utworzonego użytkownika
        }

        /// <summary>
        /// Metoda aktualizacji istniejącego użytkownika
        /// Aktualizuje dane użytkownika o podanym ID z nowymi informacjami
        /// </summary>
        /// <param name="id">ID użytkownika do aktualizacji</param>
        /// <param name="dto">Nowe dane użytkownika</param>
        /// <returns>True jeśli aktualizacja się powiodła, false w przeciwnym przypadku</returns>
        public async Task<bool> UpdateAsync(int id, UpdateUserDto dto) // Metoda asynchroniczna zwracająca status operacji
        {
            // Wyszukuje użytkownika po ID w bazie danych
            var user = await _context.Users.FindAsync(id); // Wyszukuje użytkownika o podanym ID
            if (user == null) return false; // Jeśli użytkownik nie istnieje, zwraca false

            // Aktualizuje dane użytkownika
            user.Username = dto.Username; // Aktualizuje nazwę użytkownika
            user.Email = dto.Email; // Aktualizuje adres email
            user.RoleId = dto.RoleId; // Aktualizuje ID roli

            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
            return true; // Zwraca true - aktualizacja się powiodła
        }

        /// <summary>
        /// Metoda usuwania użytkownika z systemu
        /// Usuwa użytkownika o podanym ID z bazy danych
        /// </summary>
        /// <param name="id">ID użytkownika do usunięcia</param>
        /// <returns>True jeśli usunięcie się powiodło, false w przeciwnym przypadku</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy użytkownik ma przypisane aktywne dane (klienci, faktury, etc.)</exception>
        public async Task<bool> DeleteAsync(int id) // Metoda asynchroniczna zwracająca status operacji
        {
            // Wyszukuje użytkownika po ID w bazie danych
            var user = await _context.Users.FindAsync(id); // Wyszukuje użytkownika o podanym ID
            if (user == null) return false; // Jeśli użytkownik nie istnieje, zwraca false

            _context.Users.Remove(user); // Usuwa użytkownika z kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych (fizyczne usunięcie użytkownika)
            return true; // Zwraca true - usunięcie się powiodło
        }

        /// <summary>
        /// Metoda zmiany hasła użytkownika
        /// Zmienia hasło użytkownika po weryfikacji aktualnego hasła
        /// </summary>
        /// <param name="userId">ID użytkownika którego hasło ma zostać zmienione</param>
        /// <param name="currentPassword">Aktualne hasło użytkownika do weryfikacji</param>
        /// <param name="newPassword">Nowe hasło użytkownika</param>
        /// <returns>True jeśli zmiana hasła się powiodła, false w przeciwnym przypadku</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy aktualne hasło jest niepoprawne</exception>
        public async Task<bool> ChangeUserPasswordAsync(int userId, string currentPassword, string newPassword) // Metoda asynchroniczna zwracająca status operacji
        {
            // Wyszukuje użytkownika po ID w bazie danych
            var user = await _context.Users.FindAsync(userId); // Wyszukuje użytkownika o podanym ID
            if (user == null) // Jeśli użytkownik nie istnieje
            {
                return false; // Zwraca false - użytkownik nie istnieje
            }

            // Weryfikuje aktualne hasło użytkownika
            if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash)) // Sprawdza czy aktualne hasło jest poprawne
            {
                return false; // Zwraca false - aktualne hasło jest niepoprawne
            }

            // Hashuje nowe hasło użytkownika
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword); // Tworzy hash nowego hasła i przypisuje do użytkownika
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            // Loguje zmianę hasła
            await _logService.LogAsync("Information", $"Użytkownik {user.Username} ({user.Id}) zmienił hasło.", "UserService", user.Id); // Zapisuje log o zmianie hasła

            return true; // Zwraca true - zmiana hasła się powiodła
        }
    }
}
