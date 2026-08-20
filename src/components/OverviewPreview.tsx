import { AlertTriangle, Clock, DollarSign, FileSpreadsheet, Users } from "lucide-react";
import { getOverviewMetrics } from "../lib/calculations";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDateShort,
  formatHours,
  formatPercent,
  formatVariancePercent
} from "../lib/formatters";
import type { DashboardFilters, KpiCard, Severity } from "../types/dashboard";

const severityClasses: Record<Severity, string> = {
  success: "border-l-workday-green",
  warning: "border-l-workday-amber",
  critical: "border-l-workday-red",
  neutral: "border-l-slate-300"
};

const icons = [DollarSign, Users, AlertTriangle, Clock, FileSpreadsheet];

interface OverviewPreviewProps {
  filters: DashboardFilters;
}

export function OverviewPreview({ filters }: OverviewPreviewProps) {
  const metrics = getOverviewMetrics(filters);
  const kpis: KpiCard[] = [
    {
      label: "Total Payroll Cost",
      value: formatCompactCurrency(metrics.totalPayrollCost),
      detail: "Current period payroll cost",
      severity:
        metrics.priorPayrollCost > 0 && metrics.totalPayrollCost / metrics.priorPayrollCost - 1 > 0.05
          ? "warning"
          : "success",
      trend: formatVariancePercent(metrics.totalPayrollCost, metrics.priorPayrollCost)
    },
    {
      label: "Workers Processed",
      value: `${metrics.workersProcessed} / ${metrics.workersExpected}`,
      detail: "Workers complete or ready",
      severity: metrics.payrollCompletionRate < 0.9 ? "critical" : metrics.payrollCompletionRate < 0.95 ? "warning" : "success",
      trend: `${formatPercent(metrics.payrollCompletionRate)} complete`
    },
    {
      label: "Open Exceptions",
      value: `${metrics.openExceptionWorkers}`,
      detail: "Across time, deductions, and tax",
      severity: metrics.openExceptionWorkers > 5 ? "critical" : metrics.openExceptionWorkers > 0 ? "warning" : "success",
      trend: `${metrics.criticalExceptionWorkers} critical`
    },
    {
      label: "Missing Time",
      value: `${metrics.missingTimeWorkers}`,
      detail: "Workers with unsubmitted time",
      severity: metrics.missingTimeWorkers > 5 ? "critical" : metrics.missingTimeWorkers > 0 ? "warning" : "success",
      trend: `${metrics.workersNearDeadline} near deadline`
    },
    {
      label: "OT Hours",
      value: metrics.overtimeHours.toFixed(1),
      detail: `${formatCompactCurrency(metrics.overtimeCost)} estimated cost`,
      severity: metrics.overtimeHours > 20 ? "warning" : metrics.overtimeHours > 0 ? "warning" : "success",
      trend: `${formatPercent(metrics.overtimeTrendPercent)} vs prior period`
    }
  ];

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
              {metrics.openExceptionWorkers > 0 ? "Attention Needed" : "Ready for Approval"}
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Top Department</p>
              <p className="mt-1 text-xl font-semibold text-workday-ink">{metrics.topDepartment.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                {metrics.topDepartment.exceptionCount} open exceptions
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Highest OT Worker</p>
              <p className="mt-1 text-xl font-semibold text-workday-ink">
                {metrics.highestOvertimeWorker.name}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {formatHours(metrics.highestOvertimeWorker.overtimeHours)}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Approval Deadline</p>
              <p className="mt-1 text-xl font-semibold text-workday-ink">
                {formatDateShort(metrics.approvalDeadline)}
              </p>
              <p className="mt-1 text-sm text-slate-600">{metrics.daysToDeadline} days remaining</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h2 className="text-lg font-semibold text-workday-ink">Exception Mix</h2>
          <div className="mt-5 space-y-4">
            {metrics.exceptionBreakdown.map(({ label, count, colorClass }) => (
              <div className="flex items-center gap-3" key={label}>
                <div className={`h-3 w-3 rounded-sm ${colorClass}`} />
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
    </section>
  );
}
