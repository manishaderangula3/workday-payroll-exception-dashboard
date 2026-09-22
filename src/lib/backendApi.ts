import type { AuthenticatedUser, DashboardData, DashboardFilters, DashboardThresholds } from "../types/dashboard";

export interface BackendSessionResponse {
  authenticated: boolean;
  authMode: "local" | "azure_easy_auth";
  loginUrl?: string;
  logoutUrl?: string;
  user: AuthenticatedUser | null;
}

export interface BackendDataResponse {
  data: Partial<DashboardData>;
  source: "workday" | "demo";
  user: AuthenticatedUser;
  warnings: string[];
}

export type BackendExportReportType =
  | "payroll-costs"
  | "overtime"
  | "missing-time"
  | "deductions"
  | "tax-issues"
  | "readiness"
  | "worker-snapshot";

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

export function getAcknowledgements(payPeriod: string) {
  return requestJson<{ employeeIds: string[] }>(`/api/acknowledgements?payPeriod=${encodeURIComponent(payPeriod)}`);
}

export function acknowledgeException(employeeId: string, payPeriod: string) {
  return requestJson<{ event: { id: string } }>("/api/acknowledgements", {
    body: JSON.stringify({ employeeId, payPeriod }),
    method: "POST"
  });
}

export function createWorkdayInboxTask(employeeId: string, payPeriod: string) {
  return requestJson<{ event: { id: string } }>("/api/actions/workday-inbox", {
    body: JSON.stringify({ employeeId, payPeriod }),
    method: "POST"
  });
}

export async function downloadBackendReport(
  reportType: BackendExportReportType,
  filters: DashboardFilters,
  employeeId?: string,
  thresholds?: DashboardThresholds
) {
  const response = await fetch("/api/exports/report", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportType, filters, employeeId, thresholds })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? `Export failed with status ${response.status}`);
  }

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const fileName = disposition.match(/filename="([^"]+)"/)?.[1] ?? `${reportType}.xlsx`;
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
