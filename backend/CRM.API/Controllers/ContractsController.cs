using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// DTO do wyświetlania na liście
public class ContractListItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public DateTime SignedAt { get; set; }
    public string CustomerName { get; set; } = null!;
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
    public string Title { get; set; } = null!;
    public DateTime SignedAt { get; set; }
    public int CustomerId { get; set; }
}


[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContractsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ContractsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/contracts
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContractListItemDto>>> GetContracts()
    {
        var contracts = await _context.Contracts
            .Include(c => c.Customer) // Teraz ta linia zadziała poprawnie
            .Select(c => new ContractListItemDto
            {
                Id = c.Id,
                Title = c.Title,
                SignedAt = c.SignedAt,
                CustomerName = c.Customer != null ? c.Customer.Name : "Brak klienta"
            })
            .OrderByDescending(c => c.SignedAt)
            .ToListAsync();

        return Ok(contracts);
    }

    // GET: api/contracts/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Contract>> GetContract(int id)
    {
        var contract = await _context.Contracts.FindAsync(id);

        if (contract == null)
        {
            return NotFound();
        }

        return contract;
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
    public async Task<IActionResult> UpdateContract(int id, UpdateContractDto contractDto)
    {
        var contractToUpdate = await _context.Contracts.FindAsync(id);
        if (contractToUpdate == null)
        {
            return NotFound();
        }

        contractToUpdate.Title = contractDto.Title;
        contractToUpdate.SignedAt = contractDto.SignedAt;
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
}