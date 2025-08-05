using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

/// <summary>
/// Data Transfer Object (DTO) dla listy spotkań
/// Zawiera podstawowe informacje o spotkaniu potrzebne do wyświetlenia w tabeli
/// </summary>
public class MeetingListItemDto
{
    public int Id { get; set; } // Unikalny identyfikator spotkania
    public string Topic { get; set; } = null!; // Temat spotkania
    public DateTime ScheduledAt { get; set; } // Data i godzina zaplanowanego spotkania
    public string CustomerName { get; set; } = null!; // Nazwa klienta
    public int CustomerId { get; set; } // ID klienta
}

/// <summary>
/// Data Transfer Object (DTO) dla tworzenia nowego spotkania
/// Zawiera dane potrzebne do utworzenia nowego spotkania
/// </summary>
public class CreateMeetingDto
{
    public string Topic { get; set; } = null!; // Temat spotkania
    public DateTime ScheduledAt { get; set; } // Data i godzina zaplanowanego spotkania
    public int CustomerId { get; set; } // ID klienta
}

/// <summary>
/// Data Transfer Object (DTO) dla aktualizacji spotkania
/// Zawiera dane potrzebne do aktualizacji istniejącego spotkania
/// </summary>
public class UpdateMeetingDto
{
    public string Topic { get; set; } = null!; // Temat spotkania
    public DateTime ScheduledAt { get; set; } // Data i godzina zaplanowanego spotkania
    public int CustomerId { get; set; } // ID klienta
}

/// <summary>
/// Kontroler do zarządzania spotkaniami w systemie CRM
/// Klasa obsługuje operacje CRUD dla spotkań z klientami
/// </summary>
[ApiController] // Oznacza klasę jako kontroler API
[Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Meetings)
[Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
public class MeetingsController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
{
    /// <summary>
    /// Kontekst bazy danych Entity Framework
    /// Pozwala na wykonywanie operacji na bazie danych
    /// </summary>
    private readonly ApplicationDbContext _context;

    /// <summary>
    /// Konstruktor klasy MeetingsController
    /// Inicjalizuje kontroler z kontekstem bazy danych
    /// </summary>
    /// <param name="context">Kontekst bazy danych przekazany przez dependency injection</param>
    public MeetingsController(ApplicationDbContext context)
    {
        _context = context; // Przypisuje przekazany kontekst do pola prywatnego
    }

    /// <summary>
    /// Metoda HTTP GET - pobiera listę wszystkich spotkań
    /// Endpoint: GET /api/meetings
    /// </summary>
    /// <returns>Lista wszystkich spotkań posortowana od najnowszych</returns>
    [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
    public async Task<ActionResult<IEnumerable<MeetingListItemDto>>> GetMeetings() // Metoda asynchroniczna zwracająca listę spotkań
    {
        // Pobiera wszystkie spotkania z bazy danych wraz z powiązanymi danymi klientów
        var meetings = await _context.Meetings
            .Include(m => m.Customer) // Dołącza dane klienta
            .Select(m => new MeetingListItemDto // Projektuje dane do DTO
            {
                Id = m.Id, // ID spotkania
                Topic = m.Topic, // Temat spotkania
                ScheduledAt = m.ScheduledAt, // Data i godzina spotkania
                CustomerName = m.Customer != null ? m.Customer.Name : "Brak klienta", // Nazwa klienta z obsługą null
                CustomerId = m.CustomerId // ID klienta
            })
            .OrderByDescending(m => m.ScheduledAt) // Sortuje od najnowszych spotkań
            .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę

        return Ok(meetings); // Zwraca status HTTP 200 OK z listą spotkań
    }

    /// <summary>
    /// Metoda HTTP GET - pobiera szczegóły pojedynczego spotkania
    /// Endpoint: GET /api/meetings/{id}
    /// </summary>
    /// <param name="id">ID spotkania do pobrania</param>
    /// <returns>Szczegóły spotkania lub NotFound jeśli spotkanie nie istnieje</returns>
    [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
    public async Task<ActionResult<MeetingListItemDto>> GetMeeting(int id) // Metoda asynchroniczna zwracająca szczegóły spotkania
    {
        // Pobiera spotkanie o podanym ID wraz z powiązanymi danymi klienta
        var meeting = await _context.Meetings
            .Include(m => m.Customer) // Dołącza dane klienta
            .Where(m => m.Id == id) // Filtruje po ID
            .Select(m => new MeetingListItemDto // Projektuje dane do DTO
            {
                Id = m.Id, // ID spotkania
                Topic = m.Topic, // Temat spotkania
                ScheduledAt = m.ScheduledAt, // Data i godzina spotkania
                CustomerName = m.Customer != null ? m.Customer.Name : "Brak klienta", // Nazwa klienta z obsługą null
                CustomerId = m.CustomerId // ID klienta
            })
            .FirstOrDefaultAsync(); // Pobiera pierwszy element lub null

        if (meeting == null)
        {
            return NotFound(); // Zwraca status HTTP 404 Not Found jeśli spotkanie nie istnieje
        }

        return Ok(meeting); // Zwraca status HTTP 200 OK ze szczegółami spotkania
    }

    /// <summary>
    /// Metoda HTTP POST - tworzy nowe spotkanie w systemie
    /// Endpoint: POST /api/meetings
    /// </summary>
    /// <param name="createMeetingDto">Dane nowego spotkania</param>
    /// <returns>Nowo utworzone spotkanie z statusem HTTP 201 Created</returns>
    [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
    public async Task<ActionResult<MeetingListItemDto>> CreateMeeting(CreateMeetingDto createMeetingDto) // Metoda asynchroniczna zwracająca nowe spotkanie
    {
        // Tworzy nowy obiekt spotkania
        var meeting = new Meeting
        {
            Topic = createMeetingDto.Topic, // Ustawia temat spotkania
            ScheduledAt = createMeetingDto.ScheduledAt, // Ustawia datę i godzinę spotkania
            CustomerId = createMeetingDto.CustomerId // Ustawia ID klienta
        };

        _context.Meetings.Add(meeting); // Dodaje spotkanie do kontekstu
        await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

        // Tworzy DTO dla nowo utworzonego spotkania z nazwą klienta
        var createdMeetingDto = new MeetingListItemDto
        {
            Id = meeting.Id, // ID nowego spotkania
            Topic = meeting.Topic, // Temat spotkania
            ScheduledAt = meeting.ScheduledAt, // Data i godzina spotkania
            CustomerName = (await _context.Customers.FindAsync(meeting.CustomerId))?.Name ?? "Brak klienta" // Pobiera nazwę klienta z bazy danych
        };

        // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu
        return CreatedAtAction(nameof(GetMeetings), new { id = meeting.Id }, createdMeetingDto);
    }

    /// <summary>
    /// Metoda HTTP PUT - aktualizuje istniejące spotkanie
    /// Endpoint: PUT /api/meetings/{id}
    /// </summary>
    /// <param name="id">ID spotkania do aktualizacji</param>
    /// <param name="updateMeetingDto">Nowe dane spotkania</param>
    /// <returns>Status HTTP 204 No Content po pomyślnej aktualizacji lub błąd</returns>
    [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
    public async Task<IActionResult> UpdateMeeting(int id, UpdateMeetingDto updateMeetingDto) // Metoda asynchroniczna zwracająca IActionResult
    {
        // Pobiera spotkanie o podanym ID z bazy danych
        var meeting = await _context.Meetings.FindAsync(id);

        if (meeting == null)
        {
            return NotFound(); // Zwraca status HTTP 404 Not Found jeśli spotkanie nie istnieje
        }

        // Aktualizuje dane spotkania
        meeting.Topic = updateMeetingDto.Topic; // Aktualizuje temat spotkania
        meeting.ScheduledAt = updateMeetingDto.ScheduledAt; // Aktualizuje datę i godzinę spotkania
        meeting.CustomerId = updateMeetingDto.CustomerId; // Aktualizuje ID klienta

        try
        {
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
        }
        catch (DbUpdateConcurrencyException) // Obsługa wyjątku współbieżności
        {
            if (!MeetingExists(id)) // Sprawdza czy spotkanie nadal istnieje
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
    /// Metoda HTTP DELETE - usuwa spotkanie z systemu
    /// Endpoint: DELETE /api/meetings/{id}
    /// </summary>
    /// <param name="id">ID spotkania do usunięcia</param>
    /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli spotkanie nie istnieje</returns>
    [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
    public async Task<IActionResult> DeleteMeeting(int id) // Metoda asynchroniczna zwracająca IActionResult
    {
        // Pobiera spotkanie o podanym ID z bazy danych
        var meeting = await _context.Meetings.FindAsync(id);
        if (meeting == null)
        {
            return NotFound(); // Zwraca status HTTP 404 Not Found jeśli spotkanie nie istnieje
        }

        _context.Meetings.Remove(meeting); // Usuwa spotkanie z kontekstu
        await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

        return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
    }

    /// <summary>
    /// Metoda pomocnicza - sprawdza czy spotkanie o podanym ID istnieje w bazie danych
    /// </summary>
    /// <param name="id">ID spotkania do sprawdzenia</param>
    /// <returns>True jeśli spotkanie istnieje, false w przeciwnym przypadku</returns>
    private bool MeetingExists(int id)
    {
        return _context.Meetings.Any(e => e.Id == id); // Sprawdza czy istnieje spotkanie o podanym ID
    }
}