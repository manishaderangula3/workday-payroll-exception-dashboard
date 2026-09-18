import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { demoDashboardData } from "./demoData.js";
import { applyRoleSecurity, publicUser } from "./rbac.js";

loadDotEnv();

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? "127.0.0.1";
const sessionCookieName = "wd_dash_session";
const sessionSecret = process.env.SESSION_SECRET ?? "local-development-session-secret-change-me";
const secureCookie = process.env.COOKIE_SECURE === "true";
const distPath = resolve("dist");
const maxJsonBodyBytes = 64 * 1024;
const configuredWorkdayFetchTimeoutMs = Number(process.env.WORKDAY_FETCH_TIMEOUT_MS ?? 15000);
const workdayFetchTimeoutMs =
  Number.isFinite(configuredWorkdayFetchTimeoutMs) && configuredWorkdayFetchTimeoutMs > 0
    ? configuredWorkdayFetchTimeoutMs
    : 15000;
const maxFailedLoginAttempts = 5;
const loginThrottleWindowMs = 15 * 60 * 1000;
const failedLoginAttempts = new Map();

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required when NODE_ENV=production.");
}

const demoUsers = [
  {
    username: "payroll.admin",
    passwordHash: "pbkdf2$sha256$210000$demo-payroll-admin$xNhWzX-7pEQT0nYBXANy0i--IdTA2vSjv-3f2gBZn5Y",
    displayName: "Payroll Admin",
    role: "payroll_admin",
    allowedDepartments: [],
    allowedCompanies: [],
    allowedPayGroups: []
  },
  {
    username: "finance.analyst",
    passwordHash: "pbkdf2$sha256$210000$demo-finance-analyst$CjIlrDz2xReTVgTFyhu2b8uRraXYUQJAx2RD_J10Q7I",
    displayName: "Finance Analyst",
    role: "finance_analyst",
    allowedDepartments: ["Finance", "Operations", "Customer Support", "Human Resources"],
    allowedCompanies: [],
    allowedPayGroups: []
  },
  {
    username: "operations.manager",
    passwordHash: "pbkdf2$sha256$210000$demo-operations-manager$s7MQBmA5TFj321rXNxUKJf-SNjr9BzaIDvwLQKUEalc",
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
    "X-Content-Type-Options": "nosniff",
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

function payloadTooLarge(response) {
  jsonResponse(response, 413, { error: "Request body too large" });
}

function unauthorized(response, error = "Authentication required") {
  jsonResponse(response, 401, { error });
}

function tooManyRequests(response) {
  jsonResponse(response, 429, { error: "Too many failed sign-in attempts. Try again later." });
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

  return `${sessionCookieName}=${payload}.${signature}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${secureCookie ? "; Secure" : ""}`;
}

function clearSessionCookie() {
  return `${sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureCookie ? "; Secure" : ""}`;
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
    const iterationCount = Number(iterations);

    if (algorithm !== "sha256" || !Number.isFinite(iterationCount) || iterationCount < 100000 || !salt || !expectedHash) {
      return false;
    }

    const actualHash = pbkdf2Sync(password, salt, iterationCount, 32, algorithm).toString("base64url");

    return (
      actualHash.length === expectedHash.length &&
      timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash))
    );
  }

  return process.env.NODE_ENV === "production" ? false : user.password === password;
}

function getUsers() {
  if (process.env.AUTH_USERS_JSON) {
    const users = JSON.parse(process.env.AUTH_USERS_JSON);

    if (!Array.isArray(users)) {
      throw new Error("AUTH_USERS_JSON must be an array of users.");
    }

    return users.map(({ password, ...user }) => ({
      ...user,
      passwordHash:
        user.passwordHash ??
        (() => {
          if (process.env.NODE_ENV === "production") {
            throw new Error("AUTH_USERS_JSON must use passwordHash values in production.");
          }

          if (!password) {
            throw new Error("AUTH_USERS_JSON users must provide passwordHash or password.");
          }

          return passwordHash(password);
        })(),
      password: undefined
    }));
  }

  return demoUsers.map(({ password, ...user }) => ({
    ...user,
    passwordHash: user.passwordHash ?? passwordHash(password),
    password: undefined
  }));
}

function loginThrottleKey(request, username) {
  const forwardedFor = request.headers["x-forwarded-for"];
  const clientAddress = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0] || request.socket?.remoteAddress || "unknown";

  return `${clientAddress}:${username}`;
}

function isLoginThrottled(key) {
  const current = failedLoginAttempts.get(key);

  if (!current) {
    return false;
  }

  if (Date.now() - current.firstFailedAt > loginThrottleWindowMs) {
    failedLoginAttempts.delete(key);
    return false;
  }

  return current.count >= maxFailedLoginAttempts;
}

function recordFailedLogin(key) {
  const current = failedLoginAttempts.get(key);

  if (!current || Date.now() - current.firstFailedAt > loginThrottleWindowMs) {
    failedLoginAttempts.set(key, { count: 1, firstFailedAt: Date.now() });
    return;
  }

  failedLoginAttempts.set(key, { ...current, count: current.count + 1 });
}

function clearFailedLogin(key) {
  failedLoginAttempts.delete(key);
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
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;

    if (size > maxJsonBodyBytes) {
      const error = new Error("Request body too large");
      error.statusCode = 413;
      throw error;
    }

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
    },
    signal: AbortSignal.timeout(workdayFetchTimeoutMs)
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

  Object.entries(urls)
    .filter(([, url]) => !url)
    .forEach(([dataset]) => warnings.push(`${dataset} URL is not configured; dataset returned empty.`));

  for (const [dataset, url] of configuredEntries) {
    try {
      data[dataset] = await fetchWorkdayDataset(url);

      if (data[dataset].length === 0) {
        warnings.push(`${dataset} returned no rows.`);
      }
    } catch (error) {
      warnings.push(`${dataset} failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return {
    data,
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
    const username = String(body.username ?? "");
    const throttleKey = loginThrottleKey(request, username);

    if (isLoginThrottled(throttleKey)) {
      tooManyRequests(response);
      return;
    }

    const user = getUsers().find((candidate) => candidate.username === username);

    if (!user || !verifyPassword(String(body.password ?? ""), user)) {
      recordFailedLogin(throttleKey);
      unauthorized(response, "Invalid username or password");
      return;
    }

    clearFailedLogin(throttleKey);
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

function isPathInside(parentPath, childPath) {
  const pathDifference = relative(parentPath, childPath);
  return pathDifference === "" || (!pathDifference.startsWith("..") && !isAbsolute(pathDifference));
}

function resolveStaticFilePath(pathname) {
  let decodedPathname;

  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const requestPath = decodedPathname === "/" ? "index.html" : decodedPathname.replace(/^\/+/, "");
  const filePath = resolve(distPath, requestPath);

  if (!isPathInside(distPath, filePath) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }

  return filePath;
}

function serveStatic(response, url) {
  const filePath = resolveStaticFilePath(url.pathname);

  if (!filePath) {
    const fallbackPath = resolveStaticFilePath("/");

    if (!fallbackPath) {
      notFound(response);
      return;
    }

    response.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    });
    createReadStream(fallbackPath).pipe(response);
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentType(filePath),
    "X-Content-Type-Options": "nosniff"
  });
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

    if (error && typeof error === "object" && "statusCode" in error && error.statusCode === 413) {
      payloadTooLarge(response);
      return;
    }

    if (message.includes("JSON")) {
      badRequest(response, "Invalid JSON payload");
      return;
    }

    console.error("Backend proxy error:", error);
    jsonResponse(response, 500, { error: "Unexpected server error" });
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(port, host, () => {
    console.log(`Workday dashboard backend proxy running at http://${host}:${port}`);
  });
}

export { getUsers, loadWorkdayData, readJsonBody, resolveStaticFilePath, server, verifyPassword };
