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

    public async Task<IEnumerable<SelectAppointment>> GetAllAppointmentsDetailsAsync()
    {
        return await _context.SelectAppointments.ToListAsync();
    }

    public async Task<SelectAppointment?> GetAppointmentDetailsByCodeAsync(string code)
    {
        return await _context.SelectAppointments.FirstOrDefaultAsync(a => a.AppointmentCode == code);
    }

    public async Task<IEnumerable<SelectAppointment>> GetAppointmentsDetailsByCustomerNameAsync(string customerName)
    {
        return await _context.SelectAppointments.Where(a => a.Customer == customerName).ToListAsync();
    }

    public async Task<IEnumerable<SelectAppointment>> GetAppointmentsDetailsByVehicleLicensePlateAsync(string licensePlate)
    {
        return await _context.SelectAppointments.Where(a => a.LicensePlate == licensePlate).ToListAsync();
    }

    public async Task<IEnumerable<SelectAppointment>> GetAppointmentsDetailsByMechanicNameAsync(string mechanicName)
    {
        return await _context.SelectAppointments.Where(a => a.Mechanic == mechanicName).ToListAsync();
    }

    public async Task<IEnumerable<SelectAppointment>> GetAppointmentsDetailsByServiceNameAsync(string serviceName)
    {
        return await _context.SelectAppointments.Where(a => a.ServiceName == serviceName).ToListAsync();
    }

    public async Task<IEnumerable<SelectAppointment>> GetAppointmentsDetailsByScheduledDateAsync(DateTime scheduledDate)
    {
        return await _context.SelectAppointments.Where(a => a.ScheduledDate.Date == scheduledDate.Date).ToListAsync();
    }

    public async Task<IEnumerable<SelectAppointment>> GetAppointmentsDetailsByStatusAsync(string status)
    {
        return await _context.SelectAppointments.Where(a => a.Status == status).ToListAsync();
    }


   private async Task<string> GenerateUniqueAppointmentCodeAsync()
    {
        string code;

        int nrAppointmentsDay = await _context.Appointments.CountAsync(s => s.CreatedAt.Date == DateTime.Now.Date) + 1;


        code = $"APP-{DateTime.Now:yyyyMMdd}-{nrAppointmentsDay:D3}";

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

        if (appointment.Status == "Complet" && DateTime.Now < appointment.ScheduledDate)
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

        if (status == "Complet" && DateTime.Now < existingAppointment.ScheduledDate)
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
