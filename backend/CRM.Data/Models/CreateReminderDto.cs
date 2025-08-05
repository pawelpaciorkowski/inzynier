using System; // Importuje podstawowe typy systemowe (DateTime, int, string, etc.)
using System.ComponentModel.DataAnnotations; // Importuje atrybuty walidacji danych (Required, MaxLength, etc.)

namespace CRM.Data.Models // Przestrzeń nazw dla modeli danych CRM
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla tworzenia nowego przypomnienia
    /// Służy do przekazywania danych potrzebnych do utworzenia nowego przypomnienia w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP POST
    /// Reprezentuje przypomnienie - zaplanowane powiadomienie o ważnym wydarzeniu lub zadaniu
    /// </summary>
    public class CreateReminderDto // Klasa publiczna reprezentująca DTO tworzenia przypomnienia
    {
        /// <summary>
        /// Treść przypomnienia - opis zadania lub wydarzenia
        /// Wymagane pole - musi być podane przy tworzeniu przypomnienia
        /// Maksymalna długość 500 znaków
        /// Krótki opis tego o czym ma przypomnieć system
        /// Przykłady: "Zadzwoń do klienta ABC", "Spotkanie z zespołem", "Wysłać raport miesięczny"
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane - walidacja na poziomie modelu
        [MaxLength(500)] // Atrybut oznaczający maksymalną długość tekstu - walidacja na poziomie modelu
        public required string Note { get; set; } // Właściwość wymagana typu string z modyfikatorem required

        /// <summary>
        /// Data i czas przypomnienia
        /// Wymagane pole - musi być podane przy tworzeniu przypomnienia
        /// Określa kiedy system ma wyświetlić przypomnienie
        /// Powinna być w przyszłości (po aktualnym czasie)
        /// Format: DateTime (data i czas)
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane - walidacja na poziomie modelu
        public DateTime RemindAt { get; set; } // Właściwość wymagana typu DateTime - data i czas przypomnienia
    }
}