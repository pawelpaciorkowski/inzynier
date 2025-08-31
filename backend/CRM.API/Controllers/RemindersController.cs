using CRM.Data;
using CRM.Data.Models;
using CRM.BusinessLogic.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CRM.API.Controllers // Przestrzeń nazw dla kontrolerów API
{
    /// <summary>
    /// Kontroler do zarządzania przypomnieniami w systemie CRM
    /// Klasa obsługuje tworzenie, przeglądanie, edycję i usuwanie przypomnień użytkowników
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Reminders)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class RemindersController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public RemindersController(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera ID aktualnego użytkownika z tokenu JWT
        /// Wyciąga informację o ID użytkownika z claims (oświadczeń) w tokenie autoryzacyjnym
        /// </summary>
        /// <returns>ID użytkownika jako liczba całkowita</returns>
        /// <exception cref="System.InvalidOperationException">Rzucany gdy nie można znaleźć ID użytkownika w tokenie</exception>
        private int GetCurrentUserId()
        {
            // Pobiera claim o typie NameIdentifier z tokenu JWT - zawiera ID użytkownika
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            
            // Sprawdza czy claim istnieje i czy można go przekonwertować na liczbę całkowitą
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                // Jeśli nie można pobrać ID użytkownika, rzuca wyjątek
                throw new System.InvalidOperationException("User ID not found in token.");
            }
            
            return userId; // Zwraca ID użytkownika jako liczbę całkowitą
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera listę wszystkich przypomnień zalogowanego użytkownika
        /// Endpoint: GET /api/Reminders
        /// Zwraca listę przypomnień użytkownika posortowaną według daty przypomnienia (od najwcześniejszych)
        /// </summary>
        /// <returns>Lista przypomnień użytkownika</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<ActionResult<IEnumerable<Reminder>>> GetReminders() // Metoda asynchroniczna zwracająca listę przypomnień
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wykonuje zapytanie do bazy danych - pobiera przypomnienia użytkownika
            var reminders = await _context.Reminders
                .Where(r => r.UserId == userId) // Filtruje tylko przypomnienia należące do aktualnego użytkownika
                .OrderBy(r => r.RemindAt) // Sortuje według daty przypomnienia (od najwcześniejszych do najpóźniejszych)
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników
            
            return Ok(reminders); // Zwraca status HTTP 200 OK z listą przypomnień użytkownika
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera szczegóły pojedynczego przypomnienia
        /// Endpoint: GET /api/Reminders/{id}
        /// Zwraca szczegóły przypomnienia o podanym ID (tylko jeśli należy do zalogowanego użytkownika)
        /// </summary>
        /// <param name="id">ID przypomnienia do pobrania</param>
        /// <returns>Szczegóły przypomnienia lub NotFound jeśli przypomnienie nie istnieje lub nie należy do użytkownika</returns>
        [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
        public async Task<ActionResult<Reminder>> GetReminder(int id) // Metoda asynchroniczna zwracająca szczegóły przypomnienia
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wykonuje zapytanie do bazy danych - pobiera przypomnienie o podanym ID
            var reminder = await _context.Reminders.FindAsync(id);

            // Sprawdza czy przypomnienie zostało znalezione i czy należy do aktualnego użytkownika
            if (reminder == null || reminder.UserId != userId)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli przypomnienie nie istnieje lub nie należy do użytkownika
            }

            return Ok(reminder); // Zwraca status HTTP 200 OK ze szczegółami przypomnienia
        }

        /// <summary>
        /// Metoda HTTP POST - tworzy nowe przypomnienie w systemie
        /// Endpoint: POST /api/Reminders
        /// Tworzy nowe przypomnienie przypisane do zalogowanego użytkownika
        /// </summary>
        /// <param name="createReminderDto">Dane nowego przypomnienia (notatka i data przypomnienia)</param>
        /// <returns>Nowo utworzone przypomnienie z statusem HTTP 201 Created</returns>
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        public async Task<ActionResult<Reminder>> PostReminder(CreateReminderDto createReminderDto) // Metoda asynchroniczna zwracająca nowe przypomnienie
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Tworzy nowy obiekt przypomnienia z danymi z DTO
            var reminder = new Reminder
            {
                Note = createReminderDto.Note, // Ustawia notatkę przypomnienia z DTO
                RemindAt = createReminderDto.RemindAt, // Ustawia datę i godzinę przypomnienia z DTO
                UserId = userId // Przypisuje ID aktualnego użytkownika jako właściciela przypomnienia
            };

            // Dodaje przypomnienie do kontekstu Entity Framework
            _context.Reminders.Add(reminder);
            // Zapisuje przypomnienie w bazie danych
            await _context.SaveChangesAsync();

            // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu (przypomnienia)
            return CreatedAtAction("GetReminder", new { id = reminder.Id }, reminder);
        }

        /// <summary>
        /// Metoda HTTP PUT - aktualizuje istniejące przypomnienie
        /// Endpoint: PUT /api/Reminders/{id}
        /// Aktualizuje dane przypomnienia (tylko jeśli należy do zalogowanego użytkownika)
        /// </summary>
        /// <param name="id">ID przypomnienia do aktualizacji</param>
        /// <param name="updateReminderDto">Nowe dane przypomnienia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnej aktualizacji lub błąd</returns>
        [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
        public async Task<IActionResult> PutReminder(int id, UpdateReminderDto updateReminderDto) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Sprawdza czy ID w URL pasuje do ID w ciele żądania (walidacja spójności)
            if (id != updateReminderDto.Id)
            {
                return BadRequest(); // Zwraca status HTTP 400 Bad Request jeśli ID nie pasują
            }

            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wykonuje zapytanie do bazy danych - pobiera przypomnienie o podanym ID
            var reminder = await _context.Reminders.FindAsync(id);

            // Sprawdza czy przypomnienie zostało znalezione i czy należy do aktualnego użytkownika
            if (reminder == null || reminder.UserId != userId)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli przypomnienie nie istnieje lub nie należy do użytkownika
            }

            // Aktualizuje dane przypomnienia
            reminder.Note = updateReminderDto.Note; // Aktualizuje notatkę przypomnienia
            reminder.RemindAt = updateReminderDto.RemindAt; // Aktualizuje datę i godzinę przypomnienia

            // Oznacza przypomnienie jako zmodyfikowane w kontekście Entity Framework
            _context.Entry(reminder).State = EntityState.Modified;

            try
            {
                // Zapisuje zmiany w bazie danych
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) // Obsługa wyjątku współbieżności
            {
                // Sprawdza czy przypomnienie nadal istnieje w bazie danych
                if (!ReminderExists(id))
                {
                    return NotFound(); // Zwraca status HTTP 404 Not Found
                }
                else
                {
                    throw; // Rzuca wyjątek dalej jeśli to inny problem współbieżności
                }
            }

            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnej aktualizacji
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa przypomnienie z systemu
        /// Endpoint: DELETE /api/Reminders/{id}
        /// Usuwa przypomnienie z bazy danych (tylko jeśli należy do zalogowanego użytkownika)
        /// </summary>
        /// <param name="id">ID przypomnienia do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli przypomnienie nie istnieje</returns>
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        public async Task<IActionResult> DeleteReminder(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wykonuje zapytanie do bazy danych - pobiera przypomnienie o podanym ID
            var reminder = await _context.Reminders.FindAsync(id);
            
            // Sprawdza czy przypomnienie zostało znalezione i czy należy do aktualnego użytkownika
            if (reminder == null || reminder.UserId != userId)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli przypomnienie nie istnieje lub nie należy do użytkownika
            }

            // Usuwa przypomnienie z kontekstu Entity Framework
            _context.Reminders.Remove(reminder);
            // Zapisuje zmiany w bazie danych (fizyczne usunięcie przypomnienia)
            await _context.SaveChangesAsync();

            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
        }

        /// <summary>
        /// Metoda pomocnicza - sprawdza czy przypomnienie o podanym ID istnieje w bazie danych
        /// </summary>
        /// <param name="id">ID przypomnienia do sprawdzenia</param>
        /// <returns>True jeśli przypomnienie istnieje, false w przeciwnym przypadku</returns>
        private bool ReminderExists(int id)
        {
            // Sprawdza czy istnieje przypomnienie o podanym ID w bazie danych
            return _context.Reminders.Any(e => e.Id == id);
        }
    }
}