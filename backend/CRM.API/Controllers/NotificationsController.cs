using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("User ID not found or invalid.");
            }
            return userId;
        }

        // GET: api/Notifications/user
        [HttpGet("user")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserNotifications()
        {
            try
            {
                var userId = GetUserId();
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId)
                    .OrderByDescending(n => n.CreatedAt)
                    .Select(n => new {
                        n.Id,
                        n.Message,
                        n.CreatedAt,
                        n.IsRead,
                        n.MessageId
                    })
                    .ToListAsync();
                return Ok(notifications);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        // POST: api/Notifications/mark-as-read/{id}
        [HttpPost("mark-as-read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = GetUserId();
                var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

                if (notification == null)
                {
                    return NotFound("Powiadomienie nie znalezione lub nie masz do niego dostępu.");
                }

                notification.IsRead = true;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        // GET: api/Notifications/unread-count
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadNotificationsCount()
        {
            try
            {
                var userId = GetUserId();
                var count = await _context.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .CountAsync();
                return Ok(count);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}
