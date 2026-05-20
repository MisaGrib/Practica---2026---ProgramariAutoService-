using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Appointment
{
    public int Id { get; set; }

    public string AppointmentCode { get; set; } = null!;

    public int CustomerId { get; set; }

    public int VehicleId { get; set; }

    public int MechanicId { get; set; }

    public int ServiceId { get; set; }

    public DateTime ScheduledDate { get; set; }

    public string? ProblemDescription { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual Mechanic Mechanic { get; set; } = null!;

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Service Service { get; set; } = null!;

    public virtual Vehicle Vehicle { get; set; } = null!;
}
