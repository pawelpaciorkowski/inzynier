using CRM.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.API.Controllers
{
    /// <summary>
    /// Kontroler administracyjny w systemie CRM
    /// Klasa obsługuje operacje administracyjne dostępne tylko dla administratorów
    /// Obecnie klasa jest pusta i gotowa do rozszerzenia o funkcjonalności administracyjne
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Admin)
    [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla użytkowników z rolą Admin
    public class AdminController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych
        /// </summary>
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Konstruktor klasy AdminController
        /// Inicjalizuje kontroler z kontekstem bazy danych
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez dependency injection</param>
        public AdminController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego
        }

        // TODO: Dodać metody administracyjne w przyszłości
        // Przykładowe metody, które mogą być dodane:
        // - GetSystemStatistics() - pobieranie statystyk systemu
        // - GetUserActivityLogs() - pobieranie logów aktywności użytkowników
        // - GetSystemHealth() - sprawdzanie stanu systemu
        // - BackupDatabase() - tworzenie kopii zapasowej bazy danych
        // - GetSystemConfiguration() - pobieranie konfiguracji systemu
    }
}