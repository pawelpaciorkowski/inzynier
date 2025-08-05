namespace CRM.BusinessLogic.Auth.Requests // Przestrzeń nazw dla klas żądań autoryzacji w warstwie biznesowej
{
    /// <summary>
    /// Klasa żądania aktualizacji danych użytkownika
    /// Służy do przekazywania danych potrzebnych do aktualizacji informacji o użytkowniku w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP PUT/PATCH
    /// </summary>
    public class UpdateUserRequest // Klasa publiczna reprezentująca żądanie aktualizacji użytkownika
    {
        /// <summary>
        /// Nazwa użytkownika (login)
        /// Unikalny identyfikator użytkownika w systemie, używany do logowania
        /// Wymagane pole - musi być podane przy aktualizacji użytkownika
        /// </summary>
        public required string Username { get; set; } // Właściwość wymagana typu string - nazwa użytkownika

        /// <summary>
        /// Adres email użytkownika
        /// Służy do komunikacji z użytkownikiem, powiadomień i resetowania hasła
        /// Wymagane pole - musi być podane przy aktualizacji użytkownika
        /// Powinien być unikalny w systemie
        /// </summary>
        public required string Email { get; set; } // Właściwość wymagana typu string - adres email użytkownika

        /// <summary>
        /// ID roli użytkownika w systemie
        /// Określa uprawnienia i dostęp użytkownika do różnych funkcji systemu
        /// Przykłady ról: Admin, Manager, Sprzedawca, Użytkownik
        /// Nie jest wymagane - może być 0 jeśli nie chcemy zmieniać roli
        /// </summary>
        public int RoleId { get; set; } // Właściwość typu int - identyfikator roli użytkownika
    }
}