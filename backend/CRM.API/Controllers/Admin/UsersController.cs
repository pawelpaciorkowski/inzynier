using CRM.BusinessLogic.Services.Admin;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;



namespace CRM.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserWithRoleDto>>> GetAll()
        {
            var users = await _userService.GetAllWithRolesAsync();

            var result = users.Select(u => new UserWithRoleDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role.Name
            }).ToList();

            return Ok(result);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<CRM.Data.Models.User>> GetById(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<UserWithRoleDto>> Create(CreateUserDto dto)
        {
            var created = await _userService.CreateAsync(dto);
            var result = new UserWithRoleDto
            {
                Id = created.Id,
                Username = created.Username,
                Email = created.Email,
                Role = created.Role.Name
            };
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, result);
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateUserDto dto)
        {
            var updated = await _userService.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _userService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
