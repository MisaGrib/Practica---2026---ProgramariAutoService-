using Backend.DTOs.Auth;
using Backend.Interfaces;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class LoginService : ILoginService
{
    private readonly AutoServiceAppointmentsContext _context;
    public LoginService(AutoServiceAppointmentsContext context)
    {
        _context = context;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequestDTO LoginRequest)
    {
        string email = LoginRequest.Email;
        string password = LoginRequest.Password;
        string token = "";

        var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == email && u.PasswordHash == password);

       if(user == null)
        {
            return null;
        }
      

        return new LoginResponse
        {
            Email = user.Email,
            Role = user.Role.Name,
            Token = token
        };
    }
}
