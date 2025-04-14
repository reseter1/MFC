using System;
using System.Linq;
using MFCBackend.Data;
using MFCBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace MFCBackend.Repositories
{
    public class UserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SaveActivationTokenToUser(Guid userId, string token)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null)
            {
                user.ActivationToken = token;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<string?> GetActivationToken(Guid userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            return user?.ActivationToken;
        }

        public async Task<User?> GetUserById(Guid userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> UpdateSignInStatus(User user, bool isSignedIn)
        {
            if (user != null)
            {
                user.LastLoginAt = DateTime.UtcNow;
                user.Status = isSignedIn ? "online" : "offline";
                await _context.SaveChangesAsync();
            }
            return user;
        }
    }
} 