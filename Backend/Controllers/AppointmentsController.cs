using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin, Client, Mecanic")]

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

    [HttpGet("details")]
    public async Task<IActionResult> GetAllDetails()
    {
        var appointments = await _appointmentsService.GetAllAppointmentsDetailsAsync();

        if(appointments == null)
        {
            return NotFound("Nu pot fi găsite date pentru programări.");
        }
        return Ok(appointments);
    }

    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetByCode(string code)
    {
        var appointment = await _appointmentsService.GetAppointmentDetailsByCodeAsync(code);
        if (appointment == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru programarea cu codul: {code}");
        }
        return Ok(appointment);
    }

    [HttpGet("customer/{customerName}")]
    public async Task<IActionResult> GetByCustomerName(string customerName)
    {
        var appointments = await _appointmentsService.GetAppointmentsDetailsByCustomerNameAsync(customerName);

       if (appointments == null || !appointments.Any())
        {
            return NotFound($"Nu pot fi găsite programări pentru clientul cu numele: {customerName}");
        }

        return Ok(appointments);
    }

    [HttpGet("vehicles/{LicensePlate}")]
    public async Task<IActionResult> GetByVehicleLicensePlate(string LicensePlate)
    {
        var appointments = await _appointmentsService.GetAppointmentsDetailsByVehicleLicensePlateAsync(LicensePlate);
        if (appointments == null || !appointments.Any())
        {
            return NotFound($"Nu pot fi găsite programări pentru vehiculul cu numărul de înmatriculare: {LicensePlate}");
        }
        return Ok(appointments);
    }

    [HttpGet("mechanics/{mechanicName}")]
    public async Task<IActionResult> GetByMechanicName(string mechanicName)
    {
        var appointments = await _appointmentsService.GetAppointmentsDetailsByMechanicNameAsync(mechanicName);
        if (appointments == null || !appointments.Any())
        {
            return NotFound($"Nu pot fi găsite programări pentru mecanicul cu numele: {mechanicName}");
        }
        return Ok(appointments);
    }

    [HttpGet("services/{serviceName}")]
    public async Task<IActionResult> GetByServiceName(string serviceName)
    {
        var appointments = await _appointmentsService.GetAppointmentsDetailsByServiceNameAsync(serviceName);
        if (appointments == null || !appointments.Any())
        {
            return NotFound($"Nu pot fi găsite programări pentru serviciul cu numele: {serviceName}");
        }
        return Ok(appointments);
    }
    [HttpGet("scheduledDate/{scheduledDate}")]
    public async Task<IActionResult> GetByScheduledDate(DateTime scheduledDate)
    {
        var appointments = await _appointmentsService.GetAppointmentsDetailsByScheduledDateAsync(scheduledDate);
        if (appointments == null || !appointments.Any())
        {
            return NotFound($"Nu pot fi găsite programări pentru data programării: {scheduledDate.ToShortDateString()}");
        }
        return Ok(appointments);
    }

    [HttpGet("status/{status}")]
    public async Task<IActionResult> GetByStatus(string status)
    {
        var appointments = await _appointmentsService.GetAppointmentsDetailsByStatusAsync(status);
        if (appointments == null || !appointments.Any())
        {
            return NotFound($"Nu pot fi găsite programări pentru statusul: {status}");
        }
        return Ok(appointments);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Appointment newAppointment)
    {
        if (newAppointment == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }

        try
        {
            var createdAppointment = await _appointmentsService.CreateAppointmentAsync(newAppointment);
            return CreatedAtAction(nameof(GetById), new { id = createdAppointment.Id }, createdAppointment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (DbUpdateException)
        {
            return BadRequest("Programarea nu a putut fi salvata. Verifica daca datele sunt valide si incearca din nou.");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update (int id, [FromBody] Appointment updateAppointement)
    {
        if (updateAppointement == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }

        try
        {
            var isSuccess = await _appointmentsService.UpdateAppointmentAsync(id, updateAppointement);

            if (!isSuccess)
            {
                return NotFound($"Nu pot fi găsite date pentru această programare");
            }
            return Ok(updateAppointement);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (DbUpdateException)
        {
            return BadRequest("Programarea nu a putut fi actualizata. Verifica daca datele sunt valide si incearca din nou.");
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> updateStatus(int id, [FromBody] string status)
    {
        if (status == null)
        {
            return BadRequest("Statusul nu poate fi nul.");
        }

        try
        {
            var isSuccess = await _appointmentsService.UpdateAppointmentStatusAsync(id, status);

            if (!isSuccess)
            {
                return NotFound($"Nu pot fi găsite date pentru această programare");
            }

            return Ok($"Statusul programării a fost actualizat la: {status}");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
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
