using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM
using Microsoft.AspNetCore.Authorization; // Importuje funkcjonalności autoryzacji
using Microsoft.AspNetCore.Mvc; // Importuje podstawowe klasy kontrolerów MVC
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core

namespace CRM.API.Controllers // Przestrzeń nazw dla kontrolerów API
{
    /// <summary>
    /// Kontroler do zarządzania szablonami dokumentów w systemie CRM
    /// Klasa obsługuje operacje CRUD na szablonach - przesyłanie, pobieranie, usuwanie szablonów dokumentów
    /// Szablony służą do generowania standardowych dokumentów (faktury, umowy, oferty)
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Templates)
    [Authorize(Roles = "Admin,Sprzedawca")] // Wymaga autoryzacji z rolą Admin lub Sprzedawca - dostęp tylko dla uprawnionych użytkowników
    public class TemplatesController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// dependency injection - przekazywanie kontekstu bazy danych do kontrolera
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Środowisko hostingu webowego
        /// Dostarcza informacje o środowisku uruchomieniowym aplikacji (ścieżki, zmienne środowiskowe)
        /// </summary>
        private readonly IWebHostEnvironment _env; // Interfejs środowiska hostingu webowego

        /// <summary>
        /// Konstruktor klasy TemplatesController
        /// Inicjalizuje kontroler z kontekstem bazy danych i środowiskiem hostingu przekazanymi przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        /// <param name="env">Środowisko hostingu webowego przekazane przez system dependency injection</param>
        public TemplatesController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
            _env = env; // Przypisuje przekazane środowisko hostingu do pola prywatnego
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera listę wszystkich szablonów dokumentów
        /// Endpoint: GET /api/Templates
        /// Zwraca listę szablonów posortowaną alfabetycznie według nazwy
        /// </summary>
        /// <returns>Lista wszystkich szablonów dokumentów w systemie</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<ActionResult<IEnumerable<Template>>> GetTemplates() // Metoda asynchroniczna zwracająca listę szablonów
        {
            // Wykonuje zapytanie do bazy danych - pobiera szablony posortowane alfabetycznie
            return await _context.Templates.OrderBy(t => t.Name).ToListAsync(); // Zwraca listę szablonów posortowaną według nazwy
        }

        /// <summary>
        /// Metoda HTTP POST - przesyła nowy szablon dokumentu na serwer
        /// Endpoint: POST /api/Templates/upload
        /// Obsługuje przesyłanie pliku szablonu wraz z nazwą szablonu
        /// </summary>
        /// <param name="file">Plik szablonu do przesłania (IFormFile)</param>
        /// <param name="templateName">Nazwa szablonu (z formularza)</param>
        /// <returns>Szczegóły przesłanego szablonu lub błąd jeśli plik nie został wybrany</returns>
        [HttpPost("upload")] // Oznacza metodę jako obsługującą żądania HTTP POST na ścieżce upload
        public async Task<IActionResult> UploadTemplate(IFormFile file, [FromForm] string templateName) // Metoda asynchroniczna przyjmująca plik i nazwę szablonu
        {
            // Sprawdza czy plik został wybrany i czy ma niezerowy rozmiar
            if (file == null || file.Length == 0) // Walidacja czy plik istnieje i nie jest pusty
                return BadRequest("Nie wybrano pliku."); // Zwraca błąd 400 Bad Request z komunikatem

            // Tworzy ścieżkę do folderu Templates w katalogu głównym aplikacji
            var uploadsFolderPath = Path.Combine(_env.ContentRootPath, "Templates"); // Łączy ścieżkę główną aplikacji z nazwą folderu Templates
            if (!Directory.Exists(uploadsFolderPath)) // Sprawdza czy folder Templates istnieje
            {
                Directory.CreateDirectory(uploadsFolderPath); // Tworzy folder Templates jeśli nie istnieje
            }

            // Generuje unikalną nazwę pliku na podstawie GUID i oryginalnego rozszerzenia
            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName); // Tworzy unikalną nazwę pliku
            var filePath = Path.Combine(uploadsFolderPath, uniqueFileName); // Łączy ścieżkę folderu z nazwą pliku

            // Zapisuje przesłany plik na dysku serwera
            await using (var stream = new FileStream(filePath, FileMode.Create)) // Tworzy strumień pliku w trybie tworzenia
            {
                await file.CopyToAsync(stream); // Kopiuje zawartość przesłanego pliku do strumienia
            }

            // Tworzy nowy obiekt szablonu z danymi przesłanego pliku
            var template = new Template // Tworzy nowy obiekt Template
            {
                Name = templateName, // Ustawia nazwę szablonu z formularza
                FileName = file.FileName, // Ustawia oryginalną nazwę pliku
                FilePath = filePath, // Ustawia ścieżkę do zapisanego pliku na serwerze
                UploadedAt = DateTime.UtcNow // Ustawia datę i czas przesłania (UTC)
            };

            _context.Templates.Add(template); // Dodaje nowy szablon do kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje szablon w bazie danych

            return Ok(template); // Zwraca status HTTP 200 OK ze szczegółami przesłanego szablonu
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa szablon dokumentu z systemu
        /// Endpoint: DELETE /api/Templates/{id}
        /// Usuwa szablon z bazy danych oraz fizyczny plik z dysku serwera
        /// </summary>
        /// <param name="id">ID szablonu do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli szablon nie istnieje</returns>
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        public async Task<IActionResult> DeleteTemplate(int id) // Metoda asynchroniczna przyjmująca ID szablonu do usunięcia
        {
            var template = await _context.Templates.FindAsync(id); // Wyszukuje szablon po ID w bazie danych
            if (template == null) return NotFound(); // Zwraca NotFound jeśli szablon nie został znaleziony

            // Sprawdza czy plik fizyczny istnieje na dysku i usuwa go
            if (System.IO.File.Exists(template.FilePath)) // Sprawdza czy plik istnieje w systemie plików
            {
                System.IO.File.Delete(template.FilePath); // Usuwa plik fizyczny z dysku serwera
            }

            _context.Templates.Remove(template); // Usuwa szablon z kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych (fizyczne usunięcie szablonu)

            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera szablon dokumentu do pobrania
        /// Endpoint: GET /api/Templates/{id}/download
        /// Zwraca plik szablonu do pobrania przez użytkownika
        /// </summary>
        /// <param name="id">ID szablonu do pobrania</param>
        /// <returns>Plik szablonu do pobrania lub NotFound jeśli szablon/plik nie istnieje</returns>
        [HttpGet("{id}/download")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce {id}/download
        public async Task<IActionResult> DownloadTemplate(int id) // Metoda asynchroniczna przyjmująca ID szablonu do pobrania
        {
            var template = await _context.Templates.FindAsync(id); // Wyszukuje szablon po ID w bazie danych
            if (template == null) return NotFound("Szablon nie znaleziony."); // Zwraca NotFound z komunikatem jeśli szablon nie istnieje

            var filePath = template.FilePath; // Pobiera ścieżkę do pliku szablonu
            if (!System.IO.File.Exists(filePath)) // Sprawdza czy plik fizyczny istnieje na dysku
            {
                return NotFound("Plik szablonu nie znaleziony na serwerze."); // Zwraca NotFound z komunikatem jeśli plik nie istnieje
            }

            // Wczytuje zawartość pliku do tablicy bajtów
            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath); // Asynchronicznie wczytuje cały plik do pamięci
            
            // Zwraca plik do pobrania z odpowiednim typem MIME i oryginalną nazwą
            return File(fileBytes, "application/octet-stream", template.FileName); // Zwraca plik do pobrania
        }
    }
}