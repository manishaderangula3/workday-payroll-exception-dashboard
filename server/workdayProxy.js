import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { demoDashboardData } from "./demoData.js";
import { applyRoleSecurity, publicUser } from "./rbac.js";

loadDotEnv();

const port = Number(process.env.PORT ?? 8787);
const sessionCookieName = "wd_dash_session";
const sessionSecret = process.env.SESSION_SECRET ?? "local-development-session-secret-change-me";
const distPath = resolve("dist");

const demoUsers = [
  {
    username: "payroll.admin",
    password: "PayrollDemo123!",
    displayName: "Payroll Admin",
    role: "payroll_admin",
    allowedDepartments: [],
    allowedCompanies: [],
    allowedPayGroups: []
  },
  {
    username: "finance.analyst",
    password: "FinanceDemo123!",
    displayName: "Finance Analyst",
    role: "finance_analyst",
    allowedDepartments: ["Finance", "Operations", "Customer Support", "Human Resources"],
    allowedCompanies: [],
    allowedPayGroups: []
  },
  {
    username: "operations.manager",
    password: "ManagerDemo123!",
    displayName: "Operations Manager",
    role: "department_manager",
    allowedDepartments: ["Operations"],
    allowedCompanies: [],
    allowedPayGroups: []
  }
];

function loadDotEnv() {
  const envPath = resolve(".env");

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      return;
    }

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim().replace(/^"|"$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function jsonResponse(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    ...headers
  });
  response.end(JSON.stringify(payload));
}

function notFound(response) {
  jsonResponse(response, 404, { error: "Not found" });
}

function badRequest(response, error) {
  jsonResponse(response, 400, { error });
}

function unauthorized(response, error = "Authentication required") {
  jsonResponse(response, 401, { error });
}

function parseCookies(request) {
  const header = request.headers.cookie ?? "";

  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...valueParts] = part.split("=");
        return [key, decodeURIComponent(valueParts.join("="))];
      })
  );
}

function sign(value) {
  return createHmac("sha256", sessionSecret).update(value).digest("base64url");
}

function createSessionCookie(user) {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Date.now() + 8 * 60 * 60 * 1000,
      nonce: randomBytes(12).toString("base64url"),
      username: user.username
    })
  ).toString("base64url");
  const signature = sign(payload);

  return `${sessionCookieName}=${payload}.${signature}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`;
}

function clearSessionCookie() {
  return `${sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

function parseSession(request) {
  const value = parseCookies(request)[sessionCookieName];

  if (!value || !value.includes(".")) {
    return null;
  }

  const [payload, signature] = value.split(".");
  const expectedSignature = sign(payload);

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

    if (!session.exp || session.exp < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function passwordHash(password, salt = randomBytes(16).toString("base64url")) {
  const iterations = 210000;
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("base64url");

  return `pbkdf2$sha256$${iterations}$${salt}$${hash}`;
}

function verifyPassword(password, user) {
  if (user.passwordHash) {
    const [, algorithm, iterations, salt, expectedHash] = user.passwordHash.split("$");
    const actualHash = pbkdf2Sync(password, salt, Number(iterations), 32, algorithm).toString("base64url");

    return (
      actualHash.length === expectedHash.length &&
      timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash))
    );
  }

  return user.password === password;
}

function getUsers() {
  if (process.env.AUTH_USERS_JSON) {
    return JSON.parse(process.env.AUTH_USERS_JSON);
  }

  return demoUsers.map((user) => ({
    ...user,
    passwordHash: passwordHash(user.password),
    password: undefined
  }));
}

function findAuthenticatedUser(request) {
  const session = parseSession(request);

  if (!session) {
    return null;
  }

  return getUsers().find((user) => user.username === session.username) ?? null;
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function authHeaders() {
  if (process.env.WORKDAY_BEARER_TOKEN) {
    return {
      Authorization: `Bearer ${process.env.WORKDAY_BEARER_TOKEN}`
    };
  }

  if (process.env.WORKDAY_USERNAME && process.env.WORKDAY_PASSWORD) {
    return {
      Authorization: `Basic ${Buffer.from(`${process.env.WORKDAY_USERNAME}:${process.env.WORKDAY_PASSWORD}`).toString("base64")}`
    };
  }

  return {};
}

function datasetUrls() {
  return {
    workers: process.env.WORKDAY_WORKERS_URL,
    payrollResults: process.env.WORKDAY_PAYROLL_RESULTS_URL,
    timeEntries: process.env.WORKDAY_TIME_ENTRIES_URL,
    deductionResults: process.env.WORKDAY_DEDUCTION_RESULTS_URL,
    taxResults: process.env.WORKDAY_TAX_RESULTS_URL
  };
}

async function fetchWorkdayDataset(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...authHeaders()
    }
  });

  if (!response.ok) {
    throw new Error(`Workday request failed with status ${response.status}`);
  }

  const payload = await response.json();

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.Report_Entry)) {
    return payload.Report_Entry;
  }

  if (Array.isArray(payload.reportEntries)) {
    return payload.reportEntries;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

async function loadWorkdayData() {
  const urls = datasetUrls();
  const configuredEntries = Object.entries(urls).filter(([, url]) => Boolean(url));

  if (configuredEntries.length === 0) {
    return {
      data: demoDashboardData,
      source: "demo",
      warnings: ["No Workday RaaS/API URLs are configured; backend demo data was used."]
    };
  }

  const data = {
    workers: [],
    payrollResults: [],
    timeEntries: [],
    deductionResults: [],
    taxResults: []
  };
  const warnings = [];

  for (const [dataset, url] of configuredEntries) {
    try {
      data[dataset] = await fetchWorkdayDataset(url);
    } catch (error) {
      warnings.push(`${dataset} failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return {
    data: {
      ...demoDashboardData,
      ...Object.fromEntries(Object.entries(data).filter(([, rows]) => rows.length > 0))
    },
    source: "workday",
    warnings
  };
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/health") {
    jsonResponse(response, 200, {
      ok: true,
      workdayConfigured: Object.values(datasetUrls()).some(Boolean)
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/auth/session") {
    const user = findAuthenticatedUser(request);
    jsonResponse(response, 200, {
      authenticated: Boolean(user),
      user: user ? publicUser(user) : null
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readJsonBody(request);
    const user = getUsers().find((candidate) => candidate.username === body.username);

    if (!user || !verifyPassword(String(body.password ?? ""), user)) {
      unauthorized(response, "Invalid username or password");
      return;
    }

    jsonResponse(
      response,
      200,
      {
        authenticated: true,
        user: publicUser(user)
      },
      {
        "Set-Cookie": createSessionCookie(user)
      }
    );
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    jsonResponse(
      response,
      200,
      {
        authenticated: false,
        user: null
      },
      {
        "Set-Cookie": clearSessionCookie()
      }
    );
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/workday/dashboard-data") {
    const user = findAuthenticatedUser(request);

    if (!user) {
      unauthorized(response);
      return;
    }

    const { data, source, warnings } = await loadWorkdayData();
    const scopedData = applyRoleSecurity(data, user);

    jsonResponse(response, 200, {
      data: scopedData,
      source,
      user: publicUser(user),
      warnings
    });
    return;
  }

  notFound(response);
}

function contentType(filePath) {
  const extension = extname(filePath);

  if (extension === ".html") {
    return "text/html; charset=utf-8";
  }

  if (extension === ".js") {
    return "text/javascript; charset=utf-8";
  }

  if (extension === ".css") {
    return "text/css; charset=utf-8";
  }

  if (extension === ".svg") {
    return "image/svg+xml";
  }

  return "application/octet-stream";
}

function serveStatic(response, url) {
  const requestPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = join(distPath, requestPath);

  if (!filePath.startsWith(distPath) || !existsSync(filePath)) {
    const fallbackPath = join(distPath, "index.html");

    if (!existsSync(fallbackPath)) {
      notFound(response);
      return;
    }

    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    createReadStream(fallbackPath).pipe(response);
    return;
  }

  response.writeHead(200, { "Content-Type": contentType(filePath) });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    serveStatic(response, url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";

    if (message.includes("JSON")) {
      badRequest(response, "Invalid JSON payload");
      return;
    }

    jsonResponse(response, 500, { error: message });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Workday dashboard backend proxy running at http://127.0.0.1:${port}`);
});
