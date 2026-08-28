import { formatCompactCurrency, formatPercent, formatVariancePercent } from "./formatters";
import type { DashboardThresholds, KpiCard, OverviewMetrics, Severity } from "../types/dashboard";

function thresholdSeverity(value: number, yellow: number, red: number, direction: "above" | "below"): Severity {
  if (direction === "above") {
    if (value > red) {
      return "critical";
    }

    if (value >= yellow) {
      return "warning";
    }

    return "success";
  }

  if (value < red) {
    return "critical";
  }

  if (value < yellow) {
    return "warning";
  }

  return "success";
}

export function buildOverviewKpiCards(metrics: OverviewMetrics, thresholds: DashboardThresholds): KpiCard[] {
  const payrollCostVariance =
    metrics.priorPayrollCost > 0
      ? (metrics.totalPayrollCost - metrics.priorPayrollCost) / metrics.priorPayrollCost
      : 0;

  return [
    {
      label: "Total Payroll Cost",
      value: formatCompactCurrency(metrics.totalPayrollCost),
      detail: "Current period payroll cost",
      severity: payrollCostVariance > thresholds.payrollCostVarianceWarning ? "warning" : "success",
      trend: formatVariancePercent(metrics.totalPayrollCost, metrics.priorPayrollCost),
      target: `Alert if variance > ${formatPercent(thresholds.payrollCostVarianceWarning)}`
    },
    {
      label: "Payroll Completion",
      value: formatPercent(metrics.payrollCompletionRate),
      detail: `${metrics.workersProcessed} of ${metrics.workersExpected} workers complete`,
      severity: thresholdSeverity(metrics.payrollCompletionRate, thresholds.completionYellow, thresholds.completionRed, "below"),
      trend: "Target 100%",
      progress: metrics.payrollCompletionRate,
      target: `Green at ${formatPercent(thresholds.completionYellow)}+`
    },
    {
      label: "Workers with Exceptions",
      value: `${metrics.openExceptionWorkers}`,
      detail: "Across time, deductions, and tax",
      severity: thresholdSeverity(metrics.openExceptionWorkers, thresholds.exceptionYellow, thresholds.exceptionRed, "above"),
      trend: `${metrics.criticalExceptionWorkers} critical`,
      target: `Critical above ${thresholds.exceptionRed}`
    },
    {
      label: "Missing Time",
      value: `${metrics.missingTimeWorkers}`,
      detail: "Workers with unsubmitted time",
      severity: thresholdSeverity(metrics.missingTimeWorkers, thresholds.missingTimeYellow, thresholds.missingTimeRed, "above"),
      trend: `${metrics.workersNearDeadline} near deadline`,
      target: `Target below ${thresholds.missingTimeYellow}`
    },
    {
      label: "OT Hours",
      value: metrics.overtimeHours.toFixed(1),
      detail: `${formatCompactCurrency(metrics.overtimeCost)} estimated cost`,
      severity: thresholdSeverity(
        metrics.overtimeHours,
        thresholds.overtimeWarningHours,
        thresholds.overtimeCriticalHours,
        "above"
      ),
      trend: `${formatPercent(metrics.overtimeTrendPercent)} vs prior period`,
      target: `Warning at ${thresholds.overtimeWarningHours}+ hours`
    }
  ];
}
