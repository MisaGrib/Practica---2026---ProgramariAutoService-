using Backend.Models;

namespace Backend.Interfaces;

public interface IAppointmentsService
{
    Task<IEnumerable<Appointment>> GetAllAppointmentsAsync();
    Task<Appointment?> GetAppointmentByIdAsync(int id);

    Task<IEnumerable<SelectAppointment>> GetAllAppointmentsDetailsAsync();
    Task<SelectAppointment?> GetAppointmentDetailsByCodeAsync(string code);
    Task<IEnumerable<SelectAppointment>> GetAppointmentsDetailsByCustomerNameAsync(string CustomerName);
    Task<IEnumerable<SelectAppointment>> GetAppointmentsDetailsByVehicleLicensePlateAsync(string licensePlate);
    Task<IEnumerable<SelectAppointment>> GetAppointmentsDetailsByMechanicNameAsync(string mechanicName);
    Task<IEnumerable<SelectAppointment>> GetAppointmentsDetailsByServiceNameAsync(string serviceName);
    Task<IEnumerable<SelectAppointment>> GetAppointmentsDetailsByScheduledDateAsync(DateTime scheduledDate);
    Task<IEnumerable<SelectAppointment>> GetAppointmentsDetailsByStatusAsync(string status);
     
    Task<Appointment> CreateAppointmentAsync(Appointment appointment);
    Task<bool> UpdateAppointmentAsync(int id, Appointment appointment);
    Task<bool> UpdateAppointmentStatusAsync(int id, string status);
    Task<bool> DeleteAppointmentAsync(int id);


}