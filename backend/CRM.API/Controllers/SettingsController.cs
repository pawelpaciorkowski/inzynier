using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<Dictionary<string, string>>> GetSettings()
        {
            var settings = await _context.Settings.ToListAsync();
            return settings.ToDictionary(s => s.Key, s => s.Value);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateSettings(Dictionary<string, string> newSettings)
        {
            foreach (var setting in newSettings)
            {
                var existingSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == setting.Key);
                if (existingSetting != null)
                {
                    existingSetting.Value = setting.Value;
                }
                else
                {
                    _context.Settings.Add(new Setting { Key = setting.Key, Value = setting.Value });
                }
            }
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}