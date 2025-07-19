// Plik: backend/CRM.API/Controllers/ActivitiesController.cs
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
    [Authorize]
    public class ActivitiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ActivitiesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetActivities()
        {
            var activities = await _context.Activities
                .Include(a => a.User)
                .Include(a => a.Customer)
                .OrderByDescending(a => a.CreatedAt)
                .Take(50) // Ogranicz do ostatnich 50 aktywności
                .Select(a => new
                {
                    a.Id,
                    a.Note,
                    a.CreatedAt,
                    UserName = a.User != null ? a.User.Username : "Nieznany użytkownik",
                    CustomerName = a.Customer != null ? a.Customer.Name : "Nieznany klient"
                })
                .ToListAsync();

            return Ok(activities);
        }
    }
}