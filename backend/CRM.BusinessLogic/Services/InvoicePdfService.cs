using CRM.Data;
using CRM.Data.Models;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static QuestPDF.Fluent.TextExtensions; 
using static QuestPDF.Fluent.PaddingExtensions; 

namespace CRM.BusinessLogic.Services
{
    // --- DTOs for Group Report PDF --- 
    public class GroupReportSummaryPdfDto
    {
        public int TotalCustomers { get; set; }
        public int TotalInvoicesSales { get; set; }
        public decimal TotalAmount { get; set; }
        public int TotalTasks { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal UnpaidAmount { get; set; }
        public int PaidCount { get; set; }
        public int UnpaidCount { get; set; }
        public int CompletedTasks { get; set; }
        public int PendingTasks { get; set; }
        public double CompletionRate { get; set; }
        public int TotalContracts { get; set; }
        public decimal TotalInvoiceValue { get; set; }
        public decimal TotalPaidValue { get; set; }
    }

    public class GroupReportCustomerPdfDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Company { get; set; }
        public string? Phone { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? AssignedUser { get; set; }
        public List<string>? Tags { get; set; }
        public int ContractCount { get; set; }
        public int InvoiceCount { get; set; }
        public decimal TotalInvoiceValue { get; set; }
        public decimal PaidInvoiceValue { get; set; }
    }

    public class GroupReportInvoicePdfDto
    {
        public int Id { get; set; }
        public string? Number { get; set; }
        public decimal TotalAmount { get; set; }
        public bool IsPaid { get; set; }
        public DateTime IssuedAt { get; set; }
        public DateTime DueDate { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CreatedBy { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class GroupReportTaskPdfDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool Completed { get; set; }
        public string? AssignedUser { get; set; }
        public string? CustomerName { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class FullGroupReportPdfDto
    {
        public GroupReportSummaryPdfDto? Summary { get; set; }
        public List<GroupReportCustomerPdfDto>? Customers { get; set; }
        public List<GroupReportInvoicePdfDto>? Invoices { get; set; }
        public List<GroupReportTaskPdfDto>? Tasks { get; set; }
    }

    public class InvoicePdfService
    {
        private readonly ApplicationDbContext _context;

        public InvoicePdfService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<byte[]> GenerateInvoicePdfAsync(int invoiceId)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == invoiceId);

            if (invoice == null)
            {
                throw new Exception("Faktura nie znaleziona.");
            }

            // Pobierz dane firmy z Settings
            var settings = await _context.Settings.ToDictionaryAsync(s => s.Key, s => s.Value);
            string companyName = settings.GetValueOrDefault("CompanyName", "Twoja Firma");
            string companyAddress = settings.GetValueOrDefault("CompanyAddress", "Adres firmy");
            string companyNip = settings.GetValueOrDefault("CompanyNIP", "NIP");
            string companyBankAccount = settings.GetValueOrDefault("CompanyBankAccount", "Numer konta");

            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header()
                        .PaddingBottom(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            column.Item().Text(text => text.Span("Faktura VAT").SemiBold().FontSize(24).FontColor(Colors.Blue.Medium));
                            column.Item().Text(text => text.Span($"Numer: {invoice.Number}").FontSize(14));
                            column.Item().Text(text => text.Span($"Data wystawienia: {invoice.IssuedAt:dd.MM.yyyy}").FontSize(10));
                            column.Item().Text(text => text.Span($"Termin płatności: {invoice.DueDate:dd.MM.yyyy}").FontSize(10));
                            column.Item().Text(text => text.Span($"Status: {(invoice.IsPaid ? "Zapłacona" : "Oczekuje na płatność")}").FontSize(10));
                        });

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            column.Item().Row(row =>
                            {
                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text(text => text.Span("Sprzedawca:").SemiBold());
                                    col.Item().Text(text => text.Span(companyName));
                                    col.Item().Text(text => text.Span(companyAddress));
                                    col.Item().Text(text => text.Span($"NIP: {companyNip}"));
                                    col.Item().Text(text => text.Span($"Konto: {companyBankAccount}"));
                                });

                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text(text => text.Span("Nabywca:").SemiBold());
                                    col.Item().Text(text => text.Span(invoice.Customer.Name));
                                    col.Item().Text(text => text.Span(invoice.Customer.Address ?? ""));
                                    col.Item().Text(text => text.Span(invoice.Customer.Company ?? ""));
                                    col.Item().Text(text => text.Span(invoice.Customer.Phone ?? ""));
                                    col.Item().Text(text => text.Span(invoice.Customer.Email ?? ""));
                                });
                            });

                            column.Item().PaddingVertical(1, Unit.Centimetre).Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(4);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(1);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Lp.").Bold());
                                    header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Opis").Bold());
                                    header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Ilość").Bold());
                                    header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Cena jedn.").Bold());
                                    header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Netto").Bold());
                                    header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Brutto").Bold());
                                });

                                int lp = 1;
                                foreach (var item in invoice.Items)
                                {
                                    table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span((lp++).ToString()));
                                    table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(item.Description));
                                    table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(item.Quantity.ToString()));
                                    table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(item.UnitPrice.ToString("F2")));
                                    table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(item.NetAmount.ToString("F2")));
                                    table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(item.GrossAmount.ToString("F2")));
                                }
                            });

                            column.Item().AlignRight().Text(text => text.Span($"Suma netto: {invoice.Items.Sum(item => item.NetAmount):F2} PLN").FontSize(12).SemiBold());
                            column.Item().AlignRight().Text(text => text.Span($"Suma VAT: {invoice.Items.Sum(item => item.TaxAmount):F2} PLN").FontSize(12).SemiBold());
                            column.Item().AlignRight().Text(text => text.Span($"Suma brutto: {invoice.Items.Sum(item => item.GrossAmount):F2} PLN").FontSize(14).Bold());
                        });

                    page.Footer()
                        .PaddingTop(1, Unit.Centimetre)
                        .AlignCenter()
                        .Text(text =>
                        {
                            text.Span("Strona ");
                            text.CurrentPageNumber();
                            text.Span(" z ");
                            text.TotalPages();
                        });
                });
            });

            return document.GeneratePdf();
        }

        public async Task<byte[]> GenerateGroupReportPdfAsync(string groupName, FullGroupReportPdfDto reportData)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var settings = await _context.Settings.ToDictionaryAsync(s => s.Key, s => s.Value);
            string companyName = settings.GetValueOrDefault("CompanyName", "Twoja Firma");

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header()
                        .PaddingBottom(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            column.Item().Text(text => text.Span($"Raport dla grupy: {groupName}").SemiBold().FontSize(24).FontColor(Colors.Blue.Medium));
                            column.Item().Text(text => text.Span($"Wygenerowano: {DateTime.Now:dd.MM.yyyy HH:mm}").FontSize(10));
                            column.Item().Text(text => text.Span($"Firma: {companyName}").FontSize(10));
                        });

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            // Podsumowanie
                            column.Item().PaddingBottom(5).Text(text => text.Span("Podsumowanie:").SemiBold().FontSize(14)); 
                            column.Item().Text(text => text.Span($"Liczba klientów: {reportData.Summary?.TotalCustomers}")); 
                            column.Item().Text(text => text.Span($"Liczba faktur: {reportData.Summary?.TotalInvoicesSales}")); 
                            column.Item().Text(text => text.Span($"Całkowita wartość faktur: {reportData.Summary?.TotalAmount:F2} PLN")); 
                            column.Item().Text(text => text.Span($"Liczba zadań: {reportData.Summary?.TotalTasks}")); 
                            column.Item().PaddingBottom(10).Text(text => text.Span("")); // Odstęp

                            // Sekcja Klientów
                            if (reportData.Customers != null && reportData.Customers.Any())
                            {
                                column.Item().PaddingBottom(5).Text(text => text.Span("Klienci:").SemiBold().FontSize(14)); 
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Nazwa").Bold());
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Email").Bold());
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Faktur").Bold());
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Wartość faktur").Bold());
                                    });

                                    foreach (var customer in reportData.Customers)
                                    {
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(customer.Name));
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(customer.Email));
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(customer.InvoiceCount.ToString()));
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(customer.TotalInvoiceValue.ToString("F2")));
                                    }
                                });
                                column.Item().PaddingBottom(10).Text(text => text.Span("")); // Odstęp
                            }

                            // Sekcja Faktur
                            if (reportData.Invoices != null && reportData.Invoices.Any())
                            {
                                column.Item().PaddingBottom(5).Text(text => text.Span("Faktury:").SemiBold().FontSize(14)); 
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Numer").Bold());
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Klient").Bold());
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Wartość").Bold());
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Data wyst.").Bold());
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Status").Bold());
                                    });

                                    foreach (var invoice in reportData.Invoices)
                                    {
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(invoice.Number));
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(invoice.CustomerName));
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(invoice.TotalAmount.ToString("F2")));
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(invoice.IssuedAt.ToString("dd.MM.yyyy")));
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(invoice.IsPaid ? "Opłacona" : "Nieopłacona"));
                                    }
                                });
                                column.Item().PaddingBottom(10).Text(text => text.Span("")); // Odstęp
                            }

                            // Sekcja Zadań
                            if (reportData.Tasks != null && reportData.Tasks.Any())
                            {
                                column.Item().PaddingBottom(5).Text(text => text.Span("Zadania:").SemiBold().FontSize(14)); 
                                column.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                        columns.RelativeColumn();
                                    });

                                    table.Header(header =>
                                    {
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Tytuł").Bold());
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Klient").Bold());
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Termin").Bold());
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Status").Bold());
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Przypisany").Bold());
                                    });

                                    foreach (var task in reportData.Tasks)
                                    {
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(task.Title));
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(task.CustomerName));
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(task.DueDate != null ? task.DueDate.Value.ToString("dd.MM.yyyy") : "Brak")); 
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(task.Completed ? "Ukończone" : "Oczekujące"));
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(task.AssignedUser));
                                    }
                                });
                            }
                        });

                    page.Footer()
                        .PaddingTop(1, Unit.Centimetre)
                        .AlignCenter()
                        .Text(text =>
                        {
                            text.Span("Strona ");
                            text.CurrentPageNumber();
                            text.Span(" z ");
                            text.TotalPages();
                        });
                });
            }).GeneratePdf();
        }
    }
}