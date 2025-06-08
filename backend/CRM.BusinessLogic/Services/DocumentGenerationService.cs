using CRM.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Linq;
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
            var contract = await _context.Contracts
                .Include(c => c.Customer)
                .FirstOrDefaultAsync(c => c.Id == contractId);

            if (template == null || contract == null || contract.Customer == null)
            {
                _logger.LogError("Nie znaleziono szablonu (ID: {TemplateId}), kontraktu (ID: {ContractId}) lub powiązanego klienta.", templateId, contractId);
                throw new Exception("Nie znaleziono szablonu, kontraktu lub powiązanego klienta.");
            }

            _logger.LogInformation("Generowanie dokumentu dla kontraktu: '{ContractTitle}' dla klienta: '{CustomerName}'", contract.Title, contract.Customer.Name);

            var templateBytes = await File.ReadAllBytesAsync(template.FilePath);
            using var templateStream = new MemoryStream(templateBytes);
            using var doc = DocX.Load(templateStream);

            var placeholders = new Dictionary<string, string>
            {
                { "{TYTUL_UMOWY}", contract.Title ?? "" },
                { "{NAZWA_KLIENTA}", contract.Customer.Name ?? "" },
                { "{DATA_PODPISANIA}", contract.SignedAt.ToString("dd.MM.yyyy") }
            };

            // OSTATECZNA, NAJBARDZIEJ NIEZAWODNA METODA PODMIANY
            foreach (var placeholder in placeholders)
            {
                // Znajdź wszystkie akapity zawierające dany znacznik
                var paragraphsToUpdate = doc.Paragraphs
                    .Where(p => p.Text.Contains(placeholder.Key))
                    .ToList();

                foreach (var p in paragraphsToUpdate)
                {
                    // Podmień tekst w znalezionym akapicie
                    p.ReplaceText(placeholder.Key, placeholder.Value);
                }
            }

            using var resultStream = new MemoryStream();
            doc.SaveAs(resultStream);
            return resultStream.ToArray();
        }
    }
}