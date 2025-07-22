using CRM.BusinessLogic.Services;
using CRM.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using CRM.Data;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly ApplicationDbContext _context;

        public CustomersController(ICustomerService customerService, ApplicationDbContext context)
        {
            _customerService = customerService;
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

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<List<Customer>>> GetAll()
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == 0) return Unauthorized();

            var isAdmin = await IsUserAdmin(currentUserId);
            
            if (isAdmin)
            {
                // Admin widzi wszystkich klientów
                var customers = await _customerService.GetAllAsync();
                return Ok(customers);
            }
            else
            {
                // Zwykły użytkownik widzi tylko klientów ze swoich grup
                var userGroups = await _context.UserGroups
                    .Where(ug => ug.UserId == currentUserId)
                    .Select(ug => ug.GroupId)
                    .ToListAsync();

                var customers = await _context.Customers
                    .Where(c => c.AssignedGroupId.HasValue && userGroups.Contains(c.AssignedGroupId.Value))
                    .ToListAsync();

                return Ok(customers);
            }
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetById(int id)
        {
            var customer = await _customerService.GetByIdAsync(id);
            if (customer == null)
                return NotFound();
            return Ok(customer);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Customer>> Create(CreateCustomerDto customerDto)
        {
            var created = await _customerService.CreateAsync(customerDto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateCustomerDto customerDto)
        {
            var updated = await _customerService.UpdateAsync(id, customerDto);
            if (!updated)
                return NotFound();
            return NoContent();
        }

        [Authorize(Roles = "Admin,Manager,Sprzedawca")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _customerService.DeleteAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}
