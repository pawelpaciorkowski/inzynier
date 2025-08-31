// Importuje atrybuty walidacji danych (Required, MaxLength, etc.)
using System.ComponentModel.DataAnnotations;

// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla aktualizacji istniejącej notatki
    /// Służy do przekazywania danych potrzebnych do zaktualizowania notatki w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP PUT/PATCH
    /// Reprezentuje edycję notatki - tekstowej informacji o kliencie lub innej encji
    /// </summary>
    public class UpdateNoteDto
    {
        /// <summary>
        /// ID notatki do zaktualizowania
        /// Wymagane pole - musi być podane aby zidentyfikować którą notatkę aktualizować
        /// Powiązanie z tabelą Notes przez klucz główny
        /// Używane do znalezienia konkretnej notatki w bazie danych
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane - walidacja na poziomie modelu
        public int Id { get; set; } // Właściwość wymagana typu int - identyfikator notatki

        /// <summary>
        /// Nowa treść notatki
        /// Wymagane pole - musi być podane przy aktualizacji notatki
        /// Maksymalna długość 1000 znaków - walidacja na poziomie modelu
        /// Zastąpi istniejącą treść notatki
        /// Przykłady: "Klient zgłosił problem techniczny", "Umówione spotkanie na jutro"
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane
        [MaxLength(1000)] // Atrybut oznaczający maksymalną długość tekstu
        public required string Content { get; set; } // Właściwość wymagana z modyfikatorem required

        /// <summary>
        /// Nowy ID klienta związanego z notatką
        /// Opcjonalne pole - może być null jeśli notatka nie jest powiązana z klientem
        /// Powiązanie z tabelą Customers przez klucz obcy
        /// Pozwala na zmianę przypisania notatki do innego klienta lub usunięcie powiązania
        /// </summary>
        public int? CustomerId { get; set; } // Właściwość opcjonalna typu int nullable - identyfikator klienta
    }
}