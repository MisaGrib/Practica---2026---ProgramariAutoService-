using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.Models;

[ApiController]
[Route("api/[controller]")]

public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _roleService.GetAllRolesAsync();
        return Ok(roles);
    }

     [HttpGet("{id}")]
    public async Task<IActionResult> GetRoleById(int id)
    {
        var role = await _roleService.GetRoleByIdAsync(id);

        if (role == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru rolul cu id-ul: {id}");
        }

        return Ok(role);
    }

    [HttpGet("name/{name}")]
    public async Task<IActionResult> GetRoleByName(string name)
    {
        var role = await _roleService.GetRoleByNameAsync(name);

        if (role == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru rolul cu numele: {name}");
        }

        return Ok(role);
    }

    [HttpPost]
    
    public async Task<IActionResult> Create([FromBody] Role newRole)
    {
        if(newRole == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }

        var createdRole = await _roleService.CreateRoleAsync(newRole);

        return CreatedAtAction(nameof(GetRoleById), new{id = createdRole.Id}, createdRole);

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Role updatedRole)
    {
      if(updatedRole == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }    

        var isSucces = await _roleService.UpdateRoleAsync(id, updatedRole);

        if (!isSucces)
        {
            return NotFound($"Rolul nu a fost găsit");
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var isDeleted = await _roleService.DeleteRoleAsync(id);

        if (!isDeleted)
        {
            return NotFound($"Rolul nu a fost găsit");
        }

        return NoContent();
    }
}