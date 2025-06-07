namespace CRM.Data.Models
{
    // Główne DTO dla tworzenia nowej faktury
    public class CreateInvoiceDto
    {
        public int CustomerId { get; set; }
        public string InvoiceNumber { get; set; } = null!;
        public List<CreateInvoiceItemDto> Items { get; set; } = new List<CreateInvoiceItemDto>();
    }
}