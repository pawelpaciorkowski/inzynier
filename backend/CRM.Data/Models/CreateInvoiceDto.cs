namespace CRM.Data.Models // Przestrzeń nazw dla modeli danych CRM
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla tworzenia nowej faktury
    /// Służy do przekazywania danych potrzebnych do utworzenia nowej faktury w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP POST
    /// Zawiera podstawowe informacje o fakturze oraz listę pozycji faktury
    /// </summary>
    public class CreateInvoiceDto // Klasa publiczna reprezentująca DTO tworzenia faktury
    {
        /// <summary>
        /// ID klienta dla którego tworzona jest faktura
        /// Wymagane pole - musi być podane przy tworzeniu faktury
        /// Powiązanie z tabelą Customers przez klucz obcy
        /// </summary>
        public int CustomerId { get; set; } // Właściwość typu int - identyfikator klienta

        /// <summary>
        /// Numer faktury
        /// Wymagane pole - musi być podane przy tworzeniu faktury
        /// Powinien być unikalny w systemie
        /// Przykłady: "FV/2024/001", "INV-2024-001", "2024/001"
        /// </summary>
        public string InvoiceNumber { get; set; } = null!; // Właściwość wymagana typu string z wartością domyślną null-forgiving operator

        /// <summary>
        /// Lista pozycji faktury (produkty/usługi)
        /// Kolekcja obiektów CreateInvoiceItemDto reprezentujących poszczególne pozycje
        /// Inicjalizowana jako pusta lista - może być pusta ale nie null
        /// </summary>
        public List<CreateInvoiceItemDto> Items { get; set; } = new List<CreateInvoiceItemDto>(); // Właściwość typu List z inicjalizacją pustej listy
    }
}