using CRM.BusinessLogic.Auth;
using CRM.BusinessLogic.Auth.Requests;
using CRM.BusinessLogic.Services;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers
{
    /// <summary>
    /// Kontroler autoryzacji i uwierzytelniania w systemie CRM
    /// Klasa obsługuje logowanie, rejestrację użytkowników oraz zarządzanie profilami użytkowników
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Auth)
    public class AuthController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Serwis autoryzacji i uwierzytelniania
        /// Zawiera logikę biznesową dla operacji logowania, rejestracji i zarządzania użytkownikami
        /// </summary>
        private readonly IAuthService _authService;

        /// <summary>
        /// Serwis klientów
        /// Używany do pobierania danych klientów
        /// </summary>
        private readonly ICustomerService _customerService;

        /// <summary>
        /// Konstruktor klasy AuthController
        /// Inicjalizuje kontroler z serwisami przekazanymi przez dependency injection
        /// </summary>
        /// <param name="authService">Serwis autoryzacji przekazany przez dependency injection</param>
        /// <param name="customerService">Serwis klientów przekazany przez dependency injection</param>
        public AuthController(IAuthService authService, ICustomerService customerService)
        {
            _authService = authService; // Przypisuje przekazany serwis autoryzacji do pola prywatnego
            _customerService = customerService; // Przypisuje przekazany serwis klientów do pola prywatnego
        }

        /// <summary>
        /// Metoda HTTP POST - logowanie użytkownika do systemu
        /// Endpoint: POST /api/auth/login
        /// </summary>
        /// <param name="request">Dane logowania (nazwa użytkownika i hasło)</param>
        /// <returns>Token JWT po pomyślnym logowaniu lub błąd autoryzacji</returns>
        [HttpPost("login")] // Oznacza metodę jako obsługującą żądania HTTP POST na ścieżce /login
        public async Task<IActionResult> Login([FromBody] LoginRequest request) // Metoda asynchroniczna zwracająca IActionResult
        {
            try
            {
                // Próbuje uwierzytelnić użytkownika używając serwisu autoryzacji
                var user = await _authService.AuthenticateAsync(request.Username, request.Password);

                // Sprawdza czy uwierzytelnienie się powiodło
                if (user == null)
                    return Unauthorized(new { message = "Nieprawidłowe dane logowania" }); // Zwraca status HTTP 401 Unauthorized

                // Generuje token JWT dla uwierzytelnionego użytkownika
                var token = _authService.GenerateJwtToken(user);
                return Ok(new { token }); // Zwraca status HTTP 200 OK z tokenem JWT
            }
            catch (Exception ex)
            {
                // Obsługa błędów - loguje błąd i zwraca status 500
                Console.WriteLine($"[BŁĄD LOGOWANIA]: {ex.Message}");
                return StatusCode(500, new { message = $"Wystąpił wewnętrzny błąd serwera: {ex.Message}" });
            }
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wszystkich klientów (dostęp tylko dla administratorów)
        /// Endpoint: GET /api/auth/customers
        /// Dostęp: Admin
        /// </summary>
        /// <returns>Lista wszystkich klientów w systemie</returns>
        [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla użytkowników z rolą Admin
        [HttpGet("customers")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce /customers
        public async Task<ActionResult<List<Customer>>> GetAll() // Metoda asynchroniczna zwracająca listę klientów
        {
            var customers = await _customerService.GetAllAsync(); // Pobiera wszystkich klientów z serwisu
            return Ok(customers); // Zwraca status HTTP 200 OK z listą klientów
        }

        /// <summary>
        /// Metoda HTTP POST - rejestracja nowego użytkownika w systemie
        /// Endpoint: POST /api/auth/register
        /// </summary>
        /// <param name="request">Dane rejestracji nowego użytkownika</param>
        /// <returns>Potwierdzenie rejestracji lub błąd jeśli nazwa użytkownika jest zajęta</returns>
        [HttpPost("register")] // Oznacza metodę jako obsługującą żądania HTTP POST na ścieżce /register
        public async Task<IActionResult> Register([FromBody] RegisterRequest request) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Próbuje zarejestrować nowego użytkownika używając serwisu autoryzacji
            var user = await _authService.RegisterAsync(request);
            if (user == null)
                return BadRequest(new { message = "Username already taken" }); // Zwraca status HTTP 400 Bad Request jeśli nazwa użytkownika jest zajęta

            return Ok(new { message = "User registered successfully" }); // Zwraca status HTTP 200 OK z potwierdzeniem rejestracji
        }

        /// <summary>
        /// Data Transfer Object (DTO) dla żądania logowania
        /// Używany do odbierania danych logowania od klienta
        /// </summary>
        public class LoginRequest
        {
            public string Username { get; set; } = default!; // Nazwa użytkownika
            public string Password { get; set; } = default!; // Hasło użytkownika
        }

        /// <summary>
        /// Metoda HTTP PUT - aktualizuje dane użytkownika
        /// Endpoint: PUT /api/auth/users/{id}
        /// </summary>
        /// <param name="id">ID użytkownika do aktualizacji</param>
        /// <param name="request">Nowe dane użytkownika</param>
        /// <returns>Potwierdzenie aktualizacji lub NotFound jeśli użytkownik nie istnieje</returns>
        [HttpPut("users/{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT na ścieżce /users/{id}
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Próbuje zaktualizować użytkownika używając serwisu autoryzacji
            var updatedUser = await _authService.UpdateUserAsync(id, request);
            if (updatedUser == null)
            {
                return NotFound(new { message = "User not found" }); // Zwraca status HTTP 404 Not Found jeśli użytkownik nie istnieje
            }
            return Ok(new { message = "User updated successfully", user = updatedUser }); // Zwraca status HTTP 200 OK z potwierdzeniem aktualizacji
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera użytkownika o określonym ID
        /// Endpoint: GET /api/auth/users/{id}
        /// </summary>
        /// <param name="id">ID użytkownika do pobrania</param>
        /// <returns>Dane użytkownika lub NotFound jeśli użytkownik nie istnieje</returns>
        [HttpGet("users/{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce /users/{id}
        public async Task<IActionResult> GetUser(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera użytkownika o podanym ID używając serwisu autoryzacji
            var user = await _authService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" }); // Zwraca status HTTP 404 Not Found jeśli użytkownik nie istnieje
            }
            return Ok(user); // Zwraca status HTTP 200 OK z danymi użytkownika
        }
    }
}
