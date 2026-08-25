import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  getExceptionBreakdown,
  getOvertimeMatrix,
  getOvertimeTrend,
  getPayrollTrend
} from "../lib/calculations";
import { formatCompactCurrency, formatCurrency, formatPercent } from "../lib/formatters";
import type { DashboardFilters, ExceptionBreakdownItem } from "../types/dashboard";

interface TrendVisualizationsProps {
  filters: DashboardFilters;
  onTabChange: (tabId: string) => void;
}

function getMatrixCellClass(value: number): string {
  if (value > 20) {
    return "bg-red-50 text-red-700";
  }

  if (value > 8) {
    return "bg-amber-50 text-amber-700";
  }

  if (value > 0) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-slate-50 text-slate-500";
}

export function TrendVisualizations({ filters, onTabChange }: TrendVisualizationsProps) {
  const payrollTrend = getPayrollTrend(filters);
  const exceptionBreakdown = getExceptionBreakdown(filters);
  const overtimeTrend = getOvertimeTrend(filters);
  const overtimeMatrix = getOvertimeMatrix(filters);
  const weekLabels = [...new Set(overtimeTrend.map((point) => point.weekLabel))];
  const totalExceptions = exceptionBreakdown.reduce((total, item) => total + item.count, 0);

  function handlePieClick(data: unknown) {
    const item = data as Partial<ExceptionBreakdownItem>;
    if (item.tabId) {
      onTabChange(item.tabId);
    }
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-workday-ink">Payroll Cost Trend</h2>
            <p className="text-sm text-slate-600">Six-period payroll cost and completion trend.</p>
          </div>

          <div className="mt-5 h-72">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={payrollTrend} margin={{ bottom: 0, left: 0, right: 12, top: 12 }}>
                <defs>
                  <linearGradient id="payrollCostFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#1976D2" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#1976D2" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={12} tickLine={false} />
                <YAxis
                  fontSize={12}
                  tickFormatter={(value) => formatCompactCurrency(Number(value))}
                  tickLine={false}
                  width={64}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "payrollCost") {
                      return [formatCurrency(Number(value)), "Payroll Cost"];
                    }
                    if (name === "completionRate") {
                      return [formatPercent(Number(value)), "Completion"];
                    }
                    return [value, name];
                  }}
                  labelClassName="font-semibold text-slate-700"
                />
                <Area
                  activeDot={{ r: 5 }}
                  dataKey="payrollCost"
                  fill="url(#payrollCostFill)"
                  stroke="#1976D2"
                  strokeWidth={3}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-workday-ink">Exception Breakdown</h2>
            <p className="text-sm text-slate-600">Click a segment or legend item to open the detail tab.</p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="h-64">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={exceptionBreakdown}
                    dataKey="count"
                    innerRadius={58}
                    nameKey="label"
                    onClick={handlePieClick}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {exceptionBreakdown.map((entry) => (
                      <Cell cursor="pointer" fill={entry.chartColor} key={entry.label} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} workers`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-center gap-3">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Total Exceptions</p>
                <p className="mt-1 text-3xl font-semibold text-workday-ink">{totalExceptions}</p>
              </div>
              {exceptionBreakdown.map((item) => (
                <button
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-left transition hover:border-workday-blue hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2"
                  key={item.label}
                  onClick={() => onTabChange(item.tabId)}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className={`h-3 w-3 rounded-sm ${item.colorClass}`} />
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-workday-ink">{item.count}</span>
                </button>
              ))}
            </div>
          </div>
        </article>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-workday-ink">Overtime Trend Matrix</h2>
          <p className="text-sm text-slate-600">Department overtime hours for the last four week-ending dates.</p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 pb-2 pr-4 text-left font-semibold text-slate-600">
                  Department
                </th>
                {weekLabels.map((week) => (
                  <th className="border-b border-slate-200 px-3 pb-2 text-right font-semibold text-slate-600" key={week}>
                    {week}
                  </th>
                ))}
                <th className="border-b border-slate-200 pb-2 pl-3 text-right font-semibold text-slate-600">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {overtimeMatrix.map((row) => (
                <tr key={row.department}>
                  <td className="border-b border-slate-100 py-3 pr-4 font-semibold text-workday-ink">
                    {row.department}
                  </td>
                  {weekLabels.map((week) => {
                    const value = row.weeks[week] ?? 0;
                    return (
                      <td className="border-b border-slate-100 px-3 py-2 text-right" key={week}>
                        <span className={`inline-flex min-w-14 justify-end rounded-md px-2 py-1 font-semibold ${getMatrixCellClass(value)}`}>
                          {value.toFixed(value % 1 === 0 ? 0 : 1)}
                        </span>
                      </td>
                    );
                  })}
                  <td className="border-b border-slate-100 py-3 pl-3 text-right font-semibold text-workday-ink">
                    {row.total.toFixed(row.total % 1 === 0 ? 0 : 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
