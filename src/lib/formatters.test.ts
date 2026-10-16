import { describe, expect, it } from "vitest";
import { formatDateShort, formatDayCount, formatDeadlineCountdown, formatHours, formatVariancePercent } from "./formatters";

describe("formatVariancePercent", () => {
  it("adds a sign only for actual increases", () => {
    expect(formatVariancePercent(110, 100)).toBe("+10.0% vs prior period");
    expect(formatVariancePercent(100, 100)).toBe("0.0% vs prior period");
    expect(formatVariancePercent(90, 100)).toBe("-10.0% vs prior period");
    expect(formatVariancePercent(100, 0)).toBe("No prior period");
  });
});

describe("formatHours", () => {
  it("uses correct singular and plural abbreviations", () => {
    expect(formatHours(1)).toBe("1 hr");
    expect(formatHours(1.5)).toBe("1.5 hrs");
    expect(formatHours(2)).toBe("2 hrs");
  });
});

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

describe("formatDayCount", () => {
  it("uses correct singular and plural wording", () => {
    expect(formatDayCount(1)).toBe("1 day");
    expect(formatDayCount(3)).toBe("3 days");
  });
});
