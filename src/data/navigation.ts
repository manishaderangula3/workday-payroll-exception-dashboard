import type { DashboardTab } from "../types/dashboard";

export const dashboardTabs: DashboardTab[] = [
  { id: "overview", label: "Overview", badge: 37 },
  { id: "payroll-costs", label: "Payroll Costs" },
  { id: "overtime", label: "Overtime", badge: 14 },
  { id: "missing-time", label: "Missing Time", badge: 9 },
  { id: "deductions", label: "Deductions", badge: 8 },
  { id: "tax-issues", label: "Tax Issues", badge: 6 },
  { id: "documentation", label: "Documentation" }
];
