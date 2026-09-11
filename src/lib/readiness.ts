import {
  getDeductionExceptions,
  getMissingTimeEntries,
  getOverviewMetrics,
  getPayrollResults,
  getTaxExceptions,
  getTimeEntries,
  getWorkers
} from "./calculations";
import type { DashboardData, DashboardFilters, DashboardThresholds, Severity } from "../types/dashboard";

export type ReadinessStatus = "Ready" | "Needs Review" | "Blocked";

export interface ReadinessChecklistItem {
  label: string;
  status: Severity;
  value: string;
  owner: string;
  action: string;
}

export interface PayrollReadinessSummary {
  status: ReadinessStatus;
  score: number;
  criticalCount: number;
  warningCount: number;
  checklist: ReadinessChecklistItem[];
  blockers: ReadinessChecklistItem[];
}

function checklistItem(
  label: string,
  status: Severity,
  value: string,
  owner: string,
  action: string
): ReadinessChecklistItem {
  return { label, status, value, owner, action };
}

function issueStatus(count: number, criticalWhenAny = false): Severity {
  if (criticalWhenAny && count > 0) {
    return "critical";
  }

  return count > 0 ? "warning" : "success";
}

export function getPayrollReadinessSummary(
  filters: DashboardFilters,
  data: DashboardData,
  thresholds: DashboardThresholds
): PayrollReadinessSummary {
  const metrics = getOverviewMetrics(filters, data);
  const workers = getWorkers(filters, data);
  const payrollResults = getPayrollResults(filters, data);
  const payrollResultIds = new Set(payrollResults.map((row) => row.employeeId));
  const missingPayrollResults = workers.filter((worker) => !payrollResultIds.has(worker.employeeId)).length;
  const allWorkerIds = new Set(data.workers.map((worker) => worker.employeeId));
  const currentPeriodRows = [
    ...data.payrollResults,
    ...data.timeEntries,
    ...data.deductionResults,
    ...data.taxResults
  ].filter((row) => row.payPeriod === filters.payPeriod);
  const orphanRows = currentPeriodRows.filter((row) => !allWorkerIds.has(row.employeeId)).length;
  const negativePayrollRows = payrollResults.filter((row) => row.grossPay < 0 || row.netPay < 0).length;
  const missingOrgWorkers = workers.filter((worker) => !worker.department || !worker.manager).length;
  const deductionExceptions = getDeductionExceptions(filters, data);
  const taxExceptions = getTaxExceptions(filters, data);
  const overtimeHours = getTimeEntries(filters, data).reduce((total, entry) => total + entry.overtimeHours, 0);
  const costVariance =
    metrics.priorPayrollCost === 0 ? 0 : Math.abs(metrics.totalPayrollCost - metrics.priorPayrollCost) / metrics.priorPayrollCost;
  const dataQualityIssues = missingPayrollResults + orphanRows + negativePayrollRows + missingOrgWorkers;
  const dataQualityCritical = missingPayrollResults + orphanRows + negativePayrollRows;

  const checklist = [
    checklistItem(
      "Payroll completion",
      metrics.payrollCompletionRate < thresholds.completionRed
        ? "critical"
        : metrics.payrollCompletionRate < thresholds.completionYellow
          ? "warning"
          : "success",
      `${metrics.workersProcessed} of ${metrics.workersExpected} workers complete`,
      "Payroll Manager",
      "Complete pending payroll results before approval."
    ),
    checklistItem(
      "Missing time cleared",
      issueStatus(metrics.missingTimeWorkers, true),
      `${metrics.missingTimeWorkers} workers with missing time`,
      "Department Managers",
      "Submit or approve missing time entries."
    ),
    checklistItem(
      "Overtime reviewed",
      overtimeHours >= thresholds.overtimeCriticalHours
        ? "critical"
        : overtimeHours >= thresholds.overtimeWarningHours || overtimeHours > 0
          ? "warning"
          : "success",
      `${overtimeHours.toFixed(overtimeHours % 1 === 0 ? 0 : 1)} total OT hours`,
      "Payroll Operations",
      "Review high overtime workers and manager approvals."
    ),
    checklistItem(
      "Deduction exceptions resolved",
      deductionExceptions.some((row) => row.exceptionType === "Failed" || row.exceptionType === "Arrears")
        ? "critical"
        : issueStatus(deductionExceptions.length),
      `${deductionExceptions.length} deduction exceptions`,
      "Benefits Administrator",
      "Resolve failed deductions, arrears, and variance items."
    ),
    checklistItem(
      "Tax exceptions reviewed",
      taxExceptions.some((row) => row.exceptionType === "No Withholding" || row.exceptionType === "Multi-State Issue")
        ? "critical"
        : issueStatus(taxExceptions.length),
      `${taxExceptions.length} tax exceptions`,
      "Tax Analyst",
      "Review withholding, tax elections, and jurisdiction issues."
    ),
    checklistItem(
      "Payroll cost variance checked",
      costVariance > thresholds.payrollCostVarianceWarning ? "warning" : "success",
      metrics.priorPayrollCost === 0 ? "No prior period" : `${(costVariance * 100).toFixed(1)}% vs prior period`,
      "Finance Analyst",
      "Confirm payroll cost movement against prior period and GL expectations."
    ),
    checklistItem(
      "Data quality passed",
      dataQualityCritical > 0 ? "critical" : issueStatus(dataQualityIssues),
      `${dataQualityIssues} source data issues`,
      "HRIS Analyst",
      "Fix missing payroll rows, orphan rows, negative pay, or missing org data."
    )
  ];
  const blockers = checklist.filter((item) => item.status === "critical" || item.status === "warning");
  const criticalCount = checklist.filter((item) => item.status === "critical").length;
  const warningCount = checklist.filter((item) => item.status === "warning").length;
  const status: ReadinessStatus = criticalCount > 0 ? "Blocked" : warningCount > 0 ? "Needs Review" : "Ready";
  const score = Math.max(0, 100 - criticalCount * 18 - warningCount * 8);

  return {
    status,
    score,
    criticalCount,
    warningCount,
    checklist,
    blockers
  };
}
