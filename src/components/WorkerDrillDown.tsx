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
import { sanitizeFileName } from "../lib/csvExport";
import { downloadXlsx } from "../lib/excelExport";
import { getEffectiveMissingDates } from "../lib/calculations";
import { formatCurrency, formatDateShort, formatHours } from "../lib/formatters";
import { getWorkerSnapshot } from "../lib/workerSnapshot";
import { createWorkdayInboxTask, downloadBackendReport } from "../lib/backendApi";
import type { DashboardData, DashboardFilters } from "../types/dashboard";
import { StatusBadge } from "./StatusBadge";

interface WorkerDrillDownProps {
  data: DashboardData;
  employeeId: string;
  filters: DashboardFilters;
  canExport: boolean;
  canCreateWorkdayTask: boolean;
  useServerExport: boolean;
  isAcknowledged: boolean;
  onAcknowledge: (employeeId: string) => void | Promise<void>;
  onClose: () => void;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="dashboard-panel-muted p-3">
      <p className="mini-label">{label}</p>
      <p className="mt-1 text-sm font-semibold text-workday-ink">{value}</p>
    </div>
  );
}

export function WorkerDrillDown({
  employeeId,
  canExport,
  canCreateWorkdayTask,
  data,
  filters,
  isAcknowledged,
  onAcknowledge,
  onClose,
  useServerExport
}: WorkerDrillDownProps) {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const snapshot = getWorkerSnapshot(employeeId, filters, data);

  if (!snapshot) {
    return null;
  }

  const { deductions, payroll, taxes, timeEntries, worker } = snapshot;
  const missingDates = [...new Set(timeEntries.flatMap(getEffectiveMissingDates))];
  const overtimeHours = timeEntries.reduce((total, entry) => total + entry.overtimeHours, 0);
  const deductionExceptions = deductions.filter((deduction) => deduction.exceptionType !== "None");
  const taxExceptions = taxes.filter((tax) => tax.exceptionType !== "None");
  const timeEntryUrl = timeEntries.map((entry) => entry.timeEntryUrl).find((url) => url?.startsWith("https://"));

  async function handleExportSnapshot() {
    if (useServerExport) {
      await downloadBackendReport("worker-snapshot", filters, employeeId);
      setLastAction("Worker snapshot exported by the secured backend and added to the audit trail.");
      return;
    }

    await downloadXlsx(
      `${sanitizeFileName(employeeId)}-worker-snapshot-${sanitizeFileName(filters.payPeriod)}.xlsx`,
      "Worker Payroll Exception Snapshot",
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

  async function handleAcknowledge() {
    try {
      await onAcknowledge(employeeId);
      setLastAction("Exception acknowledged and written to payroll close tracking.");
    } catch (error) {
      setLastAction(error instanceof Error ? error.message : "Unable to acknowledge this exception.");
    }
  }

  async function handleCreateWorkdayTask() {
    try {
      await createWorkdayInboxTask(employeeId, filters.payPeriod);
      setLastAction("Workday Inbox task created and added to the audit trail.");
    } catch (error) {
      setLastAction(error instanceof Error ? error.message : "Unable to create the Workday Inbox task.");
    }
  }

  return (
    <aside className="dashboard-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-white via-slate-50 to-blue-50/60 p-5 lg:flex-row lg:items-start lg:justify-between">
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
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:border-workday-blue hover:bg-blue-50 hover:text-workday-blue"
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
            <div className="dashboard-panel-muted p-4">
              <h3 className="text-sm font-semibold text-workday-ink">Time Review</h3>
              <p className="mt-2 text-sm text-slate-600">
                {missingDates.length > 0
                  ? `Missing ${missingDates.map(formatDateShort).join(", ")}`
                  : "No missing time dates for current prompts."}
              </p>
            </div>
            <div className="dashboard-panel-muted p-4">
              <h3 className="text-sm font-semibold text-workday-ink">Deduction Review</h3>
              <p className="mt-2 text-sm text-slate-600">
                {deductionExceptions.length > 0
                  ? deductionExceptions.map((item) => `${item.exceptionType}: ${item.deductionName}`).join("; ")
                  : "No deduction exceptions."}
              </p>
            </div>
            <div className="dashboard-panel-muted p-4">
              <h3 className="text-sm font-semibold text-workday-ink">Tax Review</h3>
              <p className="mt-2 text-sm text-slate-600">
                {taxExceptions.length > 0
                  ? taxExceptions.map((item) => `${item.exceptionType}: ${item.taxAuthority}`).join("; ")
                  : "No tax exceptions."}
              </p>
            </div>
          </div>
        </section>

        <section className="dashboard-panel-muted p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-workday-ink">
            <ClipboardList className="h-4 w-4 text-workday-blue" aria-hidden="true" />
            Action Workflow
          </h3>
          <div className="mt-4 grid gap-2">
            <a
              className="primary-action"
              href={`mailto:${worker.managerEmail}?subject=Payroll exception review for ${encodeURIComponent(worker.employeeName)}&body=Please review payroll exceptions for ${encodeURIComponent(worker.employeeName)} in ${encodeURIComponent(filters.payPeriod)}.`}
              onClick={() => setLastAction(`Manager notification prepared for ${worker.manager}.`)}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Notify Manager
            </a>
            {timeEntryUrl ? (
              <a className="secondary-action" href={timeEntryUrl} rel="noreferrer" target="_blank">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open Time Entry
              </a>
            ) : (
              <button className="secondary-action" disabled title="No Workday time-entry URL was supplied" type="button">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Time Entry Link Unavailable
              </button>
            )}
            {canCreateWorkdayTask ? (
              <button className="secondary-action" onClick={() => void handleCreateWorkdayTask()} type="button">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                Create Workday Inbox Task
              </button>
            ) : null}
            <button
              className="secondary-action"
              disabled={isAcknowledged}
              onClick={() => void handleAcknowledge()}
              type="button"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Acknowledge Issue
            </button>
            {canExport ? (
              <button className="secondary-action" onClick={() => void handleExportSnapshot()} type="button">
                <Download className="h-4 w-4" aria-hidden="true" />
                Export Snapshot
              </button>
            ) : null}
          </div>
          {lastAction ? (
            <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">{lastAction}</p>
          ) : null}
        </section>
      </div>
    </aside>
  );
}
