using CRM.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using CRM.BusinessLogic.Services;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ICsvExportService _csvExportService;

        public ReportsController(ApplicationDbContext context, ICsvExportService csvExportService)
        {
            _context = context;
            _csvExportService = csvExportService;
        }

        [HttpGet("customer-growth")]
        public async Task<IActionResult> GetCustomerGrowthReport()
        {
            var rawData = await _context.Customers
                .GroupBy(c => new { c.CreatedAt.Year, c.CreatedAt.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    Count = g.Count()
                })
                .ToListAsync();

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

        [HttpGet("export-customers")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> ExportCustomers()
        {
            var customers = await _context.Customers.ToListAsync();
            var csvBytes = _csvExportService.ExportCustomersToCsv(customers);
            return File(csvBytes, "text/csv", "customers.csv");
        }

        [HttpGet("export-notes")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> ExportNotes()
        {
            var notes = await _context.Notes.ToListAsync();
            var csvBytes = _csvExportService.ExportNotesToCsv(notes);
            return File(csvBytes, "text/csv", "notes.csv");
        }

        [HttpGet("export-invoices")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> ExportInvoices()
        {
            var invoices = await _context.Invoices.ToListAsync();
            var csvBytes = _csvExportService.ExportInvoicesToCsv(invoices);
            return File(csvBytes, "text/csv", "invoices.csv");
        }

        [HttpGet("export-payments")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> ExportPayments()
        {
            var payments = await _context.Payments.ToListAsync();
            var csvBytes = _csvExportService.ExportPaymentsToCsv(payments);
            return File(csvBytes, "text/csv", "payments.csv");
        }

        [HttpGet("export-contracts")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> ExportContracts()
        {
            var contracts = await _context.Contracts.ToListAsync();
            var csvBytes = _csvExportService.ExportContractsToCsv(contracts);
            return File(csvBytes, "text/csv", "contracts.csv");
        }

        [HttpGet("sales-by-customer")]
        public async Task<IActionResult> GetSalesByCustomerReport()
        {
            var salesData = await _context.Invoices
                .Include(i => i.Customer)
                .GroupBy(i => i.Customer.Name)
                .Select(g => new
                {
                    CustomerName = g.Key,
                    TotalAmount = g.Sum(i => i.TotalAmount)
                })
                .OrderByDescending(x => x.TotalAmount)
                .ToListAsync();

            return Ok(salesData);
        }

        [HttpGet("invoice-status")]
        public async Task<IActionResult> GetInvoiceStatusReport()
        {
            var invoiceStatusData = await _context.Invoices
                .GroupBy(i => i.IsPaid)
                .Select(g => new
                {
                    Status = g.Key ? "Zapłacone" : "Niezapłacone",
                    Count = g.Count()
                })
                .ToListAsync();

            return Ok(invoiceStatusData);
        }
    }
}