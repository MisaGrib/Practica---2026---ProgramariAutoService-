using Backend.Services;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]

public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpGet("details")]
    public async Task<IActionResult> GetAllUsersDetails()
    {
        var users = await _userService.GetAllUsersDetailsAsync();
        return Ok(users);
    }

    [HttpGet("email/{email}")]
    public async Task<IActionResult> GetUserDeByEmail(string email)
    {
        var user = await _userService.GetUserDetailsByEmailAsync(email);

        if (user == null)
        {
            return NotFound($"Utilizator cu email '{email}' nu a fost găsit.");
        }

        return Ok(user);
    }

    [HttpGet("role/{roleName}")]
    public async Task<IActionResult> GetUsersByRoleName(string roleName)
    {
        var users = await _userService.GetUsersByRoleNameAsync(roleName);

        if (users == null || !users.Any())
        {
            return NotFound($"Nu au fost găsiți utilizatori cu rolul '{roleName}'.");
        }

        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(User user)
    {
        var createdUser = await _userService.CreateUserAsync(user);
        return CreatedAtAction(nameof(GetUserById), new { id = createdUser.Id }, createdUser);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, User user)
    {
        var result = await _userService.UpdateUserAsync(id, user);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var result = await _userService.DeleteUserAsync(id);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}