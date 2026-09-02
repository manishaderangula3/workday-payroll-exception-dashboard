import { sampleDashboardData } from "../data";
import type {
  DashboardData,
  DeductionExceptionType,
  DeductionResult,
  PayrollResult,
  PayrollStatus,
  TaxExceptionType,
  TaxResult,
  TimeEntry,
  UploadDatasetKey,
  UploadValidationMessage,
  Worker,
  ExemptStatus,
  WorkerType
} from "../types/dashboard";

export type UploadedDatasetMap = Partial<Pick<DashboardData, UploadDatasetKey>>;

export const uploadDatasetLabels: Record<UploadDatasetKey, string> = {
  workers: "Workers",
  payrollResults: "Payroll Results",
  timeEntries: "Time Entries",
  deductionResults: "Deduction Results",
  taxResults: "Tax Results"
};

export const maxUploadFileSizeBytes = 5 * 1024 * 1024;

type CsvRecord = Record<string, string>;
type UploadFileLike = Pick<File, "name" | "size" | "type">;

const datasetRequiredFields: Record<UploadDatasetKey, string[]> = {
  workers: ["employeeId", "employeeName", "department", "manager", "company", "payGroup"],
  payrollResults: ["employeeId", "payPeriod", "grossPay", "netPay", "payrollStatus"],
  timeEntries: ["employeeId", "payPeriod", "weekEndingDate", "scheduledHours", "actualHoursWorked"],
  deductionResults: ["employeeId", "payPeriod", "deductionName", "expectedAmount", "actualAmount", "exceptionType"],
  taxResults: ["employeeId", "payPeriod", "taxAuthority", "expectedTax", "actualTax", "exceptionType"]
};

const aliases: Record<string, string[]> = {
  employeeId: ["employeeid", "employee id", "workerid", "worker id", "worker"],
  employeeName: ["employeename", "employee name", "workername", "worker name", "name"],
  department: ["department", "organization", "costcenter", "cost center"],
  manager: ["manager", "managername", "manager name"],
  managerEmail: ["manageremail", "manager email"],
  company: ["company", "companyname", "company name"],
  payGroup: ["paygroup", "pay group"],
  workerType: ["workertype", "worker type"],
  exemptStatus: ["exemptstatus", "exempt status", "flsastatus", "flsa status"],
  hourlyRate: ["hourlyrate", "hourly rate", "rate"],
  workSchedule: ["workschedule", "work schedule", "schedule"],
  location: ["location", "worklocation", "work location"],
  state: ["state", "workstate", "work state"],
  active: ["active", "workeractive", "worker active"],
  payPeriod: ["payperiod", "pay period", "period"],
  paymentDate: ["paymentdate", "payment date", "checkdate", "check date"],
  payrollRun: ["payrollrun", "payroll run", "run"],
  grossPay: ["grosspay", "gross pay"],
  netPay: ["netpay", "net pay"],
  totalDeductions: ["totaldeductions", "total deductions", "deductions"],
  totalTaxes: ["totaltaxes", "total taxes", "taxes"],
  employerBenefitCost: ["employerbenefitcost", "employer benefit cost", "benefit cost"],
  employerTaxCost: ["employertaxcost", "employer tax cost"],
  payrollStatus: ["payrollstatus", "payroll status", "status"],
  weekEndingDate: ["weekendingdate", "week ending date", "weekending", "week ending"],
  scheduledHours: ["scheduledhours", "scheduled hours"],
  actualHoursWorked: ["actualhoursworked", "actual hours worked", "actual hours"],
  regularHours: ["regularhours", "regular hours"],
  overtimeHours: ["overtimehours", "overtime hours", "ot hours", "othours"],
  doubleTimeHours: ["doubletimehours", "double time hours", "dt hours"],
  submittedDays: ["submitteddays", "submitted days"],
  expectedDays: ["expecteddays", "expected days"],
  missingDates: ["missingdates", "missing dates"],
  approvedLeaveDates: ["approvedleavedates", "approved leave dates", "leave dates"],
  lastSubmissionDate: ["lastsubmissiondate", "last submission date"],
  timeEntryStatus: ["timeentrystatus", "time entry status"],
  deductionName: ["deductionname", "deduction name"],
  deductionCategory: ["deductioncategory", "deduction category", "category"],
  expectedAmount: ["expectedamount", "expected amount"],
  actualAmount: ["actualamount", "actual amount", "actual amount taken"],
  arrearsBalance: ["arrearsbalance", "arrears balance"],
  exceptionType: ["exceptiontype", "exception type", "exception"],
  taxAuthority: ["taxauthority", "tax authority"],
  taxFormStatus: ["taxformstatus", "tax form status", "form status"],
  expectedTax: ["expectedtax", "expected tax"],
  actualTax: ["actualtax", "actual tax"]
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(current.trim());
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current.trim());
  if (row.some((cell) => cell.length > 0)) {
    rows.push(row);
  }

  return rows;
}

export function validateUploadFile(dataset: UploadDatasetKey, file: UploadFileLike): UploadValidationMessage[] {
  const lowerName = file.name.toLowerCase();
  const isCsv = lowerName.endsWith(".csv") || file.type === "text/csv" || file.type === "application/vnd.ms-excel";
  const messages: UploadValidationMessage[] = [];

  if (!isCsv) {
    messages.push({
      dataset,
      message: "Upload must be a CSV file exported from Workday or a matching report source.",
      severity: "error"
    });
  }

  if (file.size > maxUploadFileSizeBytes) {
    messages.push({
      dataset,
      message: "Upload is larger than 5 MB. Split the export by pay period or department before loading.",
      severity: "error"
    });
  }

  if (file.size === 0) {
    messages.push({
      dataset,
      message: "Upload file is empty.",
      severity: "error"
    });
  }

  return messages;
}

function recordsFromCsv(text: string): CsvRecord[] {
  const rows = parseCsvRows(text);

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map(normalizeHeader);

  return rows.slice(1).map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() ?? ""]))
  );
}

function getValue(record: CsvRecord, field: string): string {
  const keys = aliases[field] ?? [field];
  const normalizedKeys = keys.map(normalizeHeader);

  for (const key of normalizedKeys) {
    const value = record[key];
    if (value) {
      return value;
    }
  }

  return "";
}

function missingRequiredFields(records: CsvRecord[], dataset: UploadDatasetKey): string[] {
  if (records.length === 0) {
    return datasetRequiredFields[dataset];
  }

  return datasetRequiredFields[dataset].filter((field) => !records.some((record) => getValue(record, field)));
}

function toNumber(value: string, fallback = 0): number {
  const normalized = value.replace(/[$,%]/g, "").replace(/,/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: string, fallback = true): boolean {
  const normalized = normalizeText(value);

  if (["true", "yes", "y", "active", "1"].includes(normalized)) {
    return true;
  }

  if (["false", "no", "n", "inactive", "0", "terminated"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function toList(value: string): string[] {
  return value
    .split(/[;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toPayrollStatus(value: string): PayrollStatus {
  const normalized = normalizeText(value);

  if (normalized === "complete" || normalized === "completed") {
    return "Complete";
  }

  if (normalized === "error" || normalized === "failed") {
    return "Error";
  }

  if (normalized === "pending" || normalized === "in progress") {
    return "Pending";
  }

  return "Not Started";
}

function toWorkerType(value: string): WorkerType {
  return normalizeText(value).includes("contingent") ? "Contingent Worker" : "Employee";
}

function toExemptStatus(value: string): ExemptStatus {
  return normalizeText(value).includes("non") ? "Non-Exempt" : "Exempt";
}

function toDeductionException(value: string): DeductionExceptionType {
  const normalized = normalizeText(value);

  if (normalized === "failed" || normalized === "fail") {
    return "Failed";
  }

  if (normalized === "over deducted" || normalized === "over") {
    return "Over-Deducted";
  }

  if (normalized === "under deducted" || normalized === "under") {
    return "Under-Deducted";
  }

  if (normalized === "arrears" || normalized === "arrear") {
    return "Arrears";
  }

  return "None";
}

function toTaxException(value: string): TaxExceptionType {
  const normalized = normalizeText(value);

  if (normalized === "no withholding") {
    return "No Withholding";
  }

  if (normalized === "missing tax election" || normalized === "missing election") {
    return "Missing Tax Election";
  }

  if (normalized === "expired tax form" || normalized === "expired form") {
    return "Expired Tax Form";
  }

  if (normalized === "multi state issue" || normalized === "multi-state issue") {
    return "Multi-State Issue";
  }

  if (normalized === "excess withholding" || normalized === "over withholding") {
    return "Excess Withholding";
  }

  if (normalized === "under withholding") {
    return "Under Withholding";
  }

  return "None";
}

function parseWorkers(records: CsvRecord[]): Worker[] {
  return records.map((record) => ({
    employeeId: getValue(record, "employeeId"),
    employeeName: getValue(record, "employeeName"),
    department: getValue(record, "department") || "Unassigned",
    manager: getValue(record, "manager") || "Unassigned",
    managerEmail: getValue(record, "managerEmail") || "manager@example.com",
    company: getValue(record, "company") || "Uploaded Company",
    payGroup: getValue(record, "payGroup") || "Uploaded Pay Group",
    workerType: toWorkerType(getValue(record, "workerType")),
    exemptStatus: toExemptStatus(getValue(record, "exemptStatus")),
    hourlyRate: toNumber(getValue(record, "hourlyRate")),
    workSchedule: getValue(record, "workSchedule") || "Mon-Fri, 8hrs",
    location: getValue(record, "location") || "Uploaded Location",
    state: getValue(record, "state") || "NA",
    active: toBoolean(getValue(record, "active"), true)
  }));
}

function parsePayrollResults(records: CsvRecord[]): PayrollResult[] {
  return records.map((record) => ({
    employeeId: getValue(record, "employeeId"),
    payPeriod: getValue(record, "payPeriod"),
    paymentDate: getValue(record, "paymentDate") || new Date().toISOString().slice(0, 10),
    payrollRun: getValue(record, "payrollRun") || "Uploaded Payroll Run",
    grossPay: toNumber(getValue(record, "grossPay")),
    netPay: toNumber(getValue(record, "netPay")),
    totalDeductions: toNumber(getValue(record, "totalDeductions")),
    totalTaxes: toNumber(getValue(record, "totalTaxes")),
    employerBenefitCost: toNumber(getValue(record, "employerBenefitCost")),
    employerTaxCost: toNumber(getValue(record, "employerTaxCost")),
    payrollStatus: toPayrollStatus(getValue(record, "payrollStatus"))
  }));
}

function parseTimeEntries(records: CsvRecord[]): TimeEntry[] {
  return records.map((record) => ({
    employeeId: getValue(record, "employeeId"),
    payPeriod: getValue(record, "payPeriod"),
    weekEndingDate: getValue(record, "weekEndingDate"),
    scheduledHours: toNumber(getValue(record, "scheduledHours")),
    actualHoursWorked: toNumber(getValue(record, "actualHoursWorked")),
    regularHours: toNumber(getValue(record, "regularHours")),
    overtimeHours: toNumber(getValue(record, "overtimeHours")),
    doubleTimeHours: toNumber(getValue(record, "doubleTimeHours")),
    submittedDays: toNumber(getValue(record, "submittedDays")),
    expectedDays: toNumber(getValue(record, "expectedDays")),
    missingDates: toList(getValue(record, "missingDates")),
    approvedLeaveDates: toList(getValue(record, "approvedLeaveDates")),
    lastSubmissionDate: getValue(record, "lastSubmissionDate") || undefined,
    timeEntryStatus: (getValue(record, "timeEntryStatus") as TimeEntry["timeEntryStatus"]) || "Submitted"
  }));
}

function parseDeductionResults(records: CsvRecord[]): DeductionResult[] {
  return records.map((record) => ({
    employeeId: getValue(record, "employeeId"),
    payPeriod: getValue(record, "payPeriod"),
    payrollRun: getValue(record, "payrollRun") || "Uploaded Payroll Run",
    deductionName: getValue(record, "deductionName"),
    deductionCategory: (getValue(record, "deductionCategory") as DeductionResult["deductionCategory"]) || "Medical",
    expectedAmount: toNumber(getValue(record, "expectedAmount")),
    actualAmount: toNumber(getValue(record, "actualAmount")),
    arrearsBalance: toNumber(getValue(record, "arrearsBalance")),
    exceptionType: toDeductionException(getValue(record, "exceptionType"))
  }));
}

function parseTaxResults(records: CsvRecord[]): TaxResult[] {
  return records.map((record) => ({
    employeeId: getValue(record, "employeeId"),
    payPeriod: getValue(record, "payPeriod"),
    taxAuthority: getValue(record, "taxAuthority"),
    taxFormStatus: (getValue(record, "taxFormStatus") as TaxResult["taxFormStatus"]) || "Current",
    expectedTax: toNumber(getValue(record, "expectedTax")),
    actualTax: toNumber(getValue(record, "actualTax")),
    exceptionType: toTaxException(getValue(record, "exceptionType"))
  }));
}

function getRowValidationMessages(
  dataset: UploadDatasetKey,
  rows: Array<{ employeeId: string; payPeriod?: string }>
): UploadValidationMessage[] {
  return rows.flatMap((row, index) => {
    const messages: UploadValidationMessage[] = [];

    if (!row.employeeId) {
      messages.push({
        dataset,
        message: "Missing employee ID.",
        rowNumber: index + 2,
        severity: "error"
      });
    }

    if ("payPeriod" in row && !row.payPeriod) {
      messages.push({
        dataset,
        message: "Missing pay period.",
        rowNumber: index + 2,
        severity: "error"
      });
    }

    return messages;
  });
}

function filterValidRows<T extends { employeeId: string; payPeriod?: string }>(rows: T[]): T[] {
  return rows.filter((row) => row.employeeId && (!("payPeriod" in row) || row.payPeriod));
}

export function parseUploadedDataset(
  dataset: "workers",
  text: string
): { rows: Worker[]; messages: UploadValidationMessage[] };
export function parseUploadedDataset(
  dataset: "payrollResults",
  text: string
): { rows: PayrollResult[]; messages: UploadValidationMessage[] };
export function parseUploadedDataset(
  dataset: "timeEntries",
  text: string
): { rows: TimeEntry[]; messages: UploadValidationMessage[] };
export function parseUploadedDataset(
  dataset: "deductionResults",
  text: string
): { rows: DeductionResult[]; messages: UploadValidationMessage[] };
export function parseUploadedDataset(
  dataset: "taxResults",
  text: string
): { rows: TaxResult[]; messages: UploadValidationMessage[] };
export function parseUploadedDataset(
  dataset: UploadDatasetKey,
  text: string
): { rows: DashboardData[UploadDatasetKey]; messages: UploadValidationMessage[] };
export function parseUploadedDataset(
  dataset: UploadDatasetKey,
  text: string
): { rows: DashboardData[UploadDatasetKey]; messages: UploadValidationMessage[] } {
  const records = recordsFromCsv(text);
  const missingFields = missingRequiredFields(records, dataset);

  if (missingFields.length > 0) {
    return {
      rows: [],
      messages: missingFields.map((field) => ({
        dataset,
        message: `Missing required column: ${field}.`,
        severity: "error"
      }))
    };
  }

  const parsedRows =
    dataset === "workers"
      ? parseWorkers(records)
      : dataset === "payrollResults"
        ? parsePayrollResults(records)
        : dataset === "timeEntries"
          ? parseTimeEntries(records)
          : dataset === "deductionResults"
            ? parseDeductionResults(records)
            : parseTaxResults(records);

  const messages = getRowValidationMessages(dataset, parsedRows);

  return {
    rows: filterValidRows(parsedRows as Array<{ employeeId: string; payPeriod?: string }>) as DashboardData[UploadDatasetKey],
    messages
  };
}

function uniquePayPeriods(data: Pick<DashboardData, "payrollResults" | "timeEntries" | "deductionResults" | "taxResults">) {
  return [
    ...new Set([
      ...data.payrollResults.map((row) => row.payPeriod),
      ...data.timeEntries.map((row) => row.payPeriod),
      ...data.deductionResults.map((row) => row.payPeriod),
      ...data.taxResults.map((row) => row.payPeriod)
    ])
  ]
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));
}

function deriveKpiHistory(data: DashboardData) {
  const activeWorkerCount = data.workers.filter((worker) => worker.active).length || 1;

  return data.payPeriods.map((payPeriod) => {
    const payrollRows = data.payrollResults.filter((row) => row.payPeriod === payPeriod);
    const timeRows = data.timeEntries.filter((row) => row.payPeriod === payPeriod);
    const deductionRows = data.deductionResults.filter((row) => row.payPeriod === payPeriod && row.exceptionType !== "None");
    const taxRows = data.taxResults.filter((row) => row.payPeriod === payPeriod && row.exceptionType !== "None");
    const exceptionWorkerIds = new Set<string>();

    timeRows.forEach((row) => {
      if (row.overtimeHours > 0 || row.missingDates.length > 0) {
        exceptionWorkerIds.add(row.employeeId);
      }
    });
    deductionRows.forEach((row) => exceptionWorkerIds.add(row.employeeId));
    taxRows.forEach((row) => exceptionWorkerIds.add(row.employeeId));

    return {
      payPeriod,
      payrollCost: payrollRows.reduce(
        (total, row) => total + row.grossPay + row.employerBenefitCost + row.employerTaxCost,
        0
      ),
      exceptionRate: exceptionWorkerIds.size / activeWorkerCount,
      overtimeCostRatio: 0,
      payrollCompletionRate:
        payrollRows.length === 0
          ? 0
          : payrollRows.filter((row) => row.payrollStatus === "Complete").length / activeWorkerCount
    };
  });
}

function formatWeekLabel(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function deriveOvertimeTrends(data: DashboardData) {
  const workersById = new Map(data.workers.map((worker) => [worker.employeeId, worker]));
  const trendMap = new Map<string, { department: string; weekEndingDate: string; weekLabel: string; overtimeHours: number; overtimeCost: number }>();

  data.timeEntries.forEach((entry) => {
    const worker = workersById.get(entry.employeeId);
    const department = worker?.department ?? "Unassigned";
    const key = `${department}|${entry.weekEndingDate}`;
    const current = trendMap.get(key) ?? {
      department,
      weekEndingDate: entry.weekEndingDate,
      weekLabel: formatWeekLabel(entry.weekEndingDate),
      overtimeHours: 0,
      overtimeCost: 0
    };
    const hourlyRate = worker?.exemptStatus === "Exempt" ? 0 : worker?.hourlyRate ?? 0;

    current.overtimeHours += entry.overtimeHours;
    current.overtimeCost += entry.overtimeHours * 1.5 * hourlyRate + entry.doubleTimeHours * 2 * hourlyRate;
    trendMap.set(key, current);
  });

  return [...trendMap.values()].sort(
    (a, b) => a.department.localeCompare(b.department) || a.weekEndingDate.localeCompare(b.weekEndingDate)
  );
}

export function buildActiveDashboardData(uploadedDatasets: UploadedDatasetMap): DashboardData {
  const mergedData: DashboardData = {
    ...sampleDashboardData,
    ...uploadedDatasets
  };

  const payPeriods = uniquePayPeriods(mergedData);
  const dataWithPeriods = {
    ...mergedData,
    payPeriods: payPeriods.length > 0 ? payPeriods : sampleDashboardData.payPeriods
  };

  return {
    ...dataWithPeriods,
    kpiHistory: deriveKpiHistory(dataWithPeriods),
    overtimeTrends: deriveOvertimeTrends(dataWithPeriods)
  };
}
