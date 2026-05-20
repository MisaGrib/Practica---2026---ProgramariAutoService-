using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class SelectUser
{
    public int Id { get; set; }

    public string Email { get; set; } = null!;

    public string Name { get; set; } = null!;
}
