import { Clock, SlidersHorizontal } from "lucide-react";
import type { DashboardFilters } from "../types/dashboard";

interface FilterSummaryProps {
  filters: DashboardFilters;
  lastUpdated: Date;
  isRefreshing: boolean;
}

export function FilterSummary({ filters, isRefreshing, lastUpdated }: FilterSummaryProps) {
  const filterChips = [
    filters.payPeriod,
    filters.company,
    filters.payGroup,
    filters.department,
    filters.searchTerm ? `Search: ${filters.searchTerm}` : "No search term"
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-workday-ink">
            <SlidersHorizontal className="h-4 w-4 text-workday-blue" aria-hidden="true" />
            Shared Prompts
          </span>
          {filterChips.map((chip) => (
            <span
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
              key={chip}
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
          <Clock className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
          Last updated {lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </div>
      </div>
    </section>
  );
}
