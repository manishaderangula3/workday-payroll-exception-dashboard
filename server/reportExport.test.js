import { describe, expect, it } from "vitest";
import { demoDashboardData } from "./demoData.js";
import { createReportExport, reportRows } from "./reportExport.js";

const filters = {
  payPeriod: "2026-09-15 Semi-Monthly",
  company: "All Companies",
  payGroup: "All Pay Groups",
  department: "All Departments",
  searchTerm: ""
};

describe("server-generated report exports", () => {
  it("rebuilds report rows from server data", () => {
    const rows = reportRows("payroll-costs", filters, demoDashboardData);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toHaveProperty("totalPayrollCost");
  });

  it("creates a valid XLSX package", async () => {
    const output = await createReportExport({ reportType: "payroll-costs", filters }, demoDashboardData, "Payroll Admin");
    expect(output.buffer.subarray(0, 2).toString()).toBe("PK");
    expect(output.fileName).toMatch(/\.xlsx$/);
    expect(output.rowCount).toBeGreaterThan(0);
  });
});
