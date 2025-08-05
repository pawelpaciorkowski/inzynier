using System.Collections.Generic; // Importuje kolekcje generyczne (IEnumerable, List, etc.)
using System.IO; // Importuje operacje na plikach i strumieniach
using System.Text; // Importuje StringBuilder i Encoding
using CRM.Data.Models; // Importuje modele danych CRM (Customer, Note, Invoice, etc.)
using System.Linq; // Importuje LINQ (Language Integrated Query)

namespace CRM.BusinessLogic.Services // Przestrzeń nazw dla serwisów biznesowych
{
    /// <summary>
    /// Serwis eksportu danych do formatów CSV i XLSX
    /// Klasa implementująca interfejs ICsvExportService, obsługuje eksport danych z systemu CRM
    /// do różnych formatów plików (CSV, XLSX) z możliwością filtrowania kolumn i dołączania relacji
    /// </summary>
    public class CsvExportService : ICsvExportService // Klasa publiczna implementująca interfejs ICsvExportService
    {
        /// <summary>
        /// Metoda eksportu klientów do formatu CSV (podstawowa wersja)
        /// Eksportuje podstawowe dane klientów bez możliwości filtrowania kolumn
        /// Zachowana dla kompatybilności wstecznej
        /// </summary>
        /// <param name="customers">Kolekcja klientów do eksportu</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        public byte[] ExportCustomersToCsv(IEnumerable<CRM.Data.Models.Customer> customers) // Metoda zwracająca tablicę bajtów
        {
            var sb = new StringBuilder(); // Tworzy nowy obiekt StringBuilder do budowania tekstu CSV

            // Dodaje wiersz nagłówka z nazwami kolumn
            sb.AppendLine("Id,Name,Email,Phone,Address,CreatedAt"); // Dodaje nagłówek CSV z podstawowymi kolumnami

            // Dodaje wiersze z danymi klientów
            foreach (var customer in customers) // Iteruje przez wszystkich klientów w kolekcji
            {
                // Dodaje wiersz z danymi klienta, escapując pola które mogą zawierać przecinki
                sb.AppendLine($"{customer.Id},{EscapeCsvField(customer.Name)},{EscapeCsvField(customer.Email)},{EscapeCsvField(customer.Phone)},{EscapeCsvField(customer.Address)},{customer.CreatedAt:yyyy-MM-dd HH:mm:ss}");
            }

            return Encoding.UTF8.GetBytes(sb.ToString()); // Konwertuje tekst CSV na tablicę bajtów w kodowaniu UTF-8
        }

        /// <summary>
        /// Metoda eksportu notatek do formatu CSV (podstawowa wersja)
        /// Eksportuje podstawowe dane notatek bez możliwości filtrowania kolumn
        /// </summary>
        /// <param name="notes">Kolekcja notatek do eksportu</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        public byte[] ExportNotesToCsv(IEnumerable<CRM.Data.Models.Note> notes) // Metoda zwracająca tablicę bajtów
        {
            var sb = new StringBuilder(); // Tworzy nowy obiekt StringBuilder do budowania tekstu CSV
            sb.AppendLine("Id,Content,CreatedAt,CustomerId,UserId"); // Dodaje nagłówek CSV z kolumnami notatek
            
            foreach (var note in notes) // Iteruje przez wszystkie notatki w kolekcji
            {
                // Dodaje wiersz z danymi notatki
                sb.AppendLine($"{note.Id},{EscapeCsvField(note.Content)},{note.CreatedAt:yyyy-MM-dd HH:mm:ss},{note.CustomerId},{note.UserId}");
            }
            return Encoding.UTF8.GetBytes(sb.ToString()); // Konwertuje tekst CSV na tablicę bajtów w kodowaniu UTF-8
        }

        /// <summary>
        /// Metoda eksportu faktur do formatu CSV (podstawowa wersja)
        /// Eksportuje podstawowe dane faktur bez możliwości filtrowania kolumn
        /// </summary>
        /// <param name="invoices">Kolekcja faktur do eksportu</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        public byte[] ExportInvoicesToCsv(IEnumerable<CRM.Data.Models.Invoice> invoices) // Metoda zwracająca tablicę bajtów
        {
            var sb = new StringBuilder(); // Tworzy nowy obiekt StringBuilder do budowania tekstu CSV
            sb.AppendLine("Id,Number,CustomerId,IssuedAt,DueDate,IsPaid,TotalAmount"); // Dodaje nagłówek CSV z kolumnami faktur
            
            foreach (var invoice in invoices) // Iteruje przez wszystkie faktury w kolekcji
            {
                // Dodaje wiersz z danymi faktury
                sb.AppendLine($"{invoice.Id},{EscapeCsvField(invoice.Number)},{invoice.CustomerId},{invoice.IssuedAt:yyyy-MM-dd HH:mm:ss},{invoice.DueDate:yyyy-MM-dd HH:mm:ss},{invoice.IsPaid},{invoice.TotalAmount}");
            }
            return Encoding.UTF8.GetBytes(sb.ToString()); // Konwertuje tekst CSV na tablicę bajtów w kodowaniu UTF-8
        }

        /// <summary>
        /// Metoda eksportu płatności do formatu CSV (podstawowa wersja)
        /// Eksportuje podstawowe dane płatności bez możliwości filtrowania kolumn
        /// </summary>
        /// <param name="payments">Kolekcja płatności do eksportu</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        public byte[] ExportPaymentsToCsv(IEnumerable<CRM.Data.Models.Payment> payments) // Metoda zwracająca tablicę bajtów
        {
            var sb = new StringBuilder(); // Tworzy nowy obiekt StringBuilder do budowania tekstu CSV
            sb.AppendLine("Id,InvoiceId,PaidAt,Amount"); // Dodaje nagłówek CSV z kolumnami płatności
            
            foreach (var payment in payments) // Iteruje przez wszystkie płatności w kolekcji
            {
                // Dodaje wiersz z danymi płatności
                sb.AppendLine($"{payment.Id},{payment.InvoiceId},{payment.PaidAt:yyyy-MM-dd HH:mm:ss},{payment.Amount}");
            }
            return Encoding.UTF8.GetBytes(sb.ToString()); // Konwertuje tekst CSV na tablicę bajtów w kodowaniu UTF-8
        }

        /// <summary>
        /// Metoda eksportu kontraktów do formatu CSV (podstawowa wersja)
        /// Eksportuje podstawowe dane kontraktów bez możliwości filtrowania kolumn
        /// </summary>
        /// <param name="contracts">Kolekcja kontraktów do eksportu</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        public byte[] ExportContractsToCsv(IEnumerable<CRM.Data.Models.Contract> contracts) // Metoda zwracająca tablicę bajtów
        {
            var sb = new StringBuilder(); // Tworzy nowy obiekt StringBuilder do budowania tekstu CSV
            sb.AppendLine("Id,Title,ContractNumber,PlaceOfSigning,SignedAt,StartDate,EndDate,NetAmount,PaymentTermDays,ScopeOfServices,CustomerId"); // Dodaje nagłówek CSV z kolumnami kontraktów
            
            foreach (var contract in contracts) // Iteruje przez wszystkie kontrakty w kolekcji
            {
                // Dodaje wiersz z danymi kontraktu, obsługując nullable daty
                sb.AppendLine($"{contract.Id},{EscapeCsvField(contract.Title)},{EscapeCsvField(contract.ContractNumber)},{EscapeCsvField(contract.PlaceOfSigning)},{contract.SignedAt:yyyy-MM-dd HH:mm:ss},{contract.StartDate?.ToString("yyyy-MM-dd HH:mm:ss")},{contract.EndDate?.ToString("yyyy-MM-dd HH:mm:ss")},{contract.NetAmount},{contract.PaymentTermDays},{EscapeCsvField(contract.ScopeOfServices)},{contract.CustomerId}");
            }
            return Encoding.UTF8.GetBytes(sb.ToString()); // Konwertuje tekst CSV na tablicę bajtów w kodowaniu UTF-8
        }

        /// <summary>
        /// Metoda eksportu klientów do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane klientów z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="customers">Kolekcja klientów do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (grupy, użytkownicy, tagi)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        public byte[] ExportCustomersToCsvAdvanced(IEnumerable<CRM.Data.Models.Customer> customers, string[] columns, bool includeRelations) // Metoda zwracająca tablicę bajtów
        {
            var sb = new StringBuilder(); // Tworzy nowy obiekt StringBuilder do budowania tekstu CSV

            // Dodaje wiersz nagłówka z nazwami kolumn
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray(); // Mapuje nazwy kolumn na nagłówki w języku polskim
            sb.AppendLine(string.Join(",", headers)); // Łączy nagłówki przecinkami i dodaje do CSV

            // Dodaje wiersze z danymi klientów
            foreach (var customer in customers) // Iteruje przez wszystkich klientów w kolekcji
            {
                var values = columns.Select(c => GetCustomerValue(customer, c, includeRelations)).ToArray(); // Pobiera wartości dla każdej kolumny
                sb.AppendLine(string.Join(",", values)); // Łączy wartości przecinkami i dodaje do CSV
            }

            return Encoding.UTF8.GetBytes(sb.ToString()); // Konwertuje tekst CSV na tablicę bajtów w kodowaniu UTF-8
        }

        /// <summary>
        /// Metoda eksportu notatek do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane notatek z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="notes">Kolekcja notatek do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (klienci, użytkownicy)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        public byte[] ExportNotesToCsvAdvanced(IEnumerable<CRM.Data.Models.Note> notes, string[] columns, bool includeRelations) // Metoda zwracająca tablicę bajtów
        {
            var sb = new StringBuilder(); // Tworzy nowy obiekt StringBuilder do budowania tekstu CSV

            // Dodaje wiersz nagłówka z nazwami kolumn
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray(); // Mapuje nazwy kolumn na nagłówki w języku polskim
            sb.AppendLine(string.Join(",", headers)); // Łączy nagłówki przecinkami i dodaje do CSV

            // Dodaje wiersze z danymi notatek
            foreach (var note in notes) // Iteruje przez wszystkie notatki w kolekcji
            {
                var values = columns.Select(c => GetNoteValue(note, c, includeRelations)).ToArray(); // Pobiera wartości dla każdej kolumny
                sb.AppendLine(string.Join(",", values)); // Łączy wartości przecinkami i dodaje do CSV
            }

            return Encoding.UTF8.GetBytes(sb.ToString()); // Konwertuje tekst CSV na tablicę bajtów w kodowaniu UTF-8
        }

        /// <summary>
        /// Metoda eksportu faktur do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane faktur z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="invoices">Kolekcja faktur do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (klienci, grupy, tagi, pozycje)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        public byte[] ExportInvoicesToCsvAdvanced(IEnumerable<CRM.Data.Models.Invoice> invoices, string[] columns, bool includeRelations) // Metoda zwracająca tablicę bajtów
        {
            var sb = new StringBuilder(); // Tworzy nowy obiekt StringBuilder do budowania tekstu CSV

            // Dodaje wiersz nagłówka z nazwami kolumn
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray(); // Mapuje nazwy kolumn na nagłówki w języku polskim
            sb.AppendLine(string.Join(",", headers)); // Łączy nagłówki przecinkami i dodaje do CSV

            // Dodaje wiersze z danymi faktur
            foreach (var invoice in invoices) // Iteruje przez wszystkie faktury w kolekcji
            {
                var values = columns.Select(c => GetInvoiceValue(invoice, c, includeRelations)).ToArray(); // Pobiera wartości dla każdej kolumny
                sb.AppendLine(string.Join(",", values)); // Łączy wartości przecinkami i dodaje do CSV
            }

            return Encoding.UTF8.GetBytes(sb.ToString()); // Konwertuje tekst CSV na tablicę bajtów w kodowaniu UTF-8
        }

        /// <summary>
        /// Metoda eksportu płatności do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane płatności z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="payments">Kolekcja płatności do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (faktury, klienci)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        public byte[] ExportPaymentsToCsvAdvanced(IEnumerable<CRM.Data.Models.Payment> payments, string[] columns, bool includeRelations) // Metoda zwracająca tablicę bajtów
        {
            var sb = new StringBuilder(); // Tworzy nowy obiekt StringBuilder do budowania tekstu CSV

            // Dodaje wiersz nagłówka z nazwami kolumn
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray(); // Mapuje nazwy kolumn na nagłówki w języku polskim
            sb.AppendLine(string.Join(",", headers)); // Łączy nagłówki przecinkami i dodaje do CSV

            // Dodaje wiersze z danymi płatności
            foreach (var payment in payments) // Iteruje przez wszystkie płatności w kolekcji
            {
                var values = columns.Select(c => GetPaymentValue(payment, c, includeRelations)).ToArray(); // Pobiera wartości dla każdej kolumny
                sb.AppendLine(string.Join(",", values)); // Łączy wartości przecinkami i dodaje do CSV
            }

            return Encoding.UTF8.GetBytes(sb.ToString()); // Konwertuje tekst CSV na tablicę bajtów w kodowaniu UTF-8
        }

        /// <summary>
        /// Metoda eksportu kontraktów do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane kontraktów z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="contracts">Kolekcja kontraktów do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (klienci)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        public byte[] ExportContractsToCsvAdvanced(IEnumerable<CRM.Data.Models.Contract> contracts, string[] columns, bool includeRelations) // Metoda zwracająca tablicę bajtów
        {
            var sb = new StringBuilder(); // Tworzy nowy obiekt StringBuilder do budowania tekstu CSV

            // Dodaje wiersz nagłówka z nazwami kolumn
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray(); // Mapuje nazwy kolumn na nagłówki w języku polskim
            sb.AppendLine(string.Join(",", headers)); // Łączy nagłówki przecinkami i dodaje do CSV

            // Dodaje wiersze z danymi kontraktów
            foreach (var contract in contracts) // Iteruje przez wszystkie kontrakty w kolekcji
            {
                var values = columns.Select(c => GetContractValue(contract, c, includeRelations)).ToArray(); // Pobiera wartości dla każdej kolumny
                sb.AppendLine(string.Join(",", values)); // Łączy wartości przecinkami i dodaje do CSV
            }

            return Encoding.UTF8.GetBytes(sb.ToString()); // Konwertuje tekst CSV na tablicę bajtów w kodowaniu UTF-8
        }

        /// <summary>
        /// Metoda eksportu zadań do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane zadań z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="tasks">Kolekcja zadań do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (klienci, użytkownicy, tagi)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        public byte[] ExportTasksToCsvAdvanced(IEnumerable<CRM.Data.Models.TaskItem> tasks, string[] columns, bool includeRelations) // Metoda zwracająca tablicę bajtów
        {
            var sb = new StringBuilder(); // Tworzy nowy obiekt StringBuilder do budowania tekstu CSV

            // Dodaje wiersz nagłówka z nazwami kolumn
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray(); // Mapuje nazwy kolumn na nagłówki w języku polskim
            sb.AppendLine(string.Join(",", headers)); // Łączy nagłówki przecinkami i dodaje do CSV

            // Dodaje wiersze z danymi zadań
            foreach (var task in tasks) // Iteruje przez wszystkie zadania w kolekcji
            {
                var values = columns.Select(c => GetTaskValue(task, c, includeRelations)).ToArray(); // Pobiera wartości dla każdej kolumny
                sb.AppendLine(string.Join(",", values)); // Łączy wartości przecinkami i dodaje do CSV
            }

            return Encoding.UTF8.GetBytes(sb.ToString()); // Konwertuje tekst CSV na tablicę bajtów w kodowaniu UTF-8
        }

        /// <summary>
        /// Metoda eksportu spotkań do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane spotkań z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="meetings">Kolekcja spotkań do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (klienci)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        public byte[] ExportMeetingsToCsvAdvanced(IEnumerable<CRM.Data.Models.Meeting> meetings, string[] columns, bool includeRelations) // Metoda zwracająca tablicę bajtów
        {
            var sb = new StringBuilder(); // Tworzy nowy obiekt StringBuilder do budowania tekstu CSV

            // Dodaje wiersz nagłówka z nazwami kolumn
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray(); // Mapuje nazwy kolumn na nagłówki w języku polskim
            sb.AppendLine(string.Join(",", headers)); // Łączy nagłówki przecinkami i dodaje do CSV

            // Dodaje wiersze z danymi spotkań
            foreach (var meeting in meetings) // Iteruje przez wszystkie spotkania w kolekcji
            {
                var values = columns.Select(c => GetMeetingValue(meeting, c, includeRelations)).ToArray(); // Pobiera wartości dla każdej kolumny
                sb.AppendLine(string.Join(",", values)); // Łączy wartości przecinkami i dodaje do CSV
            }

            return Encoding.UTF8.GetBytes(sb.ToString()); // Konwertuje tekst CSV na tablicę bajtów w kodowaniu UTF-8
        }

        // Helper methods
        /// <summary>
        /// Metoda pomocnicza - mapuje nazwy kolumn na nagłówki w języku polskim
        /// Konwertuje angielskie nazwy kolumn na polskie nagłówki dla plików CSV
        /// </summary>
        /// <param name="column">Angielska nazwa kolumny</param>
        /// <returns>Polski nagłówek kolumny</returns>
        private string GetColumnHeader(string column) // Metoda prywatna zwracająca polski nagłówek
        {
            return column switch // Używa switch expression do mapowania nazw kolumn
            {
                "id" => "ID", // Mapuje "id" na "ID"
                "name" => "Nazwa", // Mapuje "name" na "Nazwa"
                "email" => "Email", // Mapuje "email" na "Email"
                "phone" => "Telefon", // Mapuje "phone" na "Telefon"
                "company" => "Firma", // Mapuje "company" na "Firma"
                "address" => "Adres", // Mapuje "address" na "Adres"
                "nip" => "NIP", // Mapuje "nip" na "NIP"
                "representative" => "Przedstawiciel", // Mapuje "representative" na "Przedstawiciel"
                "createdAt" => "Data utworzenia", // Mapuje "createdAt" na "Data utworzenia"
                "assignedGroup" => "Przypisana grupa", // Mapuje "assignedGroup" na "Przypisana grupa"
                "assignedUser" => "Przypisany użytkownik", // Mapuje "assignedUser" na "Przypisany użytkownik"
                "tags" => "Tagi", // Mapuje "tags" na "Tagi"
                "contractCount" => "Liczba kontraktów", // Mapuje "contractCount" na "Liczba kontraktów"
                "invoiceCount" => "Liczba faktur", // Mapuje "invoiceCount" na "Liczba faktur"
                "totalInvoiceValue" => "Wartość wszystkich faktur", // Mapuje "totalInvoiceValue" na "Wartość wszystkich faktur"
                "paidInvoiceValue" => "Wartość opłaconych faktur", // Mapuje "paidInvoiceValue" na "Wartość opłaconych faktur"
                "number" => "Numer", // Mapuje "number" na "Numer"
                "customerName" => "Nazwa klienta", // Mapuje "customerName" na "Nazwa klienta"
                "customerEmail" => "Email klienta", // Mapuje "customerEmail" na "Email klienta"
                "totalAmount" => "Kwota całkowita", // Mapuje "totalAmount" na "Kwota całkowita"
                "isPaid" => "Opłacona", // Mapuje "isPaid" na "Opłacona"
                "issuedAt" => "Data wystawienia", // Mapuje "issuedAt" na "Data wystawienia"
                "dueDate" => "Termin płatności", // Mapuje "dueDate" na "Termin płatności"
                "createdBy" => "Utworzone przez", // Mapuje "createdBy" na "Utworzone przez"
                "items" => "Pozycje faktury", // Mapuje "items" na "Pozycje faktury"
                "invoiceNumber" => "Numer faktury", // Mapuje "invoiceNumber" na "Numer faktury"
                "amount" => "Kwota", // Mapuje "amount" na "Kwota"
                "paidAt" => "Data płatności", // Mapuje "paidAt" na "Data płatności"
                "paymentMethod" => "Metoda płatności", // Mapuje "paymentMethod" na "Metoda płatności"
                "title" => "Tytuł", // Mapuje "title" na "Tytuł"
                "contractNumber" => "Numer kontraktu", // Mapuje "contractNumber" na "Numer kontraktu"
                "placeOfSigning" => "Miejsce podpisania", // Mapuje "placeOfSigning" na "Miejsce podpisania"
                "signedAt" => "Data podpisania", // Mapuje "signedAt" na "Data podpisania"
                "startDate" => "Data rozpoczęcia", // Mapuje "startDate" na "Data rozpoczęcia"
                "endDate" => "Data zakończenia", // Mapuje "endDate" na "Data zakończenia"
                "netAmount" => "Kwota netto", // Mapuje "netAmount" na "Kwota netto"
                "paymentTermDays" => "Termin płatności (dni)", // Mapuje "paymentTermDays" na "Termin płatności (dni)"
                "scopeOfServices" => "Zakres usług", // Mapuje "scopeOfServices" na "Zakres usług"
                "description" => "Opis", // Mapuje "description" na "Opis"
                "priority" => "Priorytet", // Mapuje "priority" na "Priorytet"
                "topic" => "Temat", // Mapuje "topic" na "Temat"
                "scheduledAt" => "Zaplanowane na", // Mapuje "scheduledAt" na "Zaplanowane na"
                "duration" => "Czas trwania", // Mapuje "duration" na "Czas trwania"
                "location" => "Lokalizacja", // Mapuje "location" na "Lokalizacja"
                "participants" => "Uczestnicy", // Mapuje "participants" na "Uczestnicy"
                "status" => "Status", // Mapuje "status" na "Status"
                "content" => "Treść", // Mapuje "content" na "Treść"
                "updatedAt" => "Data aktualizacji", // Mapuje "updatedAt" na "Data aktualizacji"
                "completed" => "Ukończone", // Mapuje "completed" na "Ukończone"
                _ => column // Domyślny przypadek - zwraca oryginalną nazwę kolumny
            };
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera wartość kolumny dla klienta
        /// Zwraca wartość określonej kolumny dla danego klienta, obsługując relacje
        /// </summary>
        /// <param name="customer">Obiekt klienta</param>
        /// <param name="column">Nazwa kolumny</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane</param>
        /// <returns>Wartość kolumny jako string</returns>
        private string GetCustomerValue(CRM.Data.Models.Customer customer, string column, bool includeRelations) // Metoda prywatna zwracająca wartość kolumny
        {
            return column switch // Używa switch expression do pobierania wartości kolumn
            {
                "id" => customer.Id.ToString(), // Zwraca ID klienta jako string
                "name" => EscapeCsvField(customer.Name), // Zwraca nazwę klienta (escapowaną)
                "email" => EscapeCsvField(customer.Email), // Zwraca email klienta (escapowany)
                "phone" => EscapeCsvField(customer.Phone), // Zwraca telefon klienta (escapowany)
                "company" => EscapeCsvField(customer.Company), // Zwraca firmę klienta (escapowaną)
                "address" => EscapeCsvField(customer.Address), // Zwraca adres klienta (escapowany)
                "nip" => EscapeCsvField(customer.NIP), // Zwraca NIP klienta (escapowany)
                "representative" => EscapeCsvField(customer.Representative), // Zwraca przedstawiciela klienta (escapowanego)
                "createdAt" => customer.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"), // Zwraca datę utworzenia w formacie ISO
                "assignedGroup" => includeRelations && customer.AssignedGroup != null ? EscapeCsvField(customer.AssignedGroup.Name) : "", // Zwraca nazwę przypisanej grupy jeśli relacje są włączone
                "assignedUser" => includeRelations && customer.AssignedUser != null ? EscapeCsvField(customer.AssignedUser.Username) : "", // Zwraca nazwę przypisanego użytkownika jeśli relacje są włączone
                "tags" => includeRelations ? EscapeCsvField(string.Join("; ", customer.CustomerTags?.Select(ct => ct.Tag?.Name) ?? Enumerable.Empty<string>())) : "", // Zwraca tagi klienta oddzielone średnikami
                "contractCount" => includeRelations ? (customer.Contracts?.Count ?? 0).ToString() : "", // Zwraca liczbę kontraktów klienta
                "invoiceCount" => includeRelations ? (customer.Invoices?.Count ?? 0).ToString() : "", // Zwraca liczbę faktur klienta
                "totalInvoiceValue" => includeRelations ? (customer.Invoices?.Sum(i => i.TotalAmount) ?? 0).ToString() : "", // Zwraca sumę wartości wszystkich faktur klienta
                "paidInvoiceValue" => includeRelations ? (customer.Invoices?.Where(i => i.IsPaid).Sum(i => i.TotalAmount) ?? 0).ToString() : "", // Zwraca sumę wartości opłaconych faktur klienta
                _ => "" // Domyślny przypadek - zwraca pusty string
            };
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera wartość kolumny dla notatki
        /// Zwraca wartość określonej kolumny dla danej notatki, obsługując relacje
        /// </summary>
        /// <param name="note">Obiekt notatki</param>
        /// <param name="column">Nazwa kolumny</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane</param>
        /// <returns>Wartość kolumny jako string</returns>
        private string GetNoteValue(CRM.Data.Models.Note note, string column, bool includeRelations) // Metoda prywatna zwracająca wartość kolumny
        {
            return column switch // Używa switch expression do pobierania wartości kolumn
            {
                "id" => note.Id.ToString(), // Zwraca ID notatki jako string
                "content" => EscapeCsvField(note.Content), // Zwraca treść notatki (escapowaną)
                "customerName" => includeRelations && note.Customer != null ? EscapeCsvField(note.Customer.Name) : "", // Zwraca nazwę klienta jeśli relacje są włączone
                "createdBy" => includeRelations && note.User != null ? EscapeCsvField(note.User.Username) : "", // Zwraca nazwę użytkownika który utworzył notatkę
                "createdAt" => note.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"), // Zwraca datę utworzenia w formacie ISO
                "updatedAt" => note.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"), // Note nie ma UpdatedAt - używa CreatedAt
                _ => "" // Domyślny przypadek - zwraca pusty string
            };
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera wartość kolumny dla faktury
        /// Zwraca wartość określonej kolumny dla danej faktury, obsługując relacje
        /// </summary>
        /// <param name="invoice">Obiekt faktury</param>
        /// <param name="column">Nazwa kolumny</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane</param>
        /// <returns>Wartość kolumny jako string</returns>
        private string GetInvoiceValue(CRM.Data.Models.Invoice invoice, string column, bool includeRelations) // Metoda prywatna zwracająca wartość kolumny
        {
            return column switch // Używa switch expression do pobierania wartości kolumn
            {
                "id" => invoice.Id.ToString(), // Zwraca ID faktury jako string
                "number" => EscapeCsvField(invoice.Number), // Zwraca numer faktury (escapowany)
                "customerName" => includeRelations && invoice.Customer != null ? EscapeCsvField(invoice.Customer.Name) : "", // Zwraca nazwę klienta jeśli relacje są włączone
                "customerEmail" => includeRelations && invoice.Customer != null ? EscapeCsvField(invoice.Customer.Email) : "", // Zwraca email klienta jeśli relacje są włączone
                "totalAmount" => invoice.TotalAmount.ToString(), // Zwraca kwotę całkowitą jako string
                "isPaid" => invoice.IsPaid.ToString(), // Zwraca status płatności jako string
                "issuedAt" => invoice.IssuedAt.ToString("yyyy-MM-dd HH:mm:ss"), // Zwraca datę wystawienia w formacie ISO
                "dueDate" => invoice.DueDate.ToString("yyyy-MM-dd HH:mm:ss"), // Zwraca termin płatności w formacie ISO
                "createdBy" => includeRelations && invoice.CreatedByUser != null ? EscapeCsvField(invoice.CreatedByUser.Username) : "", // Zwraca nazwę użytkownika który utworzył fakturę
                "assignedGroup" => includeRelations && invoice.AssignedGroup != null ? EscapeCsvField(invoice.AssignedGroup.Name) : "", // Zwraca nazwę przypisanej grupy
                "tags" => includeRelations ? EscapeCsvField(string.Join("; ", invoice.InvoiceTags?.Select(it => it.Tag?.Name) ?? Enumerable.Empty<string>())) : "", // Zwraca tagi faktury oddzielone średnikami
                "items" => includeRelations ? EscapeCsvField(string.Join("; ", invoice.Items?.Select(ii => $"{ii.Description}: {ii.Quantity}x{ii.UnitPrice}") ?? Enumerable.Empty<string>())) : "", // Zwraca pozycje faktury w formacie "Opis: IlośćxCena"
                _ => "" // Domyślny przypadek - zwraca pusty string
            };
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera wartość kolumny dla płatności
        /// Zwraca wartość określonej kolumny dla danej płatności, obsługując relacje
        /// </summary>
        /// <param name="payment">Obiekt płatności</param>
        /// <param name="column">Nazwa kolumny</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane</param>
        /// <returns>Wartość kolumny jako string</returns>
        private string GetPaymentValue(CRM.Data.Models.Payment payment, string column, bool includeRelations) // Metoda prywatna zwracająca wartość kolumny
        {
            return column switch // Używa switch expression do pobierania wartości kolumn
            {
                "id" => payment.Id.ToString(), // Zwraca ID płatności jako string
                "invoiceNumber" => includeRelations && payment.Invoice != null ? EscapeCsvField(payment.Invoice.Number) : "", // Zwraca numer faktury jeśli relacje są włączone
                "customerName" => includeRelations && payment.Invoice?.Customer != null ? EscapeCsvField(payment.Invoice.Customer.Name) : "", // Zwraca nazwę klienta przez fakturę
                "amount" => payment.Amount.ToString(), // Zwraca kwotę płatności jako string
                "paidAt" => payment.PaidAt.ToString("yyyy-MM-dd HH:mm:ss"), // Zwraca datę płatności w formacie ISO
                "paymentMethod" => "Przelew", // Payment nie ma PaymentMethod - zwraca domyślną wartość
                _ => "" // Domyślny przypadek - zwraca pusty string
            };
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera wartość kolumny dla kontraktu
        /// Zwraca wartość określonej kolumny dla danego kontraktu, obsługując relacje
        /// </summary>
        /// <param name="contract">Obiekt kontraktu</param>
        /// <param name="column">Nazwa kolumny</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane</param>
        /// <returns>Wartość kolumny jako string</returns>
        private string GetContractValue(CRM.Data.Models.Contract contract, string column, bool includeRelations) // Metoda prywatna zwracająca wartość kolumny
        {
            return column switch // Używa switch expression do pobierania wartości kolumn
            {
                "id" => contract.Id.ToString(), // Zwraca ID kontraktu jako string
                "title" => EscapeCsvField(contract.Title), // Zwraca tytuł kontraktu (escapowany)
                "contractNumber" => EscapeCsvField(contract.ContractNumber), // Zwraca numer kontraktu (escapowany)
                "customerName" => includeRelations && contract.Customer != null ? EscapeCsvField(contract.Customer.Name) : "", // Zwraca nazwę klienta jeśli relacje są włączone
                "placeOfSigning" => EscapeCsvField(contract.PlaceOfSigning), // Zwraca miejsce podpisania (escapowane)
                "signedAt" => contract.SignedAt.ToString("yyyy-MM-dd HH:mm:ss"), // Zwraca datę podpisania w formacie ISO
                "startDate" => contract.StartDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "", // Zwraca datę rozpoczęcia (obsługuje null)
                "endDate" => contract.EndDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "", // Zwraca datę zakończenia (obsługuje null)
                "netAmount" => contract.NetAmount.ToString(), // Zwraca kwotę netto jako string
                "paymentTermDays" => contract.PaymentTermDays.ToString(), // Zwraca termin płatności w dniach jako string
                "scopeOfServices" => EscapeCsvField(contract.ScopeOfServices), // Zwraca zakres usług (escapowany)
                _ => "" // Domyślny przypadek - zwraca pusty string
            };
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera wartość kolumny dla zadania
        /// Zwraca wartość określonej kolumny dla danego zadania, obsługując relacje
        /// </summary>
        /// <param name="task">Obiekt zadania</param>
        /// <param name="column">Nazwa kolumny</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane</param>
        /// <returns>Wartość kolumny jako string</returns>
        private string GetTaskValue(CRM.Data.Models.TaskItem task, string column, bool includeRelations) // Metoda prywatna zwracająca wartość kolumny
        {
            return column switch // Używa switch expression do pobierania wartości kolumn
            {
                "id" => task.Id.ToString(), // Zwraca ID zadania jako string
                "title" => EscapeCsvField(task.Title), // Zwraca tytuł zadania (escapowany)
                "description" => EscapeCsvField(task.Description), // Zwraca opis zadania (escapowany)
                "customerName" => includeRelations && task.Customer != null ? EscapeCsvField(task.Customer.Name) : "", // Zwraca nazwę klienta jeśli relacje są włączone
                "assignedUser" => includeRelations && task.User != null ? EscapeCsvField(task.User.Username) : "", // Zwraca nazwę przypisanego użytkownika
                "dueDate" => task.DueDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "", // Zwraca termin wykonania (obsługuje null)
                "completed" => task.Completed.ToString(), // Zwraca status ukończenia jako string
                "priority" => "Normalny", // TaskItem nie ma Priority - zwraca domyślną wartość
                "tags" => includeRelations ? EscapeCsvField(string.Join("; ", task.TaskTags?.Select(tt => tt.Tag?.Name) ?? Enumerable.Empty<string>())) : "", // Zwraca tagi zadania oddzielone średnikami
                "createdAt" => task.DueDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "", // TaskItem nie ma CreatedAt - używa DueDate
                _ => "" // Domyślny przypadek - zwraca pusty string
            };
        }

        /// <summary>
        /// Metoda pomocnicza - pobiera wartość kolumny dla spotkania
        /// Zwraca wartość określonej kolumny dla danego spotkania, obsługując relacje
        /// </summary>
        /// <param name="meeting">Obiekt spotkania</param>
        /// <param name="column">Nazwa kolumny</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane</param>
        /// <returns>Wartość kolumny jako string</returns>
        private string GetMeetingValue(CRM.Data.Models.Meeting meeting, string column, bool includeRelations) // Metoda prywatna zwracająca wartość kolumny
        {
            return column switch // Używa switch expression do pobierania wartości kolumn
            {
                "id" => meeting.Id.ToString(), // Zwraca ID spotkania jako string
                "topic" => EscapeCsvField(meeting.Topic), // Zwraca temat spotkania (escapowany)
                "customerName" => includeRelations && meeting.Customer != null ? EscapeCsvField(meeting.Customer.Name) : "", // Zwraca nazwę klienta jeśli relacje są włączone
                "scheduledAt" => meeting.ScheduledAt.ToString("yyyy-MM-dd HH:mm:ss"), // Zwraca zaplanowaną datę w formacie ISO
                "duration" => "60 min", // Meeting nie ma Duration - zwraca domyślną wartość
                "location" => "Online", // Meeting nie ma Location - zwraca domyślną wartość
                "participants" => "Klient", // Meeting nie ma Participants - zwraca domyślną wartość
                "notes" => "", // Meeting nie ma Notes - zwraca pusty string
                "status" => "Zaplanowane", // Meeting nie ma Status - zwraca domyślną wartość
                _ => "" // Domyślny przypadek - zwraca pusty string
            };
        }

        /// <summary>
        /// Metoda pomocnicza - escapuje pole CSV
        /// Dodaje cudzysłowy i escapuje znaki specjalne w polach CSV zgodnie ze standardem RFC 4180
        /// </summary>
        /// <param name="field">Pole do escapowania</param>
        /// <returns>Escapowane pole CSV</returns>
        private string EscapeCsvField(string? field) // Metoda prywatna zwracająca escapowane pole
        {
            if (string.IsNullOrEmpty(field)) // Sprawdza czy pole jest null lub puste
            {
                return string.Empty; // Zwraca pusty string dla null/empty
            }
            // Jeśli pole zawiera przecinek, cudzysłów, nową linię lub powrót karetki, otacza je cudzysłowami
            if (field.Contains(",") || field.Contains("\"") || field.Contains("\n") || field.Contains("\r"))
            {
                // Escapuje cudzysłowy przez ich podwojenie zgodnie ze standardem CSV
                return $"\"{field.Replace("\"", "\"\"")}\""; // Otacza pole cudzysłowami i escapuje wewnętrzne cudzysłowy
            }
            return field; // Zwraca oryginalne pole jeśli nie wymaga escapowania
        }

        /// <summary>
        /// Metoda eksportu klientów do formatu Excel (XLSX) - fallback dla PDF
        /// Na razie zwracamy CSV jako fallback, ale można dodać prawdziwy XLSX
        /// </summary>
        /// <param name="customers">Kolekcja klientów do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane</param>
        /// <returns>Tablica bajtów zawierająca dane CSV (tymczasowo)</returns>
        public byte[] ExportCustomersToXlsx(IEnumerable<CRM.Data.Models.Customer> customers, string[] columns, bool includeRelations) // Metoda zwracająca tablicę bajtów
        {
            // Na razie zwracamy CSV jako fallback, ale można dodać prawdziwy XLSX
            return ExportCustomersToCsvAdvanced(customers, columns, includeRelations); // Wywołuje metodę CSV jako tymczasowe rozwiązanie
        }

        /// <summary>
        /// Metoda eksportu faktur do formatu Excel (XLSX) - fallback dla PDF
        /// Na razie zwracamy CSV jako fallback, ale można dodać prawdziwy XLSX
        /// </summary>
        /// <param name="invoices">Kolekcja faktur do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane</param>
        /// <returns>Tablica bajtów zawierająca dane CSV (tymczasowo)</returns>
        public byte[] ExportInvoicesToXlsx(IEnumerable<CRM.Data.Models.Invoice> invoices, string[] columns, bool includeRelations) // Metoda zwracająca tablicę bajtów
        {
            // Na razie zwracamy CSV jako fallback, ale można dodać prawdziwy XLSX
            return ExportInvoicesToCsvAdvanced(invoices, columns, includeRelations); // Wywołuje metodę CSV jako tymczasowe rozwiązanie
        }

        /// <summary>
        /// Metoda eksportu zadań do formatu Excel (XLSX) - fallback dla PDF
        /// Na razie zwracamy CSV jako fallback, ale można dodać prawdziwy XLSX
        /// </summary>
        /// <param name="tasks">Kolekcja zadań do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane</param>
        /// <returns>Tablica bajtów zawierająca dane CSV (tymczasowo)</returns>
        public byte[] ExportTasksToXlsx(IEnumerable<CRM.Data.Models.TaskItem> tasks, string[] columns, bool includeRelations) // Metoda zwracająca tablicę bajtów
        {
            // Na razie zwracamy CSV jako fallback, ale można dodać prawdziwy XLSX
            return ExportTasksToCsvAdvanced(tasks, columns, includeRelations); // Wywołuje metodę CSV jako tymczasowe rozwiązanie
        }
    }
}