import { afterEach, describe, expect, it, vi } from "vitest";
import { logEvent, operationalMetrics, recordRequest, resetOperationalMetrics, sendOperationalAlert } from "./operations.js";

describe("production operations", () => {
  afterEach(() => {
    delete process.env.TEST_SECRET;
    delete process.env.ALERT_WEBHOOK_SECRET;
    resetOperationalMetrics();
  });

  it("emits structured logs without secret values", () => {
    process.env.TEST_SECRET = "do-not-log-this";
    let output = "";
    const record = logEvent("error", "test_failure", { message: "token=do-not-log-this", password: "hidden" }, (line) => { output = line; });
    expect(JSON.parse(output)).toMatchObject({ level: "error", event: "test_failure", password: "[REDACTED]" });
    expect(JSON.stringify(record)).not.toContain("do-not-log-this");
  });

  it("aggregates request counts, failures, and durations", () => {
    recordRequest("GET", "/api/health", 200, 10);
    recordRequest("GET", "/api/health", 500, 30);
    expect(operationalMetrics()).toMatchObject({ requests: 2, errors: 1, averageDurationMs: 20 });
  });

  it("bounds metric route cardinality for unknown paths", () => {
    recordRequest("GET", "/untrusted/one", 404, 1);
    recordRequest("GET", "/untrusted/two", 404, 1);
    expect(Object.keys(operationalMetrics().routes)).toEqual(["GET /static"]);
  });

  it("posts redacted alerts to the configured webhook", async () => {
    process.env.ALERT_WEBHOOK_SECRET = "alert-secret";
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 202 });
    await expect(sendOperationalAlert(
      { severity: "critical", event: "backend_failure", authorization: "never-send" },
      { webhookUrl: "https://alerts.example/events", fetchImpl }
    )).resolves.toBe(true);
    const request = fetchImpl.mock.calls[0][1];
    expect(request.headers["X-Alert-Secret"]).toBe("alert-secret");
    expect(JSON.parse(request.body).authorization).toBe("[REDACTED]");
  });
});
