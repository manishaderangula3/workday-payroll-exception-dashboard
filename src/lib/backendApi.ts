import type { AuthenticatedUser, DashboardData } from "../types/dashboard";

export interface BackendSessionResponse {
  authenticated: boolean;
  user: AuthenticatedUser | null;
}

export interface BackendDataResponse {
  data: Partial<DashboardData>;
  source: "workday" | "demo";
  user: AuthenticatedUser;
  warnings: string[];
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed with status ${response.status}`);
  }

  return payload as T;
}

export function getBackendSession() {
  return requestJson<BackendSessionResponse>("/api/auth/session");
}

export function loginToBackend(username: string, password: string) {
  return requestJson<BackendSessionResponse>("/api/auth/login", {
    body: JSON.stringify({ username, password }),
    method: "POST"
  });
}

export function logoutFromBackend() {
  return requestJson<BackendSessionResponse>("/api/auth/logout", {
    method: "POST"
  });
}

export function loadBackendDashboardData() {
  return requestJson<BackendDataResponse>("/api/workday/dashboard-data");
}
