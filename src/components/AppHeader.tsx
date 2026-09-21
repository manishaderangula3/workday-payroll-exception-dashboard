import { BarChart3, Check, Link, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { DashboardFilters, FilterOptions } from "../types/dashboard";

interface AppHeaderProps {
  filters: DashboardFilters;
  filterOptions: FilterOptions;
  isRefreshing: boolean;
  roleTitle: string;
  onFilterChange: (updates: Partial<DashboardFilters>) => void;
  onRefresh: () => void;
  onCopyLink: () => Promise<void>;
}

export function AppHeader({
  filters,
  filterOptions,
  isRefreshing,
  onFilterChange,
  onCopyLink,
  onRefresh,
  roleTitle
}: AppHeaderProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  async function handleCopyLink() {
    await onCopyLink();
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <header className="border-b border-white/70 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-900/20 sm:flex">
              <BarChart3 className="h-7 w-7" aria-hidden="true" />
            </div>
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
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="global-search">
              Search workers or reports
            </label>
            <div className="flex h-10 min-w-60 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-slate-500 shadow-sm transition focus-within:border-workday-blue focus-within:ring-2 focus-within:ring-workday-blue/20">
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
              aria-label="Copy saved report link"
              className="secondary-action"
              onClick={() => void handleCopyLink()}
              title="Copy a link to the current tab and filters"
              type="button"
            >
              {linkCopied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link className="h-4 w-4" aria-hidden="true" />}
              {linkCopied ? "Link Copied" : "Copy Link"}
            </button>
            <button
              className="primary-action"
              disabled={isRefreshing}
              onClick={onRefresh}
              type="button"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              {isRefreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="dashboard-panel grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Pay Period
            <select
              className="field-control"
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
              className="field-control"
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
              className="field-control"
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
              className="field-control"
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
