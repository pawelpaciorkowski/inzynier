using CRM.BusinessLogic.Services.Admin;
using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CRM.API.Controllers
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string RoleName { get; set; } = default!;
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ApplicationDbContext _context;

        public ProfileController(IUserService userService, ApplicationDbContext context)
        {
            _userService = userService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<UserProfileDto>> GetUserProfile()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound();
            }

            var userProfile = new UserProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                RoleName = user.Role?.Name ?? "Brak roli"
            };

            return Ok(userProfile);
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            var result = await _userService.ChangeUserPasswordAsync(userId, dto.CurrentPassword, dto.NewPassword);

            if (!result)
            {
                return BadRequest("Bieżące hasło jest nieprawidłowe lub wystąpił błąd.");
            }

            return Ok("Hasło zostało pomyślnie zmienione.");
        }

        [HttpGet("login-history")]
        public async Task<IActionResult> GetLoginHistory()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            var history = await _context.LoginHistories
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.LoggedInAt)
                .Take(20) // Ograniczamy do 20 ostatnich wpisów
                .Select(h => new
                {
                    h.Id,
                    h.LoggedInAt,
                    h.IpAddress
                })
                .ToListAsync();

            return Ok(history);
        }
    }
}