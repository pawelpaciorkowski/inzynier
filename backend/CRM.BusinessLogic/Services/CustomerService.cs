using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM (Customer, CustomerTag, etc.)
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using Microsoft.Extensions.Logging; // Importuje system logowania Microsoft
using System.Collections.Generic; // Importuje kolekcje generyczne (List, IEnumerable)
using System.Linq; // Importuje LINQ (Language Integrated Query)
using System.Threading.Tasks; // Importuje Task dla operacji asynchronicznych

namespace CRM.BusinessLogic.Services // Przestrzeń nazw dla serwisów biznesowych
{
    /// <summary>
    /// Serwis zarządzania klientami
    /// Klasa implementująca interfejs ICustomerService, obsługuje operacje CRUD na klientach
    /// oraz zarządzanie tagami klientów i logowanie operacji
    /// </summary>
    public class CustomerService : ICustomerService // Klasa publiczna implementująca interfejs ICustomerService
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Logger do zapisywania informacji o operacjach
        /// Używany do logowania operacji CRUD na klientach
        /// </summary>
        private readonly ILogger<CustomerService> _logger; // Pole tylko do odczytu - logger

        /// <summary>
        /// Konstruktor klasy CustomerService
        /// Inicjalizuje serwis z kontekstem bazy danych i loggerem przekazanymi przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        /// <param name="logger">Logger przekazany przez system dependency injection</param>
        public CustomerService(ApplicationDbContext context, ILogger<CustomerService> logger) // Konstruktor z dependency injection
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
            _logger = logger; // Przypisuje przekazany logger do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda pobierania wszystkich klientów z systemu
        /// Zwraca listę wszystkich klientów wraz z ich tagami, posortowaną według daty utworzenia (od najnowszych)
        /// </summary>
        /// <returns>Lista wszystkich klientów z tagami</returns>
        public async Task<List<Customer>> GetAllAsync() // Metoda asynchroniczna zwracająca listę klientów
        {
            // Wykonuje zapytanie do bazy danych - pobiera wszystkich klientów z tagami
            return await _context.Customers // Rozpoczyna zapytanie LINQ na tabeli Customers
                .Include(c => c.CustomerTags) // Dołącza tagi klienta (relacja jeden-do-wielu)
                    .ThenInclude(ct => ct.Tag) // Dołącza szczegóły tagów (relacja jeden-do-jednego)
                .OrderByDescending(c => c.CreatedAt) // Sortuje według daty utworzenia (od najnowszych do najstarszych)
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników
        }

        /// <summary>
        /// Metoda pobierania klienta po ID
        /// Wyszukuje klienta w systemie na podstawie jego unikalnego identyfikatora wraz z tagami
        /// </summary>
        /// <param name="id">ID klienta do wyszukania</param>
        /// <returns>Obiekt klienta z tagami lub null jeśli klient nie został znaleziony</returns>
        public async Task<Customer?> GetByIdAsync(int id) // Metoda asynchroniczna zwracająca klienta lub null
        {
            // Wyszukuje klienta po ID w bazie danych wraz z tagami
            return await _context.Customers // Rozpoczyna zapytanie LINQ na tabeli Customers
                .Include(c => c.CustomerTags) // Dołącza tagi klienta (relacja jeden-do-wielu)
                    .ThenInclude(ct => ct.Tag) // Dołącza szczegóły tagów (relacja jeden-do-jednego)
                .FirstOrDefaultAsync(c => c.Id == id); // Wyszukuje klienta o podanym ID lub zwraca null
        }

        /// <summary>
        /// Metoda tworzenia nowego klienta w systemie
        /// Tworzy nowego klienta z podanymi danymi i przypisuje mu tagi
        /// </summary>
        /// <param name="customerDto">Dane nowego klienta (nazwa, email, telefon, firma, adres, NIP, przedstawiciel, grupa, użytkownik, tagi)</param>
        /// <returns>Nowo utworzony klient z tagami</returns>
        public async Task<Customer> CreateAsync(CreateCustomerDto customerDto) // Metoda asynchroniczna zwracająca nowego klienta
        {
            // Loguje informację o otrzymanych tagach
            _logger.LogInformation("CreateAsync: Received TagIds: {TagIds}", customerDto.TagIds != null ? string.Join(", ", customerDto.TagIds) : "null"); // Zapisuje log o otrzymanych ID tagów

            // Tworzy nowy obiekt klienta z danymi z DTO
            var customer = new Customer // Tworzy nowy obiekt Customer
            {
                Name = customerDto.Name, // Ustawia nazwę klienta z DTO
                Email = customerDto.Email, // Ustawia adres email z DTO
                Phone = customerDto.Phone, // Ustawia telefon z DTO
                Company = customerDto.Company, // Ustawia firmę z DTO
                Address = customerDto.Address, // Ustawia adres z DTO
                NIP = customerDto.NIP, // Ustawia NIP z DTO
                Representative = customerDto.Representative, // Ustawia przedstawiciela z DTO
                AssignedGroupId = customerDto.AssignedGroupId, // Ustawia ID przypisanej grupy z DTO
                AssignedUserId = customerDto.AssignedUserId, // Ustawia ID przypisanego użytkownika z DTO
                CreatedAt = DateTime.UtcNow // Ustawia datę utworzenia na aktualny czas UTC
            };

            _context.Customers.Add(customer); // Dodaje nowego klienta do kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje klienta w bazie danych (pierwszy SaveChanges - klient otrzymuje ID)

            // Obsługuje tagi klienta
            if (customerDto.TagIds != null && customerDto.TagIds.Any()) // Sprawdza czy podano tagi i czy lista nie jest pusta
            {
                foreach (var tagId in customerDto.TagIds) // Iteruje przez wszystkie ID tagów
                {
                    // Dodaje nowy tag do klienta
                    customer.CustomerTags.Add(new CustomerTag { CustomerId = customer.Id, TagId = tagId }); // Tworzy nowy obiekt CustomerTag i dodaje do kolekcji
                }
                await _context.SaveChangesAsync(); // Zapisuje tagi w bazie danych (drugi SaveChanges - tagi)
            }

            // Loguje informację o utworzonym kliencie
            _logger.LogInformation("CreateAsync: Customer {CustomerId} created with {TagCount} tags.", customer.Id, customer.CustomerTags.Count); // Zapisuje log o utworzonym kliencie

            return customer; // Zwraca nowo utworzonego klienta z tagami
        }

        /// <summary>
        /// Metoda aktualizacji istniejącego klienta
        /// Aktualizuje dane klienta o podanym ID z nowymi informacjami i tagami
        /// </summary>
        /// <param name="id">ID klienta do aktualizacji</param>
        /// <param name="customerDto">Nowe dane klienta</param>
        /// <returns>True jeśli aktualizacja się powiodła, false w przeciwnym przypadku</returns>
        public async Task<bool> UpdateAsync(int id, UpdateCustomerDto customerDto) // Metoda asynchroniczna zwracająca status operacji
        {
            // Loguje informację o otrzymanych tagach dla aktualizacji
            _logger.LogInformation("UpdateAsync: Received TagIds for customer {CustomerId}: {TagIds}", id, customerDto.TagIds != null ? string.Join(", ", customerDto.TagIds) : "null"); // Zapisuje log o otrzymanych ID tagów

            // Wyszukuje istniejącego klienta po ID wraz z tagami
            var existingCustomer = await _context.Customers // Rozpoczyna zapytanie LINQ na tabeli Customers
                .Include(c => c.CustomerTags) // Dołącza tagi klienta (relacja jeden-do-wielu)
                .FirstOrDefaultAsync(c => c.Id == id); // Wyszukuje klienta o podanym ID lub zwraca null

            if (existingCustomer == null) // Jeśli klient nie istnieje
            {
                _logger.LogWarning("UpdateAsync: Customer {CustomerId} not found.", id); // Zapisuje ostrzeżenie o nieznalezionym kliencie
                return false; // Zwraca false - klient nie został znaleziony
            }

            // Loguje informację o istniejących tagach klienta
            _logger.LogInformation("UpdateAsync: Customer {CustomerId} has {ExistingTagCount} existing tags.", id, existingCustomer.CustomerTags.Count); // Zapisuje log o liczbie istniejących tagów

            // Aktualizuje dane klienta
            existingCustomer.Name = customerDto.Name; // Aktualizuje nazwę klienta
            existingCustomer.Email = customerDto.Email; // Aktualizuje adres email
            existingCustomer.Phone = customerDto.Phone; // Aktualizuje telefon
            existingCustomer.Company = customerDto.Company; // Aktualizuje firmę
            existingCustomer.Address = customerDto.Address; // Aktualizuje adres
            existingCustomer.NIP = customerDto.NIP; // Aktualizuje NIP
            existingCustomer.Representative = customerDto.Representative; // Aktualizuje przedstawiciela
            existingCustomer.AssignedGroupId = customerDto.AssignedGroupId; // Aktualizuje ID przypisanej grupy
            existingCustomer.AssignedUserId = customerDto.AssignedUserId; // Aktualizuje ID przypisanego użytkownika

            // Obsługuje tagi klienta
            existingCustomer.CustomerTags.Clear(); // Usuwa wszystkie istniejące tagi klienta
            if (customerDto.TagIds != null && customerDto.TagIds.Any()) // Sprawdza czy podano nowe tagi i czy lista nie jest pusta
            {
                foreach (var tagId in customerDto.TagIds) // Iteruje przez wszystkie ID tagów
                {
                    // Dodaje nowy tag do klienta
                    existingCustomer.CustomerTags.Add(new CustomerTag { CustomerId = existingCustomer.Id, TagId = tagId }); // Tworzy nowy obiekt CustomerTag i dodaje do kolekcji
                }
            }

            await _context.SaveChangesAsync(); // Zapisuje wszystkie zmiany w bazie danych
            _logger.LogInformation("UpdateAsync: Customer {CustomerId} updated with {NewTagCount} tags.", id, existingCustomer.CustomerTags.Count); // Zapisuje log o zaktualizowanym kliencie

            return true; // Zwraca true - aktualizacja się powiodła
        }

        /// <summary>
        /// Metoda usuwania klienta z systemu
        /// Usuwa klienta o podanym ID z bazy danych
        /// </summary>
        /// <param name="id">ID klienta do usunięcia</param>
        /// <returns>True jeśli usunięcie się powiodło, false w przeciwnym przypadku</returns>
        public async Task<bool> DeleteAsync(int id) // Metoda asynchroniczna zwracająca status operacji
        {
            // Wyszukuje klienta po ID w bazie danych
            var customer = await _context.Customers.FindAsync(id); // Wyszukuje klienta o podanym ID
            if (customer == null) return false; // Jeśli klient nie istnieje, zwraca false

            _context.Customers.Remove(customer); // Usuwa klienta z kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych (fizyczne usunięcie klienta)
            return true; // Zwraca true - usunięcie się powiodło
        }
    }
}
