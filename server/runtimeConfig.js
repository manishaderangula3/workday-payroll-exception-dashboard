import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const workdayUrlKeys = [
  "WORKDAY_WORKERS_URL",
  "WORKDAY_PAYROLL_RESULTS_URL",
  "WORKDAY_TIME_ENTRIES_URL",
  "WORKDAY_DEDUCTION_RESULTS_URL",
  "WORKDAY_TAX_RESULTS_URL"
];

export function loadDotEnv(filePath = resolve(".env"), env = process.env) {
  if (!existsSync(filePath)) return;

  readFileSync(filePath, "utf8").split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
    const [key, ...valueParts] = trimmed.split("=");
    if (!env[key]) env[key] = valueParts.join("=").trim().replace(/^"|"$/g, "");
  });
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isObjectJson(value) {
  try {
    const parsed = JSON.parse(value);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length > 0;
  } catch {
    return false;
  }
}

export function validateRuntimeConfig(env = process.env) {
  const errors = [];
  const profile = env.DEPLOYMENT_PROFILE ?? (env.NODE_ENV === "production" ? "" : "development");

  if (env.NODE_ENV === "production" && !["portfolio", "live"].includes(profile)) {
    errors.push("DEPLOYMENT_PROFILE must be portfolio or live in production");
  }

  if (profile !== "live") return errors;

  if (env.AUTH_MODE !== "azure_easy_auth") errors.push("AUTH_MODE must be azure_easy_auth");
  if (env.COOKIE_SECURE !== "true") errors.push("COOKIE_SECURE must be true");
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32 || env.SESSION_SECRET.includes("change-me")) {
    errors.push("SESSION_SECRET must be a secret-store value of at least 32 characters");
  }
  if (!isObjectJson(env.ENTRA_ROLE_MAPPINGS_JSON)) errors.push("ENTRA_ROLE_MAPPINGS_JSON must be a non-empty JSON object");

  workdayUrlKeys.forEach((key) => {
    if (!isHttpsUrl(env[key])) errors.push(`${key} must be a valid HTTPS URL`);
  });

  const hasBearer = Boolean(env.WORKDAY_BEARER_TOKEN);
  const hasBasic = Boolean(env.WORKDAY_USERNAME && env.WORKDAY_PASSWORD);
  if (!hasBearer && !hasBasic) errors.push("Workday bearer token or username/password credentials are required");
  if (hasBearer && hasBasic) errors.push("Configure only one Workday authentication method");

  ["WORKDAY_INBOX_TASK_URL", "PUBLIC_APP_URL", "REPORT_DELIVERY_WEBHOOK_URL", "AUDIT_STORE_URL"].forEach((key) => {
    if (!isHttpsUrl(env[key])) errors.push(`${key} must be a valid HTTPS URL`);
  });

  if (!env.REPORT_DELIVERY_RECIPIENTS?.trim()) errors.push("REPORT_DELIVERY_RECIPIENTS is required");
  if (!env.REPORT_DELIVERY_SECRET?.trim()) errors.push("REPORT_DELIVERY_SECRET is required");
  if (env.AUDIT_STORE_MODE !== "http") errors.push("AUDIT_STORE_MODE must be http for live deployments");
  if (!env.AUDIT_STORE_TOKEN?.trim()) errors.push("AUDIT_STORE_TOKEN is required");

  const retentionDays = Number(env.AUDIT_RETENTION_DAYS);
  if (!Number.isInteger(retentionDays) || retentionDays < 365) errors.push("AUDIT_RETENTION_DAYS must be at least 365");
  if (!env.AUDIT_BACKUP_POLICY_REFERENCE?.trim()) errors.push("AUDIT_BACKUP_POLICY_REFERENCE is required");

  return errors;
}

export function runtimeConfigurationStatus(env = process.env) {
  const errors = validateRuntimeConfig(env);
  const profile = env.DEPLOYMENT_PROFILE ?? (env.NODE_ENV === "production" ? "unconfigured" : "development");
  return {
    ready: errors.length === 0,
    profile,
    errors,
    integrations: {
      authentication: env.AUTH_MODE === "azure_easy_auth",
      workday: workdayUrlKeys.every((key) => isHttpsUrl(env[key])),
      inbox: isHttpsUrl(env.WORKDAY_INBOX_TASK_URL),
      delivery: isHttpsUrl(env.REPORT_DELIVERY_WEBHOOK_URL),
      durableAudit: env.AUDIT_STORE_MODE === "http" && isHttpsUrl(env.AUDIT_STORE_URL)
    }
  };
}

export function assertRuntimeConfig(env = process.env) {
  const errors = validateRuntimeConfig(env);
  if (errors.length) throw new Error(`Runtime configuration is invalid:\n- ${errors.join("\n- ")}`);
}
