using Backend.Models;
using Backend.Interfaces;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Services;


public class CustomerService : ICustomerService
{
    private const int ClientRoleId = 2;
    private readonly AutoServiceAppointmentsContext _context;

    public CustomerService(AutoServiceAppointmentsContext context)
    {
            _context = context;
 
    }


    public async Task<IEnumerable<Customer>> GetAllCustomersAsync()
    {
    return await _context.Customers.ToListAsync();
    }

    public async Task<Customer?> GetCustomerByIdAsync(int id)
    {
        return await _context.Customers.FindAsync(id);
    }

    public async Task<Customer?> GetCustomerByEmailAsync(string email)
    {
        return await _context.Customers.FirstOrDefaultAsync(c => c.Email == email);
    }

    public async Task<Customer> CreateCustomerAsync(Customer customer)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == customer.Email);

        customer.UserId = user?.Id;
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return customer;
    }

    public async Task<bool> UpdateCustomerAsync(int id, Customer customer)
    {
        var existingCustomer = await _context.Customers.FindAsync(id);

        if(existingCustomer == null)
        {
            return false;
        }
 
       existingCustomer.FirstName = customer.FirstName;
       existingCustomer.LastName = customer.LastName;
       existingCustomer.Phone = customer.Phone;
       existingCustomer.Email = customer.Email;

       var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == customer.Email);
       existingCustomer.UserId = user?.Id;

       await _context.SaveChangesAsync();
       return true;
    }

    public async Task<bool> DeleteCustomerAsync(int id)
    {
        var existingCustomer = await _context.Customers.FindAsync(id);

        if(existingCustomer == null)
        {
            return false;
        }

        _context.Customers.Remove(existingCustomer);

        await _context.SaveChangesAsync();
        return true;
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
