import { afterEach, describe, expect, it, vi } from "vitest";
import { appendAuditEvent, readAuditEvents } from "./auditStore.js";

describe("HTTP audit store", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.AUDIT_STORE_MODE;
    delete process.env.AUDIT_STORE_URL;
    delete process.env.AUDIT_STORE_TOKEN;
  });

  it("writes and queries events through the durable API", async () => {
    process.env.AUDIT_STORE_MODE = "http";
    process.env.AUDIT_STORE_URL = "https://audit.example/events";
    process.env.AUDIT_STORE_TOKEN = "secret";
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ events: [{ type: "exception_acknowledged", payPeriod: "P1" }] }) });
    vi.stubGlobal("fetch", fetchImpl);

    const written = await appendAuditEvent({ type: "report_exported", actor: "admin" });
    const events = await readAuditEvents({ type: "exception_acknowledged", payPeriod: "P1" });

    expect(written.id).toBeTruthy();
    expect(events).toHaveLength(1);
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe("Bearer secret");
    expect(fetchImpl.mock.calls[1][0].toString()).toContain("payPeriod=P1");
  });

  it("rejects malformed query responses", async () => {
    process.env.AUDIT_STORE_MODE = "http";
    process.env.AUDIT_STORE_URL = "https://audit.example/events";
    process.env.AUDIT_STORE_TOKEN = "secret";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ value: [] }) }));
    await expect(readAuditEvents()).rejects.toThrow("Audit store response must be an array");
  });
});
