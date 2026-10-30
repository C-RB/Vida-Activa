import { apiFetch } from "./apiClient";
import { getPatientById } from "./patientService";

export interface TimeSlot {
  id: string;
  time: string;        // "HH:MM"
  available: boolean;
  note?: string;
}

export interface AppointmentPatient {
  id: string;
  fullName: string;
}

export interface AppointmentPayload {
  patientId: string;
  date: Date;
  timeSlot: string;    // "HH:MM"
}

export interface NextAppointment {
  id: string;
  date: string;        // "YYYY-MM-DD"
  time: string;        // "10:00 AM"
  specialistName: string;
}

interface RawSlot {
  time: string;
  available: boolean;
}

interface RawAvailableSlots {
  date: string;
  slots: RawSlot[];
}

interface RawAppointment {
  id: string;
  specialist_id: string | null;
  patient_id: string | null;
  patient_name: string;
  specialist_name: string;
  date: string;
  time_slot: string;
  status: string;
  notes: string | null;
}

// Local "YYYY-MM-DD" (toISOString would shift the day across time zones).
const toDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// "14:30:00" → "02:30 PM"
const formatTime = (timeSlot: string): string => {
  const [hStr, mStr] = timeSlot.split(":");
  let h = Number.parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${mStr ?? "00"} ${period}`;
};

export const getAvailableSlots = async (date: Date): Promise<TimeSlot[]> => {
  const raw = await apiFetch<RawAvailableSlots>(
    `/api/appointments/available-slots?date=${toDateString(date)}`,
    { method: "GET", auth: true }
  );
  return raw.slots.map((s) => ({
    id: s.time,
    time: s.time,
    available: s.available,
  }));
};

export const getPatientForAppointment = async (
  id: string
): Promise<AppointmentPatient> => {
  const patient = await getPatientById(id);
  return { id: patient.id, fullName: patient.fullName };
};

export const confirmAppointment = async (
  payload: AppointmentPayload
): Promise<void> => {
  await apiFetch("/api/appointments", {
    method: "POST",
    auth: true,
    body: {
      patient_id: payload.patientId,
      date: toDateString(payload.date),
      time_slot: payload.timeSlot,
    },
  });
};

export const getNextAppointment = async (): Promise<NextAppointment | null> => {
  const raw = await apiFetch<RawAppointment | null>(
    "/api/appointments/next",
    { method: "GET", auth: true }
  );
  if (!raw) return null;
  return {
    id: raw.id,
    date: raw.date,
    time: formatTime(raw.time_slot),
    specialistName: raw.specialist_name,
  };
};
