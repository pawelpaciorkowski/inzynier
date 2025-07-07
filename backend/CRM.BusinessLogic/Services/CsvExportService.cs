using System.Collections.Generic;
using System.IO;
using System.Text;
using CRM.Data.Models;

namespace CRM.BusinessLogic.Services
{
    public class CsvExportService : ICsvExportService
    {
        public byte[] ExportCustomersToCsv(IEnumerable<CRM.Data.Models.Customer> customers)
        {
            var sb = new StringBuilder();

            // Add header row
            sb.AppendLine("Id,Name,Email,Phone,Address,CreatedAt");

            // Add data rows
            foreach (var customer in customers)
            {
                sb.AppendLine($"{customer.Id},{EscapeCsvField(customer.Name)},{EscapeCsvField(customer.Email)},{EscapeCsvField(customer.Phone)},{EscapeCsvField(customer.Address)},{customer.CreatedAt:yyyy-MM-dd HH:mm:ss}");
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] ExportNotesToCsv(IEnumerable<CRM.Data.Models.Note> notes)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Id,Content,CreatedAt,CustomerId,UserId");
            foreach (var note in notes)
            {
                sb.AppendLine($"{note.Id},{EscapeCsvField(note.Content)},{note.CreatedAt:yyyy-MM-dd HH:mm:ss},{note.CustomerId},{note.UserId}");
            }
            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] ExportInvoicesToCsv(IEnumerable<CRM.Data.Models.Invoice> invoices)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Id,Number,CustomerId,IssuedAt,DueDate,IsPaid,TotalAmount");
            foreach (var invoice in invoices)
            {
                sb.AppendLine($"{invoice.Id},{EscapeCsvField(invoice.Number)},{invoice.CustomerId},{invoice.IssuedAt:yyyy-MM-dd HH:mm:ss},{invoice.DueDate:yyyy-MM-dd HH:mm:ss},{invoice.IsPaid},{invoice.TotalAmount}");
            }
            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] ExportPaymentsToCsv(IEnumerable<CRM.Data.Models.Payment> payments)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Id,InvoiceId,PaidAt,Amount");
            foreach (var payment in payments)
            {
                sb.AppendLine($"{payment.Id},{payment.InvoiceId},{payment.PaidAt:yyyy-MM-dd HH:mm:ss},{payment.Amount}");
            }
            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] ExportContractsToCsv(IEnumerable<CRM.Data.Models.Contract> contracts)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Id,Title,ContractNumber,PlaceOfSigning,SignedAt,StartDate,EndDate,NetAmount,PaymentTermDays,ScopeOfServices,CustomerId");
            foreach (var contract in contracts)
            {
                sb.AppendLine($"{contract.Id},{EscapeCsvField(contract.Title)},{EscapeCsvField(contract.ContractNumber)},{EscapeCsvField(contract.PlaceOfSigning)},{contract.SignedAt:yyyy-MM-dd HH:mm:ss},{contract.StartDate?.ToString("yyyy-MM-dd HH:mm:ss")},{contract.EndDate?.ToString("yyyy-MM-dd HH:mm:ss")},{contract.NetAmount},{contract.PaymentTermDays},{EscapeCsvField(contract.ScopeOfServices)},{contract.CustomerId}");
            }
            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        private string EscapeCsvField(string? field)
        {
            if (string.IsNullOrEmpty(field))
            {
                return string.Empty;
            }
            // If the field contains a comma, double quote, or newline, enclose it in double quotes
            if (field.Contains(",") || field.Contains("\"") || field.Contains("\n") || field.Contains("\r"))
            {
                // Escape double quotes by doubling them
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }
            return field;
        }
    }
}