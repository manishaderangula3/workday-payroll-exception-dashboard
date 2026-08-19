import { RefreshCw, Search, ShieldCheck } from "lucide-react";

interface AppHeaderProps {
  payPeriod: string;
  department: string;
  onPayPeriodChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
}

export function AppHeader({
  payPeriod,
  department,
  onPayPeriodChange,
  onDepartmentChange
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
                type="search"
              />
            </div>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-workday-blue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2"
              type="button"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Pay Period
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-workday-blue focus:outline-none focus:ring-1 focus:ring-workday-blue"
              value={payPeriod}
              onChange={(event) => onPayPeriodChange(event.target.value)}
            >
              <option>2026-08-15 Semi-Monthly</option>
              <option>2026-07-31 Semi-Monthly</option>
              <option>2026-07-15 Semi-Monthly</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Company
            <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-workday-blue focus:outline-none focus:ring-1 focus:ring-workday-blue">
              <option>Northstar Services Inc.</option>
              <option>Northstar Retail Group</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Pay Group
            <select className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-workday-blue focus:outline-none focus:ring-1 focus:ring-workday-blue">
              <option>All Pay Groups</option>
              <option>US Semi-Monthly</option>
              <option>US Weekly Hourly</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Department
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-workday-blue focus:outline-none focus:ring-1 focus:ring-workday-blue"
              value={department}
              onChange={(event) => onDepartmentChange(event.target.value)}
            >
              <option>All Departments</option>
              <option>Operations</option>
              <option>Customer Support</option>
              <option>Finance</option>
              <option>Human Resources</option>
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}
