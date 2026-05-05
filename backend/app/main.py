from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List, Optional
import os, time

from .database import get_db, engine, Base
from . import models, schemas

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# Local JWT utilities
from .auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
    Token,
    TokenData,
)

# Load environment variables if not already loaded by database.py
from dotenv import load_dotenv
load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    try:
        token_data = decode_access_token(token)
        return token_data
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def role_required(*allowed_roles: str):
    def role_dependency(current_user: TokenData = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_dependency

app = FastAPI(title="Illuma Health API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def calculate_age(dob):
    if not dob: return 0
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

@app.get("/")
def read_root():
    return {"message": "Illuma Health API is running!"}

# ==================== AUTH (JWT) ====================

@app.post('/api/auth/login', response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.Staff).filter(models.Staff.Email == form_data.username).first()
    if not user:
        # Check Patient table if not found in Staff
        user = db.query(models.Patient).filter(models.Patient.Email == form_data.username).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        role = "Patient"
    else:
        role = user.Role

    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user.Email, "role": role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": user.Name,
            "id": getattr(user, 'Staff_ID', getattr(user, 'Patient_ID', 0)),
            "role": role
        }
    }

# ==================== PATIENT APIs ====================

@app.get("/api/patients", response_model=List[dict])
def get_patients(db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    patients = db.query(models.Patient).all()
    result = []
    for p in patients:
        # Check latest vitals for status
        latest_vitals = db.query(models.Vital).filter(models.Vital.Patient_ID == p.Patient_ID).order_by(models.Vital.Recorded_At.desc()).first()
        status = "Stable"
        if latest_vitals:
            # Simple benchmarks: HR > 100 or BP > 140/90 or Temp > 38.5C (101.3F)
            hr = latest_vitals.Heart_Rate
            temp = latest_vitals.Temperature
            bp = latest_vitals.Blood_Pressure
            
            try:
                sys_bp = int(bp.split('/')[0])
                if hr > 100 or hr < 50 or temp > 38.5 or sys_bp > 150:
                    status = "Unstable"
            except:
                pass

        result.append({
            "id": f"ILL-{p.Patient_ID}",
            "Patient_ID": p.Patient_ID,
            "name": p.Name,
            "age": calculate_age(p.DOB),
            "gender": p.Gender,
            "type": "OPD", 
            "ward": "General", 
            "status": status
        })
    return result

@app.get("/api/patients/me/status", response_model=dict)
def get_patient_status(db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    patient = db.query(models.Patient).filter(models.Patient.Email == current_user.email).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    admission = db.query(models.Admission).filter(
        models.Admission.Patient_ID == patient.Patient_ID,
        models.Admission.Status == 'Admitted'
    ).first()
    
    room = None
    diet = None
    if admission:
        room_data = db.query(models.Room).filter(models.Room.Room_ID == admission.Room_ID).first()
        if room_data:
            room = {"Number": room_data.Room_Number, "Type": room_data.Room_Type}
        
        diet_data = db.query(models.Diet_Plan).filter(models.Diet_Plan.Admission_ID == admission.Admission_ID).first()
        if diet_data:
            diet = {"Type": diet_data.Diet_Type, "Instructions": diet_data.Instructions}

    return {
        "patient_name": patient.Name,
        "admission": True if admission else False,
        "room": room,
        "diet": diet
    }

@app.delete('/api/patients/{patient_id}')
def delete_patient(patient_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin'))):
    patient = db.query(models.Patient).filter(models.Patient.Patient_ID == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail='Patient not found')
    db.delete(patient)
    db.commit()
    return {'status': 'success'}

@app.get('/api/rooms', response_model=List[dict])
def get_rooms(db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    rooms = db.query(models.Room).all()
    return [
        {
            "Room_ID": r.Room_ID,
            "Room_Number": r.Room_Number,
            "Room_Type": r.Room_Type,
            "Capacity": r.Capacity,
            "Rate_Per_Day": float(r.Rate_Per_Day),
            "Status": r.Status
        } for r in rooms
    ]

# ==================== VITAL APIs ====================

@app.post("/api/vitals", response_model=schemas.VitalResponse)
def create_vital(vital: schemas.VitalCreate, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Doctor', 'Nurse'))):
    db_vital = models.Vital(**vital.model_dump())
    db.add(db_vital)
    db.commit()
    db.refresh(db_vital)
    return db_vital

@app.get("/api/vitals/{patient_id}", response_model=List[schemas.VitalResponse])
def get_vitals(patient_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    vitals = db.query(models.Vital).filter(models.Vital.Patient_ID == patient_id).order_by(models.Vital.Recorded_At.desc()).all()
    return vitals

# ==================== DOCTOR & APPOINTMENT APIs ====================

@app.get('/api/doctors')
def get_doctors(db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    doctors = db.query(
        models.Doctor.Doctor_ID,
        models.Doctor.Department_ID,
        models.Staff.Name,
        models.Department.Name.label('Dept_Name'),
        models.Doctor.Specialization,
        models.Doctor.Consultation_Fee
    ).join(models.Staff, models.Doctor.Staff_ID == models.Staff.Staff_ID).outerjoin(models.Department, models.Doctor.Department_ID == models.Department.Department_ID).all()
    
    return [
        {
            'Doctor_ID': d.Doctor_ID,
            'Department_ID': d.Department_ID,
            'Name': f'Dr. {d.Name}',
            'Department': d.Dept_Name or 'General',
            'Specialization': d.Specialization,
            'Fee': float(d.Consultation_Fee) if d.Consultation_Fee else 0
        }
        for d in doctors
    ]

@app.get('/api/appointments')
def get_appointments(db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    appointments = db.query(
        models.Appointment.Appointment_ID,
        models.Appointment.Appointment_Date,
        models.Appointment.Appointment_Time,
        models.Appointment.Status,
        models.Patient.Name.label('Patient_Name'),
        models.Patient.Patient_ID
    ).join(models.Patient, models.Appointment.Patient_ID == models.Patient.Patient_ID).all()
    
    return [
        {
            'Appointment_ID': a.Appointment_ID,
            'Patient_Name': a.Patient_Name,
            'Patient_ID': a.Patient_ID,
            'Appointment_Date': a.Appointment_Date.isoformat() if a.Appointment_Date else None,
            'Appointment_Time': a.Appointment_Time,
            'Status': a.Status
        }
        for a in appointments
    ]

@app.post('/api/appointments')
def create_appointment(apt: schemas.AppointmentCreate, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    db_apt = models.Appointment(
        Patient_ID=apt.Patient_ID,
        Doctor_ID=apt.Doctor_ID,
        Appointment_Date=apt.Appointment_Date,
        Appointment_Time=apt.Appointment_Time,
        Status='Scheduled'
    )
    db.add(db_apt)
    db.commit()
    return {'status': 'success'}

@app.put('/api/appointments/{appointment_id}/status')
def update_appointment_status(appointment_id: int, status_update: schemas.AppointmentStatusUpdate, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin', 'Receptionist', 'Doctor'))):
    appointment = db.query(models.Appointment).filter(models.Appointment.Appointment_ID == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail='Appointment not found')
    appointment.Status = status_update.status
    db.commit()
    return {'status': 'success'}

# ==================== PRESCRIPTION & MEDICATION APIs ====================

@app.post("/api/prescriptions", response_model=schemas.PrescriptionResponse)
def create_prescription(prescription: schemas.PrescriptionCreate, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Doctor'))):
    db_prescription = models.Prescription(
        Patient_ID=prescription.Patient_ID,
        Doctor_ID=prescription.Doctor_ID,
        Notes=prescription.Notes
    )
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    
    for med in prescription.Medications:
        db_med = models.Medication(
            Prescription_ID=db_prescription.Prescription_ID,
            Medicine_Name=med.Medicine_Name,
            Dosage=med.Dosage,
            Duration=med.Duration,
            Instructions=med.Instructions
        )
        db.add(db_med)
        
    db.commit()
    return db_prescription

@app.get('/api/prescriptions/{patient_id}')
def get_prescriptions(patient_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    prescriptions = db.query(models.Prescription).filter(models.Prescription.Patient_ID == patient_id).all()
    result = []
    for p in prescriptions:
        meds = db.query(models.Medication).filter(models.Medication.Prescription_ID == p.Prescription_ID).all()
        result.append({
            'Prescription_ID': p.Prescription_ID,
            'Notes': p.Notes,
            'Date': p.Prescription_Date.isoformat() if p.Prescription_Date else None,
            'Medications': [{'Medicine_Name': m.Medicine_Name, 'Dosage': m.Dosage} for m in meds]
        })
    return result

@app.get("/api/medications/schedule")
def get_med_schedule(db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Doctor', 'Nurse'))):
    meds = db.query(
        models.Medication.Medication_ID, models.Medication.Medicine_Name,
        models.Medication.Dosage, models.Medication.Duration,
        models.Patient.Name.label('Patient_Name'), models.Patient.Patient_ID,
        models.Prescription.Prescription_ID
    ).join(models.Prescription, models.Medication.Prescription_ID == models.Prescription.Prescription_ID
    ).join(models.Patient, models.Prescription.Patient_ID == models.Patient.Patient_ID).all()
    return [{'Medication_ID': m.Medication_ID, 'Medicine_Name': m.Medicine_Name,
             'Dosage': m.Dosage, 'Duration': m.Duration, 'Patient_Name': m.Patient_Name,
             'Patient_ID': m.Patient_ID, 'Prescription_ID': m.Prescription_ID} for m in meds]

# ==================== LAB APIs ====================

@app.get("/api/labs/catalog")
def get_lab_catalog(db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    tests = db.query(models.Lab_Test_Catalog).all()
    return tests

@app.post('/api/labs/orders')
def create_lab_order(order: schemas.LabOrderCreate, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Doctor'))):
    db_order = models.Lab_Order(**order.model_dump())
    db.add(db_order)
    db.commit()
    return {'status': 'success'}

@app.get('/api/labs/orders/{patient_id}')
def get_patient_lab_orders(patient_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    orders = db.query(
        models.Lab_Order.Order_ID,
        models.Lab_Order.Order_Date,
        models.Lab_Order.Status,
        models.Lab_Test_Catalog.Test_Name
    ).join(models.Lab_Test_Catalog, models.Lab_Order.Test_ID == models.Lab_Test_Catalog.Test_ID).filter(models.Lab_Order.Patient_ID == patient_id).order_by(models.Lab_Order.Order_Date.desc()).all()
    
    return [
        {
            'Order_ID': o.Order_ID,
            'Order_Date': o.Order_Date.isoformat() if o.Order_Date else None,
            'Status': o.Status,
            'Test_Name': o.Test_Name
        }
        for o in orders
    ]

@app.get("/api/labs/alerts")
def get_lab_alerts(db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Doctor', 'Nurse'))):
    alerts = db.query(
        models.Lab_Result.Result_ID,
        models.Lab_Result.Result_Value,
        models.Lab_Result.Result_Date,
        models.Lab_Test_Catalog.Test_Name,
        models.Patient.Name.label("Patient_Name"),
        models.Patient.Patient_ID
    ).join(
        models.Lab_Order, models.Lab_Result.Order_ID == models.Lab_Order.Order_ID
    ).join(
        models.Lab_Test_Catalog, models.Lab_Order.Test_ID == models.Lab_Test_Catalog.Test_ID
    ).join(
        models.Patient, models.Lab_Order.Patient_ID == models.Patient.Patient_ID
    ).filter(
        models.Lab_Result.Is_Abnormal == True
    ).order_by(models.Lab_Result.Result_Date.desc()).all()
    
    return [
        {
            "Result_ID": alert.Result_ID,
            "Patient_Name": alert.Patient_Name,
            "Patient_ID": alert.Patient_ID,
            "Test_Name": alert.Test_Name,
            "Result_Value": alert.Result_Value,
            "Result_Date": alert.Result_Date.isoformat() if alert.Result_Date else None
        }
        for alert in alerts
    ]

@app.post('/api/labs/generate_result')
def generate_lab_result(req: schemas.GenerateResultSchema, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin', 'Doctor'))):
    order = db.query(models.Lab_Order).filter(models.Lab_Order.Order_ID == req.Order_ID).first()
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    order.Status = 'Completed'
    import random
    fake_val = str(random.randint(150, 300)) + ' mg/dL' 
    result = models.Lab_Result(Order_ID=req.Order_ID, Result_Value=fake_val, Is_Abnormal=True)
    db.add(result)
    db.commit()
    return {'status': 'success'}

# ==================== NURSE & ADMISSION APIs ====================

@app.get('/api/admissions')
def get_admissions(db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin', 'Nurse', 'Doctor'))):
    admissions = db.query(
        models.Admission.Admission_ID, models.Admission.Admit_Date,
        models.Admission.Status, models.Patient.Name.label('Patient_Name'),
        models.Patient.Patient_ID, models.Room.Room_Number
    ).join(models.Patient, models.Admission.Patient_ID == models.Patient.Patient_ID
    ).outerjoin(models.Room, models.Admission.Room_ID == models.Room.Room_ID).all()
    return [{'Admission_ID': a.Admission_ID, 'Patient_Name': a.Patient_Name,
             'Patient_ID': a.Patient_ID, 'Room': a.Room_Number or 'N/A',
             'Admit_Date': a.Admit_Date.isoformat() if a.Admit_Date else None,
             'Status': a.Status} for a in admissions]

@app.get('/api/admissions/discharge-queue')
def get_discharge_queue(db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin', 'Nurse'))):
    admitted = db.query(
        models.Admission.Admission_ID, models.Admission.Admit_Date,
        models.Patient.Name.label('Patient_Name'), models.Patient.Patient_ID,
        models.Room.Room_Number
    ).join(models.Patient, models.Admission.Patient_ID == models.Patient.Patient_ID
    ).outerjoin(models.Room, models.Admission.Room_ID == models.Room.Room_ID
    ).filter(models.Admission.Status == 'Admitted').all()
    return [{'Admission_ID': a.Admission_ID, 'Patient_Name': a.Patient_Name,
             'Patient_ID': a.Patient_ID, 'Room': a.Room_Number or 'N/A',
             'Admit_Date': a.Admit_Date.isoformat() if a.Admit_Date else None} for a in admitted]

@app.put('/api/admissions/{admission_id}/discharge')
def discharge_patient(admission_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin', 'Nurse'))):
    admission = db.query(models.Admission).filter(models.Admission.Admission_ID == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail='Admission not found')
    admission.Status = 'Discharged'
    admission.Discharge_Date = datetime.now()
    db.commit()
    return {"status": "success"}

# ==================== DIET PLAN APIs ====================

@app.get('/api/diet/{patient_id}')
def get_diet_plan(patient_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    # Check for actual records
    diets = db.query(models.Diet_Plan).join(models.Admission, models.Diet_Plan.Admission_ID == models.Admission.Admission_ID).filter(models.Admission.Patient_ID == patient_id).all()
    if not diets:
        # Mocking for prototype if no record exists
        return [
            {'Diet_Type': 'Breakfast', 'Instructions': 'Oatmeal with berries, Green Tea. Low sugar'},
            {'Diet_Type': 'Lunch', 'Instructions': 'Grilled chicken salad, Quinoa. High protein'},
            {'Diet_Type': 'Snack', 'Instructions': 'Almonds, Apple'},
            {'Diet_Type': 'Dinner', 'Instructions': 'Steamed fish, Broccoli, Brown Rice. No salt'}
        ]
    return diets

@app.post('/api/prescriptions/{presc_id}/diet-plan')
def create_diet_plan_from_prescription(presc_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Doctor', 'Nurse'))):
    prescription = db.query(models.Prescription).filter(models.Prescription.Prescription_ID == presc_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail='Prescription not found')
    
    meds = db.query(models.Medication).filter(models.Medication.Prescription_ID == presc_id).all()
    med_names = [m.Medicine_Name.lower() for m in meds]
    
    plan_text = "Standard recovery diet: High protein, low sodium. "
    if any(m in name for name in med_names for m in ['metformin', 'insulin', 'glyburide']):
        plan_text += "Low sugar/Diabetic friendly. "
    if any(m in name for name in med_names for m in ['lisinopril', 'amlodipine', 'losartan']):
        plan_text += "Low sodium/Heart healthy. "
    
    admission = db.query(models.Admission).filter(models.Admission.Patient_ID == prescription.Patient_ID, models.Admission.Status == 'Admitted').first()
    if not admission:
        raise HTTPException(status_code=400, detail="Patient must be admitted to have a formal diet plan record.")
        
    db_plan = models.Diet_Plan(
        Admission_ID=admission.Admission_ID,
        Diet_Type="Prescription-based",
        Instructions=plan_text
    )
    db.add(db_plan)
    db.commit()
    return {"status": "success", "plan": plan_text}

# ==================== BILLING & FINANCE APIs ====================

@app.get('/api/billing/generate/{patient_id}')
def generate_bill(patient_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin', 'Receptionist', 'Patient'))):
    lab_orders = db.query(models.Lab_Test_Catalog.Cost).join(models.Lab_Order, models.Lab_Order.Test_ID == models.Lab_Test_Catalog.Test_ID).filter(models.Lab_Order.Patient_ID == patient_id).all()
    lab_total = sum(order.Cost for order in lab_orders) if lab_orders else 0
    dispenses = db.query(models.Dispense_Log.Quantity_Dispensed, models.Inventory_Item.Unit_Price).join(models.Prescription, models.Dispense_Log.Prescription_ID == models.Prescription.Prescription_ID).join(models.Inventory_Item, models.Dispense_Log.Item_ID == models.Inventory_Item.Item_ID).filter(models.Prescription.Patient_ID == patient_id).all()
    pharmacy_total = sum(d.Quantity_Dispensed * d.Unit_Price for d in dispenses) if dispenses else 0
    room_total = 500 # Mocked
    appointments = db.query(models.Doctor.Consultation_Fee).join(models.Appointment, models.Appointment.Doctor_ID == models.Doctor.Doctor_ID).filter(models.Appointment.Patient_ID == patient_id, models.Appointment.Status == 'Completed').all()
    doctor_total = sum(apt.Consultation_Fee for apt in appointments) if appointments else 0
    grand_total = lab_total + pharmacy_total + room_total + doctor_total
    return {'Lab_Total': float(lab_total), 'Pharmacy_Total': float(pharmacy_total), 'Room_Total': float(room_total), 'Doctor_Total': float(doctor_total), 'Grand_Total': float(grand_total), 'Status': 'Pending'}

@app.get('/api/finance/summary')
def get_finance_summary(db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin'))):
    from sqlalchemy import func as sqlfunc
    total_bills = db.query(sqlfunc.sum(models.Bill.Total_Amount)).scalar() or 0
    total_paid = db.query(sqlfunc.sum(models.Payment.Amount)).scalar() or 0
    pending_bills = db.query(models.Bill).filter(models.Bill.Status == 'Pending').count()
    paid_bills = db.query(models.Bill).filter(models.Bill.Status == 'Paid').count()
    return {'Total_Billed': float(total_bills), 'Total_Collected': float(total_paid), 'Pending_Bills': pending_bills, 'Paid_Bills': paid_bills, 'Outstanding': float(total_bills - total_paid)}

# ==================== ADMIN & INVENTORY APIs ====================

@app.get('/api/staff')
def get_staff(db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin'))):
    staff = db.query(models.Staff).all()
    return [{'Staff_ID': s.Staff_ID, 'Name': s.Name, 'Role': s.Role, 'Contact': s.Contact, 'Email': s.Email, 'Status': s.Status, 'Join_Date': s.Join_Date.isoformat() if s.Join_Date else None} for s in staff]

@app.post('/api/staff')
def create_staff(staff: schemas.StaffCreate, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin'))):
    db_staff = models.Staff(
        Name=staff.Name, 
        Role=staff.Role, 
        Contact=staff.Contact, 
        Email=staff.Email,
        password_hash=get_password_hash(staff.password), 
        Status='Active'
    )
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    
    # If it's a doctor and a department was provided, create the doctor record
    if staff.Role == 'Doctor' and hasattr(staff, 'Department_ID') and staff.Department_ID:
        db_doctor = models.Doctor(
            Staff_ID=db_staff.Staff_ID,
            Department_ID=staff.Department_ID,
            Specialization="General Medicine", # Default
            License_No=f"LIC-{db_staff.Staff_ID}-{int(time.time())}" # Auto-generate
        )
        db.add(db_doctor)
        db.commit()
        
    return {"status": "success", "Staff_ID": db_staff.Staff_ID}

@app.delete('/api/staff/{staff_id}')
def delete_staff(staff_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin'))):
    staff = db.query(models.Staff).filter(models.Staff.Staff_ID == staff_id).first()
    if not staff: raise HTTPException(status_code=404, detail='Staff not found')
    db.delete(staff)
    db.commit()
    return {"status": "success"}

@app.get('/api/departments')
def get_departments(db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    depts = db.query(models.Department).all()
    result = []
    for d in depts:
        doc_count = db.query(models.Doctor).filter(models.Doctor.Department_ID == d.Department_ID).count()
        result.append({'Department_ID': d.Department_ID, 'Name': d.Name, 'Description': d.Description, 'Doctor_Count': doc_count})
    return result

@app.post('/api/departments/{dept_id}/assign-doctor')
def assign_doctor_to_department(dept_id: int, req: schemas.DoctorAssign, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin'))):
    doctor = db.query(models.Doctor).filter(models.Doctor.Doctor_ID == req.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail='Doctor not found')
    doctor.Department_ID = dept_id
    db.commit()
    return {'status': 'success'}

@app.get('/api/admin/stats')
def get_admin_stats(db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin'))):
    total_patients = db.query(models.Patient).count()
    total_staff = db.query(models.Staff).filter(models.Staff.Status == 'Active').count()
    total_rooms = db.query(models.Room).count()
    occupied_rooms = db.query(models.Room).filter(models.Room.Status == 'Occupied').count()
    total_depts = db.query(models.Department).count()
    occupancy = round((occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0)
    return {'Total_Patients': total_patients, 'Total_Staff': total_staff, 'Total_Rooms': total_rooms, 'Occupied_Rooms': occupied_rooms, 'Occupancy_Pct': occupancy, 'Total_Departments': total_depts}

@app.get('/api/inventory')
def get_inventory(db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin', 'Nurse', 'Receptionist', 'Doctor'))):
    return db.query(models.Inventory_Item).all()

@app.post('/api/inventory')
def add_inventory(item: schemas.InventoryCreate, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin'))):
    db_item = models.Inventory_Item(Item_Name=item.Item_Name, Stock_Quantity=item.Stock_Quantity, Unit_Price=item.Unit_Price)
    db.add(db_item)
    db.commit()
    return {"status": "success"}

@app.put('/api/inventory/{item_id}/restock')
def restock_item(item_id: int, restock: schemas.RestockSchema, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Admin'))):
    item = db.query(models.Inventory_Item).filter(models.Inventory_Item.Item_ID == item_id).first()
    if not item: raise HTTPException(status_code=404, detail='Item not found')
    item.Stock_Quantity += restock.quantity
    db.commit()
    return {"status": "success"}

@app.post("/api/dispense")
def dispense_medicine(req: schemas.RequestMedicineSchema, db: Session = Depends(get_db), current_user: TokenData = Depends(role_required('Nurse', 'Doctor'))):
    log = models.Dispense_Log(Prescription_ID=req.Prescription_ID, Item_ID=req.Item_ID, Quantity_Dispensed=req.Quantity_Dispensed)
    db.add(log)
    item = db.query(models.Inventory_Item).filter(models.Inventory_Item.Item_ID == req.Item_ID).first()
    if item and item.Stock_Quantity >= req.Quantity_Dispensed:
        item.Stock_Quantity -= req.Quantity_Dispensed
    db.commit()
    return {"status": "success"}

# ============ LEGACY / FALLBACK AUTH (GOOGLE) ============

@app.post('/api/auth/google')
def store_google_auth(data: schemas.GoogleAuthData, db: Session = Depends(get_db)):
    from sqlalchemy import text
    try:
        db.execute(text("INSERT INTO user_login (firebase_uid, email, display_name, role, last_login) VALUES (:uid, :email, :name, :role, NOW()) ON DUPLICATE KEY UPDATE display_name=:name, role=:role, last_login=NOW()"),
            {"uid": data.uid, "email": data.email, "name": data.displayName, "role": data.role})
        db.commit()
        return {"status": "success"}
    except Exception:
        db.rollback()
        return {"status": "stored_locally"}
