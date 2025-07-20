// Plik: backend/CRM.API/Controllers/TagsController.cs
using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TagsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TagsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTags()
        {
            var tags = await _context.Tags
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Color,
                    t.Description,
                    CustomerCount = t.CustomerTags.Count,
                    ContractCount = t.ContractTags.Count,
                    InvoiceCount = t.InvoiceTags.Count,
                    TaskCount = t.TaskTags.Count,
                    MeetingCount = t.MeetingTags.Count
                })
                .ToListAsync();
            return Ok(tags);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTag(int id)
        {
            var tag = await _context.Tags
                .Include(t => t.CustomerTags)
                    .ThenInclude(ct => ct.Customer)
                .Include(t => t.ContractTags)
                    .ThenInclude(ct => ct.Contract)
                .Include(t => t.InvoiceTags)
                    .ThenInclude(it => it.Invoice)
                .Include(t => t.TaskTags)
                    .ThenInclude(tt => tt.Task)
                .Include(t => t.MeetingTags)
                    .ThenInclude(mt => mt.Meeting)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tag == null) return NotFound();

            var result = new
            {
                tag.Id,
                tag.Name,
                tag.Color,
                tag.Description,
                Customers = tag.CustomerTags.Select(ct => new { ct.Customer.Id, ct.Customer.Name, ct.Customer.Email }),
                Contracts = tag.ContractTags.Select(ct => new { ct.Contract.Id, ct.Contract.Title, ct.Contract.ContractNumber }),
                Invoices = tag.InvoiceTags.Select(it => new { it.Invoice.Id, it.Invoice.Number, it.Invoice.TotalAmount }),
                Tasks = tag.TaskTags.Select(tt => new { tt.Task.Id, tt.Task.Title, tt.Task.Completed }),
                Meetings = tag.MeetingTags.Select(mt => new { mt.Meeting.Id, mt.Meeting.Topic, mt.Meeting.ScheduledAt })
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTag([FromBody] Tag tag)
        {
            if (string.IsNullOrWhiteSpace(tag.Name))
                return BadRequest("Nazwa tagu jest wymagana.");

            _context.Tags.Add(tag);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTags), new { id = tag.Id }, tag);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTag(int id, [FromBody] Tag updatedTag)
        {
            var tag = await _context.Tags.FindAsync(id);
            if (tag == null) return NotFound();

            tag.Name = updatedTag.Name;
            tag.Color = updatedTag.Color;
            tag.Description = updatedTag.Description;

            await _context.SaveChangesAsync();
            return Ok(tag);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTag(int id)
        {
            var tag = await _context.Tags.FindAsync(id);
            if (tag == null) return NotFound();
            _context.Tags.Remove(tag);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ✅ NOWE ENDPOINTY DLA ZARZĄDZANIA TAGAMI RÓŻNYCH ENCJI

        [HttpPost("customers/{customerId}/tags/{tagId}")]
        public async Task<IActionResult> AddTagToCustomer(int customerId, int tagId)
        {
            var customer = await _context.Customers.FindAsync(customerId);
            var tag = await _context.Tags.FindAsync(tagId);

            if (customer == null || tag == null) return NotFound();

            var existingTag = await _context.CustomerTags
                .FirstOrDefaultAsync(ct => ct.CustomerId == customerId && ct.TagId == tagId);

            if (existingTag != null)
                return BadRequest("Klient już ma ten tag.");

            var customerTag = new CustomerTag { CustomerId = customerId, TagId = tagId };
            _context.CustomerTags.Add(customerTag);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tag został dodany do klienta." });
        }

        [HttpDelete("customers/{customerId}/tags/{tagId}")]
        public async Task<IActionResult> RemoveTagFromCustomer(int customerId, int tagId)
        {
            var customerTag = await _context.CustomerTags
                .FirstOrDefaultAsync(ct => ct.CustomerId == customerId && ct.TagId == tagId);

            if (customerTag == null) return NotFound();

            _context.CustomerTags.Remove(customerTag);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tag został usunięty z klienta." });
        }

        [HttpPost("contracts/{contractId}/tags/{tagId}")]
        public async Task<IActionResult> AddTagToContract(int contractId, int tagId)
        {
            var contract = await _context.Contracts.FindAsync(contractId);
            var tag = await _context.Tags.FindAsync(tagId);

            if (contract == null || tag == null) return NotFound();

            var existingTag = await _context.ContractTags
                .FirstOrDefaultAsync(ct => ct.ContractId == contractId && ct.TagId == tagId);

            if (existingTag != null)
                return BadRequest("Kontrakt już ma ten tag.");

            var contractTag = new ContractTag { ContractId = contractId, TagId = tagId };
            _context.ContractTags.Add(contractTag);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tag został dodany do kontraktu." });
        }

        [HttpDelete("contracts/{contractId}/tags/{tagId}")]
        public async Task<IActionResult> RemoveTagFromContract(int contractId, int tagId)
        {
            var contractTag = await _context.ContractTags
                .FirstOrDefaultAsync(ct => ct.ContractId == contractId && ct.TagId == tagId);

            if (contractTag == null) return NotFound();

            _context.ContractTags.Remove(contractTag);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tag został usunięty z kontraktu." });
        }

        [HttpPost("invoices/{invoiceId}/tags/{tagId}")]
        public async Task<IActionResult> AddTagToInvoice(int invoiceId, int tagId)
        {
            var invoice = await _context.Invoices.FindAsync(invoiceId);
            var tag = await _context.Tags.FindAsync(tagId);

            if (invoice == null || tag == null) return NotFound();

            var existingTag = await _context.InvoiceTags
                .FirstOrDefaultAsync(it => it.InvoiceId == invoiceId && it.TagId == tagId);

            if (existingTag != null)
                return BadRequest("Faktura już ma ten tag.");

            var invoiceTag = new InvoiceTag { InvoiceId = invoiceId, TagId = tagId };
            _context.InvoiceTags.Add(invoiceTag);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tag został dodany do faktury." });
        }

        [HttpDelete("invoices/{invoiceId}/tags/{tagId}")]
        public async Task<IActionResult> RemoveTagFromInvoice(int invoiceId, int tagId)
        {
            var invoiceTag = await _context.InvoiceTags
                .FirstOrDefaultAsync(it => it.InvoiceId == invoiceId && it.TagId == tagId);

            if (invoiceTag == null) return NotFound();

            _context.InvoiceTags.Remove(invoiceTag);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tag został usunięty z faktury." });
        }

        [HttpPost("tasks/{taskId}/tags/{tagId}")]
        public async Task<IActionResult> AddTagToTask(int taskId, int tagId)
        {
            var task = await _context.Tasks.FindAsync(taskId);
            var tag = await _context.Tags.FindAsync(tagId);

            if (task == null || tag == null) return NotFound();

            var existingTag = await _context.TaskTags
                .FirstOrDefaultAsync(tt => tt.TaskId == taskId && tt.TagId == tagId);

            if (existingTag != null)
                return BadRequest("Zadanie już ma ten tag.");

            var taskTag = new TaskTag { TaskId = taskId, TagId = tagId };
            _context.TaskTags.Add(taskTag);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tag został dodany do zadania." });
        }

        [HttpDelete("tasks/{taskId}/tags/{tagId}")]
        public async Task<IActionResult> RemoveTagFromTask(int taskId, int tagId)
        {
            var taskTag = await _context.TaskTags
                .FirstOrDefaultAsync(tt => tt.TaskId == taskId && tt.TagId == tagId);

            if (taskTag == null) return NotFound();

            _context.TaskTags.Remove(taskTag);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tag został usunięty z zadania." });
        }

        [HttpPost("meetings/{meetingId}/tags/{tagId}")]
        public async Task<IActionResult> AddTagToMeeting(int meetingId, int tagId)
        {
            var meeting = await _context.Meetings.FindAsync(meetingId);
            var tag = await _context.Tags.FindAsync(tagId);

            if (meeting == null || tag == null) return NotFound();

            var existingTag = await _context.MeetingTags
                .FirstOrDefaultAsync(mt => mt.MeetingId == meetingId && mt.TagId == tagId);

            if (existingTag != null)
                return BadRequest("Spotkanie już ma ten tag.");

            var meetingTag = new MeetingTag { MeetingId = meetingId, TagId = tagId };
            _context.MeetingTags.Add(meetingTag);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tag został dodany do spotkania." });
        }

        [HttpDelete("meetings/{meetingId}/tags/{tagId}")]
        public async Task<IActionResult> RemoveTagFromMeeting(int meetingId, int tagId)
        {
            var meetingTag = await _context.MeetingTags
                .FirstOrDefaultAsync(mt => mt.MeetingId == meetingId && mt.TagId == tagId);

            if (meetingTag == null) return NotFound();

            _context.MeetingTags.Remove(meetingTag);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tag został usunięty ze spotkania." });
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetTagStatistics()
        {
            var statistics = await _context.Tags
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Color,
                    CustomerCount = t.CustomerTags.Count,
                    ContractCount = t.ContractTags.Count,
                    InvoiceCount = t.InvoiceTags.Count,
                    TaskCount = t.TaskTags.Count,
                    MeetingCount = t.MeetingTags.Count,
                    TotalUsage = t.CustomerTags.Count + t.ContractTags.Count + t.InvoiceTags.Count + t.TaskTags.Count + t.MeetingTags.Count
                })
                .OrderByDescending(s => s.TotalUsage)
                .ToListAsync();

            return Ok(statistics);
        }
    }
}