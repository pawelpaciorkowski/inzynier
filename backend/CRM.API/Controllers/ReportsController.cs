// Plik: backend/CRM.API/Controllers/ReportsController.cs
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
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("customer-growth")]
        public async Task<IActionResult> GetCustomerGrowthReport()
        {
            // Krok 1: Pobierz surowe dane z bazy
            var rawData = await _context.Customers
                .GroupBy(c => new { c.CreatedAt.Year, c.CreatedAt.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    Count = g.Count()
                })
                .ToListAsync();

            // Krok 2: Sformatuj dane w aplikacji (po stronie serwera C#)
            var reportData = rawData
                .Select(r => new
                {
                    Month = $"{r.Year}-{r.Month.ToString("00")}",
                    r.Count
                })
                .OrderBy(r => r.Month)
                .ToList();

            return Ok(reportData);
        }
    }
}