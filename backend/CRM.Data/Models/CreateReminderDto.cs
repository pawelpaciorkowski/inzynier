using System;
using System.ComponentModel.DataAnnotations;

namespace CRM.Data.Models
{
    public class CreateReminderDto
    {
        [Required]
        [MaxLength(500)]
        public required string Note { get; set; }

        [Required]
        public DateTime RemindAt { get; set; }
    }
}