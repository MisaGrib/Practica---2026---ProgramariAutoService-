using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Payment
{
    public int Id { get; set; }

    public int AppointmentId { get; set; }

    public DateTime PaymentDate { get; set; }

    public string PaymentType { get; set; } = null!;

    public decimal Amount { get; set; }

    public virtual Appointment Appointment { get; set; } = null!;
}
