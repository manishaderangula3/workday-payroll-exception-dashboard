import type {
  DeductionExceptionType,
  PayrollStatus,
  TaxExceptionType
} from "./dashboard";

export interface PayrollCostReportRow {
  employeeId: string;
  employeeName: string;
  department: string;
  payGroup: string;
  grossPay: number;
  netPay: number;
  totalDeductions: number;
  totalTaxes: number;
  employerCosts: number;
  totalPayrollCost: number;
  payPeriod: string;
  paymentDate: string;
  payrollStatus: PayrollStatus;
}

export interface OvertimeReportRow {
  employeeId: string;
  employeeName: string;
  department: string;
  manager: string;
  scheduledHours: number;
  actualHoursWorked: number;
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
  overtimeCost: number;
  weekEndingDate: string;
  payPeriod: string;
  alert: "None" | "Yellow" | "Red";
}

export interface MissingTimeReportRow {
  employeeId: string;
  employeeName: string;
  department: string;
  manager: string;
  managerEmail: string;
  workSchedule: string;
  expectedWorkDays: number;
  submittedTimeEntryDays: number;
  missingDays: number;
  missingDates: string[];
  lastSubmissionDate: string;
  timeEntryStatus: string;
  missingTimeFlag: boolean;
}

export interface DeductionExceptionReportRow {
  employeeId: string;
  employeeName: string;
  department: string;
  deductionName: string;
  deductionCategory: string;
  expectedAmount: number;
  actualAmountTaken: number;
  variance: number;
  exceptionType: DeductionExceptionType;
  arrearsBalance: number;
  payPeriod: string;
  payrollRun: string;
}

export interface TaxExceptionReportRow {
  employeeId: string;
  employeeName: string;
  department: string;
  taxAuthority: string;
  taxFormStatus: string;
  expectedTax: number;
  actualTax: number;
  variance: number;
  exceptionType: TaxExceptionType;
  payPeriod: string;
}
