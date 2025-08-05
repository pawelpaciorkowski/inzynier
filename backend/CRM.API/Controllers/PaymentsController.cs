using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM
using Microsoft.AspNetCore.Authorization; // Importuje funkcjonalności autoryzacji
using Microsoft.AspNetCore.Mvc; // Importuje podstawowe klasy kontrolerów MVC
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using System; // Importuje podstawowe typy systemowe
using System.Collections.Generic; // Importuje kolekcje (List, IEnumerable)
using System.Linq; // Importuje metody LINQ
using System.Threading.Tasks; // Importuje klasy do programowania asynchronicznego

namespace CRM.API.Controllers // Przestrzeń nazw dla kontrolerów API
{
    // ### DTOs (Data Transfer Objects) ###

    /// <summary>
    /// Data Transfer Object (DTO) dla płatności
    /// Zawiera podstawowe informacje o płatności potrzebne do wyświetlenia
    /// </summary>
    public class PaymentDto
    {
        public int Id { get; set; } // Unikalny identyfikator płatności
        public int InvoiceId { get; set; } // ID faktury, do której odnosi się płatność
        public string InvoiceNumber { get; set; } = null!; // Numer faktury (dla wygody wyświetlania)
        public DateTime PaidAt { get; set; } // Data i godzina dokonania płatności
        public decimal Amount { get; set; } // Kwota płatności
    }

    /// <summary>
    /// Data Transfer Object (DTO) dla tworzenia nowej płatności
    /// Zawiera dane potrzebne do utworzenia nowej płatności
    /// </summary>
    public class CreatePaymentDto
    {
        public int InvoiceId { get; set; } // ID faktury, do której odnosi się płatność
        public DateTime PaidAt { get; set; } // Data i godzina dokonania płatności
        public decimal Amount { get; set; } // Kwota płatności
    }

    /// <summary>
    /// Data Transfer Object (DTO) dla aktualizacji płatności
    /// Zawiera dane potrzebne do aktualizacji istniejącej płatności
    /// </summary>
    public class UpdatePaymentDto
    {
        public int InvoiceId { get; set; } // ID faktury, do której odnosi się płatność
        public DateTime PaidAt { get; set; } // Data i godzina dokonania płatności
        public decimal Amount { get; set; } // Kwota płatności
    }

    /// <summary>
    /// Kontroler do zarządzania płatnościami w systemie CRM
    /// Klasa obsługuje tworzenie, przeglądanie, edycję i usuwanie płatności oraz automatyczne aktualizowanie statusu faktur
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Payments)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class PaymentsController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konstruktor klasy PaymentsController
        /// Inicjalizuje kontroler z kontekstem bazy danych przekazanym przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        public PaymentsController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera listę wszystkich płatności
        /// Endpoint: GET /api/Payments
        /// Zwraca listę wszystkich płatności z informacjami o powiązanych fakturach
        /// </summary>
        /// <returns>Lista wszystkich płatności z numerami faktur</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPayments() // Metoda asynchroniczna zwracająca listę płatności
        {
            // Wykonuje zapytanie do bazy danych - pobiera wszystkie płatności
            var payments = await _context.Payments
                .Include(p => p.Invoice) // Dołącza dane faktury powiązanej z płatnością (relacja nawigacyjna)
                .Select(p => new PaymentDto // Projektuje dane do DTO - zwraca tylko potrzebne pola
                {
                    Id = p.Id, // ID płatności
                    InvoiceId = p.InvoiceId, // ID faktury
                    InvoiceNumber = p.Invoice != null ? p.Invoice.Number : "Brak faktury", // Numer faktury z obsługą null
                    PaidAt = p.PaidAt, // Data i godzina płatności
                    Amount = p.Amount // Kwota płatności
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników
            
            return Ok(payments); // Zwraca status HTTP 200 OK z listą płatności
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera szczegóły pojedynczej płatności
        /// Endpoint: GET /api/Payments/{id}
        /// Zwraca szczegóły płatności o podanym ID
        /// </summary>
        /// <param name="id">ID płatności do pobrania</param>
        /// <returns>Szczegóły płatności lub NotFound jeśli płatność nie istnieje</returns>
        [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
        public async Task<ActionResult<PaymentDto>> GetPayment(int id) // Metoda asynchroniczna zwracająca szczegóły płatności
        {
            // Wykonuje zapytanie do bazy danych - pobiera płatność o podanym ID
            var payment = await _context.Payments
                .Include(p => p.Invoice) // Dołącza dane faktury powiązanej z płatnością (relacja nawigacyjna)
                .Where(p => p.Id == id) // Filtruje po ID płatności
                .Select(p => new PaymentDto // Projektuje dane do DTO - zwraca tylko potrzebne pola
                {
                    Id = p.Id, // ID płatności
                    InvoiceId = p.InvoiceId, // ID faktury
                    InvoiceNumber = p.Invoice != null ? p.Invoice.Number : "Brak faktury", // Numer faktury z obsługą null
                    PaidAt = p.PaidAt, // Data i godzina płatności
                    Amount = p.Amount // Kwota płatności
                })
                .FirstOrDefaultAsync(); // Pobiera pierwszy element lub null

            // Sprawdza czy płatność została znaleziona
            if (payment == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli płatność nie istnieje
            }

            return Ok(payment); // Zwraca status HTTP 200 OK ze szczegółami płatności
        }

        /// <summary>
        /// Metoda HTTP POST - tworzy nową płatność w systemie
        /// Endpoint: POST /api/Payments
        /// Tworzy nową płatność i automatycznie aktualizuje status faktury (IsPaid)
        /// </summary>
        /// <param name="createPaymentDto">Dane nowej płatności</param>
        /// <returns>Nowo utworzona płatność z statusem HTTP 201 Created</returns>
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        public async Task<ActionResult<PaymentDto>> CreatePayment(CreatePaymentDto createPaymentDto) // Metoda asynchroniczna zwracająca nową płatność
        {
            // Tworzy nowy obiekt płatności z danymi z DTO
            var payment = new Payment
            {
                InvoiceId = createPaymentDto.InvoiceId, // Ustawia ID faktury z DTO
                PaidAt = createPaymentDto.PaidAt, // Ustawia datę i godzinę płatności z DTO
                Amount = createPaymentDto.Amount // Ustawia kwotę płatności z DTO
            };

            // Dodaje płatność do kontekstu Entity Framework
            _context.Payments.Add(payment);
            // Zapisuje płatność w bazie danych
            await _context.SaveChangesAsync();

            // Aktualizuje status faktury IsPaid jeśli całkowita kwota została opłacona
            var invoice = await _context.Invoices.Include(i => i.Payments).FirstOrDefaultAsync(i => i.Id == payment.InvoiceId);
            if (invoice != null) // Sprawdza czy faktura istnieje
            {
                // Oblicza całkowitą kwotę zapłaconą za fakturę
                var totalPaid = invoice.Payments.Sum(p => p.Amount);
                // Sprawdza czy całkowita kwota zapłacona jest większa lub równa kwocie faktury
                if (totalPaid >= invoice.TotalAmount)
                {
                    invoice.IsPaid = true; // Oznacza fakturę jako opłaconą
                    await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
                }
            }

            // Tworzy DTO dla nowo utworzonej płatności
            var paymentDto = new PaymentDto
            {
                Id = payment.Id, // ID nowej płatności
                InvoiceId = payment.InvoiceId, // ID faktury
                InvoiceNumber = invoice != null ? invoice.Number : "Brak faktury", // Numer faktury z obsługą null
                PaidAt = payment.PaidAt, // Data i godzina płatności
                Amount = payment.Amount // Kwota płatności
            };

            // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu (płatności)
            return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, paymentDto);
        }

        /// <summary>
        /// Metoda HTTP PUT - aktualizuje istniejącą płatność
        /// Endpoint: PUT /api/Payments/{id}
        /// Aktualizuje dane płatności i automatycznie aktualizuje status faktury (IsPaid)
        /// </summary>
        /// <param name="id">ID płatności do aktualizacji</param>
        /// <param name="updatePaymentDto">Nowe dane płatności</param>
        /// <returns>Status HTTP 204 No Content po pomyślnej aktualizacji lub błąd</returns>
        [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
        public async Task<IActionResult> UpdatePayment(int id, UpdatePaymentDto updatePaymentDto) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera płatność o podanym ID z bazy danych
            var payment = await _context.Payments.FindAsync(id);

            // Sprawdza czy płatność została znaleziona
            if (payment == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli płatność nie istnieje
            }

            // Aktualizuje dane płatności
            payment.InvoiceId = updatePaymentDto.InvoiceId; // Aktualizuje ID faktury
            payment.PaidAt = updatePaymentDto.PaidAt; // Aktualizuje datę i godzinę płatności
            payment.Amount = updatePaymentDto.Amount; // Aktualizuje kwotę płatności

            try
            {
                // Zapisuje zmiany w bazie danych
                await _context.SaveChangesAsync();

                // Aktualizuje status faktury IsPaid po zmianie płatności
                var invoice = await _context.Invoices.Include(i => i.Payments).FirstOrDefaultAsync(i => i.Id == payment.InvoiceId);
                if (invoice != null) // Sprawdza czy faktura istnieje
                {
                    // Oblicza całkowitą kwotę zapłaconą za fakturę
                    var totalPaid = invoice.Payments.Sum(p => p.Amount);
                    // Aktualizuje status faktury na podstawie porównania całkowitej kwoty zapłaconej z kwotą faktury
                    invoice.IsPaid = totalPaid >= invoice.TotalAmount;
                    await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
                }
            }
            catch (DbUpdateConcurrencyException) // Obsługa wyjątku współbieżności
            {
                // Sprawdza czy płatność nadal istnieje w bazie danych
                if (!PaymentExists(id))
                {
                    return NotFound(); // Zwraca status HTTP 404 Not Found
                }
                else
                {
                    throw; // Rzuca wyjątek dalej jeśli to inny problem współbieżności
                }
            }

            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnej aktualizacji
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa płatność z systemu
        /// Endpoint: DELETE /api/Payments/{id}
        /// Usuwa płatność z bazy danych i automatycznie aktualizuje status faktury (IsPaid)
        /// </summary>
        /// <param name="id">ID płatności do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli płatność nie istnieje</returns>
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        public async Task<IActionResult> DeletePayment(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Pobiera płatność o podanym ID z bazy danych
            var payment = await _context.Payments.FindAsync(id);
            
            // Sprawdza czy płatność została znaleziona
            if (payment == null)
            {
                return NotFound(); // Zwraca status HTTP 404 Not Found jeśli płatność nie istnieje
            }

            // Usuwa płatność z kontekstu Entity Framework
            _context.Payments.Remove(payment);
            // Zapisuje zmiany w bazie danych (fizyczne usunięcie płatności)
            await _context.SaveChangesAsync();

            // Aktualizuje status faktury IsPaid po usunięciu płatności
            var invoice = await _context.Invoices.Include(i => i.Payments).FirstOrDefaultAsync(i => i.Id == payment.InvoiceId);
            if (invoice != null) // Sprawdza czy faktura istnieje
            {
                // Oblicza całkowitą kwotę zapłaconą za fakturę (po usunięciu płatności)
                var totalPaid = invoice.Payments.Sum(p => p.Amount);
                // Aktualizuje status faktury na podstawie porównania całkowitej kwoty zapłaconej z kwotą faktury
                invoice.IsPaid = totalPaid >= invoice.TotalAmount;
                await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
            }

            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
        }

        /// <summary>
        /// Metoda pomocnicza - sprawdza czy płatność o podanym ID istnieje w bazie danych
        /// </summary>
        /// <param name="id">ID płatności do sprawdzenia</param>
        /// <returns>True jeśli płatność istnieje, false w przeciwnym przypadku</returns>
        private bool PaymentExists(int id)
        {
            // Sprawdza czy istnieje płatność o podanym ID w bazie danych
            return _context.Payments.Any(e => e.Id == id);
        }
    }
}
