using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM
using Microsoft.AspNetCore.Authorization; // Importuje funkcjonalności autoryzacji
using Microsoft.AspNetCore.Mvc; // Importuje podstawowe klasy kontrolerów MVC
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using System.Security.Claims; // Importuje klasy do obsługi claims (oświadczeń) użytkownika

namespace CRM.API.Controllers // Przestrzeń nazw dla kontrolerów API
{
    // ### DTOs (Data Transfer Objects) ###

    /// <summary>
    /// Data Transfer Object (DTO) dla listy notatek
    /// Zawiera podstawowe informacje o notatce potrzebne do wyświetlenia w tabeli
    /// </summary>
    public class NoteListItemDto
    {
        public int Id { get; set; } // Unikalny identyfikator notatki
        public string Content { get; set; } = null!; // Treść notatki (może być skrócona do 100 znaków)
        public string CustomerName { get; set; } = null!; // Nazwa klienta powiązanego z notatką
        public DateTime CreatedAt { get; set; } // Data i godzina utworzenia notatki
    }

    /// <summary>
    /// Data Transfer Object (DTO) dla tworzenia nowej notatki
    /// Zawiera dane potrzebne do utworzenia nowej notatki
    /// </summary>
    public class CreateNoteDto
    {
        public string Content { get; set; } = null!; // Treść notatki
        public int? CustomerId { get; set; } // ID klienta (opcjonalne - może być null)
    }

    /// <summary>
    /// Kontroler do zarządzania notatkami w systemie CRM
    /// Klasa obsługuje tworzenie, przeglądanie, edycję i usuwanie notatek użytkowników
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Notes)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class NotesController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konstruktor klasy NotesController
        /// Inicjalizuje kontroler z kontekstem bazy danych przekazanym przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        public NotesController(ApplicationDbContext context) 
        { 
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera ID aktualnego użytkownika z tokenu JWT
        /// Wyciąga informację o ID użytkownika z claims (oświadczeń) w tokenie autoryzacyjnym
        /// </summary>
        /// <returns>ID użytkownika jako liczba całkowita</returns>
        /// <exception cref="InvalidOperationException">Rzucany gdy nie można znaleźć ID użytkownika w tokenie</exception>
        private int GetCurrentUserId()
        {
            // Pobiera wartość claim o typie NameIdentifier z tokenu JWT - zawiera ID użytkownika
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // Sprawdza czy claim istnieje i czy można go przekonwertować na liczbę całkowitą
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                // Jeśli nie można pobrać ID użytkownika, rzuca wyjątek
                throw new InvalidOperationException("User ID not found in token.");
            }
            
            return userId; // Zwraca ID użytkownika jako liczbę całkowitą
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera listę wszystkich notatek zalogowanego użytkownika
        /// Endpoint: GET /api/Notes
        /// Zwraca listę notatek użytkownika posortowaną od najnowszych, z podstawowymi informacjami
        /// </summary>
        /// <returns>Lista notatek użytkownika z informacjami o klientach</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<ActionResult<IEnumerable<NoteListItemDto>>> GetNotes() // Metoda asynchroniczna zwracająca listę notatek
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wyświetla informację debugową w konsoli (tylko podczas rozwoju)
            Console.WriteLine($"DEBUG: Current user ID = {userId}");
            
            // Wykonuje zapytanie do bazy danych - pobiera notatki użytkownika
            var notes = await _context.Notes
                .Where(n => n.UserId == userId) // Filtruje tylko notatki należące do aktualnego użytkownika
                .Include(n => n.Customer) // Dołącza dane klienta powiązanego z notatką (relacja nawigacyjna)
                .OrderByDescending(n => n.CreatedAt) // Sortuje od najnowszych notatek (najpierw najnowsze)
                .Select(n => new NoteListItemDto // Projektuje dane do DTO - zwraca tylko potrzebne pola
                {
                    Id = n.Id, // ID notatki
                    Content = n.Content.Length > 100 ? n.Content.Substring(0, 100) + "..." : n.Content, // Skraca treść do 100 znaków z "..." jeśli jest dłuższa
                    CreatedAt = n.CreatedAt, // Data utworzenia notatki
                    CustomerName = n.Customer != null ? n.Customer.Name : "Brak klienta" // Nazwa klienta z obsługą null
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników
            
            return Ok(notes); // Zwraca status HTTP 200 OK z listą notatek użytkownika
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera szczegóły pojedynczej notatki
        /// Endpoint: GET /api/Notes/{id}
        /// Zwraca pełne szczegóły notatki (tylko jeśli należy do zalogowanego użytkownika)
        /// </summary>
        /// <param name="id">ID notatki do pobrania</param>
        /// <returns>Szczegóły notatki lub NotFound jeśli notatka nie istnieje lub nie należy do użytkownika</returns>
        [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
        public async Task<ActionResult<Note>> GetNote(int id) // Metoda asynchroniczna zwracająca szczegóły notatki
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wyświetla informację debugową w konsoli (tylko podczas rozwoju)
            Console.WriteLine($"DEBUG: Getting note {id} for user {userId}");
            
            // Wykonuje zapytanie do bazy danych - pobiera notatkę o podanym ID
            var note = await _context.Notes
                .Include(n => n.Customer) // Dołącza dane klienta powiązanego z notatką (relacja nawigacyjna)
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId); // Pobiera notatkę tylko jeśli należy do aktualnego użytkownika

            // Sprawdza czy notatka została znaleziona
            if (note == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli notatka nie istnieje lub nie należy do użytkownika
            }

            return Ok(note); // Zwraca status HTTP 200 OK ze szczegółami notatki
        }

        /// <summary>
        /// Metoda HTTP POST - tworzy nową notatkę w systemie
        /// Endpoint: POST /api/Notes
        /// Tworzy nową notatkę przypisaną do zalogowanego użytkownika
        /// </summary>
        /// <param name="createNoteDto">Dane nowej notatki (treść i opcjonalnie ID klienta)</param>
        /// <returns>Nowo utworzona notatka z statusem HTTP 201 Created lub błąd walidacji</returns>
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        public async Task<ActionResult<Note>> PostNote(CreateNoteDto createNoteDto) // Metoda asynchroniczna zwracająca nową notatkę
        {
            // Pobiera ID zalogowanego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Walidacja - sprawdza czy klient istnieje jeśli CustomerId jest podane
            if (createNoteDto.CustomerId.HasValue) // Sprawdza czy CustomerId ma wartość (nie jest null)
            {
                // Sprawdza czy klient o podanym ID istnieje w bazie danych
                var customerExists = await _context.Customers.AnyAsync(c => c.Id == createNoteDto.CustomerId.Value);
                if (!customerExists)
                {
                    return BadRequest("Podany klient nie istnieje."); // Zwraca status HTTP 400 Bad Request z komunikatem błędu
                }
            }
            
            // Tworzy nowy obiekt notatki z danymi z DTO
            var note = new Note
            {
                Content = createNoteDto.Content, // Ustawia treść notatki z DTO
                CreatedAt = DateTime.UtcNow, // Ustawia aktualny czas UTC jako datę utworzenia
                UserId = userId, // KLUCZOWA POPRAWKA: Przypisuje ID użytkownika (właściciela notatki)
                CustomerId = createNoteDto.CustomerId // Ustawia ID klienta (może być null)
            };

            // Dodaje notatkę do kontekstu Entity Framework
            _context.Notes.Add(note);
            // Zapisuje notatkę w bazie danych
            await _context.SaveChangesAsync();
            
            // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu (notatki)
            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
        }

        /// <summary>
        /// Metoda HTTP PUT - aktualizuje istniejącą notatkę
        /// Endpoint: PUT /api/Notes/{id}
        /// Aktualizuje treść i powiązanie z klientem notatki (tylko jeśli należy do zalogowanego użytkownika)
        /// </summary>
        /// <param name="id">ID notatki do aktualizacji</param>
        /// <param name="updateNoteDto">Nowe dane notatki</param>
        /// <returns>Status HTTP 204 No Content po pomyślnej aktualizacji lub błąd</returns>
        [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
        public async Task<IActionResult> PutNote(int id, UpdateNoteDto updateNoteDto) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Sprawdza czy ID w URL pasuje do ID w ciele żądania (walidacja spójności)
            if (id != updateNoteDto.Id)
            {
                return BadRequest("ID w URL nie pasuje do ID w ciele żądania."); // Zwraca status HTTP 400 Bad Request z komunikatem błędu
            }

            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wyświetla informację debugową w konsoli (tylko podczas rozwoju)
            Console.WriteLine($"DEBUG: Updating note {id} for user {userId}");
            
            // Wykonuje zapytanie do bazy danych - pobiera notatkę o podanym ID
            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId); // Pobiera notatkę tylko jeśli należy do aktualnego użytkownika

            // Sprawdza czy notatka została znaleziona
            if (note == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli notatka nie istnieje lub nie należy do użytkownika
            }

            // Walidacja - sprawdza czy klient istnieje jeśli CustomerId jest podane
            if (updateNoteDto.CustomerId.HasValue) // Sprawdza czy CustomerId ma wartość (nie jest null)
            {
                // Sprawdza czy klient o podanym ID istnieje w bazie danych
                var customerExists = await _context.Customers.AnyAsync(c => c.Id == updateNoteDto.CustomerId.Value);
                if (!customerExists)
                {
                    return BadRequest("Podany klient nie istnieje."); // Zwraca status HTTP 400 Bad Request z komunikatem błędu
                }
            }

            // Aktualizuje tylko dozwolone pola notatki
            note.Content = updateNoteDto.Content; // Aktualizuje treść notatki
            note.CustomerId = updateNoteDto.CustomerId; // Aktualizuje ID klienta (może być null)

            try
            {
                // Zapisuje zmiany w bazie danych
                await _context.SaveChangesAsync();
                return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnej aktualizacji
            }
            catch (DbUpdateConcurrencyException) // Obsługa wyjątku współbieżności
            {
                // Sprawdza czy notatka nadal istnieje w bazie danych
                if (!await NoteExists(id, userId))
                {
                    return NotFound(); // Zwraca status HTTP 404 Not Found
                }
                else
                {
                    throw; // Rzuca wyjątek dalej jeśli to inny problem współbieżności
                }
            }
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa notatkę z systemu
        /// Endpoint: DELETE /api/Notes/{id}
        /// Usuwa notatkę z bazy danych (tylko jeśli należy do zalogowanego użytkownika)
        /// </summary>
        /// <param name="id">ID notatki do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli notatka nie istnieje</returns>
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        public async Task<IActionResult> DeleteNote(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wyświetla informację debugową w konsoli (tylko podczas rozwoju)
            Console.WriteLine($"DEBUG: Deleting note {id} for user {userId}");
            
            // Wykonuje zapytanie do bazy danych - pobiera notatkę o podanym ID
            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId); // Pobiera notatkę tylko jeśli należy do aktualnego użytkownika

            // Sprawdza czy notatka została znaleziona
            if (note == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli notatka nie istnieje lub nie należy do użytkownika
            }

            // Usuwa notatkę z kontekstu Entity Framework
            _context.Notes.Remove(note);
            // Zapisuje zmiany w bazie danych (fizyczne usunięcie notatki)
            await _context.SaveChangesAsync();
            
            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
        }

        /// <summary>
        /// Metoda pomocnicza - sprawdza czy notatka o podanym ID istnieje w bazie danych i należy do użytkownika
        /// </summary>
        /// <param name="id">ID notatki do sprawdzenia</param>
        /// <param name="userId">ID użytkownika do sprawdzenia</param>
        /// <returns>True jeśli notatka istnieje i należy do użytkownika, false w przeciwnym przypadku</returns>
        private async Task<bool> NoteExists(int id, int userId)
        {
            // Sprawdza czy istnieje notatka o podanym ID należąca do użytkownika
            return await _context.Notes.AnyAsync(n => n.Id == id && n.UserId == userId);
        }
    }
}