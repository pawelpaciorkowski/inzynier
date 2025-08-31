using CRM.BusinessLogic.Auth; // Importuje funkcjonalności autoryzacji z warstwy biznesowej
using CRM.BusinessLogic.Auth.Requests; // Importuje klasy żądań autoryzacji (LoginRequest, RegisterRequest, etc.)
using CRM.BusinessLogic.Services; // Importuje serwisy biznesowe (ICustomerService)
using CRM.Data.Models; // Importuje modele danych CRM (Customer, User, etc.)
using Microsoft.AspNetCore.Authorization; // Importuje funkcjonalności autoryzacji ASP.NET Core
using Microsoft.AspNetCore.Mvc; // Importuje podstawowe klasy kontrolerów MVC

namespace CRM.API.Controllers // Przestrzeń nazw dla kontrolerów API w systemie CRM
{
    /// <summary>
    /// Kontroler autoryzacji i uwierzytelniania w systemie CRM
    /// Klasa obsługuje logowanie, rejestrację użytkowników oraz zarządzanie profilami użytkowników
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Auth)
    public class AuthController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Serwis autoryzacji i uwierzytelniania
        /// Zawiera logikę biznesową dla operacji logowania, rejestracji i zarządzania użytkownikami
        /// </summary>
        private readonly IAuthService _authService; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Serwis klientów
        /// Używany do pobierania danych klientów
        /// </summary>
        private readonly ICustomerService _customerService; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

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
            try // Blok try-catch do obsługi błędów
            {
                // Pobiera nagłówek User-Agent z żądania HTTP - informacje o przeglądarce/urządzeniu
                var userAgent = Request.Headers["User-Agent"].FirstOrDefault();
                // Pobiera rzeczywisty adres IP klienta (może być za proxy)
                var ipAddress = GetClientIpAddress();

                // Wywołuje serwis autoryzacji z danymi logowania, user agent i IP
                var user = await _authService.AuthenticateAsync(request.Username, request.Password, userAgent, ipAddress);

                // Sprawdza czy uwierzytelnienie się powiodło
                if (user == null)
                    return Unauthorized(new { message = "Nieprawidłowe dane logowania" }); // Zwraca status HTTP 401 Unauthorized

                // Generuje token JWT dla uwierzytelnionego użytkownika
                var token = _authService.GenerateJwtToken(user);
                return Ok(new { token }); // Zwraca status HTTP 200 OK z tokenem JWT
            }
            catch (Exception ex) // Łapie wszystkie wyjątki
            {
                // Obsługa błędów - loguje błąd i zwraca status 500
                Console.WriteLine($"[BŁĄD LOGOWANIA]: {ex.Message}"); // Wypisuje błąd do konsoli
                return StatusCode(500, new { message = $"Wystąpił wewnętrzny błąd serwera: {ex.Message}" }); // Zwraca błąd 500
            }
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera rzeczywisty adres IP klienta
        /// Sprawdza różne nagłówki HTTP używane przez proxy/load balancery
        /// </summary>
        /// <returns>Adres IP klienta jako string</returns>
        private string GetClientIpAddress()
        {
            // Sprawdza nagłówek X-Forwarded-For (używany przez proxy)
            var forwardedHeader = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedHeader)) // Jeśli nagłówek istnieje
            {
                return forwardedHeader.Split(',')[0].Trim(); // Bierze pierwszy adres IP z listy
            }

            // Sprawdza nagłówek X-Real-IP (używany przez nginx)
            var realIpHeader = Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIpHeader)) // Jeśli nagłówek istnieje
            {
                return realIpHeader; // Zwraca adres IP z nagłówka
            }

            // Jeśli nie ma specjalnych nagłówków, bierze adres IP z połączenia
            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "::1"; // Domyślnie localhost IPv6
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wszystkich klientów (dostęp tylko dla administratorów)
        /// Endpoint: GET /api/auth/customers
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
            if (user == null) // Jeśli rejestracja się nie powiodła (np. nazwa użytkownika zajęta)
                return BadRequest(new { message = "Username already taken" }); // Zwraca status HTTP 400 Bad Request

            return Ok(new { message = "User registered successfully" }); // Zwraca status HTTP 200 OK z potwierdzeniem
        }

        /// <summary>
        /// Data Transfer Object (DTO) dla żądania logowania
        /// Używany do odbierania danych logowania od klienta
        /// </summary>
        public class LoginRequest
        {
            public string Username { get; set; } = default!; // Nazwa użytkownika - pole wymagane
            public string Password { get; set; } = default!; // Hasło użytkownika - pole wymagane
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
            if (updatedUser == null) // Jeśli użytkownik nie został znaleziony
            {
                return NotFound(new { message = "User not found" }); // Zwraca status HTTP 404 Not Found
            }
            return Ok(new { message = "User updated successfully", user = updatedUser }); // Zwraca status HTTP 200 OK z potwierdzeniem
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
            if (user == null) // Jeśli użytkownik nie został znaleziony
            {
                return NotFound(new { message = "User not found" }); // Zwraca status HTTP 404 Not Found
            }
            return Ok(user); // Zwraca status HTTP 200 OK z danymi użytkownika
        }
    }
}
