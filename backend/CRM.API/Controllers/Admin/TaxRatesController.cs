using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;

namespace CRM.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Zabezpieczenie: tylko dla Admina
    public class TaxRatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TaxRatesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/taxrates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaxRate>>> GetTaxRates()
        {
            return await _context.TaxRates.OrderBy(tr => tr.Rate).ToListAsync();
        }

        // GET: api/admin/taxrates/5
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

        // PUT: api/admin/taxrates/5
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

        // POST: api/admin/taxrates
        [HttpPost]
        public async Task<ActionResult<TaxRate>> PostTaxRate(TaxRate taxRate)
        {
            // Prosta walidacja, aby uniknąć duplikatów
            if (await _context.TaxRates.AnyAsync(tr => tr.Rate == taxRate.Rate))
            {
                return Conflict(new { message = $"Stawka podatkowa o wartości {taxRate.Rate} już istnieje." });
            }

            _context.TaxRates.Add(taxRate);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTaxRate", new { id = taxRate.Id }, taxRate);
        }

        // DELETE: api/admin/taxrates/5
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