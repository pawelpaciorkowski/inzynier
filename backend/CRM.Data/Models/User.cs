// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    // Główna klasa reprezentująca użytkownika w systemie CRM
    // Jest to model Entity Framework mapowany na tabelę Users w bazie danych
    public class User
    {
        // Klucz główny tabeli - unikalny identyfikator użytkownika
        // Automatycznie generowany przez bazę danych (auto-increment)
        public int Id { get; set; }
        
        // Nazwa użytkownika - musi być unikalna w całym systemie
        // Używana do logowania i identyfikacji użytkownika
        // Pole wymagane (required) - nie może być null
        public required string Username { get; set; }
        
        // Adres email użytkownika - musi być unikalny w systemie
        // Używany do komunikacji z użytkownikiem i może służyć do logowania
        // Pole wymagane (required) - nie może być null
        public required string Email { get; set; }
        
        // Zahashowane hasło użytkownika - przechowywane w formie bezpiecznej
        // Nigdy nie przechowujemy hasła w postaci jawnej ze względów bezpieczeństwa
        // Pole wymagane (required) - nie może być null
        public required string PasswordHash { get; set; }
        
        // Identyfikator roli użytkownika - klucz obcy do tabeli Roles
        // Określa uprawnienia i poziom dostępu użytkownika w systemie
        public int RoleId { get; set; }

        // Właściwość nawigacyjna do tabeli Roles - relacja wiele do jeden
        // Pozwala na bezpośredni dostęp do informacji o roli użytkownika
        // Pole wymagane (required) - każdy użytkownik musi mieć przypisaną rolę
        public required Role Role { get; set; }

        // Kolekcja grup, do których należy użytkownik - relacja wiele do wielu
        // Implementowana przez tabelę pośrednią UserGroups
        // Virtual umożliwia lazy loading przez Entity Framework
        // Domyślnie inicjalizowana pustą listą, aby uniknąć błędów null reference
        public virtual ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
    }
}
