using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]

public class CustomerController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomerController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var customers = await _customerService.GetAllCustomersAsync();
        return Ok(customers);
    }

     [HttpGet("{id}")]
    public async Task<IActionResult> GetCustomerById(int id)
    {
        var customer = await _customerService.GetCustomerByIdAsync(id);

        if (customer == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru clientul cu id-ul: {id}");
        }

        return Ok(customer);
    }

    [HttpGet("email/{email}")]
    public async Task<IActionResult> GetCustomerByEmail(string email)
    {
        var customer = await _customerService.GetCustomerByEmailAsync(email);

        if (customer == null)
        {
            return NotFound($"Nu pot fi găsite datele pentru clientul cu email-ul: {email}");
        }

        return Ok(customer);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Customer newCustomer)
    {
        if(newCustomer == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }

        var existingCustomer = await _customerService.GetCustomerByEmailAsync(newCustomer.Email);
        if (existingCustomer != null)
        {
            return Conflict($"Există deja un client cu email-ul {newCustomer.Email}.");
        }

        var createdCustomer = await _customerService.CreateCustomerAsync(newCustomer);

        return CreatedAtAction(nameof(GetCustomerById), new{id = createdCustomer.Id}, createdCustomer);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Customer updatedCustomer)
    {
      if(updatedCustomer == null)
        {
            return BadRequest("Datele nu pot fi nule.");
        }

        var existingCustomer = await _customerService.GetCustomerByEmailAsync(updatedCustomer.Email);
        if (existingCustomer != null && existingCustomer.Id != id)
        {
            return Conflict($"Email-ul {updatedCustomer.Email} este deja folosit de un alt client.");
        }

        var isSucces = await _customerService.UpdateCustomerAsync(id, updatedCustomer);

        if (!isSucces)
        {
            return NotFound($"Clientul nu a fost găsit");
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var isDeleted = await _customerService.DeleteCustomerAsync(id);

        if (!isDeleted)
        {
            return NotFound($"Clientul nu a fost găsit");
        }

        return NoContent();
    }
}