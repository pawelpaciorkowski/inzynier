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

        public async Task LogAsync(string level, string message, string source, int? userId = null, string? details = null)
        {
            var logEntry = new SystemLog
            {
                Level = level,
                Message = message,
                Source = source,
                Timestamp = DateTime.UtcNow,
                UserId = userId,
                Details = details
            };

            _context.SystemLogs.Add(logEntry);
            await _context.SaveChangesAsync();
        }
    }
}
