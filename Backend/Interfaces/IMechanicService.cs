using Backend.Models;

namespace Backend.Interfaces;

public interface IMechanicService
{
    Task<IEnumerable<Mechanic>> GetAllMechanicsAsync();
    Task<Mechanic?> GetMechanicByIdAsync(int id);
    Task<Mechanic?> GetMechanicByEmailAsync(string email);
    Task<Mechanic> CreateMechanicAsync(Mechanic mechanic);
    Task<bool> UpdateMechanicAsync(int id, Mechanic mechanic);
    Task<bool> DeleteMechanicAsync(int id);
}