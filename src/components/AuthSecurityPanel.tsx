import { LockKeyhole, LogIn, LogOut, ShieldCheck, Server } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { AuthenticatedUser } from "../types/dashboard";

interface AuthSecurityPanelProps {
  isLoading: boolean;
  message: string | null;
  onLoadProxyData: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
  user: AuthenticatedUser | null;
}

function roleLabel(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AuthSecurityPanel({
  isLoading,
  message,
  onLoadProxyData,
  onLogin,
  onLogout,
  user
}: AuthSecurityPanelProps) {
  const [username, setUsername] = useState("payroll.admin");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onLogin(username, password);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-workday-ink">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Authentication and Role Security</p>
            <h2 className="text-lg font-semibold text-workday-ink">
              {user ? `${user.displayName} - ${roleLabel(user.role)}` : "Backend security required for Workday data"}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Sign in to the backend proxy before loading Workday RaaS/API data. The server filters workers, payroll
              rows, time entries, deductions, taxes, and exports by role scope before data reaches the browser.
            </p>
          </div>
        </div>

        {user ? (
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-workday-blue px-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              onClick={onLoadProxyData}
              type="button"
            >
              <Server className="h-4 w-4" aria-hidden="true" />
              Load Proxy Data
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2"
              onClick={() => void onLogout()}
              type="button"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        ) : null}
      </div>

      {user ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Departments</p>
            <p className="mt-1 text-sm font-semibold text-workday-ink">
              {user.allowedDepartments.length > 0 ? user.allowedDepartments.join(", ") : "All allowed"}
            </p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Companies</p>
            <p className="mt-1 text-sm font-semibold text-workday-ink">
              {user.allowedCompanies.length > 0 ? user.allowedCompanies.join(", ") : "All allowed"}
            </p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Permissions</p>
            <p className="mt-1 text-sm font-semibold text-workday-ink">
              {user.canViewWorkerDetail ? "Worker detail" : "Masked worker detail"} /{" "}
              {user.canExport ? "Export enabled" : "Export restricted"}
            </p>
          </div>
        </div>
      ) : (
        <form className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Username
            <input
              autoComplete="username"
              className="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-900 focus:border-workday-blue focus:outline-none focus:ring-1 focus:ring-workday-blue"
              onChange={(event) => setUsername(event.target.value)}
              value={username}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Password
            <input
              autoComplete="current-password"
              className="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-900 focus:border-workday-blue focus:outline-none focus:ring-1 focus:ring-workday-blue"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-md bg-workday-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Sign In
          </button>
        </form>
      )}

      {message ? (
        <p className="mt-4 flex items-start gap-2 rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {message}
        </p>
      ) : null}
    </section>
  );
}
