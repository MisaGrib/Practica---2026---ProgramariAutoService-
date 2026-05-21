using Backend.Interfaces;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ServicesService : IServicesService
{
    private readonly AutoServiceAppointmentsContext _context;

    public ServicesService(AutoServiceAppointmentsContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Service>> GetAllServicesAsync()
    {
        return await _context.Services.ToListAsync();
    }

    public async Task<Service?> GetServiceByIdAsync(int id)
    {
        return await _context.Services.FindAsync(id);
    }

    public async Task<Service?> GetServiceByNameAsync(string name)
    {
        return await _context.Services.FirstOrDefaultAsync(s => s.Name == name);
    }

    public async Task<Service> CreateServiceAsync(Service service)
    {
        _context.Services.Add(service);
        await _context.SaveChangesAsync();
        return service;
    }

    public async Task<bool> UpdateServiceAsync(int id, Service service)
    {
      var existingService = await _context.Services.FindAsync(id);

        if (existingService == null)
        {
            return false;
        }
  
        existingService.Name = service.Name;
        existingService.Description = service.Description;
        existingService.Price = service.Price;

         await _context.SaveChangesAsync();

         return true;
    }

    public async Task<bool> DeleteServiceAsync(int id)
    {
        var existingService = await _context.Services.FindAsync(id);

        if(existingService == null)
        {
            return false;
        }

        _context.Services.Remove(existingService);

        await _context.SaveChangesAsync();
        return true;
    }
}
