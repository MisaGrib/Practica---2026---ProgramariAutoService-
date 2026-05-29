using Backend.Models;
using Backend.Interfaces;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Services;


public class MechanicService : IMechanicService
{
    private const int MechanicRoleId = 3;
    private readonly AutoServiceAppointmentsContext _context;

    public MechanicService(AutoServiceAppointmentsContext context)
    {
            _context = context;
 
    }


    public async Task<IEnumerable<Mechanic>> GetAllMechanicsAsync()
    {
    return await _context.Mechanics.ToListAsync();
    }

    public async Task<Mechanic?> GetMechanicByIdAsync(int id)
    {
        return await _context.Mechanics.FindAsync(id);
    }

    public async Task<Mechanic?> GetMechanicByEmailAsync(string email)
    {
        var normalizedEmail = email.ToLower();
        return await _context.Mechanics.FirstOrDefaultAsync(c => c.Email!.ToLower() == normalizedEmail);
    }

    public async Task<Mechanic> CreateMechanicAsync(Mechanic mechanic)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == mechanic.Email);

        mechanic.UserId = user?.Id;
        _context.Mechanics.Add(mechanic);
        await _context.SaveChangesAsync();
        return mechanic;
    }

    public async Task<bool> UpdateMechanicAsync(int id, Mechanic mechanic)
    {
        var existingMechanic = await _context.Mechanics.FindAsync(id);

        if(existingMechanic == null)
        {
            return false;
        }
 
       existingMechanic.FirstName = mechanic.FirstName;
       existingMechanic.LastName = mechanic.LastName;
       existingMechanic.Phone = mechanic.Phone;
       existingMechanic.Email = mechanic.Email;

       var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == mechanic.Email);
       existingMechanic.UserId = user?.Id;

       await _context.SaveChangesAsync();
       return true;
    }

    public async Task<bool> DeleteMechanicAsync(int id)
    {
        var existingMechanic = await _context.Mechanics.FindAsync(id);

        if(existingMechanic == null)
        {
            return false;
        }

        _context.Mechanics.Remove(existingMechanic);

        await _context.SaveChangesAsync();
        return true;
    }


    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
