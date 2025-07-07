namespace CRM.Data.Models
{
    public class CreateMessageDto
    {
        public int RecipientUserId { get; set; }
        public string Subject { get; set; } = default!;
        public string Body { get; set; } = default!;
    }
}