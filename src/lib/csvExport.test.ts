import { describe, expect, it } from "vitest";
import { buildCsvContent, sanitizeFileName } from "./csvExport";

describe("csv export helpers", () => {
  it("builds csv content with metadata and escaped values", () => {
    const csv = buildCsvContent(
      [
        {
          employee: "Avery Brooks",
          note: "Requires manager, payroll review",
          dates: ["2026-08-14", "2026-08-15"]
        }
      ],
      {
        report: "Overtime Report",
        payPeriod: "2026-08-15 Semi-Monthly"
      }
    );

    expect(csv).toContain("report,Overtime Report");
    expect(csv).toContain("payPeriod,2026-08-15 Semi-Monthly");
    expect(csv).toContain('Avery Brooks,"Requires manager, payroll review",2026-08-14; 2026-08-15');
  });

  it("sanitizes report names for download filenames", () => {
    expect(sanitizeFileName("Payroll Cost Summary Report")).toBe("payroll-cost-summary-report");
  });

  it("neutralizes spreadsheet formula injection values", () => {
    const csv = buildCsvContent([
      {
        employee: "W-2001",
        note: "=HYPERLINK(\"http://example.com\")",
        adjustment: "+100"
      }
    ]);

    expect(csv).toContain('"\'=HYPERLINK(""http://example.com"")"');
    expect(csv).toContain("'+100");
  });
});
