from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class SessionItem(BaseModel):
    id: str
    name: str
    duration: str
    date: str
    dateIso: Optional[str] = None
    completed: bool

class ComplianceMetrics(BaseModel):
    sessionsCompleted: int
    sessionsTotal: int
    adherencePercent: int

class PatientListResponse(BaseModel):
    id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    created_at: Optional[datetime] = None
    hasAlert: bool = False
    alertMessage: Optional[str] = None
    rut: Optional[str] = None
    age: Optional[int] = None

    model_config = {"from_attributes": True}


class PatientBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr


class PatientCreate(PatientBase):
    password: str


class PatientCreateResponse(PatientBase):
    id: str
    role: str

    model_config = {"from_attributes": True}


class CreatePatientRequest(BaseModel):
    fullName: str
    email: EmailStr
    rut: str
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None

    def split_name(self) -> tuple[str, str]:
        parts = self.fullName.strip().split(" ", 1)
        return parts[0], (parts[1] if len(parts) > 1 else "")


class PatientResponse(BaseModel):
    id: str
    fullName: str
    email: str
    active: bool
    # Optional patient-specific fields (returned by /by-rut). Declared here so
    # FastAPI's response_model doesn't strip them from the response.
    rut: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    metrics: Optional[ComplianceMetrics] = None
    sessions: Optional[List[SessionItem]] = None
    # Only set by /by-rut: whether the searching specialist already has this patient. Contact data and
    # metrics are withheld until the patient is assigned.
    assigned: Optional[bool] = None

    model_config = {"from_attributes": True}


class PatientStatusUpdate(BaseModel):
    active: bool


class AssignPatientRequest(BaseModel):
    rut: str
