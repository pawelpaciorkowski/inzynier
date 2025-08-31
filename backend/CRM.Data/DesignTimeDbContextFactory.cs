// Importowanie Entity Framework Core dla obsługi bazy danych
using Microsoft.EntityFrameworkCore;
// Importowanie interfejsu IDesignTimeDbContextFactory dla narzędzi EF Core (migrations, scaffolding)
using Microsoft.EntityFrameworkCore.Design;
// Importowanie klas do odczytywania konfiguracji z plików JSON
using Microsoft.Extensions.Configuration;
// Importowanie klas do obsługi ścieżek i katalogów
using System.IO;

namespace CRM.Data
{
    /// <summary>
    /// Fabryka kontekstu bazy danych używana w czasie projektowania (design-time).
    /// Implementuje IDesignTimeDbContextFactory<ApplicationDbContext> wymagany przez narzędzia Entity Framework Core
    /// takie jak migrations, database update, scaffolding itp.
    /// Umożliwia narzędziom EF Core utworzenie instancji kontekstu bez uruchamiania całej aplikacji.
    /// </summary>
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        /// <summary>
        /// Tworzy instancję ApplicationDbContext dla narzędzi Entity Framework Core.
        /// Metoda jest wywoływana automatycznie przez narzędzia EF Core podczas wykonywania
        /// operacji takich jak Add-Migration, Update-Database, Scaffold-DbContext.
        /// </summary>
        /// <param name="args">Argumenty linii komend przekazane z narzędzi EF Core</param>
        /// <returns>Skonfigurowana instancja ApplicationDbContext</returns>
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            // Tworzenie buildera konfiguracji do odczytania ustawień z plików JSON
            var config = new ConfigurationBuilder()
                // Ustawienie ścieżki bazowej - katalog nadrzędny względem bieżącego katalogu + folder CRM.API
                // Pozwala na odczytanie plików konfiguracyjnych z głównego projektu API
                .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "..", "CRM.API"))
                // Dodanie podstawowego pliku konfiguracyjnego (obowiązkowy)
                .AddJsonFile("appsettings.json", optional: false)
                // Dodanie pliku konfiguracyjnego dla środowiska deweloperskiego (opcjonalny)
                // Nadpisuje ustawienia z appsettings.json jeśli plik istnieje
                .AddJsonFile("appsettings.Development.json", optional: true)
                // Zbudowanie obiektu konfiguracji
                .Build();

            // Tworzenie buildera opcji dla kontekstu bazy danych
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            
            // Pobranie stringa połączenia z konfiguracji pod kluczem "DefaultConnection"
            var connectionString = config.GetConnectionString("DefaultConnection");

            // Konfiguracja kontekstu do używania MySQL z automatycznym wykryciem wersji serwera
            // ServerVersion.AutoDetect automatycznie określa wersję MySQL na podstawie połączenia
            optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));

            // Zwrócenie nowej instancji ApplicationDbContext z skonfigurowanymi opcjami
            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
