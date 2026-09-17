import { CheckCircle2, Database, DollarSign, ShieldCheck, Users } from "lucide-react";
import { getOverviewMetrics } from "../lib/calculations";
import { formatCurrency, formatPercent } from "../lib/formatters";
import { getPayrollReadinessSummary } from "../lib/readiness";
import type { DashboardData, DashboardFilters, DashboardThresholds, DataSourceMode } from "../types/dashboard";

interface DashboardStatusStripProps {
  activeRoleTitle: string;
  data: DashboardData;
  dataSourceMode: DataSourceMode;
  filters: DashboardFilters;
  thresholds: DashboardThresholds;
  uploadedDatasetCount: number;
}

function sourceLabel(mode: DataSourceMode, uploadedDatasetCount: number) {
  if (mode === "uploaded") {
    return `${uploadedDatasetCount} uploaded set${uploadedDatasetCount === 1 ? "" : "s"}`;
  }

  return mode === "proxy" ? "Backend proxy" : "Sample data";
}

export function DashboardStatusStrip({
  activeRoleTitle,
  data,
  dataSourceMode,
  filters,
  thresholds,
  uploadedDatasetCount
}: DashboardStatusStripProps) {
  const metrics = getOverviewMetrics(filters, data);
  const readiness = getPayrollReadinessSummary(filters, data, thresholds);
  const readinessTone =
    readiness.status === "Ready"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
      : readiness.status === "Needs Review"
        ? "bg-amber-50 text-amber-800 ring-amber-200"
        : "bg-red-50 text-red-800 ring-red-200";
  const items = [
    {
      label: "Readiness",
      value: readiness.status,
      detail: `${readiness.score}/100 score`,
      icon: CheckCircle2,
      tone: readinessTone
    },
    {
      label: "Active Source",
      value: sourceLabel(dataSourceMode, uploadedDatasetCount),
      detail: filters.payPeriod,
      icon: Database,
      tone: "bg-blue-50 text-blue-800 ring-blue-200"
    },
    {
      label: "Stakeholder View",
      value: activeRoleTitle,
      detail: filters.department,
      icon: ShieldCheck,
      tone: "bg-slate-50 text-slate-800 ring-slate-200"
    },
    {
      label: "Payroll Cost",
      value: formatCurrency(metrics.totalPayrollCost),
      detail: `${formatPercent(metrics.payrollCompletionRate)} complete`,
      icon: DollarSign,
      tone: "bg-emerald-50 text-emerald-800 ring-emerald-200"
    },
    {
      label: "Exception Workers",
      value: String(metrics.openExceptionWorkers),
      detail: `${metrics.workersProcessed} of ${metrics.workersExpected} processed`,
      icon: Users,
      tone: metrics.openExceptionWorkers > 5 ? "bg-red-50 text-red-800 ring-red-200" : "bg-amber-50 text-amber-800 ring-amber-200"
    }
  ];

  return (
    <section className="dashboard-panel p-4">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mini-label">Payroll Close Command Center</p>
          <h2 className="text-xl font-semibold text-workday-ink">Current dashboard status</h2>
        </div>
        <p className="text-sm text-slate-600">{filters.company} / {filters.payGroup}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {items.map(({ detail, icon: Icon, label, tone, value }) => (
          <article className={`rounded-md p-3 ring-1 ${tone}`} key={label}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/70">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 truncate text-xs font-medium opacity-80">{detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
