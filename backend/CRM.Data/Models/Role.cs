// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Model reprezentujący rolę użytkownika w systemie CRM
    /// Służy do zarządzania uprawnieniami i kontroli dostępu w systemie
    /// Pozwala na grupowanie użytkowników według ich funkcji (admin, manager, użytkownik, etc.)
    /// Każda rola może być przypisana do wielu użytkowników
    /// </summary>
    public class Role
    {
        /// <summary>
        /// Unikalny identyfikator roli
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do powiązania roli z użytkownikami w relacji wiele-do-wielu
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Nazwa roli
        /// Wymagane pole - musi być unikalne w systemie
        /// Przykłady: "Administrator", "Manager", "Użytkownik", "Księgowy"
        /// Używana do identyfikacji roli w interfejsie użytkownika
        /// </summary>
        public required string Name { get; set; } // Właściwość wymagana z atrybutem required w C# 11
        
        /// <summary>
        /// Opis roli - dodatkowe informacje o uprawnieniach i zakresie obowiązków
        /// Opcjonalne pole - może być null
        /// Przykłady: "Pełny dostęp do systemu", "Zarządzanie klientami i fakturami"
        /// Pomaga administratorom w zarządzaniu rolami
        /// </summary>
        public string? Description { get; set; } // Właściwość opcjonalna typu string nullable

        /// <summary>
        /// Kolekcja użytkowników przypisanych do tej roli
        /// Właściwość nawigacyjna - relacja jeden-do-wielu z modelem User
        /// Pozwala na łatwe pobieranie wszystkich użytkowników danej roli
        /// Wymagana kolekcja - musi być zainicjalizowana
        /// </summary>
        public required ICollection<User> Users { get; set; } // Właściwość nawigacyjna wymagana - kolekcja użytkowników
    }
}
