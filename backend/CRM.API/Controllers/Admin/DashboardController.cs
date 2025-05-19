using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

namespace CRM.API.Controllers.Admin
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                    return Unauthorized("Brak identyfikatora użytkownika");

                var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                    return NotFound("Użytkownik nie istnieje");

                if (string.Equals(user.Role?.Name, "admin", StringComparison.OrdinalIgnoreCase))
                {
                    var taskSummary = await _context.Users
                        .Select(u => new
                        {
                            Username = u.Username,
                            Count = _context.Tasks.Count(t => t.UserId == u.Id)
                        })
                        .ToListAsync();

                    var result = new
                    {
                        contractsCount = await _context.Contracts.CountAsync(),
                        invoicesCount = await _context.Invoices.CountAsync(),
                        paymentsCount = await _context.Payments.CountAsync(),
                        usersCount = await _context.Users.CountAsync(),
                        systemLogsCount = await _context.SystemLogs.CountAsync(),
                        tasksCount = await _context.Tasks.CountAsync(),
                        taskPerUser = taskSummary
                    };

                    return Ok(result);
                }
                else
                {
                    var result = new
                    {
                        tasksCount = await _context.Tasks.CountAsync(t => t.UserId == userId),
                        messagesCount = await _context.Messages.CountAsync(m => m.RecipientUserId == userId),
                        remindersCount = await _context.Reminders.CountAsync(r => r.UserId == userId),
                        loginHistory = await _context.LoginHistories
                            .Where(l => l.UserId == userId)
                            .OrderByDescending(l => l.LoggedInAt)
                            .Take(5)
                            .Select(l => new { Date = l.LoggedInAt, l.IpAddress })
                            .ToListAsync()
                    };

                    return Ok(result);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ Błąd dashboard: " + ex.ToString());
                return StatusCode(500, "Dashboard error: " + ex.Message);
            }
        }
    }
}
