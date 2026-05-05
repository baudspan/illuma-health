DROP DATABASE IF EXISTS HospitalManagement;
CREATE DATABASE HospitalManagement;
USE HospitalManagement;

-- 1. Support Entities
CREATE TABLE Department (
    Department_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT
);

CREATE TABLE Room (
    Room_ID INT PRIMARY KEY AUTO_INCREMENT,
    Room_Number VARCHAR(20) UNIQUE NOT NULL,
    Room_Type ENUM('General', 'Private', 'ICU', 'Operation Theater'),
    Capacity INT DEFAULT 1,
    Rate_Per_Day DECIMAL(10,2),
    Status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available'
);

-- 2. Core Entities: Staff
CREATE TABLE Staff (
    Staff_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Role ENUM('Admin', 'Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab_Tech', 'Dietician', 'Other') DEFAULT 'Other',
    Contact VARCHAR(15),
    Email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    DOB DATE,
    Gender ENUM('M', 'F', 'Other'),
    Address TEXT,
    Join_Date DATE,
    Status ENUM('Active', 'Leave', 'Resigned') DEFAULT 'Active'
);

CREATE TABLE Doctor (
    Doctor_ID INT PRIMARY KEY AUTO_INCREMENT,
    Staff_ID INT,
    Specialization VARCHAR(100),
    License_No VARCHAR(50) UNIQUE,
    Qualification VARCHAR(100),
    Department_ID INT,
    Consultation_Fee DECIMAL(10,2),
    FOREIGN KEY (Staff_ID) REFERENCES Staff(Staff_ID) ON DELETE CASCADE,
    FOREIGN KEY (Department_ID) REFERENCES Department(Department_ID) ON DELETE SET NULL
);

CREATE TABLE Nurse (
    Nurse_ID INT PRIMARY KEY AUTO_INCREMENT,
    Staff_ID INT,
    Shift ENUM('Morning', 'Evening', 'Night'),
    Department_ID INT,
    FOREIGN KEY (Staff_ID) REFERENCES Staff(Staff_ID) ON DELETE CASCADE,
    FOREIGN KEY (Department_ID) REFERENCES Department(Department_ID) ON DELETE SET NULL
);

CREATE TABLE Receptionist (
    Receptionist_ID INT PRIMARY KEY AUTO_INCREMENT,
    Staff_ID INT,
    FOREIGN KEY (Staff_ID) REFERENCES Staff(Staff_ID) ON DELETE CASCADE
);

-- 3. Core Entities: Patient
CREATE TABLE Patient (
    Patient_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    DOB DATE,
    Gender ENUM('M', 'F', 'Other'),
    Contact VARCHAR(15),
    Email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    Address TEXT,
    Emergency_Contact VARCHAR(15)
);

-- 4. Processes: Appointment and Admission
CREATE TABLE Appointment (
    Appointment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Patient_ID INT,
    Doctor_ID INT,
    Receptionist_ID INT NULL,
    Appointment_Date DATE,
    Appointment_Time TIME,
    Status ENUM('Scheduled', 'Completed', 'Cancelled', 'No Show') DEFAULT 'Scheduled',
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Doctor_ID) REFERENCES Doctor(Doctor_ID) ON DELETE CASCADE,
    FOREIGN KEY (Receptionist_ID) REFERENCES Receptionist(Receptionist_ID) ON DELETE SET NULL
);

CREATE TABLE Admission (
    Admission_ID INT PRIMARY KEY AUTO_INCREMENT,
    Patient_ID INT,
    Doctor_ID INT,
    Room_ID INT,
    Admit_Date DATETIME,
    Discharge_Date DATETIME NULL,
    Status ENUM('Admitted', 'Discharged') DEFAULT 'Admitted',
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Doctor_ID) REFERENCES Doctor(Doctor_ID) ON DELETE SET NULL,
    FOREIGN KEY (Room_ID) REFERENCES Room(Room_ID) ON DELETE SET NULL
);

CREATE TABLE Nurse_Assignment (
    Assignment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Admission_ID INT,
    Nurse_ID INT,
    Shift ENUM('Morning', 'Evening', 'Night'),
    Assignment_Date DATE,
    FOREIGN KEY (Admission_ID) REFERENCES Admission(Admission_ID) ON DELETE CASCADE,
    FOREIGN KEY (Nurse_ID) REFERENCES Nurse(Nurse_ID) ON DELETE CASCADE
);

-- 5. Added Module: Prescriptions / Medical Records
CREATE TABLE Prescription (
    Prescription_ID INT PRIMARY KEY AUTO_INCREMENT,
    Appointment_ID INT NULL,
    Patient_ID INT,
    Doctor_ID INT,
    Prescription_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT,
    FOREIGN KEY (Appointment_ID) REFERENCES Appointment(Appointment_ID) ON DELETE CASCADE,
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Doctor_ID) REFERENCES Doctor(Doctor_ID) ON DELETE CASCADE
);

CREATE TABLE Medication (
    Medication_ID INT PRIMARY KEY AUTO_INCREMENT,
    Prescription_ID INT,
    Medicine_Name VARCHAR(100),
    Dosage VARCHAR(50),
    Duration VARCHAR(50),
    Instructions TEXT,
    FOREIGN KEY (Prescription_ID) REFERENCES Prescription(Prescription_ID) ON DELETE CASCADE
);

-- 6. Billing and Finance
CREATE TABLE Bill (
    Bill_ID INT PRIMARY KEY AUTO_INCREMENT,
    Patient_ID INT,
    Admission_ID INT NULL,
    Appointment_ID INT NULL,
    Total_Amount DECIMAL(10,2) DEFAULT 0.00,
    Bill_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending', 'Partial', 'Paid') DEFAULT 'Pending',
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Admission_ID) REFERENCES Admission(Admission_ID) ON DELETE SET NULL,
    FOREIGN KEY (Appointment_ID) REFERENCES Appointment(Appointment_ID) ON DELETE SET NULL
);

-- Added Table: Bill_Item to support individual charges
CREATE TABLE Bill_Item (
    Item_ID INT PRIMARY KEY AUTO_INCREMENT,
    Bill_ID INT,
    Description VARCHAR(255), -- e.g., 'Room Charge', 'Consultation Fee', 'Blood Test'
    Amount DECIMAL(10,2),
    FOREIGN KEY (Bill_ID) REFERENCES Bill(Bill_ID) ON DELETE CASCADE
);

CREATE TABLE Payment (
    Payment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Bill_ID INT,
    Amount DECIMAL(10,2),
    Mode ENUM('Cash', 'Card', 'Insurance', 'Online'),
    Payment_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Collected_By INT, -- References Staff_ID
    FOREIGN KEY (Bill_ID) REFERENCES Bill(Bill_ID) ON DELETE CASCADE,
    FOREIGN KEY (Collected_By) REFERENCES Staff(Staff_ID) ON DELETE SET NULL
);

-- 7. Lab & Diagnostics Module
CREATE TABLE Lab_Test_Catalog (
    Test_ID INT PRIMARY KEY AUTO_INCREMENT,
    Test_Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Cost DECIMAL(10,2) NOT NULL
);

CREATE TABLE Lab_Order (
    Order_ID INT PRIMARY KEY AUTO_INCREMENT,
    Patient_ID INT,
    Doctor_ID INT,
    Test_ID INT,
    Order_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending', 'Sample Collected', 'Completed') DEFAULT 'Pending',
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Doctor_ID) REFERENCES Doctor(Doctor_ID) ON DELETE SET NULL,
    FOREIGN KEY (Test_ID) REFERENCES Lab_Test_Catalog(Test_ID) ON DELETE CASCADE
);

CREATE TABLE Lab_Result (
    Result_ID INT PRIMARY KEY AUTO_INCREMENT,
    Order_ID INT,
    Result_Value VARCHAR(255),
    Is_Abnormal BOOLEAN DEFAULT FALSE,
    Result_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Order_ID) REFERENCES Lab_Order(Order_ID) ON DELETE CASCADE
);

-- 8. Dietary & Cafeteria Module
CREATE TABLE Diet_Plan (
    Plan_ID INT PRIMARY KEY AUTO_INCREMENT,
    Admission_ID INT,
    Diet_Type VARCHAR(100), -- e.g., 'Low Sodium', 'Diabetic'
    Instructions TEXT,
    FOREIGN KEY (Admission_ID) REFERENCES Admission(Admission_ID) ON DELETE CASCADE
);

CREATE TABLE Cafeteria_Menu (
    Item_ID INT PRIMARY KEY AUTO_INCREMENT,
    Item_Name VARCHAR(100),
    Nutrition_Info TEXT,
    Price DECIMAL(10,2)
);

CREATE TABLE Cafeteria_Order (
    Order_ID INT PRIMARY KEY AUTO_INCREMENT,
    Patient_ID INT,
    Item_ID INT,
    Order_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Preparing', 'Delivered') DEFAULT 'Preparing',
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Item_ID) REFERENCES Cafeteria_Menu(Item_ID) ON DELETE CASCADE
);

-- 9. Pharmacy & Inventory Module
CREATE TABLE Inventory_Item (
    Item_ID INT PRIMARY KEY AUTO_INCREMENT,
    Item_Name VARCHAR(100) NOT NULL,
    Stock_Quantity INT DEFAULT 0,
    Unit_Price DECIMAL(10,2)
);

CREATE TABLE Dispense_Log (
    Dispense_ID INT PRIMARY KEY AUTO_INCREMENT,
    Prescription_ID INT,
    Item_ID INT,
    Quantity_Dispensed INT,
    Dispense_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Prescription_ID) REFERENCES Prescription(Prescription_ID) ON DELETE CASCADE,
    FOREIGN KEY (Item_ID) REFERENCES Inventory_Item(Item_ID) ON DELETE CASCADE
);

-- 10. TPA / Insurance Module
CREATE TABLE Insurance_Claim (
    Claim_ID INT PRIMARY KEY AUTO_INCREMENT,
    Bill_ID INT,
    Provider_Name VARCHAR(100),
    Policy_Number VARCHAR(100),
    Claim_Amount DECIMAL(10,2),
    Status ENUM('Submitted', 'Approved', 'Rejected') DEFAULT 'Submitted',
    FOREIGN KEY (Bill_ID) REFERENCES Bill(Bill_ID) ON DELETE CASCADE
);

-- 11. Vitals Module
CREATE TABLE Vital (
    Vital_ID INT PRIMARY KEY AUTO_INCREMENT,
    Patient_ID INT,
    Heart_Rate INT,
    Blood_Pressure VARCHAR(20),
    Temperature DECIMAL(4,2),
    Oxygen_Saturation INT,
    Recorded_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Recorded_By INT,
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Recorded_By) REFERENCES Staff(Staff_ID) ON DELETE SET NULL
);
CREATE TABLE user_login (
    login_id INT PRIMARY KEY AUTO_INCREMENT,
    firebase_uid VARCHAR(128) UNIQUE,
    email VARCHAR(100) UNIQUE,
    display_name VARCHAR(100),
    role VARCHAR(50),
    last_login DATETIME
);
