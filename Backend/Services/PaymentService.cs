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

    public async Task<IEnumerable<SelectPayment>> GetAllSelectPaymetsDetailsAsync()
    {
        return await _context.SelectPayments.ToListAsync();
    }

    public async Task<SelectPayment?> GetPaymentDetailsByAppointmentCodeAsync(string appointmentCode)
    {
        return await _context.SelectPayments.FirstOrDefaultAsync(sp => sp.AppointmentCode == appointmentCode);
    }

    public async Task<IEnumerable<SelectPayment>> GetPaymentsDetailsByDateAsync(DateTime paymentDate)
    {
        return await _context.SelectPayments.Where(sp => sp.PaymentDate.Date == paymentDate.Date).ToListAsync();
    }

    public async Task<IEnumerable<SelectPayment>> GetPaymentsDetailsByTypeAsync(string paymentType)
    {
        return await _context.SelectPayments.Where(sp => sp.PaymentType == paymentType).ToListAsync();
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

