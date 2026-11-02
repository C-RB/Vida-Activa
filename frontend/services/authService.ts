import { apiFetch } from "./apiClient";
import { setAuth, clearAuth, UserRole, Patient } from "./authStore";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user_id: string;
  patient?: Patient;
}

// Logs in, stores the session and returns the response so the caller can route by role.
export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const data = await apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    auth: false, // no token yet — this is how we get one
    body: { email, password },
  });

  setAuth({
    token: data.access_token,
    role: data.role,
    userId: data.user_id,
    patient: data.patient
  });

  return data;
};

export const logout = (): void => {
  clearAuth();
};
