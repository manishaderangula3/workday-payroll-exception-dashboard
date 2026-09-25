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
    REPORT_DELIVERY_SECRET: "delivery-secret-at-least-32-characters",
    REPORT_DELIVERY_REQUIRE_RECEIPT: "true",
    REPORT_DELIVERY_INTERVAL_MINUTES: "60",
    REPORT_DELIVERY_MAX_ATTACHMENT_BYTES: "5242880",
    AUDIT_STORE_MODE: "http",
    AUDIT_STORE_URL: "https://audit.example/events",
    AUDIT_STORE_TOKEN: "audit-token-at-least-32-characters",
    AUDIT_RETENTION_DAYS: "2555",
    AUDIT_BACKUP_POLICY_REFERENCE: "POL-AUDIT-001",
    LOG_FORMAT: "json",
    CENTRAL_LOG_SINK_REFERENCE: "Azure Monitor / prod-payroll-workspace",
    MONITORING_SERVICE_REFERENCE: "Application Insights / prod-payroll-app",
    MONITORING_TOKEN: "monitoring-token-at-least-32-characters",
    ALERT_WEBHOOK_URL: "https://alerts.example/events",
    ALERT_WEBHOOK_SECRET: "alert-webhook-secret-at-least-32-characters",
    ALERT_RUNBOOK_URL: "https://operations.example/runbooks/payroll",
    SECRET_ROTATION_POLICY_REFERENCE: "POL-SECRET-001",
    SECRETS_ROTATED_AT: new Date().toISOString(),
    SECRET_ROTATION_MAX_AGE_DAYS: "90",
    DISASTER_RECOVERY_PLAN_REFERENCE: "DR-PLAN-001",
    DR_RTO_MINUTES: "240",
    DR_RPO_MINUTES: "15",
    PENETRATION_TEST_POLICY_REFERENCE: "SEC-PENTEST-001"
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
