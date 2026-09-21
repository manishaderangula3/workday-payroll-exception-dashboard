import { sampleDashboardData } from "../data";
import type {
  DashboardData,
  DashboardFilters,
  DeductionResult,
  ExceptionBreakdownItem,
  ExecutiveHighlights,
  OvertimeMatrixRow,
  OvertimeTrendPoint,
  OverviewMetrics,
  PayrollTrendPoint,
  PayrollResult,
  TaxResult,
  TimeEntry,
  Worker
} from "../types/dashboard";

function matchesDepartment(worker: Worker, department: string): boolean {
  return department === "All Departments" || worker.department === department;
}

export function getWorkers(filters: DashboardFilters, data: DashboardData = sampleDashboardData): Worker[] {
  const searchTerm = filters.searchTerm.trim().toLowerCase();

  return data.workers.filter((worker) => {
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

export function getPayrollResults(
  filters: DashboardFilters,
  data: DashboardData = sampleDashboardData
): PayrollResult[] {
  const visibleWorkerIds = new Set(getWorkers(filters, data).map((worker) => worker.employeeId));

  return data.payrollResults.filter(
    (result) => result.payPeriod === filters.payPeriod && visibleWorkerIds.has(result.employeeId)
  );
}

export function getTimeEntries(filters: DashboardFilters, data: DashboardData = sampleDashboardData): TimeEntry[] {
  const visibleWorkerIds = new Set(getWorkers(filters, data).map((worker) => worker.employeeId));

  return data.timeEntries.filter(
    (entry) => entry.payPeriod === filters.payPeriod && visibleWorkerIds.has(entry.employeeId)
  );
}

export function getOvertimeEntries(
  filters: DashboardFilters,
  data: DashboardData = sampleDashboardData
): TimeEntry[] {
  const nonExemptWorkerIds = new Set(
    getWorkers(filters, data)
      .filter((worker) => worker.exemptStatus === "Non-Exempt")
      .map((worker) => worker.employeeId)
  );

  return data.timeEntries.filter(
    (entry) =>
      entry.payPeriod === filters.payPeriod &&
      entry.overtimeHours > 0 &&
      nonExemptWorkerIds.has(entry.employeeId)
  );
}

export function getTotalPayrollCost(results: PayrollResult[]): number {
  return results.reduce(
    (total, result) => total + result.grossPay + result.employerBenefitCost + result.employerTaxCost,
    0
  );
}

export function getPriorPayPeriod(payPeriod: string, data: DashboardData = sampleDashboardData): string | undefined {
  const currentIndex = data.payPeriods.indexOf(payPeriod);
  return currentIndex >= 0 ? data.payPeriods[currentIndex + 1] : undefined;
}

export function getPayrollCompletionRate(results: PayrollResult[], expectedWorkers: number): number {
  if (expectedWorkers === 0) {
    return 0;
  }

  const completeWorkers = new Set(
    results.filter((result) => result.payrollStatus === "Complete").map((result) => result.employeeId)
  ).size;
  return Math.min(completeWorkers / expectedWorkers, 1);
}

export function getOvertimeCost(entry: TimeEntry, data: DashboardData = sampleDashboardData): number {
  const worker = data.workers.find((item) => item.employeeId === entry.employeeId);

  if (!worker || worker.exemptStatus === "Exempt") {
    return 0;
  }

  return entry.overtimeHours * 1.5 * worker.hourlyRate + entry.doubleTimeHours * 2 * worker.hourlyRate;
}

export function getMissingTimeEntries(
  filters: DashboardFilters,
  data: DashboardData = sampleDashboardData
): TimeEntry[] {
  return getTimeEntries(filters, data).filter((entry) => getEffectiveMissingDates(entry).length > 0);
}

export function getEffectiveMissingDates(entry: TimeEntry): string[] {
  const submittedDates = new Set(entry.submittedWorkDates ?? []);
  const approvedLeaveDates = new Set(entry.approvedLeaveDates);
  const holidayDates = new Set(entry.holidayDates ?? []);
  const candidateDates = entry.expectedWorkDates?.length
    ? entry.expectedWorkDates.filter((date) => !submittedDates.has(date))
    : entry.missingDates;

  return [...new Set(candidateDates)].filter(
    (date) => !approvedLeaveDates.has(date) && !holidayDates.has(date)
  );
}

export function getDeductionExceptions(filters: DashboardFilters, data: DashboardData = sampleDashboardData) {
  const visibleWorkerIds = new Set(getWorkers(filters, data).map((worker) => worker.employeeId));

  return data.deductionResults.filter(
    (result) =>
      result.payPeriod === filters.payPeriod &&
      visibleWorkerIds.has(result.employeeId) &&
      result.exceptionType !== "None"
  );
}

export function getTaxExceptions(filters: DashboardFilters, data: DashboardData = sampleDashboardData) {
  const visibleWorkerIds = new Set(getWorkers(filters, data).map((worker) => worker.employeeId));

  return data.taxResults.filter(
    (result) =>
      result.payPeriod === filters.payPeriod &&
      visibleWorkerIds.has(result.employeeId) &&
      result.exceptionType !== "None"
  );
}

function findWorker(employeeId: string, data: DashboardData): Worker | undefined {
  return data.workers.find((worker) => worker.employeeId === employeeId);
}

function getWorkerDepartment(employeeId: string, data: DashboardData): string {
  return findWorker(employeeId, data)?.department ?? "Unassigned";
}

function getWorkerName(employeeId: string, data: DashboardData): string {
  return findWorker(employeeId, data)?.employeeName ?? employeeId;
}

function getPayrollDeadline(results: PayrollResult[], payPeriod: string): { date: string; daysRemaining: number } {
  const validDate = (value: string | undefined): value is string => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
  const date = results
    .map((result) => result.payrollApprovalDate || result.paymentDate)
    .filter(validDate)
    .sort()[0] ?? payPeriod.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? new Date().toISOString().slice(0, 10);
  const [year, month, day] = date.split("-").map(Number);
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineUtc = Date.UTC(year, month - 1, day);

  return {
    date,
    daysRemaining: Math.ceil((deadlineUtc - todayUtc) / 86_400_000)
  };
}

export function getExecutiveHighlights(
  filters: DashboardFilters,
  data: DashboardData = sampleDashboardData
): ExecutiveHighlights {
  const overtimeByWorker = new Map<string, ExecutiveHighlights["overtime"][number]>();

  getOvertimeEntries(filters, data).forEach((entry) => {
    const current = overtimeByWorker.get(entry.employeeId) ?? {
      employeeId: entry.employeeId,
      employeeName: getWorkerName(entry.employeeId, data),
      department: getWorkerDepartment(entry.employeeId, data),
      overtimeHours: 0,
      overtimeCost: 0
    };

    current.overtimeHours += entry.overtimeHours;
    current.overtimeCost += getOvertimeCost(entry, data);
    overtimeByWorker.set(entry.employeeId, current);
  });

  const overtime = [...overtimeByWorker.values()]
    .sort((a, b) => b.overtimeHours - a.overtimeHours)
    .slice(0, 5);

  const missingTime = getMissingTimeEntries(filters, data)
    .map((entry) => ({
      employeeId: entry.employeeId,
      employeeName: getWorkerName(entry.employeeId, data),
      department: getWorkerDepartment(entry.employeeId, data),
      missingDays: getEffectiveMissingDates(entry).length,
      missingDates: getEffectiveMissingDates(entry)
    }))
    .sort((a, b) => b.missingDays - a.missingDays)
    .slice(0, 5);

  const deductions = getDeductionExceptions(filters, data)
    .map((result: DeductionResult) => ({
      employeeId: result.employeeId,
      employeeName: getWorkerName(result.employeeId, data),
      department: getWorkerDepartment(result.employeeId, data),
      deductionName: result.deductionName,
      exceptionType: result.exceptionType,
      variance: result.actualAmount - result.expectedAmount
    }))
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
    .slice(0, 5);

  const taxes = getTaxExceptions(filters, data)
    .map((result: TaxResult) => ({
      employeeId: result.employeeId,
      employeeName: getWorkerName(result.employeeId, data),
      department: getWorkerDepartment(result.employeeId, data),
      taxAuthority: result.taxAuthority,
      exceptionType: result.exceptionType,
      variance: result.actualTax - result.expectedTax
    }))
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
    .slice(0, 5);

  return {
    overtime,
    missingTime,
    deductions,
    taxes
  };
}

export function getExceptionBreakdown(
  filters: DashboardFilters,
  data: DashboardData = sampleDashboardData
): ExceptionBreakdownItem[] {
  const overtimeCount = new Set(getOvertimeEntries(filters, data).map((entry) => entry.employeeId)).size;
  const missingTimeCount = new Set(getMissingTimeEntries(filters, data).map((entry) => entry.employeeId)).size;
  const deductionCount = new Set(getDeductionExceptions(filters, data).map((entry) => entry.employeeId)).size;
  const taxCount = new Set(getTaxExceptions(filters, data).map((entry) => entry.employeeId)).size;

  return [
    {
      label: "Overtime",
      count: overtimeCount,
      colorClass: "bg-workday-amber",
      chartColor: "#FF9800",
      tabId: "overtime"
    },
    {
      label: "Missing Time",
      count: missingTimeCount,
      colorClass: "bg-workday-red",
      chartColor: "#F44336",
      tabId: "missing-time"
    },
    {
      label: "Deductions",
      count: deductionCount,
      colorClass: "bg-blue-500",
      chartColor: "#1976D2",
      tabId: "deductions"
    },
    {
      label: "Tax Issues",
      count: taxCount,
      colorClass: "bg-emerald-500",
      chartColor: "#10B981",
      tabId: "tax-issues"
    }
  ];
}

export function getPayrollTrend(filters: DashboardFilters, data: DashboardData = sampleDashboardData): PayrollTrendPoint[] {
  return data.kpiHistory.map((point) => ({
    payPeriod: point.payPeriod,
    label: point.payPeriod.replace(" Semi-Monthly", ""),
    payrollCost: point.payrollCost,
    completionRate: point.payrollCompletionRate,
    exceptionRate: point.exceptionRate,
    isSelected: point.payPeriod === filters.payPeriod
  }));
}

export function getOvertimeTrend(
  filters: DashboardFilters,
  data: DashboardData = sampleDashboardData
): OvertimeTrendPoint[] {
  const visibleDepartments = new Set(getWorkers(filters, data).map((worker) => worker.department));

  return data.overtimeTrends.filter((point) => {
    const departmentMatch = filters.department === "All Departments" || point.department === filters.department;
    return departmentMatch && visibleDepartments.has(point.department);
  });
}

export function getOvertimeMatrix(filters: DashboardFilters, data: DashboardData = sampleDashboardData): OvertimeMatrixRow[] {
  const matrix = new Map<string, OvertimeMatrixRow>();

  getOvertimeTrend(filters, data).forEach((point) => {
    const row = matrix.get(point.department) ?? {
      department: point.department,
      total: 0,
      weeks: {}
    };

    row.weeks[point.weekLabel] = point.overtimeHours;
    row.total += point.overtimeHours;
    matrix.set(point.department, row);
  });

  return [...matrix.values()].sort((a, b) => b.total - a.total);
}

export function getOpenExceptionWorkerIds(filters: DashboardFilters, data: DashboardData = sampleDashboardData): Set<string> {
  const ids = new Set<string>();

  getOvertimeEntries(filters, data).forEach((entry) => ids.add(entry.employeeId));
  getMissingTimeEntries(filters, data).forEach((entry) => ids.add(entry.employeeId));

  getDeductionExceptions(filters, data).forEach((result) => ids.add(result.employeeId));
  getTaxExceptions(filters, data).forEach((result) => ids.add(result.employeeId));
  getPayrollResults(filters, data)
    .filter((result) => result.payrollStatus === "Error")
    .forEach((result) => ids.add(result.employeeId));

  return ids;
}

export function getCriticalExceptionWorkerIds(
  filters: DashboardFilters,
  data: DashboardData = sampleDashboardData
): Set<string> {
  const ids = new Set<string>();

  getOvertimeEntries(filters, data).forEach((entry) => {
    if (entry.overtimeHours > 10) {
      ids.add(entry.employeeId);
    }
  });

  getMissingTimeEntries(filters, data).forEach((entry) => {
    if (getEffectiveMissingDates(entry).length > 3) {
      ids.add(entry.employeeId);
    }
  });

  getDeductionExceptions(filters, data)
    .filter((result) => result.exceptionType === "Failed" || result.exceptionType === "Arrears")
    .forEach((result) => ids.add(result.employeeId));

  getTaxExceptions(filters, data)
    .filter((result) => result.exceptionType === "No Withholding" || result.exceptionType === "Multi-State Issue")
    .forEach((result) => ids.add(result.employeeId));

  getPayrollResults(filters, data)
    .filter((result) => result.payrollStatus === "Error")
    .forEach((result) => ids.add(result.employeeId));

  return ids;
}

export function getOverviewMetrics(filters: DashboardFilters, data: DashboardData = sampleDashboardData): OverviewMetrics {
  const visibleWorkers = getWorkers(filters, data);
  const results = getPayrollResults(filters, data);
  const totalPayrollCost = getTotalPayrollCost(results);
  const priorPayPeriod = getPriorPayPeriod(filters.payPeriod, data);
  const priorResults = priorPayPeriod
    ? getPayrollResults({ ...filters, payPeriod: priorPayPeriod }, data)
    : [];
  const priorPayrollCost = getTotalPayrollCost(priorResults);
  const expectedWorkers = visibleWorkers.length;
  const workersProcessed = new Set(
    results.filter((result) => result.payrollStatus === "Complete").map((result) => result.employeeId)
  ).size;
  const payrollCompletionRate = getPayrollCompletionRate(results, expectedWorkers);
  const overtimeEntries = getOvertimeEntries(filters, data);
  const overtimeHours = overtimeEntries.reduce((total, entry) => total + entry.overtimeHours, 0);
  const overtimeCost = overtimeEntries.reduce((total, entry) => total + getOvertimeCost(entry, data), 0);
  const priorOvertimeEntries = priorPayPeriod
    ? getOvertimeEntries({ ...filters, payPeriod: priorPayPeriod }, data)
    : [];
  const priorOvertimeHours = priorOvertimeEntries.reduce((total, entry) => total + entry.overtimeHours, 0);
  const overtimeTrendPercent =
    priorOvertimeHours === 0 ? 0 : (overtimeHours - priorOvertimeHours) / priorOvertimeHours;
  const exceptionWorkerIds = getOpenExceptionWorkerIds(filters, data);
  const criticalExceptionWorkerIds = getCriticalExceptionWorkerIds(filters, data);
  const departmentExceptionCounts = new Map<string, number>();

  exceptionWorkerIds.forEach((employeeId) => {
    const worker = data.workers.find((item) => item.employeeId === employeeId);
    if (worker && matchesDepartment(worker, filters.department)) {
      departmentExceptionCounts.set(worker.department, (departmentExceptionCounts.get(worker.department) ?? 0) + 1);
    }
  });

  const [topDepartmentName = "None", topDepartmentCount = 0] =
    [...departmentExceptionCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  const highlights = getExecutiveHighlights(filters, data);
  const highestOvertime = highlights.overtime[0];
  const payrollDeadline = getPayrollDeadline(results, filters.payPeriod);

  return {
    totalPayrollCost,
    priorPayrollCost,
    workersProcessed,
    workersExpected: expectedWorkers,
    payrollCompletionRate,
    openExceptionWorkers: exceptionWorkerIds.size,
    criticalExceptionWorkers: criticalExceptionWorkerIds.size,
    missingTimeWorkers: new Set(getMissingTimeEntries(filters, data).map((entry) => entry.employeeId)).size,
    workersNearDeadline: new Set(
      getMissingTimeEntries(filters, data)
        .filter((entry) => getEffectiveMissingDates(entry).length >= 3)
        .map((entry) => entry.employeeId)
    ).size,
    overtimeHours,
    overtimeCost,
    overtimeTrendPercent,
    topDepartment: {
      name: topDepartmentName,
      exceptionCount: topDepartmentCount
    },
    highestOvertimeWorker: {
      name: highestOvertime?.employeeName ?? "None",
      overtimeHours: highestOvertime?.overtimeHours ?? 0
    },
    approvalDeadline: payrollDeadline.date,
    daysToDeadline: payrollDeadline.daysRemaining,
    exceptionBreakdown: getExceptionBreakdown(filters, data),
    highlights
  };
}
