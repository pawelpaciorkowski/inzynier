using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CRM.Data;
using CRM.Data.Models;

namespace CRM.BusinessLogic.Services
{
    public class LogService : ILogService
    {
        private readonly ApplicationDbContext _context;

        public LogService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SystemLog>> GetSystemLogsAsync()
        {
            return await _context.SystemLogs.OrderByDescending(l => l.Timestamp).ToListAsync();
        }
    }
}
