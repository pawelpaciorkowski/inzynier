using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

// DTO dla pojedynczej pozycji na liście faktur
public class InvoiceListItemDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = null!;
    public DateTime IssuedAt { get; set; }
    public decimal TotalAmount { get; set; }
    public string CustomerName { get; set; } = null!;
    // Możesz dodać tu status, jeśli go zaimplementujesz w modelu Invoice
}

// DTO dla pojedynczej pozycji na fakturze
public class InvoiceItemDto
{
    public int Id { get; set; }
    public string Description { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal NetAmount { get; set; }
    public decimal GrossAmount { get; set; }
}

// DTO dla szczegółów faktury
public class InvoiceDetailDto : InvoiceListItemDto
{
    public ICollection<InvoiceItemDto> Items { get; set; } = new List<InvoiceItemDto>();
}


[ApiController]
[Route("api/[controller]")]
[Authorize] // Kontroler dostępny tylko dla zalogowanych użytkowników
public class InvoicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InvoicesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/invoices
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceListItemDto>>> GetInvoices()
    {
        var invoices = await _context.Invoices
            .Include(i => i.Customer)
            .OrderByDescending(i => i.IssuedAt)
            .Select(i => new InvoiceListItemDto
            {
                Id = i.Id,
                InvoiceNumber = i.Number,
                IssuedAt = i.IssuedAt,
                TotalAmount = i.TotalAmount,
                CustomerName = i.Customer != null ? i.Customer.Name : "Brak klienta"
            })
            .ToListAsync();

        return Ok(invoices);
    }

    // GET: api/invoices/5
    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDetailDto>> GetInvoice(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)       // Dołączamy pozycje faktury
                .ThenInclude(item => item.Service) // Dołączamy dane o usłudze dla każdej pozycji
            .Where(i => i.Id == id)
            .Select(i => new InvoiceDetailDto
            {
                Id = i.Id,
                InvoiceNumber = i.Number,
                IssuedAt = i.IssuedAt,
                TotalAmount = i.TotalAmount,
                CustomerName = i.Customer != null ? i.Customer.Name : "Brak klienta",
                Items = i.Items.Select(item => new InvoiceItemDto
                {
                    Id = item.Id,
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

    // Wklej tę metodę wewnątrz klasy InvoicesController
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
            TotalAmount = 0 // Obliczymy ją poniżej
        };

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
                Invoice = newInvoice,
                ServiceId = service.Id,
                Description = service.Name,
                Quantity = itemDto.Quantity,
                UnitPrice = service.Price,
                // Na razie upraszczamy: Netto = Brutto. W przyszłości można dodać logikę podatkową.
                NetAmount = service.Price * itemDto.Quantity,
                TaxAmount = 0, // Uproszczenie
                GrossAmount = service.Price * itemDto.Quantity
            };

            // EF Core automatycznie doda `invoiceItem` do kontekstu, gdy dodamy `newInvoice`
            newInvoice.Items.Add(invoiceItem);
            total += invoiceItem.GrossAmount;
        }

        newInvoice.TotalAmount = total;

        _context.Invoices.Add(newInvoice);
        await _context.SaveChangesAsync();

        // Używamy GetInvoice, aby zwrócić pełne dane nowo utworzonej faktury
        return CreatedAtAction(nameof(GetInvoice), new { id = newInvoice.Id }, newInvoice);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvoice(int id)
    {
        // Znajdujemy fakturę wraz z jej pozycjami, aby usunąć je razem
        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            return NotFound();
        }

        // Usunięcie faktury spowoduje kaskadowe usunięcie powiązanych z nią pozycji (InvoiceItems)
        // dzięki poprawnie skonfigurowanym relacjom w EF Core.
        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();

        return NoContent(); // Standardowa odpowiedź dla pomyślnego usunięcia (204 No Content)
    }
}