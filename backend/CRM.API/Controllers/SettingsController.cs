using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Dostęp tylko dla admina
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/settings
        [HttpGet]
        public async Task<ActionResult<Dictionary<string, string>>> GetSettings()
        {
            var settings = await _context.Settings.ToListAsync();
            return settings.ToDictionary(s => s.Key, s => s.Value);
        }

        // POST: api/settings
        [HttpPost]
        public async Task<IActionResult> UpdateSettings(Dictionary<string, string> newSettings)
        {
            foreach (var setting in newSettings)
            {
                var existingSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == setting.Key);
                if (existingSetting != null)
                {
                    existingSetting.Value = setting.Value; // Aktualizuj istniejący
                }
                else
                {
                    // Dodaj nowy, jeśli nie istnieje
                    _context.Settings.Add(new Setting { Key = setting.Key, Value = setting.Value });
                }
            }
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}