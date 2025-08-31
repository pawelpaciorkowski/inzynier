// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla aktualizacji istniejącego zadania
    /// Służy do przekazywania danych potrzebnych do zaktualizowania zadania w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP PUT/PATCH
    /// Reprezentuje modyfikowalne pola zadania (bez relacji z użytkownikami i klientami)
    /// </summary>
    public class UpdateTaskDto
    {
        /// <summary>
        /// Nowy tytuł zadania - krótki opis tego co należy zrobić
        /// Wymagane pole - musi być podane przy aktualizacji zadania
        /// Przykłady: "Zadzwonić do klienta XYZ", "Przygotować ofertę", "Sporządzić raport"
        /// Zastąpi istniejący tytuł zadania
        /// </summary>
        public string Title { get; set; } = null!; // Właściwość wymagana z wartością domyślną null-forgiving operator
        
        /// <summary>
        /// Nowy szczegółowy opis zadania
        /// Opcjonalne pole - może być null jeśli zadanie nie wymaga szczegółów
        /// Może zawierać instrukcje, wymagania, dodatkowe informacje kontekstowe
        /// Zastąpi istniejący opis zadania lub ustawi null jeśli nie podano
        /// </summary>
        public string? Description { get; set; } // Właściwość opcjonalna typu string nullable
        
        /// <summary>
        /// Nowa data i czas do kiedy zadanie powinno być wykonane
        /// Opcjonalne pole - może być null jeśli zadanie nie ma określonego terminu
        /// Używane do priorytetyzacji zadań i planowania pracy
        /// Zastąpi istniejący termin zadania lub ustawi null jeśli nie podano
        /// </summary>
        public DateTime? DueDate { get; set; } // Właściwość opcjonalna typu DateTime nullable
        
        /// <summary>
        /// Nowy status ukończenia zadania
        /// Określa czy zadanie zostało ukończone (true) czy nadal jest w trakcie (false)
        /// Używane do filtrowania i raportowania postępu prac
        /// Pozwala na oznaczanie zadań jako wykonane lub przywracanie do stanu "do zrobienia"
        /// </summary>
        public bool Completed { get; set; } // Właściwość typu bool - status ukończenia zadania
    }
}