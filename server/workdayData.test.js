import { describe, expect, it, vi } from "vitest";
import { extractWorkdayPage, fetchWorkdayPages, normalizeWorkdayDataset } from "./workdayData.js";

describe("Workday response boundary", () => {
  it("normalizes aliases and derives missing deduction classifications", () => {
    const result = normalizeWorkdayDataset("deductionResults", [{
      Employee_ID: "W-1",
      Pay_Period: "2026-08-15 Semi-Monthly",
      Deduction_Name: "Medical",
      Expected_Amount: "100",
      Actual_Amount: "0"
    }]);

    expect(result.warnings).toEqual([]);
    expect(result.rows[0]).toMatchObject({ employeeId: "W-1", expectedAmount: 100, exceptionType: "Failed" });
  });

  it("rejects malformed rows instead of coercing invalid values", () => {
    const result = normalizeWorkdayDataset("payrollResults", [{ employeeId: "W-1", grossPay: "not-a-number" }]);
    expect(result.rows).toEqual([]);
    expect(result.warnings[0]).toContain("missing required fields");
  });

  it("extracts supported Workday report envelopes", () => {
    expect(extractWorkdayPage({ Report_Data: { Report_Entry: [{ Employee_ID: "W-1" }] } })).toEqual({
      rows: [{ Employee_ID: "W-1" }],
      nextUrl: null
    });
    expect(() => extractWorkdayPage({ unexpected: [] })).toThrow("did not contain");
  });

  it("follows same-origin pagination", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{ id: 1 }], next: "/page-2" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{ id: 2 }] }) });

    await expect(fetchWorkdayPages("https://workday.example/report", { fetchImpl })).resolves.toEqual([{ id: 1 }, { id: 2 }]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("rejects pagination that changes origin", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], next: "https://attacker.example/steal" })
    });
    await expect(fetchWorkdayPages("https://workday.example/report", { fetchImpl })).rejects.toThrow("changed origin");
  });
});
