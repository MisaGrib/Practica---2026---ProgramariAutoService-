using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MechanicController : ControllerBase
{
    private readonly IMechanicService _mechanicService;

    public MechanicController(IMechanicService mechanicService)
    {
        _mechanicService = mechanicService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var mechanics = await _mechanicService.GetAllMechanicsAsync();
        return Ok(mechanics);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Mecanic")]
    public async Task<IActionResult> GetMechanicById(int id)
    {
        var mechanic = await _mechanicService.GetMechanicByIdAsync(id);
        if (mechanic == null)
            return NotFound($"Nu pot fi găsite datele pentru mecanicul cu id-ul: {id}");
        return Ok(mechanic);
    }

    [HttpGet("email/{email}")]
    [Authorize(Roles = "Admin,Mecanic")]
    public async Task<IActionResult> GetMechanicByEmail(string email)
    {
        var mechanic = await _mechanicService.GetMechanicByEmailAsync(email);
        if (mechanic == null)
            return NotFound($"Nu pot fi găsite datele pentru mecanicul cu email-ul: {email}");
        return Ok(mechanic);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] Mechanic newMechanic)
    {
        if (newMechanic == null)
            return BadRequest("Datele nu pot fi nule.");
        var existingMechanic = await _mechanicService.GetMechanicByEmailAsync(newMechanic.Email);
        if (existingMechanic != null)
            return Conflict($"Există deja un mecanic cu email-ul {newMechanic.Email}.");
        var createdMechanic = await _mechanicService.CreateMechanicAsync(newMechanic);
        return CreatedAtAction(nameof(GetMechanicById), new { id = createdMechanic.Id }, createdMechanic);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] Mechanic updatedMechanic)
    {
        if (updatedMechanic == null)
            return BadRequest("Datele nu pot fi nule.");
        var existingMechanic = await _mechanicService.GetMechanicByEmailAsync(updatedMechanic.Email);
        if (existingMechanic != null && existingMechanic.Id != id)
            return Conflict($"Email-ul {updatedMechanic.Email} este deja folosit de un alt mecanic.");
        var isSuccess = await _mechanicService.UpdateMechanicAsync(id, updatedMechanic);
        if (!isSuccess)
            return NotFound("Mecanicul nu a fost găsit");
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var isDeleted = await _mechanicService.DeleteMechanicAsync(id);
        if (!isDeleted)
            return NotFound("Mecanicul nu a fost găsit");
        return NoContent();
    }
}