import type { DeductionResult } from "../types/dashboard";

export const deductionResults: DeductionResult[] = [
  {
    employeeId: "W-1004",
    payPeriod: "2026-08-15 Semi-Monthly",
    payrollRun: "PR-2026-08A",
    deductionName: "Medical PPO Employee",
    deductionCategory: "Medical",
    expectedAmount: 238,
    actualAmount: 0,
    arrearsBalance: 238,
    exceptionType: "Failed"
  },
  {
    employeeId: "W-1008",
    payPeriod: "2026-08-15 Semi-Monthly",
    payrollRun: "PR-2026-08A",
    deductionName: "Dental Employee + Family",
    deductionCategory: "Dental",
    expectedAmount: 48,
    actualAmount: 24,
    arrearsBalance: 24,
    exceptionType: "Under-Deducted"
  },
  {
    employeeId: "W-1011",
    payPeriod: "2026-08-15 Semi-Monthly",
    payrollRun: "PR-2026-08A",
    deductionName: "401k Pre-Tax",
    deductionCategory: "401k",
    expectedAmount: 255,
    actualAmount: 310,
    arrearsBalance: 0,
    exceptionType: "Over-Deducted"
  },
  {
    employeeId: "W-1012",
    payPeriod: "2026-08-15 Semi-Monthly",
    payrollRun: "PR-2026-08A",
    deductionName: "Garnishment Order",
    deductionCategory: "Garnishment",
    expectedAmount: 150,
    actualAmount: 0,
    arrearsBalance: 300,
    exceptionType: "Arrears"
  },
  {
    employeeId: "W-1005",
    payPeriod: "2026-08-15 Semi-Monthly",
    payrollRun: "PR-2026-08A",
    deductionName: "Medical PPO Employee",
    deductionCategory: "Medical",
    expectedAmount: 238,
    actualAmount: 238,
    arrearsBalance: 0,
    exceptionType: "None"
  }
];
