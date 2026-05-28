using Backend.Interfaces;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

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
        user.PasswordHash = HashPassword(user.PasswordHash);
        user.CreatedAt = DateTime.Now;
        user.IsActive = true;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        await LinkPersonByEmailAsync(user.Email, user.Id);
        return user;
    }

    public async Task<bool> UpdateUserAsync(int id, User user)
    {
        var existingUser = await _context.Users.FindAsync(id);

        if (existingUser == null)
        {
            return false;
        }

        var oldEmail = existingUser.Email;
        existingUser.Email = user.Email;

        if (!string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            existingUser.PasswordHash = HashPassword(user.PasswordHash);
        }

        existingUser.RoleId = user.RoleId;
        existingUser.IsActive = user.IsActive;

        await _context.SaveChangesAsync();

        if (!string.Equals(oldEmail, existingUser.Email, StringComparison.OrdinalIgnoreCase))
        {
            await UnlinkPersonByEmailAsync(oldEmail, existingUser.Id);
        }

        await LinkPersonByEmailAsync(existingUser.Email, existingUser.Id);
        return true;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return false;
        }

        user.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task LinkPersonByEmailAsync(string email, int userId)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == email);
        if (customer != null)
        {
            customer.UserId = userId;
        }

        var mechanic = await _context.Mechanics.FirstOrDefaultAsync(m => m.Email == email);
        if (mechanic != null)
        {
            mechanic.UserId = userId;
        }

        if (customer != null || mechanic != null)
        {
            await _context.SaveChangesAsync();
        }
    }

    private async Task UnlinkPersonByEmailAsync(string email, int userId)
    {
        var customers = await _context.Customers.Where(c => c.UserId == userId && c.Email == email).ToListAsync();
        var mechanics = await _context.Mechanics.Where(m => m.UserId == userId && m.Email == email).ToListAsync();

        foreach (var customer in customers)
        {
            customer.UserId = null;
        }

        foreach (var mechanic in mechanics)
        {
            mechanic.UserId = null;
        }

        if (customers.Any() || mechanics.Any())
        {
            await _context.SaveChangesAsync();
        }
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
