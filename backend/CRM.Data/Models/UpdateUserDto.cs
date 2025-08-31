// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla aktualizacji istniejącego użytkownika
    /// Służy do przekazywania danych potrzebnych do zaktualizowania użytkownika w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP PUT/PATCH
    /// Reprezentuje edycję użytkownika - modyfikację danych osobowych i uprawnień
    /// </summary>
    public class UpdateUserDto
    {
        /// <summary>
        /// Nowa nazwa użytkownika (login)
        /// Wymagane pole - musi być podane przy aktualizacji użytkownika
        /// Zastąpi istniejącą nazwę użytkownika
        /// Musi być unikalna w systemie
        /// Używana do logowania i identyfikacji użytkownika
        /// Przykłady: "jan.kowalski", "admin", "maria.nowak"
        /// </summary>
        public string Username { get; set; } = null!; // Właściwość wymagana z wartością domyślną null-forgiving operator
        
        /// <summary>
        /// Nowy adres email użytkownika
        /// Wymagane pole - musi być podane przy aktualizacji użytkownika
        /// Zastąpi istniejący adres email użytkownika
        /// Musi być w poprawnym formacie email i unikalny w systemie
        /// Używany do powiadomień, resetowania hasła i korespondencji
        /// </summary>
        public string Email { get; set; } = null!; // Właściwość wymagana z wartością domyślną null-forgiving operator
        
        /// <summary>
        /// ID nowej roli przypisanej do użytkownika
        /// Wymagane pole - musi być podane przy aktualizacji użytkownika
        /// Zastąpi istniejące przypisanie roli użytkownika
        /// Powiązanie z tabelą Roles przez klucz obcy
        /// Określa nowe uprawnienia i poziom dostępu użytkownika w systemie
        /// </summary>
        public int RoleId { get; set; } // Właściwość wymagana typu int - identyfikator nowej roli
    }
}
