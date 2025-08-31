// Importuje podstawowe typy systemowe (DateTime, int, string, etc.)
using System;
// Importuje atrybuty walidacji danych (Required, StringLength, etc.)
using System.ComponentModel.DataAnnotations;

// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Model loga systemowego w aplikacji CRM
    /// Służy do przechowywania wszystkich zdarzeń i błędów występujących w systemie
    /// Umożliwia monitorowanie działania aplikacji, debugowanie i audyt
    /// Wspiera różne poziomy logowania (Information, Warning, Error, etc.)
    /// </summary>
    public class SystemLog
    {
        /// <summary>
        /// Unikalny identyfikator wpisu loga
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do sortowania i identyfikacji pojedynczych wpisów loga
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Znacznik czasu utworzenia wpisu loga
        /// Wymagane pole - automatycznie ustawiane podczas tworzenia wpisu
        /// Używane do sortowania chronologicznego i filtrowania logów według daty
        /// Przechowywane jako UTC dla spójności czasowej
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane - walidacja na poziomie modelu
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// Poziom ważności wpisu loga
        /// Wymagane pole o maksymalnej długości 50 znaków
        /// Możliwe wartości: "Information", "Warning", "Error", "Critical", "Debug"
        /// Używane do filtrowania i kategoryzacji wpisów loga
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane
        [StringLength(50)] // Ograniczenie długości pola do 50 znaków
        public string Level { get; set; } = string.Empty; // Właściwość z domyślną wartością pustego stringa

        /// <summary>
        /// Główna wiadomość loga opisująca zdarzenie lub błąd
        /// Wymagane pole - zawiera opis tego co się wydarzyło
        /// Powinno być czytelne i informacyjne dla administratorów
        /// Używane do wyszukiwania i identyfikacji problemów
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane
        public string Message { get; set; } = string.Empty; // Właściwość z domyślną wartością pustego stringa

        /// <summary>
        /// Źródło wpisu loga - miejsce w kodzie skąd pochodzi wpis
        /// Opcjonalne pole o maksymalnej długości 255 znaków
        /// Przykłady: "CRM.API.Controllers.LogsController", "CRM.BusinessLogic.Services.InvoiceService"
        /// Ułatwia lokalizację błędów w kodzie źródłowym
        /// </summary>
        [StringLength(255)] // Ograniczenie długości pola do 255 znaków
        public string Source { get; set; } = string.Empty; // Właściwość z domyślną wartością pustego stringa

        /// <summary>
        /// ID użytkownika związanego z wpisem loga
        /// Opcjonalne pole - może być null dla zdarzeń systemowych
        /// Powiązanie z tabelą Users przez klucz obcy
        /// Pozwala na śledzenie działań konkretnych użytkowników
        /// </summary>
        public int? UserId { get; set; } // Właściwość opcjonalna typu int nullable

        /// <summary>
        /// Dodatkowe szczegóły wpisu loga w formacie JSON
        /// Opcjonalne pole - może zawierać dodatkowe informacje kontekstowe
        /// Przechowywane jako JSON string dla elastyczności danych
        /// Użyteczne do przechowywania stack trace, parametrów metod, etc.
        /// </summary>
        public string? Details { get; set; } // Właściwość opcjonalna typu string nullable
    }
}
