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

-- 3. Staff Members (Default Password: Illuma@2026)
INSERT INTO Staff (Name, Role, Contact, Email, password_hash, DOB, Gender, Address, Join_Date) VALUES
('Dr. Ramesh Sharma', 'Doctor', '9876543210', 'ramesh@hospital.com', '$2a$12$oobnbKi3JZnilyx9yda.suESek87qiU47o36KBHb84DNUDcl33oBS', '1980-05-15', 'M', 'Delhi', '2015-06-01'),
('Dr. Anita Desai', 'Doctor', '9876543211', 'anita@hospital.com', '$2a$12$oobnbKi3JZnilyx9yda.suESek87qiU47o36KBHb84DNUDcl33oBS', '1985-08-22', 'F', 'Mumbai', '2018-09-15'),
('Nurse Sunita', 'Nurse', '9876543212', 'sunita@hospital.com', '$2a$12$oobnbKi3JZnilyx9yda.suESek87qiU47o36KBHb84DNUDcl33oBS', '1990-11-10', 'F', 'Pune', '2020-01-10'),
('Ravi Kumar', 'Receptionist', '9876543213', 'ravi@hospital.com', '$2a$12$oobnbKi3JZnilyx9yda.suESek87qiU47o36KBHb84DNUDcl33oBS', '1995-02-28', 'M', 'Delhi', '2022-03-01'),
('Dr. Meena', 'Dietician', '9876543214', 'meena@hospital.com', '$2a$12$oobnbKi3JZnilyx9yda.suESek87qiU47o36KBHb84DNUDcl33oBS', '1988-07-07', 'F', 'Delhi', '2021-05-12'),
('Anil Verma', 'Pharmacist', '9876543215', 'anil@hospital.com', '$2a$12$oobnbKi3JZnilyx9yda.suESek87qiU47o36KBHb84DNUDcl33oBS', '1992-04-18', 'M', 'Delhi', '2021-08-20'),
('System Admin', 'Admin', '9876543216', 'admin@illuma.com', '$2a$12$oobnbKi3JZnilyx9yda.suESek87qiU47o36KBHb84DNUDcl33oBS', '1985-01-01', 'Other', 'Main Office', '2010-01-01');

-- 4. Specific Staff Details
INSERT INTO Doctor (Staff_ID, Specialization, License_No, Qualification, Department_ID, Consultation_Fee) VALUES
(1, 'Cardiologist', 'MCI-1234', 'MD Cardiology', 1, 1000.00),
(2, 'Neurologist', 'MCI-5678', 'MD Neurology', 2, 1200.00);

INSERT INTO Nurse (Staff_ID, Shift, Department_ID) VALUES
(3, 'Morning', 4);

INSERT INTO Receptionist (Staff_ID) VALUES (4);

-- 5. Patients (Password for both: Illuma@2026)
INSERT INTO Patient (Name, DOB, Gender, Contact, Email, password_hash, Address, Emergency_Contact) VALUES
('Rajesh Gupta', '1975-04-12', 'M', '9123456780', 'rahul@patient.com', '$2a$12$oobnbKi3JZnilyx9yda.suESek87qiU47o36KBHb84DNUDcl33oBS', 'New Delhi', '9123456781'),
('Priya Singh', '1992-09-05', 'F', '9123456782', 'priya@patient.com', '$2a$12$oobnbKi3JZnilyx9yda.suESek87qiU47o36KBHb84DNUDcl33oBS', 'Noida', '9123456783');

-- 6. Appointments
INSERT INTO Appointment (Patient_ID, Doctor_ID, Receptionist_ID, Appointment_Date, Appointment_Time, Status) VALUES
(1, 1, 1, CURDATE(), '10:00:00', 'Completed'),
(2, 2, 1, CURDATE(), '11:30:00', 'Scheduled');

-- 7. Admissions (Rajesh in ICU-01)
INSERT INTO Admission (Patient_ID, Doctor_ID, Room_ID, Admit_Date, Status) VALUES
(1, 1, 3, NOW(), 'Admitted');

-- 8. Prescriptions & Medications (The trigger for the Diet Plan)
INSERT INTO Prescription (Patient_ID, Doctor_ID, Notes) VALUES
(1, 1, 'Patient has high blood pressure and cardiac distress. Strictly monitor diet.');

INSERT INTO Medication (Prescription_ID, Medicine_Name, Dosage, Duration, Instructions) VALUES
(1, 'Amlodipine', '5mg', '30 days', 'Take once daily in the morning'),
(1, 'Atorvastatin', '20mg', '30 days', 'Take at night before bed');

-- 9. Diet Plan (Generated based on the Cardiac Prescription)
INSERT INTO Diet_Plan (Admission_ID, Diet_Type, Instructions) VALUES
(1, 'Low Sodium Cardiac Diet', 'BREAKFAST: Oats with skimmed milk. LUNCH: Boiled brown rice and dal. SNACK: Green tea & Walnuts. DINNER: Vegetable soup (No salt). AVOID: Fried foods, pickles, and table salt.');

-- 10. Lab Catalog & Inventory
INSERT INTO Lab_Test_Catalog (Test_Name, Description, Cost) VALUES
('CBC', 'Complete Blood Count', 500.00),
('Lipid Profile', 'Cholesterol test', 800.00);

INSERT INTO Inventory_Item (Item_Name, Stock_Quantity, Unit_Price) VALUES
('Paracetamol 500mg', 1000, 2.00),
('Aspirin 75mg', 500, 5.00);
