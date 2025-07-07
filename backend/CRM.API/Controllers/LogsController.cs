using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using CRM.BusinessLogic.Services;
using CRM.Data.Models;
using Microsoft.AspNetCore.Authorization;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LogsController : ControllerBase
    {
        private readonly ILogService _logService;

        public LogsController(ILogService logService)
        {
            _logService = logService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")] // Only Admins can view logs
        public async Task<ActionResult<IEnumerable<SystemLog>>> GetSystemLogs()
        {
            var logs = await _logService.GetSystemLogsAsync();
            return Ok(logs);
        }
    }
}
