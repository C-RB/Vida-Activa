import { apiFetch } from "./apiClient";

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  multimedia_url: string | null;
}

export const getExercises = (): Promise<Exercise[]> =>
  apiFetch<Exercise[]>("/api/exercises", {
    method: "GET",
    auth: true,
  });
