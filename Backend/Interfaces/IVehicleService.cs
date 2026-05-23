using Backend.Models;

namespace Backend.Interfaces;

public interface IVehiclesService
{
    Task<IEnumerable<Vehicle>> GetAllVehiclesAsync();
    Task<Vehicle?> GetVehicleByIdAsync(int id);
    Task<IEnumerable<SelectVehicle>> GetAllVehiclesDetailsAsync();
    Task<SelectVehicle?> GetVehicleByLicensePlateAsync(string licensePlate);
    Task<IEnumerable<SelectVehicle>> GetVehicleByCustomerNameAsync(string customerName);
    Task<Vehicle> CreateVehicleAsync(Vehicle vehicle);
    Task<bool> UpdateVehicleAsync(int id, Vehicle vehicle);
    Task<bool> DeleteVehicleAsync(int id);
}