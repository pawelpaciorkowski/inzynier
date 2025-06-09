using CRM.BusinessLogic.Services.Admin;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Dostępny tylko dla zalogowanych użytkowników
    public class ProfileController : ControllerBase
    {
        private readonly IUserService _userService;

        public ProfileController(IUserService userService)
        {
            _userService = userService;
        }

        // PUT: api/profile/change-password
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
    }
}