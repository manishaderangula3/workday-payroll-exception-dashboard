import { describe, expect, it } from "vitest";
import { getUsers, readJsonBody, resolveStaticFilePath, verifyPassword } from "./workdayProxy.js";

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
});
