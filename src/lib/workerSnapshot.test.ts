import { describe, expect, it } from "vitest";
import { getWorkerSnapshot } from "./workerSnapshot";

const currentFilters = {
  payPeriod: "2026-08-15 Semi-Monthly",
  company: "All Companies",
  payGroup: "All Pay Groups",
  department: "All Departments",
  searchTerm: ""
};

describe("worker snapshot", () => {
  it("joins worker, payroll, time, deduction, and tax records for a selected worker", () => {
    const snapshot = getWorkerSnapshot("W-1004", currentFilters);

    expect(snapshot?.worker.employeeName).toBe("Sofia Martinez");
    expect(snapshot?.payroll?.payrollStatus).toBe("Error");
    expect(snapshot?.timeEntries[0].missingDates).toHaveLength(3);
    expect(snapshot?.deductions[0].exceptionType).toBe("Failed");
  });

  it("returns undefined when the worker is not found", () => {
    expect(getWorkerSnapshot("W-9999", currentFilters)).toBeUndefined();
  });
});
