from datetime import date, time, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel

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
    day_of_week: int
    scheduled_time: time
    exercises: List[RoutineExerciseCreate]


class RoutineResponse(BaseModel):
    id: UUID4
    specialist_id: UUID4
    patient_id: UUID4
    name: str
    start_date: date
    end_date: date
    day_of_week: int
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
