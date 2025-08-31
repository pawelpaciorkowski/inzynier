using CRM.Data;
using CRM.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CRM.BusinessLogic.Services
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(int userId, string message, string? title = null, string? details = null);
        Task ProcessScheduledNotificationsAsync();
    }

    public class NotificationService : INotificationService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(IServiceProvider serviceProvider, ILogger<NotificationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task CreateNotificationAsync(int userId, string message, string? title = null, string? details = null)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var notification = new Notification
            {
                UserId = userId,
                Message = message,
                Title = title,
                Details = details,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            context.Notifications.Add(notification);
            await context.SaveChangesAsync();

            _logger.LogInformation("Created notification for user {UserId}: {Message}", userId, message);
        }

        public async Task ProcessScheduledNotificationsAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var now = DateTime.UtcNow;
            var currentMinute = new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, 0, DateTimeKind.Utc);
            var nextMinute = currentMinute.AddMinutes(1);

            // Pobierz przypomnienia, które powinny być wyświetlone w tej konkretnej minucie
            var dueReminders = await context.Reminders
                .Where(r => r.RemindAt >= currentMinute && r.RemindAt < nextMinute)
                .ToListAsync();

            // Przypomnienia są obsługiwane przez frontend w Layout.tsx
            // Nie tworzymy powiadomień w bazie danych, aby uniknąć podwójnych powiadomień
            if (dueReminders.Any())
            {
                _logger.LogInformation("Found {Count} due reminders (handled by frontend)", dueReminders.Count);
            }
        }
    }

    public class NotificationBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<NotificationBackgroundService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

        public NotificationBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<NotificationBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Notification background service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                    
                    await notificationService.ProcessScheduledNotificationsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in notification background service");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Notification background service stopped");
        }
    }
}
