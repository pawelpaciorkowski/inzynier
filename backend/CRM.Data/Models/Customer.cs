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

        // ✅ NOWE POLA - POWIĄZANIA Z GRUPAMI I UŻYTKOWNIKAMI
        public int? AssignedGroupId { get; set; }
        public virtual Group? AssignedGroup { get; set; }
        public int? AssignedUserId { get; set; }
        public virtual User? AssignedUser { get; set; }

        // ✅ NOWE POLA - POWIĄZANIA Z TAGAMI
        public virtual ICollection<CustomerTag> CustomerTags { get; set; } = new List<CustomerTag>();

        // ✅ NOWE POLA - POWIĄZANIA Z INNYMI ENCJAMI
        public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();
        public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        public virtual ICollection<Meeting> Meetings { get; set; } = new List<Meeting>();
        public virtual ICollection<Note> Notes { get; set; } = new List<Note>();
    }
}
