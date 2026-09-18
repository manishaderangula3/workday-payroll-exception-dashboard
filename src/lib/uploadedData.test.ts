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
    expect(data.timeEntries).toEqual([]);
    expect(data.deductionResults).toEqual([]);
    expect(data.taxResults).toEqual([]);
  });

  it("does not silently convert invalid numeric values to zero", () => {
    const result = parseUploadedDataset(
      "payrollResults",
      [
        "Employee ID,Pay Period,Gross Pay,Net Pay,Payroll Status",
        "W-2001,2026-09-15 Semi-Monthly,not-a-number,3600,Complete"
      ].join("\n")
    );

    expect(result.messages).toContainEqual(
      expect.objectContaining({
        message: "Invalid grossPay: use a numeric value.",
        rowNumber: 2,
        severity: "error"
      })
    );
  });

  it("rejects blank required values and unsupported statuses", () => {
    const missingValue = parseUploadedDataset(
      "payrollResults",
      [
        "Employee ID,Pay Period,Gross Pay,Net Pay,Payroll Status",
        "W-2001,2026-09-15 Semi-Monthly,,3600,Complete"
      ].join("\n")
    );
    const invalidStatus = parseUploadedDataset(
      "payrollResults",
      [
        "Employee ID,Pay Period,Gross Pay,Net Pay,Payroll Status",
        "W-2001,2026-09-15 Semi-Monthly,5000,3600,Unknown Status"
      ].join("\n")
    );

    expect(missingValue.messages).toContainEqual(
      expect.objectContaining({ message: "Missing required value: grossPay.", rowNumber: 2 })
    );
    expect(invalidStatus.messages).toContainEqual(
      expect.objectContaining({ message: 'Invalid payrollStatus: "Unknown Status" is not supported.', rowNumber: 2 })
    );
  });

  it("derives regular and overtime hours when optional columns are omitted", () => {
    const result = parseUploadedDataset(
      "timeEntries",
      [
        "Employee ID,Pay Period,Week Ending Date,Scheduled Hours,Actual Hours Worked",
        "W-2001,2026-09-15 Semi-Monthly,2026-09-12,40,45"
      ].join("\n")
    );

    expect(result.messages).toHaveLength(0);
    expect(result.rows[0]).toMatchObject({ regularHours: 40, overtimeHours: 5 });
  });

  it("keeps completion at zero when payroll rows have no worker master data", () => {
    const payrollResults = parseUploadedDataset(
      "payrollResults",
      [
        "Employee ID,Pay Period,Gross Pay,Net Pay,Payroll Status",
        "W-2001,2026-09-15 Semi-Monthly,5000,3600,Complete"
      ].join("\n")
    ).rows;

    const data = buildActiveDashboardData({ payrollResults });

    expect(data.workers).toEqual([]);
    expect(data.kpiHistory[0].payrollCompletionRate).toBe(0);
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

  it("returns validation errors for invalid uploaded date values", () => {
    const result = parseUploadedDataset(
      "timeEntries",
      [
        "Employee ID,Pay Period,Week Ending Date,Scheduled Hours,Actual Hours Worked,Missing Dates,Last Submission Date",
        "W-2001,2026-09-15 Semi-Monthly,09/15/2026,40,45,2026-02-30; 2026-09-14,2026-13-01"
      ].join("\n")
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Invalid weekEndingDate: use YYYY-MM-DD.", rowNumber: 2 }),
        expect.objectContaining({ message: "Invalid missingDates: use YYYY-MM-DD.", rowNumber: 2 }),
        expect.objectContaining({ message: "Invalid lastSubmissionDate: use YYYY-MM-DD.", rowNumber: 2 })
      ])
    );
  });
});
