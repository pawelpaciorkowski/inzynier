namespace CRM.BusinessLogic.Services
{
    public interface ICsvExportService
    {
        // Podstawowe metody (zachowane dla kompatybilności)
        byte[] ExportCustomersToCsv(IEnumerable<CRM.Data.Models.Customer> customers);
        byte[] ExportNotesToCsv(IEnumerable<CRM.Data.Models.Note> notes);
        byte[] ExportInvoicesToCsv(IEnumerable<CRM.Data.Models.Invoice> invoices);
        byte[] ExportPaymentsToCsv(IEnumerable<CRM.Data.Models.Payment> payments);
        byte[] ExportContractsToCsv(IEnumerable<CRM.Data.Models.Contract> contracts);

        // Zaawansowane metody z filtrowaniem kolumn i relacji
        byte[] ExportCustomersToCsvAdvanced(IEnumerable<CRM.Data.Models.Customer> customers, string[] columns, bool includeRelations);
        byte[] ExportNotesToCsvAdvanced(IEnumerable<CRM.Data.Models.Note> notes, string[] columns, bool includeRelations);
        byte[] ExportInvoicesToCsvAdvanced(IEnumerable<CRM.Data.Models.Invoice> invoices, string[] columns, bool includeRelations);
        byte[] ExportPaymentsToCsvAdvanced(IEnumerable<CRM.Data.Models.Payment> payments, string[] columns, bool includeRelations);
        byte[] ExportContractsToCsvAdvanced(IEnumerable<CRM.Data.Models.Contract> contracts, string[] columns, bool includeRelations);
        byte[] ExportTasksToCsvAdvanced(IEnumerable<CRM.Data.Models.TaskItem> tasks, string[] columns, bool includeRelations);
        byte[] ExportMeetingsToCsvAdvanced(IEnumerable<CRM.Data.Models.Meeting> meetings, string[] columns, bool includeRelations);
        
        // Metody dla formatu Excel (XLSX) - fallback dla PDF
        byte[] ExportCustomersToXlsx(IEnumerable<CRM.Data.Models.Customer> customers, string[] columns, bool includeRelations);
        byte[] ExportInvoicesToXlsx(IEnumerable<CRM.Data.Models.Invoice> invoices, string[] columns, bool includeRelations);
        byte[] ExportTasksToXlsx(IEnumerable<CRM.Data.Models.TaskItem> tasks, string[] columns, bool includeRelations);
    }
}