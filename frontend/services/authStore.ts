// The token lives only for the app process; to persist it, swap the internals for expo-secure-store.

export type UserRole = "ADMIN" | "SPECIALIST" | "PATIENT";

export interface Patient {
  id: string;
  fullName: string;
  email: string;
  active: boolean;
  rut?: string;
  age?: number;
  gender?: string;
  phone?: string;
  address?: string;
}

export interface AuthSession {
  token: string;
  role: UserRole;
  userId: string;
  patient?: Patient;
}

let session: AuthSession | null = null;
const listeners = new Set<(session: AuthSession | null) => void>();

export function setAuth(next: AuthSession): void {
  session = next;
  listeners.forEach((cb) => cb(session));
}

export function clearAuth(): void {
  session = null;
  listeners.forEach((cb) => cb(session));
}

export function getSession(): AuthSession | null {
  return session;
}

export function getToken(): string | null {
  return session?.token ?? null;
}

export function getRole(): UserRole | null {
  return session?.role ?? null;
}

export function isAuthenticated(): boolean {
  return session !== null;
}

export function subscribe(cb: (session: AuthSession | null) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
