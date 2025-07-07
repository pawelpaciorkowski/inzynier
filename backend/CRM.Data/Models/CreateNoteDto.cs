using System.ComponentModel.DataAnnotations;

namespace CRM.Data.Models
{
    public class CreateNoteDto
    {
        [Required]
        [MaxLength(1000)]
        public required string Content { get; set; }

        public int? CustomerId { get; set; }
    }
}