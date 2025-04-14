using System.Threading.Tasks;

namespace MFCBackend.Services
{
    public interface IEmailService
    {
        Task SendActivationEmail(string email, string username, string activationLink);
    }
} 