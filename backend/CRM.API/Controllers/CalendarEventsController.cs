using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.API.Controllers
{
    // DTOs
    public class CalendarEventDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }

    public class CreateCalendarEventDto
    {
        public string Title { get; set; } = null!;
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }

    public class UpdateCalendarEventDto
    {
        public string Title { get; set; } = null!;
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CalendarEventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CalendarEventsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/CalendarEvents
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CalendarEventDto>>> GetCalendarEvents()
        {
            var events = await _context.CalendarEvents
                .Select(e => new CalendarEventDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Start = e.Start,
                    End = e.End
                })
                .ToListAsync();
            return Ok(events);
        }

        // GET: api/CalendarEvents/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CalendarEventDto>> GetCalendarEvent(int id)
        {
            var calendarEvent = await _context.CalendarEvents
                .Where(e => e.Id == id)
                .Select(e => new CalendarEventDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Start = e.Start,
                    End = e.End
                })
                .FirstOrDefaultAsync();

            if (calendarEvent == null)
            {
                return NotFound();
            }

            return Ok(calendarEvent);
        }

        // POST: api/CalendarEvents
        [HttpPost]
        public async Task<ActionResult<CalendarEventDto>> CreateCalendarEvent(CreateCalendarEventDto createCalendarEventDto)
        {
            if (createCalendarEventDto.Start > createCalendarEventDto.End)
            {
                return BadRequest("Data rozpoczęcia nie może być późniejsza niż data zakończenia.");
            }
            if (createCalendarEventDto.Start < DateTime.UtcNow)
            {
                return BadRequest("Data rozpoczęcia nie może być z przeszłości.");
            }

            var calendarEvent = new CalendarEvent
            {
                Title = createCalendarEventDto.Title,
                Start = createCalendarEventDto.Start,
                End = createCalendarEventDto.End
            };

            _context.CalendarEvents.Add(calendarEvent);
            await _context.SaveChangesAsync();

            var calendarEventDto = new CalendarEventDto
            {
                Id = calendarEvent.Id,
                Title = calendarEvent.Title,
                Start = calendarEvent.Start,
                End = calendarEvent.End
            };

            return CreatedAtAction(nameof(GetCalendarEvent), new { id = calendarEvent.Id }, calendarEventDto);
        }

        // PUT: api/CalendarEvents/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCalendarEvent(int id, UpdateCalendarEventDto updateCalendarEventDto)
        {
            if (updateCalendarEventDto.Start > updateCalendarEventDto.End)
            {
                return BadRequest("Data rozpoczęcia nie może być późniejsza niż data zakończenia.");
            }
            if (updateCalendarEventDto.Start < DateTime.UtcNow)
            {
                return BadRequest("Data rozpoczęcia nie może być z przeszłości.");
            }

            var calendarEvent = await _context.CalendarEvents.FindAsync(id);

            if (calendarEvent == null)
            {
                return NotFound();
            }

            calendarEvent.Title = updateCalendarEventDto.Title;
            calendarEvent.Start = updateCalendarEventDto.Start;
            calendarEvent.End = updateCalendarEventDto.End;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CalendarEventExists(id))
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

        // DELETE: api/CalendarEvents/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCalendarEvent(int id)
        {
            var calendarEvent = await _context.CalendarEvents.FindAsync(id);
            if (calendarEvent == null)
            {
                return NotFound();
            }

            _context.CalendarEvents.Remove(calendarEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CalendarEventExists(int id)
        {
            return _context.CalendarEvents.Any(e => e.Id == id);
        }
    }
}
