using Backend.Models;

namespace Backend.Interfaces;

public interface IPaymentService
{
    Task<IEnumerable<Payment>> GetAllPaymentsAsync();
    Task<Payment?> GetPaymentByIdAsync(int id);
    Task<Payment?> GetPaymentByAppointmentIdAsync(int appointmentId);
    Task<IEnumerable<Payment>> GetPaymentsByDateAsync(DateTime paymentDate);
    Task<IEnumerable<Payment>> GetPaymentsByTypeAsync(string paymentType);

    Task<Payment> CreatePaymentAsync(Payment payment);
    Task<bool> UpdatePaymentAsync(int id, Payment payment);
    Task<bool> DeletePaymentAsync(int id);
}