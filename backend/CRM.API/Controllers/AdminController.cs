using CRM.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Dostęp tylko dla roli Admin
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("tasks")]
        public async Task<IActionResult> GetAllTasks()
        {
            var tasks = await _context.Tasks
                .Include(t => t.User)     // Dołącz dane użytkownika
                .Include(t => t.Customer) // Dołącz dane klienta
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.DueDate,
                    t.Completed,
                    User = new { t.User.Username }, // Przesyłamy tylko potrzebne dane
                    Customer = new { t.Customer.Name }
                })
                .ToListAsync();

            return Ok(tasks);
        }
    }
}