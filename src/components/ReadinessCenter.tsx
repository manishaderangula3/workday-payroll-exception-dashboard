import { AlertTriangle, CheckCircle2, ClipboardCheck, Download, ShieldAlert } from "lucide-react";
import { downloadCsv, type CsvRow } from "../lib/csvExport";
import { getOverviewMetrics } from "../lib/calculations";
import { formatDateShort, formatPercent } from "../lib/formatters";
import { getPayrollReadinessSummary } from "../lib/readiness";
import type { DashboardData, DashboardFilters, DashboardThresholds, Severity } from "../types/dashboard";

interface ReadinessCenterProps {
  data: DashboardData;
  filters: DashboardFilters;
  thresholds: DashboardThresholds;
}

const statusStyles: Record<Severity, string> = {
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-slate-50 text-slate-700 border-slate-200"
};

const decisionStyles = {
  Ready: "border-l-workday-green bg-green-50 text-green-800",
  "Needs Review": "border-l-workday-amber bg-amber-50 text-amber-900",
  Blocked: "border-l-workday-red bg-red-50 text-red-800"
};

function statusLabel(status: Severity) {
  if (status === "success") {
    return "Passed";
  }

  if (status === "critical") {
    return "Blocked";
  }

  return status === "warning" ? "Review" : "Not Started";
}

export function ReadinessCenter({ data, filters, thresholds }: ReadinessCenterProps) {
  const summary = getPayrollReadinessSummary(filters, data, thresholds);
  const metrics = getOverviewMetrics(filters, data);

  function handleExport() {
    const rows: CsvRow[] = summary.checklist.map((item) => ({
      payPeriod: filters.payPeriod,
      readinessStatus: summary.status,
      readinessScore: summary.score,
      check: item.label,
      status: statusLabel(item.status),
      value: item.value,
      owner: item.owner,
      action: item.action
    }));

    downloadCsv(`payroll-approval-readiness-${filters.payPeriod}.csv`, rows, {
      report: "Payroll Approval Readiness Center",
      payPeriod: filters.payPeriod,
      company: filters.company,
      payGroup: filters.payGroup,
      department: filters.department,
      generatedBy: "Payroll Exception Dashboard"
    });
  }

  return (
    <section className="space-y-5">
      <div className={`rounded-lg border border-l-4 border-slate-200 p-5 shadow-panel ${decisionStyles[summary.status]}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/80">
              {summary.status === "Ready" ? (
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              ) : summary.status === "Blocked" ? (
                <ShieldAlert className="h-6 w-6" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-6 w-6" aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase">Payroll approval decision</p>
              <h2 className="mt-1 text-2xl font-semibold">{summary.status}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6">
                {summary.status === "Ready"
                  ? "All approval checks passed for the current shared prompts."
                  : "Review the blockers below before payroll approval."}
              </p>
            </div>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2"
            onClick={handleExport}
            type="button"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export Readiness
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-semibold text-slate-500">Readiness Score</p>
          <p className="mt-2 text-3xl font-semibold text-workday-ink">{summary.score}</p>
          <p className="mt-1 text-sm text-slate-600">Out of 100</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-semibold text-slate-500">Completion</p>
          <p className="mt-2 text-3xl font-semibold text-workday-ink">{formatPercent(metrics.payrollCompletionRate)}</p>
          <p className="mt-1 text-sm text-slate-600">
            {metrics.workersProcessed} of {metrics.workersExpected} workers
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-semibold text-slate-500">Approval Deadline</p>
          <p className="mt-2 text-3xl font-semibold text-workday-ink">{formatDateShort(metrics.approvalDeadline)}</p>
          <p className="mt-1 text-sm text-slate-600">{metrics.daysToDeadline} days remaining</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <p className="text-sm font-semibold text-slate-500">Open Blockers</p>
          <p className="mt-2 text-3xl font-semibold text-workday-ink">{summary.blockers.length}</p>
          <p className="mt-1 text-sm text-slate-600">
            {summary.criticalCount} critical / {summary.warningCount} review
          </p>
        </article>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-workday-blue" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-workday-ink">Approval Checklist</h2>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {summary.checklist.map((item) => (
            <article className="rounded-md border border-slate-200 bg-slate-50 p-4" key={item.label}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-workday-ink">{item.label}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.value}</p>
                </div>
                <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>
                  {statusLabel(item.status)}
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase text-slate-500">{item.owner}</p>
              <p className="mt-1 text-sm text-slate-600">{item.action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <h2 className="text-lg font-semibold text-workday-ink">Blocker Queue</h2>
        {summary.blockers.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="px-3 py-2">Check</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {summary.blockers.map((item) => (
                  <tr className="border-b border-slate-100" key={item.label}>
                    <td className="px-3 py-3 font-semibold text-workday-ink">{item.label}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{item.owner}</td>
                    <td className="px-3 py-3 text-slate-700">{item.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            No approval blockers for the current shared prompts.
          </p>
        )}
      </section>
    </section>
  );
}
