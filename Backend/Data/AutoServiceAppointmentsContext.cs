using System;
using System.Collections.Generic;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public partial class AutoServiceAppointmentsContext : DbContext
{
    public AutoServiceAppointmentsContext()
    {
    }

    public AutoServiceAppointmentsContext(DbContextOptions<AutoServiceAppointmentsContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Appointment> Appointments { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Mechanic> Mechanics { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<SelectAppointment> SelectAppointments { get; set; }

    public virtual DbSet<SelectCustomer> SelectCustomers { get; set; }

    public virtual DbSet<SelectMechanic> SelectMechanics { get; set; }

    public virtual DbSet<SelectPayment> SelectPayments { get; set; }

    public virtual DbSet<SelectRole> SelectRoles { get; set; }

    public virtual DbSet<SelectService> SelectServices { get; set; }

    public virtual DbSet<SelectUser> SelectUsers { get; set; }

    public virtual DbSet<SelectVehicle> SelectVehicles { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }

   
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Appointm__3214EC0792CAB094");

            entity.HasIndex(e => new { e.MechanicId, e.ScheduledDate }, "UQ_Appointments_Mechanic_ScheduledDate").IsUnique();

            entity.HasIndex(e => e.AppointmentCode, "UQ__Appointm__F67FE26FE247CE66").IsUnique();

            entity.Property(e => e.AppointmentCode).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.ScheduledDate).HasColumnType("datetime");
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Customer).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Appointme__Custo__4E88ABD4");

            entity.HasOne(d => d.Mechanic).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.MechanicId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Appointme__Mecha__5070F446");

            entity.HasOne(d => d.Service).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Appointme__Servi__5165187F");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.VehicleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Appointme__Vehic__4F7CD00D");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Customer__3214EC07BAAFAB44");

            entity.HasIndex(e => e.Phone, "UQ__Customer__5C7E359E0971D7AA").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Customer__A9D10534999F1970").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.Phone).HasMaxLength(13);

            entity.HasOne(d => d.User).WithMany(p => p.Customers)
                .HasForeignKey(d => d.UserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Customers__UserI__3F466844");
        });

        modelBuilder.Entity<Mechanic>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Mechanic__3214EC072AD2380F");

            entity.HasIndex(e => e.Phone, "UQ__Mechanic__5C7E359E6BEEB017").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Mechanic__A9D10534D55F24C4").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.Phone).HasMaxLength(13);

            entity.HasOne(d => d.User).WithMany(p => p.Mechanics)
                .HasForeignKey(d => d.UserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mechanics__UserI__440B1D61");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Payments__3214EC07749FD99F");

            entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.PaymentDate).HasColumnType("datetime");
            entity.Property(e => e.PaymentType).HasMaxLength(50);

            entity.HasOne(d => d.Appointment).WithMany(p => p.Payments)
                .HasForeignKey(d => d.AppointmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payments__Appoin__5535A963");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Roles__3214EC0790480B14");

            entity.Property(e => e.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<SelectAppointment>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("SelectAppointments");

            entity.Property(e => e.AppointmentCode).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Customer).HasMaxLength(101);
            entity.Property(e => e.LicensePlate).HasMaxLength(10);
            entity.Property(e => e.Mechanic).HasMaxLength(101);
            entity.Property(e => e.ScheduledDate).HasColumnType("datetime");
            entity.Property(e => e.ServiceName).HasMaxLength(50);
            entity.Property(e => e.ServicePrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
        });

        modelBuilder.Entity<SelectCustomer>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("SelectCustomers");

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.Phone).HasMaxLength(13);
        });

        modelBuilder.Entity<SelectMechanic>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("SelectMechanics");

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.Phone).HasMaxLength(13);
        });

        modelBuilder.Entity<SelectPayment>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("SelectPayments");

            entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.AppointmentCode).HasMaxLength(50);
            entity.Property(e => e.PaymentDate).HasColumnType("datetime");
            entity.Property(e => e.PaymentType).HasMaxLength(50);
        });

        modelBuilder.Entity<SelectRole>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("SelectRoles");

            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<SelectService>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("SelectServices");

            entity.Property(e => e.Description).HasMaxLength(200);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Name).HasMaxLength(50);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
        });

        modelBuilder.Entity<SelectUser>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("SelectUsers");

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<SelectVehicle>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("SelectVehicles");

            entity.Property(e => e.Brand).HasMaxLength(30);
            entity.Property(e => e.Customer).HasMaxLength(101);
            entity.Property(e => e.LicensePlate).HasMaxLength(10);
            entity.Property(e => e.Model).HasMaxLength(30);
            entity.Property(e => e.Series).HasMaxLength(20);
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Services__3214EC07389596D9");

            entity.Property(e => e.Description).HasMaxLength(200);
            entity.Property(e => e.Name).HasMaxLength(50);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC07DBFBC2C9");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D1053458571F08").IsUnique();

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Users__RoleId__3A81B327");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Vehicles__3214EC07ABE2B2ED");

            entity.HasIndex(e => e.LicensePlate, "UQ__Vehicles__026BC15C8AD9343A").IsUnique();

            entity.Property(e => e.Brand).HasMaxLength(30);
            entity.Property(e => e.LicensePlate).HasMaxLength(10);
            entity.Property(e => e.Model).HasMaxLength(30);
            entity.Property(e => e.Series).HasMaxLength(20);

            entity.HasOne(d => d.Customer).WithMany(p => p.Vehicles)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Vehicles__Custom__47DBAE45");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
