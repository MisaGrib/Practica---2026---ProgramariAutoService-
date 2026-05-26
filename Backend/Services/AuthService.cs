using Backend.Data;
using Backend.DTOs.Auth;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly AutoServiceAppointmentsContext _context;
    private readonly IJwtService _jwtService;

    public AuthService(AutoServiceAppointmentsContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Email == loginRequest.Email &&
                u.PasswordHash == loginRequest.Password &&
                u.IsActive == true);

        if (user == null)
        {
            return null;
        }

        var token = _jwtService.GenerateToken(user.Email, user.Role.Name);

        return new LoginResponseDto
        {
            Email = user.Email,
            Role = user.Role.Name,
            Token = token
        };
    }

    public async Task<bool> RegisterAsync(RegisterRequestDto registerRequest)
    {
        var emailExists = await _context.Users
            .AnyAsync(u => u.Email == registerRequest.Email);

        if (emailExists)
        {
            return false;
        }

        var roleExists = await _context.Roles
            .AnyAsync(r => r.Id == registerRequest.RoleId);

        if (!roleExists)
        {
            return false;
        }

        var user = new User
        {
            Email = registerRequest.Email,
            PasswordHash = registerRequest.Password,
            RoleId = registerRequest.RoleId,
            CreatedAt = DateTime.Now,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ChangePasswordAsync(ChangePasswordRequestDto changePasswordRequest)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.Email == changePasswordRequest.Email &&
                u.PasswordHash == changePasswordRequest.OldPassword &&
                u.IsActive == true);

        if (user == null)
        {
            return false;
        }

        user.PasswordHash = changePasswordRequest.NewPassword;

        await _context.SaveChangesAsync();
        return true;
    }
}