import { AlertCircle, CalendarClock, Landmark, Timer } from "lucide-react";
import {
  formatCurrency,
  formatDateShort,
  formatHours
} from "../lib/formatters";
import type { ExecutiveHighlights as ExecutiveHighlightsData } from "../types/dashboard";

interface ExecutiveHighlightsProps {
  highlights: ExecutiveHighlightsData;
}

function EmptyHighlight() {
  return <p className="text-sm text-slate-500">No exceptions for the current prompts.</p>;
}

export function ExecutiveHighlights({ highlights }: ExecutiveHighlightsProps) {
  const cards = [
    {
      title: "Top Overtime Workers",
      icon: Timer,
      accent: "text-amber-700 bg-amber-50",
      content:
        highlights.overtime.length > 0 ? (
          highlights.overtime.map((worker) => (
            <li className="flex items-start justify-between gap-3" key={worker.employeeId}>
              <div>
                <p className="text-sm font-semibold text-workday-ink">{worker.employeeName}</p>
                <p className="text-xs text-slate-500">{worker.department}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{formatHours(worker.overtimeHours)}</p>
                <p className="text-xs text-slate-500">{formatCurrency(worker.overtimeCost)}</p>
              </div>
            </li>
          ))
        ) : (
          <EmptyHighlight />
        )
    },
    {
      title: "Missing Time",
      icon: CalendarClock,
      accent: "text-red-700 bg-red-50",
      content:
        highlights.missingTime.length > 0 ? (
          highlights.missingTime.map((worker) => (
            <li className="flex items-start justify-between gap-3" key={worker.employeeId}>
              <div>
                <p className="text-sm font-semibold text-workday-ink">{worker.employeeName}</p>
                <p className="text-xs text-slate-500">{worker.department}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{worker.missingDays} days</p>
                <p className="text-xs text-slate-500">{worker.missingDates.map(formatDateShort).join(", ")}</p>
              </div>
            </li>
          ))
        ) : (
          <EmptyHighlight />
        )
    },
    {
      title: "Deduction Failures",
      icon: AlertCircle,
      accent: "text-blue-700 bg-blue-50",
      content:
        highlights.deductions.length > 0 ? (
          highlights.deductions.map((item) => (
            <li className="flex items-start justify-between gap-3" key={`${item.employeeId}-${item.deductionName}`}>
              <div>
                <p className="text-sm font-semibold text-workday-ink">{item.employeeName}</p>
                <p className="text-xs text-slate-500">{item.exceptionType} - {item.deductionName}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.variance)}</p>
            </li>
          ))
        ) : (
          <EmptyHighlight />
        )
    },
    {
      title: "Tax Exceptions",
      icon: Landmark,
      accent: "text-emerald-700 bg-emerald-50",
      content:
        highlights.taxes.length > 0 ? (
          highlights.taxes.map((item) => (
            <li className="flex items-start justify-between gap-3" key={`${item.employeeId}-${item.taxAuthority}`}>
              <div>
                <p className="text-sm font-semibold text-workday-ink">{item.employeeName}</p>
                <p className="text-xs text-slate-500">{item.exceptionType} - {item.taxAuthority}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.variance)}</p>
            </li>
          ))
        ) : (
          <EmptyHighlight />
        )
    }
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-4">
      {cards.map(({ accent, content, icon: Icon, title }) => (
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel" key={title}>
          <div className="mb-4 flex items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-md ${accent}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-sm font-semibold text-workday-ink">{title}</h2>
          </div>
          <ul className="space-y-3">{content}</ul>
        </article>
      ))}
    </section>
  );
}
