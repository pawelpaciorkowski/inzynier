namespace CRM.BusinessLogic.Auth // Przestrzeń nazw dla funkcjonalności autoryzacji w warstwie biznesowej
{
    /// <summary>
    /// Klasa żądania rejestracji nowego użytkownika
    /// Służy do przekazywania danych potrzebnych do utworzenia nowego konta użytkownika w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP POST podczas rejestracji
    /// </summary>
    public class RegisterRequest // Klasa publiczna reprezentująca żądanie rejestracji użytkownika
    {
        /// <summary>
        /// Nazwa użytkownika (login)
        /// Unikalny identyfikator użytkownika w systemie, używany do logowania
        /// Powinien być unikalny w całym systemie
        /// </summary>
        public string Username { get; set; } = default!; // Właściwość typu string z wartością domyślną null-forgiving operator

        /// <summary>
        /// Adres email użytkownika
        /// Służy do komunikacji z użytkownikiem, powiadomień i resetowania hasła
        /// Powinien być unikalny w systemie i mieć poprawny format email
        /// </summary>
        public string Email { get; set; } = default!; // Właściwość typu string z wartością domyślną null-forgiving operator

        /// <summary>
        /// Hasło użytkownika
        /// Hasło w formie tekstowej, które zostanie zahashowane przed zapisaniem w bazie danych
        /// Powinno spełniać wymagania bezpieczeństwa (minimalna długość, znaki specjalne, etc.)
        /// </summary>
        public string Password { get; set; } = default!; // Właściwość typu string z wartością domyślną null-forgiving operator

        /// <summary>
        /// ID roli użytkownika w systemie
        /// Określa uprawnienia i dostęp użytkownika do różnych funkcji systemu
        /// Przykłady ról: Admin, Manager, Sprzedawca, Użytkownik
        /// Musi odpowiadać istniejącej roli w bazie danych
        /// </summary>
        public int RoleId { get; set; } // Właściwość typu int - identyfikator roli użytkownika
    }
}
