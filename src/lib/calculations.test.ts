import { describe, expect, it } from "vitest";
import { getExceptionBreakdown, getOverviewMetrics, getWorkers } from "./calculations";

const currentFilters = {
  payPeriod: "2026-08-15 Semi-Monthly",
  department: "All Departments"
};

describe("dashboard sample data calculations", () => {
  it("filters active workers by department", () => {
    expect(getWorkers(currentFilters)).toHaveLength(12);
    expect(getWorkers({ ...currentFilters, department: "Operations" })).toHaveLength(5);
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
});
