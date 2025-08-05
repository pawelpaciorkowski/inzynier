using CRM.BusinessLogic.Services.Admin;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers.Admin
{
    /// <summary>
    /// Kontroler administracyjny do zarządzania rolami użytkowników w systemie CRM
    /// Klasa obsługuje operacje CRUD dla ról oraz zarządzanie użytkownikami w rolach
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API
    [Route("api/admin/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Roles)
    [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla użytkowników z rolą Admin
    public class RolesController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Serwis do zarządzania rolami użytkowników
        /// Zawiera logikę biznesową dla operacji na rolach
        /// </summary>
        private readonly IRoleService _roleService;

        /// <summary>
        /// Konstruktor klasy RolesController
        /// Inicjalizuje kontroler z serwisem ról przekazanym przez dependency injection
        /// </summary>
        /// <param name="roleService">Serwis ról przekazany przez dependency injection</param>
        public RolesController(IRoleService roleService)
        {
            _roleService = roleService; // Przypisuje przekazany serwis do pola prywatnego
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wszystkie role wraz z liczbą użytkowników w każdej roli
        /// Endpoint: GET /api/admin/roles
        /// </summary>
        /// <returns>Lista wszystkich ról z informacją o liczbie użytkowników w każdej roli</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<ActionResult<List<RoleWithUserCountDto>>> GetAll() // Metoda asynchroniczna zwracająca listę ról z liczbą użytkowników
        {
            var roles = await _roleService.GetAllWithUserCountAsync(); // Pobiera wszystkie role z liczbą użytkowników
            return Ok(roles); // Zwraca status HTTP 200 OK z listą ról
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera rolę o określonym ID
        /// Endpoint: GET /api/admin/roles/{id}
        /// </summary>
        /// <param name="id">ID roli do pobrania</param>
        /// <returns>Rola o podanym ID lub NotFound jeśli rola nie istnieje</returns>
        [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
        public async Task<ActionResult<Role>> GetById(int id) // Metoda asynchroniczna zwracająca rolę
        {
            var role = await _roleService.GetByIdAsync(id); // Pobiera rolę o podanym ID
            if (role == null)
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli rola nie istnieje

            return Ok(role); // Zwraca status HTTP 200 OK z danymi roli
        }

        /// <summary>
        /// Metoda HTTP POST - tworzy nową rolę w systemie
        /// Endpoint: POST /api/admin/roles
        /// </summary>
        /// <param name="dto">Dane transferowe zawierające informacje o nowej roli</param>
        /// <returns>Nowo utworzona rola z statusem HTTP 201 Created</returns>
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        public async Task<ActionResult<Role>> Create(CreateRoleDto dto) // Metoda asynchroniczna zwracająca utworzoną rolę
        {
            var created = await _roleService.CreateAsync(dto); // Tworzy nową rolę używając serwisu
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created); // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu
        }

        /// <summary>
        /// Metoda HTTP PUT - aktualizuje istniejącą rolę
        /// Endpoint: PUT /api/admin/roles/{id}
        /// </summary>
        /// <param name="id">ID roli do aktualizacji</param>
        /// <param name="dto">Dane transferowe zawierające nowe informacje o roli</param>
        /// <returns>Status HTTP 204 No Content po pomyślnej aktualizacji lub NotFound jeśli rola nie istnieje</returns>
        [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
        public async Task<IActionResult> Update(int id, UpdateRoleDto dto) // Metoda asynchroniczna zwracająca IActionResult
        {
            var success = await _roleService.UpdateAsync(id, dto); // Aktualizuje rolę używając serwisu
            if (!success)
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli rola nie istnieje

            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnej aktualizacji
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa rolę z systemu
        /// Endpoint: DELETE /api/admin/roles/{id}
        /// </summary>
        /// <param name="id">ID roli do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli rola nie istnieje</returns>
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        public async Task<IActionResult> Delete(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            var success = await _roleService.DeleteAsync(id); // Usuwa rolę używając serwisu
            if (!success)
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli rola nie istnieje

            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wszystkich użytkowników przypisanych do określonej roli
        /// Endpoint: GET /api/admin/roles/{roleId}/users
        /// </summary>
        /// <param name="roleId">ID roli, dla której chcemy pobrać użytkowników</param>
        /// <returns>Lista użytkowników przypisanych do podanej roli</returns>
        [HttpGet("{roleId}/users")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem roleId w ścieżce
        public async Task<ActionResult<List<UserWithRoleDto>>> GetUsersInRole(int roleId) // Metoda asynchroniczna zwracająca listę użytkowników
        {
            var users = await _roleService.GetUsersInRoleAsync(roleId); // Pobiera użytkowników w podanej roli
            return Ok(users); // Zwraca status HTTP 200 OK z listą użytkowników
        }
    }
}
