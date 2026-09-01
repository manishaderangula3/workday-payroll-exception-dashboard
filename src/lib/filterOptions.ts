import { sampleDashboardData } from "../data";
import type { DashboardData, FilterOptions } from "../types/dashboard";

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function getFilterOptions(data: DashboardData = sampleDashboardData): FilterOptions {
  return {
    payPeriods: data.payPeriods,
    companies: ["All Companies", ...uniqueSorted(data.workers.map((worker) => worker.company))],
    payGroups: ["All Pay Groups", ...uniqueSorted(data.workers.map((worker) => worker.payGroup))],
    departments: ["All Departments", ...uniqueSorted(data.workers.map((worker) => worker.department))]
  };
}
