from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.core.deps import get_current_user, require_specialist
from app.models.user_model import User
from app.models.routine_model import Routine, RoutineExercise
from app.schemas.routine_schema import (
    RoutineCreate,
    RoutineResponse,
    RoutineWithExercisesResponse,
)

router = APIRouter(prefix="/api/routines", tags=["routines"])


@router.post("", response_model=RoutineResponse)
def create_routine(
    body: RoutineCreate,
    db: Session = Depends(get_db),
    specialist: User = Depends(require_specialist),
):
    routine = Routine(
        specialist_id=specialist.id,
        patient_id=body.patient_id,
        name=body.name,
        start_date=body.start_date,
        end_date=body.end_date,
        day_of_week=body.day_of_week,
        scheduled_time=body.scheduled_time,
    )
    db.add(routine)
    db.flush()  # assigns routine.id without ending the transaction

    for exercise in body.exercises:
        db.add(
            RoutineExercise(
                routine_id=routine.id,
                exercise_id=exercise.exercise_id,
                order_index=exercise.order_index,
                level=exercise.level,
                total_series=exercise.total_series,
                total_reps=exercise.total_reps,
                rest_time_seconds=exercise.rest_time_seconds,
                time_limit_seconds=exercise.time_limit_seconds,
            )
        )

    db.commit()
    db.refresh(routine)
    return routine


@router.get("/active", response_model=RoutineWithExercisesResponse)
def get_active_routine(
    patient_id: UUID = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns today's routine for the patient: the latest one (start_date, then created_at) whose date range
    includes today and whose day_of_week matches (1 = Monday … 7 = Sunday, like isoweekday()).
    """
    today = date.today()
    weekday = today.isoweekday()  # 1 (Monday) .. 7 (Sunday)

    routine = (
        db.query(Routine)
        .options(joinedload(Routine.exercises))
        .filter(
            Routine.patient_id == patient_id,
            Routine.start_date <= today,
            Routine.end_date >= today,
            Routine.day_of_week == weekday,
        )
        .order_by(Routine.start_date.desc(), Routine.created_at.desc())
        .first()
    )

    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sin rutina activa para hoy",
        )

    return routine


@router.delete("/{routine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_routine(
    routine_id: UUID,
    db: Session = Depends(get_db),
    specialist: User = Depends(require_specialist),
):
    """Hard-deletes a routine; routine_exercises go away through ON DELETE CASCADE. Returns 204."""
    routine = db.query(Routine).filter(Routine.id == routine_id).first()
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rutina no encontrada",
        )

    # session_exercises.routine_exercise_id has no ON DELETE rule in existing volumes (init.sql now uses SET NULL
    # but needs a re-init), so its metrics are deleted manually. The sessions rows stay, keeping the patient history.
    db.execute(
        text(
            """
            DELETE FROM session_exercises
            WHERE routine_exercise_id IN (
                SELECT id FROM routine_exercises WHERE routine_id = :routine_id
            )
            """
        ),
        {"routine_id": str(routine_id)},
    )

    # sessions.routine_id has the same problem in existing volumes: detach the sessions (routine_id = NULL)
    # instead of deleting them, to keep the history.
    db.execute(
        text("UPDATE sessions SET routine_id = NULL WHERE routine_id = :routine_id"),
        {"routine_id": str(routine_id)},
    )
    db.flush()

    db.delete(routine)
    db.commit()
    return None


@router.get("", response_model=list[RoutineWithExercisesResponse])
def get_routines(
    patient_id: UUID = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Routine)
        .options(joinedload(Routine.exercises))
        .filter(Routine.patient_id == patient_id)
        .all()
    )
