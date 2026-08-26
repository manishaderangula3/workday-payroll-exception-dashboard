import { describe, expect, it } from "vitest";
import {
  getDeductionExceptionReportRows,
  getMissingTimeReportRows,
  getOvertimeReportRows,
  getPayrollCostReportRows,
  getTaxExceptionReportRows
} from "./reportRows";

const currentFilters = {
  payPeriod: "2026-08-15 Semi-Monthly",
  company: "All Companies",
  payGroup: "All Pay Groups",
  department: "All Departments",
  searchTerm: ""
};

describe("report row builders", () => {
  it("builds payroll cost rows with total payroll cost", () => {
    const rows = getPayrollCostReportRows(currentFilters);
    const avery = rows.find((row) => row.employeeId === "W-1001");

    expect(rows).toHaveLength(12);
    expect(avery).toMatchObject({
      employeeName: "Avery Brooks",
      employerCosts: 852,
      totalPayrollCost: 5165
    });
  });

  it("sorts overtime rows by highest overtime first", () => {
    const rows = getOvertimeReportRows(currentFilters);

    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({
      employeeName: "Avery Brooks",
      overtimeHours: 16.5,
      alert: "Red"
    });
  });

  it("returns exception-only rows for missing time, deductions, and taxes", () => {
    expect(getMissingTimeReportRows(currentFilters)).toHaveLength(3);
    expect(getDeductionExceptionReportRows(currentFilters)).toHaveLength(4);
    expect(getTaxExceptionReportRows(currentFilters)).toHaveLength(4);
  });
});
