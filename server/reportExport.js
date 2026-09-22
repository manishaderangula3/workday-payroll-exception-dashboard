import ExcelJS from "exceljs";

const reportNames = {
  "payroll-costs": "Payroll Cost Summary Report",
  overtime: "Overtime Hours Exception Report",
  "missing-time": "Missing Time Entries Exception Report",
  deductions: "Deduction Exception Report",
  "tax-issues": "Tax Exception Report",
  readiness: "Payroll Approval Readiness Center",
  "worker-snapshot": "Worker Payroll Exception Snapshot"
};

function safeName(value) {
  return String(value).trim().replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "report";
}

function displayLabel(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function filterWorkers(data, filters) {
  const search = String(filters.searchTerm ?? "").trim().toLowerCase();
  return data.workers.filter((worker) => {
    const searchable = [worker.employeeId, worker.employeeName, worker.department, worker.manager, worker.company, worker.payGroup]
      .join(" ")
      .toLowerCase();
    return worker.active &&
      (!filters.company || filters.company === "All Companies" || worker.company === filters.company) &&
      (!filters.payGroup || filters.payGroup === "All Pay Groups" || worker.payGroup === filters.payGroup) &&
      (!filters.department || filters.department === "All Departments" || worker.department === filters.department) &&
      (!search || searchable.includes(search));
  });
}

function effectiveMissingDates(entry) {
  const submitted = new Set(entry.submittedWorkDates ?? []);
  const leave = new Set(entry.approvedLeaveDates ?? []);
  const holidays = new Set(entry.holidayDates ?? []);
  const candidates = entry.expectedWorkDates?.length
    ? entry.expectedWorkDates.filter((date) => !submitted.has(date))
    : entry.missingDates ?? [];
  return [...new Set(candidates)].filter((date) => !leave.has(date) && !holidays.has(date));
}

function reportRows(reportType, filters, data, employeeId, suppliedThresholds = {}) {
  const workers = filterWorkers(data, filters);
  const workersById = new Map(workers.map((worker) => [worker.employeeId, worker]));
  const visibleIds = new Set(workersById.keys());
  const period = String(filters.payPeriod ?? "");

  if (reportType === "payroll-costs") {
    return data.payrollResults
      .filter((row) => visibleIds.has(row.employeeId) && row.payPeriod === period)
      .map((row) => {
        const worker = workersById.get(row.employeeId);
        const employerCosts = row.employerBenefitCost + row.employerTaxCost;
        return {
          employeeId: row.employeeId, employeeName: worker.employeeName, department: worker.department,
          payGroup: worker.payGroup, grossPay: row.grossPay, netPay: row.netPay,
          totalDeductions: row.totalDeductions, totalTaxes: row.totalTaxes, employerCosts,
          totalPayrollCost: row.grossPay + employerCosts, payPeriod: row.payPeriod,
          paymentDate: row.paymentDate, payrollStatus: row.payrollStatus
        };
      })
      .sort((a, b) => a.department.localeCompare(b.department) || a.employeeName.localeCompare(b.employeeName));
  }

  if (reportType === "overtime") {
    return data.timeEntries
      .filter((row) => visibleIds.has(row.employeeId) && row.payPeriod === period && row.overtimeHours > 0)
      .flatMap((row) => {
        const worker = workersById.get(row.employeeId);
        if (worker.exemptStatus !== "Non-Exempt") return [];
        return [{
          employeeId: row.employeeId, employeeName: worker.employeeName, department: worker.department,
          manager: worker.manager, scheduledHours: row.scheduledHours, actualHoursWorked: row.actualHoursWorked,
          regularHours: row.regularHours, overtimeHours: row.overtimeHours, doubleTimeHours: row.doubleTimeHours,
          overtimeCost: row.overtimeHours * 1.5 * worker.hourlyRate + row.doubleTimeHours * 2 * worker.hourlyRate,
          weekEndingDate: row.weekEndingDate, payPeriod: row.payPeriod,
          alert: row.overtimeHours > 10 ? "Red" : row.overtimeHours > 5 ? "Yellow" : "None"
        }];
      })
      .sort((a, b) => b.overtimeHours - a.overtimeHours);
  }

  if (reportType === "missing-time") {
    return data.timeEntries
      .filter((row) => visibleIds.has(row.employeeId) && row.payPeriod === period)
      .flatMap((row) => {
        const missingDates = effectiveMissingDates(row);
        if (missingDates.length === 0) return [];
        const worker = workersById.get(row.employeeId);
        return [{
          employeeId: row.employeeId, employeeName: worker.employeeName, department: worker.department,
          manager: worker.manager, managerEmail: worker.managerEmail, workSchedule: worker.workSchedule,
          expectedWorkDays: row.expectedDays, submittedTimeEntryDays: row.submittedDays,
          missingDays: missingDates.length, missingDates, lastSubmissionDate: row.lastSubmissionDate ?? "No submission",
          timeEntryStatus: row.timeEntryStatus, missingTimeFlag: true
        }];
      })
      .sort((a, b) => b.missingDays - a.missingDays);
  }

  if (reportType === "deductions") {
    return data.deductionResults
      .filter((row) => visibleIds.has(row.employeeId) && row.payPeriod === period && row.exceptionType !== "None")
      .map((row) => {
        const worker = workersById.get(row.employeeId);
        return {
          employeeId: row.employeeId, employeeName: worker.employeeName, department: worker.department,
          deductionName: row.deductionName, deductionCategory: row.deductionCategory,
          expectedAmount: row.expectedAmount, actualAmountTaken: row.actualAmount,
          variance: row.actualAmount - row.expectedAmount, exceptionType: row.exceptionType,
          arrearsBalance: row.arrearsBalance, payPeriod: row.payPeriod, payrollRun: row.payrollRun
        };
      })
      .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
  }

  if (reportType === "tax-issues") {
    return data.taxResults
      .filter((row) => visibleIds.has(row.employeeId) && row.payPeriod === period && row.exceptionType !== "None")
      .map((row) => {
        const worker = workersById.get(row.employeeId);
        return {
          employeeId: row.employeeId, employeeName: worker.employeeName, department: worker.department,
          taxAuthority: row.taxAuthority, taxFormStatus: row.taxFormStatus, expectedTax: row.expectedTax,
          actualTax: row.actualTax, variance: row.actualTax - row.expectedTax,
          exceptionType: row.exceptionType, payPeriod: row.payPeriod
        };
      })
      .sort((a, b) => a.exceptionType.localeCompare(b.exceptionType) || Math.abs(b.variance) - Math.abs(a.variance));
  }

  if (reportType === "worker-snapshot") {
    const worker = workersById.get(employeeId);
    if (!worker) return [];
    const payroll = data.payrollResults.find((row) => row.employeeId === employeeId && row.payPeriod === period);
    const timeEntries = data.timeEntries.filter((row) => row.employeeId === employeeId && row.payPeriod === period);
    const deductions = data.deductionResults.filter((row) => row.employeeId === employeeId && row.payPeriod === period && row.exceptionType !== "None");
    const taxes = data.taxResults.filter((row) => row.employeeId === employeeId && row.payPeriod === period && row.exceptionType !== "None");
    return [{
      employeeId, employeeName: worker.employeeName, department: worker.department, manager: worker.manager,
      payGroup: worker.payGroup, payrollStatus: payroll?.payrollStatus ?? "No payroll result",
      grossPay: payroll?.grossPay ?? "", totalPayrollCost: payroll ? payroll.grossPay + payroll.employerBenefitCost + payroll.employerTaxCost : "",
      overtimeHours: timeEntries.reduce((total, row) => total + row.overtimeHours, 0),
      missingDates: [...new Set(timeEntries.flatMap(effectiveMissingDates))],
      deductionExceptions: deductions.map((row) => row.exceptionType), taxExceptions: taxes.map((row) => row.exceptionType)
    }];
  }

  const thresholdValues = suppliedThresholds && typeof suppliedThresholds === "object" ? suppliedThresholds : {};
  const threshold = (key, fallback) => Number.isFinite(Number(thresholdValues[key])) ? Number(thresholdValues[key]) : fallback;
  const payroll = data.payrollResults.filter((row) => visibleIds.has(row.employeeId) && row.payPeriod === period);
  const completed = new Set(payroll.filter((row) => row.payrollStatus === "Complete").map((row) => row.employeeId)).size;
  const missingRows = reportRows("missing-time", filters, data);
  const overtimeRows = reportRows("overtime", filters, data);
  const deductionRows = reportRows("deductions", filters, data);
  const taxRows = reportRows("tax-issues", filters, data);
  const completionRate = workers.length === 0 ? 0 : completed / workers.length;
  const overtimeHours = overtimeRows.reduce((total, row) => total + row.overtimeHours, 0);
  const periods = [...new Set(data.payrollResults.map((row) => row.payPeriod))].sort((a, b) => b.localeCompare(a));
  const priorPeriod = periods[periods.indexOf(period) + 1];
  const cost = (rows) => rows.reduce((total, row) => total + row.grossPay + row.employerBenefitCost + row.employerTaxCost, 0);
  const currentCost = cost(payroll);
  const priorCost = priorPeriod ? cost(data.payrollResults.filter((row) => visibleIds.has(row.employeeId) && row.payPeriod === priorPeriod)) : 0;
  const costVariance = priorCost === 0 ? 0 : Math.abs(currentCost - priorCost) / priorCost;
  const missingPayroll = workers.filter((worker) => !payroll.some((row) => row.employeeId === worker.employeeId)).length;
  const negativePayroll = payroll.filter((row) => row.grossPay < 0 || row.netPay < 0).length;
  const missingOrg = workers.filter((worker) => !worker.department || !worker.manager).length;
  const dataQualityIssues = missingPayroll + negativePayroll + missingOrg;
  const issueStatus = (count, critical = false) => count === 0 ? "Passed" : critical ? "Blocked" : "Review";
  const checks = [
    {
      check: "Payroll completion",
      status: completionRate < threshold("completionRed", 0.9) ? "Blocked" : completionRate < threshold("completionYellow", 0.95) ? "Review" : "Passed",
      value: `${completed} of ${workers.length} workers complete`, owner: "Payroll Manager", action: "Complete pending payroll results before approval."
    },
    { check: "Missing time cleared", status: issueStatus(missingRows.length, true), value: `${missingRows.length} workers with missing time`, owner: "Department Managers", action: "Submit or approve missing time entries." },
    {
      check: "Overtime reviewed",
      status: overtimeHours >= threshold("overtimeCriticalHours", 40) ? "Blocked" : overtimeHours > 0 ? "Review" : "Passed",
      value: `${overtimeHours.toFixed(overtimeHours % 1 === 0 ? 0 : 1)} total OT hours`, owner: "Payroll Operations", action: "Review high overtime workers and manager approvals."
    },
    {
      check: "Deduction exceptions resolved",
      status: deductionRows.some((row) => row.exceptionType === "Failed" || row.exceptionType === "Arrears") ? "Blocked" : issueStatus(deductionRows.length),
      value: `${deductionRows.length} deduction exceptions`, owner: "Benefits Administrator", action: "Resolve failed deductions, arrears, and variance items."
    },
    {
      check: "Tax exceptions reviewed",
      status: taxRows.some((row) => row.exceptionType === "No Withholding" || row.exceptionType === "Multi-State Issue") ? "Blocked" : issueStatus(taxRows.length),
      value: `${taxRows.length} tax exceptions`, owner: "Tax Analyst", action: "Review withholding, tax elections, and jurisdiction issues."
    },
    {
      check: "Payroll cost variance checked", status: costVariance > threshold("payrollCostVarianceWarning", 0.05) ? "Review" : "Passed",
      value: priorCost === 0 ? "No prior period" : `${(costVariance * 100).toFixed(1)}% vs prior period`, owner: "Finance Analyst", action: "Confirm payroll cost movement against prior period and GL expectations."
    },
    { check: "Data quality passed", status: issueStatus(dataQualityIssues, missingPayroll + negativePayroll > 0), value: `${dataQualityIssues} source data issues`, owner: "HRIS Analyst", action: "Fix missing payroll rows, negative pay, or missing org data." }
  ];
  const criticalCount = checks.filter((item) => item.status === "Blocked").length;
  const warningCount = checks.filter((item) => item.status === "Review").length;
  const readinessStatus = criticalCount > 0 ? "Blocked" : warningCount > 0 ? "Needs Review" : "Ready";
  const readinessScore = Math.max(0, 100 - criticalCount * 18 - warningCount * 8);
  return checks.map((item) => ({ payPeriod: period, readinessStatus, readinessScore, ...item }));
}

function cellValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || typeof value === "undefined") return "";
  return value;
}

async function workbookBuffer(reportName, rows, metadata) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Payroll Exception Dashboard";
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet("Report");
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const width = Math.max(columns.length, 1);

  worksheet.mergeCells(1, 1, 1, width);
  const title = worksheet.getCell(1, 1);
  title.value = reportName;
  title.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 16 };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1976D2" } };

  let rowNumber = 2;
  Object.entries(metadata).forEach(([key, value]) => {
    worksheet.getCell(rowNumber, 1).value = displayLabel(key);
    worksheet.getCell(rowNumber, 1).font = { bold: true };
    worksheet.getCell(rowNumber, 2).value = String(value ?? "");
    rowNumber += 1;
  });

  rowNumber += 1;
  const header = worksheet.getRow(rowNumber);
  header.values = columns.map(displayLabel);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
  worksheet.views = [{ state: "frozen", ySplit: rowNumber }];

  rows.forEach((row) => {
    const outputRow = worksheet.addRow(columns.map((column) => cellValue(row[column])));
    outputRow.eachCell((cell, index) => {
      const column = columns[index - 1] ?? "";
      if (typeof cell.value === "number" && /(amount|cost|pay|tax|deduction|variance|balance|rate)/i.test(column)) {
        cell.numFmt = "$#,##0.00;[Red]-$#,##0.00";
      }
    });
  });

  if (columns.length > 0) worksheet.autoFilter = { from: { row: rowNumber, column: 1 }, to: { row: rowNumber, column: columns.length } };
  worksheet.columns.forEach((column, index) => {
    const lengths = [displayLabel(columns[index] ?? ""), ...rows.slice(0, 100).map((row) => String(cellValue(row[columns[index]])))].map((value) => value.length);
    column.width = Math.min(Math.max(...lengths, 10) + 2, 36);
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function createReportExport(request, data, actor) {
  const reportType = String(request.reportType ?? "");
  if (!Object.hasOwn(reportNames, reportType)) throw new Error("Unsupported report type");
  const filters = request.filters && typeof request.filters === "object" ? request.filters : {};
  if (!String(filters.payPeriod ?? "").trim()) throw new Error("Pay period is required");
  const rows = reportRows(reportType, filters, data, String(request.employeeId ?? ""), request.thresholds);
  const reportName = reportNames[reportType];
  const fileName = `${safeName(reportName)}-${safeName(filters.payPeriod)}.xlsx`;
  const buffer = await workbookBuffer(reportName, rows, {
    payPeriod: filters.payPeriod,
    company: filters.company ?? "All Companies",
    payGroup: filters.payGroup ?? "All Pay Groups",
    department: filters.department ?? "All Departments",
    generatedBy: actor,
    generatedAt: new Date().toISOString()
  });
  return { buffer, fileName, reportName, rowCount: rows.length };
}

export { reportRows };
