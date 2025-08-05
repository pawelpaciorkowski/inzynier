using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using CRM.BusinessLogic.Services;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;

namespace CRM.API.Controllers
{
    /// <summary>
    /// Kontroler do zarządzania logami systemowymi w systemie CRM
    /// Klasa obsługuje wyświetlanie logów systemowych dla administratorów
    /// </summary>
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Logs)
    [ApiController] // Oznacza klasę jako kontroler API
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class LogsController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Serwis do zarządzania logami systemowymi
        /// Używany do pobierania i zarządzania logami systemu
        /// </summary>
        private readonly ILogService _logService;

        /// <summary>
        /// Konstruktor klasy LogsController
        /// Inicjalizuje kontroler z serwisem logów systemowych
        /// </summary>
        /// <param name="logService">Serwis logów przekazany przez dependency injection</param>
        public LogsController(ILogService logService)
        {
            _logService = logService; // Przypisuje przekazany serwis do pola prywatnego
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wszystkie logi systemowe
        /// Endpoint: GET /api/logs
        /// Dostęp: Tylko administratorzy (Admin)
        /// </summary>
        /// <returns>Lista wszystkich logów systemowych lub błąd autoryzacji</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla użytkowników z rolą Admin
        public async Task<ActionResult<IEnumerable<SystemLog>>> GetSystemLogs() // Metoda asynchroniczna zwracająca listę logów systemowych
        {
            // Pobiera wszystkie logi systemowe używając serwisu
            var logs = await _logService.GetSystemLogsAsync();
            return Ok(logs); // Zwraca status HTTP 200 OK z listą logów systemowych
        }
    }
}
