import {
  CheckCircle2,
  ClipboardList,
  Download,
  ExternalLink,
  Mail,
  UserRound,
  X
} from "lucide-react";
import { useState } from "react";
import { downloadCsv } from "../lib/csvExport";
import { formatCurrency, formatDateShort, formatHours } from "../lib/formatters";
import { getWorkerSnapshot } from "../lib/workerSnapshot";
import type { DashboardFilters } from "../types/dashboard";
import { StatusBadge } from "./StatusBadge";

interface WorkerDrillDownProps {
  employeeId: string;
  filters: DashboardFilters;
  isAcknowledged: boolean;
  onAcknowledge: (employeeId: string) => void;
  onClose: () => void;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-workday-ink">{value}</p>
    </div>
  );
}

export function WorkerDrillDown({
  employeeId,
  filters,
  isAcknowledged,
  onAcknowledge,
  onClose
}: WorkerDrillDownProps) {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const snapshot = getWorkerSnapshot(employeeId, filters);

  if (!snapshot) {
    return null;
  }

  const { deductions, payroll, taxes, timeEntries, worker } = snapshot;
  const missingDates = timeEntries.flatMap((entry) => entry.missingDates);
  const overtimeHours = timeEntries.reduce((total, entry) => total + entry.overtimeHours, 0);
  const deductionExceptions = deductions.filter((deduction) => deduction.exceptionType !== "None");
  const taxExceptions = taxes.filter((tax) => tax.exceptionType !== "None");

  function handleExportSnapshot() {
    downloadCsv(
      `${employeeId}-worker-snapshot-${filters.payPeriod}.csv`,
      [
        {
          employeeId: worker.employeeId,
          employeeName: worker.employeeName,
          department: worker.department,
          manager: worker.manager,
          payGroup: worker.payGroup,
          payrollStatus: payroll?.payrollStatus ?? "No payroll result",
          grossPay: payroll?.grossPay,
          totalPayrollCost: payroll
            ? payroll.grossPay + payroll.employerBenefitCost + payroll.employerTaxCost
            : undefined,
          overtimeHours,
          missingDates,
          deductionExceptions: deductionExceptions.map((item) => item.exceptionType),
          taxExceptions: taxExceptions.map((item) => item.exceptionType)
        }
      ],
      {
        report: "Worker Payroll Exception Snapshot",
        payPeriod: filters.payPeriod,
        generatedBy: "Payroll Exception Dashboard",
        generatedAt: new Date().toISOString()
      }
    );
    setLastAction("Worker snapshot exported for audit review.");
  }

  return (
    <aside className="rounded-lg border border-slate-200 bg-white shadow-panel">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-50 text-workday-blue">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-workday-ink">{worker.employeeName}</h2>
              <StatusBadge label={worker.employeeId} tone="blue" />
              {isAcknowledged ? <StatusBadge label="Acknowledged" tone="green" /> : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {worker.department} · {worker.payGroup} · {worker.manager}
            </p>
          </div>
        </div>

        <button
          aria-label="Close worker drill-down"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:bg-slate-100"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-[1fr_0.85fr]">
        <section className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <DetailItem label="Payroll Status" value={payroll?.payrollStatus ?? "No result"} />
            <DetailItem label="Gross Pay" value={payroll ? formatCurrency(payroll.grossPay) : "N/A"} />
            <DetailItem
              label="Total Cost"
              value={
                payroll
                  ? formatCurrency(payroll.grossPay + payroll.employerBenefitCost + payroll.employerTaxCost)
                  : "N/A"
              }
            />
            <DetailItem label="Overtime" value={formatHours(overtimeHours)} />
            <DetailItem label="Missing Dates" value={missingDates.length > 0 ? String(missingDates.length) : "None"} />
            <DetailItem label="Tax Form State" value={taxes[0]?.taxFormStatus ?? "Current"} />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-md border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-workday-ink">Time Review</h3>
              <p className="mt-2 text-sm text-slate-600">
                {missingDates.length > 0
                  ? `Missing ${missingDates.map(formatDateShort).join(", ")}`
                  : "No missing time dates for current prompts."}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-workday-ink">Deduction Review</h3>
              <p className="mt-2 text-sm text-slate-600">
                {deductionExceptions.length > 0
                  ? deductionExceptions.map((item) => `${item.exceptionType}: ${item.deductionName}`).join("; ")
                  : "No deduction exceptions."}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-workday-ink">Tax Review</h3>
              <p className="mt-2 text-sm text-slate-600">
                {taxExceptions.length > 0
                  ? taxExceptions.map((item) => `${item.exceptionType}: ${item.taxAuthority}`).join("; ")
                  : "No tax exceptions."}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-workday-ink">
            <ClipboardList className="h-4 w-4 text-workday-blue" aria-hidden="true" />
            Action Workflow
          </h3>
          <div className="mt-4 grid gap-2">
            <a
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-workday-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
              href={`mailto:${worker.managerEmail}?subject=Payroll exception review for ${encodeURIComponent(worker.employeeName)}&body=Please review payroll exceptions for ${encodeURIComponent(worker.employeeName)} in ${encodeURIComponent(filters.payPeriod)}.`}
              onClick={() => setLastAction(`Manager notification prepared for ${worker.manager}.`)}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Notify Manager
            </a>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              onClick={() => setLastAction("Worker time entry review opened in simulated Workday task.")}
              type="button"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open Time Entry
            </button>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              onClick={() => {
                onAcknowledge(employeeId);
                setLastAction("Exception acknowledged for payroll close tracking.");
              }}
              type="button"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Acknowledge Issue
            </button>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              onClick={handleExportSnapshot}
              type="button"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export Snapshot
            </button>
          </div>
          {lastAction ? (
            <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">{lastAction}</p>
          ) : null}
        </section>
      </div>
    </aside>
  );
}
