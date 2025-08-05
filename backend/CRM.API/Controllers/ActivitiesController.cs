// Plik: backend/CRM.API/Controllers/ActivitiesController.cs
using CRM.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.API.Controllers
{
    /// <summary>
    /// Kontroler do zarządzania aktywnościami użytkowników w systemie CRM
    /// Klasa obsługuje wyświetlanie historii aktywności użytkowników w systemie
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Activities)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class ActivitiesController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych
        /// </summary>
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Konstruktor klasy ActivitiesController
        /// Inicjalizuje kontroler z kontekstem bazy danych
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez dependency injection</param>
        public ActivitiesController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera ostatnie aktywności użytkowników w systemie
        /// Endpoint: GET /api/activities
        /// </summary>
        /// <returns>Lista ostatnich 50 aktywności z informacjami o użytkownikach i klientach</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<IActionResult> GetActivities() // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera ostatnie aktywności z bazy danych wraz z powiązanymi danymi
            var activities = await _context.Activities
                .Include(a => a.User) // Dołącza dane użytkownika, który wykonał aktywność
                .Include(a => a.Customer) // Dołącza dane klienta, którego dotyczy aktywność
                .OrderByDescending(a => a.CreatedAt) // Sortuje od najnowszych aktywności
                .Take(50) // Ogranicza wynik do ostatnich 50 aktywności dla wydajności
                .Select(a => new // Projektuje dane do anonimowego obiektu - zwraca tylko potrzebne pola
                {
                    a.Id, // ID aktywności
                    a.Note, // Notatka opisująca aktywność
                    a.CreatedAt, // Data i czas utworzenia aktywności
                    UserName = a.User != null ? a.User.Username : "Nieznany użytkownik", // Nazwa użytkownika (z obsługą null)
                    CustomerName = a.Customer != null ? a.Customer.Name : "Nieznany klient" // Nazwa klienta (z obsługą null)
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę

            return Ok(activities); // Zwraca status HTTP 200 OK z listą aktywności
        }
    }
}