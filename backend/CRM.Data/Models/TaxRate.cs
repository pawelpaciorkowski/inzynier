// Importuje atrybuty konfiguracji kolumn bazy danych (Column, TypeName, etc.)
using System.ComponentModel.DataAnnotations.Schema;

// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Model reprezentujący stawkę podatkową w systemie CRM
    /// Służy do przechowywania różnych stawek VAT i innych podatków używanych przy fakturowaniu
    /// Pozwala na elastyczne zarządzanie stawkami podatkowymi w systemie
    /// Używane przy tworzeniu faktur i kalkulacji podatków
    /// </summary>
    public class TaxRate
    {
        /// <summary>
        /// Unikalny identyfikator stawki podatkowej
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do powiązania stawki podatkowej z pozycjami faktur
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Nazwa stawki podatkowej
        /// Opis ludzkiej stawki - np. "VAT 23%", "VAT 8%", "VAT zwolniony", "Bez VAT"
        /// Wymagane pole - ułatwia identyfikację stawki przez użytkowników
        /// Wyświetlana w interfejsie użytkownika przy wyborze stawki
        /// </summary>
        public string Name { get; set; } = null!;

        /// <summary>
        /// Wartość stawki podatkowej wyrażona jako ułamek dziesiętny
        /// Typ decimal z precyzją 5 cyfr, z których 4 po przecinku (np. 0.2300 dla VAT 23%)
        /// Przykłady wartości: 0.23 (23% VAT), 0.08 (8% VAT), 0.00 (0% VAT)
        /// Używana do kalkulacji podatku: kwota_netto * Rate = kwota_podatku
        /// </summary>
        [Column(TypeName = "decimal(5,4)")] // Atrybut definiujący typ kolumny w bazie danych
        public decimal Rate { get; set; }
    }
}