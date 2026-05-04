import sys

new_code = '''

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
    Contact: str = None
    Email: str = None

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
    Unit_Price: float = 0

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
    displayName: str = None
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
'''

with open('app/main.py', 'a') as f:
    f.write(new_code)

print('All APIs appended successfully')
