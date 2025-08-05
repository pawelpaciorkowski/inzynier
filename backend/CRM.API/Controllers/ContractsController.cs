using CRM.Data;
using CRM.Data.Models;
using CRM.BusinessLogic.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Data Transfer Object (DTO) do wyświetlania kontraktów na liście
/// Zawiera podstawowe informacje o kontrakcie potrzebne do wyświetlenia w tabeli
/// </summary>
public class ContractListItemDto
{
    public int Id { get; set; } // Unikalny identyfikator kontraktu
    public string Title { get; set; } = null!; // Tytuł kontraktu
    public DateTime SignedAt { get; set; } // Data podpisania kontraktu
    public string CustomerName { get; set; } = null!; // Nazwa klienta

    // NOWE POLA - rozszerzone informacje o kontrakcie
    public string? ContractNumber { get; set; } // Numer kontraktu (opcjonalny)
    public DateTime? EndDate { get; set; } // Data zakończenia kontraktu (opcjonalna)
    public decimal? NetAmount { get; set; } // Kwota netto kontraktu (opcjonalna)
}

/// <summary>
/// Data Transfer Object (DTO) do tworzenia nowego kontraktu
/// Zawiera minimalne dane wymagane do utworzenia kontraktu
/// </summary>
public class CreateContractDto
{
    public string Title { get; set; } = null!; // Tytuł kontraktu
    public DateTime SignedAt { get; set; } // Data podpisania kontraktu
    public int CustomerId { get; set; } // ID klienta
}

/// <summary>
/// Data Transfer Object (DTO) do edycji kontraktu
/// Zawiera wszystkie pola możliwe do aktualizacji w kontrakcie
/// </summary>
public class UpdateContractDto
{
    public int Id { get; set; } // ID kontraktu do aktualizacji
    public string Title { get; set; } = null!; // Tytuł kontraktu
    public string ContractNumber { get; set; } = null!; // Numer kontraktu
    public string PlaceOfSigning { get; set; } = null!; // Miejsce podpisania kontraktu
    public DateTime SignedAt { get; set; } // Data podpisania kontraktu
    public DateTime? StartDate { get; set; } // Data rozpoczęcia kontraktu (opcjonalna)
    public DateTime? EndDate { get; set; } // Data zakończenia kontraktu (opcjonalna)
    public decimal? NetAmount { get; set; } // Kwota netto kontraktu (opcjonalna)
    public int? PaymentTermDays { get; set; } // Termin płatności w dniach (opcjonalny)
    public string ScopeOfServices { get; set; } = null!; // Zakres usług
    public int CustomerId { get; set; } // ID klienta
}

/// <summary>
/// Data Transfer Object (DTO) do szczegółów kontraktu
/// Zawiera pełne informacje o kontrakcie do wyświetlenia na stronie szczegółów
/// </summary>
public class ContractDetailDto
{
    public int Id { get; set; } // Unikalny identyfikator kontraktu
    public string Title { get; set; } = null!; // Tytuł kontraktu
    public string ContractNumber { get; set; } = null!; // Numer kontraktu
    public string PlaceOfSigning { get; set; } = null!; // Miejsce podpisania kontraktu
    public string SignedAt { get; set; } = null!; // Data podpisania kontraktu (jako string)
    public string? StartDate { get; set; } // Data rozpoczęcia kontraktu (jako string, opcjonalna)
    public string? EndDate { get; set; } // Data zakończenia kontraktu (jako string, opcjonalna)
    public decimal? NetAmount { get; set; } // Kwota netto kontraktu (opcjonalna)
    public int? PaymentTermDays { get; set; } // Termin płatności w dniach (opcjonalny)
    public string ScopeOfServices { get; set; } = null!; // Zakres usług
    public int CustomerId { get; set; } // ID klienta
}

/// <summary>
/// Kontroler do zarządzania kontraktami w systemie CRM
/// Klasa obsługuje operacje CRUD dla kontraktów oraz generowanie dokumentów
/// </summary>
[ApiController] // Oznacza klasę jako kontroler API
[Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Contracts)
[Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
public class ContractsController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
{
    /// <summary>
    /// Kontekst bazy danych Entity Framework
    /// Pozwala na wykonywanie operacji na bazie danych
    /// </summary>
    private readonly ApplicationDbContext _context;

    /// <summary>
    /// Serwis do generowania dokumentów
    /// Używany do tworzenia dokumentów Word na podstawie szablonów
    /// </summary>
    private readonly DocumentGenerationService _docService;

    /// <summary>
    /// Konstruktor klasy ContractsController
    /// Inicjalizuje kontroler z kontekstem bazy danych i serwisem generowania dokumentów
    /// </summary>
    /// <param name="context">Kontekst bazy danych przekazany przez dependency injection</param>
    /// <param name="docService">Serwis generowania dokumentów przekazany przez dependency injection</param>
    public ContractsController(ApplicationDbContext context, DocumentGenerationService docService)
    {
        _context = context; // Przypisuje przekazany kontekst do pola prywatnego
        _docService = docService; // Przypisuje przekazany serwis do pola prywatnego
    }

    /// <summary>
    /// Metoda HTTP GET - pobiera listę wszystkich kontraktów
    /// Endpoint: GET /api/contracts
    /// </summary>
    /// <returns>Lista wszystkich kontraktów z podstawowymi informacjami</returns>
    [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
    public async Task<ActionResult<IEnumerable<ContractListItemDto>>> GetContracts() // Metoda asynchroniczna zwracająca listę kontraktów
    {
        // Pobiera wszystkie kontrakty z bazy danych wraz z danymi klientów
        var contracts = await _context.Contracts
            .Include(c => c.Customer) // Dołącza dane klienta
            .Select(c => new ContractListItemDto // Projektuje dane do DTO
            {
                Id = c.Id, // ID kontraktu
                Title = c.Title, // Tytuł kontraktu
                SignedAt = c.SignedAt, // Data podpisania
                CustomerName = c.Customer != null ? c.Customer.Name : "Brak klienta", // Nazwa klienta z obsługą null

                // NOWE POLA - rozszerzone informacje
                ContractNumber = c.ContractNumber, // Numer kontraktu
                EndDate = c.EndDate, // Data zakończenia
                NetAmount = c.NetAmount // Kwota netto
            })
            .OrderByDescending(c => c.SignedAt) // Sortuje od najnowszych kontraktów
            .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę

        return Ok(contracts); // Zwraca status HTTP 200 OK z listą kontraktów
    }

    /// <summary>
    /// Metoda HTTP GET - pobiera szczegóły kontraktu o określonym ID
    /// Endpoint: GET /api/contracts/{id}
    /// </summary>
    /// <param name="id">ID kontraktu do pobrania</param>
    /// <returns>Szczegóły kontraktu lub NotFound jeśli kontrakt nie istnieje</returns>
    [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
    public async Task<ActionResult<ContractDetailDto>> GetContract(int id) // Metoda asynchroniczna zwracająca szczegóły kontraktu
    {
        // Pobiera kontrakt o podanym ID wraz z danymi klienta
        var contract = await _context.Contracts
            .Include(c => c.Customer) // Dołącza dane klienta
            .FirstOrDefaultAsync(c => c.Id == id); // Pobiera pierwszy element lub null

        if (contract == null)
        {
            return NotFound(); // Zwraca status HTTP 404 Not Found jeśli kontrakt nie istnieje
        }

        // Mapuje dane kontraktu na DTO szczegółów
        var contractDto = new ContractDetailDto
        {
            Id = contract.Id, // ID kontraktu
            Title = contract.Title, // Tytuł kontraktu
            ContractNumber = contract.ContractNumber ?? "", // Numer kontraktu (pusty string jeśli null)
            PlaceOfSigning = contract.PlaceOfSigning ?? "", // Miejsce podpisania (pusty string jeśli null)
            SignedAt = contract.SignedAt.ToString("yyyy-MM-ddTHH:mm:ss"), // Data podpisania jako string
            StartDate = contract.StartDate?.ToString("yyyy-MM-ddTHH:mm:ss"), // Data rozpoczęcia jako string (opcjonalna)
            EndDate = contract.EndDate?.ToString("yyyy-MM-ddTHH:mm:ss"), // Data zakończenia jako string (opcjonalna)
            NetAmount = contract.NetAmount, // Kwota netto
            PaymentTermDays = contract.PaymentTermDays, // Termin płatności
            ScopeOfServices = contract.ScopeOfServices ?? "", // Zakres usług (pusty string jeśli null)
            CustomerId = contract.CustomerId // ID klienta
        };

        return Ok(contractDto); // Zwraca status HTTP 200 OK z szczegółami kontraktu
    }

    /// <summary>
    /// Metoda HTTP POST - tworzy nowy kontrakt w systemie
    /// Endpoint: POST /api/contracts
    /// </summary>
    /// <param name="contractDto">Dane nowego kontraktu</param>
    /// <returns>Nowo utworzony kontrakt z statusem HTTP 201 Created</returns>
    [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
    public async Task<ActionResult<Contract>> CreateContract(CreateContractDto contractDto) // Metoda asynchroniczna zwracająca utworzony kontrakt
    {
        // Sprawdza czy model jest poprawny
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState); // Zwraca status HTTP 400 Bad Request z błędami walidacji
        }

        // Tworzy nowy obiekt kontraktu
        var contract = new Contract
        {
            Title = contractDto.Title, // Ustawia tytuł
            SignedAt = contractDto.SignedAt, // Ustawia datę podpisania
            CustomerId = contractDto.CustomerId, // Ustawia ID klienta
        };

        _context.Contracts.Add(contract); // Dodaje kontrakt do kontekstu
        await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

        return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, contract); // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu
    }

    /// <summary>
    /// Metoda HTTP PUT - aktualizuje istniejący kontrakt
    /// Endpoint: PUT /api/contracts/{id}
    /// </summary>
    /// <param name="id">ID kontraktu do aktualizacji</param>
    /// <param name="contractDto">Nowe dane kontraktu</param>
    /// <returns>Status HTTP 204 No Content po pomyślnej aktualizacji lub NotFound jeśli kontrakt nie istnieje</returns>
    [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
    public async Task<IActionResult> UpdateContract(int id, [FromBody] UpdateContractDto contractDto) // Metoda asynchroniczna zwracająca IActionResult
    {
        // Pobiera kontrakt o podanym ID z bazy danych
        var contractToUpdate = await _context.Contracts.FindAsync(id);
        if (contractToUpdate == null)
        {
            return NotFound(); // Zwraca status HTTP 404 Not Found jeśli kontrakt nie istnieje
        }

        // Aktualizuje wszystkie pola kontraktu
        contractToUpdate.Title = contractDto.Title; // Aktualizuje tytuł
        contractToUpdate.ContractNumber = contractDto.ContractNumber; // Aktualizuje numer kontraktu
        contractToUpdate.PlaceOfSigning = contractDto.PlaceOfSigning; // Aktualizuje miejsce podpisania
        contractToUpdate.SignedAt = contractDto.SignedAt; // Aktualizuje datę podpisania
        contractToUpdate.StartDate = contractDto.StartDate; // Aktualizuje datę rozpoczęcia
        contractToUpdate.EndDate = contractDto.EndDate; // Aktualizuje datę zakończenia
        contractToUpdate.NetAmount = contractDto.NetAmount; // Aktualizuje kwotę netto
        contractToUpdate.PaymentTermDays = contractDto.PaymentTermDays; // Aktualizuje termin płatności
        contractToUpdate.ScopeOfServices = contractDto.ScopeOfServices; // Aktualizuje zakres usług
        contractToUpdate.CustomerId = contractDto.CustomerId; // Aktualizuje ID klienta

        await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
        return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnej aktualizacji
    }

    /// <summary>
    /// Metoda HTTP DELETE - usuwa kontrakt z systemu
    /// Endpoint: DELETE /api/contracts/{id}
    /// </summary>
    /// <param name="id">ID kontraktu do usunięcia</param>
    /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli kontrakt nie istnieje</returns>
    [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
    public async Task<IActionResult> DeleteContract(int id) // Metoda asynchroniczna zwracająca IActionResult
    {
        // Pobiera kontrakt o podanym ID z bazy danych
        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null)
        {
            return NotFound(); // Zwraca status HTTP 404 Not Found jeśli kontrakt nie istnieje
        }

        _context.Contracts.Remove(contract); // Usuwa kontrakt z kontekstu
        await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

        return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
    }

    /// <summary>
    /// Metoda HTTP GET - generuje dokument Word na podstawie kontraktu i szablonu
    /// Endpoint: GET /api/contracts/{contractId}/generate-document?templateId=1
    /// </summary>
    /// <param name="contractId">ID kontraktu do wygenerowania dokumentu</param>
    /// <param name="templateId">ID szablonu dokumentu</param>
    /// <returns>Plik Word z wygenerowanym dokumentem lub błąd</returns>
    [HttpGet("{contractId}/generate-document")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce /generate-document
    public async Task<IActionResult> GenerateDocument(int contractId, [FromQuery] int templateId) // Metoda asynchroniczna zwracająca plik
    {
        try
        {
            // Generuje dokument Word używając serwisu generowania dokumentów
            var fileBytes = await _docService.GenerateContractDocumentAsync(contractId, templateId);
            var fileName = $"umowa-{contractId}-{DateTime.Now:yyyyMMdd}.docx"; // Tworzy nazwę pliku z datą
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileName); // Zwraca plik Word do pobrania
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message); // Zwraca status HTTP 404 Not Found z komunikatem błędu
        }
    }
}