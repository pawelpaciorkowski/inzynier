using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.API.Controllers
{
    // DTOs
    public class PaymentDto
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public string InvoiceNumber { get; set; } = null!;
        public DateTime PaidAt { get; set; }
        public decimal Amount { get; set; }
    }

    public class CreatePaymentDto
    {
        public int InvoiceId { get; set; }
        public DateTime PaidAt { get; set; }
        public decimal Amount { get; set; }
    }

    public class UpdatePaymentDto
    {
        public int InvoiceId { get; set; }
        public DateTime PaidAt { get; set; }
        public decimal Amount { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Payments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Invoice)
                .Select(p => new PaymentDto
                {
                    Id = p.Id,
                    InvoiceId = p.InvoiceId,
                    InvoiceNumber = p.Invoice != null ? p.Invoice.Number : "Brak faktury",
                    PaidAt = p.PaidAt,
                    Amount = p.Amount
                })
                .ToListAsync();
            return Ok(payments);
        }

        // GET: api/Payments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentDto>> GetPayment(int id)
        {
            var payment = await _context.Payments
                .Include(p => p.Invoice)
                .Where(p => p.Id == id)
                .Select(p => new PaymentDto
                {
                    Id = p.Id,
                    InvoiceId = p.InvoiceId,
                    InvoiceNumber = p.Invoice != null ? p.Invoice.Number : "Brak faktury",
                    PaidAt = p.PaidAt,
                    Amount = p.Amount
                })
                .FirstOrDefaultAsync();

            if (payment == null)
            {
                return NotFound();
            }

            return Ok(payment);
        }

        // POST: api/Payments
        [HttpPost]
        public async Task<ActionResult<PaymentDto>> CreatePayment(CreatePaymentDto createPaymentDto)
        {
            var payment = new Payment
            {
                InvoiceId = createPaymentDto.InvoiceId,
                PaidAt = createPaymentDto.PaidAt,
                Amount = createPaymentDto.Amount
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Update invoice IsPaid status if total amount is paid
            var invoice = await _context.Invoices.Include(i => i.Payments).FirstOrDefaultAsync(i => i.Id == payment.InvoiceId);
            if (invoice != null)
            {
                var totalPaid = invoice.Payments.Sum(p => p.Amount);
                if (totalPaid >= invoice.TotalAmount)
                {
                    invoice.IsPaid = true;
                    await _context.SaveChangesAsync();
                }
            }

            var paymentDto = new PaymentDto
            {
                Id = payment.Id,
                InvoiceId = payment.InvoiceId,
                InvoiceNumber = invoice != null ? invoice.Number : "Brak faktury",
                PaidAt = payment.PaidAt,
                Amount = payment.Amount
            };

            return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, paymentDto);
        }

        // PUT: api/Payments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePayment(int id, UpdatePaymentDto updatePaymentDto)
        {
            var payment = await _context.Payments.FindAsync(id);

            if (payment == null)
            {
                return NotFound();
            }

            payment.InvoiceId = updatePaymentDto.InvoiceId;
            payment.PaidAt = updatePaymentDto.PaidAt;
            payment.Amount = updatePaymentDto.Amount;

            try
            {
                await _context.SaveChangesAsync();

                // Update invoice IsPaid status
                var invoice = await _context.Invoices.Include(i => i.Payments).FirstOrDefaultAsync(i => i.Id == payment.InvoiceId);
                if (invoice != null)
                {
                    var totalPaid = invoice.Payments.Sum(p => p.Amount);
                    invoice.IsPaid = totalPaid >= invoice.TotalAmount;
                    await _context.SaveChangesAsync();
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PaymentExists(id))
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

        // DELETE: api/Payments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null)
            {
                return NotFound();
            }

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();

            // Update invoice IsPaid status after payment deletion
            var invoice = await _context.Invoices.Include(i => i.Payments).FirstOrDefaultAsync(i => i.Id == payment.InvoiceId);
            if (invoice != null)
            {
                var totalPaid = invoice.Payments.Sum(p => p.Amount);
                invoice.IsPaid = totalPaid >= invoice.TotalAmount;
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }

        private bool PaymentExists(int id)
        {
            return _context.Payments.Any(e => e.Id == id);
        }
    }
}
