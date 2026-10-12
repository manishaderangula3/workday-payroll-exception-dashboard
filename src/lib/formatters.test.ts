import { describe, expect, it } from "vitest";
import { formatDateShort } from "./formatters";

describe("formatDateShort", () => {
  it("formats valid dates and handles missing or invalid values", () => {
    expect(formatDateShort("2026-10-12")).toBe("Oct 12");
    expect(formatDateShort("")).toBe("Not available");
    expect(formatDateShort("invalid-date")).toBe("Not available");
  });
});
