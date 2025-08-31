// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla aktualizacji istniejącej roli użytkownika
    /// Służy do przekazywania danych potrzebnych do zaktualizowania roli w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP PUT/PATCH
    /// Reprezentuje edycję roli - modyfikację nazwy i opisu uprawnień
    /// </summary>
    public class UpdateRoleDto
    {
        /// <summary>
        /// Nowa nazwa roli
        /// Wymagane pole - musi być podane przy aktualizacji roli
        /// Zastąpi istniejącą nazwę roli
        /// Powinna być unikalna w systemie i opisowa
        /// Przykłady: "Administrator", "Manager", "Sprzedawca", "Użytkownik"
        /// Używana do identyfikacji roli w interfejsie użytkownika
        /// </summary>
        public required string Name { get; set; } // Właściwość wymagana z modyfikatorem required
        
        /// <summary>
        /// Nowy opis roli - dodatkowe informacje o uprawnieniach i zakresie obowiązków
        /// Opcjonalne pole - może być null jeśli rola nie wymaga szczegółowego opisu
        /// Zastąpi istniejący opis roli lub ustawi null jeśli nie podano
        /// Przykłady: "Pełny dostęp do wszystkich funkcji systemu", "Zarządzanie klientami i sprzedażą"
        /// Pomaga administratorom w zrozumieniu celu i zakresu roli
        /// </summary>
        public string? Description { get; set; } // Właściwość opcjonalna typu string nullable
    }
}
