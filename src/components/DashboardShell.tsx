import { LayoutDashboard } from "lucide-react";
import { dashboardTabs } from "../data/navigation";
import { getExceptionBreakdown } from "../lib/calculations";
import type { DashboardFilters } from "../types/dashboard";
import { OverviewPreview } from "./OverviewPreview";

interface DashboardShellProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  filters: DashboardFilters;
}

export function DashboardShell({ activeTab, filters, onTabChange }: DashboardShellProps) {
  const breakdown = getExceptionBreakdown(filters);
  const tabBadgeMap = new Map([
    ["overtime", breakdown.find((item) => item.label === "Overtime")?.count ?? 0],
    ["missing-time", breakdown.find((item) => item.label === "Missing Time")?.count ?? 0],
    ["deductions", breakdown.find((item) => item.label === "Deductions")?.count ?? 0],
    ["tax-issues", breakdown.find((item) => item.label === "Tax Issues")?.count ?? 0],
    ["overview", breakdown.reduce((total, item) => total + item.count, 0)]
  ]);
  const tabs = dashboardTabs.map((tab) => ({ ...tab, badge: tabBadgeMap.get(tab.id) ?? tab.badge }));
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <section className="space-y-5">
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

      {activeTab === "overview" ? (
        <OverviewPreview filters={filters} />
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-panel">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-workday-blue">
            <LayoutDashboard className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-workday-ink">{currentTab.label}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            This tab is reserved for the interactive report view that will be built from the
            existing Workday specification.
          </p>
        </section>
      )}
    </section>
  );
}
