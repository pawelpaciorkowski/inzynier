// Importuje podstawowe typy systemowe (DateTime, int, string, etc.)
using System;
// Importuje atrybuty walidacji danych (Required, MaxLength, etc.)
using System.ComponentModel.DataAnnotations;

// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla aktualizacji istniejącego przypomnienia
    /// Służy do przekazywania danych potrzebnych do zaktualizowania przypomnienia w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP PUT/PATCH
    /// Reprezentuje edycję przypomnienia - zaplanowanego powiadomienia o ważnym wydarzeniu
    /// </summary>
    public class UpdateReminderDto
    {
        /// <summary>
        /// ID przypomnienia do zaktualizowania
        /// Wymagane pole - musi być podane aby zidentyfikować które przypomnienie aktualizować
        /// Powiązanie z tabelą Reminders przez klucz główny
        /// Używane do znalezienia konkretnego przypomnienia w bazie danych
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane - walidacja na poziomie modelu
        public int Id { get; set; } // Właściwość wymagana typu int - identyfikator przypomnienia

        /// <summary>
        /// Nowa treść przypomnienia - opis zadania lub wydarzenia
        /// Wymagane pole - musi być podane przy aktualizacji przypomnienia
        /// Maksymalna długość 500 znaków - walidacja na poziomie modelu
        /// Zastąpi istniejącą treść przypomnienia
        /// Przykłady: "Zadzwoń do klienta ABC", "Spotkanie z zespołem", "Wysłać raport miesięczny"
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane
        [MaxLength(500)] // Atrybut oznaczający maksymalną długość tekstu
        public required string Note { get; set; } // Właściwość wymagana z modyfikatorem required

        /// <summary>
        /// Nowa data i czas przypomnienia
        /// Wymagane pole - musi być podane przy aktualizacji przypomnienia
        /// Zastąpi istniejącą datę przypomnienia
        /// Określa kiedy system ma wyświetlić zaktualizowane przypomnienie
        /// Powinna być w przyszłości (po aktualnym czasie) dla aktywnych przypomnień
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane
        public DateTime RemindAt { get; set; } // Właściwość wymagana typu DateTime - nowa data przypomnienia
    }
}