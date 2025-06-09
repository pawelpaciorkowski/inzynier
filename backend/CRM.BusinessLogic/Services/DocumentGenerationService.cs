using CRM.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Threading.Tasks;
using Xceed.Words.NET;

namespace CRM.BusinessLogic.Services
{
    public class DocumentGenerationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DocumentGenerationService> _logger;

        public DocumentGenerationService(ApplicationDbContext context, ILogger<DocumentGenerationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<byte[]> GenerateContractDocumentAsync(int contractId, int templateId)
        {
            var template = await _context.Templates.FindAsync(templateId);
            var contract = await _context.Contracts.Include(c => c.Customer).FirstOrDefaultAsync(c => c.Id == contractId);
            var settings = await _context.Settings.ToDictionaryAsync(s => s.Key, s => s.Value);

            if (template == null || contract?.Customer == null)
            {
                throw new Exception("Nie znaleziono szablonu, kontraktu lub powiązanego klienta.");
            }

            _logger.LogInformation("Generowanie dokumentu dla kontraktu: '{Title}'", contract.Title);

            var tempFilePath = Path.GetTempFileName() + ".docx";
            try
            {
                await File.WriteAllBytesAsync(tempFilePath, await File.ReadAllBytesAsync(template.FilePath));

                using (var document = DocX.Load(tempFilePath))
                {
                    var placeholders = new Dictionary<string, string>
                    {
                        { "{TYTUL_UMOWY}", contract.Title ?? "" },
                        { "{NUMER_UMOWY}", contract.ContractNumber ?? "" },
                        { "{MIEJSCE_ZAWARCIA}", contract.PlaceOfSigning ?? "" },
                        { "{DATA_PODPISANIA}", contract.SignedAt.ToString("dd.MM.yyyy") },
                        { "{DATA_ROZPOCZECIA}", contract.StartDate?.ToString("dd.MM.yyyy") ?? "" },
                        { "{DATA_ZAKONCZENIA}", contract.EndDate?.ToString("dd.MM.yyyy") ?? "" },
                        { "{KWOTA_WYNAGRODZENIA_NETTO}", contract.NetAmount?.ToString("F2") ?? "0.00" },
                        { "{TERMIN_PLATNOSCI}", contract.PaymentTermDays?.ToString() ?? "" },
                        { "{SZCZEGOLOWY_ZAKRES_USLUG}", contract.ScopeOfServices ?? "" },

                        { "{NAZWA_KLIENTA}", contract.Customer.Name ?? "" },
                        { "{ADRES_KLIENTA}", "Brak adresu w bazie" },
                        { "{NIP_KLIENTA}", "Brak NIP w bazie" },

                        { "{NAZWA_WYKONAWCY}", settings.GetValueOrDefault("CompanyName", "TWOJA FIRMA") },
                        { "{ADRES_WYKONAWCY}", settings.GetValueOrDefault("CompanyAddress", "TWÓJ ADRES") },
                        { "{NIP_WYKONAWCY}", settings.GetValueOrDefault("CompanyNIP", "TWÓJ NIP") },
                        { "{NUMER_KONTA_BANKOWEGO_WYKONAWCY}", settings.GetValueOrDefault("CompanyBankAccount", "TWÓJ NUMER KONTA") }
                    };

                    foreach (var p in document.Paragraphs)
                    {
                        foreach (var placeholder in placeholders)
                        {
                            p.ReplaceText(placeholder.Key, placeholder.Value);
                        }
                    }

                    document.Save();
                }

                return await File.ReadAllBytesAsync(tempFilePath);
            }
            finally
            {
                if (File.Exists(tempFilePath))
                {
                    File.Delete(tempFilePath);
                }
            }
        }
    }
}