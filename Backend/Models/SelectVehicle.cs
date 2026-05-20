using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class SelectVehicle
{
    public int Id { get; set; }

    public string LicensePlate { get; set; } = null!;

    public string Brand { get; set; } = null!;

    public string Model { get; set; } = null!;

    public string Series { get; set; } = null!;

    public string Customer { get; set; } = null!;
}
