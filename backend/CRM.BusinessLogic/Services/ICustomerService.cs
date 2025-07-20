using CRM.Data.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CRM.BusinessLogic.Services
{
    public class CreateCustomerDto
    {
        public string Name { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? Address { get; set; }
        public string? NIP { get; set; }
        public string? Representative { get; set; }
        public int? AssignedGroupId { get; set; }
        public int? AssignedUserId { get; set; }
        public List<int>? TagIds { get; set; }
    }

    public class UpdateCustomerDto
    {
        public string Name { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? Address { get; set; }
        public string? NIP { get; set; }
        public string? Representative { get; set; }
        public int? AssignedGroupId { get; set; }
        public int? AssignedUserId { get; set; }
        public List<int>? TagIds { get; set; }
    }

    public interface ICustomerService
    {
        Task<List<Customer>> GetAllAsync();
        Task<Customer?> GetByIdAsync(int id);
        Task<Customer> CreateAsync(CreateCustomerDto customerDto);
        Task<bool> UpdateAsync(int id, UpdateCustomerDto customerDto);
        Task<bool> DeleteAsync(int id);
    }
}