using Microsoft.EntityFrameworkCore;
using MFCBackend.Models;
namespace MFCBackend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<JWT> JWTs { get; set; }
    }
} 