using CRM.BusinessLogic.Services.Admin;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers.Admin
{
    /// <summary>
    /// Kontroler administracyjny do zarządzania użytkownikami w systemie CRM
    /// Klasa obsługuje operacje CRUD dla użytkowników oraz zarządzanie ich rolami
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API
    [Route("api/admin/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Users)
    public class UsersController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Serwis do zarządzania użytkownikami
        /// Zawiera logikę biznesową dla operacji na użytkownikach
        /// </summary>
        private readonly IUserService _userService;

        /// <summary>
        /// Konstruktor klasy UsersController
        /// Inicjalizuje kontroler z serwisem użytkowników przekazanym przez dependency injection
        /// </summary>
        /// <param name="userService">Serwis użytkowników przekazany przez dependency injection</param>
        public UsersController(IUserService userService)
        {
            _userService = userService; // Przypisuje przekazany serwis do pola prywatnego
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wszystkich użytkowników wraz z ich rolami
        /// Endpoint: GET /api/admin/users
        /// Dostęp: Admin, Sprzedawca
        /// </summary>
        /// <returns>Lista wszystkich użytkowników z informacjami o rolach</returns>
        [Authorize(Roles = "Admin,Sprzedawca")] // Wymaga autoryzacji - dostęp dla Admin i Sprzedawca
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<ActionResult<List<UserWithRoleDto>>> GetAll() // Metoda asynchroniczna zwracająca listę użytkowników z rolami
        {
            // Pobiera wszystkich użytkowników wraz z rolami z serwisu
            var users = await _userService.GetAllWithRolesAsync();

            // Mapuje dane użytkowników na DTO z informacjami o rolach
            var result = users.Select(u => new UserWithRoleDto
            {
                Id = u.Id, // ID użytkownika
                Username = u.Username, // Nazwa użytkownika
                Email = u.Email, // Adres email użytkownika
                Role = u.Role.Name // Nazwa roli użytkownika
            }).ToList(); // Konwertuje na listę

            return Ok(result); // Zwraca status HTTP 200 OK z listą użytkowników
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera użytkownika o określonym ID
        /// Endpoint: GET /api/admin/users/{id}
        /// Dostęp: Admin
        /// </summary>
        /// <param name="id">ID użytkownika do pobrania</param>
        /// <returns>Użytkownik o podanym ID lub NotFound jeśli użytkownik nie istnieje</returns>
        [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla Admin
        [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
        public async Task<ActionResult<CRM.Data.Models.User>> GetById(int id) // Metoda asynchroniczna zwracająca użytkownika
        {
            var user = await _userService.GetByIdAsync(id); // Pobiera użytkownika o podanym ID z serwisu
            if (user == null) return NotFound(); // Zwraca status HTTP 404 Not Found jeśli użytkownik nie istnieje
            return Ok(user); // Zwraca status HTTP 200 OK z danymi użytkownika
        }

        /// <summary>
        /// Metoda HTTP POST - tworzy nowego użytkownika w systemie
        /// Endpoint: POST /api/admin/users
        /// Dostęp: Admin
        /// </summary>
        /// <param name="dto">Dane transferowe zawierające informacje o nowym użytkowniku</param>
        /// <returns>Nowo utworzony użytkownik z informacjami o roli z statusem HTTP 201 Created</returns>
        [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla Admin
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        public async Task<ActionResult<UserWithRoleDto>> Create(CreateUserDto dto) // Metoda asynchroniczna zwracająca utworzonego użytkownika
        {
            var created = await _userService.CreateAsync(dto); // Tworzy nowego użytkownika używając serwisu
            
            // Mapuje utworzonego użytkownika na DTO z informacjami o roli
            var result = new UserWithRoleDto
            {
                Id = created.Id, // ID użytkownika
                Username = created.Username, // Nazwa użytkownika
                Email = created.Email, // Adres email użytkownika
                Role = created.Role.Name // Nazwa roli użytkownika
            };
            
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, result); // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu
        }

        /// <summary>
        /// Metoda HTTP PUT - aktualizuje istniejącego użytkownika
        /// Endpoint: PUT /api/admin/users/{id}
        /// Dostęp: Admin
        /// </summary>
        /// <param name="id">ID użytkownika do aktualizacji</param>
        /// <param name="dto">Dane transferowe zawierające nowe informacje o użytkowniku</param>
        /// <returns>Status HTTP 204 No Content po pomyślnej aktualizacji lub NotFound jeśli użytkownik nie istnieje</returns>
        [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla Admin
        [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
        public async Task<IActionResult> Update(int id, UpdateUserDto dto) // Metoda asynchroniczna zwracająca IActionResult
        {
            var updated = await _userService.UpdateAsync(id, dto); // Aktualizuje użytkownika używając serwisu
            if (!updated) return NotFound(); // Zwraca status HTTP 404 Not Found jeśli użytkownik nie istnieje
            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnej aktualizacji
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa użytkownika z systemu
        /// Endpoint: DELETE /api/admin/users/{id}
        /// Dostęp: Admin
        /// </summary>
        /// <param name="id">ID użytkownika do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli użytkownik nie istnieje</returns>
        [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla Admin
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        public async Task<IActionResult> Delete(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            var deleted = await _userService.DeleteAsync(id); // Usuwa użytkownika używając serwisu
            if (!deleted) return NotFound(); // Zwraca status HTTP 404 Not Found jeśli użytkownik nie istnieje
            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
        }
    }
}
