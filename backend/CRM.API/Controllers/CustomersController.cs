using CRM.BusinessLogic.Services;
using CRM.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CRM.Data;

namespace CRM.API.Controllers
{
    /// <summary>
    /// Kontroler do zarządzania klientami w systemie CRM
    /// Klasa obsługuje operacje CRUD dla klientów z kontrolą dostępu opartą na rolach i grupach użytkowników
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Customers)
    public class CustomersController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Serwis do zarządzania klientami
        /// Zawiera logikę biznesową dla operacji na klientach
        /// </summary>
        private readonly ICustomerService _customerService;

        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych
        /// </summary>
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Konstruktor klasy CustomersController
        /// Inicjalizuje kontroler z serwisem klientów i kontekstem bazy danych
        /// </summary>
        /// <param name="customerService">Serwis klientów przekazany przez dependency injection</param>
        /// <param name="context">Kontekst bazy danych przekazany przez dependency injection</param>
        public CustomersController(ICustomerService customerService, ApplicationDbContext context)
        {
            _customerService = customerService; // Przypisuje przekazany serwis do pola prywatnego
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
        /// Metoda HTTP GET - pobiera listę klientów z kontrolą dostępu opartą na rolach
        /// Endpoint: GET /api/customers
        /// Dostęp: Wszyscy zalogowani użytkownicy (z różnymi poziomami dostępu)
        /// </summary>
        /// <returns>Lista klientów dostosowana do roli użytkownika</returns>
        [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<ActionResult<List<Customer>>> GetAll() // Metoda asynchroniczna zwracająca listę klientów
        {
            var currentUserId = GetCurrentUserId(); // Pobiera ID aktualnego użytkownika
            if (currentUserId == 0) return Unauthorized(); // Zwraca status HTTP 401 Unauthorized jeśli nie można pobrać ID użytkownika

            var isAdmin = await IsUserAdmin(currentUserId); // Sprawdza czy użytkownik jest adminem
            
            if (isAdmin)
            {
                // ADMIN - widzi wszystkich klientów w systemie
                var customers = await _customerService.GetAllAsync(); // Pobiera wszystkich klientów z serwisu
                return Ok(customers); // Zwraca status HTTP 200 OK z listą wszystkich klientów
            }
            else
            {
                // ZWYKŁY UŻYTKOWNIK - widzi tylko klientów ze swoich grup
                // Pobiera ID grup, do których należy użytkownik
                var userGroups = await _context.UserGroups
                    .Where(ug => ug.UserId == currentUserId) // Filtruje grupy użytkownika
                    .Select(ug => ug.GroupId) // Wybiera tylko ID grup
                    .ToListAsync(); // Konwertuje na listę

                // Pobiera klientów przypisanych do grup użytkownika
                var customers = await _context.Customers
                    .Where(c => c.AssignedGroupId.HasValue && userGroups.Contains(c.AssignedGroupId.Value)) // Filtruje klientów z grup użytkownika
                    .ToListAsync(); // Konwertuje na listę

                return Ok(customers); // Zwraca status HTTP 200 OK z listą klientów użytkownika
            }
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera klienta o określonym ID
        /// Endpoint: GET /api/customers/{id}
        /// Dostęp: Wszyscy zalogowani użytkownicy
        /// </summary>
        /// <param name="id">ID klienta do pobrania</param>
        /// <returns>Klient o podanym ID lub NotFound jeśli klient nie istnieje</returns>
        [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
        [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
        public async Task<ActionResult<Customer>> GetById(int id) // Metoda asynchroniczna zwracająca klienta
        {
            var customer = await _customerService.GetByIdAsync(id); // Pobiera klienta o podanym ID z serwisu
            if (customer == null)
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli klient nie istnieje
            return Ok(customer); // Zwraca status HTTP 200 OK z danymi klienta
        }

        /// <summary>
        /// Metoda HTTP POST - tworzy nowego klienta w systemie
        /// Endpoint: POST /api/customers
        /// Dostęp: Wszyscy zalogowani użytkownicy
        /// </summary>
        /// <param name="customerDto">Dane nowego klienta</param>
        /// <returns>Nowo utworzony klient z statusem HTTP 201 Created</returns>
        [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        public async Task<ActionResult<Customer>> Create(CreateCustomerDto customerDto) // Metoda asynchroniczna zwracająca utworzonego klienta
        {
            var created = await _customerService.CreateAsync(customerDto); // Tworzy nowego klienta używając serwisu
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created); // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu
        }

        /// <summary>
        /// Metoda HTTP PUT - aktualizuje istniejącego klienta
        /// Endpoint: PUT /api/customers/{id}
        /// Dostęp: Admin, Manager, Sprzedawca
        /// </summary>
        /// <param name="id">ID klienta do aktualizacji</param>
        /// <param name="customerDto">Nowe dane klienta</param>
        /// <returns>Status HTTP 204 No Content po pomyślnej aktualizacji lub NotFound jeśli klient nie istnieje</returns>
        [Authorize(Roles = "Admin,Manager,Sprzedawca")] // Wymaga autoryzacji - dostęp dla Admin, Manager, Sprzedawca
        [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
        public async Task<IActionResult> Update(int id, UpdateCustomerDto customerDto) // Metoda asynchroniczna zwracająca IActionResult
        {
            var updated = await _customerService.UpdateAsync(id, customerDto); // Aktualizuje klienta używając serwisu
            if (!updated)
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli klient nie istnieje
            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnej aktualizacji
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa klienta z systemu
        /// Endpoint: DELETE /api/customers/{id}
        /// Dostęp: Admin, Manager, Sprzedawca
        /// </summary>
        /// <param name="id">ID klienta do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli klient nie istnieje</returns>
        [Authorize(Roles = "Admin,Manager,Sprzedawca")] // Wymaga autoryzacji - dostęp dla Admin, Manager, Sprzedawca
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        public async Task<IActionResult> Delete(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            var deleted = await _customerService.DeleteAsync(id); // Usuwa klienta używając serwisu
            if (!deleted)
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli klient nie istnieje
            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
        }
    }
}
