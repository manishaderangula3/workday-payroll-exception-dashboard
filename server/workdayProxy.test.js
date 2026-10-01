import { describe, expect, it, vi } from "vitest";
import { clearFailedLogin, getAzureEasyAuthUser, getUsers, isActionRateLimited, isLoginThrottled, loadWorkdayData, loginThrottleKey, parseAzurePrincipal, readJsonBody, recordFailedLogin, resolveStaticFilePath, secureValueMatches, shouldCompress, verifyPassword } from "./workdayProxy.js";

function requestFromText(text) {
  return {
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(text);
    }
  };
}

describe("backend proxy hardening", () => {
  it("compares delivery callback secrets without accepting partial values", () => {
    expect(secureValueMatches("shared-delivery-secret", "shared-delivery-secret")).toBe(true);
    expect(secureValueMatches("shared-delivery", "shared-delivery-secret")).toBe(false);
    expect(secureValueMatches(undefined, "shared-delivery-secret")).toBe(false);
  });

  it("rejects static paths that escape the built asset directory", () => {
    expect(resolveStaticFilePath("/../package.json")).toBeNull();
    expect(resolveStaticFilePath("/%2e%2e/package.json")).toBeNull();
  });

  it("compresses text assets only when the client accepts gzip", () => {
    expect(shouldCompress({ headers: { "accept-encoding": "br, gzip" } }, "dist/assets/app.js")).toBe(true);
    expect(shouldCompress({ headers: { "accept-encoding": "gzip" } }, "dist/report.xlsx")).toBe(false);
    expect(shouldCompress({ headers: {} }, "dist/assets/app.js")).toBe(false);
  });

  it("parses small JSON request bodies", async () => {
    await expect(readJsonBody(requestFromText('{"username":"payroll.admin"}'))).resolves.toEqual({
      username: "payroll.admin"
    });
  });

  it("rejects oversized JSON request bodies before parsing", async () => {
    await expect(readJsonBody(requestFromText(`{"payload":"${"x".repeat(70 * 1024)}"}`))).rejects.toMatchObject({
      statusCode: 413
    });
  });

  it("rejects weak password hash metadata", () => {
    expect(
      verifyPassword("password", {
        passwordHash: "pbkdf2$sha1$1000$salt$hash"
      })
    ).toBe(false);
  });

  it("rejects plaintext configured users in production", () => {
    const originalUsers = process.env.AUTH_USERS_JSON;
    const originalNodeEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = "production";
    process.env.AUTH_USERS_JSON = JSON.stringify([
      {
        username: "plain.user",
        password: "not-for-production",
        role: "read_only_auditor"
      }
    ]);

    try {
      expect(() => getUsers()).toThrow("AUTH_USERS_JSON must use passwordHash values in production.");
    } finally {
      if (typeof originalUsers === "undefined") {
        delete process.env.AUTH_USERS_JSON;
      } else {
        process.env.AUTH_USERS_JSON = originalUsers;
      }

      if (typeof originalNodeEnv === "undefined") {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = originalNodeEnv;
      }
    }
  });

  it("does not mix demo rows into a partially configured Workday response", async () => {
    const keys = [
      "WORKDAY_WORKERS_URL",
      "WORKDAY_PAYROLL_RESULTS_URL",
      "WORKDAY_TIME_ENTRIES_URL",
      "WORKDAY_DEDUCTION_RESULTS_URL",
      "WORKDAY_TAX_RESULTS_URL"
    ];
    const originalValues = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

    keys.forEach((key) => delete process.env[key]);
    process.env.WORKDAY_WORKERS_URL = "https://workday.example/workers";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{
        employeeId: "W-LIVE-1",
        employeeName: "Live Worker",
        department: "Operations",
        manager: "Live Manager",
        company: "Example Company",
        payGroup: "US Weekly"
      }] })
    }));

    try {
      const result = await loadWorkdayData();

      expect(result.source).toBe("workday");
      expect(result.data.workers).toHaveLength(1);
      expect(result.data.workers[0].employeeId).toBe("W-LIVE-1");
      expect(result.data.payrollResults).toEqual([]);
      expect(result.warnings).toContain("payrollResults URL is not configured; dataset returned empty.");
    } finally {
      vi.unstubAllGlobals();
      keys.forEach((key) => {
        if (typeof originalValues[key] === "undefined") {
          delete process.env[key];
        } else {
          process.env[key] = originalValues[key];
        }
      });
    }
  });

  it("maps an Azure Easy Auth principal to an application role", () => {
    const principal = {
      userDetails: "payroll.lead@example.com",
      userRoles: ["Payroll.Manager"],
      claims: [{ typ: "name", val: "Payroll Lead" }]
    };
    const encoded = Buffer.from(JSON.stringify(principal)).toString("base64");
    expect(parseAzurePrincipal(encoded)).toEqual(principal);
    expect(getAzureEasyAuthUser({ headers: { "x-ms-client-principal": encoded } })).toMatchObject({
      username: "payroll.lead@example.com",
      displayName: "Payroll Lead",
      role: "payroll_manager"
    });
  });

  it("fails closed when a department manager has no configured scope", () => {
    const principal = {
      userDetails: "unscoped.manager@example.com",
      userRoles: ["Department.Manager"],
      claims: []
    };
    const encoded = Buffer.from(JSON.stringify(principal)).toString("base64");
    expect(getAzureEasyAuthUser({ headers: { "x-ms-client-principal": encoded } })).toBeNull();
  });

  it("does not treat inherited mapping properties as Entra roles", () => {
    const encoded = Buffer.from(JSON.stringify({
      userDetails: "unknown@example.com",
      userRoles: ["constructor"],
      claims: []
    })).toString("base64");
    expect(getAzureEasyAuthUser({ headers: { "x-ms-client-principal": encoded } })).toBeNull();
  });

  it("rejects configured Entra mappings to unsupported roles", () => {
    const originalMappings = process.env.ENTRA_ROLE_MAPPINGS_JSON;
    process.env.ENTRA_ROLE_MAPPINGS_JSON = '{"Custom.Role":"typo_role"}';
    const encoded = Buffer.from(JSON.stringify({
      userDetails: "custom@example.com",
      userRoles: ["Custom.Role"],
      claims: []
    })).toString("base64");
    try {
      expect(getAzureEasyAuthUser({ headers: { "x-ms-client-principal": encoded } })).toBeNull();
    } finally {
      if (typeof originalMappings === "undefined") delete process.env.ENTRA_ROLE_MAPPINGS_JSON;
      else process.env.ENTRA_ROLE_MAPPINGS_JSON = originalMappings;
    }
  });

  it("rate-limits repeated state-changing actions within the configured window", () => {
    const key = `test:${Date.now()}`;
    expect(isActionRateLimited(key, 2, 1000, 100)).toBe(false);
    expect(isActionRateLimited(key, 2, 1000, 200)).toBe(false);
    expect(isActionRateLimited(key, 2, 1000, 300)).toBe(true);
    expect(isActionRateLimited(key, 2, 1000, 1200)).toBe(false);
  });

  it("ignores forwarded client addresses unless the socket is a trusted proxy", () => {
    const originalProxies = process.env.TRUSTED_PROXY_IPS;
    const request = {
      headers: { "x-forwarded-for": "198.51.100.22" },
      socket: { remoteAddress: "10.0.0.5" }
    };

    try {
      delete process.env.TRUSTED_PROXY_IPS;
      const directKey = loginThrottleKey(request, "User.Name");
      expect(directKey).toBe(loginThrottleKey({ headers: {}, socket: request.socket }, "user.name"));
      process.env.TRUSTED_PROXY_IPS = "10.0.0.5";
      expect(loginThrottleKey(request, "User.Name")).not.toBe(directKey);
      expect(loginThrottleKey({
        headers: { "x-forwarded-for": "203.0.113.99, 198.51.100.22" },
        socket: request.socket
      }, "User.Name")).toBe(loginThrottleKey({
        headers: {},
        socket: { remoteAddress: "198.51.100.22" }
      }, "user.name"));
    } finally {
      if (typeof originalProxies === "undefined") delete process.env.TRUSTED_PROXY_IPS;
      else process.env.TRUSTED_PROXY_IPS = originalProxies;
    }
  });

  it("bounds failed-login tracking by evicting the oldest key", () => {
    const prefix = `login-cap:${Date.now()}`;
    const oldestKey = `${prefix}:oldest`;

    try {
      for (let attempt = 0; attempt < 5; attempt += 1) recordFailedLogin(oldestKey, 100);
      expect(isLoginThrottled(oldestKey, 200)).toBe(true);
      for (let index = 0; index < 5000; index += 1) recordFailedLogin(`${prefix}:${index}`, 100);
      expect(isLoginThrottled(oldestKey, 200)).toBe(false);
    } finally {
      clearFailedLogin(oldestKey);
      for (let index = 0; index < 5000; index += 1) clearFailedLogin(`${prefix}:${index}`);
    }
  });
});
