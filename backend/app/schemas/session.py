from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.schemas.session_schema import SessionExerciseResponse

# Accept any valid UUID, not only v4 (same as routine_schema.py).
UUID4 = UUID


class SessionCreate(BaseModel):
    patient_id: UUID4
    routine_id: UUID4
    duration_minutes: Optional[int] = None


class SessionResponse(BaseModel):
    id: UUID4
    patient_id: Optional[UUID4] = None
    routine_id: Optional[UUID4] = None
    date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    is_completed: Optional[bool] = None
    # One per routine_exercise, created by POST /api/sessions so the frontend can PUT progress; /complete returns [].
    session_exercises: list[SessionExerciseResponse] = []

    class Config:
        from_attributes = True
