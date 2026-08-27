import { deductionResults, payrollResults, taxResults, timeEntries, workers } from "../data";
import type { DashboardFilters } from "../types/dashboard";

export function getWorkerSnapshot(employeeId: string, filters: DashboardFilters) {
  const worker = workers.find((item) => item.employeeId === employeeId);

  if (!worker) {
    return undefined;
  }

  return {
    worker,
    payroll: payrollResults.find(
      (result) => result.employeeId === employeeId && result.payPeriod === filters.payPeriod
    ),
    timeEntries: timeEntries.filter(
      (entry) => entry.employeeId === employeeId && entry.payPeriod === filters.payPeriod
    ),
    deductions: deductionResults.filter(
      (deduction) => deduction.employeeId === employeeId && deduction.payPeriod === filters.payPeriod
    ),
    taxes: taxResults.filter((tax) => tax.employeeId === employeeId && tax.payPeriod === filters.payPeriod)
  };
}
