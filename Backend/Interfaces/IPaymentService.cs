using Backend.Models;

namespace Backend.Interfaces;

public interface IPaymentService
{
    Task<IEnumerable<Payment>> GetAllPaymentsAsync();
    Task<Payment?> GetPaymentByIdAsync(int id);
    Task<IEnumerable<SelectPayment>> GetAllSelectPaymetsDetailsAsync(); 
    Task<SelectPayment?> GetPaymentDetailsByAppointmentCodeAsync(string appointmentCode);
    Task<IEnumerable<SelectPayment>> GetPaymentsDetailsByDateAsync(DateTime paymentDate);
    Task<IEnumerable<SelectPayment>> GetPaymentsDetailsByTypeAsync(string paymentType);

    Task<Payment> CreatePaymentAsync(Payment payment);
    Task<bool> UpdatePaymentAsync(int id, Payment payment);
    Task<bool> DeletePaymentAsync(int id);
}