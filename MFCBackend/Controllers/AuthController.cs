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
        public AuthController(ApplicationDbContext context, IEmailService emailService, UserRepository userRepository, IJwtTokenService jwtTokenService, JWTRepository jwtRepository, IOptions<FrontendSettings> frontendSettings)
        {
            _context = context;
            _emailService = emailService;
            _userRepository = userRepository;
            _jwtTokenService = jwtTokenService;
            _jwtRepository = jwtRepository;
            _frontendSettings = frontendSettings.Value;
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
            
            var token = _jwtTokenService.GenerateToken(user);
            await _userRepository.UpdateSignInStatus(user, true);
            await _jwtRepository.AddJWTAsync(token);
            return Ok(new { success = true, message = "Đăng nhập thành công.", token = token });
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