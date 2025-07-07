namespace CRM.Data.Models
{
    public class Contract
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public DateTime SignedAt { get; set; }
        public int CustomerId { get; set; }
        public virtual Customer Customer { get; set; } = null!;

        public string? ContractNumber { get; set; }
        public string? PlaceOfSigning { get; set; }
        public string? ScopeOfServices { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? NetAmount { get; set; }
        public int? PaymentTermDays { get; set; }
    }

    // Plik: backend/CRM.Data/Models/FullModels.cs

    public class Invoice
    {
        public int Id { get; set; }
        public string Number { get; set; } = null!;
        public int CustomerId { get; set; }
        public virtual Customer Customer { get; set; } = null!;
        public DateTime IssuedAt { get; set; }

        // ✅ DODAJ TE DWIE LINIE
        public DateTime DueDate { get; set; }
        public bool IsPaid { get; set; }

        public decimal TotalAmount { get; set; }
        public virtual ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }

    public class Payment
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public virtual Invoice Invoice { get; set; } = null!;
        public DateTime PaidAt { get; set; }
        public decimal Amount { get; set; }
    }

    public class UserFile
    {
        public int Id { get; set; }
        public string FileName { get; set; } = default!;
        public string FilePath { get; set; } = default!;
        public DateTime UploadedAt { get; set; }
    }

    public class Template
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string FilePath { get; set; } = null!;
        public DateTime UploadedAt { get; set; }
    }

    public class AuditLog
    {
        public int Id { get; set; }
        public string Entity { get; set; } = default!;
        public string Action { get; set; } = default!;
        public DateTime Timestamp { get; set; }
        public int UserId { get; set; }
    }

    public class LoginHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime LoggedInAt { get; set; }
        public string IpAddress { get; set; } = default!;
    }

    public class Notification
    {
        public int Id { get; set; }
        public string Message { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;
    }

    public class Meeting
    {
        public int Id { get; set; }
        public string Topic { get; set; } = default!;
        public DateTime ScheduledAt { get; set; }
        public int CustomerId { get; set; }
        public virtual Customer Customer { get; set; } = null!;
    }

    public class Reminder
    {
        public int Id { get; set; }
        public string Note { get; set; } = default!;
        public int UserId { get; set; }

        public DateTime RemindAt { get; set; }
    }

    public class Service
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public decimal Price { get; set; }
    }

    public class Order
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ServiceId { get; set; }
        public int Quantity { get; set; }
    }

    public class Report
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
    }

    public class Export
    {
        public int Id { get; set; }
        public string Format { get; set; } = default!;
        public DateTime ExportedAt { get; set; }
    }

    public class Message
    {
        public int Id { get; set; }
        public string Subject { get; set; } = default!;
        public string Body { get; set; } = default!;
        public int SenderUserId { get; set; }
        public virtual User SenderUser { get; set; } = null!;
        public int RecipientUserId { get; set; }
        public virtual User RecipientUser { get; set; } = null!;
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
    }

    // Plik: backend/CRM.Data/Models/FullModels.cs

    public class Note
    {
        public int Id { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; } // Dodaj to pole, jeśli go brakuje

        // Klucz obcy dla klienta
        public int CustomerId { get; set; }
        public virtual Customer Customer { get; set; } = null!;

        // ✅ DODAJ TE DWA POLA DO RELACJI Z UŻYTKOWNIKIEM
        public int? UserId { get; set; }
        public virtual User User { get; set; } = null!;
    }

    public class Setting
    {
        public int Id { get; set; }
        public string Key { get; set; } = default!;
        public string Value { get; set; } = default!;
    }



    public class Group
    {
        public int Id { get; set; }

        public required string Name { get; set; }

        public string? Description { get; set; }

        public virtual required ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
    }

    public class UserGroup
    {
        public int UserId { get; set; }
        public required User User { get; set; }

        public int GroupId { get; set; }
        public required Group Group { get; set; }
    }

    public class UserGroupAssignment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int UserGroupId { get; set; }
    }

    public class Tag
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
    }

    public class CustomerTag
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int TagId { get; set; }
    }

    public class Address
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string Street { get; set; } = default!;
        public string City { get; set; } = default!;
    }

    public class CalendarEvent
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }
}
