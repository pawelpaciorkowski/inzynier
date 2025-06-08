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

            if (template == null || contract?.Customer == null)
            {
                _logger.LogError("Błąd krytyczny: Nie znaleziono szablonu, kontraktu lub klienta.");
                throw new Exception("Nie znaleziono szablonu, kontraktu lub powiązanego klienta.");
            }

            _logger.LogInformation("Generowanie dokumentu dla kontraktu: '{Title}'", contract.Title);

            var tempFilePath = Path.GetTempFileName() + ".docx";
            try
            {
                await File.WriteAllBytesAsync(tempFilePath, await File.ReadAllBytesAsync(template.FilePath));

                using (var document = DocX.Load(tempFilePath))
                {
                    _logger.LogInformation("Załadowano szablon. Rozpoczynanie podmiany znaczników...");

                    document.ReplaceText("{TYTUL_UMOWY}", contract.Title ?? "");
                    document.ReplaceText("{NAZWA_KLIENTA}", contract.Customer.Name ?? "");
                    document.ReplaceText("{DATA_PODPISANIA}", contract.SignedAt.ToString("dd.MM.yyyy"));

                    document.Save();
                    _logger.LogInformation("Podmiana i zapis zakończone pomyślnie.");
                }

                var resultBytes = await File.ReadAllBytesAsync(tempFilePath);
                _logger.LogInformation("Zwracanie gotowego pliku o rozmiarze: {Length} bajtów.", resultBytes.Length);

                return resultBytes;
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