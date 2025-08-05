namespace CRM.Data.Models // Przestrzeń nazw dla modeli danych CRM
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla tworzenia nowej wiadomości
    /// Służy do przekazywania danych potrzebnych do utworzenia nowej wiadomości w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP POST
    /// Reprezentuje wiadomość wewnętrzną między użytkownikami systemu
    /// </summary>
    public class CreateMessageDto // Klasa publiczna reprezentująca DTO tworzenia wiadomości
    {
        /// <summary>
        /// ID użytkownika odbiorcy wiadomości
        /// Wymagane pole - musi być podane przy tworzeniu wiadomości
        /// Powiązanie z tabelą Users przez klucz obcy
        /// Określa do kogo wiadomość jest kierowana
        /// </summary>
        public int RecipientUserId { get; set; } // Właściwość typu int - identyfikator użytkownika odbiorcy

        /// <summary>
        /// Temat wiadomości
        /// Wymagane pole - musi być podane przy tworzeniu wiadomości
        /// Krótki opis zawartości wiadomości
        /// Przykłady: "Pilna sprawa", "Raport miesięczny", "Spotkanie zespołu"
        /// </summary>
        public string Subject { get; set; } = default!; // Właściwość wymagana typu string z wartością domyślną null-forgiving operator

        /// <summary>
        /// Treść wiadomości
        /// Wymagane pole - musi być podane przy tworzeniu wiadomości
        /// Główna zawartość wiadomości - może zawierać tekst, formatowanie, linki
        /// Może być długa - nie ma ograniczeń długości
        /// </summary>
        public string Body { get; set; } = default!; // Właściwość wymagana typu string z wartością domyślną null-forgiving operator
    }
}