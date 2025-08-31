// Przestrzeń nazw dla modeli danych CRM - zawiera wszystkie klasy służące do transferu danych
namespace CRM.Data.Models
{
    // Klasa DTO (Data Transfer Object) służąca do tworzenia nowego użytkownika w systemie CRM
    // Używana podczas rejestracji nowego użytkownika - zawiera wszystkie wymagane dane
    public class CreateUserDto
    {
        // Właściwość przechowująca nazwę użytkownika - pole wymagane (required)
        // Używane jako unikalny identyfikator użytkownika do logowania do systemu
        public required string Username { get; set; }
        
        // Właściwość przechowująca adres email użytkownika - pole wymagane (required)
        // Używane do komunikacji z użytkownikiem i może służyć jako alternatywny sposób logowania
        public required string Email { get; set; }
        
        // Właściwość przechowująca hasło użytkownika - pole wymagane (required)
        // Hasło będzie hashowane przed zapisaniem do bazy danych ze względów bezpieczeństwa
        public required string Password { get; set; }
        
        // Właściwość przechowująca identyfikator roli użytkownika (klucz obcy)
        // Określa uprawnienia i poziom dostępu użytkownika w systemie CRM
        // Odnosi się do tabeli Roles w bazie danych
        public int RoleId { get; set; }
    }
}
