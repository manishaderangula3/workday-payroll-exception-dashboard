import { describe, expect, it, vi } from "vitest";
import { buildDeliverySummary, sendScheduledDelivery } from "./scheduledDelivery.js";

const data = {
  workers: [{ active: true }, { active: false }],
  payrollResults: [{ employeeId: "W-1", payrollStatus: "Error" }],
  timeEntries: [{ employeeId: "W-1", overtimeHours: 6, missingDates: ["2026-09-01"], approvedLeaveDates: [] }],
  deductionResults: [{ employeeId: "W-1", exceptionType: "Failed" }],
  taxResults: [{ employeeId: "W-2", exceptionType: "None" }]
};

describe("scheduled report delivery", () => {
  it("builds an aggregate summary without worker PII", () => {
    expect(buildDeliverySummary(data)).toEqual({
      workers: 1,
      payrollErrors: 1,
      overtimeExceptions: 1,
      missingTimeExceptions: 1,
      deductionExceptions: 1,
      taxExceptions: 0
    });
  });

  it("posts a saved readiness link to the configured delivery webhook", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const payload = await sendScheduledDelivery(data, {
      webhookUrl: "https://workflow.example/report",
      appUrl: "https://dashboard.example",
      fetchImpl
    });
    expect(payload.dashboardUrl).toBe("https://dashboard.example/?tab=readiness");
    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});
