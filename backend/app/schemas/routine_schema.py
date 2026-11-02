from datetime import date, time, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

# Accept any valid UUID, not only v4: seeded or imported data may use other versions.
UUID4 = UUID


class RoutineExerciseCreate(BaseModel):
    exercise_id: str
    order_index: int
    level: int
    total_series: int
    total_reps: int
    rest_time_seconds: Optional[int] = None
    time_limit_seconds: Optional[int] = None


class RoutineCreate(BaseModel):
    patient_id: UUID4
    name: str
    start_date: date
    end_date: date
    # Weekdays, 1 = Monday … 7 = Sunday; at least one.
    days_of_week: List[int] = Field(min_length=1)
    scheduled_time: time
    exercises: List[RoutineExerciseCreate]

    @field_validator("days_of_week")
    @classmethod
    def _valid_days(cls, days: List[int]) -> List[int]:
        if any(d < 1 or d > 7 for d in days):
            raise ValueError("days_of_week must be between 1 and 7")
        return sorted(set(days))


class RoutineUpdate(RoutineCreate):
    # Same fields as a new routine; the patient cannot change.
    patient_id: UUID4 | None = None


class RoutineResponse(BaseModel):
    id: UUID4
    specialist_id: UUID4
    patient_id: UUID4
    name: str
    start_date: date
    end_date: date
    days_of_week: List[int]
    scheduled_time: time
    created_at: datetime

    model_config = {"from_attributes": True}


class RoutineExerciseResponse(BaseModel):
    id: UUID4
    exercise_id: str
    order_index: int
    level: int
    total_series: int
    total_reps: int
    rest_time_seconds: Optional[int] = None
    time_limit_seconds: Optional[int] = None

    model_config = {"from_attributes": True}


class RoutineWithExercisesResponse(RoutineResponse):
    exercises: List[RoutineExerciseResponse]
