using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using CRM.BusinessLogic.Services;
using System;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ICsvExportService _csvExportService;
        private readonly InvoicePdfService _invoicePdfService;

        public ReportsController(ApplicationDbContext context, ICsvExportService csvExportService, InvoicePdfService invoicePdfService)
        {
            _context = context;
            _csvExportService = csvExportService;
            _invoicePdfService = invoicePdfService;
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

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpGet("export-customers")]
        public async Task<IActionResult> ExportCustomers()
        {
            var customers = await _context.Customers.ToListAsync();
            var csvBytes = _csvExportService.ExportCustomersToCsv(customers);
            return File(csvBytes, "text/csv", "customers.csv");
        }

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpGet("export-notes")]
        public async Task<IActionResult> ExportNotes()
        {
            var notes = await _context.Notes.ToListAsync();
            var csvBytes = _csvExportService.ExportNotesToCsv(notes);
            return File(csvBytes, "text/csv", "notes.csv");
        }

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpGet("export-invoices")]
        public async Task<IActionResult> ExportInvoices()
        {
            var invoices = await _context.Invoices.ToListAsync();
            var csvBytes = _csvExportService.ExportInvoicesToCsv(invoices);
            return File(csvBytes, "text/csv", "invoices.csv");
        }

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpGet("export-payments")]
        public async Task<IActionResult> ExportPayments()
        {
            var payments = await _context.Payments.ToListAsync();
            var csvBytes = _csvExportService.ExportPaymentsToCsv(payments);
            return File(csvBytes, "text/csv", "payments.csv");
        }

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpGet("export-contracts")]
        public async Task<IActionResult> ExportContracts()
        {
            var contracts = await _context.Contracts.ToListAsync();
            var csvBytes = _csvExportService.ExportContractsToCsv(contracts);
            return File(csvBytes, "text/csv", "contracts.csv");
        }

        [HttpGet("sales-by-customer")]
        public async Task<IActionResult> GetSalesByCustomerReport()
        {
            var salesData = await _context.Customers
                .GroupJoin(
                    _context.Invoices,
                    customer => customer.Id,
                    invoice => invoice.CustomerId,
                    (customer, invoices) => new
                    {
                        CustomerName = customer.Name,
                        TotalAmount = invoices.Sum(i => (decimal?)i.TotalAmount) ?? 0m
                    }
                )
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

        [HttpGet("sales")]
        public async Task<IActionResult> GetSalesReport()
        {
            var salesData = await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.AssignedGroup)
                .Include(i => i.CreatedByUser)
                .Include(i => i.InvoiceTags)
                    .ThenInclude(it => it.Tag)
                .Select(i => new
                {
                    i.Id,
                    i.Number,
                    i.TotalAmount,
                    i.IsPaid,
                    i.IssuedAt,
                    i.DueDate,
                    CustomerName = i.Customer.Name,
                    GroupName = i.AssignedGroup.Name,
                    CreatedBy = i.CreatedByUser.Username,
                    Tags = i.InvoiceTags.Select(it => it.Tag.Name).ToList()
                })
                .ToListAsync();

            return Ok(salesData);
        }

        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomersReport()
        {
            var customersData = await _context.Customers
                .Include(c => c.AssignedGroup)
                .Include(c => c.AssignedUser)
                .Include(c => c.CustomerTags)
                    .ThenInclude(ct => ct.Tag)
                .Include(c => c.Contracts)
                .Include(c => c.Invoices)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Email,
                    c.Company,
                    c.CreatedAt,
                    GroupName = c.AssignedGroup.Name,
                    AssignedUser = c.AssignedUser.Username,
                    Tags = c.CustomerTags.Select(ct => ct.Tag.Name).ToList(),
                    ContractCount = c.Contracts.Count,
                    InvoiceCount = c.Invoices.Count,
                    TotalInvoiceValue = c.Invoices.Sum(i => i.TotalAmount),
                    PaidInvoiceValue = c.Invoices.Where(i => i.IsPaid).Sum(i => i.TotalAmount)
                })
                .ToListAsync();

            return Ok(customersData);
        }

        [HttpGet("tasks")]
        public async Task<IActionResult> GetTasksReport()
        {
            var tasksData = await _context.Tasks
                .Include(t => t.User)
                .Include(t => t.Customer)
                .Include(t => t.AssignedGroup)
                .Include(t => t.TaskTags)
                    .ThenInclude(tt => tt.Tag)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.DueDate,
                    t.Completed,
                    AssignedUser = t.User.Username,
                    CustomerName = t.Customer.Name,
                    GroupName = t.AssignedGroup.Name,
                    Tags = t.TaskTags.Select(tt => tt.Tag.Name).ToList()
                })
                .ToListAsync();

            return Ok(tasksData);
        }

        // ✅ NOWE RAPORTY Z FILTROWANIEM PO GRUPACH

        [HttpGet("groups/{groupId}/sales")]
        public async Task<IActionResult> GetGroupSalesReport(int groupId)
        {
            var salesData = await _context.Invoices
                .Where(i => i.AssignedGroupId == groupId || i.Customer.AssignedGroupId == groupId) // Sprawdza grupę faktury LUB grupę klienta
                .Include(i => i.Customer)
                .Include(i => i.CreatedByUser)
                .Include(i => i.InvoiceTags)
                    .ThenInclude(it => it.Tag)
                .Select(i => new
                {
                    i.Id,
                    i.Number,
                    i.TotalAmount,
                    i.IsPaid,
                    i.IssuedAt,
                    i.DueDate,
                    CustomerName = i.Customer != null ? i.Customer.Name : "Brak klienta",
                    CustomerEmail = i.Customer != null ? i.Customer.Email : "",
                    CreatedBy = i.CreatedByUser != null ? i.CreatedByUser.Username : "Brak użytkownika",
                    Tags = i.InvoiceTags.Select(it => it.Tag.Name).ToList()
                })
                .ToListAsync();

            var summary = new
            {
                TotalInvoices = salesData.Count,
                TotalAmount = salesData.Sum(i => i.TotalAmount),
                PaidAmount = salesData.Where(i => i.IsPaid).Sum(i => i.TotalAmount),
                UnpaidAmount = salesData.Where(i => !i.IsPaid).Sum(i => i.TotalAmount),
                PaidCount = salesData.Count(i => i.IsPaid),
                UnpaidCount = salesData.Count(i => !i.IsPaid)
            };

            return Ok(new { summary, invoices = salesData });
        }

        [HttpGet("groups/{groupId}/customers")]
        public async Task<IActionResult> GetGroupCustomersReport(int groupId)
        {
            var customersData = await _context.Customers
                .Where(c => c.AssignedGroupId == groupId)
                .Include(c => c.AssignedUser)
                .Include(c => c.CustomerTags)
                    .ThenInclude(ct => ct.Tag)
                .Include(c => c.Contracts)
                .Include(c => c.Invoices)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Email,
                    c.Company,
                    c.CreatedAt,
                    c.Phone,
                    AssignedUser = c.AssignedUser != null ? c.AssignedUser.Username : "Brak użytkownika",
                    Tags = c.CustomerTags.Select(ct => ct.Tag.Name).ToList(),
                    ContractCount = c.Contracts.Count,
                    InvoiceCount = c.Invoices.Count,
                    TotalInvoiceValue = c.Invoices.Sum(i => i.TotalAmount),
                    PaidInvoiceValue = c.Invoices.Where(i => i.IsPaid).Sum(i => i.TotalAmount)
                })
                .ToListAsync();

            var summary = new
            {
                TotalCustomers = customersData.Count,
                TotalContracts = customersData.Sum(c => c.ContractCount),
                TotalInvoices = customersData.Sum(c => c.InvoiceCount),
                TotalInvoiceValue = customersData.Sum(c => c.TotalInvoiceValue),
                TotalPaidValue = customersData.Sum(c => c.PaidInvoiceValue)
            };

            return Ok(new { summary, customers = customersData });
        }

        [HttpGet("groups/{groupId}/tasks")]
        public async Task<IActionResult> GetGroupTasksReport(int groupId)
        {
            var tasksData = await _context.Tasks
                .Where(t => t.AssignedGroupId == groupId || t.Customer.AssignedGroupId == groupId) // Sprawdza grupę zadania LUB grupę klienta
                .Include(t => t.User)
                .Include(t => t.Customer)
                .Include(t => t.TaskTags)
                    .ThenInclude(tt => tt.Tag)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.DueDate,
                    t.Completed,
                    AssignedUser = t.User != null ? t.User.Username : "Brak użytkownika",
                    CustomerName = t.Customer != null ? t.Customer.Name : "Brak klienta",
                    Tags = t.TaskTags.Select(tt => tt.Tag.Name).ToList()
                })
                .ToListAsync();

            var summary = new
            {
                TotalTasks = tasksData.Count,
                CompletedTasks = tasksData.Count(t => t.Completed),
                PendingTasks = tasksData.Count(t => !t.Completed),
                CompletionRate = tasksData.Count > 0 ? (double)tasksData.Count(t => t.Completed) / tasksData.Count * 100 : 0
            };

            return Ok(new { summary, tasks = tasksData });
        }

        [HttpGet("groups/{groupId}/pdf")]
        public async Task<IActionResult> GetGroupReportPdf(int groupId)
        {
            var group = await _context.Groups.FindAsync(groupId);
            if (group == null) return NotFound("Grupa nie znaleziona.");

            // Pobieramy wszystkie dane raportu dla grupy
            var customersData = await _context.Customers
                .Where(c => c.AssignedGroupId == groupId)
                .Include(c => c.AssignedUser)
                .Include(c => c.CustomerTags)
                    .ThenInclude(ct => ct.Tag)
                .Include(c => c.Contracts)
                .Include(c => c.Invoices)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Email,
                    c.Company,
                    c.CreatedAt,
                    c.Phone,
                    AssignedUser = c.AssignedUser != null ? c.AssignedUser.Username : "Brak użytkownika",
                    Tags = c.CustomerTags.Select(ct => ct.Tag.Name).ToList(),
                    ContractCount = c.Contracts.Count,
                    InvoiceCount = c.Invoices.Count,
                    TotalInvoiceValue = c.Invoices.Sum(i => i.TotalAmount),
                    PaidInvoiceValue = c.Invoices.Where(i => i.IsPaid).Sum(i => i.TotalAmount)
                })
                .ToListAsync();

            var salesData = await _context.Invoices
                .Where(i => i.AssignedGroupId == groupId || i.Customer.AssignedGroupId == groupId)
                .Include(i => i.Customer)
                .Include(i => i.CreatedByUser)
                .Include(i => i.InvoiceTags)
                    .ThenInclude(it => it.Tag)
                .Select(i => new
                {
                    i.Id,
                    i.Number,
                    i.TotalAmount,
                    i.IsPaid,
                    i.IssuedAt,
                    i.DueDate,
                    CustomerName = i.Customer != null ? i.Customer.Name : "Brak klienta",
                    CustomerEmail = i.Customer != null ? i.Customer.Email : "",
                    CreatedBy = i.CreatedByUser != null ? i.CreatedByUser.Username : "Brak użytkownika",
                    Tags = i.InvoiceTags.Select(it => it.Tag.Name).ToList()
                })
                .ToListAsync();

            var tasksData = await _context.Tasks
                .Where(t => t.AssignedGroupId == groupId || t.Customer.AssignedGroupId == groupId)
                .Include(t => t.User)
                .Include(t => t.Customer)
                .Include(t => t.TaskTags)
                    .ThenInclude(tt => tt.Tag)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.DueDate,
                    t.Completed,
                    AssignedUser = t.User != null ? t.User.Username : "Brak użytkownika",
                    CustomerName = t.Customer != null ? t.Customer.Name : "Brak klienta",
                    Tags = t.TaskTags.Select(tt => tt.Tag.Name).ToList()
                })
                .ToListAsync();

            var reportSummary = new GroupReportSummaryPdfDto
            {
                TotalCustomers = customersData.Count,
                TotalInvoicesSales = salesData.Count,
                TotalAmount = salesData.Sum(i => i.TotalAmount),
                TotalTasks = tasksData.Count,
                PaidAmount = salesData.Where(i => i.IsPaid).Sum(i => i.TotalAmount),
                UnpaidAmount = salesData.Where(i => !i.IsPaid).Sum(i => i.TotalAmount),
                PaidCount = salesData.Count(i => i.IsPaid),
                UnpaidCount = salesData.Count(i => !i.IsPaid),
                CompletedTasks = tasksData.Count(t => t.Completed),
                PendingTasks = tasksData.Count(t => !t.Completed),
                CompletionRate = tasksData.Count > 0 ? (double)tasksData.Count(t => t.Completed) / tasksData.Count * 100 : 0,
                TotalContracts = customersData.Sum(c => c.ContractCount),
                TotalInvoiceValue = customersData.Sum(c => c.TotalInvoiceValue),
                TotalPaidValue = customersData.Sum(c => c.PaidInvoiceValue)
            };

            var fullReportData = new FullGroupReportPdfDto
            {
                Summary = reportSummary,
                Customers = customersData.Select(c => new GroupReportCustomerPdfDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Email = c.Email,
                    Company = c.Company,
                    CreatedAt = c.CreatedAt,
                    Phone = c.Phone,
                    AssignedUser = c.AssignedUser,
                    Tags = c.Tags,
                    ContractCount = c.ContractCount,
                    InvoiceCount = c.InvoiceCount,
                    TotalInvoiceValue = c.TotalInvoiceValue,
                    PaidInvoiceValue = c.PaidInvoiceValue
                }).ToList(),
                Invoices = salesData.Select(i => new GroupReportInvoicePdfDto
                {
                    Id = i.Id,
                    Number = i.Number,
                    TotalAmount = i.TotalAmount,
                    IsPaid = i.IsPaid,
                    IssuedAt = i.IssuedAt,
                    DueDate = i.DueDate,
                    CustomerName = i.CustomerName,
                    CustomerEmail = i.CustomerEmail,
                    CreatedBy = i.CreatedBy,
                    Tags = i.Tags
                }).ToList(),
                Tasks = tasksData.Select(t => new GroupReportTaskPdfDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    DueDate = t.DueDate,
                    Completed = t.Completed,
                    AssignedUser = t.AssignedUser,
                    CustomerName = t.CustomerName,
                    Tags = t.Tags
                }).ToList()
            };

            var pdfBytes = await _invoicePdfService.GenerateGroupReportPdfAsync(group.Name, fullReportData);
            return File(pdfBytes, "application/pdf", $"raport_grupy_{group.Name.Replace(" ", "_")}.pdf");
        }

        // ✅ NOWE RAPORTY Z FILTROWANIEM PO TAGACH

        [HttpGet("tags/{tagId}/customers")]
        public async Task<IActionResult> GetCustomersByTag(int tagId)
        {
            var customersData = await _context.Customers
                .Where(c => c.CustomerTags.Any(ct => ct.TagId == tagId))
                .Include(c => c.AssignedGroup)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Email,
                    GroupName = c.AssignedGroup != null ? c.AssignedGroup.Name : null
                })
                .ToListAsync();

            return Ok(customersData);
        }

        [HttpGet("tags/{tagId}/invoices")]
        public async Task<IActionResult> GetInvoicesByTag(int tagId)
        {
            var invoicesData = await _context.Invoices
                .Where(i => i.InvoiceTags.Any(it => it.TagId == tagId) || i.Customer.CustomerTags.Any(ct => ct.TagId == tagId))
                .Include(i => i.Customer)
                .Select(i => new
                {
                    i.Id,
                    i.Number,
                    i.TotalAmount,
                    i.IsPaid,
                    CustomerName = i.Customer.Name
                })
                .ToListAsync();

            return Ok(invoicesData);
        }

        [HttpGet("tags/{tagId}/tasks")]
        public async Task<IActionResult> GetTasksByTag(int tagId)
        {
            var tasksData = await _context.Tasks
                .Where(t => t.TaskTags.Any(tt => tt.TagId == tagId) || t.Customer.CustomerTags.Any(ct => ct.TagId == tagId))
                .Include(t => t.Customer)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Completed,
                    CustomerName = t.Customer.Name
                })
                .ToListAsync();

            return Ok(tasksData);
        }

        [HttpGet("tags/{tagId}/contracts")]
        public async Task<IActionResult> GetContractsByTag(int tagId)
        {
            var contractsData = await _context.Contracts
                .Where(c => c.ContractTags.Any(ct => ct.TagId == tagId) || c.Customer.CustomerTags.Any(ct => ct.TagId == tagId))
                .Include(c => c.Customer)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.ContractNumber,
                    CustomerName = c.Customer.Name
                })
                .ToListAsync();

            return Ok(contractsData);
        }

        [HttpGet("tags/{tagId}/meetings")]
        public async Task<IActionResult> GetMeetingsByTag(int tagId)
        {
            var meetingsData = await _context.Meetings
                .Where(m => m.MeetingTags.Any(mt => mt.TagId == tagId))
                .Include(m => m.Customer)
                .Select(m => new
                {
                    m.Id,
                    m.Topic,
                    m.ScheduledAt,
                    CustomerName = m.Customer.Name
                })
                .ToListAsync();

            return Ok(meetingsData);
        }

        // ✅ RAPORTY OGÓLNE Z FILTROWANIEM

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardData()
        {
            var totalCustomers = await _context.Customers.CountAsync();
            var totalInvoices = await _context.Invoices.CountAsync();
            var totalTasks = await _context.Tasks.CountAsync();
            var totalContracts = await _context.Contracts.CountAsync();
            var totalMeetings = await _context.Meetings.CountAsync();

            var totalInvoiceValue = await _context.Invoices.SumAsync(i => i.TotalAmount);
            var paidInvoiceValue = await _context.Invoices.Where(i => i.IsPaid).SumAsync(i => i.TotalAmount);
            var unpaidInvoiceValue = totalInvoiceValue - paidInvoiceValue;

            var completedTasks = await _context.Tasks.CountAsync(t => t.Completed);
            var pendingTasks = totalTasks - completedTasks;

            var upcomingMeetings = await _context.Meetings.CountAsync(m => m.ScheduledAt > DateTime.Now);

            var topGroups = await _context.Groups
                .Select(g => new
                {
                    g.Id,
                    g.Name,
                    CustomerCount = g.AssignedCustomers.Count,
                    InvoiceCount = g.AssignedInvoices.Count,
                    TaskCount = g.AssignedTasks.Count,
                    ContractCount = g.ResponsibleContracts.Count
                })
                .OrderByDescending(g => g.CustomerCount + g.InvoiceCount + g.TaskCount + g.ContractCount)
                .Take(5)
                .ToListAsync();

            var topTags = await _context.Tags
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Color,
                    TotalUsage = t.CustomerTags.Count + t.ContractTags.Count + t.InvoiceTags.Count + t.TaskTags.Count + t.MeetingTags.Count
                })
                .OrderByDescending(t => t.TotalUsage)
                .Take(10)
                .ToListAsync();

            return Ok(new
            {
                summary = new
                {
                    totalCustomers,
                    totalInvoices,
                    totalTasks,
                    totalContracts,
                    totalMeetings,
                    totalInvoiceValue,
                    paidInvoiceValue,
                    unpaidInvoiceValue,
                    completedTasks,
                    pendingTasks,
                    upcomingMeetings
                },
                topGroups,
                topTags
            });
        }
    }
}