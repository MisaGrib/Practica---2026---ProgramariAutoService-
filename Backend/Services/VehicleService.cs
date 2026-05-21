using Backend.Models;
using Backend.Interfaces;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;


public class VehicleService : IVehiclesService
{
    private readonly AutoServiceAppointmentsContext _context;

    public VehicleService(AutoServiceAppointmentsContext context)
    {
            _context = context;
 
    }


    public async Task<IEnumerable<Vehicle>> GetAllVehiclesAsync()
    {
    return await _context.Vehicles.ToListAsync();
    }

    public async Task<Vehicle?> GetVehicleByIdAsync(int id)
    {
        return await _context.Vehicles.FindAsync(id);
    }

    public async Task<Vehicle?> GetVehicleByLicensePlateAsync(string licensePlate)
    {
        return await _context.Vehicles.FirstOrDefaultAsync(v => v.LicensePlate == licensePlate);
    }

    public async Task<Vehicle?> GetVehicleByCustomerIdAsync(int customerId)
    {
        return await _context.Vehicles.FirstOrDefaultAsync(v => v.CustomerId == customerId);
    }

    public async Task<Vehicle> CreateVehicleAsync(Vehicle vehicle)
    {
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();
        return vehicle;
    }

    public async Task<bool> UpdateVehicleAsync(int id, Vehicle vehicle)
    {
        var existingVehicle = await _context.Vehicles.FindAsync(id);

        if(existingVehicle == null)
        {
            return false;
        }
 
       existingVehicle.LicensePlate = vehicle.LicensePlate;
       existingVehicle.CustomerId = vehicle.CustomerId;

       await _context.SaveChangesAsync();
       return true;
    }

    public async Task<bool> DeleteVehicleAsync(int id)
    {
        var existingVehicle = await _context.Vehicles.FindAsync(id);

        if(existingVehicle == null)
        {
            return false;
        }

        _context.Vehicles.Remove(existingVehicle);

        await _context.SaveChangesAsync();
        return true;
    }


}