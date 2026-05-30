using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
[Authorize]

public class ServicesController : ControllerBase
{
    private readonly IServicesService _servicesService;

    public ServicesController(IServicesService servicesService)
    {
        _servicesService = servicesService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var services = await _servicesService.GetAllServicesAsync();
        return Ok(services);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetServiceById(int id)
    {
        var service = await _servicesService.GetServiceByIdAsync(id);

        if(service == null)
        {
            return NotFound($"Nu pot fi găsite date pentru serviciul cu id-ul: {id}");
        }

        return Ok(service);
    }

    [HttpGet("name/{name}")]
    public async Task<IActionResult> GetServiceByName(string name)
    {
        var service = await _servicesService.GetServiceByNameAsync(name);

        if(service == null)
        {
            return NotFound($"Nu pot fi găsite date pentru serviciul cu numele: {name}");
        }

        return Ok(service);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] Service newService)
    {
        if(newService == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }

        var createdService = await _servicesService.CreateServiceAsync(newService);
        
        return CreatedAtAction(nameof(GetServiceById), new{id = createdService.Id}, createdService);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] Service updatedService)
    {
        if(updatedService == null)
        {
            return BadRequest($"Datele nu pot fi nule.");
        }

        var isSucces = await _servicesService.UpdateServiceAsync(id, updatedService);

        if (!isSucces)
        {
            return NotFound($"Serviciul nu poate fi găsit.");
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var isDeleted = await _servicesService.DeleteServiceAsync(id);

        if (!isDeleted)
        {
            return NotFound($"Serviciul nu poate fi găsit.");
        }

        return NoContent();
    }
}