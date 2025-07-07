namespace CRM.BusinessLogic.Auth.Requests
{
    public class UpdateUserRequest
    {
        public required string Username { get; set; }
        public required string Email { get; set; }
        public int RoleId { get; set; }
    }
}