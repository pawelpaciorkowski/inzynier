using System.ComponentModel.DataAnnotations; // Importuje atrybuty walidacji danych (Required, MaxLength, etc.)

namespace CRM.Data.Models // Przestrzeń nazw dla modeli danych CRM
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla tworzenia nowej notatki
    /// Służy do przekazywania danych potrzebnych do utworzenia nowej notatki w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP POST
    /// Reprezentuje notatkę - tekstową informację o kliencie, zadaniu lub innej entytii
    /// </summary>
    public class CreateNoteDto // Klasa publiczna reprezentująca DTO tworzenia notatki
    {
        /// <summary>
        /// Treść notatki
        /// Wymagane pole - musi być podane przy tworzeniu notatki
        /// Maksymalna długość 1000 znaków
        /// Główna zawartość notatki - opis, uwagi, komentarze
        /// Przykłady: "Klient zgłosił problem techniczny", "Umówione spotkanie na jutro", "Ważne uwagi do projektu"
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane - walidacja na poziomie modelu
        [MaxLength(1000)] // Atrybut oznaczający maksymalną długość tekstu - walidacja na poziomie modelu
        public required string Content { get; set; } // Właściwość wymagana typu string z modyfikatorem required

        /// <summary>
        /// ID klienta związanego z notatką
        /// Opcjonalne pole - może być null dla notatek ogólnych
        /// Powiązanie z tabelą Customers przez klucz obcy
        /// Jeśli podane, notatka będzie przypisana do konkretnego klienta
        /// </summary>
        public int? CustomerId { get; set; } // Właściwość opcjonalna typu int nullable - identyfikator klienta
    }
}