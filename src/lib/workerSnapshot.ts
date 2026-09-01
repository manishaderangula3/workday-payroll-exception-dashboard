import { sampleDashboardData } from "../data";
import type { DashboardData, DashboardFilters } from "../types/dashboard";

export function getWorkerSnapshot(
  employeeId: string,
  filters: DashboardFilters,
  data: DashboardData = sampleDashboardData
) {
  const worker = data.workers.find((item) => item.employeeId === employeeId);

  if (!worker) {
    return undefined;
  }

  return {
    worker,
    payroll: data.payrollResults.find(
      (result) => result.employeeId === employeeId && result.payPeriod === filters.payPeriod
    ),
    timeEntries: data.timeEntries.filter(
      (entry) => entry.employeeId === employeeId && entry.payPeriod === filters.payPeriod
    ),
    deductions: data.deductionResults.filter(
      (deduction) => deduction.employeeId === employeeId && deduction.payPeriod === filters.payPeriod
    ),
    taxes: data.taxResults.filter((tax) => tax.employeeId === employeeId && tax.payPeriod === filters.payPeriod)
  };
}
