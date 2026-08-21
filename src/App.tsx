import { useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { DashboardShell } from "./components/DashboardShell";
import { FilterSummary } from "./components/FilterSummary";
import { getFilterOptions } from "./lib/filterOptions";
import { RoleLensPanel } from "./components/RoleLensPanel";
import { roleLenses } from "./data/roleLenses";
import type { DashboardFilters, RoleKey } from "./types/dashboard";

const filterOptions = getFilterOptions();
const defaultFilters: DashboardFilters = {
  payPeriod: "2026-08-15 Semi-Monthly",
  company: "All Companies",
  payGroup: "All Pay Groups",
  department: "All Departments",
  searchTerm: ""
};

export function App() {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [activeRole, setActiveRole] = useState<RoleKey>("workday-payroll-analyst");
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const activeRoleTitle = roleLenses.find((role) => role.key === activeRole)?.title ?? "Payroll Stakeholders";

  function handleFilterChange(updates: Partial<DashboardFilters>) {
    setFilters((currentFilters) => ({ ...currentFilters, ...updates }));
  }

  function handleRefresh() {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 450);
  }

  function handleClearFilters() {
    setFilters(defaultFilters);
    setActiveTab("overview");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader
        filterOptions={filterOptions}
        filters={filters}
        isRefreshing={isRefreshing}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        roleTitle={activeRoleTitle}
      />

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        <RoleLensPanel activeRole={activeRole} onRoleChange={setActiveRole} />
        <FilterSummary filters={filters} isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
        <DashboardShell
          activeTab={activeTab}
          filters={filters}
          isRefreshing={isRefreshing}
          onClearFilters={handleClearFilters}
          onTabChange={setActiveTab}
        />
      </main>
    </div>
  );
}
