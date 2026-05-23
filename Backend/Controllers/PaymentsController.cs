using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.Models;

[ApiController]
[Route("api/[controller]")]

public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var payments = await _paymentService.GetAllPaymentsAsync();
        return Ok(payments);
    }

     [HttpGet("{id}")]
    public async Task<IActionResult> GetPaymentById(int id)
    {
        var payment = await _paymentService.GetPaymentByIdAsync(id);

        if (payment == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru plata cu id-ul: {id}");
        }

        return Ok(payment);
    }

    [HttpGet("details")]
    public async Task<IActionResult> GetAllSelectPaymentsDetails()
    {
        var paymentsDetails = await _paymentService.GetAllSelectPaymetsDetailsAsync();
        return Ok(paymentsDetails);
    }

    [HttpGet("appointment/{appointmentCode}")]
    public async Task<IActionResult> GetPaymentDetailsByAppointmentCode(string appointmentCode)
    {
        var paymentDetails = await _paymentService.GetPaymentDetailsByAppointmentCodeAsync(appointmentCode);

        if (paymentDetails == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru plata cu id-ul programării: {appointmentCode}");
        }

        return Ok(paymentDetails);
    }

    [HttpGet("date/{paymentDate}")]
    public async Task<IActionResult> GetPaymentsByDate(DateTime paymentDate)
    {
        var payments = await _paymentService.GetPaymentsDetailsByDateAsync(paymentDate);

        return Ok(payments);
    }

    [HttpGet("type/{paymentType}")]
    public async Task<IActionResult> GetPaymentsByType(string paymentType)
    {
        var payments = await _paymentService.GetPaymentsDetailsByTypeAsync(paymentType);

        return Ok(payments);
    }

    [HttpPost]
    
    public async Task<IActionResult> Create([FromBody] Payment newPayment)
    {
        if(newPayment == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }

        var createdPayment = await _paymentService.CreatePaymentAsync(newPayment);

        return CreatedAtAction(nameof(GetPaymentById), new{id = createdPayment.Id}, createdPayment);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Payment updatedPayment)
    {
      if(updatedPayment == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }    

        var isSucces = await _paymentService.UpdatePaymentAsync(id, updatedPayment);

        if (!isSucces)
        {
            return NotFound($"Plata nu a fost găsită");
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var isDeleted = await _paymentService.DeletePaymentAsync(id);

        if (!isDeleted)
        {
            return NotFound($"Plata nu a fost găsită");
        }

        return NoContent();
    }
}