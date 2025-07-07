namespace CRM.BusinessLogic.Services
{
    public interface ICsvExportService
    {
        byte[] ExportCustomersToCsv(IEnumerable<CRM.Data.Models.Customer> customers);
        byte[] ExportNotesToCsv(IEnumerable<CRM.Data.Models.Note> notes);
        byte[] ExportInvoicesToCsv(IEnumerable<CRM.Data.Models.Invoice> invoices);
        byte[] ExportPaymentsToCsv(IEnumerable<CRM.Data.Models.Payment> payments);
        byte[] ExportContractsToCsv(IEnumerable<CRM.Data.Models.Contract> contracts);
    }
}