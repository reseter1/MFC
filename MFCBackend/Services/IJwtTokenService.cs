using MFCBackend.Models;

namespace MFCBackend.Services
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user);
    }
}
