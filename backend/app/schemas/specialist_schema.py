from typing import Literal

from pydantic import BaseModel


class DashboardSpecialist(BaseModel):
    full_name: str
    specialty: str | None = None


class DashboardStats(BaseModel):
    total_patients: int
    active_today: int
    alerts: int
    avg_adherence: int


class DashboardProgress(BaseModel):
    sessions_completed_today: int
    sessions_total_today: int
    daily_compliance: int


class DashboardAttention(BaseModel):
    # A patient that needs the specialist's attention, and why.
    patient_id: str
    full_name: str
    reason: str
    kind: Literal["pain", "inactive", "no_sessions"]


class SpecialistDashboardResponse(BaseModel):
    specialist: DashboardSpecialist
    stats: DashboardStats
    progress: DashboardProgress
    attention: list[DashboardAttention] = []


# Own profile (GET/PATCH /api/specialists/me)─────


class SpecialistMeResponse(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str
    rut: str | None = None
    specialty: str | None = None
    phone: str | None = None
    is_active: bool


class SpecialistMeUpdate(BaseModel):
    # All optional: only the fields present are applied (partial PATCH).
    first_name: str | None = None
    last_name: str | None = None
    specialty: str | None = None
    phone: str | None = None
