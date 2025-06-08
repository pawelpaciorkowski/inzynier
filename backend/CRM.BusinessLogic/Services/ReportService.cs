using CRM.Data;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace CRM.BusinessLogic.Services
{
    public class ReportService
    {
        private readonly ApplicationDbContext _context;

        public ReportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<byte[]> GenerateClientsReportAsync()
        {
            var clients = await _context.Customers.OrderBy(c => c.Name).ToListAsync();

            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Header()
                        .Text("Raport Klientów")
                        .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(col =>
                        {
                            col.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(3);
                                    columns.RelativeColumn(4);
                                    columns.RelativeColumn(3);
                                    columns.RelativeColumn(3);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().BorderBottom(1).Padding(5).Background(Colors.Grey.Lighten3).Text("Imię i Nazwisko").Bold();
                                    header.Cell().BorderBottom(1).Padding(5).Background(Colors.Grey.Lighten3).Text("Email").Bold();
                                    header.Cell().BorderBottom(1).Padding(5).Background(Colors.Grey.Lighten3).Text("Telefon").Bold();
                                    header.Cell().BorderBottom(1).Padding(5).Background(Colors.Grey.Lighten3).Text("Firma").Bold();
                                });

                                foreach (var client in clients)
                                {
                                    table.Cell().BorderBottom(1).Padding(5).Text(client.Name);
                                    table.Cell().BorderBottom(1).Padding(5).Text(client.Email);
                                    table.Cell().BorderBottom(1).Padding(5).Text(client.Phone);
                                    table.Cell().BorderBottom(1).Padding(5).Text(client.Company);
                                }
                            });
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Strona ");
                            x.CurrentPageNumber();
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}