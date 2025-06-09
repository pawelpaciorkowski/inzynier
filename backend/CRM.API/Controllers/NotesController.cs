using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public class NoteListItemDto
{
    public int Id { get; set; }
    public string Content { get; set; } = null!;
    public string CustomerName { get; set; } = null!;
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NoteListItemDto>>> GetNotes()
    {
        var notes = await _context.Notes
            .Include(n => n.Customer)
            .Select(n => new NoteListItemDto
            {
                Id = n.Id,
                Content = n.Content.Length > 100 ? n.Content.Substring(0, 100) + "..." : n.Content,
                CustomerName = n.Customer != null ? n.Customer.Name : "Brak klienta"
            })
            .ToListAsync();

        return Ok(notes);
    }
}