// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla tworzenia nowego zadania
    /// Służy do przekazywania danych potrzebnych do utworzenia nowego zadania w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP POST
    /// Reprezentuje zadanie - akcję do wykonania przypisaną do użytkownika i klienta
    /// </summary>
    public class CreateTaskDto
    {
        /// <summary>
        /// Tytuł zadania - krótki opis tego co należy zrobić
        /// Wymagane pole - musi być podane przy tworzeniu zadania
        /// Główna identyfikacja zadania dla użytkowników
        /// Przykłady: "Zadzwonić do klienta XYZ", "Przygotować ofertę", "Sporządzić raport"
        /// Wyświetlany w listach zadań i powiadomieniach
        /// </summary>
        public string Title { get; set; } = null!; // Właściwość wymagana z wartością domyślną null-forgiving operator
        
        /// <summary>
        /// Szczegółowy opis zadania
        /// Opcjonalne pole - może być null jeśli zadanie nie wymaga dodatkowych wyjaśnień
        /// Może zawierać instrukcje, wymagania, dodatkowe informacje kontekstowe
        /// Przydatny dla złożonych zadań wymagających szczegółowych wyjaśnień
        /// </summary>
        public string? Description { get; set; } // Właściwość opcjonalna typu string nullable
        
        /// <summary>
        /// Data i czas do kiedy zadanie powinno być wykonane
        /// Opcjonalne pole - może być null dla zadań bez określonego terminu
        /// Używane do priorytetyzacji zadań i planowania pracy
        /// Jeśli nie podano, zadanie nie będzie miało deadline'u
        /// </summary>
        public DateTime? DueDate { get; set; } // Właściwość opcjonalna typu DateTime nullable
        
        /// <summary>
        /// ID klienta związanego z zadaniem
        /// Wymagane pole - łączy zadanie z konkretnym klientem
        /// Powiązanie z tabelą Customers przez klucz obcy
        /// Pozwala na grupowanie zadań według klientów i kontekst biznesowy
        /// </summary>
        public int CustomerId { get; set; } // Właściwość wymagana typu int - identyfikator klienta
    }
}