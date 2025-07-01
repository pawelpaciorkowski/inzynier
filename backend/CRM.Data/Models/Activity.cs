using System;
using System.ComponentModel.DataAnnotations;

namespace CRM.Data.Models
{
    public class Activity
    {
        [Key]
        public int Id { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Klucze obce
        public int UserId { get; set; }
        public int CustomerId { get; set; }

        // Właściwości nawigacyjne (tego brakowało)
        public virtual User User { get; set; }
        public virtual Customer Customer { get; set; }
    }
}