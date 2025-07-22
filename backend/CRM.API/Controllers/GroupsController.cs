using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Security.Claims;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GroupsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GroupsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Pomocnicza metoda do pobierania ID aktualnego użytkownika
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        // Pomocnicza metoda do sprawdzania czy użytkownik jest adminem
        private async Task<bool> IsUserAdmin(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);
            return user?.Role?.Name?.ToLower() == "admin";
        }

        // Pomocnicza metoda do sprawdzania czy użytkownik należy do grupy
        private async Task<bool> IsUserInGroup(int userId, int groupId)
        {
            return await _context.UserGroups
                .AnyAsync(ug => ug.UserId == userId && ug.GroupId == groupId);
        }

        [HttpGet]
        public async Task<IActionResult> GetGroups()
        {
            var groups = await _context.Groups
                .Select(g => new { 
                    g.Id, 
                    g.Name, 
                    g.Description, 
                    MemberCount = g.UserGroups.Count(),
                    CustomerCount = g.AssignedCustomers.Count(),
                    TaskCount = g.AssignedTasks.Count(),
                    ContractCount = g.ResponsibleContracts.Count(),
                    InvoiceCount = g.AssignedInvoices.Count(),
                    MeetingCount = g.AssignedMeetings.Count()
                })
                .ToListAsync();
            return Ok(groups);
        }

        [HttpGet("my-groups")]
        public async Task<IActionResult> GetMyGroups()
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == 0) return Unauthorized();

            var isAdmin = await IsUserAdmin(currentUserId);
            
            IQueryable<Group> groupsQuery;
            
            if (isAdmin)
            {
                // Admin widzi wszystkie grupy
                groupsQuery = _context.Groups;
            }
            else
            {
                // Zwykły użytkownik widzi tylko swoje grupy
                groupsQuery = _context.Groups
                    .Where(g => g.UserGroups.Any(ug => ug.UserId == currentUserId));
            }

            var groups = await groupsQuery
                .Select(g => new { 
                    g.Id, 
                    g.Name, 
                    g.Description, 
                    MemberCount = g.UserGroups.Count(),
                    CustomerCount = g.AssignedCustomers.Count(),
                    TaskCount = g.AssignedTasks.Count(),
                    ContractCount = g.ResponsibleContracts.Count(),
                    InvoiceCount = g.AssignedInvoices.Count(),
                    MeetingCount = g.AssignedMeetings.Count()
                })
                .ToListAsync();
                
            return Ok(groups);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetGroup(int id)
        {
            var group = await _context.Groups
                .Include(g => g.UserGroups)
                    .ThenInclude(ug => ug.User)
                .Include(g => g.AssignedCustomers)
                .Include(g => g.AssignedTasks)
                .Include(g => g.ResponsibleContracts)
                .Include(g => g.AssignedInvoices)
                .Include(g => g.AssignedMeetings)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null) return NotFound();

            var result = new
            {
                group.Id,
                group.Name,
                group.Description,
                Members = group.UserGroups.Select(ug => new { ug.User.Id, ug.User.Username, ug.User.Email }),
                AssignedCustomers = group.AssignedCustomers.Select(c => new { c.Id, c.Name, c.Email }), // Dodajemy listę klientów
                CustomerCount = group.AssignedCustomers.Count,
                TaskCount = group.AssignedTasks.Count,
                ContractCount = group.ResponsibleContracts.Count,
                InvoiceCount = group.AssignedInvoices.Count,
                MeetingCount = group.AssignedMeetings.Count
            };

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateGroup([FromBody] Group newGroup)
        {
            if (string.IsNullOrWhiteSpace(newGroup.Name))
                return BadRequest("Nazwa grupy jest wymagana.");

            _context.Groups.Add(newGroup);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetGroups), new { id = newGroup.Id }, newGroup);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateGroup(int id, [FromBody] Group updatedGroup)
        {
            var group = await _context.Groups.FindAsync(id);
            if (group == null) return NotFound();

            group.Name = updatedGroup.Name;
            group.Description = updatedGroup.Description;

            await _context.SaveChangesAsync();
            return Ok(group);
        }

        [HttpPost("{groupId}/members/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddMemberToGroup(int groupId, int userId)
        {
            var group = await _context.Groups.FindAsync(groupId);
            var user = await _context.Users.FindAsync(userId);

            if (group == null || user == null) return NotFound();

            var existingMembership = await _context.UserGroups
                .FirstOrDefaultAsync(ug => ug.GroupId == groupId && ug.UserId == userId);

            if (existingMembership != null)
                return BadRequest("Użytkownik już należy do tej grupy.");

            var userGroup = new UserGroup { GroupId = groupId, UserId = userId, Group = group, User = user };
            _context.UserGroups.Add(userGroup);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Użytkownik został dodany do grupy." });
        }

        [HttpDelete("{groupId}/members/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveMemberFromGroup(int groupId, int userId)
        {
            var membership = await _context.UserGroups
                .FirstOrDefaultAsync(ug => ug.GroupId == groupId && ug.UserId == userId);

            if (membership == null) return NotFound();

            _context.UserGroups.Remove(membership);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Użytkownik został usunięty z grupy." });
        }

        [HttpPost("{groupId}/customers/{customerId}")]
        public async Task<IActionResult> AddCustomerToGroup(int groupId, int customerId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == 0) return Unauthorized();

            // Sprawdź czy użytkownik jest adminem lub należy do grupy
            var isAdmin = await IsUserAdmin(currentUserId);
            var isInGroup = await IsUserInGroup(currentUserId, groupId);

            if (!isAdmin && !isInGroup)
                return Forbid("Możesz przypisywać klientów tylko do swoich grup.");

            var group = await _context.Groups.FindAsync(groupId);
            if (group == null) return NotFound("Grupa nie została znaleziona.");

            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null) return NotFound("Klient nie został znaleziony.");

            customer.AssignedGroupId = groupId;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Klient został pomyślnie przypisany do grupy." });
        }

        [HttpDelete("{groupId}/customers/{customerId}")]
        public async Task<IActionResult> RemoveCustomerFromGroup(int groupId, int customerId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == 0) return Unauthorized();

            // Sprawdź czy użytkownik jest adminem lub należy do grupy
            var isAdmin = await IsUserAdmin(currentUserId);
            var isInGroup = await IsUserInGroup(currentUserId, groupId);

            if (!isAdmin && !isInGroup)
                return Forbid("Możesz usuwać klientów tylko ze swoich grup.");

            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId && c.AssignedGroupId == groupId);
            if (customer == null) return NotFound("Klient nie jest przypisany do tej grupy.");

            customer.AssignedGroupId = null; // Usuwamy przypisanie
            await _context.SaveChangesAsync();

            return Ok(new { message = "Klient został pomyślnie usunięty z grupy." });
        }

        [HttpGet("{id}/statistics")]
        public async Task<IActionResult> GetGroupStatistics(int id)
        {
            var group = await _context.Groups
                .Include(g => g.AssignedCustomers)
                .Include(g => g.AssignedTasks)
                .Include(g => g.ResponsibleContracts)
                .Include(g => g.AssignedInvoices)
                .Include(g => g.AssignedMeetings)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null) return NotFound();

            var statistics = new
            {
                TotalMembers = group.UserGroups.Count,
                TotalCustomers = group.AssignedCustomers.Count,
                TotalTasks = group.AssignedTasks.Count,
                CompletedTasks = group.AssignedTasks.Count(t => t.Completed),
                PendingTasks = group.AssignedTasks.Count(t => !t.Completed),
                TotalContracts = group.ResponsibleContracts.Count,
                TotalInvoices = group.AssignedInvoices.Count,
                PaidInvoices = group.AssignedInvoices.Count(i => i.IsPaid),
                UnpaidInvoices = group.AssignedInvoices.Count(i => !i.IsPaid),
                TotalMeetings = group.AssignedMeetings.Count,
                UpcomingMeetings = group.AssignedMeetings.Count(m => m.ScheduledAt > DateTime.Now)
            };

            return Ok(statistics);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteGroup(int id)
        {
            var group = await _context.Groups.FindAsync(id);
            if (group == null) return NotFound();

            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}