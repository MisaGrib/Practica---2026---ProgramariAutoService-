using Backend.DTOs.Auth;
using Backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
    {
        if (loginRequest == null ||
            string.IsNullOrWhiteSpace(loginRequest.Email) ||
            string.IsNullOrWhiteSpace(loginRequest.Password))
        {
            return BadRequest("Email-ul si parola sunt obligatorii.");
        }

        var response = await _authService.LoginAsync(loginRequest);

        if (response == null)
        {
            return Unauthorized("Email sau parola incorecta.");
        }

        return Ok(response);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerRequest)
    {
        if (registerRequest == null ||
            string.IsNullOrWhiteSpace(registerRequest.Email) ||
            string.IsNullOrWhiteSpace(registerRequest.Password))
        {
            return BadRequest("Datele pentru creare cont sunt obligatorii.");
        }

        var isCreated = await _authService.RegisterAsync(registerRequest);

        if (!isCreated)
        {
            return BadRequest("Utilizatorul exista deja sau rolul nu este valid.");
        }

        return Ok("Contul a fost creat cu succes.");
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto changePasswordRequest)
    {
        if (changePasswordRequest == null ||
            string.IsNullOrWhiteSpace(changePasswordRequest.Email) ||
            string.IsNullOrWhiteSpace(changePasswordRequest.OldPassword) ||
            string.IsNullOrWhiteSpace(changePasswordRequest.NewPassword))
        {
            return BadRequest("Datele pentru schimbarea parolei sunt obligatorii.");
        }

        var isChanged = await _authService.ChangePasswordAsync(changePasswordRequest);

        if (!isChanged)
        {
            return BadRequest("Email-ul sau parola veche este incorecta.");
        }

        return Ok("Parola a fost schimbata cu succes.");
    }
}