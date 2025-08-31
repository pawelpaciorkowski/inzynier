using CRM.BusinessLogic.Auth;
using CRM.BusinessLogic.Auth.Requests;
using CRM.BusinessLogic.Services;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ICustomerService _customerService;

        public AuthController(IAuthService authService, ICustomerService customerService)
        {
            _authService = authService;
            _customerService = customerService; // <-- przypisanie
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var userAgent = Request.Headers["User-Agent"].FirstOrDefault();
                var ipAddress = GetClientIpAddress();

                var user = await _authService.AuthenticateAsync(request.Username, request.Password, userAgent, ipAddress);

                if (user == null)
                    return Unauthorized(new { message = "Nieprawidłowe dane logowania" });

                var token = _authService.GenerateJwtToken(user);
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                // Zwróć bardziej szczegółowy błąd zamiast 500
                // Możesz tu dodać logowanie błędu do pliku/konsoli
                Console.WriteLine($"[BŁĄD LOGOWANIA]: {ex.Message}");
                return StatusCode(500, new { message = $"Wystąpił wewnętrzny błąd serwera: {ex.Message}" });
            }
        }

        private string GetClientIpAddress()
        {
            var forwardedHeader = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedHeader))
            {
                return forwardedHeader.Split(',')[0].Trim();
            }

            var realIpHeader = Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIpHeader))
            {
                return realIpHeader;
            }

            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "::1";
        }



        [Authorize(Roles = "Admin")]
        [HttpGet("customers")]
        public async Task<ActionResult<List<Customer>>> GetAll()
        {
            var customers = await _customerService.GetAllAsync();
            return Ok(customers);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var user = await _authService.RegisterAsync(request);
            if (user == null)
                return BadRequest(new { message = "Username already taken" });

            return Ok(new { message = "User registered successfully" });
        }


        public class LoginRequest
        {
            public string Username { get; set; } = default!;
            public string Password { get; set; } = default!;
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            // Kontroler wywołuje serwis - tak jak powinno być.
            var updatedUser = await _authService.UpdateUserAsync(id, request);
            if (updatedUser == null)
            {
                return NotFound(new { message = "User not found" });
            }
            return Ok(new { message = "User updated successfully", user = updatedUser });
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            // Kontroler wywołuje serwis, a nie _context.
            var user = await _authService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }
            return Ok(user);
        }
    }
}
