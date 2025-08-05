using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

namespace CRM.API.Controllers.Admin
{
    /// <summary>
    /// Kontroler dashboardu administracyjnego w systemie CRM
    /// Klasa obsługuje wyświetlanie statystyk i podsumowań danych w zależności od roli użytkownika
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API
    [Route("api/admin/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Dashboard)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class DashboardController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych
        /// </summary>
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Konstruktor klasy DashboardController
        /// Inicjalizuje kontroler z kontekstem bazy danych
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez dependency injection</param>
        public DashboardController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera dane dashboardu w zależności od roli użytkownika
        /// Endpoint: GET /api/admin/dashboard
        /// </summary>
        /// <returns>Statystyki i podsumowania danych dostosowane do roli użytkownika</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<IActionResult> GetDashboard() // Metoda asynchroniczna zwracająca IActionResult
        {
            try
            {
                // Pobiera identyfikator użytkownika z tokenu JWT
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

                // Sprawdza czy identyfikator użytkownika istnieje i można go przekonwertować na int
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                    return Unauthorized("Brak identyfikatora użytkownika");

                // Pobiera dane użytkownika wraz z jego rolą z bazy danych
                var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                    return NotFound("Użytkownik nie istnieje");

                // Sprawdza rolę użytkownika i zwraca odpowiednie dane dashboardu
                if (string.Equals(user.Role?.Name, "admin", StringComparison.OrdinalIgnoreCase))
                {
                    // DASHBOARD DLA ADMINISTRATORA
                    // Pobiera podsumowanie zadań dla każdego użytkownika
                    var taskSummary = await _context.Users
                        .Select(u => new
                        {
                            Username = u.Username, // Nazwa użytkownika
                            Count = _context.Tasks.Count(t => t.UserId == u.Id) // Liczba zadań przypisanych do użytkownika
                        })
                        .ToListAsync();

                    // Tworzy obiekt z ogólnymi statystykami systemu
                    var result = new
                    {
                        contractsCount = await _context.Contracts.CountAsync(), // Liczba wszystkich kontraktów
                        invoicesCount = await _context.Invoices.CountAsync(), // Liczba wszystkich faktur
                        paymentsCount = await _context.Payments.CountAsync(), // Liczba wszystkich płatności
                        usersCount = await _context.Users.CountAsync(), // Liczba wszystkich użytkowników
                        systemLogsCount = await _context.SystemLogs.CountAsync(), // Liczba wszystkich logów systemowych
                        tasksCount = await _context.Tasks.CountAsync(), // Liczba wszystkich zadań
                        taskPerUser = taskSummary // Podsumowanie zadań na użytkownika
                    };

                    return Ok(result); // Zwraca status HTTP 200 OK z danymi dashboardu administratora
                }
                else if (string.Equals(user.Role?.Name, "sprzedawca", StringComparison.OrdinalIgnoreCase))
                {
                    // DASHBOARD DLA SPRZEDAWCY
                    var result = new
                    {
                        tasksCount = await _context.Tasks.CountAsync(t => t.UserId == userId), // Liczba zadań przypisanych do sprzedawcy
                        messagesCount = await _context.Messages.CountAsync(m => m.RecipientUserId == userId), // Liczba wiadomości dla sprzedawcy
                        remindersCount = await _context.Reminders.CountAsync(r => r.UserId == userId), // Liczba przypomnień dla sprzedawcy
                        invoicesCount = await _context.Invoices.CountAsync(), // Liczba wszystkich faktur
                        paymentsCount = await _context.Payments.CountAsync(), // Liczba wszystkich płatności
                        
                        // Ostatnie 5 spotkań z informacjami o klientach
                        recentMeetings = await _context.Meetings
                            .Include(m => m.Customer) // Dołącza dane klienta
                            .OrderByDescending(m => m.ScheduledAt) // Sortuje od najnowszych
                            .Take(5) // Pobiera tylko 5 rekordów
                            .Select(m => new { 
                                Id = m.Id, // ID spotkania
                                Topic = m.Topic, // Temat spotkania
                                ScheduledAt = m.ScheduledAt, // Data i czas spotkania
                                CustomerName = m.Customer.Name // Nazwa klienta
                            })
                            .ToListAsync(),
                        
                        // Ostatnie 5 notatek z informacjami o klientach
                        recentNotes = await _context.Notes
                            .Include(n => n.Customer) // Dołącza dane klienta
                            .OrderByDescending(n => n.CreatedAt) // Sortuje od najnowszych
                            .Take(5) // Pobiera tylko 5 rekordów
                            .Select(n => new { 
                                Id = n.Id, // ID notatki
                                Content = n.Content, // Treść notatki
                                CreatedAt = n.CreatedAt, // Data utworzenia
                                CustomerName = n.Customer.Name // Nazwa klienta
                            })
                            .ToListAsync(),
                        
                        // Ostatnie 5 klientów
                        recentCustomers = await _context.Customers
                            .OrderByDescending(c => c.CreatedAt) // Sortuje od najnowszych
                            .Take(5) // Pobiera tylko 5 rekordów
                            .Select(c => new { 
                                Id = c.Id, // ID klienta
                                Name = c.Name, // Nazwa klienta
                                Company = c.Company, // Nazwa firmy
                                CreatedAt = c.CreatedAt // Data utworzenia
                            })
                            .ToListAsync(),
                        
                        // Ostatnie 5 zadań przypisanych do sprzedawcy
                        recentTasks = await _context.Tasks
                            .Include(t => t.Customer) // Dołącza dane klienta
                            .Where(t => t.UserId == userId) // Filtruje tylko zadania sprzedawcy
                            .OrderByDescending(t => t.DueDate.HasValue ? t.DueDate.Value : DateTime.MinValue) // Sortuje po terminie (najpierw z terminem)
                            .Take(5) // Pobiera tylko 5 rekordów
                            .Select(t => new { 
                                Id = t.Id, // ID zadania
                                Title = t.Title, // Tytuł zadania
                                DueDate = t.DueDate, // Termin wykonania
                                Completed = t.Completed, // Status ukończenia
                                CustomerName = t.Customer.Name // Nazwa klienta
                            })
                            .ToListAsync()
                    };

                    return Ok(result); // Zwraca status HTTP 200 OK z danymi dashboardu sprzedawcy
                }
                else
                {
                    // DASHBOARD DLA ZWYKŁEGO UŻYTKOWNIKA
                    var result = new
                    {
                        tasksCount = await _context.Tasks.CountAsync(t => t.UserId == userId), // Liczba zadań przypisanych do użytkownika
                        messagesCount = await _context.Messages.CountAsync(m => m.RecipientUserId == userId), // Liczba wiadomości dla użytkownika
                        remindersCount = await _context.Reminders.CountAsync(r => r.UserId == userId), // Liczba przypomnień dla użytkownika
                        
                        // Historia logowań użytkownika (ostatnie 5)
                        loginHistory = await _context.LoginHistories
                            .Where(l => l.UserId == userId) // Filtruje tylko logowania użytkownika
                            .OrderByDescending(l => l.LoggedInAt) // Sortuje od najnowszych
                            .Take(5) // Pobiera tylko 5 rekordów
                            .Select(l => new { Date = l.LoggedInAt, l.IpAddress }) // Data logowania i adres IP
                            .ToListAsync()
                    };

                    return Ok(result); // Zwraca status HTTP 200 OK z danymi dashboardu użytkownika
                }
            }
            catch (Exception ex)
            {
                // Obsługa błędów - loguje błąd i zwraca status 500
                Console.WriteLine("❌ Błąd dashboard: " + ex.ToString());
                return StatusCode(500, "Dashboard error: " + ex.Message);
            }
        }
    }
}
