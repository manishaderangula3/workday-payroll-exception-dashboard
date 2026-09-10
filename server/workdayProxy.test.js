import { describe, expect, it } from "vitest";
import { readJsonBody, resolveStaticFilePath } from "./workdayProxy.js";

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
});
