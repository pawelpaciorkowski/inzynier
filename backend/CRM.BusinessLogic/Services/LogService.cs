using System.Collections.Generic; // Importuje kolekcje generyczne (List, Dictionary, etc.)
using System.Threading.Tasks; // Importuje typy do programowania asynchronicznego
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM

namespace CRM.BusinessLogic.Services // Przestrzeń nazw dla serwisów biznesowych
{
    /// <summary>
    /// Serwis logowania systemowego
    /// Klasa obsługująca zapisywanie i pobieranie logów systemowych w bazie danych
    /// Implementuje interfejs ILogService
    /// </summary>
    public class LogService : ILogService // Klasa publiczna implementująca interfejs ILogService
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konstruktor klasy LogService
        /// Inicjalizuje serwis z kontekstem bazy danych przekazanym przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        public LogService(ApplicationDbContext context) // Konstruktor z dependency injection
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda pobierania wszystkich logów systemowych
        /// Zwraca listę wszystkich logów systemowych posortowanych według timestamp (od najnowszych)
        /// </summary>
        /// <returns>Kolekcja logów systemowych posortowana od najnowszych do najstarszych</returns>
        public async Task<IEnumerable<SystemLog>> GetSystemLogsAsync() // Metoda asynchroniczna zwracająca kolekcję logów
        {
            // Wykonuje zapytanie do bazy danych - pobiera wszystkie logi systemowe
            return await _context.SystemLogs // Rozpoczyna zapytanie LINQ na tabeli SystemLogs
                .OrderByDescending(l => l.Timestamp) // Sortuje logi według timestamp malejąco (od najnowszych do najstarszych)
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników
        }

        /// <summary>
        /// Metoda zapisywania nowego logu systemowego
        /// Tworzy nowy wpis w tabeli SystemLogs z podanymi danymi
        /// </summary>
        /// <param name="level">Poziom logu (Information, Warning, Error, etc.)</param>
        /// <param name="message">Wiadomość logu opisująca zdarzenie</param>
        /// <param name="source">Źródło logu (nazwa klasy/metody która wywołała logowanie)</param>
        /// <param name="userId">ID użytkownika związany z logiem (opcjonalne)</param>
        /// <param name="details">Dodatkowe szczegóły logu (opcjonalne)</param>
        /// <returns>Task reprezentujący asynchroniczną operację zapisu</returns>
        public async Task LogAsync(string level, string message, string source, int? userId = null, string? details = null) // Metoda asynchroniczna z parametrami opcjonalnymi
        {
            // Tworzy nowy obiekt logu systemowego z podanymi danymi
            var logEntry = new SystemLog // Tworzy nowy obiekt SystemLog
            {
                Level = level, // Ustawia poziom logu (Information, Warning, Error, etc.)
                Message = message, // Ustawia wiadomość logu opisującą zdarzenie
                Source = source, // Ustawia źródło logu (nazwa klasy/metody)
                Timestamp = DateTime.UtcNow, // Ustawia timestamp na aktualny czas UTC
                UserId = userId, // Ustawia ID użytkownika (może być null)
                Details = details // Ustawia dodatkowe szczegóły (może być null)
            };

            // Dodaje nowy log do kontekstu Entity Framework
            _context.SystemLogs.Add(logEntry); // Dodaje nowy obiekt SystemLog do kolekcji SystemLogs

            // Zapisuje zmiany w bazie danych
            await _context.SaveChangesAsync(); // Wykonuje operację INSERT w bazie danych
        }
    }
}
