using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Vehicle
{
    public int Id { get; set; }

    public string LicensePlate { get; set; } = null!;

    public string Brand { get; set; } = null!;

    public string Model { get; set; } = null!;

    public string Series { get; set; } = null!;

    public int CustomerId { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual Customer Customer { get; set; } = null!;
}
