namespace CRM.Data.Models // Przestrzeń nazw dla modeli danych CRM
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla tworzenia pozycji faktury
    /// Służy do przekazywania danych potrzebnych do utworzenia nowej pozycji na fakturze
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP POST
    /// Reprezentuje pojedynczą pozycję (produkt/usługę) na fakturze
    /// </summary>
    public class CreateInvoiceItemDto // Klasa publiczna reprezentująca DTO tworzenia pozycji faktury
    {
        /// <summary>
        /// ID usługi/produktu
        /// Wymagane pole - musi być podane przy tworzeniu pozycji faktury
        /// Powiązanie z tabelą Services przez klucz obcy
        /// Określa jaką usługę/produkt reprezentuje pozycja faktury
        /// </summary>
        public int ServiceId { get; set; } // Właściwość typu int - identyfikator usługi/produktu

        /// <summary>
        /// Ilość usługi/produktu
        /// Wymagane pole - musi być podane przy tworzeniu pozycji faktury
        /// Musi być liczbą dodatnią (większą od 0)
        /// Określa ile jednostek usługi/produktu jest na pozycji faktury
        /// </summary>
        public int Quantity { get; set; } // Właściwość typu int - ilość usługi/produktu
    }
}