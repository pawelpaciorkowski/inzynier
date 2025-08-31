using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM
using Microsoft.AspNetCore.Authorization; // Importuje funkcjonalności autoryzacji
using Microsoft.AspNetCore.Mvc; // Importuje podstawowe klasy kontrolerów MVC
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using System.Security.Claims; // Importuje klasy do obsługi claims (oświadczeń) użytkownika
using System.Threading.Tasks; // Importuje klasy do programowania asynchronicznego

namespace CRM.API.Controllers // Przestrzeń nazw dla kontrolerów API
{
    /// <summary>
    /// Kontroler do zarządzania wiadomościami w systemie CRM
    /// Klasa obsługuje wysyłanie, odbieranie, przeglądanie i usuwanie wiadomości między użytkownikami
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Messages)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class MessagesController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konstruktor klasy MessagesController
        /// Inicjalizuje kontroler z kontekstem bazy danych przekazanym przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        public MessagesController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
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
        /// Metoda HTTP GET - pobiera wiadomości odebrane dla zalogowanego użytkownika
        /// Endpoint: GET /api/Messages/inbox
        /// Zwraca listę wiadomości, które użytkownik otrzymał, posortowane od najnowszych
        /// </summary>
        /// <returns>Lista wiadomości odebranych z informacjami o nadawcy</returns>
        [HttpGet("inbox")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce /inbox
        public async Task<IActionResult> GetInboxMessages() // Metoda asynchroniczna zwracająca akcję HTTP
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wykonuje zapytanie do bazy danych - pobiera wiadomości odebrane przez użytkownika
            var messages = await _context.Messages
                .Where(m => m.RecipientUserId == userId) // Filtruje tylko wiadomości gdzie odbiorcą jest aktualny użytkownik
                .OrderByDescending(m => m.SentAt) // Sortuje od najnowszych wiadomości (najpierw najnowsze)
                .Select(m => new // Projektuje dane do anonimowego obiektu - zwraca tylko potrzebne pola
                {
                    m.Id, // ID wiadomości
                    m.Subject, // Temat wiadomości
                    m.Body, // Treść wiadomości
                    m.SentAt, // Data i godzina wysłania
                    m.IsRead, // Czy wiadomość została przeczytana
                    SenderUsername = m.SenderUser.Username // Nazwa użytkownika nadawcy (z relacji nawigacyjnej)
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników
            
            return Ok(messages); // Zwraca status HTTP 200 OK z listą wiadomości odebranych
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wiadomości wysłane przez zalogowanego użytkownika
        /// Endpoint: GET /api/Messages/sent
        /// Zwraca listę wiadomości, które użytkownik wysłał, posortowane od najnowszych
        /// </summary>
        /// <returns>Lista wiadomości wysłanych z informacjami o odbiorcy</returns>
        [HttpGet("sent")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce /sent
        public async Task<IActionResult> GetSentMessages() // Metoda asynchroniczna zwracająca akcję HTTP
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wykonuje zapytanie do bazy danych - pobiera wiadomości wysłane przez użytkownika
            var messages = await _context.Messages
                .Where(m => m.SenderUserId == userId) // Filtruje tylko wiadomości gdzie nadawcą jest aktualny użytkownik
                .OrderByDescending(m => m.SentAt) // Sortuje od najnowszych wiadomości (najpierw najnowsze)
                .Select(m => new // Projektuje dane do anonimowego obiektu - zwraca tylko potrzebne pola
                {
                    m.Id, // ID wiadomości
                    m.Subject, // Temat wiadomości
                    m.Body, // Treść wiadomości
                    m.SentAt, // Data i godzina wysłania
                    m.IsRead, // Czy wiadomość została przeczytana
                    RecipientUsername = m.RecipientUser.Username // Nazwa użytkownika odbiorcy (z relacji nawigacyjnej)
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników
            
            return Ok(messages); // Zwraca status HTTP 200 OK z listą wiadomości wysłanych
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera szczegóły pojedynczej wiadomości
        /// Endpoint: GET /api/Messages/{id}
        /// Zwraca pełne szczegóły wiadomości i automatycznie oznacza ją jako przeczytaną (jeśli użytkownik jest odbiorcą)
        /// </summary>
        /// <param name="id">ID wiadomości do pobrania</param>
        /// <returns>Szczegóły wiadomości lub NotFound jeśli wiadomość nie istnieje lub użytkownik nie ma do niej dostępu</returns>
        [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
        public async Task<IActionResult> GetMessage(int id) // Metoda asynchroniczna zwracająca akcję HTTP
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wykonuje zapytanie do bazy danych - pobiera wiadomość o podanym ID
            var message = await _context.Messages
                .Include(m => m.SenderUser) // Dołącza dane nadawcy wiadomości (relacja nawigacyjna)
                .Include(m => m.RecipientUser) // Dołącza dane odbiorcy wiadomości (relacja nawigacyjna)
                .FirstOrDefaultAsync(m => m.Id == id && (m.RecipientUserId == userId || m.SenderUserId == userId)); // Pobiera wiadomość tylko jeśli użytkownik jest nadawcą lub odbiorcą

            // Sprawdza czy wiadomość została znaleziona
            if (message == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli wiadomość nie istnieje lub użytkownik nie ma dostępu
            }

            // Oznacza wiadomość jako przeczytaną, jeśli użytkownik jest odbiorcą i wiadomość nie została jeszcze przeczytana
            if (message.RecipientUserId == userId && !message.IsRead)
            {
                message.IsRead = true; // Ustawia flagę IsRead na true
                await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
            }

            // Zwraca szczegóły wiadomości w formie anonimowego obiektu
            return Ok(new
            {
                message.Id, // ID wiadomości
                message.Subject, // Temat wiadomości
                message.Body, // Treść wiadomości
                message.SentAt, // Data i godzina wysłania
                message.IsRead, // Czy wiadomość została przeczytana
                SenderUsername = message.SenderUser.Username, // Nazwa użytkownika nadawcy
                RecipientUsername = message.RecipientUser.Username // Nazwa użytkownika odbiorcy
            });
        }

        /// <summary>
        /// Metoda HTTP POST - wysyła nową wiadomość do innego użytkownika
        /// Endpoint: POST /api/Messages
        /// Tworzy nową wiadomość i automatycznie tworzy powiadomienie dla odbiorcy
        /// </summary>
        /// <param name="messageDto">Dane nowej wiadomości (odbiorca, temat, treść)</param>
        /// <returns>Nowo utworzona wiadomość z statusem HTTP 201 Created lub błąd walidacji</returns>
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        public async Task<IActionResult> SendMessage([FromBody] CreateMessageDto messageDto) // Metoda asynchroniczna zwracająca akcję HTTP
        {
            // Pobiera ID aktualnego użytkownika (nadawcy) z tokenu JWT
            var senderUserId = GetCurrentUserId();

            // Sprawdza czy odbiorca wiadomości istnieje w bazie danych
            var recipientUser = await _context.Users.FindAsync(messageDto.RecipientUserId);
            if (recipientUser == null)
            {
                return BadRequest(new { message = "Odbiorca nie istnieje." }); // Zwraca status HTTP 400 Bad Request z komunikatem błędu
            }

            // Sprawdza czy nadawca (aktualny użytkownik) istnieje w bazie danych
            var senderUser = await _context.Users.FindAsync(senderUserId);
            if (senderUser == null)
            {
                return BadRequest(new { message = "Nadawca nie istnieje." }); // Zwraca status HTTP 400 Bad Request z komunikatem błędu
            }

            // Tworzy nowy obiekt wiadomości z danymi z DTO
            var message = new Message
            {
                SenderUserId = senderUserId, // ID nadawcy (aktualny użytkownik)
                RecipientUserId = messageDto.RecipientUserId, // ID odbiorcy z DTO
                Subject = messageDto.Subject, // Temat wiadomości z DTO
                Body = messageDto.Body, // Treść wiadomości z DTO
                SentAt = DateTime.UtcNow, // Aktualny czas UTC jako data wysłania
                IsRead = false // Wiadomość nie została jeszcze przeczytana
            };

            // Dodaje wiadomość do kontekstu Entity Framework
            _context.Messages.Add(message);
            // Zapisuje wiadomość w bazie danych
            await _context.SaveChangesAsync();

            // Tworzy powiadomienie dla odbiorcy o nowej wiadomości
            var notification = new Notification
            {
                UserId = message.RecipientUserId, // ID odbiorcy wiadomości
                Message = $"Nowa wiadomość od {senderUser.Username}: {message.Subject}", // Tekst powiadomienia z nazwą nadawcy i tematem
                MessageId = message.Id, // ID wiadomości (powiązanie z wiadomością)
                CreatedAt = DateTime.UtcNow, // Aktualny czas UTC jako data utworzenia powiadomienia
                IsRead = false // Powiadomienie nie zostało jeszcze przeczytane
            };
            
            // Dodaje powiadomienie do kontekstu Entity Framework
            _context.Notifications.Add(notification);
            // Zapisuje powiadomienie w bazie danych
            await _context.SaveChangesAsync();

            // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu (wiadomości)
            return CreatedAtAction(nameof(GetMessage), new { id = message.Id }, message);
        }

        /// <summary>
        /// Metoda HTTP PUT - oznacza wiadomość jako przeczytaną
        /// Endpoint: PUT /api/Messages/{id}/read
        /// Zmienia status wiadomości z nieprzeczytanej na przeczytaną (tylko dla odbiorcy wiadomości)
        /// </summary>
        /// <param name="id">ID wiadomości do oznaczenia jako przeczytana</param>
        /// <returns>Status HTTP 204 No Content po pomyślnej operacji lub NotFound jeśli wiadomość nie istnieje</returns>
        [HttpPut("{id}/read")] // Oznacza metodę jako obsługującą żądania HTTP PUT na ścieżce /read
        public async Task<IActionResult> MarkAsRead(int id) // Metoda asynchroniczna zwracająca akcję HTTP
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wykonuje zapytanie do bazy danych - pobiera wiadomość o podanym ID
            var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == id && m.RecipientUserId == userId);

            // Sprawdza czy wiadomość została znaleziona (tylko odbiorca może oznaczyć wiadomość jako przeczytaną)
            if (message == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli wiadomość nie istnieje lub użytkownik nie jest odbiorcą
            }

            // Oznacza wiadomość jako przeczytaną
            message.IsRead = true; // Ustawia flagę IsRead na true
            // Zapisuje zmiany w bazie danych
            await _context.SaveChangesAsync();

            // Zwraca status HTTP 204 No Content (operacja zakończona pomyślnie, ale nie ma treści do zwrócenia)
            return NoContent();
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa wiadomość z systemu
        /// Endpoint: DELETE /api/Messages/{id}
        /// Usuwa wiadomość z bazy danych (tylko nadawca lub odbiorca może usunąć wiadomość)
        /// </summary>
        /// <param name="id">ID wiadomości do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli wiadomość nie istnieje</returns>
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        public async Task<IActionResult> DeleteMessage(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetCurrentUserId();
            
            // Wykonuje zapytanie do bazy danych - pobiera wiadomość o podanym ID
            var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == id && (m.RecipientUserId == userId || m.SenderUserId == userId));

            // Sprawdza czy wiadomość została znaleziona (tylko nadawca lub odbiorca może usunąć wiadomość)
            if (message == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli wiadomość nie istnieje lub użytkownik nie ma uprawnień
            }

            // Usuń powiązane powiadomienia
            var relatedNotifications = await _context.Notifications
                .Where(n => n.MessageId == id)
                .ToListAsync();
            
            _context.Notifications.RemoveRange(relatedNotifications);
            _context.Messages.Remove(message);
            // Zapisuje zmiany w bazie danych (fizyczne usunięcie wiadomości)
            await _context.SaveChangesAsync();

            // Zwraca status HTTP 204 No Content (operacja zakończona pomyślnie, ale nie ma treści do zwrócenia)
            return NoContent();
        }
    }
}
