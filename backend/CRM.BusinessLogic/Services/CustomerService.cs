using CRM.Data;
using CRM.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; // Added for logging
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.BusinessLogic.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CustomerService> _logger; // Added logger

        public CustomerService(ApplicationDbContext context, ILogger<CustomerService> logger) // Injected logger
        {
            _context = context;
            _logger = logger; // Assigned logger
        }

        public async Task<List<Customer>> GetAllAsync()
        {
            return await _context.Customers
                .Include(c => c.CustomerTags)
                    .ThenInclude(ct => ct.Tag)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Customer?> GetByIdAsync(int id)
        {
            return await _context.Customers
                .Include(c => c.CustomerTags)
                    .ThenInclude(ct => ct.Tag)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Customer> CreateAsync(CreateCustomerDto customerDto)
        {
            _logger.LogInformation("CreateAsync: Received TagIds: {TagIds}", customerDto.TagIds != null ? string.Join(", ", customerDto.TagIds) : "null");

            var customer = new Customer
            {
                Name = customerDto.Name,
                Email = customerDto.Email,
                Phone = customerDto.Phone,
                Company = customerDto.Company,
                Address = customerDto.Address,
                NIP = customerDto.NIP,
                Representative = customerDto.Representative,
                AssignedGroupId = customerDto.AssignedGroupId,
                AssignedUserId = customerDto.AssignedUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            // Handle tags
            if (customerDto.TagIds != null && customerDto.TagIds.Any())
            {
                foreach (var tagId in customerDto.TagIds)
                {
                    customer.CustomerTags.Add(new CustomerTag { CustomerId = customer.Id, TagId = tagId });
                }
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("CreateAsync: Customer {CustomerId} created with {TagCount} tags.", customer.Id, customer.CustomerTags.Count);

            return customer;
        }

        public async Task<bool> UpdateAsync(int id, UpdateCustomerDto customerDto)
        {
            _logger.LogInformation("UpdateAsync: Received TagIds for customer {CustomerId}: {TagIds}", id, customerDto.TagIds != null ? string.Join(", ", customerDto.TagIds) : "null");

            var existingCustomer = await _context.Customers
                .Include(c => c.CustomerTags)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (existingCustomer == null) 
            {
                _logger.LogWarning("UpdateAsync: Customer {CustomerId} not found.", id);
                return false;
            }

            _logger.LogInformation("UpdateAsync: Customer {CustomerId} has {ExistingTagCount} existing tags.", id, existingCustomer.CustomerTags.Count);

            existingCustomer.Name = customerDto.Name;
            existingCustomer.Email = customerDto.Email;
            existingCustomer.Phone = customerDto.Phone;
            existingCustomer.Company = customerDto.Company;
            existingCustomer.Address = customerDto.Address;
            existingCustomer.NIP = customerDto.NIP;
            existingCustomer.Representative = customerDto.Representative;
            existingCustomer.AssignedGroupId = customerDto.AssignedGroupId;
            existingCustomer.AssignedUserId = customerDto.AssignedUserId;

            // Handle tags
            existingCustomer.CustomerTags.Clear(); // Remove existing tags
            if (customerDto.TagIds != null && customerDto.TagIds.Any())
            {
                foreach (var tagId in customerDto.TagIds)
                {
                    existingCustomer.CustomerTags.Add(new CustomerTag { CustomerId = existingCustomer.Id, TagId = tagId });
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("UpdateAsync: Customer {CustomerId} updated with {NewTagCount} tags.", id, existingCustomer.CustomerTags.Count);

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return false;

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
