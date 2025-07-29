using CRM.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "Admin,Sprzedawca")]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            var tasks = await _context.Tasks
                .Include(t => t.User)
                .Include(t => t.Customer)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.DueDate,
                    Completed = t.Completed,
                    User = new { t.User.Username },
                    Customer = t.Customer != null ? new { t.Customer.Name } : null
                })
                .ToListAsync();

            return Ok(tasks);
        }
    }
}