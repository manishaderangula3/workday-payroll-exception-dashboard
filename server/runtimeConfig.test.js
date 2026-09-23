import { describe, expect, it } from "vitest";
import { validateRuntimeConfig } from "./runtimeConfig.js";

function liveConfig() {
  return {
    NODE_ENV: "production",
    DEPLOYMENT_PROFILE: "live",
    AUTH_MODE: "azure_easy_auth",
    COOKIE_SECURE: "true",
    SESSION_SECRET: "a-secure-secret-store-value-over-32-characters",
    ENTRA_ROLE_MAPPINGS_JSON: '{"Payroll.Admin":"payroll_admin"}',
    WORKDAY_WORKERS_URL: "https://workday.example/workers",
    WORKDAY_PAYROLL_RESULTS_URL: "https://workday.example/payroll",
    WORKDAY_TIME_ENTRIES_URL: "https://workday.example/time",
    WORKDAY_DEDUCTION_RESULTS_URL: "https://workday.example/deductions",
    WORKDAY_TAX_RESULTS_URL: "https://workday.example/tax",
    WORKDAY_BEARER_TOKEN: "secret-token",
    WORKDAY_INBOX_TASK_URL: "https://workday.example/inbox",
    PUBLIC_APP_URL: "https://payroll.example",
    REPORT_DELIVERY_WEBHOOK_URL: "https://workflow.example/deliver",
    REPORT_DELIVERY_RECIPIENTS: "payroll@example.com",
    REPORT_DELIVERY_SECRET: "delivery-secret",
    AUDIT_STORE_MODE: "http",
    AUDIT_STORE_URL: "https://audit.example/events",
    AUDIT_STORE_TOKEN: "audit-token",
    AUDIT_RETENTION_DAYS: "2555",
    AUDIT_BACKUP_POLICY_REFERENCE: "POL-AUDIT-001"
  };
}

describe("runtime configuration", () => {
  it("accepts a complete live configuration", () => {
    expect(validateRuntimeConfig(liveConfig())).toEqual([]);
  });

  it("fails closed when live integrations and durable audit are missing", () => {
    const errors = validateRuntimeConfig({ NODE_ENV: "production", DEPLOYMENT_PROFILE: "live" });
    expect(errors).toContain("AUTH_MODE must be azure_easy_auth");
    expect(errors).toContain("WORKDAY_WORKERS_URL must be a valid HTTPS URL");
    expect(errors).toContain("AUDIT_STORE_MODE must be http for live deployments");
  });

  it("requires an explicit production deployment profile", () => {
    expect(validateRuntimeConfig({ NODE_ENV: "production" })).toEqual([
      "DEPLOYMENT_PROFILE must be portfolio or live in production"
    ]);
  });
});
