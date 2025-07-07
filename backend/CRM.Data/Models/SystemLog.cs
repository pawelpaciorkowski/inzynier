using System;
using System.ComponentModel.DataAnnotations;

namespace CRM.Data.Models
{
    public class SystemLog
    {
        public int Id { get; set; }

        [Required]
        public DateTime Timestamp { get; set; }

        [Required]
        [StringLength(50)]
        public string Level { get; set; } = string.Empty; // E.g., "Information", "Warning", "Error"

        [Required]
        public string Message { get; set; } = string.Empty;

        [StringLength(255)]
        public string Source { get; set; } = string.Empty; // E.g., "CRM.API.Controllers.LogsController"

        public int? UserId { get; set; }
        public string? Details { get; set; } // JSON string for additional properties
    }
}
