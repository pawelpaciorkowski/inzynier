// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Model reprezentujący zadanie (task) w systemie CRM
    /// Służy do zarządzania zadaniami przypisanymi do użytkowników i klientów
    /// Umożliwia śledzenie postępu prac, planowanie działań i organizację obowiązków
    /// Kluczowy element dla zarządzania projektami i obsługi klientów
    /// </summary>
    public class TaskItem
    {
        /// <summary>
        /// Unikalny identyfikator zadania
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do identyfikacji zadania w całym systemie
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Tytuł zadania - krótki opis tego co należy zrobić
        /// Wymagane pole - główna identyfikacja zadania dla użytkowników
        /// Przykłady: "Zadzwonić do klienta XYZ", "Przygotować ofertę", "Sporządzić raport"
        /// Wyświetlany w listach zadań i powiadomieniach
        /// </summary>
        public string Title { get; set; } = default!; // Właściwość wymagana z domyślną wartością
        
        /// <summary>
        /// Szczegółowy opis zadania
        /// Opcjonalne pole - dodatkowe informacje o zadaniu
        /// Może zawierać instrukcje, wymagania, dodatkowe informacje kontekstowe
        /// Przydatny dla złożonych zadań wymagających wyjaśnień
        /// </summary>
        public string? Description { get; set; } // Właściwość opcjonalna typu string nullable
        
        /// <summary>
        /// Data i czas do kiedy zadanie powinno być wykonane
        /// Opcjonalne pole - można ustawić deadline dla zadania
        /// Używane do priorytetyzacji zadań i planowania pracy
        /// Może być null dla zadań bez określonego terminu
        /// </summary>
        public DateTime? DueDate { get; set; } // Właściwość opcjonalna typu DateTime nullable
        
        /// <summary>
        /// Status ukończenia zadania
        /// Domyślnie false (zadanie nie wykonane)
        /// True oznacza że zadanie zostało ukończone
        /// Używane do filtrowania i raportowania postępu prac
        /// </summary>
        public bool Completed { get; set; } // Właściwość typu bool z domyślną wartością false

        /// <summary>
        /// ID użytkownika odpowiedzialnego za wykonanie zadania
        /// Wymagane pole - każde zadanie musi mieć przypisanego wykonawcę
        /// Powiązanie z tabelą Users przez klucz obcy
        /// Używane do filtrowania zadań według odpowiedzialności
        /// </summary>
        public int UserId { get; set; } // Klucz obcy - wymagany
        
        /// <summary>
        /// ID klienta związanego z zadaniem
        /// Wymagane pole - łączy zadanie z konkretnym klientem
        /// Powiązanie z tabelą Customers przez klucz obcy
        /// Pozwala na grupowanie zadań według klientów
        /// </summary>
        public int CustomerId { get; set; } // Klucz obcy - wymagany
        
        /// <summary>
        /// Właściwość nawigacyjna do użytkownika odpowiedzialnego za zadanie
        /// Pozwala na łatwe pobieranie informacji o wykonawcy bez dodatkowych zapytań
        /// Wymagana relacja - każde zadanie musi mieć przypisanego użytkownika
        /// Używana do wyświetlania informacji o odpowiedzialności
        /// </summary>
        public User User { get; set; } = default!; // Właściwość nawigacyjna wymagana
        
        /// <summary>
        /// Właściwość nawigacyjna do klienta związanego z zadaniem
        /// Pozwala na łatwe pobieranie informacji o kliencie bez dodatkowych zapytań
        /// Opcjonalna - może być null w pewnych przypadkach
        /// Używana do kontekstu zadania i grup zadań według klientów
        /// </summary>
        public Customer? Customer { get; set; } // Właściwość nawigacyjna opcjonalna

        // SEKCJA POWIĄZAŃ Z GRUPAMI
        /// <summary>
        /// ID grupy do której przypisane jest zadanie
        /// Opcjonalne pole - pozwala na grupowanie zadań według zespołów lub działów
        /// Powiązanie z tabelą Groups przez klucz obcy
        /// Ułatwia zarządzanie zadaniami na poziomie zespołowym
        /// </summary>
        public int? AssignedGroupId { get; set; } // Klucz obcy opcjonalny - ID grupy
        
        /// <summary>
        /// Właściwość nawigacyjna do grupy przypisanej zadaniu
        /// Pozwala na łatwe pobieranie informacji o grupie bez dodatkowych zapytań
        /// Opcjonalna - może być null jeśli zadanie nie jest przypisane do grupy
        /// Używana do organizacji zadań według struktur zespołowych
        /// </summary>
        public virtual Group? AssignedGroup { get; set; } // Właściwość nawigacyjna opcjonalna

        // SEKCJA POWIĄZAŃ Z TAGAMI
        /// <summary>
        /// Kolekcja tagów przypisanych do zadania
        /// Relacja wiele-do-wielu z modelem Tag poprzez tabelę łączącą TaskTag
        /// Pozwala na elastyczne etykietowanie zadań (pilne, ważne, łatwe, etc.)
        /// Inicjalizowana jako pusta lista - może być pusta ale nie null
        /// </summary>
        public virtual ICollection<TaskTag> TaskTags { get; set; } = new List<TaskTag>(); // Kolekcja tagów zadania
    }
}
