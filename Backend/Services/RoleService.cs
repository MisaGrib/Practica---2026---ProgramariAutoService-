using Backend.Models;
using Backend.Interfaces;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;


public class RoleService : IRoleService
{
    private readonly AutoServiceAppointmentsContext _context;

    public RoleService(AutoServiceAppointmentsContext context)
    {
            _context = context;
 
    }


    public async Task<IEnumerable<Role>> GetAllRolesAsync()
    {
    return await _context.Roles.ToListAsync();
    }

    public async Task<Role?> GetRoleByIdAsync(int id)
    {
        return await _context.Roles.FindAsync(id);
    }

    public async Task<Role?> GetRoleByNameAsync(string name)
    {
        return await _context.Roles.FirstOrDefaultAsync(r => r.Name == name);
    }

    public async Task<Role> CreateRoleAsync(Role role)
    {
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        return role;
    }

    public async Task<bool> UpdateRoleAsync(int id, Role role)
    {
        var existingRole = await _context.Roles.FindAsync(id);

        if(existingRole == null)
        {
            return false;
        }
 
       existingRole.Name = role.Name;

       await _context.SaveChangesAsync();
       return true;
    }

    public async Task<bool> DeleteRoleAsync(int id)
    {
        var existingRole = await _context.Roles.FindAsync(id);

        if(existingRole == null)
        {
            return false;
        }

        _context.Roles.Remove(existingRole);

        await _context.SaveChangesAsync();
        return true;
    }


}