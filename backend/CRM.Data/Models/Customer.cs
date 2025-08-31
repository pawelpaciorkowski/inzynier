// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Model reprezentujący klienta w systemie CRM
    /// Centralny element systemu - zawiera wszystkie informacje o kliencie
    /// Służy do zarządzania danymi kontaktowymi, fakturowymi i biznesowymi klientów
    /// Posiada relacje z wieloma innymi encjami systemu (faktury, kontrakty, spotkania, etc.)
    /// </summary>
    public class Customer
    {
        /// <summary>
        /// Unikalny identyfikator klienta
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany jako klucz obcy w innych tabelach (Invoice, Contract, Meeting, etc.)
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Nazwa klienta lub imię i nazwisko osoby prywatnej
        /// Wymagane pole - główny identyfikator klienta dla użytkowników
        /// Przykłady: "Jan Kowalski", "ABC Sp. z o.o.", "Firma XYZ"
        /// Używane w wyszukiwaniu i wyświetlaniu list klientów
        /// </summary>
        public string Name { get; set; } = default!; // Właściwość wymagana z domyślną wartością
        
        /// <summary>
        /// Adres email klienta
        /// Wymagane pole - główny kanał komunikacji elektronicznej
        /// Używane do wysyłania faktur, powiadomień i korespondencji
        /// Musi być w poprawnym formacie email
        /// </summary>
        public string Email { get; set; } = default!; // Właściwość wymagana z domyślną wartością
        
        /// <summary>
        /// Numer telefonu klienta
        /// Opcjonalne pole - dodatkowy kanał komunikacji
        /// Może zawierać numery stacjonarne lub komórkowe
        /// Przydatne do szybkiego kontaktu w pilnych sprawach
        /// </summary>
        public string? Phone { get; set; } // Właściwość opcjonalna typu string nullable
        
        /// <summary>
        /// Nazwa firmy klienta (dla klientów biznesowych)
        /// Opcjonalne pole - wypełniane gdy klient reprezentuje firmę
        /// Może być różne od pola Name (np. Name="Jan Kowalski", Company="ABC Sp. z o.o.")
        /// Używane na fakturach i dokumentach biznesowych
        /// </summary>
        public string? Company { get; set; } // Właściwość opcjonalna typu string nullable
        
        /// <summary>
        /// Data utworzenia rekordu klienta w systemie
        /// Automatycznie ustawiana podczas dodawania klienta
        /// Używana do sortowania, raportowania i analizy wzrostu bazy klientów
        /// Przechowywana jako UTC dla spójności czasowej
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Pełny adres klienta (ulica, numer, miasto, kod pocztowy)
        /// Opcjonalne pole - używane do faktury, dostaw, korespondencji
        /// Może być adresem siedziby firmy lub adresem zamieszkania
        /// Przydatne dla klientów wymagających fizycznej dostawy
        /// </summary>
        public string? Address { get; set; } // Właściwość opcjonalna typu string nullable
        
        /// <summary>
        /// Numer identyfikacji podatkowej (NIP) klienta
        /// Opcjonalne pole - wymagane dla klientów biznesowych w Polsce
        /// Używane na fakturach VAT i do weryfikacji danych w systemach zewnętrznych
        /// Musi być w poprawnym formacie polskiego NIP-u (10 cyfr)
        /// </summary>
        public string? NIP { get; set; } // Właściwość opcjonalna typu string nullable
        
        /// <summary>
        /// Przedstawiciel klienta - osoba kontaktowa po stronie klienta
        /// Opcjonalne pole - nazwa osoby odpowiedzialnej za współpracę
        /// Przykład: "Anna Nowak - Dyrektor ds. Zakupów"
        /// Przydatne w komunikacji z dużymi firmami mającymi wielu pracowników
        /// </summary>
        public string? Representative { get; set; } // Właściwość opcjonalna typu string nullable

        // SEKCJA POWIĄZAŃ Z GRUPAMI I UŻYTKOWNIKAMI
        /// <summary>
        /// ID grupy do której przypisany jest klient
        /// Opcjonalne pole - pozwala na grupowanie klientów według kategorii
        /// Powiązanie z tabelą Groups przez klucz obcy
        /// Ułatwia zarządzanie i filtrowanie klientów według segmentów
        /// </summary>
        public int? AssignedGroupId { get; set; } // Klucz obcy - ID grupy
        
        /// <summary>
        /// Właściwość nawigacyjna do grupy przypisanej klientowi
        /// Pozwala na łatwe pobieranie informacji o grupie bez dodatkowych zapytań
        /// Opcjonalna - może być null jeśli klient nie jest przypisany do grupy
        /// Używana w zapytaniach LINQ do pobierania danych grupy
        /// </summary>
        public virtual Group? AssignedGroup { get; set; } // Właściwość nawigacyjna
        
        /// <summary>
        /// ID użytkownika odpowiedzialnego za obsługę tego klienta
        /// Opcjonalne pole - pozwala na przypisanie klienta do konkretnego pracownika
        /// Powiązanie z tabelą Users przez klucz obcy
        /// Ułatwia podział obowiązków i odpowiedzialności w zespole
        /// </summary>
        public int? AssignedUserId { get; set; } // Klucz obcy - ID użytkownika
        
        /// <summary>
        /// Właściwość nawigacyjna do użytkownika odpowiedzialnego za klienta
        /// Pozwala na łatwe pobieranie informacji o przypisanym pracowniku
        /// Opcjonalna - może być null jeśli klient nie ma przypisanego opiekuna
        /// Używana do wyświetlania informacji o odpowiedzialności za klienta
        /// </summary>
        public virtual User? AssignedUser { get; set; } // Właściwość nawigacyjna

        // SEKCJA POWIĄZAŃ Z TAGAMI
        /// <summary>
        /// Kolekcja tagów przypisanych do klienta
        /// Relacja wiele-do-wielu z modelem Tag poprzez tabelę łączącą CustomerTag
        /// Pozwala na elastyczne etykietowanie klientów (VIP, problematyczny, potencjalny, etc.)
        /// Inicjalizowana jako pusta lista - może być pusta ale nie null
        /// </summary>
        public virtual ICollection<CustomerTag> CustomerTags { get; set; } = new List<CustomerTag>();

        // SEKCJA POWIĄZAŃ Z INNYMI ENCJAMI
        /// <summary>
        /// Kolekcja kontraktów zawartych z tym klientem
        /// Relacja jeden-do-wielu z modelem Contract
        /// Przechowuje wszystkie umowy i porozumienia z klientem
        /// Inicjalizowana jako pusta lista - nowy klient nie ma jeszcze kontraktów
        /// </summary>
        public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();
        
        /// <summary>
        /// Kolekcja faktur wystawionych dla tego klienta
        /// Relacja jeden-do-wielu z modelem Invoice
        /// Przechowuje całą historię rozliczeń finansowych z klientem
        /// Używana do analiz finansowych i raportowania
        /// </summary>
        public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        
        /// <summary>
        /// Kolekcja spotkań zaplanowanych lub odbytych z tym klientem
        /// Relacja jeden-do-wielu z modelem Meeting
        /// Przechowuje historię i plany komunikacji z klientem
        /// Używana do śledzenia relacji i planowania działań sprzedażowych
        /// </summary>
        public virtual ICollection<Meeting> Meetings { get; set; } = new List<Meeting>();
        
        /// <summary>
        /// Kolekcja notatek związanych z tym klientem
        /// Relacja jeden-do-wielu z modelem Note
        /// Przechowuje ważne informacje, obserwacje i uwagi dotyczące klienta
        /// Używana przez pracowników do dzielenia się wiedzą o kliencie
        /// </summary>
        public virtual ICollection<Note> Notes { get; set; } = new List<Note>();
    }
}
