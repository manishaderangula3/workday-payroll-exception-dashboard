import { AlertTriangle, Clock, DollarSign, FileSpreadsheet, Users } from "lucide-react";
import { getOverviewMetrics } from "../lib/calculations";
import {
  formatCurrency,
  formatDateShort,
  formatHours
} from "../lib/formatters";
import { buildOverviewKpiCards } from "../lib/kpiCards";
import type { DashboardData, DashboardFilters, DashboardThresholds, Severity } from "../types/dashboard";
import { ExecutiveHighlights } from "./ExecutiveHighlights";
import { TrendVisualizations } from "./TrendVisualizations";

const severityClasses: Record<Severity, string> = {
  success: "border-l-workday-green bg-gradient-to-br from-white to-emerald-50/70",
  warning: "border-l-workday-amber bg-gradient-to-br from-white to-amber-50/80",
  critical: "border-l-workday-red bg-gradient-to-br from-white to-red-50/70",
  neutral: "border-l-workday-blue bg-gradient-to-br from-white to-blue-50/70"
};

const iconClasses: Record<Severity, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
  neutral: "bg-blue-100 text-workday-blue"
};

const progressClasses: Record<Severity, string> = {
  success: "bg-workday-green",
  warning: "bg-workday-amber",
  critical: "bg-workday-red",
  neutral: "bg-workday-blue"
};

const icons = [DollarSign, Users, AlertTriangle, Clock, FileSpreadsheet];

interface OverviewPreviewProps {
  data: DashboardData;
  filters: DashboardFilters;
  onTabChange: (tabId: string) => void;
  thresholds: DashboardThresholds;
}

export function OverviewPreview({ data, filters, onTabChange, thresholds }: OverviewPreviewProps) {
  const metrics = getOverviewMetrics(filters, data);
  const kpis = buildOverviewKpiCards(metrics, thresholds);

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi, index) => {
          const Icon = icons[index];

          return (
            <article
              className={`min-h-40 rounded-lg border border-l-4 border-white/80 p-4 shadow-panel ring-1 ring-slate-900/5 ${severityClasses[kpi.severity]}`}
              key={kpi.label}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-workday-ink">{kpi.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-md ${iconClasses[kpi.severity]}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{kpi.detail}</p>
              {typeof kpi.progress === "number" ? (
                <div className="mt-4 h-2 rounded-full bg-white/80 ring-1 ring-slate-200">
                  <div
                    className={`h-2 rounded-full ${progressClasses[kpi.severity]}`}
                    style={{ width: `${Math.min(kpi.progress * 100, 100)}%` }}
                  />
                </div>
              ) : null}
              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">{kpi.trend}</p>
              {kpi.target ? <p className="mt-1 text-xs text-slate-400">{kpi.target}</p> : null}
            </article>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="dashboard-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-workday-ink">Payroll Readiness Snapshot</h2>
              <p className="text-sm text-slate-600">Semi-monthly review for payroll approval.</p>
            </div>
            <span className={`rounded-md px-3 py-1 text-xs font-semibold ${metrics.openExceptionWorkers > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
              {metrics.openExceptionWorkers > 0 ? "Attention Needed" : "Ready for Approval"}
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="dashboard-panel-muted p-4">
              <p className="text-sm font-semibold text-slate-500">Top Department</p>
              <p className="mt-1 text-xl font-semibold text-workday-ink">{metrics.topDepartment.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                {metrics.topDepartment.exceptionCount} open exceptions
              </p>
            </div>
            <div className="dashboard-panel-muted p-4">
              <p className="text-sm font-semibold text-slate-500">Highest OT Worker</p>
              <p className="mt-1 text-xl font-semibold text-workday-ink">
                {metrics.highestOvertimeWorker.name}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {formatHours(metrics.highestOvertimeWorker.overtimeHours)}
              </p>
            </div>
            <div className="dashboard-panel-muted p-4">
              <p className="text-sm font-semibold text-slate-500">Approval Deadline</p>
              <p className="mt-1 text-xl font-semibold text-workday-ink">
                {formatDateShort(metrics.approvalDeadline)}
              </p>
              <p className="mt-1 text-sm text-slate-600">{metrics.daysToDeadline} days remaining</p>
            </div>
          </div>
        </section>

        <section className="dashboard-panel p-5">
          <h2 className="text-lg font-semibold text-workday-ink">Exception Mix</h2>
          <div className="mt-5 space-y-4">
            {metrics.exceptionBreakdown.map(({ label, count, colorClass }) => (
              <div className="flex items-center gap-3 rounded-md bg-slate-50/80 px-3 py-2" key={label}>
                <div className={`h-3 w-3 rounded-sm shadow-sm ${colorClass}`} />
                <div className="flex flex-1 items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <span className="text-sm font-semibold text-workday-ink">{count}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs font-semibold uppercase text-slate-500">
            Total cost basis: {formatCurrency(metrics.totalPayrollCost)}
          </p>
        </section>
      </div>

      <TrendVisualizations data={data} filters={filters} onTabChange={onTabChange} />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-workday-ink">Exception Highlights</h2>
            <p className="text-sm text-slate-600">Top items to review before payroll approval.</p>
          </div>
        </div>
        <ExecutiveHighlights highlights={metrics.highlights} />
      </section>
    </section>
  );
}
