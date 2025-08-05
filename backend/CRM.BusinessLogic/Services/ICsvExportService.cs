namespace CRM.BusinessLogic.Services // Przestrzeń nazw dla serwisów biznesowych
{
    /// <summary>
    /// Interfejs serwisu eksportu danych do formatów CSV i XLSX
    /// Definiuje kontrakt dla wszystkich operacji związanych z eksportem danych z systemu CRM
    /// Implementowany przez klasę CsvExportService
    /// </summary>
    public interface ICsvExportService // Interfejs publiczny definiujący kontrakt serwisu eksportu CSV/XLSX
    {
        // Podstawowe metody (zachowane dla kompatybilności)
        /// <summary>
        /// Metoda eksportu klientów do formatu CSV (podstawowa wersja)
        /// Eksportuje dane klientów bez możliwości filtrowania kolumn
        /// </summary>
        /// <param name="customers">Kolekcja klientów do eksportu</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        byte[] ExportCustomersToCsv(IEnumerable<CRM.Data.Models.Customer> customers); // Metoda zwracająca tablicę bajtów

        /// <summary>
        /// Metoda eksportu notatek do formatu CSV (podstawowa wersja)
        /// Eksportuje dane notatek bez możliwości filtrowania kolumn
        /// </summary>
        /// <param name="notes">Kolekcja notatek do eksportu</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        byte[] ExportNotesToCsv(IEnumerable<CRM.Data.Models.Note> notes); // Metoda zwracająca tablicę bajtów

        /// <summary>
        /// Metoda eksportu faktur do formatu CSV (podstawowa wersja)
        /// Eksportuje dane faktur bez możliwości filtrowania kolumn
        /// </summary>
        /// <param name="invoices">Kolekcja faktur do eksportu</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        byte[] ExportInvoicesToCsv(IEnumerable<CRM.Data.Models.Invoice> invoices); // Metoda zwracająca tablicę bajtów

        /// <summary>
        /// Metoda eksportu płatności do formatu CSV (podstawowa wersja)
        /// Eksportuje dane płatności bez możliwości filtrowania kolumn
        /// </summary>
        /// <param name="payments">Kolekcja płatności do eksportu</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        byte[] ExportPaymentsToCsv(IEnumerable<CRM.Data.Models.Payment> payments); // Metoda zwracająca tablicę bajtów

        /// <summary>
        /// Metoda eksportu kontraktów do formatu CSV (podstawowa wersja)
        /// Eksportuje dane kontraktów bez możliwości filtrowania kolumn
        /// </summary>
        /// <param name="contracts">Kolekcja kontraktów do eksportu</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        byte[] ExportContractsToCsv(IEnumerable<CRM.Data.Models.Contract> contracts); // Metoda zwracająca tablicę bajtów

        // Zaawansowane metody z filtrowaniem kolumn i relacji
        /// <summary>
        /// Metoda eksportu klientów do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane klientów z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="customers">Kolekcja klientów do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (grupy, użytkownicy, tagi)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        byte[] ExportCustomersToCsvAdvanced(IEnumerable<CRM.Data.Models.Customer> customers, string[] columns, bool includeRelations); // Metoda zwracająca tablicę bajtów

        /// <summary>
        /// Metoda eksportu notatek do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane notatek z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="notes">Kolekcja notatek do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (klienci, użytkownicy)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        byte[] ExportNotesToCsvAdvanced(IEnumerable<CRM.Data.Models.Note> notes, string[] columns, bool includeRelations); // Metoda zwracająca tablicę bajtów

        /// <summary>
        /// Metoda eksportu faktur do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane faktur z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="invoices">Kolekcja faktur do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (klienci, pozycje faktur)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        byte[] ExportInvoicesToCsvAdvanced(IEnumerable<CRM.Data.Models.Invoice> invoices, string[] columns, bool includeRelations); // Metoda zwracająca tablicę bajtów

        /// <summary>
        /// Metoda eksportu płatności do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane płatności z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="payments">Kolekcja płatności do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (faktury, klienci)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        byte[] ExportPaymentsToCsvAdvanced(IEnumerable<CRM.Data.Models.Payment> payments, string[] columns, bool includeRelations); // Metoda zwracająca tablicę bajtów

        /// <summary>
        /// Metoda eksportu kontraktów do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane kontraktów z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="contracts">Kolekcja kontraktów do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (klienci, użytkownicy)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        byte[] ExportContractsToCsvAdvanced(IEnumerable<CRM.Data.Models.Contract> contracts, string[] columns, bool includeRelations); // Metoda zwracająca tablicę bajtów

        /// <summary>
        /// Metoda eksportu zadań do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane zadań z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="tasks">Kolekcja zadań do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (klienci, użytkownicy)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        byte[] ExportTasksToCsvAdvanced(IEnumerable<CRM.Data.Models.TaskItem> tasks, string[] columns, bool includeRelations); // Metoda zwracająca tablicę bajtów

        /// <summary>
        /// Metoda eksportu spotkań do formatu CSV (zaawansowana wersja)
        /// Eksportuje dane spotkań z możliwością filtrowania kolumn i dołączania relacji
        /// </summary>
        /// <param name="meetings">Kolekcja spotkań do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (klienci, użytkownicy)</param>
        /// <returns>Tablica bajtów zawierająca dane CSV</returns>
        byte[] ExportMeetingsToCsvAdvanced(IEnumerable<CRM.Data.Models.Meeting> meetings, string[] columns, bool includeRelations); // Metoda zwracająca tablicę bajtów
        
        // Metody dla formatu Excel (XLSX) - fallback dla PDF
        /// <summary>
        /// Metoda eksportu klientów do formatu Excel (XLSX)
        /// Eksportuje dane klientów do formatu XLSX jako fallback dla PDF
        /// </summary>
        /// <param name="customers">Kolekcja klientów do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (grupy, użytkownicy, tagi)</param>
        /// <returns>Tablica bajtów zawierająca dane XLSX</returns>
        byte[] ExportCustomersToXlsx(IEnumerable<CRM.Data.Models.Customer> customers, string[] columns, bool includeRelations); // Metoda zwracająca tablicę bajtów

        /// <summary>
        /// Metoda eksportu faktur do formatu Excel (XLSX)
        /// Eksportuje dane faktur do formatu XLSX jako fallback dla PDF
        /// </summary>
        /// <param name="invoices">Kolekcja faktur do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (klienci, pozycje faktur)</param>
        /// <returns>Tablica bajtów zawierająca dane XLSX</returns>
        byte[] ExportInvoicesToXlsx(IEnumerable<CRM.Data.Models.Invoice> invoices, string[] columns, bool includeRelations); // Metoda zwracająca tablicę bajtów

        /// <summary>
        /// Metoda eksportu zadań do formatu Excel (XLSX)
        /// Eksportuje dane zadań do formatu XLSX jako fallback dla PDF
        /// </summary>
        /// <param name="tasks">Kolekcja zadań do eksportu</param>
        /// <param name="columns">Tablica nazw kolumn do eksportu</param>
        /// <param name="includeRelations">Czy dołączyć powiązane dane (klienci, użytkownicy)</param>
        /// <returns>Tablica bajtów zawierająca dane XLSX</returns>
        byte[] ExportTasksToXlsx(IEnumerable<CRM.Data.Models.TaskItem> tasks, string[] columns, bool includeRelations); // Metoda zwracająca tablicę bajtów
    }
}