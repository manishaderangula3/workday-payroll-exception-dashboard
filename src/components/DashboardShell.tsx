import { dashboardTabs } from "../data/navigation";
import { getExceptionBreakdown, getWorkers } from "../lib/calculations";
import type { DashboardData, DashboardFilters, DashboardThresholds } from "../types/dashboard";
import { useState } from "react";
import { EmptyState } from "./EmptyState";
import { OverviewPreview } from "./OverviewPreview";
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
}

export function DashboardShell({
  activeTab,
  data,
  filters,
  isRefreshing,
  onClearFilters,
  onTabChange,
  thresholds
}: DashboardShellProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [acknowledgedEmployeeIds, setAcknowledgedEmployeeIds] = useState<Set<string>>(new Set());
  const breakdown = getExceptionBreakdown(filters, data);
  const visibleWorkers = getWorkers(filters, data);
  const acknowledgedCount = visibleWorkers.filter((worker) => acknowledgedEmployeeIds.has(worker.employeeId)).length;
  const tabBadgeMap = new Map([
    ["overtime", breakdown.find((item) => item.label === "Overtime")?.count ?? 0],
    ["missing-time", breakdown.find((item) => item.label === "Missing Time")?.count ?? 0],
    ["deductions", breakdown.find((item) => item.label === "Deductions")?.count ?? 0],
    ["tax-issues", breakdown.find((item) => item.label === "Tax Issues")?.count ?? 0],
    ["overview", breakdown.reduce((total, item) => total + item.count, 0)]
  ]);
  const tabs = dashboardTabs.map((tab) => ({ ...tab, badge: tabBadgeMap.get(tab.id) ?? tab.badge }));
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const currentBadge = tabBadgeMap.get(activeTab) ?? 0;

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
        className="flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-panel"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2 ${
                isActive
                  ? "bg-workday-blue text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-workday-ink"
              }`}
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              type="button"
            >
              {tab.label}
              {typeof tab.badge === "number" ? (
                <span
                  className={`rounded px-1.5 py-0.5 text-xs ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
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
        ) : currentBadge === 0 && activeTab !== "payroll-costs" && activeTab !== "documentation" ? (
          <EmptyState
            message={`No ${currentTab.label.toLowerCase()} exceptions match the current shared prompts.`}
            title={`No ${currentTab.label.toLowerCase()} exceptions`}
          />
        ) : (
          <ReportViews
            acknowledgedCount={acknowledgedCount}
            activeTab={activeTab}
            data={data}
            filters={filters}
            onWorkerSelect={setSelectedEmployeeId}
          />
        )}

        {selectedEmployeeId ? (
          <WorkerDrillDown
            employeeId={selectedEmployeeId}
            data={data}
            filters={filters}
            isAcknowledged={acknowledgedEmployeeIds.has(selectedEmployeeId)}
            onAcknowledge={(employeeId) =>
              setAcknowledgedEmployeeIds((current) => new Set(current).add(employeeId))
            }
            onClose={() => setSelectedEmployeeId(null)}
          />
        ) : null}
      </div>
    </section>
  );
}
