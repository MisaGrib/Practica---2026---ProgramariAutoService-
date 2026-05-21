using Backend.Models;

namespace Backend.Interfaces;

public interface IServicesService
{
    Task<IEnumerable<Service>> GetAllServicesAsync();
    Task<Service?> GetServiceByIdAsync(int id);
    Task<Service?> GetServiceByNameAsync(string name);
    Task<Service> CreateServiceAsync(Service service);
    Task<bool> UpdateServiceAsync(int id, Service service);
    Task<bool> DeleteServiceAsync(int id);
}