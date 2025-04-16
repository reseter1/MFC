using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MFCBackend.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System;
using System.Linq;
using MFCBackend.Models;
namespace MFCBackend.Controllers
{
    [ApiController]
    [Route("")]
    public class UserController : ControllerBase
    {
        private readonly ChatContextsRepository _chatContextsRepository;
        
        public UserController(ChatContextsRepository chatContextsRepository)
        {
            _chatContextsRepository = chatContextsRepository;
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
    }
}