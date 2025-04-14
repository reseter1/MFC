using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace MFCBackend.Models
{
    public class UserSignUpDto
    {
        [Required]
        [MinLength(5, ErrorMessage = "Username phải có ít nhất 5 ký tự.")]
        [RegularExpression("^[a-zA-Z]+$", ErrorMessage = "Username chỉ được chứa các chữ cái từ a-z.")]
        public required string Username { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public required string Email { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Password phải có ít nhất 8 ký tự.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, một chữ số và một ký tự đặc biệt.")]
        public required string Password { get; set; }
    }
} 