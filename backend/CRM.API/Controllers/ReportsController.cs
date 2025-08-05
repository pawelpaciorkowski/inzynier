using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM
using Microsoft.AspNetCore.Authorization; // Importuje funkcjonalności autoryzacji
using Microsoft.AspNetCore.Mvc; // Importuje podstawowe klasy kontrolerów MVC
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using System.Linq; // Importuje metody LINQ
using System.Threading.Tasks; // Importuje klasy do programowania asynchronicznego
using CRM.BusinessLogic.Services; // Importuje serwisy biznesowe CRM
using System; // Importuje podstawowe typy systemowe
using System.Collections.Generic; // Importuje kolekcje (List, IEnumerable)

namespace CRM.API.Controllers // Przestrzeń nazw dla kontrolerów API
{
    /// <summary>
    /// Kontroler do zarządzania raportami w systemie CRM
    /// Klasa obsługuje generowanie raportów sprzedaży, klientów, zadań oraz eksport danych do różnych formatów
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Reports)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class ReportsController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Serwis do eksportu danych do formatu CSV
        /// Obsługuje konwersję danych z bazy do formatów CSV, XLSX i PDF
        /// </summary>
        private readonly ICsvExportService _csvExportService; // Interfejs serwisu eksportu CSV

        /// <summary>
        /// Serwis do generowania dokumentów PDF
        /// Obsługuje tworzenie raportów PDF z danych CRM
        /// </summary>
        private readonly InvoicePdfService _invoicePdfService; // Serwis generowania PDF

        /// <summary>
        /// Konstruktor klasy ReportsController
        /// Inicjalizuje kontroler z kontekstem bazy danych i serwisami przekazanymi przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        /// <param name="csvExportService">Serwis eksportu CSV przekazany przez system dependency injection</param>
        /// <param name="invoicePdfService">Serwis generowania PDF przekazany przez system dependency injection</param>
        public ReportsController(ApplicationDbContext context, ICsvExportService csvExportService, InvoicePdfService invoicePdfService)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
            _csvExportService = csvExportService; // Przypisuje przekazany serwis CSV do pola prywatnego
            _invoicePdfService = invoicePdfService; // Przypisuje przekazany serwis PDF do pola prywatnego
        }

        /// <summary>
        /// Metoda HTTP GET - generuje raport wzrostu liczby klientów w czasie
        /// Endpoint: GET /api/Reports/customer-growth
        /// Analizuje przyrost klientów według miesięcy i lat
        /// </summary>
        /// <returns>Lista danych o wzroście liczby klientów w czasie</returns>
        [HttpGet("customer-growth")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce customer-growth
        public async Task<IActionResult> GetCustomerGrowthReport() // Metoda asynchroniczna zwracająca IActionResult
        {
            // Wykonuje zapytanie do bazy danych - grupuje klientów według roku i miesiąca utworzenia
            var rawData = await _context.Customers
                .GroupBy(c => new { c.CreatedAt.Year, c.CreatedAt.Month }) // Grupuje klientów według roku i miesiąca utworzenia
                .Select(g => new // Projektuje wyniki do anonimowego typu
                {
                    g.Key.Year, // Rok utworzenia klienta
                    g.Key.Month, // Miesiąc utworzenia klienta
                    Count = g.Count() // Liczba klientów w tej grupie (roku/miesiącu)
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników

            // Przetwarza surowe dane do formatu odpowiedniego dla raportu
            var reportData = rawData
                .Select(r => new // Projektuje dane do formatu raportu
                {
                    Month = $"{r.Year}-{r.Month.ToString("00")}", // Formatuje miesiąc jako "YYYY-MM" (np. "2024-01")
                    r.Count // Liczba klientów w tym miesiącu
                })
                .OrderBy(r => r.Month) // Sortuje według miesiąca (chronologicznie)
                .ToList(); // Konwertuje do listy

            return Ok(reportData); // Zwraca status HTTP 200 OK z danymi raportu
        }

        /// <summary>
        /// Metoda HTTP GET - eksportuje dane klientów do różnych formatów (CSV, XLSX, PDF)
        /// Endpoint: GET /api/Reports/export-customers
        /// Umożliwia eksport danych klientów z filtrowaniem i wyborem kolumn
        /// </summary>
        /// <param name="format">Format eksportu (csv, xlsx, pdf) - domyślnie csv</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (grupy, użytkownicy, tagi)</param>
        /// <param name="columns">Lista kolumn do eksportu (oddzielone przecinkami)</param>
        /// <param name="dateFrom">Data początkowa filtrowania (opcjonalna)</param>
        /// <param name="dateTo">Data końcowa filtrowania (opcjonalna)</param>
        /// <param name="groupId">ID grupy do filtrowania (opcjonalne)</param>
        /// <param name="tagId">ID tagu do filtrowania (opcjonalne)</param>
        /// <returns>Plik z danymi klientów w wybranym formacie</returns>
        [Authorize(Roles = "Admin,Manager,Sprzedawca")] // Wymaga roli Admin, Manager lub Sprzedawca
        [HttpGet("export-customers")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce export-customers
        public async Task<IActionResult> ExportCustomers( // Metoda asynchroniczna zwracająca IActionResult
            [FromQuery] string? format = "csv", // Parametr z query string - format eksportu
            [FromQuery] bool includeRelations = true, // Parametr z query string - czy dołączyć relacje
            [FromQuery] string? columns = null, // Parametr z query string - kolumny do eksportu
            [FromQuery] string? dateFrom = null, // Parametr z query string - data początkowa
            [FromQuery] string? dateTo = null, // Parametr z query string - data końcowa
            [FromQuery] int? groupId = null, // Parametr z query string - ID grupy
            [FromQuery] int? tagId = null) // Parametr z query string - ID tagu
        {
            // Tworzy podstawowe zapytanie do bazy danych dla klientów
            var query = _context.Customers.AsQueryable(); // Rozpoczyna zapytanie LINQ

            // Filtrowanie po dacie początkowej
            if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate)) // Sprawdza czy data jest podana i czy można ją sparsować
            {
                query = query.Where(c => c.CreatedAt >= fromDate); // Filtruje klientów utworzonych od podanej daty
            }
            
            // Filtrowanie po dacie końcowej
            if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate)) // Sprawdza czy data jest podana i czy można ją sparsować
            {
                query = query.Where(c => c.CreatedAt <= toDate); // Filtruje klientów utworzonych do podanej daty
            }

            // Filtrowanie po grupie
            if (groupId.HasValue) // Sprawdza czy ID grupy zostało podane
            {
                query = query.Where(c => c.AssignedGroupId == groupId); // Filtruje klientów przypisanych do podanej grupy
            }

            // Filtrowanie po tagu
            if (tagId.HasValue) // Sprawdza czy ID tagu zostało podane
            {
                query = query.Where(c => c.CustomerTags.Any(ct => ct.TagId == tagId)); // Filtruje klientów mających podany tag
            }

            // Dołączanie relacji jeśli zostało żądane
            if (includeRelations) // Sprawdza czy użytkownik chce dołączyć powiązane dane
            {
                query = query
                    .Include(c => c.AssignedGroup) // Dołącza dane przypisanej grupy
                    .Include(c => c.AssignedUser) // Dołącza dane przypisanego użytkownika
                    .Include(c => c.CustomerTags) // Dołącza tagi klienta
                        .ThenInclude(ct => ct.Tag); // Dołącza szczegóły tagów
            }

            // Wykonuje zapytanie i pobiera listę klientów
            var customers = await query.ToListAsync(); // Wykonuje zapytanie asynchronicznie

            // Parsuje listę kolumn do eksportu
            var selectedColumns = !string.IsNullOrEmpty(columns) // Sprawdza czy kolumny zostały podane
                ? columns.Split(',', StringSplitOptions.RemoveEmptyEntries) // Dzieli string na tablicę kolumn
                : new[] { "id", "name", "email", "phone", "company", "createdAt" }; // Domyślne kolumny jeśli nie podano

            // Przygotowuje dane pliku do eksportu
            byte[] fileBytes; // Tablica bajtów z danymi pliku
            string contentType; // Typ MIME pliku
            
            // Wybiera format eksportu i generuje odpowiedni plik
            if (format.ToLower() == "xlsx") // Jeśli format to XLSX
            {
                fileBytes = _csvExportService.ExportCustomersToXlsx(customers, selectedColumns, includeRelations); // Generuje plik XLSX
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // Ustawia typ MIME dla XLSX
            }
            else if (format.ToLower() == "pdf") // Jeśli format to PDF
            {
                fileBytes = _csvExportService.ExportCustomersToCsvAdvanced(customers, selectedColumns, includeRelations); // Generuje plik CSV (PDF nie jest jeszcze zaimplementowane)
                contentType = "text/csv"; // Ustawia typ MIME dla CSV
            }
            else // Domyślnie CSV
            {
                fileBytes = _csvExportService.ExportCustomersToCsvAdvanced(customers, selectedColumns, includeRelations); // Generuje plik CSV
                contentType = "text/csv"; // Ustawia typ MIME dla CSV
            }
            
            // Generuje nazwę pliku z aktualną datą i czasem
            var fileName = $"customers_export_{DateTime.Now:yyyyMMdd_HHmmss}.{format.ToLower()}"; // Format: customers_export_20241201_143022.csv
            
            // Dodaje nagłówki HTTP dla lepszego pobierania pliku
            Response.Headers.Add("Content-Disposition", $"attachment; filename=\"{fileName}\""); // Wymusza pobranie pliku
            Response.Headers.Add("Access-Control-Expose-Headers", "Content-Disposition"); // Umożliwia dostęp do nagłówka w CORS
            
            return File(fileBytes, contentType, fileName); // Zwraca plik do pobrania
        }

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpGet("export-invoices")]
        public async Task<IActionResult> ExportInvoices(
            [FromQuery] string? format = "csv",
            [FromQuery] bool includeRelations = true,
            [FromQuery] string? columns = null,
            [FromQuery] string? dateFrom = null,
            [FromQuery] string? dateTo = null,
            [FromQuery] int? groupId = null,
            [FromQuery] int? tagId = null)
        {
            var query = _context.Invoices.AsQueryable();

            // Filtrowanie po dacie
            if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            {
                query = query.Where(i => i.IssuedAt >= fromDate);
            }
            if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            {
                query = query.Where(i => i.IssuedAt <= toDate);
            }

            // Filtrowanie po grupie
            if (groupId.HasValue)
            {
                query = query.Where(i => i.AssignedGroupId == groupId || i.Customer.AssignedGroupId == groupId);
            }

            // Filtrowanie po tagu
            if (tagId.HasValue)
            {
                query = query.Where(i => i.InvoiceTags.Any(it => it.TagId == tagId) || i.Customer.CustomerTags.Any(ct => ct.TagId == tagId));
            }

            // Include relations if requested
            if (includeRelations)
            {
                query = query
                    .Include(i => i.Customer)
                    .Include(i => i.AssignedGroup)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.InvoiceTags)
                        .ThenInclude(it => it.Tag);
            }

            var invoices = await query.ToListAsync();

            // Parse columns
            var selectedColumns = !string.IsNullOrEmpty(columns) 
                ? columns.Split(',', StringSplitOptions.RemoveEmptyEntries)
                : new[] { "id", "number", "customerName", "totalAmount", "isPaid", "issuedAt" };

            byte[] fileBytes;
            string contentType;
            if (format.ToLower() == "xlsx")
            {
                fileBytes = _csvExportService.ExportInvoicesToXlsx(invoices, selectedColumns, includeRelations);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }
            else if (format.ToLower() == "pdf")
            {
                fileBytes = _csvExportService.ExportInvoicesToCsvAdvanced(invoices, selectedColumns, includeRelations);
                contentType = "text/csv";
            }
            else
            {
                fileBytes = _csvExportService.ExportInvoicesToCsvAdvanced(invoices, selectedColumns, includeRelations);
                contentType = "text/csv";
            }
            var fileName = $"invoices_export_{DateTime.Now:yyyyMMdd_HHmmss}.{format.ToLower()}";
            return File(fileBytes, contentType, fileName);
        }

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpGet("export-payments")]
        public async Task<IActionResult> ExportPayments(
            [FromQuery] string? format = "csv",
            [FromQuery] bool includeRelations = true,
            [FromQuery] string? columns = null,
            [FromQuery] string? dateFrom = null,
            [FromQuery] string? dateTo = null)
        {
            var query = _context.Payments.AsQueryable();

            // Filtrowanie po dacie
            if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            {
                query = query.Where(p => p.PaidAt >= fromDate);
            }
            if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            {
                query = query.Where(p => p.PaidAt <= toDate);
            }

            // Include relations if requested
            if (includeRelations)
            {
                query = query.Include(p => p.Invoice);
            }

            var payments = await query.ToListAsync();

            // Parse columns
            var selectedColumns = !string.IsNullOrEmpty(columns) 
                ? columns.Split(',', StringSplitOptions.RemoveEmptyEntries)
                : new[] { "id", "invoiceNumber", "amount", "paidAt" };

            byte[] fileBytes;
            string contentType;
            if (format.ToLower() == "xlsx")
            {
                fileBytes = _csvExportService.ExportPaymentsToCsvAdvanced(payments, selectedColumns, includeRelations);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }
            else if (format.ToLower() == "pdf")
            {
                fileBytes = _csvExportService.ExportPaymentsToCsvAdvanced(payments, selectedColumns, includeRelations);
                contentType = "text/csv";
            }
            else
            {
                fileBytes = _csvExportService.ExportPaymentsToCsvAdvanced(payments, selectedColumns, includeRelations);
                contentType = "text/csv";
            }
            var fileName = $"payments_export_{DateTime.Now:yyyyMMdd_HHmmss}.{format.ToLower()}";
            return File(fileBytes, contentType, fileName);
        }

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpGet("export-contracts")]
        public async Task<IActionResult> ExportContracts(
            [FromQuery] string? format = "csv",
            [FromQuery] bool includeRelations = true,
            [FromQuery] string? columns = null,
            [FromQuery] string? dateFrom = null,
            [FromQuery] string? dateTo = null,
            [FromQuery] int? groupId = null,
            [FromQuery] int? tagId = null)
        {
            var query = _context.Contracts.AsQueryable();

            // Filtrowanie po dacie
            if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            {
                query = query.Where(c => c.SignedAt >= fromDate);
            }
            if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            {
                query = query.Where(c => c.SignedAt <= toDate);
            }

            // Filtrowanie po grupie
            if (groupId.HasValue)
            {
                query = query.Where(c => c.Customer.AssignedGroupId == groupId);
            }

            // Filtrowanie po tagu
            if (tagId.HasValue)
            {
                query = query.Where(c => c.Customer.CustomerTags.Any(ct => ct.TagId == tagId));
            }

            // Include relations if requested
            if (includeRelations)
            {
                query = query.Include(c => c.Customer);
            }

            var contracts = await query.ToListAsync();

            // Parse columns
            var selectedColumns = !string.IsNullOrEmpty(columns) 
                ? columns.Split(',', StringSplitOptions.RemoveEmptyEntries)
                : new[] { "id", "title", "contractNumber", "customerName", "signedAt" };

            byte[] fileBytes;
            string contentType;
            if (format.ToLower() == "xlsx")
            {
                fileBytes = _csvExportService.ExportContractsToCsvAdvanced(contracts, selectedColumns, includeRelations);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }
            else if (format.ToLower() == "pdf")
            {
                fileBytes = _csvExportService.ExportContractsToCsvAdvanced(contracts, selectedColumns, includeRelations);
                contentType = "text/csv";
            }
            else
            {
                fileBytes = _csvExportService.ExportContractsToCsvAdvanced(contracts, selectedColumns, includeRelations);
                contentType = "text/csv";
            }
            var fileName = $"contracts_export_{DateTime.Now:yyyyMMdd_HHmmss}.{format.ToLower()}";
            return File(fileBytes, contentType, fileName);
        }

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpGet("export-tasks")]
        public async Task<IActionResult> ExportTasks(
            [FromQuery] string? format = "csv",
            [FromQuery] bool includeRelations = true,
            [FromQuery] string? columns = null,
            [FromQuery] string? dateFrom = null,
            [FromQuery] string? dateTo = null,
            [FromQuery] int? groupId = null,
            [FromQuery] int? tagId = null)
        {
            var query = _context.Tasks.AsQueryable();

            // Filtrowanie po dacie (TaskItem nie ma CreatedAt, używamy DueDate)
            if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            {
                query = query.Where(t => t.DueDate >= fromDate);
            }
            if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            {
                query = query.Where(t => t.DueDate <= toDate);
            }

            // Filtrowanie po grupie
            if (groupId.HasValue)
            {
                query = query.Where(t => t.AssignedGroupId == groupId || t.Customer.AssignedGroupId == groupId);
            }

            // Filtrowanie po tagu
            if (tagId.HasValue)
            {
                query = query.Where(t => t.TaskTags.Any(tt => tt.TagId == tagId) || t.Customer.CustomerTags.Any(ct => ct.TagId == tagId));
            }

            // Include relations if requested
            if (includeRelations)
            {
                query = query
                    .Include(t => t.User)
                    .Include(t => t.Customer)
                    .Include(t => t.AssignedGroup)
                    .Include(t => t.TaskTags)
                        .ThenInclude(tt => tt.Tag);
            }

            var tasks = await query.ToListAsync();

            // Parse columns
            var selectedColumns = !string.IsNullOrEmpty(columns) 
                ? columns.Split(',', StringSplitOptions.RemoveEmptyEntries)
                : new[] { "id", "title", "customerName", "assignedUser", "dueDate", "completed" };

            byte[] fileBytes;
            string contentType;
            if (format.ToLower() == "xlsx")
            {
                fileBytes = _csvExportService.ExportTasksToXlsx(tasks, selectedColumns, includeRelations);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }
            else if (format.ToLower() == "pdf")
            {
                fileBytes = _csvExportService.ExportTasksToCsvAdvanced(tasks, selectedColumns, includeRelations);
                contentType = "text/csv";
            }
            else
            {
                fileBytes = _csvExportService.ExportTasksToCsvAdvanced(tasks, selectedColumns, includeRelations);
                contentType = "text/csv";
            }
            var fileName = $"tasks_export_{DateTime.Now:yyyyMMdd_HHmmss}.{format.ToLower()}";
            return File(fileBytes, contentType, fileName);
        }

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpGet("export-meetings")]
        public async Task<IActionResult> ExportMeetings(
            [FromQuery] string? format = "csv",
            [FromQuery] bool includeRelations = true,
            [FromQuery] string? columns = null,
            [FromQuery] string? dateFrom = null,
            [FromQuery] string? dateTo = null,
            [FromQuery] int? groupId = null,
            [FromQuery] int? tagId = null)
        {
            var query = _context.Meetings.AsQueryable();

            // Filtrowanie po dacie
            if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            {
                query = query.Where(m => m.ScheduledAt >= fromDate);
            }
            if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            {
                query = query.Where(m => m.ScheduledAt <= toDate);
            }

            // Filtrowanie po grupie
            if (groupId.HasValue)
            {
                query = query.Where(m => m.Customer.AssignedGroupId == groupId);
            }

            // Filtrowanie po tagu
            if (tagId.HasValue)
            {
                query = query.Where(m => m.Customer.CustomerTags.Any(ct => ct.TagId == tagId));
            }

            // Include relations if requested
            if (includeRelations)
            {
                query = query.Include(m => m.Customer);
            }

            var meetings = await query.ToListAsync();

            // Parse columns
            var selectedColumns = !string.IsNullOrEmpty(columns) 
                ? columns.Split(',', StringSplitOptions.RemoveEmptyEntries)
                : new[] { "id", "topic", "customerName", "scheduledAt", "duration" };

            byte[] fileBytes;
            string contentType;
            if (format.ToLower() == "xlsx")
            {
                fileBytes = _csvExportService.ExportMeetingsToCsvAdvanced(meetings, selectedColumns, includeRelations);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }
            else if (format.ToLower() == "pdf")
            {
                fileBytes = _csvExportService.ExportMeetingsToCsvAdvanced(meetings, selectedColumns, includeRelations);
                contentType = "text/csv";
            }
            else
            {
                fileBytes = _csvExportService.ExportMeetingsToCsvAdvanced(meetings, selectedColumns, includeRelations);
                contentType = "text/csv";
            }
            var fileName = $"meetings_export_{DateTime.Now:yyyyMMdd_HHmmss}.{format.ToLower()}";
            return File(fileBytes, contentType, fileName);
        }

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpGet("export-notes")]
        public async Task<IActionResult> ExportNotes(
            [FromQuery] string? format = "csv",
            [FromQuery] bool includeRelations = true,
            [FromQuery] string? columns = null,
            [FromQuery] string? dateFrom = null,
            [FromQuery] string? dateTo = null)
        {
            var query = _context.Notes.AsQueryable();

            // Filtrowanie po dacie
            if (!string.IsNullOrEmpty(dateFrom) && DateTime.TryParse(dateFrom, out var fromDate))
            {
                query = query.Where(n => n.CreatedAt >= fromDate);
            }
            if (!string.IsNullOrEmpty(dateTo) && DateTime.TryParse(dateTo, out var toDate))
            {
                query = query.Where(n => n.CreatedAt <= toDate);
            }

            // Include relations if requested
            if (includeRelations)
            {
                query = query
                    .Include(n => n.Customer)
                    .Include(n => n.User);
            }

            var notes = await query.ToListAsync();

            // Parse columns
            var selectedColumns = !string.IsNullOrEmpty(columns) 
                ? columns.Split(',', StringSplitOptions.RemoveEmptyEntries)
                : new[] { "id", "content", "customerName", "createdBy", "createdAt" };

            byte[] fileBytes;
            string contentType;
            if (format.ToLower() == "xlsx")
            {
                fileBytes = _csvExportService.ExportNotesToCsvAdvanced(notes, selectedColumns, includeRelations);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }
            else if (format.ToLower() == "pdf")
            {
                fileBytes = _csvExportService.ExportNotesToCsvAdvanced(notes, selectedColumns, includeRelations);
                contentType = "text/csv";
            }
            else
            {
                fileBytes = _csvExportService.ExportNotesToCsvAdvanced(notes, selectedColumns, includeRelations);
                contentType = "text/csv";
            }
            var fileName = $"notes_export_{DateTime.Now:yyyyMMdd_HHmmss}.{format.ToLower()}";
            return File(fileBytes, contentType, fileName);
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

        [HttpGet("tags/{tagId}/pdf")]
        public async Task<IActionResult> GetTagReportPdf(int tagId)
        {
            var tag = await _context.Tags.FindAsync(tagId);
            if (tag == null) return NotFound("Tag nie znaleziony.");

            // Pobieramy wszystkie dane raportu dla taga
            var customersData = await _context.Customers
                .Where(c => c.CustomerTags.Any(ct => ct.TagId == tagId))
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Email,
                    c.Company,
                    c.CreatedAt,
                    c.Phone,
                    GroupName = c.AssignedGroup != null ? c.AssignedGroup.Name : "Brak grupy"
                })
                .ToListAsync();

            var invoicesData = await _context.Invoices
                .Where(i => i.InvoiceTags.Any(it => it.TagId == tagId) || i.Customer.CustomerTags.Any(ct => ct.TagId == tagId))
                .Include(i => i.Customer)
                .Select(i => new
                {
                    i.Id,
                    i.Number,
                    i.TotalAmount,
                    i.IsPaid,
                    i.IssuedAt,
                    i.DueDate,
                    CustomerName = i.Customer.Name
                })
                .ToListAsync();

            var tasksData = await _context.Tasks
                .Where(t => t.TaskTags.Any(tt => tt.TagId == tagId) || t.Customer.CustomerTags.Any(ct => ct.TagId == tagId))
                .Include(t => t.Customer)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.DueDate,
                    t.Completed,
                    CustomerName = t.Customer.Name
                })
                .ToListAsync();

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

            var reportSummary = new GroupReportSummaryPdfDto
            {
                TotalCustomers = customersData.Count,
                TotalInvoicesSales = invoicesData.Count,
                TotalAmount = invoicesData.Sum(i => i.TotalAmount),
                TotalTasks = tasksData.Count,
                PaidAmount = invoicesData.Where(i => i.IsPaid).Sum(i => i.TotalAmount),
                UnpaidAmount = invoicesData.Where(i => !i.IsPaid).Sum(i => i.TotalAmount),
                PaidCount = invoicesData.Count(i => i.IsPaid),
                UnpaidCount = invoicesData.Count(i => !i.IsPaid),
                CompletedTasks = tasksData.Count(t => t.Completed),
                PendingTasks = tasksData.Count(t => !t.Completed),
                CompletionRate = tasksData.Count > 0 ? (double)tasksData.Count(t => t.Completed) / tasksData.Count * 100 : 0,
                TotalContracts = contractsData.Count,
                TotalInvoiceValue = invoicesData.Sum(i => i.TotalAmount),
                TotalPaidValue = invoicesData.Where(i => i.IsPaid).Sum(i => i.TotalAmount)
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
                    AssignedUser = "",
                    Tags = new List<string> { tag.Name },
                    ContractCount = contractsData.Count(contract => contract.CustomerName == c.Name),
                    InvoiceCount = invoicesData.Count(invoice => invoice.CustomerName == c.Name),
                    TotalInvoiceValue = invoicesData.Where(invoice => invoice.CustomerName == c.Name).Sum(invoice => invoice.TotalAmount),
                    PaidInvoiceValue = invoicesData.Where(invoice => invoice.CustomerName == c.Name && invoice.IsPaid).Sum(invoice => invoice.TotalAmount)
                }).ToList(),
                Invoices = invoicesData.Select(i => new GroupReportInvoicePdfDto
                {
                    Id = i.Id,
                    Number = i.Number,
                    TotalAmount = i.TotalAmount,
                    IsPaid = i.IsPaid,
                    IssuedAt = i.IssuedAt,
                    DueDate = i.DueDate,
                    CustomerName = i.CustomerName,
                    CustomerEmail = "",
                    CreatedBy = "",
                    Tags = new List<string> { tag.Name }
                }).ToList(),
                Tasks = tasksData.Select(t => new GroupReportTaskPdfDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    DueDate = t.DueDate,
                    Completed = t.Completed,
                    AssignedUser = "",
                    CustomerName = t.CustomerName,
                    Tags = new List<string> { tag.Name }
                }).ToList()
            };

            var pdfBytes = await _invoicePdfService.GenerateGroupReportPdfAsync($"Tag: {tag.Name}", fullReportData);
            return File(pdfBytes, "application/pdf", $"raport_taga_{tag.Name.Replace(" ", "_")}.pdf");
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
                    i.IssuedAt,
                    i.DueDate,
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
                    t.Description,
                    t.DueDate,
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