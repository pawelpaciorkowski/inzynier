// Przestrzeń nazw dla modeli danych CRM
namespace CRM.Data.Models
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) reprezentująca rolę wraz z liczbą przypisanych użytkowników
    /// Służy do zwracania danych o roli wzbogaconych o statystyki użytkowników
    /// Używana w kontrolerach API do wysyłania rozszerzonych informacji o rolach
    /// Przydatna w raportach i interfejsach administracyjnych pokazujących wykorzystanie ról
    /// </summary>
    public class RoleWithUserCountDto
    {
        /// <summary>
        /// Unikalny identyfikator roli
        /// Kopiowany z modelu Role - pozwala na identyfikację konkretnej roli
        /// Używany do operacji na roli (edycja, usuwanie, przypisywanie użytkowników)
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Nazwa roli
        /// Kopiowana z modelu Role - główny identyfikator roli dla użytkowników
        /// Wymagane pole - każda rola musi mieć nazwę
        /// Przykłady: "Administrator", "Manager", "Użytkownik", "Księgowy"
        /// Wyświetlana w interfejsie użytkownika i raportach
        /// </summary>
        public required string Name { get; set; } // Właściwość wymagana z atrybutem required
        
        /// <summary>
        /// Opis roli - dodatkowe informacje o uprawnieniach i zakresie obowiązków
        /// Kopiowany z modelu Role - opcjonalne pole
        /// Może być null jeśli rola nie ma opisu
        /// Przykłady: "Pełny dostęp do systemu", "Zarządzanie klientami i fakturami"
        /// Pomaga administratorom w zarządzaniu rolami
        /// </summary>
        public string? Description { get; set; } // Właściwość opcjonalna typu string nullable
        
        /// <summary>
        /// Liczba użytkowników przypisanych do tej roli
        /// Kalkulowana dynamicznie - nie przechowywana w bazie danych
        /// Pokazuje ile użytkowników aktualnie ma przypisaną daną rolę
        /// Przydatna do analizy wykorzystania ról i planowania struktur organizacyjnych
        /// Używana w raportach administracyjnych i interfejsach zarządzania rolami
        /// </summary>
        public int UsersCount { get; set; } // Właściwość typu int - liczba użytkowników w roli
    }
}
