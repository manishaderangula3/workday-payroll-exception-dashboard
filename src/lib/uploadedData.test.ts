import { describe, expect, it } from "vitest";
import { buildActiveDashboardData, parseUploadedDataset, validateUploadFile } from "./uploadedData";

describe("uploaded Workday-style CSV data", () => {
  it("parses payroll CSV rows with user-friendly column headers", () => {
    const result = parseUploadedDataset(
      "payrollResults",
      [
        "Employee ID,Pay Period,Gross Pay,Net Pay,Total Deductions,Total Taxes,Employer Benefit Cost,Employer Tax Cost,Payroll Status",
        "W-2001,2026-09-15 Semi-Monthly,5000,3600,600,800,450,382,Complete",
        "W-2002,2026-09-15 Semi-Monthly,4200,3010,510,680,400,321,Error"
      ].join("\n")
    );

    expect(result.messages).toHaveLength(0);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[1]).toMatchObject({
      employeeId: "W-2002",
      grossPay: 4200,
      payrollStatus: "Error"
    });
  });

  it("returns validation errors when required columns are missing", () => {
    const result = parseUploadedDataset("timeEntries", "Employee ID,Pay Period\nW-2001,2026-09-15 Semi-Monthly");

    expect(result.rows).toHaveLength(0);
    expect(result.messages.map((message) => message.message)).toContain("Missing required column: weekEndingDate.");
    expect(result.messages.map((message) => message.message)).toContain("Missing required column: scheduledHours.");
  });

  it("builds active dashboard data from uploaded workers and payroll results", () => {
    const workers = parseUploadedDataset(
      "workers",
      [
        "Employee ID,Employee Name,Department,Manager,Company,Pay Group,Exempt Status,Hourly Rate,Active",
        "W-2001,Alex Rivera,Payroll Ops,Casey Smith,Uploaded Co,US Weekly Hourly,Non-Exempt,35,true"
      ].join("\n")
    ).rows;
    const payrollResults = parseUploadedDataset(
      "payrollResults",
      [
        "Employee ID,Pay Period,Gross Pay,Net Pay,Total Deductions,Total Taxes,Employer Benefit Cost,Employer Tax Cost,Payroll Status",
        "W-2001,2026-09-15 Semi-Monthly,5000,3600,600,800,450,382,Complete"
      ].join("\n")
    ).rows;

    const data = buildActiveDashboardData({
      workers,
      payrollResults
    });

    expect(data.payPeriods[0]).toBe("2026-09-15 Semi-Monthly");
    expect(data.kpiHistory[0]).toMatchObject({
      payPeriod: "2026-09-15 Semi-Monthly",
      payrollCost: 5832,
      payrollCompletionRate: 1
    });
  });

  it("validates upload file type and size before parsing", () => {
    expect(
      validateUploadFile("workers", {
        name: "workers.xlsx",
        size: 1024,
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })
    ).toEqual([
      {
        dataset: "workers",
        message: "Upload must be a CSV file exported from Workday or a matching report source.",
        severity: "error"
      }
    ]);

    expect(
      validateUploadFile("payrollResults", {
        name: "payroll.csv",
        size: 6 * 1024 * 1024,
        type: "text/csv"
      })[0].message
    ).toBe("Upload is larger than 5 MB. Split the export by pay period or department before loading.");
  });
});
