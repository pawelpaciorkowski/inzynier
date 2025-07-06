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

        // Klucze obce - ZMIANA TUTAJ
        public int? UserId { get; set; }      // Pozwól na NULL
        public int? CustomerId { get; set; }  // Pozwól na NULL

        // Właściwości nawigacyjne
        public virtual User? User { get; set; } // Zezwól też na NULL tutaj
        public virtual Customer? Customer { get; set; }
    }
}