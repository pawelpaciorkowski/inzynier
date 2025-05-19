using CRM.BusinessLogic.Auth;
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
            var user = await _authService.AuthenticateAsync(request.Username, request.Password);

            Console.WriteLine($"[LOGIN] User: {user?.Username}, Role: {user?.Role?.Name}");

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            var token = _authService.GenerateJwtToken(user);

            Console.WriteLine($"[LOGIN] JWT Token: {token}");

            return Ok(new { token });
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
    }
}
