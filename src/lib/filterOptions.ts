import { payPeriods, workers } from "../data";
import type { FilterOptions } from "../types/dashboard";

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function getFilterOptions(): FilterOptions {
  return {
    payPeriods,
    companies: ["All Companies", ...uniqueSorted(workers.map((worker) => worker.company))],
    payGroups: ["All Pay Groups", ...uniqueSorted(workers.map((worker) => worker.payGroup))],
    departments: ["All Departments", ...uniqueSorted(workers.map((worker) => worker.department))]
  };
}
