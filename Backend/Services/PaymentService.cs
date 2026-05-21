using Backend.Interfaces;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class PaymentService : IPaymentService
{
    private readonly AutoServiceAppointmentsContext _context;

    public PaymentService(AutoServiceAppointmentsContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Payment>> GetAllPaymentsAsync()
    {
        return await _context.Payments.ToListAsync();
    }

    public async Task<Payment?> GetPaymentByIdAsync(int id)
    {
        return await _context.Payments.FindAsync(id);
    }

    public async Task<Payment?> GetPaymentByAppointmentIdAsync(int appointmentId)
    {
        return await _context.Payments.FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);
    }

    public async Task<IEnumerable<Payment>> GetPaymentsByDateAsync(DateTime paymentDate)
    {
        return await _context.Payments.Where(p => p.PaymentDate.Date == paymentDate.Date).ToListAsync();
    
    }

    public async Task<IEnumerable<Payment>> GetPaymentsByTypeAsync(string paymentType)
    {
        return await _context.Payments.Where(p => p.PaymentType == paymentType).ToListAsync();
    }

    public async Task<Payment> CreatePaymentAsync(Payment payment)
    {
        payment.PaymentDate = DateTime.Now;

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
        return payment;
    }

    public async Task<bool> UpdatePaymentAsync(int id, Payment payment)
    {
        var existingPayment = await _context.Payments.FindAsync(id);

        if (existingPayment == null)
        {
            return false;
        }

        existingPayment.AppointmentId = payment.AppointmentId;
        existingPayment.PaymentDate = payment.PaymentDate;
        existingPayment.PaymentType = payment.PaymentType;
        existingPayment.Amount = payment.Amount;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeletePaymentAsync(int id)
    {
        var existingPayment = await _context.Payments.FindAsync(id);
        
        if(existingPayment == null)
        {
            return false;
        }

        _context.Payments.Remove(existingPayment);
        await _context.SaveChangesAsync();
        return true;
    }
}

