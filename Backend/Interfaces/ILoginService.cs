using Backend.DTOs.Auth;

namespace Backend.Interfaces;

public interface ILoginService
{
    Task<LoginResponse?> LoginAsync(LoginRequestDTO loginRequest);
}