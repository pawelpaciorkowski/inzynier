namespace CRM.Data.Models
{
    public class RoleWithUserCountDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public int UsersCount { get; set; }
    }
}
