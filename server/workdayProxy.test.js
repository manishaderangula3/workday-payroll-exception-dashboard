import { describe, expect, it, vi } from "vitest";
import { getAzureEasyAuthUser, getUsers, loadWorkdayData, parseAzurePrincipal, readJsonBody, resolveStaticFilePath, verifyPassword } from "./workdayProxy.js";

function requestFromText(text) {
  return {
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(text);
    }
  };
}

describe("backend proxy hardening", () => {
  it("rejects static paths that escape the built asset directory", () => {
    expect(resolveStaticFilePath("/../package.json")).toBeNull();
    expect(resolveStaticFilePath("/%2e%2e/package.json")).toBeNull();
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
});
