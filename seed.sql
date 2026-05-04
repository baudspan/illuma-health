USE HospitalManagement;

-- 1. Departments
INSERT INTO Department (Name, Description) VALUES
('Cardiology', 'Heart and vascular care'),
('Neurology', 'Brain and nervous system'),
('Orthopedics', 'Bone and joint care'),
('General Medicine', 'Primary care and internal medicine'),
('Emergency', 'Casualty and trauma care');

-- 2. Rooms / Wards
INSERT INTO Room (Room_Number, Room_Type, Capacity, Rate_Per_Day, Status) VALUES
('GEN-101', 'General', 4, 1500.00, 'Available'),
('PVT-201', 'Private', 1, 4000.00, 'Available'),
('ICU-01', 'ICU', 1, 10000.00, 'Occupied'),
('OT-01', 'Operation Theater', 1, 20000.00, 'Available');

-- 3. Staff Members
INSERT INTO Staff (Name, Role, Contact, Email, DOB, Gender, Address, Join_Date) VALUES
('Dr. Ramesh Sharma', 'Doctor', '9876543210', 'ramesh@hospital.com', '1980-05-15', 'M', 'Delhi', '2015-06-01'),
('Dr. Anita Desai', 'Doctor', '9876543211', 'anita@hospital.com', '1985-08-22', 'F', 'Mumbai', '2018-09-15'),
('Nurse Sunita', 'Nurse', '9876543212', 'sunita@hospital.com', '1990-11-10', 'F', 'Pune', '2020-01-10'),
('Ravi Kumar', 'Receptionist', '9876543213', 'ravi@hospital.com', '1995-02-28', 'M', 'Delhi', '2022-03-01'),
('Dr. Meena', 'Dietician', '9876543214', 'meena@hospital.com', '1988-07-07', 'F', 'Delhi', '2021-05-12'),
('Anil Verma', 'Pharmacist', '9876543215', 'anil@hospital.com', '1992-04-18', 'M', 'Delhi', '2021-08-20');

-- 4. Specific Staff Details
INSERT INTO Doctor (Staff_ID, Specialization, License_No, Qualification, Department_ID, Consultation_Fee) VALUES
(1, 'Cardiologist', 'MCI-1234', 'MD Cardiology', 1, 1000.00),
(2, 'Neurologist', 'MCI-5678', 'MD Neurology', 2, 1200.00);

INSERT INTO Nurse (Staff_ID, Shift, Department_ID) VALUES
(3, 'Morning', 4);

INSERT INTO Receptionist (Staff_ID) VALUES (4);

-- 5. Patients
INSERT INTO Patient (Name, DOB, Gender, Contact, Address, Emergency_Contact) VALUES
('Rajesh Gupta', '1975-04-12', 'M', '9123456780', 'New Delhi', '9123456781'),
('Priya Singh', '1992-09-05', 'F', '9123456782', 'Noida', '9123456783');

-- 6. Appointments
INSERT INTO Appointment (Patient_ID, Doctor_ID, Receptionist_ID, Appointment_Date, Appointment_Time, Status) VALUES
(1, 1, 1, CURDATE(), '10:00:00', 'Completed'),
(2, 2, 1, CURDATE(), '11:30:00', 'Scheduled');

-- 7. Admissions
INSERT INTO Admission (Patient_ID, Doctor_ID, Room_ID, Admit_Date, Status) VALUES
(1, 1, 3, NOW(), 'Admitted');

-- 8. Diet Plan for Admitted Patient
INSERT INTO Diet_Plan (Admission_ID, Diet_Type, Instructions) VALUES
(1, 'Low Sodium Cardiac', 'No extra salt, boiled vegetables only. Serve warm.');

-- 9. Lab Catalog
INSERT INTO Lab_Test_Catalog (Test_Name, Description, Cost) VALUES
('CBC', 'Complete Blood Count', 500.00),
('Lipid Profile', 'Cholesterol test', 800.00),
('ECG', 'Electrocardiogram', 1000.00);

-- 10. Inventory Items
INSERT INTO Inventory_Item (Item_Name, Stock_Quantity, Unit_Price) VALUES
('Paracetamol 500mg', 1000, 2.00),
('Aspirin 75mg', 500, 5.00),
('Syringe 5ml', 2000, 10.00),
('IV Fluid (Saline)', 200, 150.00);
