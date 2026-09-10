import type { ColumnDef } from "@tanstack/react-table";
import { BookOpen, ExternalLink } from "lucide-react";
import {
  getDeductionExceptionReportRows,
  getMissingTimeReportRows,
  getOvertimeReportRows,
  getPayrollCostReportRows,
  getTaxExceptionReportRows
} from "../lib/reportRows";
import { type CsvRow, downloadCsv, sanitizeFileName } from "../lib/csvExport";
import { formatCurrency, formatDateShort, formatHours } from "../lib/formatters";
import type { DashboardData, DashboardFilters, PayrollStatus } from "../types/dashboard";
import type {
  DeductionExceptionReportRow,
  MissingTimeReportRow,
  OvertimeReportRow,
  PayrollCostReportRow,
  TaxExceptionReportRow
} from "../types/reports";
import { ReportTable } from "./ReportTable";
import { StatusBadge } from "./StatusBadge";

interface ReportViewsProps {
  activeTab: string;
  data: DashboardData;
  filters: DashboardFilters;
  acknowledgedCount: number;
  onWorkerSelect: (employeeId: string) => void;
}

function payrollStatusTone(status: PayrollStatus) {
  if (status === "Complete") {
    return "green" as const;
  }

  if (status === "Error") {
    return "red" as const;
  }

  if (status === "Pending") {
    return "amber" as const;
  }

  return "slate" as const;
}

function alertTone(alert: OvertimeReportRow["alert"]) {
  if (alert === "Red") {
    return "red" as const;
  }

  if (alert === "Yellow") {
    return "amber" as const;
  }

  return "green" as const;
}

function varianceTone(value: number): string {
  return value < 0 ? "text-red-700" : value > 0 ? "text-amber-700" : "text-slate-700";
}

function employeeCell(name: string, employeeId: string) {
  return (
    <div>
      <p className="font-semibold text-workday-ink">{name}</p>
      <p className="text-xs text-slate-500">{employeeId}</p>
    </div>
  );
}

function employeeColumn<TData extends { employeeName: string; employeeId: string }>(): ColumnDef<TData> {
  return {
    accessorKey: "employeeName",
    header: "Employee",
    cell: ({ row }) => employeeCell(row.original.employeeName, row.original.employeeId)
  };
}

function exportReport(reportName: string, filters: DashboardFilters, rows: CsvRow[]) {
  downloadCsv(
    `${sanitizeFileName(reportName)}-${sanitizeFileName(filters.payPeriod)}.csv`,
    rows,
    {
      report: reportName,
      payPeriod: filters.payPeriod,
      company: filters.company,
      payGroup: filters.payGroup,
      department: filters.department,
      searchTerm: filters.searchTerm || "None",
      generatedBy: "Payroll Exception Dashboard",
      generatedAt: new Date().toISOString()
    }
  );
}

const payrollCostColumns: ColumnDef<PayrollCostReportRow>[] = [
  {
    accessorKey: "department",
    header: "Department"
  },
  employeeColumn<PayrollCostReportRow>(),
  {
    accessorKey: "payGroup",
    header: "Pay Group"
  },
  {
    accessorKey: "grossPay",
    header: "Gross",
    cell: ({ getValue }) => formatCurrency(getValue<number>())
  },
  {
    accessorKey: "netPay",
    header: "Net",
    cell: ({ getValue }) => formatCurrency(getValue<number>())
  },
  {
    accessorKey: "totalDeductions",
    header: "Deductions",
    cell: ({ getValue }) => formatCurrency(getValue<number>())
  },
  {
    accessorKey: "totalTaxes",
    header: "Taxes",
    cell: ({ getValue }) => formatCurrency(getValue<number>())
  },
  {
    accessorKey: "employerCosts",
    header: "Employer Costs",
    cell: ({ getValue }) => formatCurrency(getValue<number>())
  },
  {
    accessorKey: "totalPayrollCost",
    header: "Total Cost",
    cell: ({ getValue }) => <span className="font-semibold text-workday-ink">{formatCurrency(getValue<number>())}</span>
  },
  {
    accessorKey: "paymentDate",
    header: "Payment Date",
    cell: ({ getValue }) => formatDateShort(getValue<string>())
  },
  {
    accessorKey: "payrollStatus",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<PayrollStatus>();
      return <StatusBadge label={status} tone={payrollStatusTone(status)} />;
    }
  }
];

const overtimeColumns: ColumnDef<OvertimeReportRow>[] = [
  {
    accessorKey: "overtimeHours",
    header: "OT Hours",
    cell: ({ getValue }) => <span className="font-semibold text-workday-ink">{formatHours(getValue<number>())}</span>
  },
  employeeColumn<OvertimeReportRow>(),
  {
    accessorKey: "department",
    header: "Department"
  },
  {
    accessorKey: "manager",
    header: "Manager"
  },
  {
    accessorKey: "scheduledHours",
    header: "Scheduled",
    cell: ({ getValue }) => formatHours(getValue<number>())
  },
  {
    accessorKey: "actualHoursWorked",
    header: "Actual",
    cell: ({ getValue }) => formatHours(getValue<number>())
  },
  {
    accessorKey: "regularHours",
    header: "Regular",
    cell: ({ getValue }) => formatHours(getValue<number>())
  },
  {
    accessorKey: "overtimeCost",
    header: "OT Cost",
    cell: ({ getValue }) => formatCurrency(getValue<number>())
  },
  {
    accessorKey: "weekEndingDate",
    header: "Week Ending",
    cell: ({ getValue }) => formatDateShort(getValue<string>())
  },
  {
    accessorKey: "alert",
    header: "Alert",
    cell: ({ getValue }) => {
      const alert = getValue<OvertimeReportRow["alert"]>();
      return <StatusBadge label={alert} tone={alertTone(alert)} />;
    }
  }
];

const missingTimeColumns: ColumnDef<MissingTimeReportRow>[] = [
  {
    accessorKey: "missingDays",
    header: "Missing Days",
    cell: ({ getValue }) => <span className="font-semibold text-red-700">{getValue<number>()}</span>
  },
  employeeColumn<MissingTimeReportRow>(),
  {
    accessorKey: "department",
    header: "Department"
  },
  {
    accessorKey: "manager",
    header: "Manager"
  },
  {
    accessorKey: "managerEmail",
    header: "Manager Email"
  },
  {
    accessorKey: "workSchedule",
    header: "Schedule"
  },
  {
    accessorKey: "submittedTimeEntryDays",
    header: "Submitted Days"
  },
  {
    accessorKey: "missingDates",
    header: "Missing Dates",
    cell: ({ getValue }) => getValue<string[]>().map(formatDateShort).join(", ")
  },
  {
    accessorKey: "lastSubmissionDate",
    header: "Last Submitted",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value === "No submission" ? value : formatDateShort(value);
    }
  },
  {
    accessorKey: "timeEntryStatus",
    header: "Time Status",
    cell: ({ getValue }) => <StatusBadge label={getValue<string>()} tone="amber" />
  }
];

const deductionColumns: ColumnDef<DeductionExceptionReportRow>[] = [
  {
    accessorKey: "variance",
    header: "Variance",
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return <span className={`font-semibold ${varianceTone(value)}`}>{formatCurrency(value)}</span>;
    }
  },
  employeeColumn<DeductionExceptionReportRow>(),
  {
    accessorKey: "department",
    header: "Department"
  },
  {
    accessorKey: "exceptionType",
    header: "Exception",
    cell: ({ getValue }) => <StatusBadge label={getValue<string>()} tone="red" />
  },
  {
    accessorKey: "deductionName",
    header: "Deduction"
  },
  {
    accessorKey: "deductionCategory",
    header: "Category"
  },
  {
    accessorKey: "expectedAmount",
    header: "Expected",
    cell: ({ getValue }) => formatCurrency(getValue<number>())
  },
  {
    accessorKey: "actualAmountTaken",
    header: "Actual",
    cell: ({ getValue }) => formatCurrency(getValue<number>())
  },
  {
    accessorKey: "arrearsBalance",
    header: "Arrears",
    cell: ({ getValue }) => formatCurrency(getValue<number>())
  },
  {
    accessorKey: "payrollRun",
    header: "Payroll Run"
  }
];

const taxColumns: ColumnDef<TaxExceptionReportRow>[] = [
  {
    accessorKey: "exceptionType",
    header: "Exception",
    cell: ({ getValue }) => <StatusBadge label={getValue<string>()} tone="red" />
  },
  employeeColumn<TaxExceptionReportRow>(),
  {
    accessorKey: "department",
    header: "Department"
  },
  {
    accessorKey: "taxAuthority",
    header: "Tax Authority"
  },
  {
    accessorKey: "taxFormStatus",
    header: "Form Status",
    cell: ({ getValue }) => <StatusBadge label={getValue<string>()} tone="amber" />
  },
  {
    accessorKey: "expectedTax",
    header: "Expected",
    cell: ({ getValue }) => formatCurrency(getValue<number>())
  },
  {
    accessorKey: "actualTax",
    header: "Actual",
    cell: ({ getValue }) => formatCurrency(getValue<number>())
  },
  {
    accessorKey: "variance",
    header: "Variance",
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return <span className={`font-semibold ${varianceTone(value)}`}>{formatCurrency(value)}</span>;
    }
  }
];

function renderDocumentationView() {
  const links = [
    ["Dashboard Overview", "reports/Dashboard_Overview.md"],
    ["Payroll Cost Report", "reports/Payroll_Cost_Report.md"],
    ["Overtime Report", "reports/Overtime_Report.md"],
    ["Missing Time Entries Report", "reports/Missing_Time_Entries_Report.md"],
    ["Deduction Exception Report", "reports/Deduction_Exception_Report.md"],
    ["Tax Exception Report", "reports/Tax_Exception_Report.md"]
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-workday-blue">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-workday-ink">Documentation Library</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            These report tabs are backed by the Workday specifications already documented in the repository.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {links.map(([label, path]) => (
          <a
            className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-workday-ink transition hover:border-workday-blue hover:bg-blue-50"
            href={`/${path}`}
            key={path}
          >
            {label}
            <ExternalLink className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}

export function ReportViews({ acknowledgedCount, activeTab, data, filters, onWorkerSelect }: ReportViewsProps) {
  if (activeTab === "documentation") {
    return renderDocumentationView();
  }

  if (activeTab === "payroll-costs") {
    const rows = getPayrollCostReportRows(filters, data);
    const totals = rows.reduce(
      (summary, row) => ({
        grossPay: summary.grossPay + row.grossPay,
        netPay: summary.netPay + row.netPay,
        totalDeductions: summary.totalDeductions + row.totalDeductions,
        totalTaxes: summary.totalTaxes + row.totalTaxes,
        employerCosts: summary.employerCosts + row.employerCosts,
        totalPayrollCost: summary.totalPayrollCost + row.totalPayrollCost
      }),
      { grossPay: 0, netPay: 0, totalDeductions: 0, totalTaxes: 0, employerCosts: 0, totalPayrollCost: 0 }
    );

    return (
      <ReportTable
        columns={payrollCostColumns}
        data={rows}
        description="Payroll cost detail grouped by department and pay group with preserved payroll status visibility."
        onExport={() => exportReport("Payroll Cost Summary Report", filters, rows as unknown as CsvRow[])}
        onRowSelect={onWorkerSelect}
        rowLabel="payroll result rows"
        summary={[
          { label: "Gross Pay", value: formatCurrency(totals.grossPay) },
          { label: "Employer Costs", value: formatCurrency(totals.employerCosts) },
          { label: "Total Payroll Cost", value: formatCurrency(totals.totalPayrollCost), tone: "bg-blue-50" },
          { label: "Acknowledged", value: String(acknowledgedCount), tone: "bg-green-50" }
        ]}
        title="Payroll Cost Summary Report"
      />
    );
  }

  if (activeTab === "overtime") {
    const rows = getOvertimeReportRows(filters, data);
    const totalHours = rows.reduce((total, row) => total + row.overtimeHours, 0);
    const totalCost = rows.reduce((total, row) => total + row.overtimeCost, 0);
    const redAlerts = rows.filter((row) => row.alert === "Red").length;

    return (
      <ReportTable
        columns={overtimeColumns}
        data={rows}
        description="Non-exempt overtime exceptions sorted by highest overtime hours for manager review."
        initialPageSize={6}
        onExport={() => exportReport("Overtime Hours Exception Report", filters, rows as unknown as CsvRow[])}
        onRowSelect={onWorkerSelect}
        rowLabel="overtime exception rows"
        summary={[
          { label: "OT Hours", value: formatHours(totalHours), tone: "bg-amber-50" },
          { label: "OT Cost", value: formatCurrency(totalCost) },
          { label: "Red Alerts", value: String(redAlerts), tone: "bg-red-50" },
          { label: "Acknowledged", value: String(acknowledgedCount), tone: "bg-green-50" }
        ]}
        title="Overtime Hours Exception Report"
      />
    );
  }

  if (activeTab === "missing-time") {
    const rows = getMissingTimeReportRows(filters, data);
    const totalMissingDays = rows.reduce((total, row) => total + row.missingDays, 0);

    return (
      <ReportTable
        columns={missingTimeColumns}
        data={rows}
        description="Workers with missing required time entries, manager contact fields, and exact missing dates."
        initialPageSize={6}
        onExport={() => exportReport("Missing Time Entries Exception Report", filters, rows as unknown as CsvRow[])}
        onRowSelect={onWorkerSelect}
        rowLabel="missing time exception rows"
        summary={[
          { label: "Workers", value: String(rows.length), tone: "bg-red-50" },
          { label: "Missing Days", value: String(totalMissingDays), tone: "bg-red-50" },
          { label: "Deadline", value: "Aug 23" },
          { label: "Acknowledged", value: String(acknowledgedCount), tone: "bg-green-50" }
        ]}
        title="Missing Time Entries Exception Report"
      />
    );
  }

  if (activeTab === "deductions") {
    const rows = getDeductionExceptionReportRows(filters, data);
    const totalVariance = rows.reduce((total, row) => total + row.variance, 0);
    const arrearsBalance = rows.reduce((total, row) => total + row.arrearsBalance, 0);

    return (
      <ReportTable
        columns={deductionColumns}
        data={rows}
        description="Failed, over-deducted, under-deducted, and arrears items sorted by largest variance."
        initialPageSize={6}
        onExport={() => exportReport("Deduction Exception Report", filters, rows as unknown as CsvRow[])}
        onRowSelect={onWorkerSelect}
        rowLabel="deduction exception rows"
        summary={[
          { label: "Exceptions", value: String(rows.length), tone: "bg-red-50" },
          { label: "Net Variance", value: formatCurrency(totalVariance) },
          { label: "Arrears Balance", value: formatCurrency(arrearsBalance), tone: "bg-amber-50" },
          { label: "Acknowledged", value: String(acknowledgedCount), tone: "bg-green-50" }
        ]}
        title="Deduction Exception Report"
      />
    );
  }

  const rows = getTaxExceptionReportRows(filters, data);
  const totalVariance = rows.reduce((total, row) => total + row.variance, 0);

  return (
    <ReportTable
      columns={taxColumns}
      data={rows}
      description="Tax withholding and tax form exceptions grouped by issue type for compliance review."
      initialPageSize={6}
      onExport={() => exportReport("Tax Exception Report", filters, rows as unknown as CsvRow[])}
      onRowSelect={onWorkerSelect}
      rowLabel="tax exception rows"
      summary={[
        { label: "Exceptions", value: String(rows.length), tone: "bg-red-50" },
        { label: "Tax Variance", value: formatCurrency(totalVariance) },
        { label: "Review Status", value: "Before approval", tone: "bg-amber-50" },
        { label: "Acknowledged", value: String(acknowledgedCount), tone: "bg-green-50" }
      ]}
      title="Tax Exception Report"
    />
  );
}
