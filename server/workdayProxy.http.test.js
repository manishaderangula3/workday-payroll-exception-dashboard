import { request as httpRequest } from "node:http";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };
const auditEvents = [];
let baseUrl;
let server;

function principalHeader(email, role) {
  return Buffer.from(JSON.stringify({
    userDetails: email,
    userRoles: [role],
    claims: [{ typ: "name", val: email }]
  })).toString("base64");
}

function apiRequest(path, { body, headers = {}, method = "GET" } = {}) {
  const payload = typeof body === "undefined" ? null : JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const request = httpRequest(new URL(path, baseUrl), {
      method,
      headers: {
        ...(payload ? { "Content-Length": Buffer.byteLength(payload), "Content-Type": "application/json" } : {}),
        ...headers
      }
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve({ body: text ? JSON.parse(text) : null, headers: response.headers, status: response.statusCode });
      });
    });
    request.on("error", reject);
    if (payload) request.write(payload);
    request.end();
  });
}

function auth(email, role) {
  return { "X-MS-CLIENT-PRINCIPAL": principalHeader(email, role) };
}

beforeAll(async () => {
  process.env.AUTH_MODE = "azure_easy_auth";
  process.env.AUDIT_STORE_MODE = "http";
  process.env.AUDIT_STORE_URL = "https://audit.example/events";
  process.env.AUDIT_STORE_TOKEN = "audit-test-token";
  process.env.WORKDAY_INBOX_TASK_URL = "https://workday.example/inbox";
  process.env.REPORT_DELIVERY_WEBHOOK_URL = "https://delivery.example/reports";
  process.env.REPORT_DELIVERY_RECIPIENTS = "payroll@example.com";
  process.env.REPORT_DELIVERY_SECRET = "delivery-http-test-secret";
  process.env.PUBLIC_APP_URL = "https://payroll.example";
  vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
    if (String(url).startsWith(process.env.AUDIT_STORE_URL)) {
      if (options.method === "GET") {
        const filters = new URL(url).searchParams;
        const events = auditEvents.filter((event) => [...filters].every(
          ([key, value]) => key === "limit" || String(event[key] ?? "") === value
        ));
        return new Response(JSON.stringify({ events }));
      }
      auditEvents.push(JSON.parse(options.body).event);
      return new Response(null, { status: 204 });
    }
    if (String(url) === process.env.WORKDAY_INBOX_TASK_URL) return new Response(null, { status: 202 });
    return new Response(JSON.stringify({ receiptId: "HTTP-TEST-1", status: "accepted" }), { status: 202 });
  }));

  ({ server } = await import("./workdayProxy.js"));
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  if (server?.listening) await new Promise((resolve) => server.close(resolve));
  vi.unstubAllGlobals();
  for (const key of Object.keys(process.env)) {
    if (!Object.hasOwn(originalEnv, key)) delete process.env[key];
  }
  Object.assign(process.env, originalEnv);
});

beforeEach(() => {
  auditEvents.length = 0;
});

describe("HTTP authorization boundary", () => {
  it("denies workflow and delivery actions to a finance role", async () => {
    const headers = auth("finance-http@example.com", "Finance.Analyst");
    const body = { employeeId: "W-2001", payPeriod: "HTTP Security" };
    const acknowledgement = await apiRequest("/api/acknowledgements", { method: "POST", headers, body });
    const inbox = await apiRequest("/api/actions/workday-inbox", { method: "POST", headers, body });
    const delivery = await apiRequest("/api/delivery/trigger", { method: "POST", headers });

    expect(acknowledgement.status).toBe(403);
    expect(inbox.status).toBe(403);
    expect(delivery.status).toBe(403);
  });

  it("accepts delivery only for an authorized payroll role", async () => {
    const response = await apiRequest("/api/delivery/trigger", {
      method: "POST",
      headers: auth("payroll-http@example.com", "Payroll.Admin")
    });

    expect(response.status).toBe(200);
    expect(response.body.accepted).toBe(true);
  });

  it("authorizes Inbox actions and reuses the recorded task on replay", async () => {
    const request = {
      method: "POST",
      headers: auth("inbox-http@example.com", "Payroll.Admin"),
      body: { employeeId: "W-2001", payPeriod: "HTTP Inbox Replay" }
    };
    const first = await apiRequest("/api/actions/workday-inbox", request);
    const second = await apiRequest("/api/actions/workday-inbox", request);

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.duplicate).toBe(true);
  });

  it("requires the delivery receipt secret and deduplicates accepted receipts", async () => {
    const body = { deliveryId: "HTTP-DELIVERY-1", providerReceiptId: "PROVIDER-1", status: "delivered" };
    const unauthorized = await apiRequest("/api/delivery/receipt", { method: "POST", body });
    const authorizedRequest = {
      method: "POST",
      headers: { "X-Delivery-Secret": process.env.REPORT_DELIVERY_SECRET },
      body
    };
    const first = await apiRequest("/api/delivery/receipt", authorizedRequest);
    const second = await apiRequest("/api/delivery/receipt", authorizedRequest);

    expect(unauthorized.status).toBe(401);
    expect(first.status).toBe(202);
    expect(second.status).toBe(200);
    expect(second.body.duplicate).toBe(true);
  });

  it("rejects inherited and unsupported Entra role mappings", async () => {
    const inherited = await apiRequest("/api/acknowledgements", {
      method: "POST",
      headers: auth("inherited-http@example.com", "constructor"),
      body: { employeeId: "W-2001", payPeriod: "HTTP Security" }
    });
    process.env.ENTRA_ROLE_MAPPINGS_JSON = '{"Custom.Role":"typo_role"}';
    const unsupported = await apiRequest("/api/acknowledgements", {
      method: "POST",
      headers: auth("unsupported-http@example.com", "Custom.Role"),
      body: { employeeId: "W-2001", payPeriod: "HTTP Security" }
    });
    delete process.env.ENTRA_ROLE_MAPPINGS_JSON;

    expect(inherited.status).toBe(401);
    expect(unsupported.status).toBe(401);
  });

  it("enforces the acknowledgement action rate limit", async () => {
    const headers = auth("rate-limit-http@example.com", "Payroll.Admin");
    const statuses = [];
    for (let index = 0; index <= 30; index += 1) {
      const response = await apiRequest("/api/acknowledgements", {
        method: "POST",
        headers,
        body: { employeeId: "W-2001", payPeriod: `HTTP Rate ${index}` }
      });
      statuses.push(response.status);
    }

    expect(statuses.slice(0, 30)).toEqual(Array(30).fill(201));
    expect(statuses[30]).toBe(429);
  });
});
