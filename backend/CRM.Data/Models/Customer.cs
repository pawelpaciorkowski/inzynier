namespace CRM.Data.Models
{
    public class Customer
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public DateTime CreatedAt { get; set; }

        public string? Address { get; set; }
        public string? NIP { get; set; }
        public string? Representative { get; set; }
    }
}
