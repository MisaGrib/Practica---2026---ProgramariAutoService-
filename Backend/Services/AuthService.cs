using Backend.Data;
using Backend.DTOs.Auth;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private const int ClientRoleId = 2;

    private readonly AutoServiceAppointmentsContext _context;
    private readonly IJwtService _jwtService;

    public AuthService(AutoServiceAppointmentsContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest)
    {
        var passwordHash = HashPassword(loginRequest.Password);

        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Email == loginRequest.Email &&
                u.PasswordHash == passwordHash &&
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

        var phoneExists = await _context.Customers
            .AnyAsync(c => c.Phone == registerRequest.Phone);

        if (phoneExists)
        {
            return false;
        }

        var clientRoleExists = await _context.Roles
            .AnyAsync(r => r.Id == ClientRoleId);

        if (!clientRoleExists)
        {
            return false;
        }

        var user = new User
        {
            Email = registerRequest.Email,
            PasswordHash = HashPassword(registerRequest.Password),
            RoleId = ClientRoleId,
            CreatedAt = DateTime.Now,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var customer = new Customer
        {
            FirstName = registerRequest.FirstName,
            LastName = registerRequest.LastName,
            Phone = registerRequest.Phone,
            Email = registerRequest.Email,
            UserId = user.Id
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ChangePasswordAsync(ChangePasswordRequestDto changePasswordRequest)
    {
        var oldPasswordHash = HashPassword(changePasswordRequest.OldPassword);

        var user = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.Email == changePasswordRequest.Email &&
                u.PasswordHash == oldPasswordHash &&
                u.IsActive == true);

        if (user == null)
        {
            return false;
        }

        user.PasswordHash = HashPassword(changePasswordRequest.NewPassword);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto resetPasswordRequest)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.Email == resetPasswordRequest.Email &&
                u.IsActive == true);

        if (user == null)
        {
            return false;
        }

        user.PasswordHash = HashPassword(resetPasswordRequest.NewPassword);

        await _context.SaveChangesAsync();
        return true;
    }
}
