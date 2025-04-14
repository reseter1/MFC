using System;
using System.ComponentModel.DataAnnotations;

namespace MFCBackend.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Username { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public required string Email { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        [MaxLength(250)]
        public string? AvatarUrl { get; set; }

        [MaxLength(100)]
        public string? DisplayName { get; set; }

        public bool IsVerified { get; set; } = false;

        public string? ActivationToken { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? LastLoginAt { get; set; }

        [MaxLength(20)]
        public string Role { get; set; } = "user"; 

        [MaxLength(20)]
        public string Status { get; set; } = "offline"; 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
