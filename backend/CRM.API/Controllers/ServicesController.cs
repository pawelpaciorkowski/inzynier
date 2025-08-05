using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using Microsoft.AspNetCore.Authorization; // Importuje funkcjonalności autoryzacji
using Microsoft.AspNetCore.Mvc; // Importuje podstawowe klasy kontrolerów MVC
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core

namespace CRM.API.Controllers // Przestrzeń nazw dla kontrolerów API
{
    /// <summary>
    /// Kontroler do zarządzania usługami w systemie CRM
    /// Klasa obsługuje operacje CRUD (Create, Read, Update, Delete) na usługach oferowanych przez firmę
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Services)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class ServicesController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konstruktor klasy ServicesController
        /// Inicjalizuje kontroler z kontekstem bazy danych przekazanym przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        public ServicesController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera listę wszystkich usług dostępnych w systemie
        /// Endpoint: GET /api/Services
        /// Zwraca kompletny katalog usług oferowanych przez firmę
        /// </summary>
        /// <returns>Lista wszystkich usług w systemie</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<IActionResult> GetServices() // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobieramy wszystkie serwisy bez dołączania nieistniejących relacji
            var services = await _context.Services.ToListAsync(); // Wykonuje zapytanie asynchroniczne do bazy danych - pobiera wszystkie usługi
            return Ok(services); // Zwraca status HTTP 200 OK z listą wszystkich usług
        }
    }
}