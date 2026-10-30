from uuid import UUID
from pydantic import BaseModel
from typing import Optional

# Accept any valid UUID, not only v4 (same as routine_schema.py).
UUID4 = UUID

class SessionExerciseUpdate(BaseModel):
    series_completed: int
    reps_completed: int
    accuracy_score: Optional[float] = None
    feedback: Optional[str] = None

class SessionExerciseResponse(BaseModel):
    id: UUID4
    session_id: UUID4
    exercise_id: str
    series_completed: int
    reps_completed: int
    accuracy_score: Optional[float] = None
    feedback: Optional[str] = None
    
    class Config:
        from_attributes = True
