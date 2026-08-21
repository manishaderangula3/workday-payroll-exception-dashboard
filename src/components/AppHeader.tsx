import { RefreshCw, Search, ShieldCheck } from "lucide-react";
import type { DashboardFilters, FilterOptions } from "../types/dashboard";

interface AppHeaderProps {
  filters: DashboardFilters;
  filterOptions: FilterOptions;
  isRefreshing: boolean;
  roleTitle: string;
  onFilterChange: (updates: Partial<DashboardFilters>) => void;
  onRefresh: () => void;
}

export function AppHeader({
  filters,
  filterOptions,
  isRefreshing,
  onFilterChange,
  onRefresh,
  roleTitle
}: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-workday-blue">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Workday Payroll Portfolio Dashboard
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-workday-ink">
              Payroll Exception & Reporting Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Shared payroll readiness view for {roleTitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="global-search">
              Search workers or reports
            </label>
            <div className="flex h-10 min-w-60 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-slate-500">
              <Search className="h-4 w-4" aria-hidden="true" />
              <input
                id="global-search"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search worker, manager, report"
                value={filters.searchTerm}
                onChange={(event) => onFilterChange({ searchTerm: event.target.value })}
                type="search"
              />
            </div>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-workday-blue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2 disabled:cursor-wait disabled:bg-blue-400"
              disabled={isRefreshing}
              onClick={onRefresh}
              type="button"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              {isRefreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Pay Period
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-workday-blue focus:outline-none focus:ring-1 focus:ring-workday-blue"
              value={filters.payPeriod}
              onChange={(event) => onFilterChange({ payPeriod: event.target.value })}
            >
              {filterOptions.payPeriods.map((payPeriod) => (
                <option key={payPeriod}>{payPeriod}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Company
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-workday-blue focus:outline-none focus:ring-1 focus:ring-workday-blue"
              value={filters.company}
              onChange={(event) => onFilterChange({ company: event.target.value })}
            >
              {filterOptions.companies.map((company) => (
                <option key={company}>{company}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Pay Group
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-workday-blue focus:outline-none focus:ring-1 focus:ring-workday-blue"
              value={filters.payGroup}
              onChange={(event) => onFilterChange({ payGroup: event.target.value })}
            >
              {filterOptions.payGroups.map((payGroup) => (
                <option key={payGroup}>{payGroup}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Department
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-workday-blue focus:outline-none focus:ring-1 focus:ring-workday-blue"
              value={filters.department}
              onChange={(event) => onFilterChange({ department: event.target.value })}
            >
              {filterOptions.departments.map((department) => (
                <option key={department}>{department}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}
