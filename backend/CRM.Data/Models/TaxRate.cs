using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Data.Models
{
    public class TaxRate
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;

        [Column(TypeName = "decimal(5,4)")]
        public decimal Rate { get; set; }
    }
}