using CRM.Data;
using CRM.Data.Models;
using CRM.BusinessLogic.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// DTO do wyświetlania na liście
// DTO do wyświetlania na liście - rozbudowane o nowe pola
public class ContractListItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public DateTime SignedAt { get; set; }
    public string CustomerName { get; set; } = null!;

    // NOWE POLA
    public string? ContractNumber { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? NetAmount { get; set; }
}

// DTO do tworzenia nowego kontraktu
public class CreateContractDto
{
    public string Title { get; set; } = null!;
    public DateTime SignedAt { get; set; }
    public int CustomerId { get; set; }
}

// DTO do edycji kontraktu
public class UpdateContractDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string ContractNumber { get; set; } = null!;
    public string PlaceOfSigning { get; set; } = null!;
    public DateTime SignedAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? NetAmount { get; set; }
    public int? PaymentTermDays { get; set; }
    public string ScopeOfServices { get; set; } = null!;
    public int CustomerId { get; set; }
}

// DTO do szczegółów kontraktu
public class ContractDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string ContractNumber { get; set; } = null!;
    public string PlaceOfSigning { get; set; } = null!;
    public string SignedAt { get; set; } = null!;
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public decimal? NetAmount { get; set; }
    public int? PaymentTermDays { get; set; }
    public string ScopeOfServices { get; set; } = null!;
    public int CustomerId { get; set; }
}


[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContractsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly DocumentGenerationService _docService;

    public ContractsController(ApplicationDbContext context, DocumentGenerationService docService)
    {
        _context = context;
        _docService = docService;
    }

    // GET: api/contracts
    // GET: api/contracts
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContractListItemDto>>> GetContracts()
    {
        var contracts = await _context.Contracts
            .Include(c => c.Customer)
            .Select(c => new ContractListItemDto
            {
                Id = c.Id,
                Title = c.Title,
                SignedAt = c.SignedAt,
                CustomerName = c.Customer != null ? c.Customer.Name : "Brak klienta",

                ContractNumber = c.ContractNumber,
                EndDate = c.EndDate,
                NetAmount = c.NetAmount
            })
            .OrderByDescending(c => c.SignedAt)
            .ToListAsync();

        return Ok(contracts);
    }

    // GET: api/contracts/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ContractDetailDto>> GetContract(int id)
    {
        var contract = await _context.Contracts
            .Include(c => c.Customer)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
        {
            return NotFound();
        }

        var contractDto = new ContractDetailDto
        {
            Id = contract.Id,
            Title = contract.Title,
            ContractNumber = contract.ContractNumber ?? "",
            PlaceOfSigning = contract.PlaceOfSigning ?? "",
            SignedAt = contract.SignedAt.ToString("yyyy-MM-ddTHH:mm:ss"),
            StartDate = contract.StartDate?.ToString("yyyy-MM-ddTHH:mm:ss"),
            EndDate = contract.EndDate?.ToString("yyyy-MM-ddTHH:mm:ss"),
            NetAmount = contract.NetAmount,
            PaymentTermDays = contract.PaymentTermDays,
            ScopeOfServices = contract.ScopeOfServices ?? "",
            CustomerId = contract.CustomerId
        };

        return Ok(contractDto);
    }

    // POST: api/contracts
    [HttpPost]
    public async Task<ActionResult<Contract>> CreateContract(CreateContractDto contractDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var contract = new Contract
        {
            Title = contractDto.Title,
            SignedAt = contractDto.SignedAt,
            CustomerId = contractDto.CustomerId,
        };

        _context.Contracts.Add(contract);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, contract);
    }

    // PUT: api/contracts/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateContract(int id, [FromBody] UpdateContractDto contractDto)
    {
        var contractToUpdate = await _context.Contracts.FindAsync(id);
        if (contractToUpdate == null)
        {
            return NotFound();
        }

        contractToUpdate.Title = contractDto.Title;
        contractToUpdate.ContractNumber = contractDto.ContractNumber;
        contractToUpdate.PlaceOfSigning = contractDto.PlaceOfSigning;
        contractToUpdate.SignedAt = contractDto.SignedAt;
        contractToUpdate.StartDate = contractDto.StartDate;
        contractToUpdate.EndDate = contractDto.EndDate;
        contractToUpdate.NetAmount = contractDto.NetAmount;
        contractToUpdate.PaymentTermDays = contractDto.PaymentTermDays;
        contractToUpdate.ScopeOfServices = contractDto.ScopeOfServices;
        contractToUpdate.CustomerId = contractDto.CustomerId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/contracts/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteContract(int id)
    {
        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null)
        {
            return NotFound();
        }

        _context.Contracts.Remove(contract);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/contracts/5/generate-document?templateId=1
    [HttpGet("{contractId}/generate-document")]
    public async Task<IActionResult> GenerateDocument(int contractId, [FromQuery] int templateId)
    {
        try
        {
            var fileBytes = await _docService.GenerateContractDocumentAsync(contractId, templateId);
            var fileName = $"umowa-{contractId}-{DateTime.Now:yyyyMMdd}.docx";
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileName);
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }
}