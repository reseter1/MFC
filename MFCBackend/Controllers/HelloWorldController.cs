using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace MFCBackend.Controllers
{
    [ApiController]
    [Route("")]
    public class HelloWorldController : ControllerBase
    {
        [HttpGet("hello-world")]
        public IActionResult Get()
        {
            return Ok("Hello, World!");
        }

        [Authorize]
        [HttpGet("auth-ping")]
        public IActionResult AuthPing()
        {
            return Ok("Auth Ping");
        }
    }
} 