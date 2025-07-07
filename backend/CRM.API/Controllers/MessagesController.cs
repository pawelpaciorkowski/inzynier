using CRM.Data;
using CRM.Data.Models;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MessagesController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new System.InvalidOperationException("User ID not found in token.");
            }
            return userId;
        }

        // GET: api/Messages/inbox - Pobierz wiadomości odebrane dla zalogowanego użytkownika
        [HttpGet("inbox")]
        public async Task<IActionResult> GetInboxMessages()
        {
            var userId = GetCurrentUserId();
            var messages = await _context.Messages
                .Where(m => m.RecipientUserId == userId)
                .OrderByDescending(m => m.SentAt)
                .Select(m => new
                {
                    m.Id,
                    m.Subject,
                    m.Body,
                    m.SentAt,
                    m.IsRead,
                    SenderUsername = m.SenderUser.Username // Zakładamy, że Message ma nawigację do SenderUser
                })
                .ToListAsync();
            return Ok(messages);
        }

        // GET: api/Messages/sent - Pobierz wiadomości wysłane przez zalogowanego użytkownika
        [HttpGet("sent")]
        public async Task<IActionResult> GetSentMessages()
        {
            var userId = GetCurrentUserId();
            var messages = await _context.Messages
                .Where(m => m.SenderUserId == userId)
                .OrderByDescending(m => m.SentAt)
                .Select(m => new
                {
                    m.Id,
                    m.Subject,
                    m.Body,
                    m.SentAt,
                    m.IsRead,
                    RecipientUsername = m.RecipientUser.Username // Zakładamy, że Message ma nawigację do RecipientUser
                })
                .ToListAsync();
            return Ok(messages);
        }

        // GET: api/Messages/{id} - Pobierz szczegóły wiadomości
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMessage(int id)
        {
            var userId = GetCurrentUserId();
            var message = await _context.Messages
                .Include(m => m.SenderUser)
                .Include(m => m.RecipientUser)
                .FirstOrDefaultAsync(m => m.Id == id && (m.RecipientUserId == userId || m.SenderUserId == userId));

            if (message == null)
            {
                return NotFound();
            }

            // Oznacz wiadomość jako przeczytaną, jeśli jest to wiadomość odebrana
            if (message.RecipientUserId == userId && !message.IsRead)
            {
                message.IsRead = true;
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message.Id,
                message.Subject,
                message.Body,
                message.SentAt,
                message.IsRead,
                SenderUsername = message.SenderUser.Username,
                RecipientUsername = message.RecipientUser.Username
            });
        }

        // POST: api/Messages - Wyślij nową wiadomość
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] CreateMessageDto messageDto)
        {
            var senderUserId = GetCurrentUserId();

            var recipientUser = await _context.Users.FindAsync(messageDto.RecipientUserId);
            if (recipientUser == null)
            {
                return BadRequest(new { message = "Odbiorca nie istnieje." });
            }

            var message = new Message
            {
                SenderUserId = senderUserId,
                RecipientUserId = messageDto.RecipientUserId,
                Subject = messageDto.Subject,
                Body = messageDto.Body,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Create a notification for the recipient
            var notification = new Notification
            {
                UserId = message.RecipientUserId,
                Message = $"Nowa wiadomość od {recipientUser.Username}: {message.Subject}",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMessage), new { id = message.Id }, message);
        }

        // PUT: api/Messages/{id}/read - Oznacz wiadomość jako przeczytaną
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetCurrentUserId();
            var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == id && m.RecipientUserId == userId);

            if (message == null)
            {
                return NotFound();
            }

            message.IsRead = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Messages/{id} - Usuń wiadomość
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var userId = GetCurrentUserId();
            var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == id && (m.RecipientUserId == userId || m.SenderUserId == userId));

            if (message == null)
            {
                return NotFound();
            }

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
