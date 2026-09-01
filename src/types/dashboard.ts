export type RoleKey =
  | "workday-payroll-analyst"
  | "hris-analyst"
  | "workday-functional-analyst"
  | "payroll-systems-analyst"
  | "workday-reporting-analyst"
  | "workday-consultant"
  | "workday-integration-analyst"
  | "hr-systems-analyst"
  | "payroll-operations-analyst";

export interface RoleLens {
  key: RoleKey;
  title: string;
  focus: string;
  proofPoints: string[];
  interviewPitch: string;
  primaryTabs: Array<{
    tabId: string;
    label: string;
  }>;
  metricsToWatch: string[];
  workflow: string[];
  presentationValue: string;
}

export interface DashboardTab {
  id: string;
  label: string;
  badge?: number;
}

export type Severity = "success" | "warning" | "critical" | "neutral";

export interface KpiCard {
  label: string;
  value: string;
  detail: string;
  severity: Severity;
  trend: string;
  progress?: number;
  target?: string;
}

export interface DashboardThresholds {
  payrollCostVarianceWarning: number;
  completionYellow: number;
  completionRed: number;
  exceptionYellow: number;
  exceptionRed: number;
  missingTimeYellow: number;
  missingTimeRed: number;
  overtimeWarningHours: number;
  overtimeCriticalHours: number;
}

export type WorkerType = "Employee" | "Contingent Worker";
export type ExemptStatus = "Exempt" | "Non-Exempt";
export type PayrollStatus = "Complete" | "Pending" | "Error" | "Not Started";
export type DeductionExceptionType =
  | "None"
  | "Failed"
  | "Over-Deducted"
  | "Under-Deducted"
  | "Arrears";
export type TaxExceptionType =
  | "None"
  | "No Withholding"
  | "Missing Tax Election"
  | "Expired Tax Form"
  | "Multi-State Issue"
  | "Excess Withholding"
  | "Under Withholding";

export interface Worker {
  employeeId: string;
  employeeName: string;
  department: string;
  manager: string;
  managerEmail: string;
  company: string;
  payGroup: string;
  workerType: WorkerType;
  exemptStatus: ExemptStatus;
  hourlyRate: number;
  workSchedule: string;
  location: string;
  state: string;
  active: boolean;
}

export interface PayrollResult {
  employeeId: string;
  payPeriod: string;
  paymentDate: string;
  payrollRun: string;
  grossPay: number;
  netPay: number;
  totalDeductions: number;
  totalTaxes: number;
  employerBenefitCost: number;
  employerTaxCost: number;
  payrollStatus: PayrollStatus;
}

export interface TimeEntry {
  employeeId: string;
  payPeriod: string;
  weekEndingDate: string;
  scheduledHours: number;
  actualHoursWorked: number;
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
  submittedDays: number;
  expectedDays: number;
  missingDates: string[];
  approvedLeaveDates: string[];
  lastSubmissionDate?: string;
  timeEntryStatus: "Draft" | "Submitted" | "Approved" | "Not Submitted";
}

export interface DeductionResult {
  employeeId: string;
  payPeriod: string;
  payrollRun: string;
  deductionName: string;
  deductionCategory: "Medical" | "Dental" | "401k" | "Garnishment" | "HSA" | "Vision";
  expectedAmount: number;
  actualAmount: number;
  arrearsBalance: number;
  exceptionType: DeductionExceptionType;
}

export interface TaxResult {
  employeeId: string;
  payPeriod: string;
  taxAuthority: string;
  taxFormStatus: "Current" | "Missing" | "Expired" | "Pending Review";
  expectedTax: number;
  actualTax: number;
  exceptionType: TaxExceptionType;
}

export interface KpiHistoryPoint {
  payPeriod: string;
  payrollCost: number;
  exceptionRate: number;
  overtimeCostRatio: number;
  payrollCompletionRate: number;
}

export interface DashboardFilters {
  payPeriod: string;
  department: string;
  company: string;
  payGroup: string;
  searchTerm: string;
}

export interface FilterOptions {
  payPeriods: string[];
  companies: string[];
  payGroups: string[];
  departments: string[];
}

export interface DashboardData {
  workers: Worker[];
  payrollResults: PayrollResult[];
  timeEntries: TimeEntry[];
  deductionResults: DeductionResult[];
  taxResults: TaxResult[];
  kpiHistory: KpiHistoryPoint[];
  overtimeTrends: OvertimeTrendPoint[];
  payPeriods: string[];
}

export type DataSourceMode = "sample" | "uploaded";

export type UploadDatasetKey = "workers" | "payrollResults" | "timeEntries" | "deductionResults" | "taxResults";

export interface UploadedDatasetSummary {
  fileName: string;
  loadedAt: string;
  rowCount: number;
}

export interface UploadValidationMessage {
  dataset: UploadDatasetKey;
  message: string;
  rowNumber?: number;
  severity: "error" | "warning";
}

export interface ExceptionBreakdownItem {
  label: "Overtime" | "Missing Time" | "Deductions" | "Tax Issues";
  count: number;
  colorClass: string;
  chartColor: string;
  tabId: string;
}

export interface PayrollTrendPoint {
  payPeriod: string;
  label: string;
  payrollCost: number;
  completionRate: number;
  exceptionRate: number;
  isSelected: boolean;
}

export interface OvertimeTrendPoint {
  department: string;
  weekEndingDate: string;
  weekLabel: string;
  overtimeHours: number;
  overtimeCost: number;
}

export interface OvertimeMatrixRow {
  department: string;
  total: number;
  weeks: Record<string, number>;
}

export interface OvertimeHighlight {
  employeeId: string;
  employeeName: string;
  department: string;
  overtimeHours: number;
  overtimeCost: number;
}

export interface MissingTimeHighlight {
  employeeId: string;
  employeeName: string;
  department: string;
  missingDays: number;
  missingDates: string[];
}

export interface DeductionHighlight {
  employeeId: string;
  employeeName: string;
  department: string;
  deductionName: string;
  exceptionType: DeductionExceptionType;
  variance: number;
}

export interface TaxHighlight {
  employeeId: string;
  employeeName: string;
  department: string;
  taxAuthority: string;
  exceptionType: TaxExceptionType;
  variance: number;
}

export interface ExecutiveHighlights {
  overtime: OvertimeHighlight[];
  missingTime: MissingTimeHighlight[];
  deductions: DeductionHighlight[];
  taxes: TaxHighlight[];
}

export interface OverviewMetrics {
  totalPayrollCost: number;
  priorPayrollCost: number;
  workersProcessed: number;
  workersExpected: number;
  payrollCompletionRate: number;
  openExceptionWorkers: number;
  criticalExceptionWorkers: number;
  missingTimeWorkers: number;
  workersNearDeadline: number;
  overtimeHours: number;
  overtimeCost: number;
  overtimeTrendPercent: number;
  topDepartment: {
    name: string;
    exceptionCount: number;
  };
  highestOvertimeWorker: {
    name: string;
    overtimeHours: number;
  };
  approvalDeadline: string;
  daysToDeadline: number;
  exceptionBreakdown: ExceptionBreakdownItem[];
  highlights: ExecutiveHighlights;
}
