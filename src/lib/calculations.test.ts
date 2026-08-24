import { describe, expect, it } from "vitest";
import { getExceptionBreakdown, getExecutiveHighlights, getOverviewMetrics, getWorkers } from "./calculations";

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
      { label: "Overtime", count: 4, colorClass: "bg-workday-amber" },
      { label: "Missing Time", count: 3, colorClass: "bg-workday-red" },
      { label: "Deductions", count: 4, colorClass: "bg-blue-500" },
      { label: "Tax Issues", count: 4, colorClass: "bg-emerald-500" }
    ]);
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
});
