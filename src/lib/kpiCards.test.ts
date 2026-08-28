import { describe, expect, it } from "vitest";
import { defaultThresholds } from "../data/thresholds";
import type { DashboardFilters, DashboardThresholds } from "../types/dashboard";
import { getOverviewMetrics } from "./calculations";
import { buildOverviewKpiCards } from "./kpiCards";

const currentFilters: DashboardFilters = {
  payPeriod: "2026-08-15 Semi-Monthly",
  company: "All Companies",
  payGroup: "All Pay Groups",
  department: "All Departments",
  searchTerm: ""
};

function findCard(label: string, thresholds: DashboardThresholds = defaultThresholds) {
  const metrics = getOverviewMetrics(currentFilters);
  const cards = buildOverviewKpiCards(metrics, thresholds);
  const card = cards.find((item) => item.label === label);

  if (!card) {
    throw new Error(`KPI card not found: ${label}`);
  }

  return card;
}

describe("overview KPI cards", () => {
  it("uses configured defaults to flag payroll completion and overtime risk", () => {
    expect(findCard("Payroll Completion")).toMatchObject({
      severity: "critical",
      target: "Green at 95.0%+"
    });
    expect(findCard("OT Hours")).toMatchObject({
      severity: "critical",
      target: "Warning at 20+ hours"
    });
  });

  it("recalculates severity when presentation thresholds change", () => {
    const relaxedThresholds: DashboardThresholds = {
      ...defaultThresholds,
      completionYellow: 0.6,
      completionRed: 0.5,
      overtimeWarningHours: 45,
      overtimeCriticalHours: 60
    };

    expect(findCard("Payroll Completion", relaxedThresholds).severity).toBe("success");
    expect(findCard("OT Hours", relaxedThresholds).severity).toBe("success");
  });
});
