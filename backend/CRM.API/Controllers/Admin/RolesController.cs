using CRM.BusinessLogic.Services.Admin;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "Admin")]
    public class RolesController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
public async Task<ActionResult<List<RoleWithUserCountDto>>> GetAll()
{
    var roles = await _roleService.GetAllWithUserCountAsync();
    return Ok(roles);
}


        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetById(int id)
        {
            var role = await _roleService.GetByIdAsync(id);
            if (role == null)
                return NotFound();

            return Ok(role);
        }

        [HttpPost]
        public async Task<ActionResult<Role>> Create(CreateRoleDto dto)
        {
            var created = await _roleService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateRoleDto dto)
        {
            var success = await _roleService.UpdateAsync(id, dto);
            if (!success)
                return NotFound();

            return NoContent();
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _roleService.DeleteAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

       [HttpGet("{roleId}/users")]
        public async Task<ActionResult<List<UserWithRoleDto>>> GetUsersInRole(int roleId)
        {
            var users = await _roleService.GetUsersInRoleAsync(roleId);
            return Ok(users);
        }

    }
}
