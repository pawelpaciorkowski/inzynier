namespace CRM.Data.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public int RoleId { get; set; }

        public required Role Role { get; set; }


        public virtual ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
    }

}
