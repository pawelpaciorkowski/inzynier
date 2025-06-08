using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public class MeetingListItemDto
{
    public int Id { get; set; }
    public string Topic { get; set; } = null!;
    public DateTime ScheduledAt { get; set; }
    public string CustomerName { get; set; } = null!;
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

    // GET: api/meetings
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
}