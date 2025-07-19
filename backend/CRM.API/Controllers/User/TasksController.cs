using CRM.Data;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CRM.API.Controllers.User
{
    [ApiController]
    [Route("api/user/[controller]")]
    [Authorize(Roles = "User,Admin,Sprzedawca")]

    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(id, out var userId) ? userId : 0;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            int userId = GetUserId();
            var tasks = await _context.Tasks
                .Where(t => t.UserId == userId)
                .ToListAsync();
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTask(int id)
        {
            int userId = GetUserId();
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
                return NotFound();

            return Ok(task);
        }

        [HttpPost]
        public async Task<ActionResult<TaskItem>> CreateTask([FromBody] CreateTaskDto dto)
        {
            var userId = GetUserId();
            if (userId == 0)
            {
                return Unauthorized();
            }

            var newTask = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                DueDate = dto.DueDate,
                Completed = false,
                UserId = userId,
                CustomerId = dto.CustomerId
            };

            _context.Tasks.Add(newTask);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTask), new { id = newTask.Id }, newTask);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
        {
            var userId = GetUserId();
            var existingTask = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (existingTask == null)
            {
                return NotFound();
            }

            existingTask.Title = dto.Title;
            existingTask.Description = dto.Description;
            existingTask.DueDate = dto.DueDate;
            existingTask.Completed = dto.Completed;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == GetUserId());

            if (task == null)
                return NotFound();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
