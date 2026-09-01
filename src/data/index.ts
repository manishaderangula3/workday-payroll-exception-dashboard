export { workers } from "./workers";
export { payPeriods, payrollResults } from "./payrollResults";
export { timeEntries } from "./timeEntries";
export { deductionResults } from "./deductionExceptions";
export { taxResults } from "./taxExceptions";
export { kpiHistory } from "./kpiHistory";
export { overtimeTrends } from "./overtimeTrends";

import type { DashboardData } from "../types/dashboard";
import { workers } from "./workers";
import { payPeriods, payrollResults } from "./payrollResults";
import { timeEntries } from "./timeEntries";
import { deductionResults } from "./deductionExceptions";
import { taxResults } from "./taxExceptions";
import { kpiHistory } from "./kpiHistory";
import { overtimeTrends } from "./overtimeTrends";

export const sampleDashboardData: DashboardData = {
  workers,
  payrollResults,
  timeEntries,
  deductionResults,
  taxResults,
  kpiHistory,
  overtimeTrends,
  payPeriods
};
