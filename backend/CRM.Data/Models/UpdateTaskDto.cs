namespace CRM.Data.Models
{
    public class UpdateTaskDto
    {
        // Pola, które faktycznie edytujemy w formularzu lub przez checkbox
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool Completed { get; set; }
    }
}