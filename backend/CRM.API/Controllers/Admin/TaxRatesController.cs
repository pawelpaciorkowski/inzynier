using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;

namespace CRM.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class TaxRatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TaxRatesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaxRate>>> GetTaxRates()
        {
            return await _context.TaxRates.OrderBy(tr => tr.Rate).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaxRate>> GetTaxRate(int id)
        {
            var taxRate = await _context.TaxRates.FindAsync(id);

            if (taxRate == null)
            {
                return NotFound();
            }

            return taxRate;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTaxRate(int id, TaxRate taxRate)
        {
            if (id != taxRate.Id)
            {
                return BadRequest();
            }

            _context.Entry(taxRate).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaxRateExists(id))
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

        [HttpPost]
        public async Task<ActionResult<TaxRate>> PostTaxRate(TaxRate taxRate)
        {
            if (await _context.TaxRates.AnyAsync(tr => tr.Rate == taxRate.Rate))
            {
                return Conflict(new { message = $"Stawka podatkowa o wartości {taxRate.Rate} już istnieje." });
            }

            _context.TaxRates.Add(taxRate);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTaxRate", new { id = taxRate.Id }, taxRate);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTaxRate(int id)
        {
            var taxRate = await _context.TaxRates.FindAsync(id);
            if (taxRate == null)
            {
                return NotFound();
            }

            _context.TaxRates.Remove(taxRate);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TaxRateExists(int id)
        {
            return _context.TaxRates.Any(e => e.Id == id);
        }
    }
}