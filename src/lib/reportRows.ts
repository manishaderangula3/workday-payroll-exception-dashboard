import {
  getDeductionExceptions,
  getOvertimeCost,
  getPayrollResults,
  getTaxExceptions,
  getTimeEntries,
  getWorkers
} from "./calculations";
import type { DashboardFilters, Worker } from "../types/dashboard";
import type {
  DeductionExceptionReportRow,
  MissingTimeReportRow,
  OvertimeReportRow,
  PayrollCostReportRow,
  TaxExceptionReportRow
} from "../types/reports";

function workerMap(filters: DashboardFilters): Map<string, Worker> {
  return new Map(getWorkers(filters).map((worker) => [worker.employeeId, worker]));
}

function getWorkerOrThrow(workersById: Map<string, Worker>, employeeId: string): Worker {
  const worker = workersById.get(employeeId);

  if (!worker) {
    throw new Error(`Missing worker fixture for ${employeeId}`);
  }

  return worker;
}

function getOvertimeAlert(overtimeHours: number): OvertimeReportRow["alert"] {
  if (overtimeHours > 10) {
    return "Red";
  }

  if (overtimeHours > 5) {
    return "Yellow";
  }

  return "None";
}

export function getPayrollCostReportRows(filters: DashboardFilters): PayrollCostReportRow[] {
  const workersById = workerMap(filters);

  return getPayrollResults(filters)
    .map((result) => {
      const worker = getWorkerOrThrow(workersById, result.employeeId);
      const employerCosts = result.employerBenefitCost + result.employerTaxCost;

      return {
        employeeId: result.employeeId,
        employeeName: worker.employeeName,
        department: worker.department,
        payGroup: worker.payGroup,
        grossPay: result.grossPay,
        netPay: result.netPay,
        totalDeductions: result.totalDeductions,
        totalTaxes: result.totalTaxes,
        employerCosts,
        totalPayrollCost: result.grossPay + employerCosts,
        payPeriod: result.payPeriod,
        paymentDate: result.paymentDate,
        payrollStatus: result.payrollStatus
      };
    })
    .sort((a, b) => a.department.localeCompare(b.department) || a.employeeName.localeCompare(b.employeeName));
}

export function getOvertimeReportRows(filters: DashboardFilters): OvertimeReportRow[] {
  const workersById = workerMap(filters);

  return getTimeEntries(filters)
    .filter((entry) => entry.overtimeHours > 0)
    .map((entry) => {
      const worker = getWorkerOrThrow(workersById, entry.employeeId);

      return {
        employeeId: entry.employeeId,
        employeeName: worker.employeeName,
        department: worker.department,
        manager: worker.manager,
        scheduledHours: entry.scheduledHours,
        actualHoursWorked: entry.actualHoursWorked,
        regularHours: entry.regularHours,
        overtimeHours: entry.overtimeHours,
        doubleTimeHours: entry.doubleTimeHours,
        overtimeCost: getOvertimeCost(entry),
        weekEndingDate: entry.weekEndingDate,
        payPeriod: entry.payPeriod,
        alert: getOvertimeAlert(entry.overtimeHours)
      };
    })
    .sort((a, b) => b.overtimeHours - a.overtimeHours);
}

export function getMissingTimeReportRows(filters: DashboardFilters): MissingTimeReportRow[] {
  const workersById = workerMap(filters);

  return getTimeEntries(filters)
    .filter((entry) => entry.missingDates.length > 0)
    .map((entry) => {
      const worker = getWorkerOrThrow(workersById, entry.employeeId);

      return {
        employeeId: entry.employeeId,
        employeeName: worker.employeeName,
        department: worker.department,
        manager: worker.manager,
        managerEmail: worker.managerEmail,
        workSchedule: worker.workSchedule,
        expectedWorkDays: entry.expectedDays,
        submittedTimeEntryDays: entry.submittedDays,
        missingDays: entry.missingDates.length,
        missingDates: entry.missingDates,
        lastSubmissionDate: entry.lastSubmissionDate ?? "No submission",
        timeEntryStatus: entry.timeEntryStatus,
        missingTimeFlag: true
      };
    })
    .sort((a, b) => b.missingDays - a.missingDays);
}

export function getDeductionExceptionReportRows(filters: DashboardFilters): DeductionExceptionReportRow[] {
  const workersById = workerMap(filters);

  return getDeductionExceptions(filters)
    .map((result) => {
      const worker = getWorkerOrThrow(workersById, result.employeeId);

      return {
        employeeId: result.employeeId,
        employeeName: worker.employeeName,
        department: worker.department,
        deductionName: result.deductionName,
        deductionCategory: result.deductionCategory,
        expectedAmount: result.expectedAmount,
        actualAmountTaken: result.actualAmount,
        variance: result.actualAmount - result.expectedAmount,
        exceptionType: result.exceptionType,
        arrearsBalance: result.arrearsBalance,
        payPeriod: result.payPeriod,
        payrollRun: result.payrollRun
      };
    })
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
}

export function getTaxExceptionReportRows(filters: DashboardFilters): TaxExceptionReportRow[] {
  const workersById = workerMap(filters);

  return getTaxExceptions(filters)
    .map((result) => {
      const worker = getWorkerOrThrow(workersById, result.employeeId);

      return {
        employeeId: result.employeeId,
        employeeName: worker.employeeName,
        department: worker.department,
        taxAuthority: result.taxAuthority,
        taxFormStatus: result.taxFormStatus,
        expectedTax: result.expectedTax,
        actualTax: result.actualTax,
        variance: result.actualTax - result.expectedTax,
        exceptionType: result.exceptionType,
        payPeriod: result.payPeriod
      };
    })
    .sort((a, b) => a.exceptionType.localeCompare(b.exceptionType) || Math.abs(b.variance) - Math.abs(a.variance));
}
