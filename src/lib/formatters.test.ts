import { describe, expect, it } from "vitest";
import { formatDateShort, formatDeadlineCountdown } from "./formatters";

describe("formatDateShort", () => {
  it("formats valid dates and handles missing or invalid values", () => {
    expect(formatDateShort("2026-10-12")).toBe("Oct 12");
    expect(formatDateShort("")).toBe("Not available");
    expect(formatDateShort("invalid-date")).toBe("Not available");
  });
});

describe("formatDeadlineCountdown", () => {
  it("uses correct singular and plural wording", () => {
    expect(formatDeadlineCountdown(0)).toBe("Due today");
    expect(formatDeadlineCountdown(1)).toBe("1 day remaining");
    expect(formatDeadlineCountdown(2)).toBe("2 days remaining");
    expect(formatDeadlineCountdown(-1)).toBe("1 day overdue");
  });
});
