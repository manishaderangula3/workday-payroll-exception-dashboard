import { deductionResults, payrollResults, payPeriods, taxResults, timeEntries, workers } from "../data";
import type {
  DashboardFilters,
  ExceptionBreakdownItem,
  OverviewMetrics,
  PayrollResult,
  TimeEntry,
  Worker
} from "../types/dashboard";

function matchesDepartment(worker: Worker, department: string): boolean {
  return department === "All Departments" || worker.department === department;
}

export function getWorkers(filters: DashboardFilters): Worker[] {
  const searchTerm = filters.searchTerm.trim().toLowerCase();

  return workers.filter((worker) => {
    const companyMatch = filters.company === "All Companies" || worker.company === filters.company;
    const payGroupMatch = filters.payGroup === "All Pay Groups" || worker.payGroup === filters.payGroup;
    const searchMatch =
      !searchTerm ||
      [
        worker.employeeId,
        worker.employeeName,
        worker.department,
        worker.manager,
        worker.company,
        worker.payGroup,
        worker.location
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);

    return worker.active && matchesDepartment(worker, filters.department) && companyMatch && payGroupMatch && searchMatch;
  });
}

export function getPayrollResults(filters: DashboardFilters): PayrollResult[] {
  const visibleWorkerIds = new Set(getWorkers(filters).map((worker) => worker.employeeId));

  return payrollResults.filter(
    (result) => result.payPeriod === filters.payPeriod && visibleWorkerIds.has(result.employeeId)
  );
}

export function getTimeEntries(filters: DashboardFilters): TimeEntry[] {
  const visibleWorkerIds = new Set(getWorkers(filters).map((worker) => worker.employeeId));

  return timeEntries.filter(
    (entry) => entry.payPeriod === filters.payPeriod && visibleWorkerIds.has(entry.employeeId)
  );
}

export function getTotalPayrollCost(results: PayrollResult[]): number {
  return results.reduce(
    (total, result) => total + result.grossPay + result.employerBenefitCost + result.employerTaxCost,
    0
  );
}

export function getPriorPayPeriod(payPeriod: string): string | undefined {
  const currentIndex = payPeriods.indexOf(payPeriod);
  return currentIndex >= 0 ? payPeriods[currentIndex + 1] : undefined;
}

export function getPayrollCompletionRate(results: PayrollResult[], expectedWorkers: number): number {
  if (expectedWorkers === 0) {
    return 0;
  }

  const completeWorkers = results.filter((result) => result.payrollStatus === "Complete").length;
  return completeWorkers / expectedWorkers;
}

export function getOvertimeCost(entry: TimeEntry): number {
  const worker = workers.find((item) => item.employeeId === entry.employeeId);

  if (!worker || worker.exemptStatus === "Exempt") {
    return 0;
  }

  return entry.overtimeHours * 1.5 * worker.hourlyRate + entry.doubleTimeHours * 2 * worker.hourlyRate;
}

export function getMissingTimeEntries(filters: DashboardFilters): TimeEntry[] {
  return getTimeEntries(filters).filter((entry) => entry.missingDates.length > 0);
}

export function getDeductionExceptions(filters: DashboardFilters) {
  const visibleWorkerIds = new Set(getWorkers(filters).map((worker) => worker.employeeId));

  return deductionResults.filter(
    (result) =>
      result.payPeriod === filters.payPeriod &&
      visibleWorkerIds.has(result.employeeId) &&
      result.exceptionType !== "None"
  );
}

export function getTaxExceptions(filters: DashboardFilters) {
  const visibleWorkerIds = new Set(getWorkers(filters).map((worker) => worker.employeeId));

  return taxResults.filter(
    (result) =>
      result.payPeriod === filters.payPeriod &&
      visibleWorkerIds.has(result.employeeId) &&
      result.exceptionType !== "None"
  );
}

export function getExceptionBreakdown(filters: DashboardFilters): ExceptionBreakdownItem[] {
  const overtimeCount = getTimeEntries(filters).filter((entry) => entry.overtimeHours > 0).length;
  const missingTimeCount = getMissingTimeEntries(filters).length;
  const deductionCount = getDeductionExceptions(filters).length;
  const taxCount = getTaxExceptions(filters).length;

  return [
    { label: "Overtime", count: overtimeCount, colorClass: "bg-workday-amber" },
    { label: "Missing Time", count: missingTimeCount, colorClass: "bg-workday-red" },
    { label: "Deductions", count: deductionCount, colorClass: "bg-blue-500" },
    { label: "Tax Issues", count: taxCount, colorClass: "bg-emerald-500" }
  ];
}

export function getOpenExceptionWorkerIds(filters: DashboardFilters): Set<string> {
  const ids = new Set<string>();

  getTimeEntries(filters).forEach((entry) => {
    if (entry.overtimeHours > 0 || entry.missingDates.length > 0) {
      ids.add(entry.employeeId);
    }
  });

  getDeductionExceptions(filters).forEach((result) => ids.add(result.employeeId));
  getTaxExceptions(filters).forEach((result) => ids.add(result.employeeId));
  getPayrollResults(filters)
    .filter((result) => result.payrollStatus === "Error")
    .forEach((result) => ids.add(result.employeeId));

  return ids;
}

export function getCriticalExceptionWorkerIds(filters: DashboardFilters): Set<string> {
  const ids = new Set<string>();

  getTimeEntries(filters).forEach((entry) => {
    if (entry.overtimeHours > 10 || entry.missingDates.length > 3) {
      ids.add(entry.employeeId);
    }
  });

  getDeductionExceptions(filters)
    .filter((result) => result.exceptionType === "Failed" || result.exceptionType === "Arrears")
    .forEach((result) => ids.add(result.employeeId));

  getTaxExceptions(filters)
    .filter((result) => result.exceptionType === "No Withholding" || result.exceptionType === "Multi-State Issue")
    .forEach((result) => ids.add(result.employeeId));

  getPayrollResults(filters)
    .filter((result) => result.payrollStatus === "Error")
    .forEach((result) => ids.add(result.employeeId));

  return ids;
}

export function getOverviewMetrics(filters: DashboardFilters): OverviewMetrics {
  const visibleWorkers = getWorkers(filters);
  const results = getPayrollResults(filters);
  const totalPayrollCost = getTotalPayrollCost(results);
  const priorPayPeriod = getPriorPayPeriod(filters.payPeriod);
  const priorResults = priorPayPeriod
    ? getPayrollResults({ ...filters, payPeriod: priorPayPeriod })
    : [];
  const priorPayrollCost = getTotalPayrollCost(priorResults);
  const expectedWorkers = visibleWorkers.length;
  const workersProcessed = results.filter((result) => result.payrollStatus === "Complete").length;
  const payrollCompletionRate = getPayrollCompletionRate(results, expectedWorkers);
  const visibleTimeEntries = getTimeEntries(filters);
  const overtimeEntries = visibleTimeEntries.filter((entry) => entry.overtimeHours > 0);
  const overtimeHours = overtimeEntries.reduce((total, entry) => total + entry.overtimeHours, 0);
  const overtimeCost = overtimeEntries.reduce((total, entry) => total + getOvertimeCost(entry), 0);
  const priorOvertimeEntries = priorPayPeriod
    ? getTimeEntries({ ...filters, payPeriod: priorPayPeriod }).filter((entry) => entry.overtimeHours > 0)
    : [];
  const priorOvertimeHours = priorOvertimeEntries.reduce((total, entry) => total + entry.overtimeHours, 0);
  const overtimeTrendPercent =
    priorOvertimeHours === 0 ? 0 : (overtimeHours - priorOvertimeHours) / priorOvertimeHours;
  const exceptionWorkerIds = getOpenExceptionWorkerIds(filters);
  const criticalExceptionWorkerIds = getCriticalExceptionWorkerIds(filters);
  const departmentExceptionCounts = new Map<string, number>();

  exceptionWorkerIds.forEach((employeeId) => {
    const worker = workers.find((item) => item.employeeId === employeeId);
    if (worker && matchesDepartment(worker, filters.department)) {
      departmentExceptionCounts.set(worker.department, (departmentExceptionCounts.get(worker.department) ?? 0) + 1);
    }
  });

  const [topDepartmentName = "None", topDepartmentCount = 0] =
    [...departmentExceptionCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  const highestOvertime = [...overtimeEntries].sort((a, b) => b.overtimeHours - a.overtimeHours)[0];
  const highestOvertimeWorker = highestOvertime
    ? workers.find((worker) => worker.employeeId === highestOvertime.employeeId)
    : undefined;

  return {
    totalPayrollCost,
    priorPayrollCost,
    workersProcessed,
    workersExpected: expectedWorkers,
    payrollCompletionRate,
    openExceptionWorkers: exceptionWorkerIds.size,
    criticalExceptionWorkers: criticalExceptionWorkerIds.size,
    missingTimeWorkers: getMissingTimeEntries(filters).length,
    workersNearDeadline: getMissingTimeEntries(filters).filter((entry) => entry.missingDates.length >= 3).length,
    overtimeHours,
    overtimeCost,
    overtimeTrendPercent,
    topDepartment: {
      name: topDepartmentName,
      exceptionCount: topDepartmentCount
    },
    highestOvertimeWorker: {
      name: highestOvertimeWorker?.employeeName ?? "None",
      overtimeHours: highestOvertime?.overtimeHours ?? 0
    },
    approvalDeadline: "2026-08-23",
    daysToDeadline: 3,
    exceptionBreakdown: getExceptionBreakdown(filters)
  };
}
