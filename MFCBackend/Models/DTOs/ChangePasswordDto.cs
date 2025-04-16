using System.ComponentModel.DataAnnotations;

namespace MFCBackend.Models
{
    public class ChangePasswordDto
    {
        public required Guid UserId { get; set; }
        public required string Token { get; set; }
       [Required]
        [MinLength(8, ErrorMessage = "Password phải có ít nhất 8 ký tự.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, một chữ số và một ký tự đặc biệt.")]
        public required string Password { get; set; }
    }
}