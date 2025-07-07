using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class TemplatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public TemplatesController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Template>>> GetTemplates()
        {
            return await _context.Templates.OrderBy(t => t.Name).ToListAsync();
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadTemplate(IFormFile file, [FromForm] string templateName)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Nie wybrano pliku.");

            var uploadsFolderPath = Path.Combine(_env.ContentRootPath, "Templates");
            if (!Directory.Exists(uploadsFolderPath))
            {
                Directory.CreateDirectory(uploadsFolderPath);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolderPath, uniqueFileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var template = new Template
            {
                Name = templateName,
                FileName = file.FileName,
                FilePath = filePath,
                UploadedAt = DateTime.UtcNow
            };

            _context.Templates.Add(template);
            await _context.SaveChangesAsync();

            return Ok(template);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            var template = await _context.Templates.FindAsync(id);
            if (template == null) return NotFound();

            if (System.IO.File.Exists(template.FilePath))
            {
                System.IO.File.Delete(template.FilePath);
            }

            _context.Templates.Remove(template);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadTemplate(int id)
        {
            var template = await _context.Templates.FindAsync(id);
            if (template == null) return NotFound("Szablon nie znaleziony.");

            var filePath = template.FilePath;
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Plik szablonu nie znaleziony na serwerze.");
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            return File(fileBytes, "application/octet-stream", template.FileName);
        }
    }
}