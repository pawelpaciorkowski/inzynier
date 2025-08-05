using CRM.Data.Models; // Importuje modele danych CRM
using System.Collections.Generic; // Importuje kolekcje generyczne (List, Dictionary, etc.)
using System.Threading.Tasks; // Importuje typy do programowania asynchronicznego

namespace CRM.BusinessLogic.Services // Przestrzeń nazw dla serwisów biznesowych
{
    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla tworzenia nowego klienta
    /// Służy do przekazywania danych potrzebnych do utworzenia nowego klienta w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP POST
    /// </summary>
    public class CreateCustomerDto // Klasa publiczna reprezentująca DTO tworzenia klienta
    {
        /// <summary>
        /// Nazwa klienta (imię i nazwisko lub nazwa firmy)
        /// Wymagane pole - musi być podane przy tworzeniu klienta
        /// </summary>
        public string Name { get; set; } = default!; // Właściwość wymagana typu string z wartością domyślną null-forgiving operator

        /// <summary>
        /// Adres email klienta
        /// Wymagane pole - musi być podane przy tworzeniu klienta
        /// Powinien być unikalny w systemie i mieć poprawny format email
        /// </summary>
        public string Email { get; set; } = default!; // Właściwość wymagana typu string z wartością domyślną null-forgiving operator

        /// <summary>
        /// Numer telefonu klienta
        /// Opcjonalne pole - może być null
        /// </summary>
        public string? Phone { get; set; } // Właściwość opcjonalna typu string nullable

        /// <summary>
        /// Nazwa firmy klienta
        /// Opcjonalne pole - może być null
        /// </summary>
        public string? Company { get; set; } // Właściwość opcjonalna typu string nullable

        /// <summary>
        /// Adres klienta
        /// Opcjonalne pole - może być null
        /// </summary>
        public string? Address { get; set; } // Właściwość opcjonalna typu string nullable

        /// <summary>
        /// Numer NIP klienta
        /// Opcjonalne pole - może być null
        /// </summary>
        public string? NIP { get; set; } // Właściwość opcjonalna typu string nullable

        /// <summary>
        /// Przedstawiciel klienta (osoba kontaktowa)
        /// Opcjonalne pole - może być null
        /// </summary>
        public string? Representative { get; set; } // Właściwość opcjonalna typu string nullable

        /// <summary>
        /// ID grupy przypisanej do klienta
        /// Opcjonalne pole - może być null
        /// Jeśli podane, klient zostanie przypisany do określonej grupy
        /// </summary>
        public int? AssignedGroupId { get; set; } // Właściwość opcjonalna typu int nullable

        /// <summary>
        /// ID użytkownika przypisanego do klienta
        /// Opcjonalne pole - może być null
        /// Jeśli podane, klient zostanie przypisany do określonego użytkownika
        /// </summary>
        public int? AssignedUserId { get; set; } // Właściwość opcjonalna typu int nullable

        /// <summary>
        /// Lista ID tagów przypisanych do klienta
        /// Opcjonalne pole - może być null
        /// Jeśli podane, klient zostanie oznaczony określonymi tagami
        /// </summary>
        public List<int>? TagIds { get; set; } // Właściwość opcjonalna typu List<int> nullable
    }

    /// <summary>
    /// Klasa DTO (Data Transfer Object) dla aktualizacji klienta
    /// Służy do przekazywania danych potrzebnych do aktualizacji istniejącego klienta w systemie CRM
    /// Używana w kontrolerach API do odbierania danych z żądań HTTP PUT/PATCH
    /// </summary>
    public class UpdateCustomerDto // Klasa publiczna reprezentująca DTO aktualizacji klienta
    {
        /// <summary>
        /// Nazwa klienta (imię i nazwisko lub nazwa firmy)
        /// Wymagane pole - musi być podane przy aktualizacji klienta
        /// </summary>
        public string Name { get; set; } = default!; // Właściwość wymagana typu string z wartością domyślną null-forgiving operator

        /// <summary>
        /// Adres email klienta
        /// Wymagane pole - musi być podane przy aktualizacji klienta
        /// Powinien być unikalny w systemie i mieć poprawny format email
        /// </summary>
        public string Email { get; set; } = default!; // Właściwość wymagana typu string z wartością domyślną null-forgiving operator

        /// <summary>
        /// Numer telefonu klienta
        /// Opcjonalne pole - może być null
        /// </summary>
        public string? Phone { get; set; } // Właściwość opcjonalna typu string nullable

        /// <summary>
        /// Nazwa firmy klienta
        /// Opcjonalne pole - może być null
        /// </summary>
        public string? Company { get; set; } // Właściwość opcjonalna typu string nullable

        /// <summary>
        /// Adres klienta
        /// Opcjonalne pole - może być null
        /// </summary>
        public string? Address { get; set; } // Właściwość opcjonalna typu string nullable

        /// <summary>
        /// Numer NIP klienta
        /// Opcjonalne pole - może być null
        /// </summary>
        public string? NIP { get; set; } // Właściwość opcjonalna typu string nullable

        /// <summary>
        /// Przedstawiciel klienta (osoba kontaktowa)
        /// Opcjonalne pole - może być null
        /// </summary>
        public string? Representative { get; set; } // Właściwość opcjonalna typu string nullable

        /// <summary>
        /// ID grupy przypisanej do klienta
        /// Opcjonalne pole - może być null
        /// Jeśli podane, klient zostanie przypisany do określonej grupy
        /// </summary>
        public int? AssignedGroupId { get; set; } // Właściwość opcjonalna typu int nullable

        /// <summary>
        /// ID użytkownika przypisanego do klienta
        /// Opcjonalne pole - może być null
        /// Jeśli podane, klient zostanie przypisany do określonego użytkownika
        /// </summary>
        public int? AssignedUserId { get; set; } // Właściwość opcjonalna typu int nullable

        /// <summary>
        /// Lista ID tagów przypisanych do klienta
        /// Opcjonalne pole - może być null
        /// Jeśli podane, klient zostanie oznaczony określonymi tagami
        /// </summary>
        public List<int>? TagIds { get; set; } // Właściwość opcjonalna typu List<int> nullable
    }

    /// <summary>
    /// Interfejs serwisu zarządzania klientami
    /// Definiuje kontrakt dla wszystkich operacji związanych z zarządzaniem klientami w systemie CRM
    /// Implementowany przez klasę CustomerService
    /// </summary>
    public interface ICustomerService // Interfejs publiczny definiujący kontrakt serwisu zarządzania klientami
    {
        /// <summary>
        /// Metoda pobierania wszystkich klientów z systemu
        /// Zwraca listę wszystkich zarejestrowanych klientów w systemie CRM
        /// </summary>
        /// <returns>Lista wszystkich klientów w systemie</returns>
        Task<List<Customer>> GetAllAsync(); // Metoda asynchroniczna zwracająca listę wszystkich klientów

        /// <summary>
        /// Metoda pobierania klienta po ID
        /// Wyszukuje klienta w systemie na podstawie jego unikalnego identyfikatora
        /// </summary>
        /// <param name="id">ID klienta do wyszukania</param>
        /// <returns>Obiekt klienta lub null jeśli klient nie został znaleziony</returns>
        Task<Customer?> GetByIdAsync(int id); // Metoda asynchroniczna zwracająca klienta lub null

        /// <summary>
        /// Metoda tworzenia nowego klienta w systemie
        /// Tworzy nowego klienta z podanymi danymi i zapisuje go w bazie danych
        /// </summary>
        /// <param name="customerDto">Dane nowego klienta (nazwa, email, telefon, firma, etc.)</param>
        /// <returns>Nowo utworzony klient</returns>
        /// <exception cref="Exception">Rzucany gdy klient o podanym emailu już istnieje</exception>
        Task<Customer> CreateAsync(CreateCustomerDto customerDto); // Metoda asynchroniczna zwracająca nowego klienta

        /// <summary>
        /// Metoda aktualizacji istniejącego klienta
        /// Aktualizuje dane klienta o podanym ID z nowymi informacjami
        /// </summary>
        /// <param name="id">ID klienta do aktualizacji</param>
        /// <param name="customerDto">Nowe dane klienta</param>
        /// <returns>True jeśli aktualizacja się powiodła, false w przeciwnym przypadku</returns>
        Task<bool> UpdateAsync(int id, UpdateCustomerDto customerDto); // Metoda asynchroniczna zwracająca status operacji

        /// <summary>
        /// Metoda usuwania klienta z systemu
        /// Usuwa klienta o podanym ID z bazy danych
        /// </summary>
        /// <param name="id">ID klienta do usunięcia</param>
        /// <returns>True jeśli usunięcie się powiodło, false w przeciwnym przypadku</returns>
        /// <exception cref="Exception">Rzucany gdy klient ma przypisane aktywne dane (faktury, kontrakty, etc.)</exception>
        Task<bool> DeleteAsync(int id); // Metoda asynchroniczna zwracająca status operacji
    }
}