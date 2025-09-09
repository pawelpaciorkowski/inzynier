using CRM.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers.Admin
{
    /// <summary>
    /// Kontroler administracyjny do zarządzania zadaniami w systemie CRM
    /// Klasa obsługuje operacje CRUD dla zadań z perspektywy administratora
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API
    [Route("api/admin/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Tasks)
    [Authorize(Roles = "Admin,Sprzedawca")] // Wymaga autoryzacji - dostęp tylko dla użytkowników z rolą Admin lub Sprzedawca
    public class TasksController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych
        /// </summary>
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Konstruktor klasy TasksController
        /// Inicjalizuje kontroler z kontekstem bazy danych
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez dependency injection</param>
        /// dependency injection - przekazywanie kontekstu bazy danych do kontrolera
        public TasksController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wszystkie zadania z systemu
        /// dependency injection - przekazywanie kontekstu bazy danych do kontrolera
        /// Endpoint: GET /api/admin/tasks
        /// </summary>
        /// <returns>Lista wszystkich zadań z informacjami o użytkownikach i klientach</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<IActionResult> GetAllTasks() // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera wszystkie zadania z bazy danych wraz z powiązanymi danymi
            var tasks = await _context.Tasks
                .Include(t => t.User) // Dołącza dane użytkownika przypisanego do zadania
                .Include(t => t.Customer) // Dołącza dane klienta przypisanego do zadania
                .Select(t => new // Projektuje dane do anonimowego obiektu - zwraca tylko potrzebne pola
                {
                    t.Id, // ID zadania
                    t.Title, // Tytuł zadania
                    t.Description, // Opis zadania
                    t.DueDate, // Termin wykonania zadania
                    Completed = t.Completed, // Status ukończenia zadania
                    User = new { t.User.Username }, // Nazwa użytkownika przypisanego do zadania
                    Customer = t.Customer != null ? new { t.Customer.Name } : null // Nazwa klienta (jeśli istnieje)
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę

            return Ok(tasks); // Zwraca status HTTP 200 OK z listą zadań
        }
    }
}