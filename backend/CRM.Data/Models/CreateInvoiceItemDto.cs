namespace CRM.Data.Models
{
    // DTO dla pojedynczej pozycji przychodzącej z frontendu
    public class CreateInvoiceItemDto
    {
        public int ServiceId { get; set; }
        public int Quantity { get; set; }
    }
}