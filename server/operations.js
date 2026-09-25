const startedAt = Date.now();
const metrics = {
  requests: 0,
  errors: 0,
  totalDurationMs: 0,
  routes: new Map()
};
const measuredApiRoutes = new Set([
  "/api/health", "/api/readiness", "/api/metrics", "/api/auth/session", "/api/auth/login", "/api/auth/logout",
  "/api/workday/dashboard-data", "/api/exports/report", "/api/acknowledgements", "/api/actions/workday-inbox",
  "/api/audit-events", "/api/delivery/trigger", "/api/delivery/receipt"
]);

function secretValues(env = process.env) {
  return Object.entries(env)
    .filter(([key, value]) => /(secret|token|password|authorization|cookie)/i.test(key) && String(value ?? "").length >= 8)
    .map(([, value]) => String(value));
}

function redact(value, key = "", secrets = secretValues()) {
  if (/(secret|token|password|authorization|cookie)/i.test(key)) return "[REDACTED]";
  if (typeof value === "string") return secrets.reduce((text, secret) => text.replaceAll(secret, "[REDACTED]"), value);
  if (Array.isArray(value)) return value.map((item) => redact(item, "", secrets));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, redact(childValue, childKey, secrets)]));
  }
  return value;
}

export function logEvent(level, event, fields = {}, writer) {
  const record = redact({
    timestamp: new Date().toISOString(),
    level,
    event,
    service: process.env.SERVICE_NAME ?? "workday-payroll-dashboard",
    environment: process.env.DEPLOYMENT_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    ...fields
  });
  const line = `${JSON.stringify(record)}\n`;
  (writer ?? (level === "error" ? process.stderr.write.bind(process.stderr) : process.stdout.write.bind(process.stdout)))(line);
  return record;
}

export function recordRequest(method, path, statusCode, durationMs) {
  const routePath = measuredApiRoutes.has(path) ? path : path.startsWith("/api/") ? "/api/other" : "/static";
  const key = `${method} ${routePath}`;
  const routeMetrics = metrics.routes.get(key) ?? { count: 0, errors: 0, totalDurationMs: 0 };
  routeMetrics.count += 1;
  routeMetrics.errors += statusCode >= 500 ? 1 : 0;
  routeMetrics.totalDurationMs += durationMs;
  metrics.routes.set(key, routeMetrics);
  metrics.requests += 1;
  metrics.errors += statusCode >= 500 ? 1 : 0;
  metrics.totalDurationMs += durationMs;
}

export function operationalMetrics() {
  const memory = process.memoryUsage();
  return {
    startedAt: new Date(startedAt).toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    requests: metrics.requests,
    errors: metrics.errors,
    averageDurationMs: metrics.requests ? Number((metrics.totalDurationMs / metrics.requests).toFixed(2)) : 0,
    memory: { rssBytes: memory.rss, heapUsedBytes: memory.heapUsed },
    routes: Object.fromEntries([...metrics.routes].map(([key, value]) => [key, {
      count: value.count,
      errors: value.errors,
      averageDurationMs: Number((value.totalDurationMs / value.count).toFixed(2))
    }]))
  };
}

export function resetOperationalMetrics() {
  metrics.requests = 0;
  metrics.errors = 0;
  metrics.totalDurationMs = 0;
  metrics.routes.clear();
}

export async function sendOperationalAlert(alert, options = {}) {
  const webhookUrl = options.webhookUrl ?? process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) return false;
  if (process.env.NODE_ENV === "production" && new URL(webhookUrl).protocol !== "https:") {
    throw new Error("ALERT_WEBHOOK_URL must use HTTPS in production");
  }
  const response = await (options.fetchImpl ?? fetch)(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.ALERT_WEBHOOK_SECRET ? { "X-Alert-Secret": process.env.ALERT_WEBHOOK_SECRET } : {})
    },
    body: JSON.stringify(redact({
      occurredAt: new Date().toISOString(),
      service: process.env.SERVICE_NAME ?? "workday-payroll-dashboard",
      environment: process.env.DEPLOYMENT_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
      ...alert
    })),
    signal: AbortSignal.timeout(Number(process.env.ALERT_WEBHOOK_TIMEOUT_MS ?? 10000))
  });
  if (!response.ok) throw new Error(`Alert webhook failed with status ${response.status}`);
  return true;
}
