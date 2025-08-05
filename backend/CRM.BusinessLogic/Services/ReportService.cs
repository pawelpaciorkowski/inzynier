using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using QuestPDF.Fluent; // Importuje bibliotekę QuestPDF do generowania PDF
using QuestPDF.Helpers; // Importuje pomocnicze klasy QuestPDF
using QuestPDF.Infrastructure; // Importuje infrastrukturę QuestPDF

namespace CRM.BusinessLogic.Services // Przestrzeń nazw dla serwisów biznesowych
{
    /// <summary>
    /// Serwis generowania raportów
    /// Klasa obsługująca generowanie różnych typów raportów w formacie PDF
    /// Używa biblioteki QuestPDF do tworzenia dokumentów
    /// </summary>
    public class ReportService // Klasa publiczna serwisu raportów
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konstruktor klasy ReportService
        /// Inicjalizuje serwis z kontekstem bazy danych przekazanym przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        public ReportService(ApplicationDbContext context) // Konstruktor z dependency injection
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda generowania raportu klientów w formacie PDF
        /// Tworzy dokument PDF z listą wszystkich klientów w formie tabeli
        /// </summary>
        /// <returns>Tablica bajtów zawierająca wygenerowany dokument PDF</returns>
        public async Task<byte[]> GenerateClientsReportAsync() // Metoda asynchroniczna zwracająca tablicę bajtów
        {
            // Pobiera wszystkich klientów z bazy danych posortowanych według nazwy
            var clients = await _context.Customers // Rozpoczyna zapytanie LINQ na tabeli Customers
                .OrderBy(c => c.Name) // Sortuje klientów według nazwy alfabetycznie
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników

            // Ustawia licencję QuestPDF na wersję Community (darmową)
            QuestPDF.Settings.License = LicenseType.Community; // Ustawia typ licencji QuestPDF

            // Tworzy nowy dokument PDF
            var document = Document.Create(container => // Tworzy nowy dokument PDF z konfiguracją
            {
                container.Page(page => // Definiuje stronę dokumentu
                {
                    // Ustawia rozmiar strony na A4
                    page.Size(PageSizes.A4); // Ustawia rozmiar strony na standardowy format A4
                    
                    // Ustawia marginesy strony na 2 centymetry
                    page.Margin(2, Unit.Centimetre); // Ustawia marginesy ze wszystkich stron
                    
                    // Ustawia domyślny styl tekstu na rozmiar 12
                    page.DefaultTextStyle(x => x.FontSize(12)); // Ustawia domyślny rozmiar czcionki

                    // Dodaje nagłówek strony
                    page.Header() // Rozpoczyna definicję nagłówka strony
                        .Text("Raport Klientów") // Dodaje tekst "Raport Klientów"
                        .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium); // Formatuje tekst: półgruby, rozmiar 20, kolor niebieski

                    // Dodaje treść strony
                    page.Content() // Rozpoczyna definicję treści strony
                        .PaddingVertical(1, Unit.Centimetre) // Dodaje odstęp w pionie 1 cm
                        .Column(col => // Tworzy kolumnę w treści
                        {
                            col.Item().Table(table => // Dodaje tabelę w kolumnie
                            {
                                // Definiuje kolumny tabeli z ich szerokościami
                                table.ColumnsDefinition(columns => // Definiuje układ kolumn tabeli
                                {
                                    columns.RelativeColumn(3); // Pierwsza kolumna o współczynniku 3 (Imię i Nazwisko)
                                    columns.RelativeColumn(4); // Druga kolumna o współczynniku 4 (Email)
                                    columns.RelativeColumn(3); // Trzecia kolumna o współczynniku 3 (Telefon)
                                    columns.RelativeColumn(3); // Czwarta kolumna o współczynniku 3 (Firma)
                                });

                                // Dodaje nagłówek tabeli
                                table.Header(header => // Definiuje nagłówek tabeli
                                {
                                    // Pierwsza kolumna nagłówka - Imię i Nazwisko
                                    header.Cell().BorderBottom(1).Padding(5).Background(Colors.Grey.Lighten3).Text("Imię i Nazwisko").Bold(); // Komórka z dolną ramką, paddingiem, szarym tłem i pogrubionym tekstem
                                    
                                    // Druga kolumna nagłówka - Email
                                    header.Cell().BorderBottom(1).Padding(5).Background(Colors.Grey.Lighten3).Text("Email").Bold(); // Komórka z dolną ramką, paddingiem, szarym tłem i pogrubionym tekstem
                                    
                                    // Trzecia kolumna nagłówka - Telefon
                                    header.Cell().BorderBottom(1).Padding(5).Background(Colors.Grey.Lighten3).Text("Telefon").Bold(); // Komórka z dolną ramką, paddingiem, szarym tłem i pogrubionym tekstem
                                    
                                    // Czwarta kolumna nagłówka - Firma
                                    header.Cell().BorderBottom(1).Padding(5).Background(Colors.Grey.Lighten3).Text("Firma").Bold(); // Komórka z dolną ramką, paddingiem, szarym tłem i pogrubionym tekstem
                                });

                                // Iteruje przez wszystkich klientów i dodaje wiersze do tabeli
                                foreach (var client in clients) // Przechodzi przez każdego klienta w kolekcji
                                {
                                    // Pierwsza kolumna - Imię i Nazwisko klienta
                                    table.Cell().BorderBottom(1).Padding(5).Text(client.Name); // Komórka z dolną ramką, paddingiem i nazwą klienta
                                    
                                    // Druga kolumna - Email klienta
                                    table.Cell().BorderBottom(1).Padding(5).Text(client.Email); // Komórka z dolną ramką, paddingiem i emailem klienta
                                    
                                    // Trzecia kolumna - Telefon klienta
                                    table.Cell().BorderBottom(1).Padding(5).Text(client.Phone); // Komórka z dolną ramką, paddingiem i telefonem klienta
                                    
                                    // Czwarta kolumna - Firma klienta
                                    table.Cell().BorderBottom(1).Padding(5).Text(client.Company); // Komórka z dolną ramką, paddingiem i firmą klienta
                                }
                            });
                        });

                    // Dodaje stopkę strony
                    page.Footer() // Rozpoczyna definicję stopki strony
                        .AlignCenter() // Wyśrodkowuje tekst w stopce
                        .Text(x => // Tworzy tekst w stopce
                        {
                            x.Span("Strona "); // Dodaje tekst "Strona "
                            x.CurrentPageNumber(); // Dodaje numer aktualnej strony
                        });
                });
            });

            // Generuje PDF z dokumentu i zwraca jako tablicę bajtów
            return document.GeneratePdf(); // Generuje dokument PDF i zwraca jego zawartość jako bajty
        }
    }
}