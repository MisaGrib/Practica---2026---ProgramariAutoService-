using Backend.Models;

namespace Backend.Interfaces;

public interface IUserService
{
    Task<IEnumerable<User>> GetAllUsersAsync();
    Task<User?> GetUserByIdAsync(int id);

    Task<IEnumerable<SelectUser>> GetAllUsersDetailsAsync();
    Task<SelectUser?> GetUserDetailsByEmailAsync(string email);
    Task<IEnumerable<SelectUser>> GetUsersByRoleNameAsync(string roleName);

    Task<User> CreateUserAsync(User user);
    Task<bool> UpdateUserAsync(int id, User user);
    Task<bool> DeleteUserAsync(int id);
}