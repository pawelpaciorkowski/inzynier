using System.Collections.Generic;
using System.Threading.Tasks;
using CRM.Data.Models;

namespace CRM.BusinessLogic.Services
{
    public interface ILogService
    {
        Task<IEnumerable<SystemLog>> GetSystemLogsAsync();
        Task LogAsync(string level, string message, string source, int? userId = null, string? details = null);
    }
}
