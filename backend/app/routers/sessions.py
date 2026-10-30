from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession
from uuid import UUID

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user_model import User
from app.models.session import Session as SessionModel
from app.models.session_model import SessionExercise
from app.models.routine_model import RoutineExercise
from app.schemas.session import SessionCreate, SessionResponse
from app.schemas.session_schema import SessionExerciseUpdate, SessionExerciseResponse

router = APIRouter(
    prefix="/api/sessions",
    tags=["sessions"]
)


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    session_data: SessionCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creates a session (not completed, date set by the DB) and one session_exercises row per routine
    exercise (ordered by order_index, counters at 0), so the frontend gets real ids for the progress PUT.
    """
    new_session = SessionModel(
        patient_id=session_data.patient_id,
        routine_id=session_data.routine_id,
        duration_minutes=session_data.duration_minutes,
        is_completed=False,
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    routine_exercises = (
        db.query(RoutineExercise)
        .filter(RoutineExercise.routine_id == session_data.routine_id)
        .order_by(RoutineExercise.order_index)
        .all()
    )

    session_exercises = []
    for routine_exercise in routine_exercises:
        session_exercise = SessionExercise(
            session_id=new_session.id,
            exercise_id=routine_exercise.exercise_id,
            routine_exercise_id=routine_exercise.id,
            series_completed=0,
            reps_completed=0,
            accuracy_score=None,
            feedback=None,
        )
        db.add(session_exercise)
        session_exercises.append(session_exercise)

    db.commit()
    for session_exercise in session_exercises:
        db.refresh(session_exercise)

    # Attached by hand: SessionModel has no ORM relationship with session_exercises.
    new_session.session_exercises = session_exercises

    return new_session


@router.get("/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: UUID,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns a session with its session_exercises (real series_completed / reps_completed) and duration."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.session_exercises = (
        db.query(SessionExercise)
        .filter(SessionExercise.session_id == session_id)
        .all()
    )
    return session


@router.post("/{session_id}/complete", response_model=SessionResponse)
def complete_session(
    session_id: UUID,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Marks a session as completed and computes its duration in minutes."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.is_completed = True

    # Duration = minutes since creation (sessions.date, a naive-UTC TIMESTAMP like datetime.utcnow()).
    # max(0, ...) guards against clock skew.
    if session.date:
        elapsed_minutes = (datetime.utcnow() - session.date).total_seconds() / 60
        session.duration_minutes = max(0, round(elapsed_minutes))

    db.commit()
    db.refresh(session)

    return session


@router.put("/{session_id}/exercises/{session_exercise_id}", response_model=SessionExerciseResponse)
def update_exercise_progress(
    session_id: UUID,
    session_exercise_id: UUID,
    exercise_data: SessionExerciseUpdate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Updates the completed series and reps of an exercise in a session."""
    session_exercise = db.query(SessionExercise).filter(SessionExercise.id == session_exercise_id).first()

    if not session_exercise:
        raise HTTPException(status_code=404, detail="Exercise for this session not found")

    session_exercise.series_completed = exercise_data.series_completed
    session_exercise.reps_completed = exercise_data.reps_completed

    if exercise_data.accuracy_score is not None:
        session_exercise.accuracy_score = exercise_data.accuracy_score

    if exercise_data.feedback is not None:
        session_exercise.feedback = exercise_data.feedback

    db.commit()
    db.refresh(session_exercise)

    return session_exercise
