import { dashboardTabs } from "../data/navigation";
import { getExceptionBreakdown, getWorkers } from "../lib/calculations";
import { getPayrollReadinessSummary } from "../lib/readiness";
import { acknowledgeException, getAcknowledgements } from "../lib/backendApi";
import type { DashboardData, DashboardFilters, DashboardThresholds, DataSourceMode } from "../types/dashboard";
import { useEffect, useState } from "react";
import { EmptyState } from "./EmptyState";
import { OverviewPreview } from "./OverviewPreview";
import { ReadinessCenter } from "./ReadinessCenter";
import { ReportViews } from "./ReportViews";
import { WorkerDrillDown } from "./WorkerDrillDown";

interface DashboardShellProps {
  activeTab: string;
  data: DashboardData;
  onTabChange: (tab: string) => void;
  filters: DashboardFilters;
  isRefreshing: boolean;
  onClearFilters: () => void;
  thresholds: DashboardThresholds;
  canExport: boolean;
  dataSourceMode: DataSourceMode;
}

export function DashboardShell({
  activeTab,
  canExport,
  data,
  dataSourceMode,
  filters,
  isRefreshing,
  onClearFilters,
  onTabChange,
  thresholds
}: DashboardShellProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [acknowledgedEmployeeIds, setAcknowledgedEmployeeIds] = useState<Set<string>>(new Set());
  const breakdown = getExceptionBreakdown(filters, data);
  const readinessSummary = getPayrollReadinessSummary(filters, data, thresholds);
  const visibleWorkers = getWorkers(filters, data);
  const acknowledgedCount = visibleWorkers.filter((worker) => acknowledgedEmployeeIds.has(worker.employeeId)).length;
  const tabBadgeMap = new Map([
    ["overtime", breakdown.find((item) => item.label === "Overtime")?.count ?? 0],
    ["missing-time", breakdown.find((item) => item.label === "Missing Time")?.count ?? 0],
    ["deductions", breakdown.find((item) => item.label === "Deductions")?.count ?? 0],
    ["tax-issues", breakdown.find((item) => item.label === "Tax Issues")?.count ?? 0],
    ["readiness", readinessSummary.blockers.length],
    ["overview", breakdown.reduce((total, item) => total + item.count, 0)]
  ]);
  const tabs = dashboardTabs.map((tab) => ({ ...tab, badge: tabBadgeMap.get(tab.id) ?? tab.badge }));
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const currentBadge = tabBadgeMap.get(activeTab) ?? 0;

  useEffect(() => {
    if (dataSourceMode !== "proxy") {
      setAcknowledgedEmployeeIds(new Set());
      return;
    }

    getAcknowledgements(filters.payPeriod)
      .then((response) => setAcknowledgedEmployeeIds(new Set(response.employeeIds)))
      .catch(() => setAcknowledgedEmployeeIds(new Set()));
  }, [dataSourceMode, filters.payPeriod]);

  async function handleAcknowledge(employeeId: string) {
    if (dataSourceMode === "proxy") {
      await acknowledgeException(employeeId, filters.payPeriod);
    }
    setAcknowledgedEmployeeIds((current) => new Set(current).add(employeeId));
  }

  if (visibleWorkers.length === 0) {
    return (
      <EmptyState
        actionLabel="Clear filters"
        message="No active workers match the current pay period, company, pay group, department, and search prompts."
        onAction={onClearFilters}
        title="No matching workers"
      />
    );
  }

  return (
    <section className={`space-y-5 ${isRefreshing ? "opacity-70 transition-opacity" : ""}`}>
      <nav
        aria-label="Dashboard reports"
        className="dashboard-panel flex gap-2 overflow-x-auto p-2"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2 ${
                isActive
                  ? "bg-workday-blue text-white shadow-sm shadow-blue-900/20"
                  : "text-slate-600 hover:bg-blue-50 hover:text-workday-blue"
              }`}
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              type="button"
            >
              {tab.label}
              {typeof tab.badge === "number" ? (
                <span
                  className={`rounded px-1.5 py-0.5 text-xs ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                  }`}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="space-y-5">
        {activeTab === "overview" ? (
          <OverviewPreview data={data} filters={filters} onTabChange={onTabChange} thresholds={thresholds} />
        ) : activeTab === "readiness" ? (
          <ReadinessCenter canExport={canExport} data={data} filters={filters} thresholds={thresholds} useServerExport={dataSourceMode === "proxy"} />
        ) : currentBadge === 0 && activeTab !== "payroll-costs" && activeTab !== "documentation" ? (
          <EmptyState
            message={`No ${currentTab.label.toLowerCase()} exceptions match the current shared prompts.`}
            title={`No ${currentTab.label.toLowerCase()} exceptions`}
          />
        ) : (
          <ReportViews
            acknowledgedCount={acknowledgedCount}
            activeTab={activeTab}
            canExport={canExport}
            data={data}
            filters={filters}
            onWorkerSelect={setSelectedEmployeeId}
            useServerExport={dataSourceMode === "proxy"}
          />
        )}

        {selectedEmployeeId ? (
          <WorkerDrillDown
            employeeId={selectedEmployeeId}
            canExport={canExport}
            canCreateWorkdayTask={dataSourceMode === "proxy"}
            data={data}
            filters={filters}
            isAcknowledged={acknowledgedEmployeeIds.has(selectedEmployeeId)}
            onAcknowledge={handleAcknowledge}
            onClose={() => setSelectedEmployeeId(null)}
            useServerExport={dataSourceMode === "proxy"}
          />
        ) : null}
      </div>
    </section>
  );
}
