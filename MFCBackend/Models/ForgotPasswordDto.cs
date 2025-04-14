using System.ComponentModel.DataAnnotations;

namespace MFCBackend.Models
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
    }
}