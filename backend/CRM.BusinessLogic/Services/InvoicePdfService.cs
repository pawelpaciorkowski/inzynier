using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM (Invoice, Customer, etc.)
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using QuestPDF.Fluent; // Importuje QuestPDF Fluent API do generowania PDF
using QuestPDF.Helpers; // Importuje pomocnicze funkcje QuestPDF
using QuestPDF.Infrastructure; // Importuje infrastrukturę QuestPDF
using System; // Importuje podstawowe typy systemowe
using System.Collections.Generic; // Importuje kolekcje generyczne (List, IEnumerable)
using System.Linq; // Importuje LINQ (Language Integrated Query)
using System.Threading.Tasks; // Importuje Task dla operacji asynchronicznych
using static QuestPDF.Fluent.TextExtensions; // Importuje rozszerzenia tekstu QuestPDF jako statyczne metody
using static QuestPDF.Fluent.PaddingExtensions; // Importuje rozszerzenia padding QuestPDF jako statyczne metody

namespace CRM.BusinessLogic.Services // Przestrzeń nazw dla serwisów biznesowych
{
    /// <summary>
    /// DTO dla podsumowania raportu grupy w PDF
    /// Zawiera statystyki i podsumowania dla grupy klientów
    /// </summary>
    public class GroupReportSummaryPdfDto // Klasa publiczna reprezentująca podsumowanie raportu grupy
    {
        /// <summary>
        /// Całkowita liczba klientów w grupie
        /// </summary>
        public int TotalCustomers { get; set; } // Właściwość - liczba wszystkich klientów

        /// <summary>
        /// Całkowita liczba faktur sprzedaży w grupie
        /// </summary>
        public int TotalInvoicesSales { get; set; } // Właściwość - liczba wszystkich faktur

        /// <summary>
        /// Całkowita kwota wszystkich faktur w grupie
        /// </summary>
        public decimal TotalAmount { get; set; } // Właściwość - suma wszystkich kwot faktur

        /// <summary>
        /// Całkowita liczba zadań w grupie
        /// </summary>
        public int TotalTasks { get; set; } // Właściwość - liczba wszystkich zadań

        /// <summary>
        /// Całkowita kwota opłaconych faktur w grupie
        /// </summary>
        public decimal PaidAmount { get; set; } // Właściwość - suma kwot opłaconych faktur

        /// <summary>
        /// Całkowita kwota nieopłaconych faktur w grupie
        /// </summary>
        public decimal UnpaidAmount { get; set; } // Właściwość - suma kwot nieopłaconych faktur

        /// <summary>
        /// Liczba opłaconych faktur w grupie
        /// </summary>
        public int PaidCount { get; set; } // Właściwość - liczba opłaconych faktur

        /// <summary>
        /// Liczba nieopłaconych faktur w grupie
        /// </summary>
        public int UnpaidCount { get; set; } // Właściwość - liczba nieopłaconych faktur

        /// <summary>
        /// Liczba ukończonych zadań w grupie
        /// </summary>
        public int CompletedTasks { get; set; } // Właściwość - liczba ukończonych zadań

        /// <summary>
        /// Liczba oczekujących zadań w grupie
        /// </summary>
        public int PendingTasks { get; set; } // Właściwość - liczba oczekujących zadań

        /// <summary>
        /// Wskaźnik ukończenia zadań w grupie (w procentach)
        /// </summary>
        public double CompletionRate { get; set; } // Właściwość - procent ukończonych zadań

        /// <summary>
        /// Całkowita liczba kontraktów w grupie
        /// </summary>
        public int TotalContracts { get; set; } // Właściwość - liczba wszystkich kontraktów

        /// <summary>
        /// Całkowita wartość wszystkich faktur w grupie
        /// </summary>
        public decimal TotalInvoiceValue { get; set; } // Właściwość - suma wartości wszystkich faktur

        /// <summary>
        /// Całkowita wartość opłaconych faktur w grupie
        /// </summary>
        public decimal TotalPaidValue { get; set; } // Właściwość - suma wartości opłaconych faktur
    }

    /// <summary>
    /// DTO dla danych klienta w raporcie grupy PDF
    /// Zawiera szczegółowe informacje o kliencie dla raportu
    /// </summary>
    public class GroupReportCustomerPdfDto // Klasa publiczna reprezentująca dane klienta w raporcie
    {
        /// <summary>
        /// Unikalny identyfikator klienta
        /// </summary>
        public int Id { get; set; } // Właściwość - ID klienta

        /// <summary>
        /// Nazwa klienta
        /// </summary>
        public string? Name { get; set; } // Właściwość - nazwa klienta (nullable)

        /// <summary>
        /// Adres email klienta
        /// </summary>
        public string? Email { get; set; } // Właściwość - email klienta (nullable)

        /// <summary>
        /// Nazwa firmy klienta
        /// </summary>
        public string? Company { get; set; } // Właściwość - firma klienta (nullable)

        /// <summary>
        /// Numer telefonu klienta
        /// </summary>
        public string? Phone { get; set; } // Właściwość - telefon klienta (nullable)

        /// <summary>
        /// Data utworzenia klienta w systemie
        /// </summary>
        public DateTime CreatedAt { get; set; } // Właściwość - data utworzenia

        /// <summary>
        /// Nazwa użytkownika przypisanego do klienta
        /// </summary>
        public string? AssignedUser { get; set; } // Właściwość - przypisany użytkownik (nullable)

        /// <summary>
        /// Lista tagów przypisanych do klienta
        /// </summary>
        public List<string>? Tags { get; set; } // Właściwość - lista tagów (nullable)

        /// <summary>
        /// Liczba kontraktów klienta
        /// </summary>
        public int ContractCount { get; set; } // Właściwość - liczba kontraktów

        /// <summary>
        /// Liczba faktur klienta
        /// </summary>
        public int InvoiceCount { get; set; } // Właściwość - liczba faktur

        /// <summary>
        /// Całkowita wartość wszystkich faktur klienta
        /// </summary>
        public decimal TotalInvoiceValue { get; set; } // Właściwość - suma wartości faktur

        /// <summary>
        /// Wartość opłaconych faktur klienta
        /// </summary>
        public decimal PaidInvoiceValue { get; set; } // Właściwość - suma wartości opłaconych faktur
    }

    /// <summary>
    /// DTO dla danych faktury w raporcie grupy PDF
    /// Zawiera szczegółowe informacje o fakturze dla raportu
    /// </summary>
    public class GroupReportInvoicePdfDto // Klasa publiczna reprezentująca dane faktury w raporcie
    {
        /// <summary>
        /// Unikalny identyfikator faktury
        /// </summary>
        public int Id { get; set; } // Właściwość - ID faktury

        /// <summary>
        /// Numer faktury
        /// </summary>
        public string? Number { get; set; } // Właściwość - numer faktury (nullable)

        /// <summary>
        /// Całkowita kwota faktury
        /// </summary>
        public decimal TotalAmount { get; set; } // Właściwość - kwota faktury

        /// <summary>
        /// Czy faktura jest opłacona
        /// </summary>
        public bool IsPaid { get; set; } // Właściwość - status płatności

        /// <summary>
        /// Data wystawienia faktury
        /// </summary>
        public DateTime IssuedAt { get; set; } // Właściwość - data wystawienia

        /// <summary>
        /// Termin płatności faktury
        /// </summary>
        public DateTime DueDate { get; set; } // Właściwość - termin płatności

        /// <summary>
        /// Nazwa klienta dla którego wystawiono fakturę
        /// </summary>
        public string? CustomerName { get; set; } // Właściwość - nazwa klienta (nullable)

        /// <summary>
        /// Email klienta dla którego wystawiono fakturę
        /// </summary>
        public string? CustomerEmail { get; set; } // Właściwość - email klienta (nullable)

        /// <summary>
        /// Nazwa użytkownika który utworzył fakturę
        /// </summary>
        public string? CreatedBy { get; set; } // Właściwość - użytkownik tworzący (nullable)

        /// <summary>
        /// Lista tagów przypisanych do faktury
        /// </summary>
        public List<string>? Tags { get; set; } // Właściwość - lista tagów (nullable)
    }

    /// <summary>
    /// DTO dla danych zadania w raporcie grupy PDF
    /// Zawiera szczegółowe informacje o zadaniu dla raportu
    /// </summary>
    public class GroupReportTaskPdfDto // Klasa publiczna reprezentująca dane zadania w raporcie
    {
        /// <summary>
        /// Unikalny identyfikator zadania
        /// </summary>
        public int Id { get; set; } // Właściwość - ID zadania

        /// <summary>
        /// Tytuł zadania
        /// </summary>
        public string? Title { get; set; } // Właściwość - tytuł zadania (nullable)

        /// <summary>
        /// Opis zadania
        /// </summary>
        public string? Description { get; set; } // Właściwość - opis zadania (nullable)

        /// <summary>
        /// Termin wykonania zadania
        /// </summary>
        public DateTime? DueDate { get; set; } // Właściwość - termin wykonania (nullable)

        /// <summary>
        /// Czy zadanie jest ukończone
        /// </summary>
        public bool Completed { get; set; } // Właściwość - status ukończenia

        /// <summary>
        /// Nazwa użytkownika przypisanego do zadania
        /// </summary>
        public string? AssignedUser { get; set; } // Właściwość - przypisany użytkownik (nullable)

        /// <summary>
        /// Nazwa klienta dla którego utworzono zadanie
        /// </summary>
        public string? CustomerName { get; set; } // Właściwość - nazwa klienta (nullable)

        /// <summary>
        /// Lista tagów przypisanych do zadania
        /// </summary>
        public List<string>? Tags { get; set; } // Właściwość - lista tagów (nullable)
    }

    /// <summary>
    /// DTO dla pełnego raportu grupy w PDF
    /// Zawiera wszystkie dane potrzebne do wygenerowania raportu grupy
    /// </summary>
    public class FullGroupReportPdfDto // Klasa publiczna reprezentująca pełny raport grupy
    {
        /// <summary>
        /// Podsumowanie statystyk grupy
        /// </summary>
        public GroupReportSummaryPdfDto? Summary { get; set; } // Właściwość - podsumowanie (nullable)

        /// <summary>
        /// Lista klientów w grupie
        /// </summary>
        public List<GroupReportCustomerPdfDto>? Customers { get; set; } // Właściwość - lista klientów (nullable)

        /// <summary>
        /// Lista faktur w grupie
        /// </summary>
        public List<GroupReportInvoicePdfDto>? Invoices { get; set; } // Właściwość - lista faktur (nullable)

        /// <summary>
        /// Lista zadań w grupie
        /// </summary>
        public List<GroupReportTaskPdfDto>? Tasks { get; set; } // Właściwość - lista zadań (nullable)
    }

    /// <summary>
    /// Serwis generowania dokumentów PDF
    /// Klasa obsługująca generowanie faktur i raportów w formacie PDF
    /// </summary>
    public class InvoicePdfService // Klasa publiczna serwisu PDF
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konstruktor klasy InvoicePdfService
        /// Inicjalizuje serwis z kontekstem bazy danych przekazanym przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        public InvoicePdfService(ApplicationDbContext context) // Konstruktor z dependency injection
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda generowania PDF faktury
        /// Tworzy dokument PDF z danymi faktury i jej pozycjami
        /// </summary>
        /// <param name="invoiceId">ID faktury do wygenerowania PDF</param>
        /// <returns>Tablica bajtów zawierająca dokument PDF</returns>
        public async Task<byte[]> GenerateInvoicePdfAsync(int invoiceId) // Metoda asynchroniczna zwracająca tablicę bajtów
        {
            try // Rozpoczyna blok try-catch do obsługi wyjątków
            {
                // Pobiera fakturę z bazy danych wraz z powiązanymi danymi
                var invoice = await _context.Invoices // Rozpoczyna zapytanie LINQ na tabeli Invoices
                    .Include(i => i.Customer) // Dołącza dane klienta (relacja jeden-do-jednego)
                    .Include(i => i.Items) // Dołącza pozycje faktury (relacja jeden-do-wielu)
                    .FirstOrDefaultAsync(i => i.Id == invoiceId); // Filtruje po ID faktury

                if (invoice == null) // Sprawdza, czy faktura została znaleziona
                {
                    throw new Exception("Faktura nie znaleziona."); // Zgłasza wyjątek, jeśli faktura nie została znaleziona
                }

                // Pobiera ustawienia firmy z bazy danych
                var settings = await _context.Settings.ToDictionaryAsync(s => s.Key, s => s.Value); // Tworzy słownik z ustawieniami
                string companyName = settings.GetValueOrDefault("CompanyName", "Twoja Firma"); // Pobierz nazwę firmy, domyślnie "Twoja Firma"
                string companyAddress = settings.GetValueOrDefault("CompanyAddress", "Adres firmy"); // Pobierz adres firmy, domyślnie "Adres firmy"
                string companyNip = settings.GetValueOrDefault("CompanyNIP", "NIP"); // Pobierz NIP firmy, domyślnie "NIP"
                string companyBankAccount = settings.GetValueOrDefault("CompanyBankAccount", "Numer konta"); // Pobierz numer konta bankowego, domyślnie "Numer konta"

                // Ustawia licencję i konfigurację QuestPDF
                QuestPDF.Settings.License = LicenseType.Community; // Ustawia licencję QuestPDF na wersję Community
                QuestPDF.Settings.DocumentLayoutExceptionThreshold = 1000; // Ustawia próg wyjątku dla układu dokumentu
                QuestPDF.Settings.EnableCaching = false; // Wyłącza buforowanie dokumentów

                var document = Document.Create(container => // Tworzy nowy dokument PDF
                {
                    container.Page(page => // Definiuje stronę dokumentu
                    {
                        page.Size(PageSizes.A4); // Ustawia rozmiar strony na A4
                        page.Margin(2, Unit.Centimetre); // Ustawia marginesy strony
                        page.DefaultTextStyle(x => x.FontSize(10)); // Ustawia domyślny styl tekstu

                        page.Header() // Dodaje nagłówek dokumentu
                            .PaddingBottom(1, Unit.Centimetre) // Dodaje odstęp na dole nagłówka
                            .Column(column => // Tworzy kolumnę w nagłówku
                            {
                                column.Item().Text(text => text.Span("Faktura VAT").SemiBold().FontSize(24).FontColor(Colors.Blue.Medium)); // Dodaje tekst "Faktura VAT"
                                column.Item().Text(text => text.Span($"Numer: {invoice.Number}").FontSize(14)); // Dodaje numer faktury
                                column.Item().Text(text => text.Span($"Data wystawienia: {invoice.IssuedAt:dd.MM.yyyy}").FontSize(10)); // Dodaje datę wystawienia
                                column.Item().Text(text => text.Span($"Termin płatności: {invoice.DueDate:dd.MM.yyyy}").FontSize(10)); // Dodaje termin płatności
                                column.Item().Text(text => text.Span($"Status: {(invoice.IsPaid ? "Zapłacona" : "Oczekuje na płatność")}").FontSize(10)); // Dodaje status faktury
                            });

                        page.Content() // Dodaje treść dokumentu
                            .PaddingVertical(1, Unit.Centimetre) // Dodaje odstęp w pionie w treści
                            .Column(column => // Tworzy kolumnę w treści
                            {
                                column.Item().Row(row => // Tworzy wiersz w kolumnie
                                {
                                    row.RelativeItem().Column(col => // Tworzy kolumnę w wierszu
                                    {
                                        col.Item().Text(text => text.Span("Sprzedawca:").SemiBold()); // Dodaje tekst "Sprzedawca:"
                                        col.Item().Text(text => text.Span(companyName)); // Dodaje nazwę firmy
                                        col.Item().Text(text => text.Span(companyAddress)); // Dodaje adres firmy
                                        col.Item().Text(text => text.Span($"NIP: {companyNip}")); // Dodaje NIP firmy
                                        col.Item().Text(text => text.Span($"Konto: {companyBankAccount}")); // Dodaje numer konta bankowego
                                    });

                                    row.RelativeItem().Column(col => // Tworzy kolumnę w wierszu
                                    {
                                        col.Item().Text(text => text.Span("Nabywca:").SemiBold()); // Dodaje tekst "Nabywca:"
                                        col.Item().Text(text => text.Span(invoice.Customer.Name)); // Dodaje nazwę klienta
                                        col.Item().Text(text => text.Span(invoice.Customer.Address ?? "")); // Dodaje adres klienta
                                        col.Item().Text(text => text.Span(invoice.Customer.Company ?? "")); // Dodaje nazwę firmy klienta
                                        col.Item().Text(text => text.Span(invoice.Customer.Phone ?? "")); // Dodaje numer telefonu klienta
                                        col.Item().Text(text => text.Span(invoice.Customer.Email ?? "")); // Dodaje email klienta
                                    });
                                });

                                column.Item().PaddingVertical(1, Unit.Centimetre).Table(table => // Dodaje tabelę w kolumnie
                                {
                                    table.ColumnsDefinition(columns => // Definiuje kolumny tabeli
                                    {
                                        columns.RelativeColumn(1); // Kolumna o współczynniku 1
                                        columns.RelativeColumn(4); // Kolumna o współczynniku 4
                                        columns.RelativeColumn(1); // Kolumna o współczynniku 1
                                        columns.RelativeColumn(1); // Kolumna o współczynniku 1
                                        columns.RelativeColumn(1); // Kolumna o współczynniku 1
                                        columns.RelativeColumn(1); // Kolumna o współczynniku 1
                                    });

                                    table.Header(header => // Definiuje nagłówek tabeli
                                    {
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Lp.").Bold()); // Kolumna "Lp."
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Opis").Bold()); // Kolumna "Opis"
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Ilość").Bold()); // Kolumna "Ilość"
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Cena jedn.").Bold()); // Kolumna "Cena jedn."
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Netto").Bold()); // Kolumna "Netto"
                                        header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Brutto").Bold()); // Kolumna "Brutto"
                                    });

                                    int lp = 1; // Zmienna do numerowania pozycji w tabeli
                                    foreach (var item in invoice.Items) // Iteruje przez pozycje faktury
                                    {
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span((lp++).ToString())); // Dodaje numer pozycji
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(item.Description)); // Dodaje opis pozycji
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(item.Quantity.ToString())); // Dodaje ilość pozycji
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(item.UnitPrice.ToString("F2"))); // Dodaje cenę jednostkową
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(item.NetAmount.ToString("F2"))); // Dodaje wartość netto
                                        table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(item.GrossAmount.ToString("F2"))); // Dodaje wartość brutto
                                    }
                                });

                                column.Item().AlignRight().Text(text => text.Span($"Suma netto: {invoice.Items.Sum(item => item.NetAmount):F2} PLN").FontSize(12).SemiBold()); // Dodaje sumę netto
                                column.Item().AlignRight().Text(text => text.Span($"Suma VAT: {invoice.Items.Sum(item => item.TaxAmount):F2} PLN").FontSize(12).SemiBold()); // Dodaje sumę VAT
                                column.Item().AlignRight().Text(text => text.Span($"Suma brutto: {invoice.Items.Sum(item => item.GrossAmount):F2} PLN").FontSize(14).Bold()); // Dodaje sumę brutto
                            });

                        page.Footer() // Dodaje stopkę dokumentu
                            .PaddingTop(1, Unit.Centimetre) // Dodaje odstęp na górze stopki
                            .AlignCenter() // Wyśrodkowuje tekst w stopce
                            .Text(text => // Tworzy tekst w stopce
                            {
                                text.Span("Strona "); // Dodaje tekst "Strona "
                                text.CurrentPageNumber(); // Dodaje numer strony
                                text.Span(" z "); // Dodaje tekst " z "
                                text.TotalPages(); // Dodaje numer stron w dokumencie
                            });
                    });
                });

                var pdfBytes = document.GeneratePdf(); // Generuje PDF z dokumentu
                
                // Sprawdza, czy PDF nie jest pusty
                if (pdfBytes == null || pdfBytes.Length == 0) // Jeśli PDF jest pusty
                {
                    Console.WriteLine("Wygenerowany PDF jest pusty - używam fallback CSV"); // Wypisuje komunikat o użyciu fallbacku
                    var csvContent = $"Faktura {invoiceId},Pusta odpowiedź PDF,Spróbuj wyeksportować w formacie CSV"; // Tworzy treść CSV
                    return System.Text.Encoding.UTF8.GetBytes(csvContent); // Zwraca treść CSV jako bajty 
                }
                
                return pdfBytes; // Zwraca wygenerowany PDF jako bajty
            }
            catch (Exception ex) // Przechwytuje wyjątek
            {
                // Jeśli QuestPDF nie działa, zwróć prosty PDF z tekstem
                Console.WriteLine($"Błąd generowania PDF faktury {invoiceId}: {ex.Message}"); // Wypisuje komunikat o błędzie
                Console.WriteLine($"Stack trace: {ex.StackTrace}"); // Wypisuje stack trace
                
                // Sprawdza, czy to problem z fontami
                if (ex.Message.Contains("font") || ex.Message.Contains("Font")) // Jeśli błąd związany z fontami
                {
                    Console.WriteLine("Wykryto problem z fontami - używam fallback CSV"); // Wypisuje komunikat o użyciu fallbacku
                    var csvContent = $"Faktura {invoiceId},Błąd generowania PDF: {ex.Message},Spróbuj wyeksportować w formacie CSV"; // Tworzy treść CSV
                    return System.Text.Encoding.UTF8.GetBytes(csvContent); // Zwraca treść CSV jako bajty
                }
                
                return GenerateSimplePdf($"Faktura {invoiceId} - Błąd generowania: {ex.Message}"); // Wywołuje metodę generowania prostego PDF
            }
        }

        private byte[] GenerateSimplePdf(string content) // Metoda generowania prostego PDF
        {
            try // Rozpoczyna blok try-catch do obsługi wyjątków
            {
                // Ustawia licencję na początku
                QuestPDF.Settings.License = LicenseType.Community; // Ustawia licencję QuestPDF na wersję Community
                
                // Ustawia domyślne fonty
                QuestPDF.Settings.DocumentLayoutExceptionThreshold = 1000; // Ustawia próg wyjątku dla układu dokumentu
                QuestPDF.Settings.EnableCaching = false; // Wyłącza buforowanie dokumentów

                return Document.Create(container => // Tworzy nowy dokument PDF
                {
                    container.Page(page => // Definiuje stronę dokumentu
                    {
                        page.Size(PageSizes.A4); // Ustawia rozmiar strony na A4
                        page.Margin(2, Unit.Centimetre); // Ustawia marginesy strony
                        page.DefaultTextStyle(x => x.FontSize(12).FontFamily("Arial")); // Ustawia domyślny styl tekstu

                        page.Content() // Dodaje treść dokumentu
                            .PaddingVertical(1, Unit.Centimetre) // Dodaje odstęp w pionie w treści
                            .Column(column => // Tworzy kolumnę w treści
                            {
                                column.Item().Text(text => text.Span("Błąd generowania PDF").SemiBold().FontSize(16).FontColor(Colors.Red.Medium)); // Dodaje tekst "Błąd generowania PDF"
                                column.Item().PaddingTop(10).Text(text => text.Span(content)); // Dodaje treść błędu
                                column.Item().PaddingTop(10).Text(text => text.Span("Spróbuj wyeksportować dane w formacie CSV lub Excel.")); // Dodaje wskazówki dotyczące eksportu
                            });
                    });
                }).GeneratePdf(); // Generuje PDF z dokumentu
            }
            catch (Exception ex) // Przechwytuje wyjątek
            {
                // Jeśli QuestPDF nie działa, zwróć prosty tekst jako CSV
                var csvContent = $"Błąd generowania PDF,{content},Spróbuj wyeksportować dane w formacie CSV lub Excel."; // Tworzy treść CSV
                return System.Text.Encoding.UTF8.GetBytes(csvContent); // Zwraca treść CSV jako bajty
            }
        }

        public async Task<byte[]> GenerateGroupReportPdfAsync(string groupName, FullGroupReportPdfDto reportData) // Metoda generowania PDF raportu grupy
        {
            try // Rozpoczyna blok try-catch do obsługi wyjątków
            {
                // Ustawia licencję i konfigurację QuestPDF
                QuestPDF.Settings.License = LicenseType.Community; // Ustawia licencję QuestPDF na wersję Community
                QuestPDF.Settings.DocumentLayoutExceptionThreshold = 1000; // Ustawia próg wyjątku dla układu dokumentu
                QuestPDF.Settings.EnableCaching = false; // Wyłącza buforowanie dokumentów

                var settings = await _context.Settings.ToDictionaryAsync(s => s.Key, s => s.Value); // Pobiera ustawienia firmy
                string companyName = settings.GetValueOrDefault("CompanyName", "Twoja Firma"); // Pobierz nazwę firmy

                return Document.Create(container => // Tworzy nowy dokument PDF
                {
                    container.Page(page => // Definiuje stronę dokumentu
                    {
                        page.Size(PageSizes.A4); // Ustawia rozmiar strony na A4
                        page.Margin(2, Unit.Centimetre); // Ustawia marginesy strony
                        page.DefaultTextStyle(x => x.FontSize(10)); // Ustawia domyślny styl tekstu

                        page.Header() // Dodaje nagłówek dokumentu
                            .PaddingBottom(1, Unit.Centimetre) // Dodaje odstęp na dole nagłówka
                            .Column(column => // Tworzy kolumnę w nagłówku
                            {
                                column.Item().Text(text => text.Span($"Raport dla grupy: {groupName}").SemiBold().FontSize(24).FontColor(Colors.Blue.Medium)); // Dodaje tekst "Raport dla grupy"
                                column.Item().Text(text => text.Span($"Wygenerowano: {DateTime.Now:dd.MM.yyyy HH:mm}").FontSize(10)); // Dodaje datę i czas generowania
                                column.Item().Text(text => text.Span($"Firma: {companyName}").FontSize(10)); // Dodaje nazwę firmy
                            });

                        page.Content() // Dodaje treść dokumentu
                            .PaddingVertical(1, Unit.Centimetre) // Dodaje odstęp w pionie w treści
                            .Column(column => // Tworzy kolumnę w treści
                            {
                                // Podsumowanie
                                column.Item().PaddingBottom(5).Text(text => text.Span("Podsumowanie:").SemiBold().FontSize(14)); // Dodaje podsumowanie
                                column.Item().Text(text => text.Span($"Liczba klientów: {reportData.Summary?.TotalCustomers}")); // Dodaje liczbę klientów
                                column.Item().Text(text => text.Span($"Liczba faktur: {reportData.Summary?.TotalInvoicesSales}")); // Dodaje liczbę faktur
                                column.Item().Text(text => text.Span($"Całkowita wartość faktur: {reportData.Summary?.TotalAmount:F2} PLN")); // Dodaje całkowitą wartość faktur
                                column.Item().Text(text => text.Span($"Liczba zadań: {reportData.Summary?.TotalTasks}")); // Dodaje liczbę zadań
                                column.Item().PaddingBottom(10).Text(text => text.Span("")); // Dodaje odstęp

                                // Sekcja Klientów
                                if (reportData.Customers != null && reportData.Customers.Any()) // Sprawdza, czy lista klientów nie jest pusta
                                {
                                    column.Item().PaddingBottom(5).Text(text => text.Span("Klienci:").SemiBold().FontSize(14)); // Dodaje nagłówek sekcji klientów
                                    column.Item().Table(table => // Dodaje tabelę klientów
                                    {
                                        table.ColumnsDefinition(columns => // Definiuje kolumny tabeli
                                        {
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                        });

                                        table.Header(header => // Definiuje nagłówek tabeli
                                        {
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Nazwa").Bold()); // Kolumna "Nazwa"
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Email").Bold()); // Kolumna "Email"
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Faktur").Bold()); // Kolumna "Faktur"
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Wartość faktur").Bold()); // Kolumna "Wartość faktur"
                                        });

                                        foreach (var customer in reportData.Customers) // Iteruje przez klientów
                                        {
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(customer.Name)); // Dodaje nazwę klienta
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(customer.Email)); // Dodaje email klienta
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(customer.InvoiceCount.ToString())); // Dodaje liczbę faktur
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(customer.TotalInvoiceValue.ToString("F2"))); // Dodaje wartość faktur
                                        }
                                    });
                                    column.Item().PaddingBottom(10).Text(text => text.Span("")); // Dodaje odstęp
                                }

                                // Sekcja Faktur
                                if (reportData.Invoices != null && reportData.Invoices.Any()) // Sprawdza, czy lista faktur nie jest pusta
                                {
                                    column.Item().PaddingBottom(5).Text(text => text.Span("Faktury:").SemiBold().FontSize(14)); // Dodaje nagłówek sekcji faktur
                                    column.Item().Table(table => // Dodaje tabelę faktur
                                    {
                                        table.ColumnsDefinition(columns => // Definiuje kolumny tabeli
                                        {
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                        });

                                        table.Header(header => // Definiuje nagłówek tabeli
                                        {
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Numer").Bold()); // Kolumna "Numer"
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Klient").Bold()); // Kolumna "Klient"
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Wartość").Bold()); // Kolumna "Wartość"
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Data wyst.").Bold()); // Kolumna "Data wyst."
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Status").Bold()); // Kolumna "Status"
                                        });

                                        foreach (var invoice in reportData.Invoices) // Iteruje przez faktury
                                        {
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(invoice.Number)); // Dodaje numer faktury
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(invoice.CustomerName)); // Dodaje nazwę klienta
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(invoice.TotalAmount.ToString("F2"))); // Dodaje wartość faktury
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(invoice.IssuedAt.ToString("dd.MM.yyyy"))); // Dodaje datę wystawienia
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(invoice.IsPaid ? "Opłacona" : "Nieopłacona")); // Dodaje status płatności
                                        }
                                    });
                                    column.Item().PaddingBottom(10).Text(text => text.Span("")); // Dodaje odstęp
                                }

                                // Sekcja Zadań
                                if (reportData.Tasks != null && reportData.Tasks.Any()) // Sprawdza, czy lista zadań nie jest pusta
                                {
                                    column.Item().PaddingBottom(5).Text(text => text.Span("Zadania:").SemiBold().FontSize(14)); // Dodaje nagłówek sekcji zadań
                                    column.Item().Table(table => // Dodaje tabelę zadań
                                    {
                                        table.ColumnsDefinition(columns => // Definiuje kolumny tabeli
                                        {
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                            columns.RelativeColumn(); // Kolumna o współczynniku 1
                                        });

                                        table.Header(header => // Definiuje nagłówek tabeli
                                        {
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Tytuł").Bold()); // Kolumna "Tytuł"
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Klient").Bold()); // Kolumna "Klient"
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Termin").Bold()); // Kolumna "Termin"
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Status").Bold()); // Kolumna "Status"
                                            header.Cell().BorderBottom(1).Padding(5).Text(text => text.Span("Przypisany").Bold()); // Kolumna "Przypisany"
                                        });

                                        foreach (var task in reportData.Tasks) // Iteruje przez zadania
                                        {
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(task.Title)); // Dodaje tytuł zadania
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(task.CustomerName)); // Dodaje nazwę klienta
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(task.DueDate != null ? task.DueDate.Value.ToString("dd.MM.yyyy") : "Brak")); // Dodaje termin zadania
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(task.Completed ? "Ukończone" : "Oczekujące")); // Dodaje status zadania
                                            table.Cell().BorderBottom(1).Padding(5).Text(text => text.Span(task.AssignedUser)); // Dodaje przypisanego użytkownika
                                        }
                                    });
                                }
                            });

                        page.Footer() // Dodaje stopkę dokumentu
                            .PaddingTop(1, Unit.Centimetre) // Dodaje odstęp na górze stopki
                            .AlignCenter() // Wyśrodkowuje tekst w stopce
                            .Text(text => // Tworzy tekst w stopce
                            {
                                text.Span("Strona "); // Dodaje tekst "Strona "
                                text.CurrentPageNumber(); // Dodaje numer strony
                                text.Span(" z "); // Dodaje tekst " z "
                                text.TotalPages(); // Dodaje numer stron w dokumencie
                            });
                    });
                }).GeneratePdf(); // Generuje PDF z dokumentu
            }
            catch (Exception ex) // Przechwytuje wyjątek
            {
                // Jeśli QuestPDF nie działa, zwróć prosty PDF z tekstem
                Console.WriteLine($"Błąd generowania PDF raportu grupy {groupName}: {ex.Message}"); // Wypisuje komunikat o błędzie
                return GenerateSimplePdf($"Raport grupy {groupName} - Błąd generowania: {ex.Message}"); // Wywołuje metodę generowania prostego PDF
            }
        }
    }
}