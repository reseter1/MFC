using System.ComponentModel.DataAnnotations;

namespace MFCBackend.Models {
    public class GoogleAuthDto
    {
        [Required]
        public required string Code { get; set; }
    }
}