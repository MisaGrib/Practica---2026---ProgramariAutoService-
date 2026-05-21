using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.Models;

[ApiController]
[Route("api/[controller]")]

public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentsService _appointmentsService;

    public AppointmentsController(IAppointmentsService appointmentsService)
    {
        _appointmentsService = appointmentsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var appointments = await _appointmentsService.GetAllAppointmentsAsync();
        return Ok(appointments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var appointment = await _appointmentsService.GetAppointmentByIdAsync(id);
        if (appointment == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru programarea cu id-ul: {id}");
        }
        return Ok(appointment);
    }

    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetByCode(string code)
    {
        var appointment = await _appointmentsService.GetAppointmentByCodeAsync(code);
        if (appointment == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru programarea cu codul: {code}");
        }
        return Ok(appointment);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetByCustomerId(int customerId)
    {
        var appointments = await _appointmentsService.GetAppointmentsByCustomerIdAsync(customerId);

       if (appointments == null || !appointments.Any())
        {
            return NotFound($"Nu pot fi găsite programări pentru clientul cu id-ul: {customerId}");
        }

        return Ok(appointments);
    }

    [HttpGet("vehicles/{vehicleId}")]
    public async Task<IActionResult> GetByVehicleId(int vehicleId)
    {
        var appointments = await _appointmentsService.GetAppointmentsByVehicleIdAsync(vehicleId);
        if (appointments == null || !appointments.Any())
        {
            return NotFound($"Nu pot fi găsite programări pentru vehiculul cu id-ul: {vehicleId}");
        }
        return Ok(appointments);
    }

    [HttpGet("mechanics/{mechanicId}")]
    
    public async Task<IActionResult> GetByMechanicId(int mechanicId)
    {
        var appointments = await _appointmentsService.GetAppointmentsByMechanicIdAsync(mechanicId);
        if (appointments == null || !appointments.Any())
        {
            return NotFound($"Nu pot fi găsite programări pentru mecanicul cu id-ul: {mechanicId}");
        }
        return Ok(appointments);
    }

    [HttpGet("services/{serviceId}")]
    public async Task<IActionResult> GetByServiceId(int serviceId)
    {
        var appointments = await _appointmentsService.GetAppointmentsByServiceIdAsync(serviceId);
        if (appointments == null || !appointments.Any())
        {
            return NotFound($"Nu pot fi găsite programări pentru serviciul cu id-ul: {serviceId}");
        }
        return Ok(appointments);
    }
    [HttpGet("scheduledDate/{scheduledDate}")]
    public async Task<IActionResult> GetByScheduledDate(DateTime scheduledDate)
    {
        var appointments = await _appointmentsService.GetAppointmentsByScheduledDateAsync(scheduledDate);
        if (appointments == null || !appointments.Any())
        {
            return NotFound($"Nu pot fi găsite programări pentru data programării: {scheduledDate.ToShortDateString()}");
        }
        return Ok(appointments);
    }

    [HttpGet("status/{status}")]
    public async Task<IActionResult> GetByStatus(string status)
    {
        var appointments = await _appointmentsService.GetAppointmentsByStatusAsync(status);
        if (appointments == null || !appointments.Any())
        {
            return NotFound($"Nu pot fi găsite programări pentru statusul: {status}");
        }
        return Ok(appointments);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Appointment newAppointment)
    {
        if(newAppointment == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }

        var createdAppointment = await _appointmentsService.CreateAppointmentAsync(newAppointment);

        return CreatedAtAction(nameof(GetById), new{id = createdAppointment.Id}, createdAppointment);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update (int id, [FromBody] Appointment updateAppointement)
    {
        if(updateAppointement == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }

        var isSuccess = await _appointmentsService.UpdateAppointmentAsync(id, updateAppointement);

        if (!isSuccess)
        {
            return NotFound($"Nu pot fi găsite date pentru această programare");
        }
        return Ok(updateAppointement);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> updateStatus(int id, [FromBody] string status)
    {
        if(status == null)
        {
            return BadRequest("Statusul nu poate fi nul.");
        }

        var isSuccess = await _appointmentsService.UpdateAppointmentStatusAsync(id, status);

        if (!isSuccess)
        {
            return NotFound($"Nu pot fi găsite date pentru această programare");
        }

        return Ok($"Statusul programării a fost actualizat la: {status}");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var isSuccess = await _appointmentsService.DeleteAppointmentAsync(id);

        if (!isSuccess)
        {
            return NotFound($"Nu pot fi găsite date pentru această programare");
        }
        return NoContent();
    }
}