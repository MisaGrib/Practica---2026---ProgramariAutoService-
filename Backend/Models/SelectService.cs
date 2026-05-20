using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class SelectService
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = null!;

    public decimal Price { get; set; }
}
