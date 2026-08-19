import { AlertTriangle, Clock, DollarSign, FileSpreadsheet, Users } from "lucide-react";
import type { KpiCard, Severity } from "../types/dashboard";

const kpis: KpiCard[] = [
  {
    label: "Total Payroll Cost",
    value: "$2.48M",
    detail: "Current period payroll cost",
    severity: "warning",
    trend: "+4.2% vs prior period"
  },
  {
    label: "Workers Processed",
    value: "1,211 / 1,248",
    detail: "Workers complete or ready",
    severity: "warning",
    trend: "97.0% complete"
  },
  {
    label: "Open Exceptions",
    value: "37",
    detail: "Across time, deductions, and tax",
    severity: "critical",
    trend: "12 critical"
  },
  {
    label: "Missing Time",
    value: "9",
    detail: "Workers with unsubmitted time",
    severity: "warning",
    trend: "3 near deadline"
  },
  {
    label: "OT Hours",
    value: "186.5",
    detail: "$14.2K estimated cost",
    severity: "warning",
    trend: "+18.0% vs prior period"
  }
];

const severityClasses: Record<Severity, string> = {
  success: "border-l-workday-green",
  warning: "border-l-workday-amber",
  critical: "border-l-workday-red",
  neutral: "border-l-slate-300"
};

const icons = [DollarSign, Users, AlertTriangle, Clock, FileSpreadsheet];

export function OverviewPreview() {
  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi, index) => {
          const Icon = icons[index];

          return (
            <article
              className={`min-h-36 rounded-lg border border-l-4 border-slate-200 bg-white p-4 shadow-panel ${severityClasses[kpi.severity]}`}
              key={kpi.label}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-workday-ink">{kpi.value}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{kpi.detail}</p>
              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">{kpi.trend}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-workday-ink">Payroll Readiness Snapshot</h2>
              <p className="text-sm text-slate-600">Semi-monthly review for payroll approval.</p>
            </div>
            <span className="rounded-md bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Attention Needed
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Top Department</p>
              <p className="mt-1 text-xl font-semibold text-workday-ink">Operations</p>
              <p className="mt-1 text-sm text-slate-600">18 open exceptions</p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Highest OT Worker</p>
              <p className="mt-1 text-xl font-semibold text-workday-ink">Avery Brooks</p>
              <p className="mt-1 text-sm text-slate-600">16.5 overtime hours</p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Approval Deadline</p>
              <p className="mt-1 text-xl font-semibold text-workday-ink">Aug 23</p>
              <p className="mt-1 text-sm text-slate-600">4 days remaining</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h2 className="text-lg font-semibold text-workday-ink">Exception Mix</h2>
          <div className="mt-5 space-y-4">
            {[
              ["Overtime", 14, "bg-workday-amber"],
              ["Missing Time", 9, "bg-workday-red"],
              ["Deductions", 8, "bg-blue-500"],
              ["Tax Issues", 6, "bg-emerald-500"]
            ].map(([label, count, color]) => (
              <div className="flex items-center gap-3" key={label}>
                <div className={`h-3 w-3 rounded-sm ${color}`} />
                <div className="flex flex-1 items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <span className="text-sm font-semibold text-workday-ink">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
