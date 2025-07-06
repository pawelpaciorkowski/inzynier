using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CRM.API.Controllers
{
    public class NoteListItemDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = null!;
        public string CustomerName { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
    public class CreateNoteDto
    {
        public string Content { get; set; } = null!;
        public int CustomerId { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotesController(ApplicationDbContext context) { _context = context; }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new InvalidOperationException("User ID not found in token.");
            }
            return userId;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NoteListItemDto>>> GetNotes()
        {
            var userId = GetCurrentUserId();
            var notes = await _context.Notes
                .Where(n => n.UserId == userId)
                .Include(n => n.Customer)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NoteListItemDto
                {
                    Id = n.Id,
                    Content = n.Content.Length > 100 ? n.Content.Substring(0, 100) + "..." : n.Content,
                    CreatedAt = n.CreatedAt,
                    CustomerName = n.Customer != null ? n.Customer.Name : "Brak klienta"
                })
                .ToListAsync();

            return Ok(notes);
        }

        [HttpPost]
        public async Task<ActionResult<Note>> PostNote(CreateNoteDto createNoteDto)
        {
            var userId = GetCurrentUserId();
            var note = new Note
            {
                Content = createNoteDto.Content,
                CreatedAt = DateTime.UtcNow,
                UserId = userId, // Przypisujemy ID zalogowanego użytkownika
                CustomerId = createNoteDto.CustomerId
            };

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNotes), new { id = note.Id }, note);
        }
    }
}