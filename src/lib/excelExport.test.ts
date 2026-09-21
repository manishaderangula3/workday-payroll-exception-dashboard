import { describe, expect, it } from "vitest";
import { createWorkbookBuffer } from "./excelExport";

describe("Excel workbook export", () => {
  it("creates a real XLSX zip package", async () => {
    const bytes = await createWorkbookBuffer(
      "Payroll Cost Summary Report",
      [{ employeeId: "W-1", grossPay: 5000, payrollStatus: "Complete" }],
      { payPeriod: "2026-09-15" }
    );

    expect(bytes.length).toBeGreaterThan(1000);
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");

    const { default: ExcelJS } = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(bytes.buffer as ArrayBuffer);
    const worksheet = workbook.getWorksheet("Report");
    expect(worksheet?.getCell("A1").value).toBe("Payroll Cost Summary Report");
    expect(worksheet?.getCell("B5").value).toBe(5000);
  });
});
