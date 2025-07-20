using CRM.BusinessLogic.Services;
using CRM.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<List<Customer>>> GetAll()
        {
            var customers = await _customerService.GetAllAsync();
            return Ok(customers);
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
