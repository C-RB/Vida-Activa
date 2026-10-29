import { apiFetch } from "./apiClient";

export interface SessionResponse {
  id: string;
  patient_id: string | null;
  routine_id: string | null;
  date: string | null;
  duration_minutes: number | null;
  is_completed: boolean | null;
  // One session_exercise is created per routine exercise (ordered by order_index); their ids come back here.
  session_exercises: SessionExerciseResponse[];
}

export interface SessionExerciseUpdate {
  series_completed: number;
  reps_completed: number;
  accuracy_score?: number | null;
  feedback?: string | null;
}

export interface SessionExerciseResponse {
  id: string;
  session_id: string;
  exercise_id: string;
  series_completed: number;
  reps_completed: number;
  accuracy_score: number | null;
  feedback: string | null;
}

export const createSession = (
  patientId: string,
  routineId: string
): Promise<SessionResponse> =>
  apiFetch<SessionResponse>("/api/sessions", {
    method: "POST",
    auth: true,
    body: { patient_id: patientId, routine_id: routineId },
  });

export const getSessionById = (
  sessionId: string
): Promise<SessionResponse> =>
  apiFetch<SessionResponse>(`/api/sessions/${sessionId}`, {
    method: "GET",
    auth: true,
  });

export const completeSession = (
  sessionId: string
): Promise<SessionResponse> =>
  apiFetch<SessionResponse>(
    `/api/sessions/${sessionId}/complete`,
    {
      method: "POST",
      auth: true,
    }
  );

export const updateExerciseProgress = (
  sessionId: string,
  sessionExerciseId: string,
  data: SessionExerciseUpdate
): Promise<SessionExerciseResponse> =>
  apiFetch<SessionExerciseResponse>(
    `/api/sessions/${sessionId}/exercises/${sessionExerciseId}`,
    {
      method: "PUT",
      auth: true,
      body: data,
    }
  );
