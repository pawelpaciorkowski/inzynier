namespace CRM.BusinessLogic.Auth.Requests
{
    public class UpdateUserRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public int RoleId { get; set; }
    }
}