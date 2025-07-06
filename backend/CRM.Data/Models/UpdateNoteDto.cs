using System.ComponentModel.DataAnnotations;

namespace CRM.Data.Models
{
    public class UpdateNoteDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Content { get; set; }

        public int? CustomerId { get; set; }
    }
}