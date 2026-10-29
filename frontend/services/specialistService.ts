import { apiFetch } from "./apiClient";

export interface DashboardSpecialist {
  full_name: string;
  specialty: string | null;
}

export interface DashboardStats {
  total_patients: number;
  active_today: number;
  alerts: number;
  avg_adherence: number;
}

export interface DashboardProgress {
  sessions_completed_today: number;
  sessions_total_today: number;
  daily_compliance: number;
}

export interface DashboardResponse {
  specialist: DashboardSpecialist;
  stats: DashboardStats;
  progress: DashboardProgress;
}

export const getDashboard = (): Promise<DashboardResponse> =>
  apiFetch<DashboardResponse>("/api/specialists/dashboard", {
    method: "GET",
    auth: true,
  });
