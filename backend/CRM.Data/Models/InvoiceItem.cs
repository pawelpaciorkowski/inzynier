// Importuje atrybuty konfiguracji kolumn bazy danych (Column, TypeName, etc.)
using System.ComponentModel.DataAnnotations.Schema;

// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Model reprezentujący pozycję faktury w systemie CRM
    /// Każda faktura składa się z jednej lub więcej pozycji
    /// Przechowuje szczegółowe informacje o sprzedanych usługach/produktach
    /// Zawiera kalkulacje finansowe (ceny, podatki, kwoty)
    /// </summary>
    public class InvoiceItem
    {
        /// <summary>
        /// Unikalny identyfikator pozycji faktury
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do identyfikacji konkretnej pozycji na fakturze
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// ID faktury do której należy ta pozycja
        /// Wymagane pole - każda pozycja musi być przypisana do faktury
        /// Powiązanie z tabelą Invoices przez klucz obcy
        /// Używane do grupowania pozycji według faktur
        /// </summary>
        public int InvoiceId { get; set; } // Klucz obcy do tabeli Invoices
        
        /// <summary>
        /// ID usługi/produktu który jest sprzedawany w tej pozycji
        /// Wymagane pole - łączy pozycję z konkretną usługą/produktem
        /// Powiązanie z tabelą Services przez klucz obcy
        /// Pozwala na pobieranie szczegółów usługi (nazwa, standardowa cena, etc.)
        /// </summary>
        public int ServiceId { get; set; } // Klucz obcy do tabeli Services
        
        /// <summary>
        /// Opis pozycji faktury
        /// Wymagane pole - tekstowy opis tego co jest sprzedawane
        /// Może być automatycznie uzupełniony z opisu usługi lub dostosowany
        /// Wyświetlany na fakturze jako opis pozycji
        /// </summary>
        public string Description { get; set; } = null!; // Właściwość wymagana
        
        /// <summary>
        /// Ilość sprzedawanych jednostek
        /// Wymagane pole - liczba sztuk, godzin, dni, etc.
        /// Używane do kalkulacji kwot (ilość * cena jednostkowa)
        /// Musi być liczbą dodatnią
        /// </summary>
        public int Quantity { get; set; } // Ilość jednostek

        /// <summary>
        /// Cena jednostkowa netto (bez podatku)
        /// Typ decimal z precyzją 18 cyfr, z których 2 po przecinku
        /// Cena za jedną jednostkę usługi/produktu
        /// Używana do kalkulacji kwoty netto: Quantity * UnitPrice = NetAmount
        /// </summary>
        [Column(TypeName = "decimal(18,2)")] // Atrybut definiujący precyzję w bazie danych
        public decimal UnitPrice { get; set; }

        /// <summary>
        /// Stawka podatkowa wyrażona jako ułamek dziesiętny
        /// Typ decimal z precyzją 5 cyfr, z których 2 po przecinku
        /// Przykłady: 0.23 dla VAT 23%, 0.08 dla VAT 8%, 0.00 dla VAT 0%
        /// Używana do kalkulacji kwoty podatku: NetAmount * TaxRate = TaxAmount
        /// </summary>
        [Column(TypeName = "decimal(5,2)")] // Atrybut definiujący precyzję dla stawki podatkowej
        public decimal TaxRate { get; set; } // Stawka podatkowa jako ułamek (np. 0.23 dla 23%)

        /// <summary>
        /// Kwota netto pozycji faktury (bez podatku)
        /// Typ decimal z precyzją 18 cyfr, z których 2 po przecinku
        /// Kalkulowana jako: Quantity * UnitPrice
        /// Podstawa do wyliczania kwoty podatku
        /// </summary>
        [Column(TypeName = "decimal(18,2)")] // Atrybut definiujący precyzję kwoty
        public decimal NetAmount { get; set; }

        /// <summary>
        /// Kwota podatku dla tej pozycji faktury
        /// Typ decimal z precyzją 18 cyfr, z których 2 po przecinku
        /// Kalkulowana jako: NetAmount * TaxRate
        /// Składa się na podatek całej faktury
        /// </summary>
        [Column(TypeName = "decimal(18,2)")] // Atrybut definiujący precyzję kwoty podatku
        public decimal TaxAmount { get; set; }

        /// <summary>
        /// Kwota brutto pozycji faktury (z podatkiem)
        /// Typ decimal z precyzją 18 cyfr, z których 2 po przecinku
        /// Kalkulowana jako: NetAmount + TaxAmount
        /// Finalna kwota za tę pozycję do zapłaty przez klienta
        /// </summary>
        [Column(TypeName = "decimal(18,2)")] // Atrybut definiujący precyzję kwoty brutto
        public decimal GrossAmount { get; set; }

        /// <summary>
        /// Właściwość nawigacyjna do faktury której dotyczy ta pozycja
        /// Pozwala na łatwe pobieranie informacji o fakturze bez dodatkowych zapytań
        /// Wymagana relacja - każda pozycja musi być powiązana z fakturą
        /// Używana do dostępu do danych faktury (numer, klient, data wystawienia, etc.)
        /// </summary>
        public virtual Invoice Invoice { get; set; } = null!; // Właściwość nawigacyjna wymagana

        /// <summary>
        /// Właściwość nawigacyjna do usługi/produktu sprzedawanego w tej pozycji
        /// Pozwala na łatwe pobieranie informacji o usłudze bez dodatkowych zapytań
        /// Wymagana relacja - każda pozycja musi być powiązana z usługą
        /// Używana do dostępu do szczegółów usługi (nazwa, kategoria, standardowa cena, etc.)
        /// </summary>
        public virtual Service Service { get; set; } = null!; // Właściwość nawigacyjna wymagana
    }
}