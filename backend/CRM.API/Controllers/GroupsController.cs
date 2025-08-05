using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Security.Claims;

namespace CRM.API.Controllers
{
    /// <summary>
    /// Kontroler do zarządzania grupami użytkowników w systemie CRM
    /// Klasa obsługuje operacje CRUD dla grup oraz zarządzanie członkami grup i przypisywanie klientów
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Groups)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class GroupsController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych
        /// </summary>
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Konstruktor klasy GroupsController
        /// Inicjalizuje kontroler z kontekstem bazy danych
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez dependency injection</param>
        public GroupsController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera ID aktualnego użytkownika z tokenu JWT
        /// </summary>
        /// <returns>ID użytkownika lub 0 jeśli nie można pobrać ID</returns>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier); // Pobiera claim z ID użytkownika z tokenu JWT
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0; // Konwertuje na int lub zwraca 0 jeśli claim nie istnieje
        }

        /// <summary>
        /// Metoda pomocnicza - sprawdza czy użytkownik ma rolę administratora
        /// </summary>
        /// <param name="userId">ID użytkownika do sprawdzenia</param>
        /// <returns>True jeśli użytkownik jest adminem, false w przeciwnym przypadku</returns>
        private async Task<bool> IsUserAdmin(int userId)
        {
            // Pobiera użytkownika wraz z jego rolą z bazy danych
            var user = await _context.Users
                .Include(u => u.Role) // Dołącza dane roli użytkownika
                .FirstOrDefaultAsync(u => u.Id == userId); // Pobiera użytkownika o podanym ID
            return user?.Role?.Name?.ToLower() == "admin"; // Sprawdza czy nazwa roli to "admin" (case-insensitive)
        }

        /// <summary>
        /// Metoda pomocnicza - sprawdza czy użytkownik należy do określonej grupy
        /// </summary>
        /// <param name="userId">ID użytkownika do sprawdzenia</param>
        /// <param name="groupId">ID grupy do sprawdzenia</param>
        /// <returns>True jeśli użytkownik należy do grupy, false w przeciwnym przypadku</returns>
        private async Task<bool> IsUserInGroup(int userId, int groupId)
        {
            return await _context.UserGroups
                .AnyAsync(ug => ug.UserId == userId && ug.GroupId == groupId); // Sprawdza czy istnieje relacja użytkownik-grupa
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wszystkie grupy z podstawowymi statystykami
        /// Endpoint: GET /api/groups
        /// </summary>
        /// <returns>Lista wszystkich grup z liczbą członków, klientów, zadań, kontraktów, faktur i spotkań</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<IActionResult> GetGroups() // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera wszystkie grupy z podstawowymi statystykami
            var groups = await _context.Groups
                .Select(g => new { // Projektuje dane do anonimowego obiektu
                    g.Id, // ID grupy
                    g.Name, // Nazwa grupy
                    g.Description, // Opis grupy
                    MemberCount = g.UserGroups.Count(), // Liczba członków grupy
                    CustomerCount = g.AssignedCustomers.Count(), // Liczba przypisanych klientów
                    TaskCount = g.AssignedTasks.Count(), // Liczba przypisanych zadań
                    ContractCount = g.ResponsibleContracts.Count(), // Liczba odpowiedzialnych kontraktów
                    InvoiceCount = g.AssignedInvoices.Count(), // Liczba przypisanych faktur
                    MeetingCount = g.AssignedMeetings.Count() // Liczba przypisanych spotkań
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę
            return Ok(groups); // Zwraca status HTTP 200 OK z listą grup
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera grupy użytkownika z kontrolą dostępu opartą na rolach
        /// Endpoint: GET /api/groups/my-groups
        /// </summary>
        /// <returns>Lista grup dostosowana do roli użytkownika</returns>
        [HttpGet("my-groups")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce /my-groups
        public async Task<IActionResult> GetMyGroups() // Metoda asynchroniczna zwracająca IActionResult
        {
            var currentUserId = GetCurrentUserId(); // Pobiera ID aktualnego użytkownika
            if (currentUserId == 0) return Unauthorized(); // Zwraca status HTTP 401 Unauthorized jeśli nie można pobrać ID użytkownika

            var isAdmin = await IsUserAdmin(currentUserId); // Sprawdza czy użytkownik jest adminem
            
            IQueryable<Group> groupsQuery; // Zmienna do przechowywania zapytania
            
            if (isAdmin)
            {
                // ADMIN - widzi wszystkie grupy w systemie
                groupsQuery = _context.Groups;
            }
            else
            {
                // ZWYKŁY UŻYTKOWNIK - widzi tylko grupy, do których należy
                groupsQuery = _context.Groups
                    .Where(g => g.UserGroups.Any(ug => ug.UserId == currentUserId)); // Filtruje grupy użytkownika
            }

            // Pobiera grupy z podstawowymi statystykami
            var groups = await groupsQuery
                .Select(g => new { // Projektuje dane do anonimowego obiektu
                    g.Id, // ID grupy
                    g.Name, // Nazwa grupy
                    g.Description, // Opis grupy
                    MemberCount = g.UserGroups.Count(), // Liczba członków grupy
                    CustomerCount = g.AssignedCustomers.Count(), // Liczba przypisanych klientów
                    TaskCount = g.AssignedTasks.Count(), // Liczba przypisanych zadań
                    ContractCount = g.ResponsibleContracts.Count(), // Liczba odpowiedzialnych kontraktów
                    InvoiceCount = g.AssignedInvoices.Count(), // Liczba przypisanych faktur
                    MeetingCount = g.AssignedMeetings.Count() // Liczba przypisanych spotkań
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę
                
            return Ok(groups); // Zwraca status HTTP 200 OK z listą grup
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera szczegóły grupy o określonym ID
        /// Endpoint: GET /api/groups/{id}
        /// </summary>
        /// <param name="id">ID grupy do pobrania</param>
        /// <returns>Szczegóły grupy z listą członków i klientów lub NotFound jeśli grupa nie istnieje</returns>
        [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
        public async Task<IActionResult> GetGroup(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera grupę o podanym ID wraz z powiązanymi danymi
            var group = await _context.Groups
                .Include(g => g.UserGroups) // Dołącza członków grupy
                    .ThenInclude(ug => ug.User) // Dołącza dane użytkowników
                .Include(g => g.AssignedCustomers) // Dołącza przypisanych klientów
                .Include(g => g.AssignedTasks) // Dołącza przypisane zadania
                .Include(g => g.ResponsibleContracts) // Dołącza odpowiedzialne kontrakty
                .Include(g => g.AssignedInvoices) // Dołącza przypisane faktury
                .Include(g => g.AssignedMeetings) // Dołącza przypisane spotkania
                .FirstOrDefaultAsync(g => g.Id == id); // Pobiera pierwszy element lub null

            if (group == null) return NotFound(); // Zwraca status HTTP 404 Not Found jeśli grupa nie istnieje

            // Tworzy obiekt z szczegółami grupy
            var result = new
            {
                group.Id, // ID grupy
                group.Name, // Nazwa grupy
                group.Description, // Opis grupy
                Members = group.UserGroups.Select(ug => new { ug.User.Id, ug.User.Username, ug.User.Email }), // Lista członków grupy
                AssignedCustomers = group.AssignedCustomers.Select(c => new { c.Id, c.Name, c.Email }), // Lista przypisanych klientów
                CustomerCount = group.AssignedCustomers.Count, // Liczba klientów
                TaskCount = group.AssignedTasks.Count, // Liczba zadań
                ContractCount = group.ResponsibleContracts.Count, // Liczba kontraktów
                InvoiceCount = group.AssignedInvoices.Count, // Liczba faktur
                MeetingCount = group.AssignedMeetings.Count // Liczba spotkań
            };

            return Ok(result); // Zwraca status HTTP 200 OK z szczegółami grupy
        }

        /// <summary>
        /// Metoda HTTP POST - tworzy nową grupę w systemie
        /// Endpoint: POST /api/groups
        /// Dostęp: Admin
        /// </summary>
        /// <param name="newGroup">Dane nowej grupy</param>
        /// <returns>Nowo utworzona grupa z statusem HTTP 201 Created</returns>
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla użytkowników z rolą Admin
        public async Task<IActionResult> CreateGroup([FromBody] Group newGroup) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Walidacja - sprawdza czy nazwa grupy nie jest pusta
            if (string.IsNullOrWhiteSpace(newGroup.Name))
                return BadRequest("Nazwa grupy jest wymagana."); // Zwraca status HTTP 400 Bad Request

            _context.Groups.Add(newGroup); // Dodaje nową grupę do kontekstu
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
            return CreatedAtAction(nameof(GetGroups), new { id = newGroup.Id }, newGroup); // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu
        }

        /// <summary>
        /// Metoda HTTP PUT - aktualizuje istniejącą grupę
        /// Endpoint: PUT /api/groups/{id}
        /// Dostęp: Admin
        /// </summary>
        /// <param name="id">ID grupy do aktualizacji</param>
        /// <param name="updatedGroup">Nowe dane grupy</param>
        /// <returns>Zaktualizowana grupa lub NotFound jeśli grupa nie istnieje</returns>
        [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
        [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla użytkowników z rolą Admin
        public async Task<IActionResult> UpdateGroup(int id, [FromBody] Group updatedGroup) // Metoda asynchroniczna zwracająca IActionResult
        {
            var group = await _context.Groups.FindAsync(id); // Pobiera grupę o podanym ID z bazy danych
            if (group == null) return NotFound(); // Zwraca status HTTP 404 Not Found jeśli grupa nie istnieje

            group.Name = updatedGroup.Name; // Aktualizuje nazwę grupy
            group.Description = updatedGroup.Description; // Aktualizuje opis grupy

            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
            return Ok(group); // Zwraca status HTTP 200 OK z zaktualizowaną grupą
        }

        /// <summary>
        /// Metoda HTTP POST - dodaje użytkownika do grupy
        /// Endpoint: POST /api/groups/{groupId}/members/{userId}
        /// Dostęp: Admin
        /// </summary>
        /// <param name="groupId">ID grupy</param>
        /// <param name="userId">ID użytkownika do dodania</param>
        /// <returns>Potwierdzenie dodania użytkownika do grupy</returns>
        [HttpPost("{groupId}/members/{userId}")] // Oznacza metodę jako obsługującą żądania HTTP POST na ścieżce /members/{userId}
        [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla użytkowników z rolą Admin
        public async Task<IActionResult> AddMemberToGroup(int groupId, int userId) // Metoda asynchroniczna zwracająca IActionResult
        {
            var group = await _context.Groups.FindAsync(groupId); // Pobiera grupę o podanym ID
            var user = await _context.Users.FindAsync(userId); // Pobiera użytkownika o podanym ID

            if (group == null || user == null) return NotFound(); // Zwraca status HTTP 404 Not Found jeśli grupa lub użytkownik nie istnieje

            // Sprawdza czy użytkownik już należy do grupy
            var existingMembership = await _context.UserGroups
                .FirstOrDefaultAsync(ug => ug.GroupId == groupId && ug.UserId == userId);

            if (existingMembership != null)
                return BadRequest("Użytkownik już należy do tej grupy."); // Zwraca status HTTP 400 Bad Request

            // Tworzy nową relację użytkownik-grupa
            var userGroup = new UserGroup { GroupId = groupId, UserId = userId, Group = group, User = user };
            _context.UserGroups.Add(userGroup); // Dodaje relację do kontekstu
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            return Ok(new { message = "Użytkownik został dodany do grupy." }); // Zwraca status HTTP 200 OK z potwierdzeniem
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa użytkownika z grupy
        /// Endpoint: DELETE /api/groups/{groupId}/members/{userId}
        /// Dostęp: Admin
        /// </summary>
        /// <param name="groupId">ID grupy</param>
        /// <param name="userId">ID użytkownika do usunięcia</param>
        /// <returns>Potwierdzenie usunięcia użytkownika z grupy</returns>
        [HttpDelete("{groupId}/members/{userId}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE na ścieżce /members/{userId}
        [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla użytkowników z rolą Admin
        public async Task<IActionResult> RemoveMemberFromGroup(int groupId, int userId) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera relację użytkownik-grupa
            var membership = await _context.UserGroups
                .FirstOrDefaultAsync(ug => ug.GroupId == groupId && ug.UserId == userId);

            if (membership == null) return NotFound(); // Zwraca status HTTP 404 Not Found jeśli relacja nie istnieje

            _context.UserGroups.Remove(membership); // Usuwa relację z kontekstu
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            return Ok(new { message = "Użytkownik został usunięty z grupy." }); // Zwraca status HTTP 200 OK z potwierdzeniem
        }

        /// <summary>
        /// Metoda HTTP POST - przypisuje klienta do grupy
        /// Endpoint: POST /api/groups/{groupId}/customers/{customerId}
        /// Dostęp: Admin lub członek grupy
        /// </summary>
        /// <param name="groupId">ID grupy</param>
        /// <param name="customerId">ID klienta do przypisania</param>
        /// <returns>Potwierdzenie przypisania klienta do grupy</returns>
        [HttpPost("{groupId}/customers/{customerId}")] // Oznacza metodę jako obsługującą żądania HTTP POST na ścieżce /customers/{customerId}
        public async Task<IActionResult> AddCustomerToGroup(int groupId, int customerId) // Metoda asynchroniczna zwracająca IActionResult
        {
            var currentUserId = GetCurrentUserId(); // Pobiera ID aktualnego użytkownika
            if (currentUserId == 0) return Unauthorized(); // Zwraca status HTTP 401 Unauthorized jeśli nie można pobrać ID użytkownika

            // Sprawdza czy użytkownik jest adminem lub należy do grupy
            var isAdmin = await IsUserAdmin(currentUserId);
            var isInGroup = await IsUserInGroup(currentUserId, groupId);

            if (!isAdmin && !isInGroup)
                return Forbid("Możesz przypisywać klientów tylko do swoich grup."); // Zwraca status HTTP 403 Forbidden

            var group = await _context.Groups.FindAsync(groupId); // Pobiera grupę o podanym ID
            if (group == null) return NotFound("Grupa nie została znaleziona."); // Zwraca status HTTP 404 Not Found

            var customer = await _context.Customers.FindAsync(customerId); // Pobiera klienta o podanym ID
            if (customer == null) return NotFound("Klient nie został znaleziony."); // Zwraca status HTTP 404 Not Found

            customer.AssignedGroupId = groupId; // Przypisuje klienta do grupy
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            return Ok(new { message = "Klient został pomyślnie przypisany do grupy." }); // Zwraca status HTTP 200 OK z potwierdzeniem
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa klienta z grupy
        /// Endpoint: DELETE /api/groups/{groupId}/customers/{customerId}
        /// Dostęp: Admin lub członek grupy
        /// </summary>
        /// <param name="groupId">ID grupy</param>
        /// <param name="customerId">ID klienta do usunięcia z grupy</param>
        /// <returns>Potwierdzenie usunięcia klienta z grupy</returns>
        [HttpDelete("{groupId}/customers/{customerId}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE na ścieżce /customers/{customerId}
        public async Task<IActionResult> RemoveCustomerFromGroup(int groupId, int customerId) // Metoda asynchroniczna zwracająca IActionResult
        {
            var currentUserId = GetCurrentUserId(); // Pobiera ID aktualnego użytkownika
            if (currentUserId == 0) return Unauthorized(); // Zwraca status HTTP 401 Unauthorized jeśli nie można pobrać ID użytkownika

            // Sprawdza czy użytkownik jest adminem lub należy do grupy
            var isAdmin = await IsUserAdmin(currentUserId);
            var isInGroup = await IsUserInGroup(currentUserId, groupId);

            if (!isAdmin && !isInGroup)
                return Forbid("Możesz usuwać klientów tylko ze swoich grup."); // Zwraca status HTTP 403 Forbidden

            // Pobiera klienta przypisanego do grupy
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId && c.AssignedGroupId == groupId);
            if (customer == null) return NotFound("Klient nie jest przypisany do tej grupy."); // Zwraca status HTTP 404 Not Found

            customer.AssignedGroupId = null; // Usuwa przypisanie klienta do grupy
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            return Ok(new { message = "Klient został pomyślnie usunięty z grupy." }); // Zwraca status HTTP 200 OK z potwierdzeniem
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera szczegółowe statystyki grupy
        /// Endpoint: GET /api/groups/{id}/statistics
        /// </summary>
        /// <param name="id">ID grupy do pobrania statystyk</param>
        /// <returns>Szczegółowe statystyki grupy lub NotFound jeśli grupa nie istnieje</returns>
        [HttpGet("{id}/statistics")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce /statistics
        public async Task<IActionResult> GetGroupStatistics(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera grupę o podanym ID wraz z powiązanymi danymi
            var group = await _context.Groups
                .Include(g => g.AssignedCustomers) // Dołącza przypisanych klientów
                .Include(g => g.AssignedTasks) // Dołącza przypisane zadania
                .Include(g => g.ResponsibleContracts) // Dołącza odpowiedzialne kontrakty
                .Include(g => g.AssignedInvoices) // Dołącza przypisane faktury
                .Include(g => g.AssignedMeetings) // Dołącza przypisane spotkania
                .FirstOrDefaultAsync(g => g.Id == id); // Pobiera pierwszy element lub null

            if (group == null) return NotFound(); // Zwraca status HTTP 404 Not Found jeśli grupa nie istnieje

            // Tworzy obiekt ze szczegółowymi statystykami grupy
            var statistics = new
            {
                TotalMembers = group.UserGroups.Count, // Całkowita liczba członków
                TotalCustomers = group.AssignedCustomers.Count, // Całkowita liczba klientów
                TotalTasks = group.AssignedTasks.Count, // Całkowita liczba zadań
                CompletedTasks = group.AssignedTasks.Count(t => t.Completed), // Liczba ukończonych zadań
                PendingTasks = group.AssignedTasks.Count(t => !t.Completed), // Liczba oczekujących zadań
                TotalContracts = group.ResponsibleContracts.Count, // Całkowita liczba kontraktów
                TotalInvoices = group.AssignedInvoices.Count, // Całkowita liczba faktur
                PaidInvoices = group.AssignedInvoices.Count(i => i.IsPaid), // Liczba opłaconych faktur
                UnpaidInvoices = group.AssignedInvoices.Count(i => !i.IsPaid), // Liczba nieopłaconych faktur
                TotalMeetings = group.AssignedMeetings.Count, // Całkowita liczba spotkań
                UpcomingMeetings = group.AssignedMeetings.Count(m => m.ScheduledAt > DateTime.Now) // Liczba nadchodzących spotkań
            };

            return Ok(statistics); // Zwraca status HTTP 200 OK ze statystykami grupy
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa grupę z systemu
        /// Endpoint: DELETE /api/groups/{id}
        /// Dostęp: Admin
        /// </summary>
        /// <param name="id">ID grupy do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli grupa nie istnieje</returns>
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla użytkowników z rolą Admin
        public async Task<IActionResult> DeleteGroup(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            var group = await _context.Groups.FindAsync(id); // Pobiera grupę o podanym ID z bazy danych
            if (group == null) return NotFound(); // Zwraca status HTTP 404 Not Found jeśli grupa nie istnieje

            _context.Groups.Remove(group); // Usuwa grupę z kontekstu
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
        }
    }
}