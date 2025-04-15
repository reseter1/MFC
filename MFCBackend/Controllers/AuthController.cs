using Microsoft.AspNetCore.Mvc;
using MFCBackend.Models;
using MFCBackend.Services;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using MFCBackend.Repositories;
using MFCBackend.Data;
using MFCBackend.Models.SettingModels;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text.Json;
using System.Net.Http;
using System.Net.Http.Headers;
namespace MFCBackend.Controllers
{
    [ApiController]
    [Route("")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly UserRepository _userRepository;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly JWTRepository _jwtRepository;
        private readonly FrontendSettings _frontendSettings;
        private readonly GoogleSettings _googleSettings;


        public AuthController(ApplicationDbContext context, IEmailService emailService, UserRepository userRepository, IJwtTokenService jwtTokenService, JWTRepository jwtRepository, IOptions<FrontendSettings> frontendSettings, IOptions<GoogleSettings> googleSettings)
        {
            _context = context;
            _emailService = emailService;
            _userRepository = userRepository;
            _jwtTokenService = jwtTokenService;
            _jwtRepository = jwtRepository;
            _frontendSettings = frontendSettings.Value;
            _googleSettings = googleSettings.Value;
        }

        [HttpPost("google-auth")]
        public async Task<IActionResult> GoogleSignIn([FromBody] GoogleAuthDto googleAuthDto)
        {
            var clientId = _googleSettings.ClientId;
            var clientSecret = _googleSettings.ClientSecret;
            var code = googleAuthDto.Code;
            
            var redirectUri = _frontendSettings.Url + "/sign-in";

            var tokenRequestUri = "https://oauth2.googleapis.com/token";
            var tokenRequestBody = new Dictionary<string, string>
            {
                { "code", code },
                { "client_id", clientId },
                { "client_secret", clientSecret },
                { "redirect_uri", redirectUri },
                { "grant_type", "authorization_code" },
                { "access_type", "offline" }
            };

            using (var httpClient = new HttpClient())
            {
                var tokenResponse = await httpClient.PostAsync(tokenRequestUri, new FormUrlEncodedContent(tokenRequestBody));
                if (!tokenResponse.IsSuccessStatusCode)
                {
                    var errorContent = await tokenResponse.Content.ReadAsStringAsync();
                    return BadRequest(new { success = false, message = $"Xác thực Google thất bại: {errorContent}" });
                }

                var tokenResponseContent = await tokenResponse.Content.ReadAsStringAsync();
                var tokenData = JsonSerializer.Deserialize<JsonDocument>(tokenResponseContent);
                if (tokenData == null || !tokenData.RootElement.TryGetProperty("access_token", out var accessTokenElement))
                {
                    return BadRequest(new { success = false, message = "Xác thực Google thất bại." });
                }

                var accessToken = accessTokenElement.GetString();
                var userInfoUri = "https://www.googleapis.com/oauth2/v3/userinfo";
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                var userInfoResponse = await httpClient.GetAsync(userInfoUri);
                
                if (!userInfoResponse.IsSuccessStatusCode)
                {
                    var errorContent = await userInfoResponse.Content.ReadAsStringAsync();
                    return BadRequest(new { success = false, message = $"Xác thực Google thất bại: {errorContent}" });
                }
                
                var userInfoContent = await userInfoResponse.Content.ReadAsStringAsync();
                var userData = JsonSerializer.Deserialize<JsonDocument>(userInfoContent);
                
                if (userData == null)
                {
                    return BadRequest(new { success = false, message = "Xác thực Google thất bại." });
                }
                
                string email = null;
                string name = null;
                
                if (userData.RootElement.TryGetProperty("email", out var emailElement))
                {
                    email = emailElement.GetString();
                }
                
                if (userData.RootElement.TryGetProperty("name", out var nameElement))
                {
                    name = nameElement.GetString();
                }

                var randomString = new string(Enumerable.Repeat("abcdefghijklmnopqrstuvwxyz", 15)
                    .Select(s => s[new Random().Next(s.Length)]).ToArray());
                
                var user = await _userRepository.GetUserByEmail(email);
                if (user == null) {
                    user = new User
                    {
                        Username = "googleuser" + randomString,
                        Email = email,
                        PasswordHash = "",
                        IsVerified = true,
                        DisplayName = name,
                    };
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }

                if (user.IsActive) {
                   var token = _jwtTokenService.GenerateToken(user);
                   await _userRepository.UpdateSignInStatus(user, true);
                   await _jwtRepository.AddJWTAsync(token);
                   return Ok(new { success = true, message = "Đăng nhập thành công.", token = token });
                } else {
                    return BadRequest(new { success = false, message = "Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm thông tin." });
                }
            }
        }

        [HttpPost("sign-in")]
        public async Task<IActionResult> SignIn([FromBody] UserSignInDto userSignInDto)
        {
            var user = await _userRepository.GetUserByEmail(userSignInDto.Email);
            if (user == null)
            {
                return BadRequest(new { success = false, message = "Tài khoản không tồn tại. Vui lòng kiểm tra lại." });
            }

            var passwordHasher = new PasswordHasher<object>();
            var result = passwordHasher.VerifyHashedPassword(new object(), user.PasswordHash, userSignInDto.Password);
            if (result == PasswordVerificationResult.Failed)
            {
                return BadRequest(new { success = false, message = "Mật khẩu không chính xác. Vui lòng kiểm tra lại." });
            }

            if (!user.IsVerified)
            {
                return BadRequest(new { success = false, message = "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt tài khoản." });
            }   
            
            if (user.IsActive) {
                var token = _jwtTokenService.GenerateToken(user);
                await _userRepository.UpdateSignInStatus(user, true);
                await _jwtRepository.AddJWTAsync(token);
                return Ok(new { success = true, message = "Đăng nhập thành công.", token = token });
            } else {
                return BadRequest(new { success = false, message = "Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm thông tin." });
            }
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> SignUp([FromBody] UserSignUpDto userSignUpDto)
        {
            if (_context.Users.Any(u => u.Username == userSignUpDto.Username))
            {
                return BadRequest(new { success = false, message = "Username đã tồn tại." });
            }

            if (_context.Users.Any(u => u.Email == userSignUpDto.Email))
            {
                return BadRequest(new { success = false, message = "Email đã tồn tại." });
            }

            var passwordHasher = new PasswordHasher<object>();
            var passwordHash = passwordHasher.HashPassword(new object(), userSignUpDto.Password);

            var user = new User
            {
                Username = userSignUpDto.Username,
                Email = userSignUpDto.Email,
                PasswordHash = passwordHash,
                IsVerified = false
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = Guid.NewGuid().ToString(); 
            await _userRepository.SaveActivationTokenToUser(user.Id, token); 
            var activationLink = $"{_frontendSettings.Url}/activate?userId={user.Id}&token={token}";
            await _emailService.SendActivationEmail(user.Email, user.Username, activationLink);

            return Ok(new { success = true, message = "Đăng ký tài khoản thành công. Vui lòng kiểm tra email để kích hoạt tài khoản." });
        }

        [HttpPost("activate")]
        public async Task<IActionResult> Activate([FromQuery] string userId, [FromQuery] string token)
        {
            var user = await _userRepository.GetUserById(Guid.Parse(userId));
            if (user == null)
            {
                return BadRequest(new { success = false, message = "Yêu cầu không hợp lệ." });
            }

            var activationToken = await _userRepository.GetActivationToken(user.Id);
            if (activationToken == null || activationToken != token)
            {
                return BadRequest(new { success = false, message = "Yêu cầu không hợp lệ." });
            }

            var newToken = Guid.NewGuid().ToString();
            await _userRepository.SaveActivationTokenToUser(user.Id, newToken);

            user.IsVerified = true;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Tài khoản đã được kích hoạt thành công." });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            var user = await _userRepository.GetUserByEmail(forgotPasswordDto.Email);
            if (user == null)
            {
                return BadRequest(new { success = false, message = "Email không tồn tại." });
            }

            var token = Guid.NewGuid().ToString(); 
            await _userRepository.SaveActivationTokenToUser(user.Id, token);

            var resetPasswordLink = $"{_frontendSettings.Url}/change-password?userId={user.Id}&token={token}&email={user.Email}";
            await _emailService.SendResetPasswordEmail(user.Email, user.Username, resetPasswordLink);

            return Ok(new { success = true, message = "Link đặt lại mật khẩu đã được gửi đến email của bạn." });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var user = await _userRepository.GetUserById(changePasswordDto.UserId);
            if (user == null)
            {
                return BadRequest(new { success = false, message = "Yêu cầu không hợp lệ." });
            }

            var activationToken = await _userRepository.GetActivationToken(user.Id);
            if (activationToken == null || activationToken != changePasswordDto.Token)
            {
                return BadRequest(new { success = false, message = "Yêu cầu không hợp lệ." });
            }
            
            var passwordHasher = new PasswordHasher<object>();
            var passwordHash = passwordHasher.HashPassword(new object(), changePasswordDto.Password);

            var token = Guid.NewGuid().ToString();
            await _userRepository.SaveActivationTokenToUser(user.Id, token);

            user.PasswordHash = passwordHash;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Mật khẩu đã được đặt lại thành công." });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var token = Request.Headers["Authorization"].ToString().Split(" ")[1];
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null)
            {
                return BadRequest(new { success = false, message = "Token không hợp lệ." });
            }
            
            var userId = Guid.Parse(userIdClaim.Value);
            var user = await _userRepository.GetUserById(userId);
            if (user != null)
            {
                await _userRepository.UpdateSignInStatus(user, false);
            }
            
            await _jwtRepository.DeleteJWTAsync(token);
            return Ok(new { success = true, message = "Đăng xuất thành công." });
        }
    }
} 