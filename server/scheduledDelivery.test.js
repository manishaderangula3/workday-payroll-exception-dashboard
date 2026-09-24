import { describe, expect, it, vi } from "vitest";
import { buildDeliverySummary, sendScheduledDelivery } from "./scheduledDelivery.js";

const data = {
  workers: [{ active: true }, { active: false }],
  payrollResults: [{ employeeId: "W-1", payPeriod: "P1", paymentDate: "2026-09-20", payrollStatus: "Error", grossPay: 100, netPay: 80, employerBenefitCost: 10, employerTaxCost: 5 }],
  timeEntries: [{ employeeId: "W-1", payPeriod: "P1", overtimeHours: 6, missingDates: ["2026-09-01"], approvedLeaveDates: [] }],
  deductionResults: [{ employeeId: "W-1", payPeriod: "P1", exceptionType: "Failed" }],
  taxResults: [{ employeeId: "W-2", payPeriod: "P1", exceptionType: "None" }]
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

  it("posts a readiness workbook and captures the provider receipt", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      json: async () => ({ receiptId: "MSG-100", status: "accepted", acceptedAt: "2026-09-20T10:00:00.000Z" })
    });
    const delivery = await sendScheduledDelivery(data, {
      webhookUrl: "https://workflow.example/report",
      appUrl: "https://dashboard.example",
      fetchImpl,
      requireReceipt: true
    });
    const postedPayload = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(delivery.dashboardUrl).toBe("https://dashboard.example/?tab=readiness");
    expect(delivery.receipt.providerReceiptId).toBe("MSG-100");
    expect(delivery.attachment.fileName).toMatch(/\.xlsx$/);
    expect(Buffer.from(postedPayload.attachments[0].contentBase64, "base64").subarray(0, 2).toString()).toBe("PK");
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("rejects a webhook response without a required receipt", async () => {
    await expect(sendScheduledDelivery(data, {
      webhookUrl: "https://workflow.example/report",
      fetchImpl: vi.fn().mockResolvedValue({ ok: true, status: 202, json: async () => ({}) }),
      requireReceipt: true
    })).rejects.toThrow("did not return a receipt identifier");
  });
});
