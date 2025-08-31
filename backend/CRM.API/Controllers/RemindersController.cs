using CRM.Data;
using CRM.Data.Models;
using CRM.BusinessLogic.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RemindersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public RemindersController(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
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

        // GET: api/Reminders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Reminder>>> GetReminders()
        {
            var userId = GetCurrentUserId();
            var reminders = await _context.Reminders
                .Where(r => r.UserId == userId)
                .OrderBy(r => r.RemindAt)
                .ToListAsync();
            return Ok(reminders);
        }

        // GET: api/Reminders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Reminder>> GetReminder(int id)
        {
            var userId = GetCurrentUserId();
            var reminder = await _context.Reminders.FindAsync(id);

            if (reminder == null || reminder.UserId != userId)
            {
                return NotFound();
            }

            return Ok(reminder);
        }

        // POST: api/Reminders
        [HttpPost]
        public async Task<ActionResult<Reminder>> PostReminder(CreateReminderDto createReminderDto)
        {
            var userId = GetCurrentUserId();
            var reminder = new Reminder
            {
                Note = createReminderDto.Note,
                RemindAt = createReminderDto.RemindAt,
                UserId = userId
            };

            _context.Reminders.Add(reminder);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetReminder", new { id = reminder.Id }, reminder);
        }

        // PUT: api/Reminders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReminder(int id, UpdateReminderDto updateReminderDto)
        {
            if (id != updateReminderDto.Id)
            {
                return BadRequest();
            }

            var userId = GetCurrentUserId();
            var reminder = await _context.Reminders.FindAsync(id);

            if (reminder == null || reminder.UserId != userId)
            {
                return NotFound();
            }

            reminder.Note = updateReminderDto.Note;
            reminder.RemindAt = updateReminderDto.RemindAt;

            _context.Entry(reminder).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReminderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Reminders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReminder(int id)
        {
            var userId = GetCurrentUserId();
            var reminder = await _context.Reminders.FindAsync(id);
            if (reminder == null || reminder.UserId != userId)
            {
                return NotFound();
            }

            _context.Reminders.Remove(reminder);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ReminderExists(int id)
        {
            return _context.Reminders.Any(e => e.Id == id);
        }
    }
}