using MFCBackend.Data;
using MFCBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace MFCBackend.Repositories
{
    public class ChatContextsRepository
    {
        private readonly ApplicationDbContext _context;

        public ChatContextsRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserChatContext>> GetChatContextsAsync(Guid userId)
        {
            return await _context.UserChatContexts.Where(x => x.UserId == userId).ToListAsync();
        }
    }
}