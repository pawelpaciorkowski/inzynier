using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.API.Controllers
{
    /// <summary>
    /// Data Transfer Object (DTO) dla wydarzeń kalendarza
    /// Używany do zwracania danych o wydarzeniach kalendarza
    /// </summary>
    public class CalendarEventDto
    {
        public int Id { get; set; } // Unikalny identyfikator wydarzenia
        public string Title { get; set; } = null!; // Tytuł wydarzenia
        public DateTime Start { get; set; } // Data i czas rozpoczęcia wydarzenia
        public DateTime End { get; set; } // Data i czas zakończenia wydarzenia
    }

    /// <summary>
    /// Data Transfer Object (DTO) dla tworzenia nowego wydarzenia kalendarza
    /// Używany do odbierania danych podczas tworzenia wydarzenia
    /// </summary>
    public class CreateCalendarEventDto
    {
        public string Title { get; set; } = null!; // Tytuł wydarzenia
        public DateTime Start { get; set; } // Data i czas rozpoczęcia wydarzenia
        public DateTime End { get; set; } // Data i czas zakończenia wydarzenia
    }

    /// <summary>
    /// Data Transfer Object (DTO) dla aktualizacji wydarzenia kalendarza
    /// Używany do odbierania danych podczas aktualizacji wydarzenia
    /// </summary>
    public class UpdateCalendarEventDto
    {
        public string Title { get; set; } = null!; // Tytuł wydarzenia
        public DateTime Start { get; set; } // Data i czas rozpoczęcia wydarzenia
        public DateTime End { get; set; } // Data i czas zakończenia wydarzenia
    }

    /// <summary>
    /// Kontroler do zarządzania wydarzeniami kalendarza w systemie CRM
    /// Klasa obsługuje operacje CRUD dla wydarzeń kalendarza
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (CalendarEvents)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class CalendarEventsController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych
        /// </summary>
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Konstruktor klasy CalendarEventsController
        /// Inicjalizuje kontroler z kontekstem bazy danych
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez dependency injection</param>
        public CalendarEventsController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wszystkie wydarzenia kalendarza
        /// Endpoint: GET /api/CalendarEvents
        /// </summary>
        /// <returns>Lista wszystkich wydarzeń kalendarza w formacie DTO</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<ActionResult<IEnumerable<CalendarEventDto>>> GetCalendarEvents() // Metoda asynchroniczna zwracająca listę wydarzeń
        {
            // Pobiera wszystkie wydarzenia z bazy danych i mapuje je na DTO
            var events = await _context.CalendarEvents
                .Select(e => new CalendarEventDto // Projektuje dane do DTO
                {
                    Id = e.Id, // ID wydarzenia
                    Title = e.Title, // Tytuł wydarzenia
                    Start = e.Start, // Data rozpoczęcia
                    End = e.End // Data zakończenia
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę
            return Ok(events); // Zwraca status HTTP 200 OK z listą wydarzeń
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wydarzenie kalendarza o określonym ID
        /// Endpoint: GET /api/CalendarEvents/{id}
        /// </summary>
        /// <param name="id">ID wydarzenia do pobrania</param>
        /// <returns>Wydarzenie o podanym ID lub NotFound jeśli wydarzenie nie istnieje</returns>
        [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
        public async Task<ActionResult<CalendarEventDto>> GetCalendarEvent(int id) // Metoda asynchroniczna zwracająca wydarzenie
        {
            // Pobiera wydarzenie o podanym ID i mapuje je na DTO
            var calendarEvent = await _context.CalendarEvents
                .Where(e => e.Id == id) // Filtruje po ID
                .Select(e => new CalendarEventDto // Projektuje dane do DTO
                {
                    Id = e.Id, // ID wydarzenia
                    Title = e.Title, // Tytuł wydarzenia
                    Start = e.Start, // Data rozpoczęcia
                    End = e.End // Data zakończenia
                })
                .FirstOrDefaultAsync(); // Pobiera pierwszy element lub null

            if (calendarEvent == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli wydarzenie nie istnieje
            }

            return Ok(calendarEvent); // Zwraca status HTTP 200 OK z danymi wydarzenia
        }

        /// <summary>
        /// Metoda HTTP POST - tworzy nowe wydarzenie kalendarza
        /// Endpoint: POST /api/CalendarEvents
        /// </summary>
        /// <param name="createCalendarEventDto">Dane transferowe zawierające informacje o nowym wydarzeniu</param>
        /// <returns>Nowo utworzone wydarzenie z statusem HTTP 201 Created</returns>
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        public async Task<ActionResult<CalendarEventDto>> CreateCalendarEvent(CreateCalendarEventDto createCalendarEventDto) // Metoda asynchroniczna zwracająca utworzone wydarzenie
        {
            // Walidacja danych wejściowych
            if (createCalendarEventDto.Start > createCalendarEventDto.End)
            {
                return BadRequest("Data rozpoczęcia nie może być późniejsza niż data zakończenia."); // Zwraca błąd walidacji
            }
            if (createCalendarEventDto.Start < DateTime.UtcNow)
            {
                return BadRequest("Data rozpoczęcia nie może być z przeszłości."); // Zwraca błąd walidacji
            }

            // Tworzy nowy obiekt wydarzenia kalendarza
            var calendarEvent = new CalendarEvent
            {
                Title = createCalendarEventDto.Title, // Ustawia tytuł
                Start = createCalendarEventDto.Start, // Ustawia datę rozpoczęcia
                End = createCalendarEventDto.End // Ustawia datę zakończenia
            };

            _context.CalendarEvents.Add(calendarEvent); // Dodaje wydarzenie do kontekstu
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            // Tworzy DTO z utworzonym wydarzeniem
            var calendarEventDto = new CalendarEventDto
            {
                Id = calendarEvent.Id, // ID wydarzenia
                Title = calendarEvent.Title, // Tytuł wydarzenia
                Start = calendarEvent.Start, // Data rozpoczęcia
                End = calendarEvent.End // Data zakończenia
            };

            return CreatedAtAction(nameof(GetCalendarEvent), new { id = calendarEvent.Id }, calendarEventDto); // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu
        }

        /// <summary>
        /// Metoda HTTP PUT - aktualizuje istniejące wydarzenie kalendarza
        /// Endpoint: PUT /api/CalendarEvents/{id}
        /// </summary>
        /// <param name="id">ID wydarzenia do aktualizacji</param>
        /// <param name="updateCalendarEventDto">Dane transferowe zawierające nowe informacje o wydarzeniu</param>
        /// <returns>Status HTTP 204 No Content po pomyślnej aktualizacji lub NotFound jeśli wydarzenie nie istnieje</returns>
        [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
        public async Task<IActionResult> UpdateCalendarEvent(int id, UpdateCalendarEventDto updateCalendarEventDto) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Walidacja danych wejściowych
            if (updateCalendarEventDto.Start > updateCalendarEventDto.End)
            {
                return BadRequest("Data rozpoczęcia nie może być późniejsza niż data zakończenia."); // Zwraca błąd walidacji
            }
            if (updateCalendarEventDto.Start < DateTime.UtcNow)
            {
                return BadRequest("Data rozpoczęcia nie może być z przeszłości."); // Zwraca błąd walidacji
            }

            // Pobiera wydarzenie o podanym ID z bazy danych
            var calendarEvent = await _context.CalendarEvents.FindAsync(id);

            if (calendarEvent == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli wydarzenie nie istnieje
            }

            // Aktualizuje dane wydarzenia
            calendarEvent.Title = updateCalendarEventDto.Title; // Aktualizuje tytuł
            calendarEvent.Start = updateCalendarEventDto.Start; // Aktualizuje datę rozpoczęcia
            calendarEvent.End = updateCalendarEventDto.End; // Aktualizuje datę zakończenia

            try
            {
                await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
            }
            catch (DbUpdateConcurrencyException) // Obsługa wyjątku współbieżności
            {
                if (!CalendarEventExists(id)) // Sprawdza czy wydarzenie nadal istnieje
                {
                    return NotFound(); // Zwraca status HTTP 404 Not Found
                }
                else
                {
                    throw; // Rzuca wyjątek dalej
                }
            }

            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnej aktualizacji
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa wydarzenie kalendarza z systemu
        /// Endpoint: DELETE /api/CalendarEvents/{id}
        /// </summary>
        /// <param name="id">ID wydarzenia do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli wydarzenie nie istnieje</returns>
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        public async Task<IActionResult> DeleteCalendarEvent(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera wydarzenie o podanym ID z bazy danych
            var calendarEvent = await _context.CalendarEvents.FindAsync(id);
            if (calendarEvent == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli wydarzenie nie istnieje
            }

            _context.CalendarEvents.Remove(calendarEvent); // Usuwa wydarzenie z kontekstu
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
        }

        /// <summary>
        /// Metoda pomocnicza - sprawdza czy wydarzenie o podanym ID istnieje w bazie danych
        /// </summary>
        /// <param name="id">ID wydarzenia do sprawdzenia</param>
        /// <returns>True jeśli wydarzenie istnieje, false w przeciwnym przypadku</returns>
        private bool CalendarEventExists(int id)
        {
            return _context.CalendarEvents.Any(e => e.Id == id); // Sprawdza czy istnieje wydarzenie o podanym ID
        }
    }
}
