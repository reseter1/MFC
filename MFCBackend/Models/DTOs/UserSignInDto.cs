using System.ComponentModel.DataAnnotations;

namespace MFCBackend.Models 
{
    public class UserSignInDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        [Required]
        public required string Password { get; set; }
    }   
}