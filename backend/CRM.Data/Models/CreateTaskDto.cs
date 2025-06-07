// Plik: backend/CRM.Data/Models/CreateTaskDto.cs
namespace CRM.Data.Models
{
    public class CreateTaskDto
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        // Nie ma tu UserId, bo dodamy je w kontrolerze!
    }
}