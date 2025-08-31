// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) reprezentująca użytkownika wraz z jego rolą
    /// Służy do zwracania danych o użytkowniku wzbogaconych o informacje o przypisanej roli
    /// Używana w kontrolerach API do wysyłania uproszczonych informacji o użytkownikach
    /// Łączy dane z modelu User i Role w jednym obiekcie dla wygody API
    /// </summary>
    public class UserWithRoleDto
    {
        /// <summary>
        /// Unikalny identyfikator użytkownika
        /// Kopiowany z modelu User - pozwala na identyfikację konkretnego użytkownika
        /// Używany do operacji na użytkowniku (edycja, usuwanie, przypisywanie zadań)
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Nazwa użytkownika (login)
        /// Kopiowana z modelu User - główny identyfikator użytkownika w systemie
        /// Wymagane pole - każdy użytkownik musi mieć unikalną nazwę użytkownika
        /// Używana do logowania, wyświetlania w interfejsie i identyfikacji użytkownika
        /// </summary>
        public string Username { get; set; } = null!; // Właściwość wymagana z wartością domyślną null-forgiving operator
        
        /// <summary>
        /// Adres email użytkownika
        /// Kopiowany z modelu User - dodatkowy identyfikator i kanał komunikacji
        /// Wymagane pole - używane do powiadomień, resetowania hasła i korespondencji
        /// Musi być unikalny w systemie i w poprawnym formacie email
        /// </summary>
        public string Email { get; set; } = null!; // Właściwość wymagana z wartością domyślną null-forgiving operator
        
        /// <summary>
        /// Nazwa roli przypisanej do użytkownika
        /// Pobierana z powiązanego modelu Role - określa uprawnienia użytkownika
        /// Wymagane pole - każdy użytkownik musi mieć przypisaną rolę
        /// Przykłady: "Administrator", "Manager", "Użytkownik", "Księgowy"
        /// Używana do wyświetlania uprawnień i filtrowania użytkowników według ról
        /// </summary>
        public string Role { get; set; } = null!; // Właściwość wymagana z wartością domyślną null-forgiving operator
    }
}
