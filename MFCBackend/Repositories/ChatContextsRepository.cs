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

        public async Task DeleteAllChatContextsAsync(Guid userId)
        {
            var contexts = await _context.UserChatContexts.Where(x => x.UserId == userId).ToListAsync();
            _context.UserChatContexts.RemoveRange(contexts);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateChatTitle(Guid userId, string newTitle, string contextId)
        {
            var context = await _context.UserChatContexts.FirstOrDefaultAsync(x => x.UserId == userId && x.ContextId == contextId);
            context.ChatTitle = newTitle;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteOneChatContext(Guid userId, string contextId)
        {
            var context = await _context.UserChatContexts.FirstOrDefaultAsync(x => x.UserId == userId && x.ContextId == contextId);
            _context.UserChatContexts.Remove(context);
            await _context.SaveChangesAsync();
        }
    }
}