from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, Float, TIMESTAMP, Enum, Boolean, Numeric
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy.sql import func

class Department(Base):
    __tablename__ = "department"
    Department_ID = Column(Integer, primary_key=True, index=True)
    Name = Column(String(100), nullable=False)
    Description = Column(Text)

class Room(Base):
    __tablename__ = "room"
    Room_ID = Column(Integer, primary_key=True, index=True)
    Room_Number = Column(String(20), unique=True, nullable=False)
    Room_Type = Column(Enum('General', 'Private', 'ICU', 'Operation Theater'))
    Capacity = Column(Integer, default=1)
    Rate_Per_Day = Column(Numeric(10, 2))
    Status = Column(Enum('Available', 'Occupied', 'Maintenance'), default='Available')

class Staff(Base):
    __tablename__ = "staff"
    Staff_ID = Column(Integer, primary_key=True, index=True)
    Name = Column(String(100), nullable=False)
    Role = Column(String(50))
    Contact = Column(String(15))
    Email = Column(String(100))
    DOB = Column(Date)
    Gender = Column(String(1))
    Address = Column(Text)
    Join_Date = Column(Date)
    Status = Column(String(20))

class Doctor(Base):
    __tablename__ = "doctor"
    Doctor_ID = Column(Integer, primary_key=True, index=True)
    Staff_ID = Column(Integer, ForeignKey("staff.Staff_ID", ondelete="CASCADE"))
    Specialization = Column(String(100))
    License_No = Column(String(50), unique=True)
    Qualification = Column(String(100))
    Department_ID = Column(Integer, ForeignKey("department.Department_ID", ondelete="SET NULL"))
    Consultation_Fee = Column(Numeric(10, 2))

class Nurse(Base):
    __tablename__ = "nurse"
    Nurse_ID = Column(Integer, primary_key=True, index=True)
    Staff_ID = Column(Integer, ForeignKey("staff.Staff_ID", ondelete="CASCADE"))
    Shift = Column(Enum('Morning', 'Evening', 'Night'))
    Department_ID = Column(Integer, ForeignKey("department.Department_ID", ondelete="SET NULL"))

class Receptionist(Base):
    __tablename__ = "receptionist"
    Receptionist_ID = Column(Integer, primary_key=True, index=True)
    Staff_ID = Column(Integer, ForeignKey("staff.Staff_ID", ondelete="CASCADE"))

class Patient(Base):
    __tablename__ = "patient"
    Patient_ID = Column(Integer, primary_key=True, index=True)
    Name = Column(String(100), nullable=False)
    DOB = Column(Date)
    Gender = Column(String(1))
    Contact = Column(String(15))
    Address = Column(Text)
    Emergency_Contact = Column(String(15))

class Appointment(Base):
    __tablename__ = "appointment"
    Appointment_ID = Column(Integer, primary_key=True, index=True)
    Patient_ID = Column(Integer, ForeignKey("patient.Patient_ID", ondelete="CASCADE"))
    Doctor_ID = Column(Integer, ForeignKey("doctor.Doctor_ID", ondelete="CASCADE"))
    Receptionist_ID = Column(Integer, ForeignKey("receptionist.Receptionist_ID", ondelete="SET NULL"))
    Appointment_Date = Column(Date)
    Appointment_Time = Column(String(20))
    Status = Column(Enum('Scheduled', 'Completed', 'Cancelled', 'No Show'), default='Scheduled')

class Admission(Base):
    __tablename__ = "admission"
    Admission_ID = Column(Integer, primary_key=True, index=True)
    Patient_ID = Column(Integer, ForeignKey("patient.Patient_ID", ondelete="CASCADE"))
    Doctor_ID = Column(Integer, ForeignKey("doctor.Doctor_ID", ondelete="SET NULL"))
    Room_ID = Column(Integer, ForeignKey("room.Room_ID", ondelete="SET NULL"))
    Admit_Date = Column(DateTime)
    Discharge_Date = Column(DateTime, nullable=True)
    Status = Column(Enum('Admitted', 'Discharged'), default='Admitted')

class Nurse_Assignment(Base):
    __tablename__ = "nurse_assignment"
    Assignment_ID = Column(Integer, primary_key=True, index=True)
    Admission_ID = Column(Integer, ForeignKey("admission.Admission_ID", ondelete="CASCADE"))
    Nurse_ID = Column(Integer, ForeignKey("nurse.Nurse_ID", ondelete="CASCADE"))
    Shift = Column(Enum('Morning', 'Evening', 'Night'))
    Assignment_Date = Column(Date)

class Prescription(Base):
    __tablename__ = "prescription"
    Prescription_ID = Column(Integer, primary_key=True, index=True)
    Appointment_ID = Column(Integer, ForeignKey("appointment.Appointment_ID", ondelete="CASCADE"), nullable=True)
    Patient_ID = Column(Integer, ForeignKey("patient.Patient_ID", ondelete="CASCADE"))
    Doctor_ID = Column(Integer, ForeignKey("doctor.Doctor_ID", ondelete="CASCADE"))
    Prescription_Date = Column(TIMESTAMP, server_default=func.now())
    Notes = Column(Text)

class Medication(Base):
    __tablename__ = "medication"
    Medication_ID = Column(Integer, primary_key=True, index=True)
    Prescription_ID = Column(Integer, ForeignKey("prescription.Prescription_ID", ondelete="CASCADE"))
    Medicine_Name = Column(String(100))
    Dosage = Column(String(50))
    Duration = Column(String(50))
    Instructions = Column(Text)

class Bill(Base):
    __tablename__ = "bill"
    Bill_ID = Column(Integer, primary_key=True, index=True)
    Patient_ID = Column(Integer, ForeignKey("patient.Patient_ID", ondelete="CASCADE"))
    Admission_ID = Column(Integer, ForeignKey("admission.Admission_ID", ondelete="SET NULL"), nullable=True)
    Appointment_ID = Column(Integer, ForeignKey("appointment.Appointment_ID", ondelete="SET NULL"), nullable=True)
    Total_Amount = Column(Numeric(10, 2), default=0.00)
    Bill_Date = Column(TIMESTAMP, server_default=func.now())
    Status = Column(Enum('Pending', 'Partial', 'Paid'), default='Pending')

class Bill_Item(Base):
    __tablename__ = "bill_item"
    Item_ID = Column(Integer, primary_key=True, index=True)
    Bill_ID = Column(Integer, ForeignKey("bill.Bill_ID", ondelete="CASCADE"))
    Description = Column(String(255))
    Amount = Column(Numeric(10, 2))

class Payment(Base):
    __tablename__ = "payment"
    Payment_ID = Column(Integer, primary_key=True, index=True)
    Bill_ID = Column(Integer, ForeignKey("bill.Bill_ID", ondelete="CASCADE"))
    Amount = Column(Numeric(10, 2))
    Mode = Column(Enum('Cash', 'Card', 'Insurance', 'Online'))
    Payment_Date = Column(TIMESTAMP, server_default=func.now())
    Collected_By = Column(Integer, ForeignKey("staff.Staff_ID", ondelete="SET NULL"))

class Lab_Test_Catalog(Base):
    __tablename__ = "lab_test_catalog"
    Test_ID = Column(Integer, primary_key=True, index=True)
    Test_Name = Column(String(100), nullable=False)
    Description = Column(Text)
    Cost = Column(Numeric(10, 2), nullable=False)

class Lab_Order(Base):
    __tablename__ = "lab_order"
    Order_ID = Column(Integer, primary_key=True, index=True)
    Patient_ID = Column(Integer, ForeignKey("patient.Patient_ID", ondelete="CASCADE"))
    Doctor_ID = Column(Integer, ForeignKey("doctor.Doctor_ID", ondelete="SET NULL"))
    Test_ID = Column(Integer, ForeignKey("lab_test_catalog.Test_ID", ondelete="CASCADE"))
    Order_Date = Column(TIMESTAMP, server_default=func.now())
    Status = Column(Enum('Pending', 'Sample Collected', 'Completed'), default='Pending')

class Lab_Result(Base):
    __tablename__ = "lab_result"
    Result_ID = Column(Integer, primary_key=True, index=True)
    Order_ID = Column(Integer, ForeignKey("lab_order.Order_ID", ondelete="CASCADE"))
    Result_Value = Column(String(255))
    Is_Abnormal = Column(Boolean, default=False)
    Result_Date = Column(TIMESTAMP, server_default=func.now())

class Diet_Plan(Base):
    __tablename__ = "diet_plan"
    Plan_ID = Column(Integer, primary_key=True, index=True)
    Admission_ID = Column(Integer, ForeignKey("admission.Admission_ID", ondelete="CASCADE"))
    Diet_Type = Column(String(100))
    Instructions = Column(Text)

class Cafeteria_Menu(Base):
    __tablename__ = "cafeteria_menu"
    Item_ID = Column(Integer, primary_key=True, index=True)
    Item_Name = Column(String(100))
    Nutrition_Info = Column(Text)
    Price = Column(Numeric(10, 2))

class Cafeteria_Order(Base):
    __tablename__ = "cafeteria_order"
    Order_ID = Column(Integer, primary_key=True, index=True)
    Patient_ID = Column(Integer, ForeignKey("patient.Patient_ID", ondelete="CASCADE"))
    Item_ID = Column(Integer, ForeignKey("cafeteria_menu.Item_ID", ondelete="CASCADE"))
    Order_Date = Column(TIMESTAMP, server_default=func.now())
    Status = Column(Enum('Preparing', 'Delivered'), default='Preparing')

class Inventory_Item(Base):
    __tablename__ = "inventory_item"
    Item_ID = Column(Integer, primary_key=True, index=True)
    Item_Name = Column(String(100), nullable=False)
    Stock_Quantity = Column(Integer, default=0)
    Unit_Price = Column(Numeric(10, 2))

class Dispense_Log(Base):
    __tablename__ = "dispense_log"
    Dispense_ID = Column(Integer, primary_key=True, index=True)
    Prescription_ID = Column(Integer, ForeignKey("prescription.Prescription_ID", ondelete="CASCADE"))
    Item_ID = Column(Integer, ForeignKey("inventory_item.Item_ID", ondelete="CASCADE"))
    Quantity_Dispensed = Column(Integer)
    Dispense_Date = Column(TIMESTAMP, server_default=func.now())

class Insurance_Claim(Base):
    __tablename__ = "insurance_claim"
    Claim_ID = Column(Integer, primary_key=True, index=True)
    Bill_ID = Column(Integer, ForeignKey("bill.Bill_ID", ondelete="CASCADE"))
    Provider_Name = Column(String(100))
    Policy_Number = Column(String(100))
    Claim_Amount = Column(Numeric(10, 2))
    Status = Column(Enum('Submitted', 'Approved', 'Rejected'), default='Submitted')

class Vital(Base):
    __tablename__ = "vital"
    Vital_ID = Column(Integer, primary_key=True, index=True)
    Patient_ID = Column(Integer, ForeignKey("patient.Patient_ID", ondelete="CASCADE"))
    Heart_Rate = Column(Integer)
    Blood_Pressure = Column(String(20))
    Temperature = Column(Numeric(4, 2))
    Oxygen_Saturation = Column(Integer)
    Recorded_At = Column(TIMESTAMP, server_default=func.now())
    Recorded_By = Column(Integer, ForeignKey("staff.Staff_ID", ondelete="SET NULL"))
