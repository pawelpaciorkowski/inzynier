using System; // Importuje podstawowe typy systemowe (DateTime, int, string, etc.)
using System.ComponentModel.DataAnnotations; // Importuje atrybuty walidacji danych (Key, Required, etc.)

namespace CRM.Data.Models // Przestrzeń nazw dla modeli danych CRM
{
    /// <summary>
    /// Model aktywności użytkownika w systemie CRM
    /// Reprezentuje log aktywności użytkowników - wszystkie działania wykonywane w systemie
    /// Służy do śledzenia historii operacji, audytu i monitorowania aktywności użytkowników
    /// </summary>
    public class Activity // Klasa publiczna reprezentująca aktywność użytkownika
    {
        /// <summary>
        /// Unikalny identyfikator aktywności
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// </summary>
        [Key] // Atrybut oznaczający klucz główny tabeli w Entity Framework
        public int Id { get; set; } // Właściwość typu int - unikalny identyfikator aktywności

        /// <summary>
        /// Opis aktywności - notatka opisująca wykonaną akcję
        /// Opcjonalne pole - może być null dla prostych aktywności
        /// Przykłady: "Utworzono nowego klienta", "Zaktualizowano fakturę", "Usunięto użytkownika"
        /// </summary>
        public string? Note { get; set; } // Właściwość opcjonalna typu string nullable - opis aktywności

        /// <summary>
        /// Data i czas utworzenia aktywności
        /// Automatycznie ustawiana na aktualny czas UTC podczas tworzenia rekordu
        /// Używana do sortowania i filtrowania aktywności według czasu
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Właściwość typu DateTime z wartością domyślną UTC

        // Klucze obce - ZMIANA TUTAJ
        /// <summary>
        /// ID użytkownika który wykonał aktywność
        /// Opcjonalne pole - może być null dla aktywności systemowych
        /// Powiązanie z tabelą Users przez klucz obcy
        /// </summary>
        public int? UserId { get; set; } // Właściwość opcjonalna typu int nullable - ID użytkownika

        /// <summary>
        /// ID klienta związany z aktywnością
        /// Opcjonalne pole - może być null dla aktywności niezwiązanych z klientami
        /// Powiązanie z tabelą Customers przez klucz obcy
        /// </summary>
        public int? CustomerId { get; set; } // Właściwość opcjonalna typu int nullable - ID klienta

        // Właściwości nawigacyjne
        /// <summary>
        /// Właściwość nawigacyjna do użytkownika który wykonał aktywność
        /// Pozwala na łatwe pobieranie danych użytkownika bez dodatkowych zapytań
        /// Opcjonalne - może być null dla aktywności systemowych
        /// </summary>
        public virtual User? User { get; set; } // Właściwość nawigacyjna opcjonalna - powiązanie z modelem User

        /// <summary>
        /// Właściwość nawigacyjna do klienta związanego z aktywnością
        /// Pozwala na łatwe pobieranie danych klienta bez dodatkowych zapytań
        /// Opcjonalne - może być null dla aktywności niezwiązanych z klientami
        /// </summary>
        public virtual Customer? Customer { get; set; } // Właściwość nawigacyjna opcjonalna - powiązanie z modelem Customer
    }
}