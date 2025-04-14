using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using MFCBackend.Models.SettingModels;

namespace MFCBackend.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly AppInfo _appInfo;
        public EmailService(IOptions<EmailSettings> emailSettings, IOptions<AppInfo> appInfo)
        {
            _emailSettings = emailSettings.Value;
            _appInfo = appInfo.Value;
        }

        public async Task SendActivationEmail(string email, string username, string activationLink)
        {
            var htmlContent = $@"
                <!DOCTYPE html>
                <html lang='vi'>
                <head>
                  <meta charset='UTF-8'>
                  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                  <title>{_appInfo.Name} - Kích Hoạt Tài Khoản</title>
                  <style>
                    body, html {{
                      margin: 0;
                      padding: 0;
                      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                      line-height: 1.5;
                      color: #333333;
                      background-color: #f5f5f5;
                    }}
                    .container {{
                      max-width: 500px;
                      margin: 0 auto;
                      background-color: #ffffff;
                      border-radius: 6px;
                      overflow: hidden;
                      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    }}
                    .header {{
                      background-color: #222222;
                      padding: 20px 0;
                      text-align: center;
                      position: relative;
                      overflow: hidden;
                    }}
                    .header h1 {{
                      color: #ffffff;
                      margin: 0;
                      font-size: 22px;
                      position: relative;
                      z-index: 2;
                    }}
                    .header-animation {{
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background: linear-gradient(45deg, rgba(50, 50, 50, 0.8) 0%, rgba(30, 30, 30, 0.4) 100%);
                      z-index: 1;
                      animation: pulse 3s infinite alternate;
                    }}
                    @keyframes pulse {{
                      0% {{ opacity: 0.7; }}
                      100% {{ opacity: 1; }}
                    }}
                    .content {{
                      padding: 25px 20px;
                      text-align: center;
                    }}
                    .welcome-text {{
                      font-size: 16px;
                      margin-bottom: 20px;
                      color: #333333;
                    }}
                    .username {{
                      font-weight: bold;
                      color: #222222;
                      font-size: 18px;
                      animation: highlight 2s ease-in-out;
                    }}
                    @keyframes highlight {{
                      0% {{ color: #333333; }}
                      50% {{ color: #000000; }}
                      100% {{ color: #000000; }}
                    }}
                    .instructions {{
                      margin: 20px 0;
                      font-size: 15px;
                      color: #444444;
                      line-height: 1.5;
                    }}
                    .button-container {{
                      margin: 25px 0;
                    }}
                    .activate-button {{
                      display: inline-block;
                      background-color: #222222;
                      color: #ffffff;
                      text-decoration: none;
                      padding: 12px 25px;
                      border-radius: 4px;
                      font-weight: bold;
                      font-size: 15px;
                      transition: transform 0.3s, box-shadow 0.3s;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    }}
                    .activate-button:hover {{
                      background-color: #000000;
                      transform: translateY(-2px);
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                    }}
                    .footer {{
                      background-color: #f8f8f8;
                      padding: 15px;
                      text-align: center;
                      font-size: 13px;
                      color: #666666;
                      border-top: 1px solid #eeeeee;
                    }}
                    @media only screen and (max-width: 500px) {{
                      .container {{
                        width: 100%;
                        border-radius: 0;
                      }}
                      .content {{
                        padding: 20px 15px;
                      }}
                      .header h1 {{
                        font-size: 20px;
                      }}
                    }}
                  </style>
                </head>
                <body>
                  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='min-width: 100%; background-color: #f5f5f5; padding: 30px 0;'>
                    <tr>
                      <td align='center'>
                        <div class='container'>
                          <div class='header'>
                            <div class='header-animation'></div>
                            <h1>Kích Hoạt Tài Khoản</h1>
                          </div>
                          <div class='content'>
                            <p class='welcome-text'>Xin chào, <span class='username' id='username'>{username}</span>!</p>
                            <p class='instructions'>
                              Cảm ơn bạn đã đăng ký tài khoản nền tảng {_appInfo.Name}. Để bắt đầu sử dụng tài khoản, 
                              vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email của bạn.
                            </p>
                            <div class='button-container'>
                              <a href='{activationLink}' class='activate-button' id='activation-link' style='color: #ffffff !important; background-color: #222222; text-decoration: none; display: inline-block; padding: 12px 25px; border-radius: 4px; font-weight: bold; font-size: 15px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);'>Kích Hoạt Tài Khoản</a>
                            </div>
                            <p class='instructions'>
                              Nếu nút trên không hoạt động, bạn có thể sao chép và dán đường dẫn sau vào trình duyệt:
                            </p>
                            <p style='word-break: break-all; font-size: 13px; color: #222222; margin: 15px 0;'>
                              <span id='activation-link-text'>{activationLink}</span>
                            </p>
                          </div>
                          <div class='footer'>
                            <p>
                              Nếu bạn không tạo tài khoản này, bạn có thể bỏ qua email này.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <script>
                    document.addEventListener('DOMContentLoaded', function() {{
                      const urlParams = new URLSearchParams(window.location.search);
                      const username = urlParams.get('username') || '{username}';
                      const activationLink = urlParams.get('activation_link') || '{activationLink}';
                      document.getElementById('username').textContent = username;
                      document.getElementById('activation-link').href = activationLink;
                      document.getElementById('activation-link-text').textContent = activationLink;
                      setTimeout(function() {{
                        const button = document.querySelector('.activate-button');
                        button.style.transform = 'scale(1.05)';
                        setTimeout(function() {{
                          button.style.transform = 'scale(1)';
                        }}, 300);
                      }}, 1000);
                    }});
                  </script>
                </body>
                </html>";

            var mailMessage = new MailMessage(_emailSettings.SenderEmail, email)
            {
                Subject = $"{_appInfo.Name} - Kích hoạt tài khoản của bạn",
                Body = htmlContent,
                IsBodyHtml = true
            };

            using (var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.Port))
            {
                client.Credentials = new System.Net.NetworkCredential(_emailSettings.SenderEmail, _emailSettings.Password);
                client.EnableSsl = true;
                await client.SendMailAsync(mailMessage);
            }
        }
    }
} 