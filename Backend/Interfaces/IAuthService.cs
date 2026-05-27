using Backend.DTOs.Auth;

namespace Backend.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest);
    Task<bool> RegisterAsync(RegisterRequestDto registerRequest);
    Task<bool> ChangePasswordAsync(ChangePasswordRequestDto changePasswordRequest);
    Task<bool> ResetPasswordAsync(ResetPasswordRequestDto resetPasswordRequest);
}