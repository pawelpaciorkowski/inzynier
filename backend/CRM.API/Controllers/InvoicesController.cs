using CRM.BusinessLogic.Services;
using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// ### DTOs (Data Transfer Objects) ###

/// <summary>
/// Data Transfer Object (DTO) dla listy faktur
/// Zawiera podstawowe informacje o fakturze potrzebne do wyświetlenia w tabeli
/// </summary>
// POPRAWKA: Dodajemy pole IsPaid i CustomerId
public class InvoiceListItemDto
{
    public int Id { get; set; } // Unikalny identyfikator faktury
    public string InvoiceNumber { get; set; } = null!; // Numer faktury
    public DateTime IssuedAt { get; set; } // Data wystawienia faktury
    public decimal TotalAmount { get; set; } // Całkowita kwota faktury
    public string CustomerName { get; set; } = null!; // Nazwa klienta
    public int CustomerId { get; set; } // ID klienta - dodane dla lepszej identyfikacji
    public bool IsPaid { get; set; } // Status płatności faktury - dodane dla listy
}

/// <summary>
/// Data Transfer Object (DTO) dla pojedynczej pozycji na fakturze
/// Zawiera szczegóły jednej pozycji faktury
/// </summary>
public class InvoiceItemDto
{
    public int Id { get; set; } // Unikalny identyfikator pozycji
    public int ServiceId { get; set; } // ID usługi
    public string Description { get; set; } = null!; // Opis pozycji
    public int Quantity { get; set; } // Ilość
    public decimal UnitPrice { get; set; } // Cena jednostkowa
    public decimal NetAmount { get; set; } // Kwota netto
    public decimal GrossAmount { get; set; } // Kwota brutto
}

/// <summary>
/// Data Transfer Object (DTO) dla szczegółów faktury
/// Rozszerza InvoiceListItemDto o dodatkowe informacje i listę pozycji
/// </summary>
// POPRAWKA: Dodajemy brakujące pola
public class InvoiceDetailDto : InvoiceListItemDto
{
    public DateTime DueDate { get; set; } // Termin płatności faktury
    public decimal NetAmount { get; set; } // Kwota netto całej faktury
    public decimal TaxAmount { get; set; } // Kwota podatku całej faktury
    public ICollection<InvoiceItemDto> Items { get; set; } = new List<InvoiceItemDto>(); // Lista pozycji faktury
}

/// <summary>
/// Data Transfer Object (DTO) dla tworzenia nowej faktury
/// Zawiera dane potrzebne do utworzenia nowej faktury
/// </summary>
public class CreateInvoiceDto
{
    public string InvoiceNumber { get; set; } = string.Empty; // Numer faktury
    public int CustomerId { get; set; } // ID klienta
    public List<CreateInvoiceItemDto> Items { get; set; } = new List<CreateInvoiceItemDto>(); // Lista pozycji do utworzenia
}

/// <summary>
/// Data Transfer Object (DTO) dla tworzenia pozycji faktury
/// Zawiera minimalne dane potrzebne do utworzenia pozycji
/// </summary>
public class CreateInvoiceItemDto
{
    public int ServiceId { get; set; } // ID usługi
    public int Quantity { get; set; } // Ilość
}

// ### KONTROLER ###

/// <summary>
/// Kontroler do zarządzania fakturami w systemie CRM
/// Klasa obsługuje operacje CRUD dla faktur oraz generowanie dokumentów PDF
/// </summary>
[ApiController] // Oznacza klasę jako kontroler API
[Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Invoices)
[Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
public class InvoicesController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
{
    /// <summary>
    /// Kontekst bazy danych Entity Framework
    /// Pozwala na wykonywanie operacji na bazie danych
    /// </summary>
    private readonly ApplicationDbContext _context;

    /// <summary>
    /// Serwis do generowania dokumentów PDF faktur
    /// Używany do tworzenia plików PDF na podstawie faktur
    /// </summary>
    private readonly InvoicePdfService _invoicePdfService;

    /// <summary>
    /// Konstruktor klasy InvoicesController
    /// Inicjalizuje kontroler z kontekstem bazy danych i serwisem generowania PDF
    /// </summary>
    /// <param name="context">Kontekst bazy danych przekazany przez dependency injection</param>
    /// <param name="invoicePdfService">Serwis generowania PDF przekazany przez dependency injection</param>
    public InvoicesController(ApplicationDbContext context, InvoicePdfService invoicePdfService)
    {
        _context = context; // Przypisuje przekazany kontekst do pola prywatnego
        _invoicePdfService = invoicePdfService; // Przypisuje przekazany serwis do pola prywatnego
    }

    /// <summary>
    /// Metoda HTTP GET - generuje dokument PDF dla faktury
    /// Endpoint: GET /api/invoices/{id}/pdf
    /// </summary>
    /// <param name="id">ID faktury do wygenerowania PDF</param>
    /// <returns>Plik PDF z fakturą lub błąd</returns>
    [HttpGet("{id}/pdf")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce /pdf
    public async Task<IActionResult> GetInvoicePdf(int id) // Metoda asynchroniczna zwracająca plik PDF
    {
        try
        {
            // Generuje dokument PDF używając serwisu
            var pdfBytes = await _invoicePdfService.GenerateInvoicePdfAsync(id);
            return File(pdfBytes, "application/pdf", $"invoice_{id}.pdf"); // Zwraca plik PDF do pobrania
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message); // Zwraca status HTTP 404 Not Found z komunikatem błędu
        }
    }

    /// <summary>
    /// Metoda HTTP GET - pobiera listę wszystkich faktur
    /// Endpoint: GET /api/invoices
    /// </summary>
    /// <returns>Lista wszystkich faktur z podstawowymi informacjami</returns>
    [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
    public async Task<ActionResult<IEnumerable<InvoiceListItemDto>>> GetInvoices() // Metoda asynchroniczna zwracająca listę faktur
    {
        // Pobiera wszystkie faktury z bazy danych wraz z powiązanymi danymi
        var invoices = await _context.Invoices
            .Include(i => i.Customer) // Dołącza dane klienta
            .Include(i => i.Items) // Dołącza pozycje faktury aby móc obliczyć TotalAmount
            .OrderByDescending(i => i.IssuedAt) // Sortuje od najnowszych faktur
            .Select(i => new InvoiceListItemDto // Projektuje dane do DTO
            {
                Id = i.Id, // ID faktury
                InvoiceNumber = i.Number, // Numer faktury
                IssuedAt = i.IssuedAt, // Data wystawienia
                TotalAmount = i.Items.Sum(item => item.GrossAmount), // Oblicza całkowitą kwotę jako sumę pozycji
                CustomerName = i.Customer != null ? i.Customer.Name : "Brak klienta", // Nazwa klienta z obsługą null
                IsPaid = i.IsPaid // Status płatności
            })
            .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę

        return Ok(invoices); // Zwraca status HTTP 200 OK z listą faktur
    }

    /// <summary>
    /// Metoda HTTP GET - pobiera szczegóły pojedynczej faktury
    /// Endpoint: GET /api/invoices/{id}
    /// </summary>
    /// <param name="id">ID faktury do pobrania</param>
    /// <returns>Szczegóły faktury z listą pozycji lub NotFound jeśli faktura nie istnieje</returns>
    [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
    public async Task<ActionResult<InvoiceDetailDto>> GetInvoice(int id) // Metoda asynchroniczna zwracająca szczegóły faktury
    {
        // Pobiera fakturę o podanym ID wraz z powiązanymi danymi
        var invoice = await _context.Invoices
            .Include(i => i.Customer) // Dołącza dane klienta
            .Include(i => i.Items) // Dołącza pozycje faktury
            .Where(i => i.Id == id) // Filtruje po ID
            .Select(i => new InvoiceDetailDto // Projektuje dane do DTO szczegółów
            {
                // Podstawowe dane
                Id = i.Id, // ID faktury
                InvoiceNumber = i.Number, // Numer faktury
                IssuedAt = i.IssuedAt, // Data wystawienia
                DueDate = i.DueDate, // Termin płatności
                IsPaid = i.IsPaid, // Status płatności
                CustomerName = i.Customer != null ? i.Customer.Name : "Brak klienta", // Nazwa klienta z obsługą null
                CustomerId = i.CustomerId, // ID klienta

                // Obliczane sumy
                TotalAmount = i.Items.Sum(item => item.GrossAmount), // Całkowita kwota brutto
                NetAmount = i.Items.Sum(item => item.NetAmount), // Całkowita kwota netto
                TaxAmount = i.Items.Sum(item => item.TaxAmount), // Całkowita kwota podatku

                // Lista pozycji faktury
                Items = i.Items.Select(item => new InvoiceItemDto // Mapuje każdą pozycję na DTO
                {
                    Id = item.Id, // ID pozycji
                    ServiceId = item.ServiceId, // ID usługi
                    Description = item.Description, // Opis pozycji
                    Quantity = item.Quantity, // Ilość
                    UnitPrice = item.UnitPrice, // Cena jednostkowa
                    NetAmount = item.NetAmount, // Kwota netto pozycji
                    GrossAmount = item.GrossAmount // Kwota brutto pozycji
                }).ToList() // Konwertuje na listę
            })
            .FirstOrDefaultAsync(); // Pobiera pierwszy element lub null

        if (invoice == null)
        {
            return NotFound(); // Zwraca status HTTP 404 Not Found jeśli faktura nie istnieje
        }

        return Ok(invoice); // Zwraca status HTTP 200 OK ze szczegółami faktury
    }

    /// <summary>
    /// Metoda HTTP POST - tworzy nową fakturę w systemie
    /// Endpoint: POST /api/invoices
    /// </summary>
    /// <param name="dto">Dane nowej faktury</param>
    /// <returns>Nowo utworzona faktura z statusem HTTP 201 Created</returns>
    [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
    public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceDto dto) // Metoda asynchroniczna zwracająca IActionResult
    {
        // Walidacja - sprawdza czy faktura ma co najmniej jedną pozycję
        if (dto.Items == null || !dto.Items.Any())
        {
            return BadRequest("Faktura musi zawierać co najmniej jedną pozycję."); // Zwraca status HTTP 400 Bad Request
        }

        // Tworzy nowy obiekt faktury
        var newInvoice = new Invoice
        {
            Number = dto.InvoiceNumber, // Ustawia numer faktury
            CustomerId = dto.CustomerId, // Ustawia ID klienta
            IssuedAt = DateTime.UtcNow, // Ustawia datę wystawienia na aktualny czas
            DueDate = DateTime.UtcNow.AddDays(14), // Ustawia termin płatności na 14 dni od teraz
            TotalAmount = 0 // Inicjalizuje całkowitą kwotę na 0
        };

        decimal total = 0; // Suma całkowita
        decimal totalNet = 0; // Suma netto
        decimal totalTax = 0; // Suma podatku

        // Przetwarza każdą pozycję faktury
        foreach (var itemDto in dto.Items)
        {
            // Pobiera usługę z bazy danych
            var service = await _context.Services.FindAsync(itemDto.ServiceId);
            if (service == null)
            {
                return BadRequest($"Usługa o ID {itemDto.ServiceId} nie istnieje."); // Zwraca błąd jeśli usługa nie istnieje
            }

            // Tworzy nową pozycję faktury
            var invoiceItem = new InvoiceItem
            {
                Invoice = newInvoice, // Przypisuje do faktury
                ServiceId = service.Id, // Ustawia ID usługi
                Description = service.Name, // Ustawia opis z nazwy usługi
                Quantity = itemDto.Quantity, // Ustawia ilość
                UnitPrice = service.Price, // Ustawia cenę jednostkową z usługi
                // Obliczenia kwot - przykładowe, dostosuj jeśli masz inną logikę
                NetAmount = service.Price * itemDto.Quantity, // Kwota netto = cena * ilość
                TaxAmount = (service.Price * itemDto.Quantity) * 0.23m, // Podatek VAT 23%
                GrossAmount = (service.Price * itemDto.Quantity) * 1.23m // Kwota brutto z VAT
            };

            newInvoice.Items.Add(invoiceItem); // Dodaje pozycję do faktury
            total += invoiceItem.GrossAmount; // Dodaje do sumy całkowitej
            totalNet += invoiceItem.NetAmount; // Dodaje do sumy netto
            totalTax += invoiceItem.TaxAmount; // Dodaje do sumy podatku
        }

        newInvoice.TotalAmount = total; // Ustawia całkowitą kwotę faktury
        // Zapisujemy też sumy do głównego obiektu, jeśli masz takie pola w modelu Invoice
        // newInvoice.NetAmount = totalNet;
        // newInvoice.TaxAmount = totalTax;

        _context.Invoices.Add(newInvoice); // Dodaje fakturę do kontekstu
        await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

        // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu
        return CreatedAtAction(nameof(GetInvoice), new { id = newInvoice.Id }, null);
    }

    /// <summary>
    /// Metoda HTTP PUT - aktualizuje istniejącą fakturę
    /// Endpoint: PUT /api/invoices/{id}
    /// </summary>
    /// <param name="id">ID faktury do aktualizacji</param>
    /// <param name="dto">Nowe dane faktury</param>
    /// <returns>Status HTTP 204 No Content po pomyślnej aktualizacji lub błąd</returns>
    [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
    public async Task<IActionResult> UpdateInvoice(int id, [FromBody] CreateInvoiceDto dto) // Metoda asynchroniczna zwracająca IActionResult
    {
        // Pobiera fakturę o podanym ID wraz z pozycjami
        var invoice = await _context.Invoices
            .Include(i => i.Items) // Dołącza pozycje faktury
            .FirstOrDefaultAsync(i => i.Id == id); // Pobiera pierwszy element lub null

        if (invoice == null)
        {
            return NotFound(); // Zwraca status HTTP 404 Not Found jeśli faktura nie istnieje
        }

        // Aktualizacja podstawowych danych faktury
        invoice.Number = dto.InvoiceNumber; // Aktualizuje numer faktury
        invoice.CustomerId = dto.CustomerId; // Aktualizuje ID klienta
        // Możesz dodać inne pola do aktualizacji, np. DueDate

        // Usunięcie starych pozycji faktury
        _context.InvoiceItems.RemoveRange(invoice.Items);

        // Dodanie nowych pozycji faktury
        decimal total = 0; // Suma całkowita
        foreach (var itemDto in dto.Items)
        {
            // Pobiera usługę z bazy danych
            var service = await _context.Services.FindAsync(itemDto.ServiceId);
            if (service == null)
            {
                return BadRequest($"Usługa o ID {itemDto.ServiceId} nie istnieje."); // Zwraca błąd jeśli usługa nie istnieje
            }

            // Tworzy nową pozycję faktury
            var invoiceItem = new InvoiceItem
            {
                Invoice = invoice, // Przypisuje do faktury
                ServiceId = service.Id, // Ustawia ID usługi
                Description = service.Name, // Ustawia opis z nazwy usługi
                Quantity = itemDto.Quantity, // Ustawia ilość
                UnitPrice = service.Price, // Ustawia cenę jednostkową z usługi
                NetAmount = service.Price * itemDto.Quantity, // Kwota netto = cena * ilość
                TaxAmount = (service.Price * itemDto.Quantity) * 0.23m, // Podatek VAT 23%
                GrossAmount = (service.Price * itemDto.Quantity) * 1.23m // Kwota brutto z VAT
            };
            invoice.Items.Add(invoiceItem); // Dodaje pozycję do faktury
            total += invoiceItem.GrossAmount; // Dodaje do sumy całkowitej
        }

        invoice.TotalAmount = total; // Aktualizuje całkowitą kwotę faktury

        try
        {
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
        }
        catch (DbUpdateConcurrencyException) // Obsługa wyjątku współbieżności
        {
            if (!_context.Invoices.Any(e => e.Id == id)) // Sprawdza czy faktura nadal istnieje
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
    /// Metoda HTTP DELETE - usuwa fakturę z systemu
    /// Endpoint: DELETE /api/invoices/{id}
    /// </summary>
    /// <param name="id">ID faktury do usunięcia</param>
    /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli faktura nie istnieje</returns>
    [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
    public async Task<IActionResult> DeleteInvoice(int id) // Metoda asynchroniczna zwracająca IActionResult
    {
        // Pobiera fakturę o podanym ID wraz z pozycjami
        var invoice = await _context.Invoices
            .Include(i => i.Items) // Dołącza pozycje, aby zostały usunięte kaskadowo
            .FirstOrDefaultAsync(i => i.Id == id); // Pobiera pierwszy element lub null

        if (invoice == null)
        {
            return NotFound(); // Zwraca status HTTP 404 Not Found jeśli faktura nie istnieje
        }

        _context.Invoices.Remove(invoice); // Usuwa fakturę z kontekstu
        await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

        return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
    }
}