using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using Microsoft.Extensions.Logging; // Importuje system logowania Microsoft
using Xceed.Words.NET; // Importuje bibliotekę Xceed.Words.NET do pracy z dokumentami Word

namespace CRM.BusinessLogic.Services // Przestrzeń nazw dla serwisów biznesowych
{
    /// <summary>
    /// Serwis generowania dokumentów Word
    /// Klasa obsługująca generowanie dokumentów Word na podstawie szablonów
    /// z automatycznym zastępowaniem placeholderów danymi z systemu CRM
    /// </summary>
    public class DocumentGenerationService // Klasa publiczna serwisu generowania dokumentów
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Logger do zapisywania informacji o operacjach
        /// Używany do logowania operacji generowania dokumentów
        /// </summary>
        private readonly ILogger<DocumentGenerationService> _logger; // Pole tylko do odczytu - logger

        /// <summary>
        /// Konstruktor klasy DocumentGenerationService
        /// Inicjalizuje serwis z kontekstem bazy danych i loggerem przekazanymi przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        /// <param name="logger">Logger przekazany przez system dependency injection</param>
        public DocumentGenerationService(ApplicationDbContext context, ILogger<DocumentGenerationService> logger) // Konstruktor z dependency injection
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
            _logger = logger; // Przypisuje przekazany logger do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda generowania dokumentu kontraktu na podstawie szablonu
        /// Tworzy dokument Word z szablonu, zastępując placeholdery danymi kontraktu i klienta
        /// </summary>
        /// <param name="contractId">ID kontraktu do wygenerowania dokumentu</param>
        /// <param name="templateId">ID szablonu Word do użycia</param>
        /// <returns>Tablica bajtów zawierająca wygenerowany dokument Word</returns>
        /// <exception cref="Exception">Rzucany gdy nie znaleziono szablonu, kontraktu lub powiązanego klienta</exception>
        public async Task<byte[]> GenerateContractDocumentAsync(int contractId, int templateId) // Metoda asynchroniczna zwracająca tablicę bajtów
        {
            // Pobiera szablon dokumentu z bazy danych
            var template = await _context.Templates.FindAsync(templateId); // Wyszukuje szablon po ID
            
            // Pobiera kontrakt z bazy danych wraz z danymi klienta
            var contract = await _context.Contracts.Include(c => c.Customer).FirstOrDefaultAsync(c => c.Id == contractId); // Wyszukuje kontrakt z dołączonymi danymi klienta
            
            // Pobiera ustawienia firmy z bazy danych
            var settings = await _context.Settings.ToDictionaryAsync(s => s.Key, s => s.Value); // Tworzy słownik z ustawieniami firmy

            // Sprawdza czy szablon i kontrakt z klientem istnieją
            if (template == null || contract?.Customer == null) // Jeśli szablon lub kontrakt/klient nie istnieją
            {
                throw new Exception("Nie znaleziono szablonu, kontraktu lub powiązanego klienta."); // Rzuca wyjątek z komunikatem
            }

            // Loguje informację o rozpoczęciu generowania dokumentu
            _logger.LogInformation("Generowanie dokumentu dla kontraktu: '{Title}'", contract.Title); // Zapisuje log o generowaniu dokumentu

            // Tworzy ścieżkę do tymczasowego pliku
            var tempFilePath = Path.GetTempFileName() + ".docx"; // Tworzy unikalną nazwę pliku tymczasowego z rozszerzeniem .docx
            
            try // Rozpoczyna blok try-finally do obsługi zasobów
            {
                // Kopiuje szablon do pliku tymczasowego
                await File.WriteAllBytesAsync(tempFilePath, await File.ReadAllBytesAsync(template.FilePath)); // Kopiuje zawartość szablonu do pliku tymczasowego

                // Otwiera dokument Word z pliku tymczasowego
                using (var document = DocX.Load(tempFilePath)) // Tworzy obiekt dokumentu Word z pliku tymczasowego
                {
                    // Definiuje słownik placeholderów i ich wartości do zastąpienia
                    var placeholders = new Dictionary<string, string> // Tworzy słownik par klucz-wartość
                    {
                        // Placeholdery związane z kontraktem
                        { "{TYTUL_UMOWY}", contract.Title ?? "" }, // Tytuł umowy lub pusty string
                        { "{NUMER_UMOWY}", contract.ContractNumber ?? "" }, // Numer umowy lub pusty string
                        { "{MIEJSCE_ZAWARCIA}", contract.PlaceOfSigning ?? "" }, // Miejsce zawarcia umowy lub pusty string
                        { "{DATA_PODPISANIA}", contract.SignedAt.ToString("dd.MM.yyyy") }, // Data podpisania w formacie dd.MM.yyyy
                        { "{DATA_ROZPOCZECIA}", contract.StartDate?.ToString("dd.MM.yyyy") ?? "" }, // Data rozpoczęcia lub pusty string
                        { "{DATA_ZAKONCZENIA}", contract.EndDate?.ToString("dd.MM.yyyy") ?? "" }, // Data zakończenia lub pusty string
                        { "{KWOTA_WYNAGRODZENIA_NETTO}", contract.NetAmount?.ToString("F2") ?? "0.00" }, // Kwota wynagrodzenia netto lub "0.00"
                        { "{TERMIN_PLATNOSCI}", contract.PaymentTermDays?.ToString() ?? "" }, // Termin płatności w dniach lub pusty string
                        { "{SZCZEGOLOWY_ZAKRES_USLUG}", contract.ScopeOfServices ?? "" }, // Szczegółowy zakres usług lub pusty string

                        // Placeholdery związane z klientem
                        { "{NAZWA_KLIENTA}", contract.Customer.Name ?? "" }, // Nazwa klienta lub pusty string
                        { "{ADRES_KLIENTA}", contract.Customer.Address ?? "" }, // Adres klienta lub pusty string
                        { "{NIP_KLIENTA}", contract.Customer.NIP ?? "" }, // NIP klienta lub pusty string
                        { "{REPREZENTANT_KLIENTA}", contract.Customer.Representative ?? ""}, // Przedstawiciel klienta lub pusty string

                        // Placeholdery związane z wykonawcą (firmą)
                        { "{NAZWA_WYKONAWCY}", settings.GetValueOrDefault("CompanyName", "TWOJA FIRMA") }, // Nazwa firmy z ustawień lub domyślna wartość
                        { "{ADRES_WYKONAWCY}", settings.GetValueOrDefault("CompanyAddress", "TWÓJ ADRES") }, // Adres firmy z ustawień lub domyślna wartość
                        { "{NIP_WYKONAWCY}", settings.GetValueOrDefault("CompanyNIP", "TWÓJ NIP") }, // NIP firmy z ustawień lub domyślna wartość
                        { "{NUMER_KONTA_BANKOWEGO_WYKONAWCY}", settings.GetValueOrDefault("CompanyBankAccount", "TWÓJ NUMER KONTA") } // Numer konta bankowego z ustawień lub domyślna wartość
                    };

                    // Iteruje przez wszystkie paragrafy w dokumencie
                    foreach (var p in document.Paragraphs) // Przechodzi przez każdy paragraf w dokumencie
                    {
                        // Iteruje przez wszystkie placeholdery i zastępuje je wartościami
                        foreach (var placeholder in placeholders) // Przechodzi przez każdą parę placeholder-wartość
                        {
                            p.ReplaceText(placeholder.Key, placeholder.Value); // Zastępuje placeholder jego wartością w paragrafie
                        }
                    }

                    // Zapisuje zmodyfikowany dokument
                    document.Save(); // Zapisuje dokument z zastąpionymi placeholderami
                }

                // Zwraca zawartość wygenerowanego dokumentu jako tablicę bajtów
                return await File.ReadAllBytesAsync(tempFilePath); // Odczytuje plik tymczasowy i zwraca jego zawartość jako bajty
            }
            finally // Blok finally wykonuje się zawsze, niezależnie od tego czy wystąpił wyjątek
            {
                // Usuwa plik tymczasowy po zakończeniu operacji
                if (File.Exists(tempFilePath)) // Sprawdza czy plik tymczasowy istnieje
                {
                    File.Delete(tempFilePath); // Usuwa plik tymczasowy z dysku
                }
            }
        }
    }
}