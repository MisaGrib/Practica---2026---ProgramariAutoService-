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

    private static int GetDurationMinutesForService(Service service)
    {
        if (service == null) return 60;

        var normalized = service.Name.ToLowerInvariant();
        if ((normalized.Contains("revizie") || normalized.Contains("service")) || (normalized.Contains("schimbare") && normalized.Contains("ulei")))
        {
            return 120;
        }

        if (normalized.Contains("diagnostic") || normalized.Contains("verificare") || normalized.Contains("consult"))
        {
            return 60;
        }

        if (normalized.Contains("frâne") || normalized.Contains("ambreiaj") || normalized.Contains("cutie"))
        {
            return 180;
        }

        if (service.Price >= 2500)
        {
            return 180;
        }

        return 90;
    }

    private static bool AreScheduledDatesEqual(DateTime left, DateTime right)
    {
        return left.ToUniversalTime() == right.ToUniversalTime();
    }

    private async Task<int> GetServiceDurationMinutesAsync(int serviceId)
    {
        var service = await _context.Services.FindAsync(serviceId);
        return GetDurationMinutesForService(service!);
    }

    private static bool IntervalsOverlap(DateTime startA, DateTime endA, DateTime startB, DateTime endB)
    {
        return startA < endB && startB < endA;
    }

    private static bool TryGetWorkingHours(DateTime date, out TimeSpan opening, out TimeSpan closing)
    {
        if (date.DayOfWeek >= DayOfWeek.Monday && date.DayOfWeek <= DayOfWeek.Friday)
        {
            opening = new TimeSpan(8, 0, 0);
            closing = new TimeSpan(18, 0, 0);
            return true;
        }

        if (date.DayOfWeek == DayOfWeek.Saturday)
        {
            opening = new TimeSpan(9, 0, 0);
            closing = new TimeSpan(14, 0, 0);
            return true;
        }

        opening = TimeSpan.Zero;
        closing = TimeSpan.Zero;
        return false;
    }

    private static void ValidateWithinWorkingHours(DateTime scheduledDate, int durationMinutes)
    {
        if (!TryGetWorkingHours(scheduledDate, out var opening, out var closing))
        {
            throw new InvalidOperationException("Duminica service-ul este inchis. Alege o zi de luni pana sambata.");
        }

        var start = scheduledDate.TimeOfDay;
        var end = scheduledDate.AddMinutes(durationMinutes);

        if (end.Date != scheduledDate.Date || start < opening || end.TimeOfDay > closing)
        {
            throw new InvalidOperationException("Programarea trebuie sa incapa in orarul service-ului: luni-vineri 08:00-18:00, sambata 09:00-14:00, duminica inchis.");
        }
    }

    private async Task<bool> HasMechanicScheduleConflictAsync(int mechanicId, DateTime scheduledDate, int serviceId, int? excludeAppointmentId = null)
    {
        var duration = await GetServiceDurationMinutesAsync(serviceId);
        var newEnd = scheduledDate.AddMinutes(duration);

        var existingAppointments = await _context.Appointments
            .Include(a => a.Service)
            .Where(a => a.MechanicId == mechanicId && a.Id != excludeAppointmentId && a.Status != "Anulat")
            .ToListAsync();

        foreach (var existing in existingAppointments)
        {
            var existingDuration = existing.Service != null ? GetDurationMinutesForService(existing.Service) : 90;
            var existingEnd = existing.ScheduledDate.AddMinutes(existingDuration);
            if (IntervalsOverlap(scheduledDate, newEnd, existing.ScheduledDate, existingEnd))
            {
                return true;
            }
        }

        return false;
    }

    private async Task ValidateAppointmentScheduleAsync(Appointment appointment, int? excludeAppointmentId = null)
    {
        if (appointment.CustomerId <= 0 || appointment.VehicleId <= 0 || appointment.MechanicId <= 0 || appointment.ServiceId <= 0)
        {
            throw new InvalidOperationException("Selecteaza clientul, vehiculul, mecanicul si serviciul.");
        }

        var customerExists = await _context.Customers.AnyAsync(c => c.Id == appointment.CustomerId);
        var mechanicExists = await _context.Mechanics.AnyAsync(m => m.Id == appointment.MechanicId);
        var serviceExists = await _context.Services.AnyAsync(s => s.Id == appointment.ServiceId);
        var vehicleMatchesCustomer = await _context.Vehicles.AnyAsync(v => v.Id == appointment.VehicleId && v.CustomerId == appointment.CustomerId);

        if (!customerExists || !mechanicExists || !serviceExists || !vehicleMatchesCustomer)
        {
            throw new InvalidOperationException("Datele selectate pentru programare nu sunt valide.");
        }
        if (appointment.ScheduledDate <= DateTime.Now)
        {
            throw new InvalidOperationException("Nu poți programa sau modifica o programare în trecut.");
        }

        var duration = await GetServiceDurationMinutesAsync(appointment.ServiceId);
        ValidateWithinWorkingHours(appointment.ScheduledDate, duration);

        if (await HasMechanicScheduleConflictAsync(appointment.MechanicId, appointment.ScheduledDate, appointment.ServiceId, excludeAppointmentId))
        {
            throw new InvalidOperationException("Mecanicul nu este liber în acest interval. Alege o altă oră sau un alt mecanic.");
        }
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


   private async Task<string> GenerateUniqueAppointmentCodeAsync(DateTime createdAt)
    {
        var prefix = $"APP-{createdAt:yyyyMMdd}-";
        var existingCodes = await _context.Appointments
            .Where(a => a.AppointmentCode.StartsWith(prefix))
            .Select(a => a.AppointmentCode)
            .ToListAsync();

        var nextNumber = existingCodes
            .Select(code => int.TryParse(code.Substring(prefix.Length), out var number) ? number : 0)
            .DefaultIfEmpty(0)
            .Max() + 1;

        string newCode;
        do
        {
            newCode = $"{prefix}{nextNumber:D3}";
            nextNumber++;
        }
        while (existingCodes.Contains(newCode));

        return newCode;
    }


    public async Task<Appointment> CreateAppointmentAsync(Appointment appointment)
    {
        await ValidateAppointmentScheduleAsync(appointment);

        appointment.CreatedAt = DateTime.Now;
        appointment.AppointmentCode = await GenerateUniqueAppointmentCodeAsync(appointment.CreatedAt);
        appointment.Status = "Programat";

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }

    public async Task<bool> UpdateAppointmentAsync(int id, Appointment appointment)
    {
        var existingAppointment = await _context.Appointments.FindAsync(id);

        if (existingAppointment == null)
        {
            return false;
        }

        if ((appointment.Status == "În progres" || appointment.Status == "Complet") && DateTime.Now < appointment.ScheduledDate)
        {
            throw new InvalidOperationException("Nu poți marca o programare ca 'În progres' sau 'Complet' înainte de ora programată.");
        }

        if (!string.Equals(appointment.ProblemDescription, existingAppointment.ProblemDescription, StringComparison.Ordinal) &&
            DateTime.Now < existingAppointment.ScheduledDate)
        {
            throw new InvalidOperationException("Nu poți adăuga o descriere înainte de ora programată.");
        }

        var scheduleChanged = !AreScheduledDatesEqual(appointment.ScheduledDate, existingAppointment.ScheduledDate)
            || appointment.MechanicId != existingAppointment.MechanicId
            || appointment.ServiceId != existingAppointment.ServiceId;

        var appointmentDataChanged = scheduleChanged
            || appointment.CustomerId != existingAppointment.CustomerId
            || appointment.VehicleId != existingAppointment.VehicleId;

        if (appointmentDataChanged)
        {
            await ValidateAppointmentScheduleAsync(appointment, id);
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

        if (existingAppointment == null)
        {
            return false;
        }

        if ((status == "În progres" || status == "Complet") && DateTime.Now < existingAppointment.ScheduledDate)
        {
            throw new InvalidOperationException("Statusul nu poate fi schimbat la 'În progres' sau 'Complet' înainte de data programată.");
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
