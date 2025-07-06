using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CRM.API.Controllers
{
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

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new System.InvalidOperationException("User ID not found in token.");
            }
            return userId;
        }

        // GET: api/Notes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
        {
            var userId = GetCurrentUserId();
            var notes = await _context.Notes
                .Where(n => n.UserId == userId)
                .Include(n => n.User)
                .Include(n => n.Customer)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
            return Ok(notes);
        }

        // GET: api/Notes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var userId = GetCurrentUserId();
            var note = await _context.Notes.FindAsync(id);

            if (note == null || note.UserId != userId)
            {
                return NotFound();
            }

            return Ok(note);
        }

        // POST: api/Notes
        [HttpPost]
        public async Task<ActionResult<Note>> PostNote(CreateNoteDto createNoteDto)
        {
            var userId = GetCurrentUserId();
            var note = new Note
            {
                Content = createNoteDto.Content,
                CreatedAt = DateTime.UtcNow,
                UserId = userId,
                CustomerId = createNoteDto.CustomerId
            };

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNote", new { id = note.Id }, note);
        }

        // PUT: api/Notes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutNote(int id, UpdateNoteDto updateNoteDto)
        {
            if (id != updateNoteDto.Id)
            {
                return BadRequest();
            }

            var userId = GetCurrentUserId();
            var note = await _context.Notes.FindAsync(id);

            if (note == null || note.UserId != userId)
            {
                return NotFound();
            }

            note.Content = updateNoteDto.Content;
            note.CustomerId = updateNoteDto.CustomerId;

            _context.Entry(note).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NoteExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Notes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var userId = GetCurrentUserId();
            var note = await _context.Notes.FindAsync(id);
            if (note == null || note.UserId != userId)
            {
                return NotFound();
            }

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool NoteExists(int id)
        {
            return _context.Notes.Any(e => e.Id == id);
        }
    }
}