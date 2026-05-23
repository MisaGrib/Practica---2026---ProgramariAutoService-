using Backend.Interfaces;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class UsersService : IUserService
{
    private readonly AutoServiceAppointmentsContext _context;

    public UsersService(AutoServiceAppointmentsContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<IEnumerable<SelectUser>> GetAllUsersDetailsAsync()
    {
       return await _context.SelectUsers.ToListAsync();
    }

    public async Task<SelectUser?> GetUserDetailsByEmailAsync(string email)
    {
        return await _context.SelectUsers.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<IEnumerable<SelectUser>> GetUsersByRoleNameAsync(string roleName)
    {
        return await _context.SelectUsers.Where(u => u.Name == roleName).ToListAsync();
    }

    public async Task<User> CreateUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<bool> UpdateUserAsync(int id, User user)
    {
        var existingUser = await _context.Users.FindAsync(id);

        if (existingUser == null)
        {
            return false;
        }

        existingUser.Email = user.Email;
        existingUser.PasswordHash = user.PasswordHash;
        existingUser.RoleId = user.RoleId;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return false;
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }
}
