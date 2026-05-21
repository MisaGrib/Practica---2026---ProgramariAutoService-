using Backend.Models;
using Backend.Interfaces;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;


public class MechanicService : IMechanicService
{
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
        return await _context.Mechanics.FirstOrDefaultAsync(c => c.Email == email);
    }

    public async Task<Mechanic> CreateMechanicAsync(Mechanic mechanic)
    {
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


}