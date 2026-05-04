from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class PatientBase(BaseModel):
    Name: str
    DOB: Optional[date] = None
    Gender: Optional[str] = None
    Contact: Optional[str] = None
    Address: Optional[str] = None
    Emergency_Contact: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    Patient_ID: int

    class Config:
        from_attributes = True

class MedicationBase(BaseModel):
    Medicine_Name: str
    Dosage: str
    Duration: str
    Instructions: str

class MedicationCreate(MedicationBase):
    pass

class MedicationResponse(MedicationBase):
    Medication_ID: int
    Prescription_ID: int
    
    class Config:
        from_attributes = True

class VitalBase(BaseModel):
    Patient_ID: int
    Heart_Rate: Optional[int] = None
    Blood_Pressure: Optional[str] = None
    Temperature: Optional[float] = None
    Oxygen_Saturation: Optional[int] = None

class VitalCreate(VitalBase):
    pass

class VitalResponse(VitalBase):
    Vital_ID: int
    
    class Config:
        from_attributes = True

class PrescriptionCreate(BaseModel):
    Patient_ID: int
    Doctor_ID: int
    Notes: str
    Medications: List[MedicationCreate] = []

class PrescriptionResponse(BaseModel):
    Prescription_ID: int
    Patient_ID: int
    Doctor_ID: int
    Notes: str
    
    class Config:
        from_attributes = True
