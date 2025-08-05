using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;

namespace CRM.API.Controllers.Admin
{
    /// <summary>
    /// Kontroler administracyjny do zarządzania stawkami podatkowymi w systemie CRM
    /// Klasa obsługuje operacje CRUD dla stawek podatkowych używanych w fakturach
    /// </summary>
    [Route("api/admin/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (TaxRates)
    [ApiController] // Oznacza klasę jako kontroler API
    [Authorize(Roles = "Admin")] // Wymaga autoryzacji - dostęp tylko dla użytkowników z rolą Admin
    public class TaxRatesController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych
        /// </summary>
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Konstruktor klasy TaxRatesController
        /// Inicjalizuje kontroler z kontekstem bazy danych
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez dependency injection</param>
        public TaxRatesController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera wszystkie stawki podatkowe
        /// Endpoint: GET /api/admin/taxrates
        /// </summary>
        /// <returns>Lista wszystkich stawek podatkowych posortowanych według wartości stawki</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<ActionResult<IEnumerable<TaxRate>>> GetTaxRates() // Metoda asynchroniczna zwracająca listę stawek podatkowych
        {
            return await _context.TaxRates.OrderBy(tr => tr.Rate).ToListAsync(); // Pobiera wszystkie stawki podatkowe posortowane według wartości i zwraca status HTTP 200 OK
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera stawkę podatkową o określonym ID
        /// Endpoint: GET /api/admin/taxrates/{id}
        /// </summary>
        /// <param name="id">ID stawki podatkowej do pobrania</param>
        /// <returns>Stawka podatkowa o podanym ID lub NotFound jeśli stawka nie istnieje</returns>
        [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
        public async Task<ActionResult<TaxRate>> GetTaxRate(int id) // Metoda asynchroniczna zwracająca stawkę podatkową
        {
            var taxRate = await _context.TaxRates.FindAsync(id); // Pobiera stawkę podatkową o podanym ID z bazy danych

            if (taxRate == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli stawka podatkowa nie istnieje
            }

            return taxRate; // Zwraca status HTTP 200 OK z danymi stawki podatkowej
        }

        /// <summary>
        /// Metoda HTTP PUT - aktualizuje istniejącą stawkę podatkową
        /// Endpoint: PUT /api/admin/taxrates/{id}
        /// </summary>
        /// <param name="id">ID stawki podatkowej do aktualizacji</param>
        /// <param name="taxRate">Nowe dane stawki podatkowej</param>
        /// <returns>Status HTTP 204 No Content po pomyślnej aktualizacji lub błąd walidacji</returns>
        [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
        public async Task<IActionResult> PutTaxRate(int id, TaxRate taxRate) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Sprawdza czy ID w ścieżce URL odpowiada ID w obiekcie stawki podatkowej
            if (id != taxRate.Id)
            {
                return BadRequest(); // Zwraca status HTTP 400 Bad Request jeśli ID się nie zgadzają
            }

            _context.Entry(taxRate).State = EntityState.Modified; // Oznacza obiekt jako zmodyfikowany w kontekście Entity Framework

            try
            {
                await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
            }
            catch (DbUpdateConcurrencyException) // Obsługa wyjątku współbieżności
            {
                if (!TaxRateExists(id)) // Sprawdza czy stawka podatkowa nadal istnieje
                {
                    return NotFound(); // Zwraca status HTTP 404 Not Found
                }
                else
                {
                    throw; // Rzuca wyjątek dalej
                }
            }

            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnej aktualizacji
        }

        /// <summary>
        /// Metoda HTTP POST - tworzy nową stawkę podatkową
        /// Endpoint: POST /api/admin/taxrates
        /// </summary>
        /// <param name="taxRate">Dane nowej stawki podatkowej</param>
        /// <returns>Nowo utworzona stawka podatkowa z statusem HTTP 201 Created lub Conflict jeśli stawka już istnieje</returns>
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        public async Task<ActionResult<TaxRate>> PostTaxRate(TaxRate taxRate) // Metoda asynchroniczna zwracająca utworzoną stawkę podatkową
        {
            // Sprawdza czy stawka podatkowa o takiej samej wartości już istnieje w bazie danych
            if (await _context.TaxRates.AnyAsync(tr => tr.Rate == taxRate.Rate))
            {
                return Conflict(new { message = $"Stawka podatkowa o wartości {taxRate.Rate} już istnieje." }); // Zwraca status HTTP 409 Conflict z komunikatem błędu
            }

            _context.TaxRates.Add(taxRate); // Dodaje nową stawkę podatkową do kontekstu
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            return CreatedAtAction("GetTaxRate", new { id = taxRate.Id }, taxRate); // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa stawkę podatkową z systemu
        /// Endpoint: DELETE /api/admin/taxrates/{id}
        /// </summary>
        /// <param name="id">ID stawki podatkowej do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli stawka nie istnieje</returns>
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        public async Task<IActionResult> DeleteTaxRate(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            var taxRate = await _context.TaxRates.FindAsync(id); // Pobiera stawkę podatkową o podanym ID z bazy danych
            if (taxRate == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli stawka podatkowa nie istnieje
            }

            _context.TaxRates.Remove(taxRate); // Usuwa stawkę podatkową z kontekstu
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
        }

        /// <summary>
        /// Metoda pomocnicza - sprawdza czy stawka podatkowa o podanym ID istnieje w bazie danych
        /// </summary>
        /// <param name="id">ID stawki podatkowej do sprawdzenia</param>
        /// <returns>True jeśli stawka podatkowa istnieje, false w przeciwnym przypadku</returns>
        private bool TaxRateExists(int id)
        {
            return _context.TaxRates.Any(e => e.Id == id); // Sprawdza czy istnieje stawka podatkowa o podanym ID
        }
    }
}