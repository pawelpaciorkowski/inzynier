using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM
using Microsoft.AspNetCore.Authorization; // Importuje funkcjonalności autoryzacji
using Microsoft.AspNetCore.Mvc; // Importuje podstawowe klasy kontrolerów MVC
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using System.Security.Claims; // Importuje klasy do obsługi claims (oświadczeń) użytkownika

namespace CRM.API.Controllers // Przestrzeń nazw dla kontrolerów API
{
    /// <summary>
    /// Kontroler do zarządzania powiadomieniami w systemie CRM
    /// Klasa obsługuje pobieranie, oznaczanie jako przeczytane i liczenie nieprzeczytanych powiadomień użytkowników
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Notifications)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class NotificationsController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konstruktor klasy NotificationsController
        /// Inicjalizuje kontroler z kontekstem bazy danych przekazanym przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        public NotificationsController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera ID aktualnego użytkownika z tokenu JWT
        /// Wyciąga informację o ID użytkownika z claims (oświadczeń) w tokenie autoryzacyjnym
        /// </summary>
        /// <returns>ID użytkownika jako liczba całkowita</returns>
        /// <exception cref="UnauthorizedAccessException">Rzucany gdy nie można znaleźć lub zwalidować ID użytkownika w tokenie</exception>
        private int GetUserId()
        {
            // Pobiera claim o typie NameIdentifier z tokenu JWT - zawiera ID użytkownika
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            
            // Sprawdza czy claim istnieje i czy można go przekonwertować na liczbę całkowitą
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                // Jeśli nie można pobrać lub zwalidować ID użytkownika, rzuca wyjątek
                throw new UnauthorizedAccessException("User ID not found or invalid.");
            }
            
            return userId; // Zwraca ID użytkownika jako liczbę całkowitą
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wszystkie powiadomienia zalogowanego użytkownika
        /// Endpoint: GET /api/Notifications/user
        /// Zwraca listę powiadomień użytkownika posortowaną od najnowszych
        /// </summary>
        /// <returns>Lista powiadomień użytkownika lub błąd autoryzacji</returns>
        [HttpGet("user")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce /user
        public async Task<ActionResult<IEnumerable<object>>> GetUserNotifications() // Metoda asynchroniczna zwracająca listę powiadomień
        {
            try // Blok try-catch do obsługi wyjątków autoryzacji
            {
                // Pobiera ID aktualnego użytkownika z tokenu JWT
                var userId = GetUserId();
                
                // Wykonuje zapytanie do bazy danych - pobiera powiadomienia użytkownika
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId) // Filtruje tylko powiadomienia należące do aktualnego użytkownika
                    .OrderByDescending(n => n.CreatedAt) // Sortuje od najnowszych powiadomień (najpierw najnowsze)
                    .Select(n => new { // Projektuje dane do anonimowego obiektu - zwraca tylko potrzebne pola
                        n.Id, // ID powiadomienia
                        n.Message, // Treść powiadomienia
                        n.CreatedAt, // Data i godzina utworzenia powiadomienia
                        n.IsRead, // Czy powiadomienie zostało przeczytane
                        n.MessageId // ID powiązanej wiadomości (jeśli istnieje)
                    })
                    .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników
                
                return Ok(notifications); // Zwraca status HTTP 200 OK z listą powiadomień użytkownika
            }
            catch (UnauthorizedAccessException ex) // Obsługa wyjątku autoryzacji
            {
                return Unauthorized(ex.Message); // Zwraca status HTTP 401 Unauthorized z komunikatem błędu
            }
        }

        /// <summary>
        /// Metoda HTTP POST - oznacza powiadomienie jako przeczytane
        /// Endpoint: POST /api/Notifications/mark-as-read/{id}
        /// Zmienia status powiadomienia z nieprzeczytanego na przeczytane (tylko dla właściciela powiadomienia)
        /// </summary>
        /// <param name="id">ID powiadomienia do oznaczenia jako przeczytane</param>
        /// <returns>Status HTTP 204 No Content po pomyślnej operacji lub błąd</returns>
        [HttpPost("mark-as-read/{id}")] // Oznacza metodę jako obsługującą żądania HTTP POST na ścieżce /mark-as-read/{id}
        public async Task<IActionResult> MarkAsRead(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            try // Blok try-catch do obsługi wyjątków autoryzacji
            {
                // Pobiera ID aktualnego użytkownika z tokenu JWT
                var userId = GetUserId();
                
                // Wykonuje zapytanie do bazy danych - pobiera powiadomienie o podanym ID
                var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

                // Sprawdza czy powiadomienie zostało znalezione (tylko właściciel może oznaczyć powiadomienie jako przeczytane)
                if (notification == null)
                {
                    return NotFound("Powiadomienie nie znalezione lub nie masz do niego dostępu."); // Zwraca status HTTP 404 Not Found z komunikatem błędu
                }

                // Oznacza powiadomienie jako przeczytane
                notification.IsRead = true; // Ustawia flagę IsRead na true
                // Zapisuje zmiany w bazie danych
                await _context.SaveChangesAsync();

                return NoContent(); // Zwraca status HTTP 204 No Content (operacja zakończona pomyślnie, ale nie ma treści do zwrócenia)
            }
            catch (UnauthorizedAccessException ex) // Obsługa wyjątku autoryzacji
            {
                return Unauthorized(ex.Message); // Zwraca status HTTP 401 Unauthorized z komunikatem błędu
            }
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera liczbę nieprzeczytanych powiadomień zalogowanego użytkownika
        /// Endpoint: GET /api/Notifications/unread-count
        /// Zwraca liczbę powiadomień, które użytkownik jeszcze nie przeczytał
        /// </summary>
        /// <returns>Liczba nieprzeczytanych powiadomień lub błąd autoryzacji</returns>
        [HttpGet("unread-count")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce /unread-count
        public async Task<ActionResult<int>> GetUnreadNotificationsCount() // Metoda asynchroniczna zwracająca liczbę nieprzeczytanych powiadomień
        {
            try // Blok try-catch do obsługi wyjątków autoryzacji
            {
                // Pobiera ID aktualnego użytkownika z tokenu JWT
                var userId = GetUserId();
                
                // Wykonuje zapytanie do bazy danych - zlicza nieprzeczytane powiadomienia użytkownika
                var count = await _context.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead) // Filtruje tylko nieprzeczytane powiadomienia należące do aktualnego użytkownika
                    .CountAsync(); // Zlicza liczbę powiadomień spełniających warunki
                
                return Ok(count); // Zwraca status HTTP 200 OK z liczbą nieprzeczytanych powiadomień
            }
            catch (UnauthorizedAccessException ex) // Obsługa wyjątku autoryzacji
            {
                return Unauthorized(ex.Message); // Zwraca status HTTP 401 Unauthorized z komunikatem błędu
            }
        }
    }
}
