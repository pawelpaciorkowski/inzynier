// Import przestrzeni nazw dla kontekstu bazy danych CRM
using CRM.Data;
// Import modeli danych CRM
using CRM.Data.Models;
// Import funkcjonalności autoryzacji ASP.NET Core
using Microsoft.AspNetCore.Authorization;
// Import podstawowych klas kontrolerów MVC
using Microsoft.AspNetCore.Mvc;
// Import Entity Framework Core
using Microsoft.EntityFrameworkCore;
// Import do obsługi claims (oświadczeń) użytkownika z tokenów JWT
using System.Security.Claims;

namespace CRM.API.Controllers.User
{
    /// <summary>
    /// Kontroler użytkownika do zarządzania zadaniami w systemie CRM
    /// Klasa obsługuje operacje CRUD dla zadań użytkowników z kontrolą dostępu opartą na rolach
    /// Użytkownicy mogą zarządzać zadaniami przypisanymi do nich lub ich grup
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/user/[controller]")] // Definiuje ścieżkę routingu - api/user/tasks
    [Authorize(Roles = "User,Admin,Sprzedawca")] // Wymaga autoryzacji - dostęp dla User, Admin i Sprzedawca

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
        public TasksController(ApplicationDbContext context)
        {
            // Przypisuje przekazany kontekst do pola prywatnego
            _context = context;
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera ID aktualnego użytkownika z tokenu JWT
        /// </summary>
        /// <returns>ID użytkownika lub 0 jeśli nie można pobrać ID z tokenu</returns>
        private int GetUserId()
        {
            // Pobiera claim z ID użytkownika z tokenu JWT (NameIdentifier)
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // Próbuje sparsować string na int, zwraca ID użytkownika lub 0 jeśli parsowanie się nie powiodło
            return int.TryParse(id, out var userId) ? userId : 0;
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera listę zadań z kontrolą dostępu opartą na rolach
        /// Endpoint: GET /api/user/tasks
        /// Dostęp: User, Admin, Sprzedawca
        /// </summary>
        /// <returns>Lista zadań dostosowana do roli użytkownika</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks() // Metoda asynchroniczna zwracająca listę zadań
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            int userId = GetUserId();
            
            // Sprawdza czy użytkownik jest administratorem
            // Pobiera użytkownika wraz z jego rolą z bazy danych
            var user = await _context.Users
                .Include(u => u.Role) // Dołącza dane roli użytkownika
                .FirstOrDefaultAsync(u => u.Id == userId); // Pobiera użytkownika o podanym ID
            
            // Sprawdza czy rola użytkownika to "admin" (case-insensitive)
            var isAdmin = user?.Role?.Name?.ToLower() == "admin";
            
            // Deklaracja query do pobierania zadań
            IQueryable<TaskItem> tasksQuery;
            
            if (isAdmin)
            {
                // ADMINISTRATOR - widzi wszystkie zadania w systemie
                tasksQuery = _context.Tasks;
            }
            else
            {
                // ZWYKŁY UŻYTKOWNIK/SPRZEDAWCA - widzi tylko zadania ze swoich grup
                // Pobiera ID grup, do których należy użytkownik
                var userGroups = await _context.UserGroups
                    .Where(ug => ug.UserId == userId) // Filtruje członkostwa użytkownika w grupach
                    .Select(ug => ug.GroupId) // Wybiera tylko ID grup
                    .ToListAsync(); // Konwertuje na listę

                // Filtruje zadania przypisane do grup użytkownika
                tasksQuery = _context.Tasks
                    .Where(t => t.AssignedGroupId.HasValue && userGroups.Contains(t.AssignedGroupId.Value));
            }
            
            // Wykonuje query i pobiera zadania z bazy danych
            var tasks = await tasksQuery.ToListAsync();
            // Zwraca status HTTP 200 OK z listą zadań
            return Ok(tasks);
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera konkretne zadanie o określonym ID
        /// Endpoint: GET /api/user/tasks/{id}
        /// Dostęp: User, Admin, Sprzedawca (tylko własne zadania)
        /// </summary>
        /// <param name="id">ID zadania do pobrania</param>
        /// <returns>Zadanie o podanym ID lub NotFound jeśli zadanie nie istnieje lub nie należy do użytkownika</returns>
        [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
        public async Task<ActionResult<TaskItem>> GetTask(int id) // Metoda asynchroniczna zwracająca zadanie
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            int userId = GetUserId();
            // Pobiera zadanie tylko jeśli należy do aktualnego użytkownika (bezpieczeństwo)
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            // Sprawdza czy zadanie zostało znalezione
            if (task == null)
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli zadanie nie istnieje

            // Zwraca status HTTP 200 OK z danymi zadania
            return Ok(task);
        }

        /// <summary>
        /// Metoda HTTP POST - tworzy nowe zadanie dla użytkownika
        /// Endpoint: POST /api/user/tasks
        /// Dostęp: User, Admin, Sprzedawca
        /// </summary>
        /// <param name="dto">Dane nowego zadania (Data Transfer Object)</param>
        /// <returns>Nowo utworzone zadanie z statusem HTTP 201 Created lub Unauthorized</returns>
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        public async Task<ActionResult<TaskItem>> CreateTask([FromBody] CreateTaskDto dto) // Metoda asynchroniczna zwracająca utworzone zadanie
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetUserId();
            // Sprawdza czy udało się pobrać prawidłowe ID użytkownika
            if (userId == 0)
            {
                // Zwraca status HTTP 401 Unauthorized jeśli ID użytkownika jest nieprawidłowe
                return Unauthorized();
            }

            // Tworzy nową instancję zadania na podstawie danych z DTO
            var newTask = new TaskItem
            {
                Title = dto.Title, // Tytuł zadania z DTO
                Description = dto.Description, // Opis zadania z DTO
                DueDate = dto.DueDate, // Termin wykonania z DTO
                Completed = false, // Nowe zadanie jest zawsze nieukończone
                UserId = userId, // Przypisanie zadania do aktualnego użytkownika
                CustomerId = dto.CustomerId // ID klienta związanego z zadaniem (opcjonalne)
            };

            // Dodaje nowe zadanie do kontekstu Entity Framework
            _context.Tasks.Add(newTask);
            // Zapisuje zmiany w bazie danych
            await _context.SaveChangesAsync();

            // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu i danymi zadania
            return CreatedAtAction(nameof(GetTask), new { id = newTask.Id }, newTask);
        }

        /// <summary>
        /// Metoda HTTP PUT - aktualizuje istniejące zadanie użytkownika
        /// Endpoint: PUT /api/user/tasks/{id}
        /// Dostęp: User, Admin, Sprzedawca (tylko własne zadania)
        /// </summary>
        /// <param name="id">ID zadania do aktualizacji</param>
        /// <param name="dto">Nowe dane zadania (Data Transfer Object)</param>
        /// <returns>Status HTTP 204 No Content po pomyślnej aktualizacji lub NotFound</returns>
        [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera ID aktualnego użytkownika z tokenu JWT
            var userId = GetUserId();
            // Pobiera zadanie tylko jeśli należy do aktualnego użytkownika (bezpieczeństwo)
            var existingTask = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            // Sprawdza czy zadanie zostało znalezione
            if (existingTask == null)
            {
                // Zwraca status HTTP 404 Not Found jeśli zadanie nie istnieje lub nie należy do użytkownika
                return NotFound();
            }

            // Aktualizuje właściwości zadania danymi z DTO
            existingTask.Title = dto.Title; // Nowy tytuł zadania
            existingTask.Description = dto.Description; // Nowy opis zadania
            existingTask.DueDate = dto.DueDate; // Nowy termin wykonania
            existingTask.Completed = dto.Completed; // Nowy status ukończenia

            // Zapisuje zmiany w bazie danych
            await _context.SaveChangesAsync();
            // Zwraca status HTTP 204 No Content po pomyślnej aktualizacji
            return NoContent();
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa zadanie użytkownika
        /// Endpoint: DELETE /api/user/tasks/{id}
        /// Dostęp: User, Admin, Sprzedawca (tylko własne zadania)
        /// </summary>
        /// <param name="id">ID zadania do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound</returns>
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        public async Task<IActionResult> DeleteTask(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera zadanie tylko jeśli należy do aktualnego użytkownika (bezpieczeństwo)
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == GetUserId());

            // Sprawdza czy zadanie zostało znalezione
            if (task == null)
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli zadanie nie istnieje

            // Usuwa zadanie z kontekstu Entity Framework
            _context.Tasks.Remove(task);
            // Zapisuje zmiany w bazie danych (fizyczne usunięcie)
            await _context.SaveChangesAsync();

            // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
            return NoContent();
        }
    }
}
