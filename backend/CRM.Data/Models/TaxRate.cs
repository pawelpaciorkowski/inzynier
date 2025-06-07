// In: CRM.Data/Models/TaxRate.cs
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Data.Models
{
    public class TaxRate
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!; // np. "VAT 23%"

        [Column(TypeName = "decimal(5,4)")]
        public decimal Rate { get; set; } // np. 0.2300
    }
}