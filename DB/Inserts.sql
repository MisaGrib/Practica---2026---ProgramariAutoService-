USE AutoServiceAppointments

GO

-- ROLES
INSERT INTO Roles(Name)
VALUES
('Admin'),
('Client'),
('Mecanic');

GO

SELECT * FROM Roles
 go 

USE AutoServiceAppointments;
GO


-- USERS
INSERT INTO Users(Email, PasswordHash, RoleId)
VALUES
('admin@autoservice.md', 'JAvlGPq9JyTdtvBO6x2llnRI1+gxwIyPqCKAn3THIKk=', 1),

('ion.ceban@gmail.com', 'GGR0wfLC9zWlTCz4Lujofypc0wlA4oACk2P+zt/FMow=', 2),
('vasile.rusu@gmail.com', 'GGR0wfLC9zWlTCz4Lujofypc0wlA4oACk2P+zt/FMow=', 2),
('mariana.balan@gmail.com', 'GGR0wfLC9zWlTCz4Lujofypc0wlA4oACk2P+zt/FMow=', 2),
('sergiu.cojocaru@gmail.com', 'GGR0wfLC9zWlTCz4Lujofypc0wlA4oACk2P+zt/FMow=', 2),
('ana.munteanu@gmail.com', 'GGR0wfLC9zWlTCz4Lujofypc0wlA4oACk2P+zt/FMow=', 2),

('mihai.rotaru@service.md', 'UI5ztGMIhvYChTQBhapZHx3TuVHg/JrCcZUcV8vAS+4=', 3),
('victor.topala@service.md', 'UI5ztGMIhvYChTQBhapZHx3TuVHg/JrCcZUcV8vAS+4=', 3),
('dorin.spinu@service.md', 'UI5ztGMIhvYChTQBhapZHx3TuVHg/JrCcZUcV8vAS+4=', 3);

GO

SELECT * FROM Users
GO

-- CUSTOMERS
INSERT INTO Customers(FirstName, LastName, Phone, Email, UserId)
VALUES
('Ion', 'Ceban', '069111111', 'ion.ceban@gmail.com', 2),
('Vasile', 'Rusu', '069222222', 'vasile.rusu@gmail.com', 3),
('Mariana', 'Balan', '069333333', 'mariana.balan@gmail.com', 4),
('Sergiu', 'Cojocaru', '069444444', 'sergiu.cojocaru@gmail.com', 5),
('Ana', 'Munteanu', '069555555', 'ana.munteanu@gmail.com', 6);

GO

-- MECHANICS
INSERT INTO Mechanics(FirstName, LastName, Phone, Email, UserId)
VALUES
('Mihai', 'Rotaru', '068111111', 'mihai.rotaru@service.md', 7),
('Victor', 'Topala', '068222222', 'victor.topala@service.md', 8),
('Dorin', 'Spinu', '068333333', 'dorin.spinu@service.md', 9);

GO

-- VEHICLES
INSERT INTO Vehicles(LicensePlate, Brand, Model, Series, CustomerId)
VALUES
('BL AA 001', 'BMW', 'X5', 'F15', 1),
('BL BB 002', 'Audi', 'A6', 'C7', 2),
('BL CC 003', 'Mercedes', 'E220', 'W212', 3),
('BL DD 004', 'Toyota', 'Corolla', '2020', 4),
('BL EE 005', 'Volkswagen', 'Passat', 'B8', 5),
('BL FF 006', 'Skoda', 'Octavia', 'A7', 1),
('BL GG 007', 'Dacia', 'Duster', '2021', 2),
('BL HH 008', 'Ford', 'Focus', 'MK3', 3);

GO

-- SERVICES
INSERT INTO Services(Name, Description, Price)
VALUES
('Schimb ulei', 'Schimbarea uleiului si a filtrului', 1200),
('Schimb anvelope', 'Montarea si echilibrarea anvelopelor', 800),
('Diagnoza computerizata', 'Verificare electronica completa', 600),
('Reparatie suspensie', 'Reparatia sistemului de suspensie', 3500),
('Schimb placute frana', 'Inlocuire placute de frana', 1500),
('Verificare baterie', 'Testarea bateriei auto', 300),
('Revizie tehnica', 'Inspectie tehnica generala', 2000);

GO

INSERT INTO Appointments
(AppointmentCode, CustomerId, VehicleId, MechanicId, ServiceId, ScheduledDate, ProblemDescription, Status, CreatedAt)
VALUES
('APP-20260525-001', 1, 1, 1, 1, '2026-05-25 10:00:00', 'Motorul pornește greu dimineața', 'Programat', GETDATE()),

('APP-20260526-002', 2, 2, 2, 2, '2026-05-26 11:30:00', NULL, 'Programat', GETDATE()),

('APP-20260527-003', 3, 3, 1, 3, '2026-05-27 09:00:00', 'Check engine aprins', 'În progres', GETDATE()),

('APP-20260528-004', 4, 4, 2, 4, '2026-05-28 14:00:00', 'Zgomot suspensie față', 'Complet', GETDATE()),

('APP-20260529-005', 5, 5, 3, 5, '2026-05-29 16:00:00', 'Frâne scârțâie puternic', 'Complet', GETDATE()),

('APP-20260601-006', 1, 6, 1, 6, '2026-06-01 13:00:00', NULL, 'Programat', GETDATE()),

('APP-20260602-007', 2, 7, 2, 7, '2026-06-02 08:30:00', 'Revizie completă înainte de drum', 'În progres', GETDATE()),

('APP-20260603-008', 3, 8, 3, 1, '2026-06-03 15:30:00', 'Schimb ulei urgent', 'Programat', GETDATE());

GO

INSERT INTO Payments
(AppointmentId, PaymentDate, PaymentType, Amount)
VALUES
(4, '2026-05-28 16:00:00', 'Card', 3500.00),

(5, '2026-05-29 17:30:00', 'Numerar', 1500.00);

GO

use master
