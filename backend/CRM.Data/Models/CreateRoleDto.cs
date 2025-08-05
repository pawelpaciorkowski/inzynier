namespace CRM.Data.Models // Przestrzeń nazw dla modeli danych CRM
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla tworzenia nowej roli użytkownika
    /// Służy do przekazywania danych potrzebnych do utworzenia nowej roli w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP POST
    /// Reprezentuje rolę - zbiór uprawnień i odpowiedzialności w systemie
    /// </summary>
    public class CreateRoleDto // Klasa publiczna reprezentująca DTO tworzenia roli
    {
        /// <summary>
        /// Nazwa roli
        /// Wymagane pole - musi być podane przy tworzeniu roli
        /// Unikalny identyfikator roli w systemie
        /// Powinna być krótka i opisowa
        /// Przykłady: "Admin", "Manager", "Sprzedawca", "Użytkownik", "Analityk"
        /// </summary>
        public required string Name { get; set; } // Właściwość wymagana typu string z modyfikatorem required

        /// <summary>
        /// Opis roli
        /// Opcjonalne pole - może być null
        /// Szczegółowy opis odpowiedzialności i uprawnień roli
        /// Pomaga w zrozumieniu celu i zakresu roli
        /// Przykłady: "Pełny dostęp do wszystkich funkcji systemu", "Zarządzanie klientami i sprzedażą", "Tylko podgląd danych"
        /// </summary>
        public string? Description { get; set; } // Właściwość opcjonalna typu string nullable - opis roli
    }
}
