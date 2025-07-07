namespace CRM.Data.Models
{
    public class CreateUserDto
    {
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; } 
        public int RoleId { get; set; }
    }
}
