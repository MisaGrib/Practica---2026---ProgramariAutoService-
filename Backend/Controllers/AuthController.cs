using Backend.DTOs.Auth;
using Backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]

public class AuthController : ControllerBase
{
    private readonly ILoginService _loginService;
    public AuthController(ILoginService loginService)
    {
        _loginService = loginService;
    }

    

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDTO LoginRequest)
    {
        if (LoginRequest == null || string.IsNullOrEmpty(LoginRequest.Email) || string.IsNullOrEmpty(LoginRequest.Password))
        {
            return  BadRequest("Email-ul și parola sunt obligatorii.");
        }

        var loginResponse = await _loginService.LoginAsync(LoginRequest);

           if (loginResponse == null)
        {
            return Unauthorized();
        }

         return Ok(loginResponse);
    }
}