namespace CRM.Data.Models
{
    public class CreateRoleDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; } 
    }
}
