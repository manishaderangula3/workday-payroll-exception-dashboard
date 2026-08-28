import type { DashboardThresholds } from "../types/dashboard";

export const defaultThresholds: DashboardThresholds = {
  payrollCostVarianceWarning: 0.05,
  completionYellow: 0.95,
  completionRed: 0.9,
  exceptionYellow: 1,
  exceptionRed: 5,
  missingTimeYellow: 1,
  missingTimeRed: 5,
  overtimeWarningHours: 20,
  overtimeCriticalHours: 40
};
