from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class SurveyCreatePre(BaseModel):
    session_id: UUID
    pain_level: int = Field(ge=1, le=10, description="Nivel de dolor (1-10)")
    fatigue_level: int = Field(ge=1, le=10, description="Nivel de cansancio (1-10)")
    mood_level: Optional[int] = Field(default=None, ge=1, le=5, description="Estado de ánimo (1-5)")
    comments: Optional[str] = None

class SurveyCreatePost(BaseModel):
    session_id: UUID
    mood_level: int = Field(ge=1, le=5, description="Nivel de ánimo (1-5)")
    # Where it hurt during the exercise; omitted when there was no pain.
    pain_area: Optional[str] = None
    comments: Optional[str] = None

class SurveyResponse(BaseModel):
    id: UUID
    session_id: UUID
    type: str
    pain_level: Optional[int]
    fatigue_level: Optional[int]
    mood_level: Optional[int] = None
    pain_area: Optional[str] = None
    comments: Optional[str]

    class Config:
        from_attributes = True
