using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.Models;

[ApiController]
[Route("api/[controller]")]

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
    public async Task<IActionResult> GetMechanicById(int id)
    {
        var mechanic = await _mechanicService.GetMechanicByIdAsync(id);

        if (mechanic == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru mecanicul cu id-ul: {id}");
        }

        return Ok(mechanic);
    }

    [HttpGet("email/{email}")]
    public async Task<IActionResult> GetMechanicByEmail(string email)
    {
        var mechanic = await _mechanicService.GetMechanicByEmailAsync(email);

        if (mechanic == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru mecanicul cu email-ul: {email}");
        }

        return Ok(mechanic);
    }

    [HttpPost]
    
    public async Task<IActionResult> Create([FromBody] Mechanic newMechanic)
    {
        if(newMechanic == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }

        var createdMechanic = await _mechanicService.CreateMechanicAsync(newMechanic);

        return CreatedAtAction(nameof(GetMechanicById), new{id = createdMechanic.Id}, createdMechanic);

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Mechanic updatedMechanic)
    {
      if(updatedMechanic == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }    

        var isSucces = await _mechanicService.UpdateMechanicAsync(id, updatedMechanic);

        if (!isSucces)
        {
            return NotFound($"Mecanicul nu a fost găsit");
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var isDeleted = await _mechanicService.DeleteMechanicAsync(id);

        if (!isDeleted)
        {
            return NotFound($"Mecanicul nu a fost găsit");
        }

        return NoContent();
    }
}