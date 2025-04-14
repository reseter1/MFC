using System.Threading.Tasks;

namespace MFCBackend.Services
{
    public interface IEmailService
    {
        Task SendActivationEmail(string email, string username, string activationLink);
        Task SendResetPasswordEmail(string email, string username, string resetPasswordLink);
    }
} 