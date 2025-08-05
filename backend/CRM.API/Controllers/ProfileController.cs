using CRM.BusinessLogic.Services.Admin; // Importuje serwisy administracyjne (IUserService)
using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM
using Microsoft.AspNetCore.Authorization; // Importuje funkcjonalności autoryzacji
using Microsoft.AspNetCore.Mvc; // Importuje podstawowe klasy kontrolerów MVC
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using System.Security.Claims; // Importuje klasy do obsługi claims (oświadczeń) użytkownika

namespace CRM.API.Controllers // Przestrzeń nazw dla kontrolerów API
{
    /// <summary>
    /// Data Transfer Object (DTO) dla profilu użytkownika
    /// Zawiera podstawowe informacje o użytkowniku potrzebne do wyświetlenia w profilu
    /// </summary>
    public class UserProfileDto
    {
        public int Id { get; set; } // Unikalny identyfikator użytkownika
        public string Username { get; set; } = default!; // Nazwa użytkownika
        public string Email { get; set; } = default!; // Adres email użytkownika
        public string RoleName { get; set; } = default!; // Nazwa roli użytkownika w systemie
    }

    /// <summary>
    /// Kontroler do zarządzania profilem użytkownika w systemie CRM
    /// Klasa obsługuje pobieranie profilu użytkownika, zmianę hasła i historię logowań
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Profile)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class ProfileController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Serwis do zarządzania użytkownikami
        /// Używany do operacji na użytkownikach (np. zmiana hasła)
        /// </summary>
        private readonly IUserService _userService; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konstruktor klasy ProfileController
        /// Inicjalizuje kontroler z serwisem użytkowników i kontekstem bazy danych przekazanymi przez dependency injection
        /// </summary>
        /// <param name="userService">Serwis użytkowników przekazany przez system dependency injection</param>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        public ProfileController(IUserService userService, ApplicationDbContext context)
        {
            _userService = userService; // Przypisuje przekazany serwis do pola prywatnego - inicjalizacja pola
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera profil zalogowanego użytkownika
        /// Endpoint: GET /api/Profile
        /// Zwraca podstawowe informacje o użytkowniku (ID, nazwa użytkownika, email, rola)
        /// </summary>
        /// <returns>Profil użytkownika lub błąd autoryzacji/NotFound</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<ActionResult<UserProfileDto>> GetUserProfile() // Metoda asynchroniczna zwracająca profil użytkownika
        {
            // Pobiera wartość claim o typie NameIdentifier z tokenu JWT - zawiera ID użytkownika
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // Sprawdza czy claim istnieje i czy można go przekonwertować na liczbę całkowitą
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized(); // Zwraca status HTTP 401 Unauthorized jeśli nie można pobrać ID użytkownika
            }

            // Wykonuje zapytanie do bazy danych - pobiera użytkownika o podanym ID
            var user = await _context.Users
                .Include(u => u.Role) // Dołącza dane roli użytkownika (relacja nawigacyjna)
                .FirstOrDefaultAsync(u => u.Id == userId); // Pobiera pierwszy element lub null

            // Sprawdza czy użytkownik został znaleziony
            if (user == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli użytkownik nie istnieje
            }

            // Tworzy DTO profilu użytkownika z danymi z bazy danych
            var userProfile = new UserProfileDto
            {
                Id = user.Id, // ID użytkownika
                Username = user.Username, // Nazwa użytkownika
                Email = user.Email, // Adres email użytkownika
                RoleName = user.Role?.Name ?? "Brak roli" // Nazwa roli z obsługą null
            };

            return Ok(userProfile); // Zwraca status HTTP 200 OK z profilem użytkownika
        }

        /// <summary>
        /// Metoda HTTP PUT - zmienia hasło zalogowanego użytkownika
        /// Endpoint: PUT /api/Profile/change-password
        /// Zmienia hasło użytkownika po weryfikacji bieżącego hasła
        /// </summary>
        /// <param name="dto">Dane do zmiany hasła (bieżące hasło i nowe hasło)</param>
        /// <returns>Status HTTP 200 OK po pomyślnej zmianie hasła lub błąd</returns>
        [HttpPut("change-password")] // Oznacza metodę jako obsługującą żądania HTTP PUT na ścieżce /change-password
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera wartość claim o typie NameIdentifier z tokenu JWT - zawiera ID użytkownika
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // Sprawdza czy claim istnieje i czy można go przekonwertować na liczbę całkowitą
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized(); // Zwraca status HTTP 401 Unauthorized jeśli nie można pobrać ID użytkownika
            }

            // Wywołuje serwis użytkowników do zmiany hasła - weryfikuje bieżące hasło i ustawia nowe
            var result = await _userService.ChangeUserPasswordAsync(userId, dto.CurrentPassword, dto.NewPassword);

            // Sprawdza czy operacja zmiany hasła zakończyła się sukcesem
            if (!result)
            {
                return BadRequest("Bieżące hasło jest nieprawidłowe lub wystąpił błąd."); // Zwraca status HTTP 400 Bad Request z komunikatem błędu
            }

            return Ok("Hasło zostało pomyślnie zmienione."); // Zwraca status HTTP 200 OK z komunikatem sukcesu
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera historię logowań zalogowanego użytkownika
        /// Endpoint: GET /api/Profile/login-history
        /// Zwraca ostatnie 20 logowań użytkownika z datą i adresem IP
        /// </summary>
        /// <returns>Historia logowań użytkownika lub błąd autoryzacji</returns>
        [HttpGet("login-history")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce /login-history
        public async Task<IActionResult> GetLoginHistory() // Metoda asynchroniczna zwracająca historię logowań
        {
            // Pobiera wartość claim o typie NameIdentifier z tokenu JWT - zawiera ID użytkownika
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // Sprawdza czy claim istnieje i czy można go przekonwertować na liczbę całkowitą
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized(); // Zwraca status HTTP 401 Unauthorized jeśli nie można pobrać ID użytkownika
            }

            // Wykonuje zapytanie do bazy danych - pobiera historię logowań użytkownika
            var history = await _context.LoginHistories
                .Where(h => h.UserId == userId) // Filtruje tylko logowania należące do aktualnego użytkownika
                .OrderByDescending(h => h.LoggedInAt) // Sortuje od najnowszych logowań (najpierw najnowsze)
                .Take(20) // Ogranicza wynik do 20 ostatnich wpisów - optymalizacja wydajności
                .Select(h => new // Projektuje dane do anonimowego obiektu - zwraca tylko potrzebne pola
                {
                    h.Id, // ID wpisu w historii logowań
                    h.LoggedInAt, // Data i godzina logowania
                    h.IpAddress // Adres IP z którego nastąpiło logowanie
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników

            return Ok(history); // Zwraca status HTTP 200 OK z historią logowań użytkownika
        }
    }
}