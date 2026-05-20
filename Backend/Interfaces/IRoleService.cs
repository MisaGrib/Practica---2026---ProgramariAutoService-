using Backend.Models;

namespace Backend.Interfaces;

public interface IRoleService
{
    Task<IEnumerable<Role>> GetAllRolesAsync();
    Task<Role?> GetRoleByIdAsync(int id);
    Task<Role?> GetRoleByNameAsync(string name);
    Task<Role> CreateRoleAsync(Role role);
    Task<bool> UpdateRoleAsync(int id, Role role);
    Task<bool> DeleteRoleAsync(int id);
}