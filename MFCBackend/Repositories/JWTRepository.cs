using MFCBackend.Data;
using MFCBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace MFCBackend.Repositories
{
    public class JWTRepository
    {
        private readonly ApplicationDbContext _context;

        public JWTRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<JWT> ChangeStatusAsync(string token, bool status, string message)
        {
            var jwt = await _context.JWTs.FirstOrDefaultAsync(j => j.Token == token);
            if (jwt == null)
            {
                throw new Exception("Token not found");
            }
            jwt.Status = status;
            jwt.Message = message;
            await _context.SaveChangesAsync();
            return jwt;
        }

        public async Task<JWT> AddJWTAsync(string token)
        {
            var jwt = new JWT
            {
                Token = token,
                Status = true,
                Message = "Token is valid"
            };
            await _context.JWTs.AddAsync(jwt);
            await _context.SaveChangesAsync();
            return jwt;
        }

        public async Task<bool> GetJWTStatusAsync(string token)
        {
            if (string.IsNullOrEmpty(token)) return false;
            var jwt = await _context.JWTs.FirstOrDefaultAsync(j => j.Token == token);
            return jwt != null && jwt.Status;
        }

        public async Task<bool> DeleteJWTAsync(string token)
        {
            var jwt = await _context.JWTs.FirstOrDefaultAsync(j => j.Token == token);
            if (jwt == null) return false;
            _context.JWTs.Remove(jwt);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}