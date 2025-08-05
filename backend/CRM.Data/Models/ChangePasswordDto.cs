using System.ComponentModel.DataAnnotations; // Importuje atrybuty walidacji danych (Required, MinLength, etc.)

namespace CRM.Data.Models // Przestrzeń nazw dla modeli danych CRM
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla zmiany hasła użytkownika
    /// Służy do przekazywania danych potrzebnych do zmiany hasła użytkownika w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP POST/PUT
    /// Zawiera walidację wymaganych pól i minimalnej długości nowego hasła
    /// </summary>
    public class ChangePasswordDto // Klasa publiczna reprezentująca DTO zmiany hasła
    {
        /// <summary>
        /// Aktualne hasło użytkownika
        /// Wymagane pole - musi być podane przy zmianie hasła
        /// Służy do weryfikacji tożsamości użytkownika przed zmianą hasła
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane - walidacja na poziomie modelu
        public string CurrentPassword { get; set; } = null!; // Właściwość wymagana typu string z wartością domyślną null-forgiving operator

        /// <summary>
        /// Nowe hasło użytkownika
        /// Wymagane pole - musi być podane przy zmianie hasła
        /// Musi mieć minimalną długość 6 znaków
        /// Powinno spełniać wymagania bezpieczeństwa (znaki specjalne, wielkość liter, etc.)
        /// </summary>
        [Required] // Atrybut oznaczający że pole jest wymagane - walidacja na poziomie modelu
        [MinLength(6)] // Atrybut oznaczający minimalną długość hasła - walidacja na poziomie modelu
        public string NewPassword { get; set; } = null!; // Właściwość wymagana typu string z wartością domyślną null-forgiving operator
    }
}