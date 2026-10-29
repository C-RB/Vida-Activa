import { apiFetch, ApiError } from "./apiClient";

export interface RoutineExerciseCreate {
  exercise_id: string;
  order_index: number;
  level: number;
  total_series: number;
  total_reps: number;
  rest_time_seconds?: number | null;
  time_limit_seconds?: number | null;
}

// Dates and times travel as ISO strings ("2026-06-13", "10:30:00").
export interface RoutineCreate {
  patient_id: string;
  name: string;
  start_date: string;
  end_date: string;
  day_of_week: number;
  scheduled_time: string;
  exercises: RoutineExerciseCreate[];
}

export interface Routine {
  id: string;
  specialist_id: string;
  patient_id: string;
  name: string;
  start_date: string;
  end_date: string;
  day_of_week: number;
  scheduled_time: string;
  created_at: string;
}

export interface RoutineExercise {
  id: string;
  exercise_id: string;
  order_index: number;
  level: number;
  total_series: number;
  total_reps: number;
  rest_time_seconds: number | null;
  time_limit_seconds: number | null;
}

export interface RoutineWithExercises extends Routine {
  exercises: RoutineExercise[];
}

export const createRoutine = (data: RoutineCreate): Promise<Routine> =>
  apiFetch<Routine>("/api/routines", {
    method: "POST",
    auth: true,
    body: data,
  });

export const deleteRoutine = (routineId: string): Promise<void> =>
  apiFetch<void>(`/api/routines/${encodeURIComponent(routineId)}`, {
    method: "DELETE",
    auth: true,
  });

export const getRoutinesByPatient = (
  patientId: string
): Promise<RoutineWithExercises[]> =>
  apiFetch<RoutineWithExercises[]>(
    `/api/routines?patient_id=${encodeURIComponent(patientId)}`,
    {
      method: "GET",
      auth: true,
    }
  );

// The backend answers 404 when there is no routine today; that is a valid state, so return null.
export const getActiveRoutine = async (
  patientId: string
): Promise<RoutineWithExercises | null> => {
  try {
    return await apiFetch<RoutineWithExercises>(
      `/api/routines/active?patient_id=${encodeURIComponent(patientId)}`,
      { method: "GET", auth: true }
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return null;
    }
    throw e;
  }
};
