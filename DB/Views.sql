USE AutoServiceAppointments

GO

CREATE VIEW SelectRoles
AS 
SELECT Id, Name FROM Roles

GO

SELECT * FROM SelectRoles

GO
CREATE VIEW SelectUsers
AS
SELECT u.Id, u.Email, r.Name FROM Users u 
JOIN Roles r ON u.RoleId = r.Id

GO

SELECT * FROM SelectUsers

GO

CREATE VIEW SelectCustomers 
AS
SELECT Id, FirstName, LastName, Phone, Email FROM Customers

GO

SELECT * FROM SelectCustomers

GO

CREATE VIEW SelectMechanics
AS
SELECT Id, FirstName, LastName, Phone, Email FROM Mechanics

GO

SELECT * FROM SelectMechanics

GO

CREATE VIEW SelectVehicles 
AS
SELECT v.Id, v.LicensePlate, v.Brand, v.Model, v.Series, CONCAT(c.FirstName, ' ', c.LastName) AS Customer FROM Vehicles v
JOIN Customers c ON v.CustomerId = c.Id

GO

SELECT * FROM SelectVehicles

GO

CREATE VIEW SelectServices 
AS
SELECT Id, Name, Description, Price FROM Services

GO

SELECT * FROM SelectServices
GO 

CREATE VIEW SelectAppointments
AS
SELECT  a.Id, 
        a.AppointmentCode,
        CONCAT(c.FirstName, ' ', c.LastName) AS Customer,
        v.LicensePlate, 
        CONCAT(m.FirstName, ' ', m.LastName) AS Mechanic,
        a.ScheduledDate,
        a.ProblemDescription,
        a.Status,
        a.CreatedAt
        FROM Appointments a
        JOIN Customers c ON a.CustomerId = c.Id
        JOIN Vehicles v on a.VehicleId = v.Id
        JOIN Mechanics m ON a.MechanicId = m.Id

GO

SELECT * FROM SelectAppointments

GO

CREATE VIEW SelectPayments
AS
SELECT p.Id, a.AppointmentCode, p.PaymentDate, p.PaymentType, p.Amount FROM Payments p
LEFT JOIN Appointments a ON p.AppointmentId = a.Id 

GO

SELECT * FROM SelectPayments


        use master