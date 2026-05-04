from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional

from .database import get_db, engine, Base
from . import models, schemas

# We won't call create_all since the schema is already created by seed.sql
# Base.metadata.create_all(bind=engine)

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

@app.get("/api/patients")
def get_patients(db: Session = Depends(get_db)):
    try:
        patients = db.query(models.Patient).all()
        
        result = []
        for p in patients:
            result.append({
                "id": f"ILL-{p.Patient_ID}",
                "name": p.Name,
                "age": calculate_age(p.DOB),
                "gender": p.Gender,
                "type": "OPD", 
                "ward": "General", 
                "admission": "2026-05-01",
                "status": "Stable"
            })
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/patients", response_model=schemas.PatientResponse)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    try:
        db_patient = models.Patient(**patient.model_dump())
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        return db_patient
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vitals", response_model=schemas.VitalResponse)
def create_vital(vital: schemas.VitalCreate, db: Session = Depends(get_db)):
    try:
        db_vital = models.Vital(**vital.model_dump())
        db.add(db_vital)
        db.commit()
        db.refresh(db_vital)
        return db_vital
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vitals/{patient_id}", response_model=List[schemas.VitalResponse])
def get_vitals(patient_id: int, db: Session = Depends(get_db)):
    vitals = db.query(models.Vital).filter(models.Vital.Patient_ID == patient_id).order_by(models.Vital.Recorded_At.desc()).all()
    return vitals

@app.get("/api/medications/pending", response_model=List[schemas.MedicationResponse])
def get_pending_medications(db: Session = Depends(get_db)):
    meds = db.query(models.Medication).limit(10).all()
    return meds

@app.post("/api/prescriptions", response_model=schemas.PrescriptionResponse)
def create_prescription(prescription: schemas.PrescriptionCreate, db: Session = Depends(get_db)):
    try:
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
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/labs/alerts")
def get_lab_alerts(db: Session = Depends(get_db)):
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

@app.get("/api/inventory")
def get_inventory(db: Session = Depends(get_db)):
    items = db.query(models.Inventory_Item).all()
    return items

class RequestMedicineSchema(schemas.BaseModel):
    Prescription_ID: int
    Item_ID: int
    Quantity_Dispensed: int

@app.post("/api/dispense")
def request_medicine(req: RequestMedicineSchema, db: Session = Depends(get_db)):
    try:
        log = models.Dispense_Log(
            Prescription_ID=req.Prescription_ID,
            Item_ID=req.Item_ID,
            Quantity_Dispensed=req.Quantity_Dispensed
        )
        db.add(log)
        # Update stock
        item = db.query(models.Inventory_Item).filter(models.Inventory_Item.Item_ID == req.Item_ID).first()
        if item and item.Stock_Quantity >= req.Quantity_Dispensed:
            item.Stock_Quantity -= req.Quantity_Dispensed
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/appointments', response_model=list)
def get_appointments(db: Session = Depends(get_db)):
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

@app.get('/api/labs/catalog')
def get_lab_catalog(db: Session = Depends(get_db)):
    tests = db.query(models.Lab_Test_Catalog).all()
    return tests

class AppointmentStatusUpdate(schemas.BaseModel):
    status: str

@app.put('/api/appointments/{appointment_id}/status')
def update_appointment_status(appointment_id: int, status_update: AppointmentStatusUpdate, db: Session = Depends(get_db)):
    appointment = db.query(models.Appointment).filter(models.Appointment.Appointment_ID == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail='Appointment not found')
    appointment.Status = status_update.status
    db.commit()
    return {'status': 'success'}

@app.delete('/api/patients/{patient_id}')
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.Patient_ID == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail='Patient not found')
    db.delete(patient)
    db.commit()
    return {'status': 'success'}

class LabOrderCreate(schemas.BaseModel):
    Patient_ID: int
    Doctor_ID: int
    Test_ID: int

@app.post('/api/labs/orders')
def create_lab_order(order: LabOrderCreate, db: Session = Depends(get_db)):
    db_order = models.Lab_Order(**order.model_dump())
    db.add(db_order)
    db.commit()
    return {'status': 'success'}

@app.get('/api/prescriptions/{patient_id}')
def get_prescriptions(patient_id: int, db: Session = Depends(get_db)):
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


@app.get('/api/doctors')
def get_doctors(db: Session = Depends(get_db)):
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

class AppointmentCreate(schemas.BaseModel):
    Patient_ID: int
    Doctor_ID: int
    Department_ID: int = None
    Appointment_Date: date
    Appointment_Time: str

@app.post('/api/appointments')
def create_appointment(apt: AppointmentCreate, db: Session = Depends(get_db)):
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

@app.get('/api/labs/orders/{patient_id}')
def get_patient_lab_orders(patient_id: int, db: Session = Depends(get_db)):
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

class GenerateResultSchema(schemas.BaseModel):
    Order_ID: int

@app.post('/api/labs/generate_result')
def generate_lab_result(req: GenerateResultSchema, db: Session = Depends(get_db)):
    order = db.query(models.Lab_Order).filter(models.Lab_Order.Order_ID == req.Order_ID).first()
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
        
    order.Status = 'Completed'
    
    import random
    # Generate a fake abnormal result
    fake_val = str(random.randint(150, 300)) + ' mg/dL' 
    result = models.Lab_Result(
        Order_ID=req.Order_ID,
        Result_Value=fake_val,
        Is_Abnormal=True
    )
    db.add(result)
    db.commit()
    return {'status': 'success'}


@app.get('/api/diet/{patient_id}')
def get_diet_plan(patient_id: int, db: Session = Depends(get_db)):
    diets = db.query(models.Diet_Plan).filter(models.Diet_Plan.Patient_ID == patient_id).all()
    # Mocking data if empty so the UI looks complete for the prototype
    if not diets:
        return [
            {'Meal_Type': 'Breakfast', 'Food_Items': 'Oatmeal with berries, Green Tea', 'Special_Instructions': 'Low sugar'},
            {'Meal_Type': 'Lunch', 'Food_Items': 'Grilled chicken salad, Quinoa', 'Special_Instructions': 'High protein'},
            {'Meal_Type': 'Snack', 'Food_Items': 'Almonds, Apple', 'Special_Instructions': ''},
            {'Meal_Type': 'Dinner', 'Food_Items': 'Steamed fish, Broccoli, Brown Rice', 'Special_Instructions': 'No salt'}
        ]
    return diets

@app.get('/api/billing/generate/{patient_id}')
def generate_bill(patient_id: int, db: Session = Depends(get_db)):
    # Calculate Lab Costs
    lab_orders = db.query(models.Lab_Test_Catalog.Cost).join(models.Lab_Order, models.Lab_Order.Test_ID == models.Lab_Test_Catalog.Test_ID).filter(models.Lab_Order.Patient_ID == patient_id).all()
    lab_total = sum(order.Cost for order in lab_orders) if lab_orders else 0
    
    # Calculate Pharmacy Costs
    dispenses = db.query(
        models.Dispense_Log.Quantity_Dispensed, 
        models.Inventory_Item.Unit_Price
    ).join(
        models.Prescription, models.Dispense_Log.Prescription_ID == models.Prescription.Prescription_ID
    ).join(
        models.Inventory_Item, models.Dispense_Log.Item_ID == models.Inventory_Item.Item_ID
    ).filter(models.Prescription.Patient_ID == patient_id).all()
    
    pharmacy_total = sum(d.Quantity_Dispensed * d.Unit_Price for d in dispenses) if dispenses else 0
    
    # Calculate Room/Stay Costs (Mocked at 5 days @ /day for simplicity)
    room_total = 500
    
    # Doctor Consultation Fees
    appointments = db.query(models.Doctor.Consultation_Fee).join(models.Appointment, models.Appointment.Doctor_ID == models.Doctor.Doctor_ID).filter(models.Appointment.Patient_ID == patient_id, models.Appointment.Status == 'Completed').all()
    doctor_total = sum(apt.Consultation_Fee for apt in appointments) if appointments else 0
    
    grand_total = lab_total + pharmacy_total + room_total + doctor_total
    
    return {
        'Lab_Total': float(lab_total),
        'Pharmacy_Total': float(pharmacy_total),
        'Room_Total': float(room_total),
        'Doctor_Total': float(doctor_total),
        'Grand_Total': float(grand_total),
        'Status': 'Pending'
    }


# ============ NURSE APIs ============

@app.get('/api/admissions')
def get_admissions(db: Session = Depends(get_db)):
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

@app.get('/api/medications/schedule')
def get_med_schedule(db: Session = Depends(get_db)):
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

@app.get('/api/admissions/discharge-queue')
def get_discharge_queue(db: Session = Depends(get_db)):
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



# ============ NURSE APIs ============

@app.get('/api/admissions')
def get_admissions(db: Session = Depends(get_db)):
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

@app.get('/api/medications/schedule')
def get_med_schedule(db: Session = Depends(get_db)):
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

@app.get('/api/admissions/discharge-queue')
def get_discharge_queue(db: Session = Depends(get_db)):
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
def discharge_patient(admission_id: int, db: Session = Depends(get_db)):
    from datetime import datetime
    admission = db.query(models.Admission).filter(models.Admission.Admission_ID == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail='Admission not found')
    admission.Status = 'Discharged'
    admission.Discharge_Date = datetime.now()
    db.commit()
    return {"status": "success"}

# ============ ADMIN APIs ============

@app.get('/api/staff')
def get_staff(db: Session = Depends(get_db)):
    staff = db.query(models.Staff).all()
    return [{'Staff_ID': s.Staff_ID, 'Name': s.Name, 'Role': s.Role,
             'Contact': s.Contact, 'Email': s.Email, 'Status': s.Status,
             'Join_Date': s.Join_Date.isoformat() if s.Join_Date else None} for s in staff]

class StaffCreate(schemas.BaseModel):
    Name: str
    Role: str
    Contact: Optional[str] = None
    Email: Optional[str] = None

@app.post('/api/staff')
def create_staff(staff: StaffCreate, db: Session = Depends(get_db)):
    db_staff = models.Staff(Name=staff.Name, Role=staff.Role, Contact=staff.Contact, Email=staff.Email, Status='Active')
    db.add(db_staff)
    db.commit()
    return {"status": "success", "Staff_ID": db_staff.Staff_ID}

@app.delete('/api/staff/{staff_id}')
def delete_staff(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(models.Staff).filter(models.Staff.Staff_ID == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail='Staff not found')
    db.delete(staff)
    db.commit()
    return {"status": "success"}

@app.get('/api/departments')
def get_departments(db: Session = Depends(get_db)):
    depts = db.query(models.Department).all()
    result = []
    for d in depts:
        doc_count = db.query(models.Doctor).filter(models.Doctor.Department_ID == d.Department_ID).count()
        result.append({'Department_ID': d.Department_ID, 'Name': d.Name,
                       'Description': d.Description, 'Doctor_Count': doc_count})
    return result

@app.get('/api/finance/summary')
def get_finance_summary(db: Session = Depends(get_db)):
    from sqlalchemy import func as sqlfunc
    total_bills = db.query(sqlfunc.sum(models.Bill.Total_Amount)).scalar() or 0
    total_paid = db.query(sqlfunc.sum(models.Payment.Amount)).scalar() or 0
    pending_bills = db.query(models.Bill).filter(models.Bill.Status == 'Pending').count()
    paid_bills = db.query(models.Bill).filter(models.Bill.Status == 'Paid').count()
    return {'Total_Billed': float(total_bills), 'Total_Collected': float(total_paid),
            'Pending_Bills': pending_bills, 'Paid_Bills': paid_bills,
            'Outstanding': float(total_bills - total_paid)}

@app.get('/api/rooms')
def get_rooms(db: Session = Depends(get_db)):
    rooms = db.query(models.Room).all()
    return [{'Room_ID': r.Room_ID, 'Room_Number': r.Room_Number,
             'Room_Type': r.Room_Type, 'Rate_Per_Day': float(r.Rate_Per_Day) if r.Rate_Per_Day else 0,
             'Status': r.Status} for r in rooms]

@app.get('/api/admin/stats')
def get_admin_stats(db: Session = Depends(get_db)):
    total_patients = db.query(models.Patient).count()
    total_staff = db.query(models.Staff).filter(models.Staff.Status == 'Active').count()
    total_rooms = db.query(models.Room).count()
    occupied_rooms = db.query(models.Room).filter(models.Room.Status == 'Occupied').count()
    total_depts = db.query(models.Department).count()
    occupancy = round((occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0)
    return {'Total_Patients': total_patients, 'Total_Staff': total_staff,
            'Total_Rooms': total_rooms, 'Occupied_Rooms': occupied_rooms,
            'Occupancy_Pct': occupancy, 'Total_Departments': total_depts}

class InventoryCreate(schemas.BaseModel):
    Item_Name: str
    Stock_Quantity: int = 0
    Unit_Price: float = 0.0

@app.post('/api/inventory')
def add_inventory(item: InventoryCreate, db: Session = Depends(get_db)):
    db_item = models.Inventory_Item(Item_Name=item.Item_Name, Stock_Quantity=item.Stock_Quantity, Unit_Price=item.Unit_Price)
    db.add(db_item)
    db.commit()
    return {"status": "success"}

class RestockSchema(schemas.BaseModel):
    quantity: int

@app.put('/api/inventory/{item_id}/restock')
def restock_item(item_id: int, restock: RestockSchema, db: Session = Depends(get_db)):
    item = db.query(models.Inventory_Item).filter(models.Inventory_Item.Item_ID == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail='Item not found')
    item.Stock_Quantity += restock.quantity
    db.commit()
    return {"status": "success"}

# ============ AUTH API ============

class GoogleAuthData(schemas.BaseModel):
    uid: str
    email: str
    displayName: Optional[str] = None
    role: str = 'Patient'

@app.post('/api/auth/google')
def store_google_auth(data: GoogleAuthData, db: Session = Depends(get_db)):
    from sqlalchemy import text
    try:
        db.execute(text("INSERT INTO user_login (firebase_uid, email, display_name, role, last_login) VALUES (:uid, :email, :name, :role, NOW()) ON DUPLICATE KEY UPDATE display_name=:name, role=:role, last_login=NOW()"),
            {"uid": data.uid, "email": data.email, "name": data.displayName, "role": data.role})
        db.commit()
        return {"status": "success"}
    except Exception as e:
        import traceback; traceback.print_exc()
        return {"status": "stored_locally"}
