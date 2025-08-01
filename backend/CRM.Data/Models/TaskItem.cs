namespace CRM.Data.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool Completed { get; set; }

        public int UserId { get; set; }
        public int CustomerId { get; set; }
        public User User { get; set; } = default!;
        public Customer? Customer { get; set; }

        // ✅ NOWE POLA - POWIĄZANIA Z GRUPAMI
        public int? AssignedGroupId { get; set; }
        public virtual Group? AssignedGroup { get; set; }

        // ✅ NOWE POLA - POWIĄZANIA Z TAGAMI
        public virtual ICollection<TaskTag> TaskTags { get; set; } = new List<TaskTag>();
    }
}
