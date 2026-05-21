using Backend.Models;

namespace Backend.Interfaces;

public interface IAppointmentsService
{
    Task<IEnumerable<Appointment>> GetAllAppointmentsAsync();
    Task<Appointment?> GetAppointmentByIdAsync(int id);
    Task<Appointment?> GetAppointmentByCodeAsync(string code);
    Task<IEnumerable<Appointment>> GetAppointmentsByCustomerIdAsync(int customerId);
    Task<IEnumerable<Appointment>> GetAppointmentsByVehicleIdAsync(int vehicleId);
    Task<IEnumerable<Appointment>> GetAppointmentsByMechanicIdAsync(int mechanicId);
    Task<IEnumerable<Appointment>> GetAppointmentsByServiceIdAsync(int serviceId);
    Task<IEnumerable<Appointment>> GetAppointmentsByScheduledDateAsync(DateTime scheduledDate);
    Task<IEnumerable<Appointment>> GetAppointmentsByStatusAsync(string status);
     
    Task<Appointment> CreateAppointmentAsync(Appointment appointment);
    Task<bool> UpdateAppointmentAsync(int id, Appointment appointment);
    Task<bool> UpdateAppointmentStatusAsync(int id, string status);
    Task<bool> DeleteAppointmentAsync(int id);


}