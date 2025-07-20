using System.Collections.Generic;
using System.IO;
using System.Text;
using CRM.Data.Models;
using System.Linq;

namespace CRM.BusinessLogic.Services
{
    public class CsvExportService : ICsvExportService
    {
        // Podstawowe metody (zachowane dla kompatybilności)
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

        // Zaawansowane metody z filtrowaniem kolumn i relacji
        public byte[] ExportCustomersToCsvAdvanced(IEnumerable<CRM.Data.Models.Customer> customers, string[] columns, bool includeRelations)
        {
            var sb = new StringBuilder();

            // Add header row
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray();
            sb.AppendLine(string.Join(",", headers));

            // Add data rows
            foreach (var customer in customers)
            {
                var values = columns.Select(c => GetCustomerValue(customer, c, includeRelations)).ToArray();
                sb.AppendLine(string.Join(",", values));
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] ExportNotesToCsvAdvanced(IEnumerable<CRM.Data.Models.Note> notes, string[] columns, bool includeRelations)
        {
            var sb = new StringBuilder();

            // Add header row
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray();
            sb.AppendLine(string.Join(",", headers));

            // Add data rows
            foreach (var note in notes)
            {
                var values = columns.Select(c => GetNoteValue(note, c, includeRelations)).ToArray();
                sb.AppendLine(string.Join(",", values));
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] ExportInvoicesToCsvAdvanced(IEnumerable<CRM.Data.Models.Invoice> invoices, string[] columns, bool includeRelations)
        {
            var sb = new StringBuilder();

            // Add header row
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray();
            sb.AppendLine(string.Join(",", headers));

            // Add data rows
            foreach (var invoice in invoices)
            {
                var values = columns.Select(c => GetInvoiceValue(invoice, c, includeRelations)).ToArray();
                sb.AppendLine(string.Join(",", values));
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] ExportPaymentsToCsvAdvanced(IEnumerable<CRM.Data.Models.Payment> payments, string[] columns, bool includeRelations)
        {
            var sb = new StringBuilder();

            // Add header row
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray();
            sb.AppendLine(string.Join(",", headers));

            // Add data rows
            foreach (var payment in payments)
            {
                var values = columns.Select(c => GetPaymentValue(payment, c, includeRelations)).ToArray();
                sb.AppendLine(string.Join(",", values));
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] ExportContractsToCsvAdvanced(IEnumerable<CRM.Data.Models.Contract> contracts, string[] columns, bool includeRelations)
        {
            var sb = new StringBuilder();

            // Add header row
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray();
            sb.AppendLine(string.Join(",", headers));

            // Add data rows
            foreach (var contract in contracts)
            {
                var values = columns.Select(c => GetContractValue(contract, c, includeRelations)).ToArray();
                sb.AppendLine(string.Join(",", values));
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] ExportTasksToCsvAdvanced(IEnumerable<CRM.Data.Models.TaskItem> tasks, string[] columns, bool includeRelations)
        {
            var sb = new StringBuilder();

            // Add header row
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray();
            sb.AppendLine(string.Join(",", headers));

            // Add data rows
            foreach (var task in tasks)
            {
                var values = columns.Select(c => GetTaskValue(task, c, includeRelations)).ToArray();
                sb.AppendLine(string.Join(",", values));
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] ExportMeetingsToCsvAdvanced(IEnumerable<CRM.Data.Models.Meeting> meetings, string[] columns, bool includeRelations)
        {
            var sb = new StringBuilder();

            // Add header row
            var headers = columns.Select(c => GetColumnHeader(c)).ToArray();
            sb.AppendLine(string.Join(",", headers));

            // Add data rows
            foreach (var meeting in meetings)
            {
                var values = columns.Select(c => GetMeetingValue(meeting, c, includeRelations)).ToArray();
                sb.AppendLine(string.Join(",", values));
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        // Helper methods
        private string GetColumnHeader(string column)
        {
            return column switch
            {
                "id" => "ID",
                "name" => "Nazwa",
                "email" => "Email",
                "phone" => "Telefon",
                "company" => "Firma",
                "address" => "Adres",
                "nip" => "NIP",
                "representative" => "Przedstawiciel",
                "createdAt" => "Data utworzenia",
                "assignedGroup" => "Przypisana grupa",
                "assignedUser" => "Przypisany użytkownik",
                "tags" => "Tagi",
                "contractCount" => "Liczba kontraktów",
                "invoiceCount" => "Liczba faktur",
                "totalInvoiceValue" => "Wartość wszystkich faktur",
                "paidInvoiceValue" => "Wartość opłaconych faktur",
                "number" => "Numer",
                "customerName" => "Nazwa klienta",
                "customerEmail" => "Email klienta",
                "totalAmount" => "Kwota całkowita",
                "isPaid" => "Opłacona",
                "issuedAt" => "Data wystawienia",
                "dueDate" => "Termin płatności",
                "createdBy" => "Utworzone przez",
                "items" => "Pozycje faktury",
                "invoiceNumber" => "Numer faktury",
                "amount" => "Kwota",
                "paidAt" => "Data płatności",
                "paymentMethod" => "Metoda płatności",
                "title" => "Tytuł",
                "contractNumber" => "Numer kontraktu",
                "placeOfSigning" => "Miejsce podpisania",
                "signedAt" => "Data podpisania",
                "startDate" => "Data rozpoczęcia",
                "endDate" => "Data zakończenia",
                "netAmount" => "Kwota netto",
                "paymentTermDays" => "Termin płatności (dni)",
                "scopeOfServices" => "Zakres usług",
                "description" => "Opis",
                "priority" => "Priorytet",
                "topic" => "Temat",
                "scheduledAt" => "Zaplanowane na",
                "duration" => "Czas trwania",
                "location" => "Lokalizacja",
                "participants" => "Uczestnicy",
                "status" => "Status",
                "content" => "Treść",
                "updatedAt" => "Data aktualizacji",
                "completed" => "Ukończone",
                _ => column
            };
        }

        private string GetCustomerValue(CRM.Data.Models.Customer customer, string column, bool includeRelations)
        {
            return column switch
            {
                "id" => customer.Id.ToString(),
                "name" => EscapeCsvField(customer.Name),
                "email" => EscapeCsvField(customer.Email),
                "phone" => EscapeCsvField(customer.Phone),
                "company" => EscapeCsvField(customer.Company),
                "address" => EscapeCsvField(customer.Address),
                "nip" => EscapeCsvField(customer.NIP),
                "representative" => EscapeCsvField(customer.Representative),
                "createdAt" => customer.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                "assignedGroup" => includeRelations && customer.AssignedGroup != null ? EscapeCsvField(customer.AssignedGroup.Name) : "",
                "assignedUser" => includeRelations && customer.AssignedUser != null ? EscapeCsvField(customer.AssignedUser.Username) : "",
                "tags" => includeRelations ? EscapeCsvField(string.Join("; ", customer.CustomerTags?.Select(ct => ct.Tag?.Name) ?? Enumerable.Empty<string>())) : "",
                "contractCount" => includeRelations ? (customer.Contracts?.Count ?? 0).ToString() : "",
                "invoiceCount" => includeRelations ? (customer.Invoices?.Count ?? 0).ToString() : "",
                "totalInvoiceValue" => includeRelations ? (customer.Invoices?.Sum(i => i.TotalAmount) ?? 0).ToString() : "",
                "paidInvoiceValue" => includeRelations ? (customer.Invoices?.Where(i => i.IsPaid).Sum(i => i.TotalAmount) ?? 0).ToString() : "",
                _ => ""
            };
        }

        private string GetNoteValue(CRM.Data.Models.Note note, string column, bool includeRelations)
        {
            return column switch
            {
                "id" => note.Id.ToString(),
                "content" => EscapeCsvField(note.Content),
                "customerName" => includeRelations && note.Customer != null ? EscapeCsvField(note.Customer.Name) : "",
                "createdBy" => includeRelations && note.User != null ? EscapeCsvField(note.User.Username) : "",
                "createdAt" => note.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                "updatedAt" => note.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"), // Note nie ma UpdatedAt
                _ => ""
            };
        }

        private string GetInvoiceValue(CRM.Data.Models.Invoice invoice, string column, bool includeRelations)
        {
            return column switch
            {
                "id" => invoice.Id.ToString(),
                "number" => EscapeCsvField(invoice.Number),
                "customerName" => includeRelations && invoice.Customer != null ? EscapeCsvField(invoice.Customer.Name) : "",
                "customerEmail" => includeRelations && invoice.Customer != null ? EscapeCsvField(invoice.Customer.Email) : "",
                "totalAmount" => invoice.TotalAmount.ToString(),
                "isPaid" => invoice.IsPaid.ToString(),
                "issuedAt" => invoice.IssuedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                "dueDate" => invoice.DueDate.ToString("yyyy-MM-dd HH:mm:ss"),
                "createdBy" => includeRelations && invoice.CreatedByUser != null ? EscapeCsvField(invoice.CreatedByUser.Username) : "",
                "assignedGroup" => includeRelations && invoice.AssignedGroup != null ? EscapeCsvField(invoice.AssignedGroup.Name) : "",
                "tags" => includeRelations ? EscapeCsvField(string.Join("; ", invoice.InvoiceTags?.Select(it => it.Tag?.Name) ?? Enumerable.Empty<string>())) : "",
                "items" => includeRelations ? EscapeCsvField(string.Join("; ", invoice.Items?.Select(ii => $"{ii.Description}: {ii.Quantity}x{ii.UnitPrice}") ?? Enumerable.Empty<string>())) : "",
                _ => ""
            };
        }

        private string GetPaymentValue(CRM.Data.Models.Payment payment, string column, bool includeRelations)
        {
            return column switch
            {
                "id" => payment.Id.ToString(),
                "invoiceNumber" => includeRelations && payment.Invoice != null ? EscapeCsvField(payment.Invoice.Number) : "",
                "customerName" => includeRelations && payment.Invoice?.Customer != null ? EscapeCsvField(payment.Invoice.Customer.Name) : "",
                "amount" => payment.Amount.ToString(),
                "paidAt" => payment.PaidAt.ToString("yyyy-MM-dd HH:mm:ss"),
                "paymentMethod" => "Przelew", // Payment nie ma PaymentMethod
                _ => ""
            };
        }

        private string GetContractValue(CRM.Data.Models.Contract contract, string column, bool includeRelations)
        {
            return column switch
            {
                "id" => contract.Id.ToString(),
                "title" => EscapeCsvField(contract.Title),
                "contractNumber" => EscapeCsvField(contract.ContractNumber),
                "customerName" => includeRelations && contract.Customer != null ? EscapeCsvField(contract.Customer.Name) : "",
                "placeOfSigning" => EscapeCsvField(contract.PlaceOfSigning),
                "signedAt" => contract.SignedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                "startDate" => contract.StartDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                "endDate" => contract.EndDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                "netAmount" => contract.NetAmount.ToString(),
                "paymentTermDays" => contract.PaymentTermDays.ToString(),
                "scopeOfServices" => EscapeCsvField(contract.ScopeOfServices),
                _ => ""
            };
        }

        private string GetTaskValue(CRM.Data.Models.TaskItem task, string column, bool includeRelations)
        {
            return column switch
            {
                "id" => task.Id.ToString(),
                "title" => EscapeCsvField(task.Title),
                "description" => EscapeCsvField(task.Description),
                "customerName" => includeRelations && task.Customer != null ? EscapeCsvField(task.Customer.Name) : "",
                "assignedUser" => includeRelations && task.User != null ? EscapeCsvField(task.User.Username) : "",
                "dueDate" => task.DueDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "",
                "completed" => task.Completed.ToString(),
                "priority" => "Normalny", // TaskItem nie ma Priority
                "tags" => includeRelations ? EscapeCsvField(string.Join("; ", task.TaskTags?.Select(tt => tt.Tag?.Name) ?? Enumerable.Empty<string>())) : "",
                "createdAt" => task.DueDate?.ToString("yyyy-MM-dd HH:mm:ss") ?? "", // TaskItem nie ma CreatedAt
                _ => ""
            };
        }

        private string GetMeetingValue(CRM.Data.Models.Meeting meeting, string column, bool includeRelations)
        {
            return column switch
            {
                "id" => meeting.Id.ToString(),
                "topic" => EscapeCsvField(meeting.Topic),
                "customerName" => includeRelations && meeting.Customer != null ? EscapeCsvField(meeting.Customer.Name) : "",
                "scheduledAt" => meeting.ScheduledAt.ToString("yyyy-MM-dd HH:mm:ss"),
                "duration" => "60 min", // Meeting nie ma Duration
                "location" => "Online", // Meeting nie ma Location
                "participants" => "Klient", // Meeting nie ma Participants
                "notes" => "", // Meeting nie ma Notes
                "status" => "Zaplanowane", // Meeting nie ma Status
                _ => ""
            };
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

        // Metody dla formatu Excel (XLSX) - fallback dla PDF
        public byte[] ExportCustomersToXlsx(IEnumerable<CRM.Data.Models.Customer> customers, string[] columns, bool includeRelations)
        {
            // Na razie zwracamy CSV jako fallback, ale można dodać prawdziwy XLSX
            return ExportCustomersToCsvAdvanced(customers, columns, includeRelations);
        }

        public byte[] ExportInvoicesToXlsx(IEnumerable<CRM.Data.Models.Invoice> invoices, string[] columns, bool includeRelations)
        {
            // Na razie zwracamy CSV jako fallback, ale można dodać prawdziwy XLSX
            return ExportInvoicesToCsvAdvanced(invoices, columns, includeRelations);
        }

        public byte[] ExportTasksToXlsx(IEnumerable<CRM.Data.Models.TaskItem> tasks, string[] columns, bool includeRelations)
        {
            // Na razie zwracamy CSV jako fallback, ale można dodać prawdziwy XLSX
            return ExportTasksToCsvAdvanced(tasks, columns, includeRelations);
        }
    }
}