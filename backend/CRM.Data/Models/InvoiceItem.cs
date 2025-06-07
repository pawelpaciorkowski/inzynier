// In: CRM.Data/Models/InvoiceItem.cs
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Data.Models
{
    public class InvoiceItem
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public int ServiceId { get; set; }
        public string Description { get; set; } = null!;
        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; } // Cena jednostkowa netto

        [Column(TypeName = "decimal(5,2)")]
        public decimal TaxRate { get; set; } // np. 0.23 dla 23%

        [Column(TypeName = "decimal(18,2)")]
        public decimal NetAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal GrossAmount { get; set; }

        // Relacje
        public virtual Invoice Invoice { get; set; } = null!;
        public virtual Service Service { get; set; } = null!;
    }
}