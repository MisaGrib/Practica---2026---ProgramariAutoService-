using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class SelectAppointment
{
    public int Id { get; set; }

    public string AppointmentCode { get; set; } = null!;

    public string Customer { get; set; } = null!;

    public string LicensePlate { get; set; } = null!;

    public string Mechanic { get; set; } = null!;

    public string ServiceName { get; set; } = null!;

    public decimal ServicePrice { get; set; }

    public DateTime ScheduledDate { get; set; }

    public string? ProblemDescription { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
