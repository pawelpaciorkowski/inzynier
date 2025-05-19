namespace CRM.Data.Models
{
    public class Activity
    {
        public int Id { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }
        public int CustomerId { get; set; }
    }
}
