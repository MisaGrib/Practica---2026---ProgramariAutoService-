using Backend.Models;

namespace Backend.Interfaces;

public interface IVehiclesService
{
    Task<IEnumerable<Vehicle>> GetAllVehiclesAsync();
    Task<Vehicle?> GetVehicleByIdAsync(int id);
    Task<Vehicle?> GetVehicleByLicensePlateAsync(string licensePlate);
    Task<Vehicle?> GetVehicleByCustomerIdAsync(int customerId);
    Task<Vehicle> CreateVehicleAsync(Vehicle vehicle);
    Task<bool> UpdateVehicleAsync(int id, Vehicle vehicle);
    Task<bool> DeleteVehicleAsync(int id);
}