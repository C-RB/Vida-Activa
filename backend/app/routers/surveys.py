from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import require_patient
from app.models.user_model import User
from app.models.survey_model import Survey
from app.schemas.survey_schema import SurveyCreatePre, SurveyCreatePost, SurveyResponse

router = APIRouter(
    prefix="/surveys",
    tags=["surveys"],
)

@router.post("/pre", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
def create_pre_survey(
    survey_in: SurveyCreatePre,
    db: Session = Depends(get_db),
    _patient: User = Depends(require_patient),
):
    new_survey = Survey(
        session_id=survey_in.session_id,
        type='PRE_SESSION',
        pain_level=survey_in.pain_level,
        fatigue_level=survey_in.fatigue_level,
        mood_level=survey_in.mood_level,
        comments=survey_in.comments
    )
    db.add(new_survey)
    db.commit()
    db.refresh(new_survey)
    return new_survey

@router.post("/post", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
def create_post_survey(
    survey_in: SurveyCreatePost,
    db: Session = Depends(get_db),
    _patient: User = Depends(require_patient),
):
    # Mood: "Muy mal"(1), "Mal"(2), "Regular"(3), "Bien"(4), "Muy bien"(5)
    new_survey = Survey(
        session_id=survey_in.session_id,
        type='POST_SESSION',
        mood_level=survey_in.mood_level,
        pain_area=survey_in.pain_area,
        comments=survey_in.comments
    )
    db.add(new_survey)
    db.commit()
    db.refresh(new_survey)
    return new_survey
