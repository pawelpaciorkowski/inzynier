using System;
using System.ComponentModel.DataAnnotations;

namespace CRM.Data.Models
{
    public class UpdateReminderDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string Note { get; set; }

        [Required]
        public DateTime RemindAt { get; set; }
    }
}