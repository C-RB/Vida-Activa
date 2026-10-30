from datetime import date as date_type, datetime, time as time_type
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user, require_specialist, require_patient
from app.models.user_model import User, UserRole
from app.models.appointment_model import Appointment, AppointmentStatus
from app.schemas.appointment_schema import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentStatusUpdate,
    AvailableSlotsResponse,
    TimeSlotResponse,
)

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

# Clinic hours: 30-minute slots from 08:00 to 20:00 (the last slot starts before 20:00).
WORKING_START_HOUR = 8
WORKING_END_HOUR = 20
SLOT_MINUTES = 30


def _build_working_slots() -> list[str]:
    slots: list[str] = []
    minute = WORKING_START_HOUR * 60
    end = WORKING_END_HOUR * 60
    while minute < end:
        slots.append(f"{minute // 60:02d}:{minute % 60:02d}")
        minute += SLOT_MINUTES
    return slots


WORKING_SLOTS = _build_working_slots()

# Statuses that occupy a slot (a cancelled appointment frees it).
ACTIVE_STATUSES = (
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
)


def _full_name(user: Optional[User]) -> str:
    if not user:
        return ""
    return f"{user.first_name or ''} {user.last_name or ''}".strip()


def _to_response(db: Session, appointment: Appointment) -> AppointmentResponse:
    patient = db.query(User).filter(User.id == appointment.patient_id).first()
    specialist = db.query(User).filter(User.id == appointment.specialist_id).first()
    return AppointmentResponse(
        id=appointment.id,
        specialist_id=appointment.specialist_id,
        patient_id=appointment.patient_id,
        patient_name=_full_name(patient),
        specialist_name=_full_name(specialist),
        date=appointment.date,
        time_slot=appointment.time_slot,
        status=appointment.status,
        notes=appointment.notes,
    )


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    body: AppointmentCreate,
    db: Session = Depends(get_db),
    specialist: User = Depends(require_specialist),
):
    """Books an appointment for a patient; the specialist comes from the token."""
    # Prevents double-booking the same slot (date + time) for this specialist.
    clash = (
        db.query(Appointment)
        .filter(
            Appointment.specialist_id == specialist.id,
            Appointment.date == body.date,
            Appointment.time_slot == body.time_slot,
            Appointment.status.in_(ACTIVE_STATUSES),
        )
        .first()
    )
    if clash:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ese horario ya está ocupado.",
        )

    appointment = Appointment(
        specialist_id=specialist.id,
        patient_id=body.patient_id,
        date=body.date,
        time_slot=body.time_slot,
        status=AppointmentStatus.CONFIRMED,
        notes=body.notes,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return _to_response(db, appointment)


@router.get("/available-slots", response_model=AvailableSlotsResponse)
def get_available_slots(
    date: date_type = Query(...),
    db: Session = Depends(get_db),
    specialist: User = Depends(require_specialist),
):
    """Fixed slots for the day, flagging the ones already booked."""
    taken = {
        appt.time_slot.strftime("%H:%M")
        for appt in (
            db.query(Appointment)
            .filter(
                Appointment.specialist_id == specialist.id,
                Appointment.date == date,
                Appointment.status.in_(ACTIVE_STATUSES),
            )
            .all()
        )
        if appt.time_slot is not None
    }
    slots = [
        TimeSlotResponse(time=slot, available=slot not in taken)
        for slot in WORKING_SLOTS
    ]
    return AvailableSlotsResponse(date=date, slots=slots)


@router.get("/next", response_model=Optional[AppointmentResponse])
def get_next_appointment(
    db: Session = Depends(get_db),
    patient: User = Depends(require_patient),
):
    """Next future appointment of the authenticated patient (or null)."""
    today = datetime.now().date()
    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.patient_id == patient.id,
            Appointment.date >= today,
            Appointment.status.in_(ACTIVE_STATUSES),
        )
        .order_by(Appointment.date.asc(), Appointment.time_slot.asc())
        .first()
    )
    if not appointment:
        return None
    return _to_response(db, appointment)


@router.get("", response_model=list[AppointmentResponse])
def list_appointments(
    date: Optional[date_type] = Query(None),
    patient_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lists the authenticated user's appointments: a specialist's booked ones (optionally for one patient)
    or the patient's own. Optional filters: date (YYYY-MM-DD), patient_id.
    """
    query = db.query(Appointment)

    if current_user.role == UserRole.SPECIALIST:
        query = query.filter(Appointment.specialist_id == current_user.id)
        if patient_id is not None:
            query = query.filter(Appointment.patient_id == patient_id)
    elif current_user.role == UserRole.PATIENT:
        query = query.filter(Appointment.patient_id == current_user.id)
    else:  # ADMIN sees everything, with an optional patient filter
        if patient_id is not None:
            query = query.filter(Appointment.patient_id == patient_id)

    if date is not None:
        query = query.filter(Appointment.date == date)

    appointments = query.order_by(
        Appointment.date.asc(), Appointment.time_slot.asc()
    ).all()
    return [_to_response(db, appt) for appt in appointments]


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: UUID,
    body: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    specialist: User = Depends(require_specialist),
):
    """Updates an appointment status (e.g. cancel or mark as completed)."""
    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id == appointment_id,
            Appointment.specialist_id == specialist.id,
        )
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    appointment.status = body.status
    db.commit()
    db.refresh(appointment)
    return _to_response(db, appointment)
