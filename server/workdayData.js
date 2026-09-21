const aliases = {
  employeeId: ["employeeId", "Employee_ID", "Worker_ID", "Worker"],
  employeeName: ["employeeName", "Employee_Name", "Worker_Name", "Name"],
  department: ["department", "Department", "Organization", "Cost_Center"],
  manager: ["manager", "Manager", "Manager_Name"],
  managerEmail: ["managerEmail", "Manager_Email"],
  company: ["company", "Company", "Company_Name"],
  payGroup: ["payGroup", "Pay_Group"],
  workerType: ["workerType", "Worker_Type"],
  exemptStatus: ["exemptStatus", "Exempt_Status", "FLSA_Status"],
  hourlyRate: ["hourlyRate", "Hourly_Rate", "Rate"],
  workSchedule: ["workSchedule", "Work_Schedule", "Schedule"],
  location: ["location", "Location", "Work_Location"],
  state: ["state", "State", "Work_State"],
  active: ["active", "Active", "Worker_Active"],
  payPeriod: ["payPeriod", "Pay_Period", "Period"],
  paymentDate: ["paymentDate", "Payment_Date", "Check_Date"],
  payrollApprovalDate: ["payrollApprovalDate", "Payroll_Approval_Date", "Approval_Date"],
  payrollRun: ["payrollRun", "Payroll_Run", "Run"],
  grossPay: ["grossPay", "Gross_Pay"],
  netPay: ["netPay", "Net_Pay"],
  totalDeductions: ["totalDeductions", "Total_Deductions", "Deductions"],
  totalTaxes: ["totalTaxes", "Total_Taxes", "Taxes"],
  employerBenefitCost: ["employerBenefitCost", "Employer_Benefit_Cost", "Benefit_Cost"],
  employerTaxCost: ["employerTaxCost", "Employer_Tax_Cost"],
  payrollStatus: ["payrollStatus", "Payroll_Status", "Status"],
  weekEndingDate: ["weekEndingDate", "Week_Ending_Date", "Week_Ending"],
  scheduledHours: ["scheduledHours", "Scheduled_Hours"],
  actualHoursWorked: ["actualHoursWorked", "Actual_Hours_Worked", "Actual_Hours"],
  regularHours: ["regularHours", "Regular_Hours"],
  overtimeHours: ["overtimeHours", "Overtime_Hours", "OT_Hours"],
  doubleTimeHours: ["doubleTimeHours", "Double_Time_Hours"],
  submittedDays: ["submittedDays", "Submitted_Days"],
  expectedDays: ["expectedDays", "Expected_Days"],
  missingDates: ["missingDates", "Missing_Dates"],
  expectedWorkDates: ["expectedWorkDates", "Expected_Work_Dates", "Scheduled_Dates"],
  submittedWorkDates: ["submittedWorkDates", "Submitted_Work_Dates", "Time_Entry_Dates"],
  holidayDates: ["holidayDates", "Holiday_Dates"],
  approvedLeaveDates: ["approvedLeaveDates", "Approved_Leave_Dates", "Leave_Dates"],
  lastSubmissionDate: ["lastSubmissionDate", "Last_Submission_Date"],
  timeEntryStatus: ["timeEntryStatus", "Time_Entry_Status"],
  timeEntryUrl: ["timeEntryUrl", "Time_Entry_URL"],
  deductionName: ["deductionName", "Deduction_Name"],
  deductionCategory: ["deductionCategory", "Deduction_Category", "Category"],
  expectedAmount: ["expectedAmount", "Expected_Amount"],
  expectedAmountFrequency: ["expectedAmountFrequency", "Expected_Amount_Frequency", "Deduction_Frequency"],
  payPeriodsPerYear: ["payPeriodsPerYear", "Pay_Periods_Per_Year"],
  actualAmount: ["actualAmount", "Actual_Amount", "Actual_Amount_Taken"],
  arrearsBalance: ["arrearsBalance", "Arrears_Balance"],
  exceptionType: ["exceptionType", "Exception_Type", "Exception"],
  taxAuthority: ["taxAuthority", "Tax_Authority"],
  taxFormStatus: ["taxFormStatus", "Tax_Form_Status", "Form_Status"],
  expectedTax: ["expectedTax", "Expected_Tax"],
  actualTax: ["actualTax", "Actual_Tax"],
  workState: ["workState", "Work_State"],
  taxState: ["taxState", "Tax_State", "Withholding_State"]
};

const requiredFields = {
  workers: ["employeeId", "employeeName", "department", "manager", "company", "payGroup"],
  payrollResults: ["employeeId", "payPeriod", "grossPay", "netPay", "payrollStatus"],
  timeEntries: ["employeeId", "payPeriod", "weekEndingDate", "scheduledHours", "actualHoursWorked"],
  deductionResults: ["employeeId", "payPeriod", "deductionName", "expectedAmount", "actualAmount"],
  taxResults: ["employeeId", "payPeriod", "taxAuthority", "expectedTax", "actualTax"]
};

function normalizeKey(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizedRecord(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new Error("row must be a JSON object");
  }
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeKey(key), value]));
}

function value(record, field) {
  for (const candidate of aliases[field] ?? [field]) {
    const item = record[normalizeKey(candidate)];
    if (item !== null && typeof item !== "undefined" && String(item).trim() !== "") return item;
  }
  return undefined;
}

function scalar(item, field) {
  if (item === null || typeof item === "undefined") return undefined;
  if (typeof item !== "object") return item;
  if (Array.isArray(item)) throw new Error(`${field} must not be an array`);
  const nested = item.Descriptor ?? item.descriptor ?? item.value ?? item["#text"];
  if (nested === null || typeof nested === "undefined" || typeof nested === "object") {
    throw new Error(`${field} contains an unsupported nested value`);
  }
  return nested;
}

function text(record, field, fallback = "") {
  const item = scalar(value(record, field), field);
  return typeof item === "undefined" ? fallback : String(item).trim();
}

function number(record, field, fallback = 0) {
  const item = scalar(value(record, field), field);
  if (typeof item === "undefined") return fallback;
  const parsed = Number(String(item).replace(/[$,%]/g, "").replace(/,/g, ""));
  if (!Number.isFinite(parsed)) throw new Error(`${field} must be numeric`);
  return parsed;
}

function boolean(record, field, fallback = true) {
  const item = text(record, field).toLowerCase();
  if (!item) return fallback;
  if (["true", "yes", "y", "active", "1"].includes(item)) return true;
  if (["false", "no", "n", "inactive", "terminated", "0"].includes(item)) return false;
  throw new Error(`${field} must be a boolean value`);
}

function list(record, field) {
  const item = value(record, field);
  if (Array.isArray(item)) return item.map((entry) => String(scalar(entry, field))).map((entry) => entry.trim()).filter(Boolean);
  return typeof item === "undefined" ? [] : String(item).split(/[;|]/).map((entry) => entry.trim()).filter(Boolean);
}

function choice(record, field, options, fallback) {
  const item = text(record, field, fallback);
  const match = options.find((option) => normalizeKey(option) === normalizeKey(item));
  if (!match) throw new Error(`${field} has unsupported value "${item}"`);
  return match;
}

function mappedChoice(record, field, mapping, fallback) {
  const item = text(record, field, fallback);
  const mapped = mapping[normalizeKey(item)];
  if (!mapped) throw new Error(`${field} has unsupported value "${item}"`);
  return mapped;
}

function validateDates(row, fields) {
  fields.forEach((field) => {
    const values = Array.isArray(row[field]) ? row[field] : [row[field]];
    values.filter(Boolean).forEach((item) => {
      const date = String(item);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
        throw new Error(`${field} must use YYYY-MM-DD`);
      }
    });
  });
}

function deductionException(expected, actual, arrears, supplied) {
  if (supplied) return supplied;
  if (arrears > 0) return "Arrears";
  if (expected > 0 && actual === 0) return "Failed";
  const tolerance = Math.max(0.01, Math.abs(expected) * 0.01);
  if (actual - expected > tolerance) return "Over-Deducted";
  if (expected - actual > tolerance) return "Under-Deducted";
  return "None";
}

function taxException(status, expected, actual, workState, taxState, supplied) {
  if (supplied) return supplied;
  if (status === "Missing") return "Missing Tax Election";
  if (status === "Expired") return "Expired Tax Form";
  if (workState && taxState && normalizeKey(workState) !== normalizeKey(taxState)) return "Multi-State Issue";
  if (expected > 0 && actual === 0) return "No Withholding";
  const tolerance = Math.max(1, Math.abs(expected) * 0.05);
  if (actual - expected > tolerance) return "Excess Withholding";
  if (expected - actual > tolerance) return "Under Withholding";
  return "None";
}

function normalizeRow(dataset, rawRow) {
  const record = normalizedRecord(rawRow);
  const missing = requiredFields[dataset].filter((field) => typeof value(record, field) === "undefined");
  if (missing.length) throw new Error(`missing required fields: ${missing.join(", ")}`);

  if (dataset === "workers") {
    return {
      employeeId: text(record, "employeeId"), employeeName: text(record, "employeeName"),
      department: text(record, "department"), manager: text(record, "manager"),
      managerEmail: text(record, "managerEmail", "manager@example.com"), company: text(record, "company"),
      payGroup: text(record, "payGroup"),
      workerType: mappedChoice(record, "workerType", { employee: "Employee", contingent: "Contingent Worker", contingentworker: "Contingent Worker" }, "Employee"),
      exemptStatus: mappedChoice(record, "exemptStatus", { exempt: "Exempt", nonexempt: "Non-Exempt" }, "Non-Exempt"),
      hourlyRate: number(record, "hourlyRate"), workSchedule: text(record, "workSchedule", "Mon-Fri, 8hrs"),
      location: text(record, "location", "Unassigned"), state: text(record, "state", "NA"), active: boolean(record, "active")
    };
  }

  if (dataset === "payrollResults") {
    const row = {
      employeeId: text(record, "employeeId"), payPeriod: text(record, "payPeriod"), paymentDate: text(record, "paymentDate"),
      payrollApprovalDate: text(record, "payrollApprovalDate") || undefined, payrollRun: text(record, "payrollRun", "Workday Payroll Run"),
      grossPay: number(record, "grossPay"), netPay: number(record, "netPay"), totalDeductions: number(record, "totalDeductions"),
      totalTaxes: number(record, "totalTaxes"), employerBenefitCost: number(record, "employerBenefitCost"),
      employerTaxCost: number(record, "employerTaxCost"),
      payrollStatus: mappedChoice(record, "payrollStatus", {
        complete: "Complete", completed: "Complete", pending: "Pending", inprogress: "Pending",
        error: "Error", failed: "Error", notstarted: "Not Started"
      }, "Not Started")
    };
    validateDates(row, ["paymentDate", "payrollApprovalDate"]);
    return row;
  }

  if (dataset === "timeEntries") {
    const actual = number(record, "actualHoursWorked");
    const expectedWorkDates = list(record, "expectedWorkDates");
    const submittedWorkDates = list(record, "submittedWorkDates");
    const row = {
      employeeId: text(record, "employeeId"), payPeriod: text(record, "payPeriod"), weekEndingDate: text(record, "weekEndingDate"),
      scheduledHours: number(record, "scheduledHours"), actualHoursWorked: actual,
      regularHours: number(record, "regularHours", Math.min(actual, 40)), overtimeHours: number(record, "overtimeHours", Math.max(actual - 40, 0)),
      doubleTimeHours: number(record, "doubleTimeHours"), submittedDays: number(record, "submittedDays", submittedWorkDates.length),
      expectedDays: number(record, "expectedDays", expectedWorkDates.length), missingDates: list(record, "missingDates"),
      expectedWorkDates, submittedWorkDates, holidayDates: list(record, "holidayDates"), approvedLeaveDates: list(record, "approvedLeaveDates"),
      lastSubmissionDate: text(record, "lastSubmissionDate") || undefined,
      timeEntryUrl: text(record, "timeEntryUrl") || undefined,
      timeEntryStatus: mappedChoice(record, "timeEntryStatus", {
        draft: "Draft", submitted: "Submitted", approved: "Approved", notsubmitted: "Not Submitted"
      }, "Submitted")
    };
    validateDates(row, ["weekEndingDate", "missingDates", "expectedWorkDates", "submittedWorkDates", "holidayDates", "approvedLeaveDates", "lastSubmissionDate"]);
    return row;
  }

  if (dataset === "deductionResults") {
    const sourceExpectedAmount = number(record, "expectedAmount");
    const expectedAmountFrequency = choice(record, "expectedAmountFrequency", ["Per Pay Period", "Monthly", "Annual"], "Per Pay Period");
    const payPeriodsPerYear = number(record, "payPeriodsPerYear", 26);
    if (payPeriodsPerYear <= 0) throw new Error("payPeriodsPerYear must be greater than zero");
    const expectedAmount = expectedAmountFrequency === "Monthly" ? sourceExpectedAmount * 12 / payPeriodsPerYear
      : expectedAmountFrequency === "Annual" ? sourceExpectedAmount / payPeriodsPerYear : sourceExpectedAmount;
    const actualAmount = number(record, "actualAmount");
    const arrearsBalance = number(record, "arrearsBalance");
    const suppliedValue = text(record, "exceptionType");
    const deductionTypes = { none: "None", failed: "Failed", fail: "Failed", over: "Over-Deducted", overdeducted: "Over-Deducted", under: "Under-Deducted", underdeducted: "Under-Deducted", arrears: "Arrears", arrear: "Arrears" };
    const supplied = suppliedValue ? deductionTypes[normalizeKey(suppliedValue)] : "";
    if (suppliedValue && !supplied) throw new Error("exceptionType is unsupported");
    return {
      employeeId: text(record, "employeeId"), payPeriod: text(record, "payPeriod"), payrollRun: text(record, "payrollRun", "Workday Payroll Run"),
      deductionName: text(record, "deductionName"),
      deductionCategory: choice(record, "deductionCategory", ["Medical", "Dental", "401k", "Garnishment", "HSA", "Vision"], "Medical"),
      expectedAmount, sourceExpectedAmount, expectedAmountFrequency, payPeriodsPerYear, actualAmount, arrearsBalance,
      exceptionType: deductionException(expectedAmount, actualAmount, arrearsBalance, supplied)
    };
  }

  const taxFormStatus = choice(record, "taxFormStatus", ["Current", "Missing", "Expired", "Pending Review"], "Current");
  const expectedTax = number(record, "expectedTax");
  const actualTax = number(record, "actualTax");
  const workState = text(record, "workState");
  const taxState = text(record, "taxState");
  const suppliedValue = text(record, "exceptionType");
  const taxTypes = {
    none: "None", nowithholding: "No Withholding", missingtaxelection: "Missing Tax Election", missingelection: "Missing Tax Election",
    expiredtaxform: "Expired Tax Form", expiredform: "Expired Tax Form", multistateissue: "Multi-State Issue",
    excesswithholding: "Excess Withholding", overwithholding: "Excess Withholding", underwithholding: "Under Withholding"
  };
  const supplied = suppliedValue ? taxTypes[normalizeKey(suppliedValue)] : "";
  if (suppliedValue && !supplied) throw new Error("exceptionType is unsupported");
  return {
    employeeId: text(record, "employeeId"), payPeriod: text(record, "payPeriod"), taxAuthority: text(record, "taxAuthority"),
    taxFormStatus, expectedTax, actualTax, workState: workState || undefined, taxState: taxState || undefined,
    exceptionType: taxException(taxFormStatus, expectedTax, actualTax, workState, taxState, supplied)
  };
}

export function normalizeWorkdayDataset(dataset, rows) {
  if (!requiredFields[dataset]) throw new Error(`Unsupported Workday dataset: ${dataset}`);
  if (!Array.isArray(rows)) throw new Error(`${dataset} payload did not contain a row array`);

  const normalizedRows = [];
  const warnings = [];
  rows.forEach((row, index) => {
    try {
      normalizedRows.push(normalizeRow(dataset, row));
    } catch (error) {
      warnings.push(`${dataset} row ${index + 1} rejected: ${error instanceof Error ? error.message : "invalid row"}.`);
    }
  });
  return { rows: normalizedRows, warnings };
}

export function extractWorkdayPage(payload) {
  if (Array.isArray(payload)) return { rows: payload, nextUrl: null };
  if (!payload || typeof payload !== "object") throw new Error("Workday response must be a JSON object or array");

  const rows = payload.Report_Entry ?? payload.reportEntries ?? payload.data ?? payload.Report_Data?.Report_Entry;
  if (!Array.isArray(rows)) throw new Error("Workday response did not contain Report_Entry, reportEntries, or data rows");
  const nextUrl = payload.next ?? payload.nextPage ?? payload.links?.next?.href ?? payload.paging?.next ?? null;
  return { rows, nextUrl: nextUrl ? String(nextUrl) : null };
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function fetchWorkdayPages(startUrl, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const retries = Number.isInteger(options.retries) && options.retries > 0 ? options.retries : 3;
  const maxPages = Number.isInteger(options.maxPages) && options.maxPages > 0 ? options.maxPages : 25;
  const timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0 ? options.timeoutMs : 15000;
  const headers = options.headers ?? {};
  const origin = new URL(startUrl).origin;
  const allRows = [];
  let currentUrl = startUrl;

  for (let page = 1; currentUrl && page <= maxPages; page += 1) {
    let response;
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt += 1) {
      try {
        response = await fetchImpl(currentUrl, { headers, signal: AbortSignal.timeout(timeoutMs) });
        if (response.ok) break;
        if (response.status < 500 && response.status !== 429) throw new Error(`Workday request failed with status ${response.status}`);
        lastError = new Error(`Workday request failed with status ${response.status}`);
      } catch (error) {
        lastError = error;
        if (attempt === retries || (error instanceof Error && /status 4\d\d/.test(error.message) && !/status 429/.test(error.message))) throw error;
      }
      await wait(Math.min(250 * 2 ** (attempt - 1), 2000));
    }
    if (!response?.ok) throw lastError ?? new Error("Workday request failed");

    const { rows, nextUrl } = extractWorkdayPage(await response.json());
    allRows.push(...rows);
    if (!nextUrl) return allRows;
    const resolvedNext = new URL(nextUrl, currentUrl);
    if (resolvedNext.origin !== origin) throw new Error("Workday pagination URL changed origin");
    currentUrl = resolvedNext.toString();
  }

  if (currentUrl) throw new Error(`Workday pagination exceeded ${maxPages} pages`);
  return allRows;
}
