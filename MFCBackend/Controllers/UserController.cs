using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MFCBackend.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System;
using System.Linq;
using MFCBackend.Models;
using MFCBackend.Repositories;
using Microsoft.AspNetCore.Identity;
namespace MFCBackend.Controllers
{
    [ApiController]
    [Route("")]
    public class UserController : ControllerBase
    {
        private readonly ChatContextsRepository _chatContextsRepository;
        private readonly UserRepository _userRepository;
        public UserController(ChatContextsRepository chatContextsRepository, UserRepository userRepository)
        {
            _chatContextsRepository = chatContextsRepository;
            _userRepository = userRepository;
        }

        [Authorize]
        [HttpGet("api/user/delete-account")]
        public async Task<IActionResult> DeleteAccount()
        {
            try
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
                await _userRepository.DeleteUser(userId);
                return Ok(new { success = true, message = "Xóa tài khoản người dùng thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Có lỗi xảy ra khi xóa tài khoản người dùng: " + ex.Message });
            }
        }
        


        [Authorize]
        [HttpGet("api/user/delete-user-chats")]
        public async Task<IActionResult> DeleteAllChatContexts()
        {
            try
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
                await _chatContextsRepository.DeleteAllChatContextsAsync(userId);
                return Ok(new { success = true, message = "Xóa tất cả chat contexts thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Có lỗi xảy ra khi xóa tất cả chat contexts: " + ex.Message });
            }
        }

        [Authorize]
        [HttpPost("api/user/update-user-password")]
        public async Task<IActionResult> UpdateUserPassword([FromBody] UserPasswordUpdateDto data)
        {
            try
            {
                string oldPassword = data.OldPassword;
                string newPassword = data.NewPassword;
                if (string.IsNullOrEmpty(oldPassword) || string.IsNullOrEmpty(newPassword))
                {
                    return BadRequest(new { success = false, message = "Mật khẩu không được để trống." });
                }

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
                if (user == null)
                {
                    return BadRequest(new { success = false, message = "Người dùng không tồn tại." });
                }

                var passwordHasher = new PasswordHasher<object>();
                var verificationResult = passwordHasher.VerifyHashedPassword(new object(), user.PasswordHash, oldPassword);
                
                if (verificationResult != PasswordVerificationResult.Success)
                {
                    return BadRequest(new { success = false, message = "Mật khẩu cũ không chính xác." });
                }

                var newPasswordHash = passwordHasher.HashPassword(new object(), newPassword);
                user.PasswordHash = newPasswordHash;
                await _userRepository.UpdateUser(user);
                return Ok(new { success = true, message = "Cập nhật mật khẩu người dùng thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Có lỗi xảy ra khi cập nhật mật khẩu người dùng: " + ex.Message });
            }
        }

        [Authorize]
        [HttpPost("api/user/update-user-display-name")]
        public async Task<IActionResult> UpdateUserDisplayName([FromBody] UserDisplayNameUpdateDto data)
        {
            try
            {
                string displayName = data.DisplayName;
                if (string.IsNullOrEmpty(displayName))
                {
                    return BadRequest(new { success = false, message = "Tên hiển thị không được để trống." });
                }

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
                if (user == null)
                {
                    return BadRequest(new { success = false, message = "Người dùng không tồn tại." });
                }

                user.DisplayName = displayName;
                await _userRepository.UpdateUser(user);
                return Ok(new { success = true, message = "Cập nhật tên hiển thị người dùng thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Có lỗi xảy ra khi cập nhật tên hiển thị người dùng: " + ex.Message });
            }
        }

        [Authorize]
        [HttpGet("api/user/get-user-info")]
        public async Task<IActionResult> GetUserInfo()
        {
            try
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
                return Ok(new { success = true, message = "Lấy thông tin người dùng thành công.", data = new UserDataDto {
                    Email = user.Email,
                    Username = user.Username,
                    DisplayName = user.DisplayName
                } });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy thông tin người dùng: " + ex.Message });
            }
        }

        [Authorize]
        [HttpGet("api/user/get-chat-contexts")]
        public async Task<IActionResult> GetChatContexts()
        {
            try
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
                var chatContexts = await _chatContextsRepository.GetChatContextsAsync(userId);
                return Ok(new { 
                    success = true, 
                    message = "Lấy danh sách chat context thành công.", 
                    data = chatContexts.Select(x => new ChatContextsDto { 
                        ChatTitle = x.ChatTitle, 
                        ContextId = x.ContextId 
                    }) 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy danh sách chat context: " + ex.Message });
            }
        }

        [Authorize]
        [HttpPost("api/user/change-title-chat")]
        public async Task<IActionResult> ChangeTitleChat([FromBody] ChangeTitleChatDto data)
        {
            try
            {
                string newTitle = data.NewTitle;
                string contextId = data.ContextId;
                if (string.IsNullOrEmpty(newTitle))
                {
                    return BadRequest(new { success = false, message = "Tên chat không được để trống." });
                }

                var token = Request.Headers["Authorization"].ToString().Split(" ")[1];
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
                if (userIdClaim == null)
                {
                    return BadRequest(new { success = false, message = "Token không hợp lệ." });
                }

                var userId = Guid.Parse(userIdClaim.Value);
                await _chatContextsRepository.UpdateChatTitle(userId, newTitle, contextId);
                    return Ok(new { success = true, message = "Cập nhật tên chat thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Có lỗi xảy ra khi cập nhật tên chat: " + ex.Message });
            }
        }

        [Authorize]
        [HttpPost("api/user/delete-one-chat-context")]
        public async Task<IActionResult> DeleteOneChatContext([FromBody] DeleteOneChatContextDto data)
        {
            try
            {
                string contextId = data.ContextId;
                if (string.IsNullOrEmpty(contextId))
                {
                    return BadRequest(new { success = false, message = "Id chat context không được để trống." });
                }

                var token = Request.Headers["Authorization"].ToString().Split(" ")[1];
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
                if (userIdClaim == null)
                {
                    return BadRequest(new { success = false, message = "Token không hợp lệ." });
                }

                var userId = Guid.Parse(userIdClaim.Value);
                await _chatContextsRepository.DeleteOneChatContext(userId, contextId);
                return Ok(new { success = true, message = "Xóa chat context thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Có lỗi xảy ra khi xóa chat context: " + ex.Message });
            }
        }
    }
}