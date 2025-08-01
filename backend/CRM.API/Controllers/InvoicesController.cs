using CRM.BusinessLogic.Services;
using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// ### DTOs (Data Transfer Objects) ###

// --- DTO dla listy faktur ---
// POPRAWKA: Dodajemy pole IsPaid i CustomerId
public class InvoiceListItemDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = null!;
    public DateTime IssuedAt { get; set; }
    public decimal TotalAmount { get; set; }
    public string CustomerName { get; set; } = null!;
    public int CustomerId { get; set; } // Dodajemy ID klienta
    public bool IsPaid { get; set; } // To pole było potrzebne dla listy
}

// --- DTO dla pojedynczej pozycji na fakturze ---
public class InvoiceItemDto
{
    public int Id { get; set; }
    public int ServiceId { get; set; }
    public string Description { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal NetAmount { get; set; }
    public decimal GrossAmount { get; set; }
}

// --- DTO dla szczegółów faktury ---
// POPRAWKA: Dodajemy brakujące pola
public class InvoiceDetailDto : InvoiceListItemDto
{
    public DateTime DueDate { get; set; } // Termin płatności
    public decimal NetAmount { get; set; } // Kwota Netto
    public decimal TaxAmount { get; set; } // Kwota Podatku
    public ICollection<InvoiceItemDto> Items { get; set; } = new List<InvoiceItemDto>();
}

// Klasa DTO dla tworzenia nowej faktury
public class CreateInvoiceDto
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public List<CreateInvoiceItemDto> Items { get; set; } = new List<CreateInvoiceItemDto>();
}

public class CreateInvoiceItemDto
{
    public int ServiceId { get; set; }
    public int Quantity { get; set; }
}


// ### KONTROLER ###

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly InvoicePdfService _invoicePdfService;

    public InvoicesController(ApplicationDbContext context, InvoicePdfService invoicePdfService)
    {
        _context = context;
        _invoicePdfService = invoicePdfService;
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GetInvoicePdf(int id)
    {
        try
        {
            var pdfBytes = await _invoicePdfService.GenerateInvoicePdfAsync(id);
            return File(pdfBytes, "application/pdf", $"invoice_{id}.pdf");
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    // --- Pobieranie listy wszystkich faktur ---
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceListItemDto>>> GetInvoices()
    {
        var invoices = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items) // Dodajemy Items aby móc obliczyć TotalAmount
            .OrderByDescending(i => i.IssuedAt)
            .Select(i => new InvoiceListItemDto
            {
                Id = i.Id,
                InvoiceNumber = i.Number,
                IssuedAt = i.IssuedAt,
                TotalAmount = i.Items.Sum(item => item.GrossAmount), // Obliczamy jako sumę pozycji
                CustomerName = i.Customer != null ? i.Customer.Name : "Brak klienta",
                IsPaid = i.IsPaid
            })
            .ToListAsync();

        return Ok(invoices);
    }

    // --- Pobieranie szczegółów pojedynczej faktury ---
    // POPRAWKA: Poprawna i jedyna wersja tej metody
    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDetailDto>> GetInvoice(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
            .Where(i => i.Id == id)
            .Select(i => new InvoiceDetailDto
            {
                // Podstawowe dane
                Id = i.Id,
                InvoiceNumber = i.Number,
                IssuedAt = i.IssuedAt,
                DueDate = i.DueDate,   // Teraz to pole istnieje w DTO
                IsPaid = i.IsPaid,     // Teraz to pole istnieje w DTO
                CustomerName = i.Customer != null ? i.Customer.Name : "Brak klienta",
                CustomerId = i.CustomerId, // Dodajemy ID klienta

                // Obliczane sumy
                TotalAmount = i.Items.Sum(item => item.GrossAmount),
                NetAmount = i.Items.Sum(item => item.NetAmount),
                TaxAmount = i.Items.Sum(item => item.TaxAmount),

                // Lista pozycji
                Items = i.Items.Select(item => new InvoiceItemDto
                {
                    Id = item.Id,
                    ServiceId = item.ServiceId,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    NetAmount = item.NetAmount,
                    GrossAmount = item.GrossAmount
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (invoice == null)
        {
            return NotFound();
        }

        return Ok(invoice);
    }

    // --- Tworzenie nowej faktury ---
    [HttpPost]
    public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceDto dto)
    {
        if (dto.Items == null || !dto.Items.Any())
        {
            return BadRequest("Faktura musi zawierać co najmniej jedną pozycję.");
        }

        var newInvoice = new Invoice
        {
            Number = dto.InvoiceNumber,
            CustomerId = dto.CustomerId,
            IssuedAt = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(14),
            TotalAmount = 0
        };

        decimal total = 0;
        decimal totalNet = 0;
        decimal totalTax = 0;

        foreach (var itemDto in dto.Items)
        {
            var service = await _context.Services.FindAsync(itemDto.ServiceId);
            if (service == null)
            {
                return BadRequest($"Usługa o ID {itemDto.ServiceId} nie istnieje.");
            }

            var invoiceItem = new InvoiceItem
            {
                Invoice = newInvoice,
                ServiceId = service.Id,
                Description = service.Name,
                Quantity = itemDto.Quantity,
                UnitPrice = service.Price,
                // Przykładowe obliczenia, dostosuj jeśli masz inną logikę
                NetAmount = service.Price * itemDto.Quantity,
                TaxAmount = (service.Price * itemDto.Quantity) * 0.23m, // Założony VAT 23%
                GrossAmount = (service.Price * itemDto.Quantity) * 1.23m
            };

            newInvoice.Items.Add(invoiceItem);
            total += invoiceItem.GrossAmount;
            totalNet += invoiceItem.NetAmount;
            totalTax += invoiceItem.TaxAmount;
        }

        newInvoice.TotalAmount = total;
        // Zapisujemy też sumy do głównego obiektu, jeśli masz takie pola w modelu Invoice
        // newInvoice.NetAmount = totalNet;
        // newInvoice.TaxAmount = totalTax;

        _context.Invoices.Add(newInvoice);
        await _context.SaveChangesAsync();

        // Zwracamy nowo utworzony obiekt, który zostanie przetworzony przez GetInvoice
        return CreatedAtAction(nameof(GetInvoice), new { id = newInvoice.Id }, null);
    }

    // --- Aktualizacja istniejącej faktury ---
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateInvoice(int id, [FromBody] CreateInvoiceDto dto)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            return NotFound();
        }

        // Aktualizacja podstawowych danych faktury
        invoice.Number = dto.InvoiceNumber;
        invoice.CustomerId = dto.CustomerId;
        // Możesz dodać inne pola do aktualizacji, np. DueDate

        // Usunięcie starych pozycji
        _context.InvoiceItems.RemoveRange(invoice.Items);

        // Dodanie nowych pozycji
        decimal total = 0;
        foreach (var itemDto in dto.Items)
        {
            var service = await _context.Services.FindAsync(itemDto.ServiceId);
            if (service == null)
            {
                return BadRequest($"Usługa o ID {itemDto.ServiceId} nie istnieje.");
            }

            var invoiceItem = new InvoiceItem
            {
                Invoice = invoice,
                ServiceId = service.Id,
                Description = service.Name,
                Quantity = itemDto.Quantity,
                UnitPrice = service.Price,
                NetAmount = service.Price * itemDto.Quantity,
                TaxAmount = (service.Price * itemDto.Quantity) * 0.23m, // Założony VAT 23%
                GrossAmount = (service.Price * itemDto.Quantity) * 1.23m
            };
            invoice.Items.Add(invoiceItem);
            total += invoiceItem.GrossAmount;
        }

        invoice.TotalAmount = total;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Invoices.Any(e => e.Id == id))
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

    // --- Usuwanie faktury ---
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvoice(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Items) // Dołączamy pozycje, aby zostały usunięte kaskadowo
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            return NotFound();
        }

        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}