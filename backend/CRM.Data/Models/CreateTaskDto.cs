namespace CRM.Data.Models
{
    public class CreateTaskDto
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public int CustomerId { get; set; }
    }
}