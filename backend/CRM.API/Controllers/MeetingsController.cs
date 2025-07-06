using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class MeetingListItemDto
{
    public int Id { get; set; }
    public string Topic { get; set; } = null!;
    public DateTime ScheduledAt { get; set; }
    public string CustomerName { get; set; } = null!;
}

public class CreateMeetingDto
{
    public string Topic { get; set; } = null!;
    public DateTime ScheduledAt { get; set; }
    public int CustomerId { get; set; }
}

public class UpdateMeetingDto
{
    public string Topic { get; set; } = null!;
    public DateTime ScheduledAt { get; set; }
    public int CustomerId { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MeetingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MeetingsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MeetingListItemDto>>> GetMeetings()
    {
        var meetings = await _context.Meetings
            .Include(m => m.Customer)
            .Select(m => new MeetingListItemDto
            {
                Id = m.Id,
                Topic = m.Topic,
                ScheduledAt = m.ScheduledAt,
                CustomerName = m.Customer != null ? m.Customer.Name : "Brak klienta"
            })
            .OrderByDescending(m => m.ScheduledAt)
            .ToListAsync();

        return Ok(meetings);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MeetingListItemDto>> GetMeeting(int id)
    {
        var meeting = await _context.Meetings
            .Include(m => m.Customer)
            .Where(m => m.Id == id)
            .Select(m => new MeetingListItemDto
            {
                Id = m.Id,
                Topic = m.Topic,
                ScheduledAt = m.ScheduledAt,
                CustomerName = m.Customer != null ? m.Customer.Name : "Brak klienta"
            })
            .FirstOrDefaultAsync();

        if (meeting == null)
        {
            return NotFound();
        }

        return Ok(meeting);
    }

    [HttpPost]
    public async Task<ActionResult<MeetingListItemDto>> CreateMeeting(CreateMeetingDto createMeetingDto)
    {
        var meeting = new Meeting
        {
            Topic = createMeetingDto.Topic,
            ScheduledAt = createMeetingDto.ScheduledAt,
            CustomerId = createMeetingDto.CustomerId
        };

        _context.Meetings.Add(meeting);
        await _context.SaveChangesAsync();

        var createdMeetingDto = new MeetingListItemDto
        {
            Id = meeting.Id,
            Topic = meeting.Topic,
            ScheduledAt = meeting.ScheduledAt,
            CustomerName = (await _context.Customers.FindAsync(meeting.CustomerId))?.Name ?? "Brak klienta"
        };

        return CreatedAtAction(nameof(GetMeetings), new { id = meeting.Id }, createdMeetingDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMeeting(int id, UpdateMeetingDto updateMeetingDto)
    {
        var meeting = await _context.Meetings.FindAsync(id);

        if (meeting == null)
        {
            return NotFound();
        }

        meeting.Topic = updateMeetingDto.Topic;
        meeting.ScheduledAt = updateMeetingDto.ScheduledAt;
        meeting.CustomerId = updateMeetingDto.CustomerId;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!MeetingExists(id))
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMeeting(int id)
    {
        var meeting = await _context.Meetings.FindAsync(id);
        if (meeting == null)
        {
            return NotFound();
        }

        _context.Meetings.Remove(meeting);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool MeetingExists(int id)
    {
        return _context.Meetings.Any(e => e.Id == id);
    }
}