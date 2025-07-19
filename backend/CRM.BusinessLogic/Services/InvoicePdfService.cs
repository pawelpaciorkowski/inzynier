using CRM.Data;
using CRM.Data.Models;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace CRM.BusinessLogic.Services
{
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
                            column.Item().Text("Faktura VAT").SemiBold().FontSize(24).FontColor(Colors.Blue.Medium);
                            column.Item().Text($"Numer: {invoice.Number}").FontSize(14);
                            column.Item().Text($"Data wystawienia: {invoice.IssuedAt:dd.MM.yyyy}").FontSize(10);
                            column.Item().Text($"Termin płatności: {invoice.DueDate:dd.MM.yyyy}").FontSize(10);
                            column.Item().Text($"Status: {(invoice.IsPaid ? "Zapłacona" : "Oczekuje na płatność")}").FontSize(10);
                        });

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            column.Item().Row(row =>
                            {
                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text("Sprzedawca:").SemiBold();
                                    col.Item().Text(companyName);
                                    col.Item().Text(companyAddress);
                                    col.Item().Text($"NIP: {companyNip}");
                                    col.Item().Text($"Konto: {companyBankAccount}");
                                });

                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text("Nabywca:").SemiBold();
                                    col.Item().Text(invoice.Customer.Name);
                                    col.Item().Text(invoice.Customer.Address ?? "");
                                    col.Item().Text(invoice.Customer.Company ?? "");
                                    col.Item().Text(invoice.Customer.Phone ?? "");
                                    col.Item().Text(invoice.Customer.Email ?? "");
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
                                    header.Cell().BorderBottom(1).Padding(5).Text("Lp.").Bold();
                                    header.Cell().BorderBottom(1).Padding(5).Text("Opis").Bold();
                                    header.Cell().BorderBottom(1).Padding(5).Text("Ilość").Bold();
                                    header.Cell().BorderBottom(1).Padding(5).Text("Cena jedn.").Bold();
                                    header.Cell().BorderBottom(1).Padding(5).Text("Netto").Bold();
                                    header.Cell().BorderBottom(1).Padding(5).Text("Brutto").Bold();
                                });

                                int lp = 1;
                                foreach (var item in invoice.Items)
                                {
                                    table.Cell().BorderBottom(1).Padding(5).Text((lp++).ToString());
                                    table.Cell().BorderBottom(1).Padding(5).Text(item.Description);
                                    table.Cell().BorderBottom(1).Padding(5).Text(item.Quantity.ToString());
                                    table.Cell().BorderBottom(1).Padding(5).Text(item.UnitPrice.ToString("F2"));
                                    table.Cell().BorderBottom(1).Padding(5).Text(item.NetAmount.ToString("F2"));
                                    table.Cell().BorderBottom(1).Padding(5).Text(item.GrossAmount.ToString("F2"));
                                }
                            });

                            column.Item().AlignRight().Text($"Suma netto: {invoice.Items.Sum(item => item.NetAmount):F2} PLN").FontSize(12).SemiBold();
                            column.Item().AlignRight().Text($"Suma VAT: {invoice.Items.Sum(item => item.TaxAmount):F2} PLN").FontSize(12).SemiBold();
                            column.Item().AlignRight().Text($"Suma brutto: {invoice.Items.Sum(item => item.GrossAmount):F2} PLN").FontSize(14).Bold();
                        });

                    page.Footer()
                        .PaddingTop(1, Unit.Centimetre)
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Strona ");
                            x.CurrentPageNumber();
                            x.Span(" z ");
                            x.TotalPages();
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}
