import { describe, expect, it } from "vitest";
import {
  getExceptionBreakdown,
  getExecutiveHighlights,
  getOvertimeMatrix,
  getPayrollTrend,
  getOverviewMetrics,
  getWorkers
} from "./calculations";
import { defaultThresholds } from "../data/thresholds";
import { sampleDashboardData } from "../data";
import { getPayrollReadinessSummary } from "./readiness";

const currentFilters = {
  payPeriod: "2026-08-15 Semi-Monthly",
  company: "All Companies",
  payGroup: "All Pay Groups",
  department: "All Departments",
  searchTerm: ""
};

describe("dashboard sample data calculations", () => {
  it("filters active workers by department", () => {
    expect(getWorkers(currentFilters)).toHaveLength(12);
    expect(getWorkers({ ...currentFilters, department: "Operations" })).toHaveLength(5);
  });

  it("applies shared company, pay group, and search prompts", () => {
    expect(getWorkers({ ...currentFilters, company: "Northstar Retail Group" })).toHaveLength(2);
    expect(getWorkers({ ...currentFilters, payGroup: "US Semi-Monthly" })).toHaveLength(4);
    expect(getWorkers({ ...currentFilters, searchTerm: "Avery" })).toHaveLength(1);
    expect(getWorkers({ ...currentFilters, searchTerm: "no-results" })).toHaveLength(0);
  });

  it("calculates overview metrics for the current pay period", () => {
    const metrics = getOverviewMetrics(currentFilters);

    expect(metrics.workersExpected).toBe(12);
    expect(metrics.workersProcessed).toBe(8);
    expect(metrics.openExceptionWorkers).toBe(9);
    expect(metrics.criticalExceptionWorkers).toBe(5);
    expect(metrics.missingTimeWorkers).toBe(3);
    expect(metrics.overtimeHours).toBe(40.5);
    expect(metrics.highestOvertimeWorker).toEqual({
      name: "Avery Brooks",
      overtimeHours: 16.5
    });
    expect(metrics.topDepartment).toEqual({
      name: "Operations",
      exceptionCount: 5
    });
  });

  it("returns the Workday report exception mix used by tab badges", () => {
    expect(getExceptionBreakdown(currentFilters)).toEqual([
      {
        label: "Overtime",
        count: 4,
        colorClass: "bg-workday-amber",
        chartColor: "#FF9800",
        tabId: "overtime"
      },
      {
        label: "Missing Time",
        count: 3,
        colorClass: "bg-workday-red",
        chartColor: "#F44336",
        tabId: "missing-time"
      },
      {
        label: "Deductions",
        count: 4,
        colorClass: "bg-blue-500",
        chartColor: "#1976D2",
        tabId: "deductions"
      },
      {
        label: "Tax Issues",
        count: 4,
        colorClass: "bg-emerald-500",
        chartColor: "#10B981",
        tabId: "tax-issues"
      }
    ]);
  });

  it("returns chart data for payroll cost and overtime trends", () => {
    const payrollTrend = getPayrollTrend(currentFilters);
    const overtimeMatrix = getOvertimeMatrix(currentFilters);

    expect(payrollTrend).toHaveLength(6);
    expect(payrollTrend[payrollTrend.length - 1]).toMatchObject({
      label: "2026-08-15",
      payrollCost: 50264,
      isSelected: true
    });
    expect(overtimeMatrix[0]).toMatchObject({
      department: "Operations",
      total: 103.5
    });
    expect(overtimeMatrix[0].weeks["Aug 15"]).toBe(35.5);
  });

  it("returns executive highlights for overview presentation", () => {
    const highlights = getExecutiveHighlights(currentFilters);

    expect(highlights.overtime[0]).toMatchObject({
      employeeName: "Avery Brooks",
      overtimeHours: 16.5
    });
    expect(highlights.missingTime[0]).toMatchObject({
      employeeName: "Harper Wilson",
      missingDays: 5
    });
    expect(highlights.deductions[0]).toMatchObject({
      employeeName: "Sofia Martinez",
      exceptionType: "Failed",
      variance: -238
    });
    expect(highlights.taxes[0]).toMatchObject({
      employeeName: "Noah Kim",
      exceptionType: "No Withholding",
      variance: -464
    });
  });

  it("summarizes payroll approval readiness from current blockers", () => {
    const summary = getPayrollReadinessSummary(currentFilters, sampleDashboardData, defaultThresholds);

    expect(summary.status).toBe("Blocked");
    expect(summary.score).toBeLessThan(50);
    expect(summary.blockers.map((item) => item.label)).toContain("Missing time cleared");
    expect(summary.checklist.find((item) => item.label === "Payroll completion")).toMatchObject({
      status: "critical",
      value: "8 of 12 workers complete"
    });
  });
});
