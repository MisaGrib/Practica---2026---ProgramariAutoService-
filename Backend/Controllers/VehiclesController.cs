using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.Models;

[ApiController]
[Route("api/[controller]")]

public class VehiclesController : ControllerBase
{
    private readonly IVehiclesService _vehicleService;

    public VehiclesController(IVehiclesService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var vehicles = await _vehicleService.GetAllVehiclesAsync();
        return Ok(vehicles);
    }

     [HttpGet("{id}")]
    public async Task<IActionResult> GetVehicleById(int id)
    {
        var vehicle = await _vehicleService.GetVehicleByIdAsync(id);

        if (vehicle == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru vehiculul cu id-ul: {id}");
        }

        return Ok(vehicle);
    }

    [HttpGet("details")]
    public async Task<IActionResult> GetAllVehiclesDetails()
    {
        var vehicles = await _vehicleService.GetAllVehiclesDetailsAsync();
        if (vehicles == null || !vehicles.Any())
        {
            return NotFound("Nu pot fi găsite datele pentru vehicule.");
        }
        return Ok(vehicles);
    }

    [HttpGet("licenseplate/{licensePlate}")]
    public async Task<IActionResult> GetVehicleByLicensePlate(string licensePlate)
    {
        var vehicle = await _vehicleService.GetVehicleByLicensePlateAsync(licensePlate);

        if (vehicle == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru vehiculul cu numărul de înmatriculare: {licensePlate}");
        }

        return Ok(vehicle);
    }

    [HttpGet("customer/{customerName}")]
    public async Task<IActionResult> GetVehicleByCustomerName(string customerName)
    {
        var vehicle = await _vehicleService.GetVehicleByCustomerNameAsync(customerName);

        if (vehicle == null || !vehicle.Any())
        {
            return NotFound($"Nu pot fi găsite datele pentru vehiculul cu numele clientului: {customerName}");
        }

        return Ok(vehicle);
    }

    [HttpPost]
    
    public async Task<IActionResult> Create([FromBody] Vehicle newVehicle)
    {
        if(newVehicle == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }

        var createdVehicle = await _vehicleService.CreateVehicleAsync(newVehicle);

        return CreatedAtAction(nameof(GetVehicleById), new{id = createdVehicle.Id}, createdVehicle);

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Vehicle updatedVehicle)
    {
      if(updatedVehicle == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }    

        var isSucces = await _vehicleService.UpdateVehicleAsync(id, updatedVehicle);

        if (!isSucces)
        {
            return NotFound($"Vehiculul nu a fost găsit");
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var isDeleted = await _vehicleService.DeleteVehicleAsync(id);

        if (!isDeleted)
        {
            return NotFound($"Vehiculul nu a fost găsit");
        }

        return NoContent();
    }
}