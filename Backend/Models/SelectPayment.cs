using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class SelectPayment
{
    public int Id { get; set; }

    public string? AppointmentCode { get; set; }

    public DateTime PaymentDate { get; set; }

    public string PaymentType { get; set; } = null!;

    public decimal Amount { get; set; }
}
