using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace MFCBackend.Models
{
    public class JWT
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Column(TypeName = "text")]
        public required string Token { get; set; }
        public bool Status { get; set; } = true;
        public string Message { get; set; } = "Token is valid";
    }
}