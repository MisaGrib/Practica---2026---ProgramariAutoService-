using Backend.Models;
using Backend.Interfaces;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;


public class AppointmentsService : IAppointmentsService
{
    private readonly AutoServiceAppointmentsContext _context;

    public AppointmentsService(AutoServiceAppointmentsContext context)
    {
            _context = context;
 
    }


    public async Task<IEnumerable<Appointment>> GetAllAppointmentsAsync()
    {
    return await _context.Appointments.ToListAsync();
    }

    public async Task<Appointment?> GetAppointmentByIdAsync(int id)
    {
        return await _context.Appointments.FindAsync(id);
    }

    public async Task<Appointment?> GetAppointmentByCodeAsync(string code)
    {
        return await _context.Appointments.FirstOrDefaultAsync(a => a.AppointmentCode == code);
    }

    public async Task<IEnumerable<Appointment>> GetAppointmentsByCustomerIdAsync(int customerId)
    {
        return await _context.Appointments.Where(a => a.CustomerId == customerId).ToListAsync();
    }

    public async Task<IEnumerable<Appointment>> GetAppointmentsByVehicleIdAsync(int vehicleId)
    {
        return await _context.Appointments.Where(a => a.VehicleId == vehicleId).ToListAsync();
    }

    public async Task<IEnumerable<Appointment>> GetAppointmentsByMechanicIdAsync(int mechanicId)
    {
        return await _context.Appointments.Where(a => a.MechanicId == mechanicId).ToListAsync();
    }

    public async Task<IEnumerable<Appointment>> GetAppointmentsByServiceIdAsync(int serviceId)
    {
        return await _context.Appointments.Where(a => a.ServiceId == serviceId).ToListAsync();
    }

    public async Task<IEnumerable<Appointment>> GetAppointmentsByScheduledDateAsync(DateTime scheduledDate)
    {
        return await _context.Appointments.Where(a => a.ScheduledDate.Date == scheduledDate.Date).ToListAsync();
    }

    public async Task<IEnumerable<Appointment>> GetAppointmentsByStatusAsync(string status)
    {
        return await _context.Appointments.Where(a => a.Status == status).ToListAsync();
    }


   private async Task<string> GenerateUniqueAppointmentCodeAsync()
    {
        string code;

        int nrAppointmentsDay = await _context.Appointments.CountAsync(s => s.CreatedAt.Date == DateTime.Now.Date) + 1;


        code = $"App-{DateTime.Now:yyyyMMdd}-{nrAppointmentsDay}";

        return code;
    
    }


    public async Task<Appointment> CreateAppointmentAsync(Appointment appointment)
    {
        string appointmentCode = await  GenerateUniqueAppointmentCodeAsync();
        appointment.AppointmentCode = appointmentCode;
        appointment.CreatedAt = DateTime.Now;
        appointment.Status = "Programat";


        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }

    public async Task<bool> UpdateAppointmentAsync(int id, Appointment appointment)
    {
        var existingAppointment = await _context.Appointments.FindAsync(id);

        if(existingAppointment == null)
        {
            return false;
        }
 
            existingAppointment.CustomerId = appointment.CustomerId;
            existingAppointment.VehicleId = appointment.VehicleId;
            existingAppointment.MechanicId = appointment.MechanicId;
            existingAppointment.ServiceId = appointment.ServiceId;
            existingAppointment.ScheduledDate = appointment.ScheduledDate;
            existingAppointment.ProblemDescription = appointment.ProblemDescription;
            existingAppointment.Status = appointment.Status;
            existingAppointment.UpdatedAt = DateTime.Now;


       await _context.SaveChangesAsync();
       return true;
    }

    public async Task<bool> UpdateAppointmentStatusAsync(int id, string status)
    {
        var existingAppointment = await _context.Appointments.FindAsync(id);

        if(existingAppointment == null)
        {
            return false;
        }

        existingAppointment.Status = status;
        existingAppointment.UpdatedAt = DateTime.Now;

         await _context.SaveChangesAsync();
         return true;
    }
  
    public async Task<bool> DeleteAppointmentAsync(int id)
    {
        var existingAppointment = await _context.Appointments.FindAsync(id);

        if(existingAppointment == null)
        {
            return false;
        }

        _context.Appointments.Remove(existingAppointment);

        await _context.SaveChangesAsync();
        return true;
    }


}