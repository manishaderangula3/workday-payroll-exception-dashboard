import { randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { hostname } from "node:os";
import { dirname, resolve } from "node:path";

function auditFilePath() {
  return resolve(process.env.DATA_DIR ?? ".data", "audit-events.jsonl");
}

function auditStoreMode() {
  return process.env.AUDIT_STORE_MODE ?? "jsonl";
}

function matchesFilters(event, filters) {
  return Object.entries(filters).every(([key, value]) => key === "limit" || !value || event[key] === value);
}

async function requestAuditStore(method, record, filters = {}) {
  const endpoint = process.env.AUDIT_STORE_URL;
  const token = process.env.AUDIT_STORE_TOKEN;
  if (!endpoint || !token) throw new Error("AUDIT_STORE_URL and AUDIT_STORE_TOKEN are required for HTTP audit storage");
  const url = new URL(endpoint);
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(record ? { "Content-Type": "application/json" } : {})
    },
    ...(record ? { body: JSON.stringify({ event: record }) } : {}),
    signal: AbortSignal.timeout(Number(process.env.AUDIT_STORE_TIMEOUT_MS ?? 10000))
  });
  if (!response.ok) throw new Error(`Audit store request failed with status ${response.status}`);
  return method === "GET" ? response.json() : null;
}

export async function appendAuditEvent(event) {
  const record = {
    ...event,
    id: randomUUID(),
    occurredAt: new Date().toISOString(),
    sourceInstance: process.env.INSTANCE_ID ?? process.env.WEBSITE_INSTANCE_ID ?? hostname()
  };
  if (auditStoreMode() === "http") {
    await requestAuditStore("POST", record);
    return record;
  }
  const filePath = auditFilePath();
  await mkdir(dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o600 });
  return record;
}

export async function readAuditEvents(filters = {}) {
  if (auditStoreMode() === "http") {
    const payload = await requestAuditStore("GET", null, filters);
    const events = Array.isArray(payload) ? payload : payload?.events;
    if (!Array.isArray(events)) throw new Error("Audit store response must be an array or an object containing events");
    return events
      .filter((event) => event && typeof event === "object" && matchesFilters(event, filters))
      .slice(-Number(filters.limit ?? 10000));
  }
  try {
    const contents = await readFile(auditFilePath(), "utf8");
    return contents
      .split(/\r?\n/)
      .filter(Boolean)
      .flatMap((line) => {
        try {
          return [JSON.parse(line)];
        } catch {
          return [];
        }
      })
      .filter((event) => matchesFilters(event, filters))
      .slice(-Number(filters.limit ?? 10000));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
}
