using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM
using Microsoft.AspNetCore.Authorization; // Importuje funkcjonalności autoryzacji
using Microsoft.AspNetCore.Mvc; // Importuje podstawowe klasy kontrolerów MVC
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core

namespace CRM.API.Controllers // Przestrzeń nazw dla kontrolerów API
{
    /// <summary>
    /// Kontroler do zarządzania ustawieniami systemu CRM
    /// Klasa obsługuje konfigurację systemu - pobieranie i aktualizację ustawień globalnych
    /// Dostęp tylko dla administratorów systemu
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Settings)
    [Authorize(Roles = "Admin")] // Wymaga autoryzacji z rolą Admin - dostęp tylko dla administratorów
    public class SettingsController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konstruktor klasy SettingsController
        /// Inicjalizuje kontroler z kontekstem bazy danych przekazanym przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        public SettingsController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wszystkie ustawienia systemu
        /// Endpoint: GET /api/Settings
        /// Zwraca słownik z kluczami i wartościami wszystkich ustawień konfiguracyjnych
        /// </summary>
        /// <returns>Słownik zawierający wszystkie ustawienia systemu (klucz-wartość)</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<ActionResult<Dictionary<string, string>>> GetSettings() // Metoda asynchroniczna zwracająca słownik ustawień
        {
            // Wykonuje zapytanie do bazy danych - pobiera wszystkie ustawienia z tabeli Settings
            var settings = await _context.Settings.ToListAsync(); // Wykonuje zapytanie asynchroniczne i zwraca listę wszystkich ustawień
            
            // Konwertuje listę ustawień na słownik (klucz-wartość) dla łatwiejszego dostępu
            return settings.ToDictionary(s => s.Key, s => s.Value); // Zwraca słownik gdzie klucz to Key, a wartość to Value z bazy danych
        }

        /// <summary>
        /// Metoda HTTP POST - aktualizuje ustawienia systemu
        /// Endpoint: POST /api/Settings
        /// Aktualizuje istniejące ustawienia lub tworzy nowe na podstawie przekazanego słownika
        /// </summary>
        /// <param name="newSettings">Słownik zawierający nowe ustawienia do zapisania (klucz-wartość)</param>
        /// <returns>Status HTTP 200 OK po pomyślnej aktualizacji ustawień</returns>
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        public async Task<IActionResult> UpdateSettings(Dictionary<string, string> newSettings) // Metoda asynchroniczna przyjmująca słownik ustawień
        {
            // Iteruje przez wszystkie ustawienia w przekazanym słowniku
            foreach (var setting in newSettings) // Przechodzi przez każdą parę klucz-wartość w słowniku
            {
                // Sprawdza czy ustawienie o danym kluczu już istnieje w bazie danych
                var existingSetting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == setting.Key); // Wyszukuje ustawienie po kluczu
                
                if (existingSetting != null) // Jeśli ustawienie już istnieje w bazie danych
                {
                    existingSetting.Value = setting.Value; // Aktualizuje wartość istniejącego ustawienia
                }
                else // Jeśli ustawienie nie istnieje w bazie danych
                {
                    // Tworzy nowe ustawienie i dodaje je do kontekstu Entity Framework
                    _context.Settings.Add(new Setting { Key = setting.Key, Value = setting.Value }); // Dodaje nowy obiekt Setting do kolekcji
                }
            }
            
            // Zapisuje wszystkie zmiany w bazie danych
            await _context.SaveChangesAsync(); // Wykonuje operacje INSERT/UPDATE w bazie danych
            
            return Ok(); // Zwraca status HTTP 200 OK po pomyślnym zapisaniu ustawień
        }
    }
}