using System.Collections.Generic; // Importuje kolekcje generyczne (List, Dictionary, etc.)
using System.Threading.Tasks; // Importuje typy do programowania asynchronicznego
using CRM.Data.Models; // Importuje modele danych CRM

namespace CRM.BusinessLogic.Services // Przestrzeń nazw dla serwisów biznesowych
{
    /// <summary>
    /// Interfejs serwisu logowania systemowego
    /// Definiuje kontrakt dla wszystkich operacji związanych z logowaniem w systemie CRM
    /// Implementowany przez klasę LogService
    /// </summary>
    public interface ILogService // Interfejs publiczny definiujący kontrakt serwisu logowania
    {
        /// <summary>
        /// Metoda pobierania wszystkich logów systemowych
        /// Zwraca listę wszystkich logów systemowych posortowanych według timestamp (od najnowszych)
        /// </summary>
        /// <returns>Kolekcja logów systemowych posortowana od najnowszych do najstarszych</returns>
        Task<IEnumerable<SystemLog>> GetSystemLogsAsync(); // Metoda asynchroniczna zwracająca kolekcję logów

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
        Task LogAsync(string level, string message, string source, int? userId = null, string? details = null); // Metoda asynchroniczna z parametrami opcjonalnymi
    }
}
