CREATE DATABASE AutoServiceAppointments
GO 

USE AutoServiceAppointments

GO

CREATE TABLE Roles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL
);

CREATE TABLE Users(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    RoleId INT NOT NULL,

    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

CREATE TABLE Customers(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Phone NVARCHAR(13) UNIQUE NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    UserId INT NOT NULL,

    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE TABLE Mechanics(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Phone NVARCHAR(13) UNIQUE NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    UserId INT NOT NULL,

    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE TABLE Vehicles(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    LicensePlate NVARCHAR(10) UNIQUE NOT NULL,
    Brand NVARCHAR(30) NOT NULL,
    Model NVARCHAR(30) NOT NULL,
    Series NVARCHAR(20) NOT NULL,
    CustomerId INT NOT NULL,

    FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
);

CREATE TABLE Services(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(200) NOT NULL,
    Price DECIMAL(10,2) NOT NULL
);

CREATE TABLE Appointments(
    Id INT IDENTITY(1,1) PRIMARY KEY,

    AppointmentCode NVARCHAR(50) UNIQUE NOT NULL,

    CustomerId INT NOT NULL,
    VehicleId INT NOT NULL,
    MechanicId INT NOT NULL,
    ServiceId INT NOT NULL,

    ScheduledDate DATETIME NOT NULL,

    ProblemDescription NVARCHAR(MAX) NULL,

    Status NVARCHAR(50)
    CHECK (Status IN ('Programat', 'În progres', 'Complet', 'Anulat')) NOT NULL,

    CreatedAt DATETIME NOT NULL,

    FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id),
    FOREIGN KEY (MechanicId) REFERENCES Mechanics(Id),
    FOREIGN KEY (ServiceId) REFERENCES Services(Id)
);

CREATE TABLE Payments(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    AppointmentId INT NOT NULL,
    PaymentDate DATETIME NOT NULL,
    PaymentType NVARCHAR(50)
    CHECK (PaymentType IN ('Numerar', 'Card')) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id)
);

