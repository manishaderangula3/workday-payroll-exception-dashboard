import { AlertTriangle, CheckCircle2, Database, UploadCloud, XCircle } from "lucide-react";
import type {
  DataSourceMode,
  UploadDatasetKey,
  UploadedDatasetSummary,
  UploadValidationMessage
} from "../types/dashboard";
import { uploadDatasetLabels } from "../lib/uploadedData";

interface DataSourcePanelProps {
  mode: DataSourceMode;
  messages: UploadValidationMessage[];
  onClearUploads: () => void;
  onFileUpload: (dataset: UploadDatasetKey, file: File) => void;
  onModeChange: (mode: DataSourceMode) => void;
  proxyLoaded: boolean;
  summaries: Partial<Record<UploadDatasetKey, UploadedDatasetSummary>>;
}

const uploadOrder: UploadDatasetKey[] = [
  "workers",
  "payrollResults",
  "timeEntries",
  "deductionResults",
  "taxResults"
];

function formatLoadedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function DataSourcePanel({
  mode,
  messages,
  onClearUploads,
  onFileUpload,
  onModeChange,
  proxyLoaded,
  summaries
}: DataSourcePanelProps) {
  const uploadedCount = Object.keys(summaries).length;
  const errorCount = messages.filter((message) => message.severity === "error").length;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-workday-blue">
            <Database className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Data Source</p>
            <h2 className="text-lg font-semibold text-workday-ink">
              {mode === "sample"
                ? "Sample Workday data"
                : mode === "uploaded"
                  ? "Uploaded Workday exports"
                  : "Backend proxy data"}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Upload CSV exports to replace sample workers, payroll, time, deduction, or tax records. KPIs, tabs,
              charts, filters, and drill-downs recalculate from the active dataset.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className={`h-9 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2 ${
              mode === "sample" ? "bg-workday-blue text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => onModeChange("sample")}
            type="button"
          >
            Sample Data
          </button>
          <button
            className={`h-9 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2 ${
              mode === "uploaded"
                ? "bg-workday-blue text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
            disabled={uploadedCount === 0}
            onClick={() => onModeChange("uploaded")}
            type="button"
          >
            Uploaded Data
          </button>
          <button
            className={`h-9 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2 ${
              mode === "proxy"
                ? "bg-workday-blue text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
            disabled={!proxyLoaded}
            onClick={() => onModeChange("proxy")}
            type="button"
          >
            Backend Proxy
          </button>
          <button
            className="h-9 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={uploadedCount === 0}
            onClick={onClearUploads}
            type="button"
          >
            Clear Uploads
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {uploadOrder.map((dataset) => {
          const summary = summaries[dataset];

          return (
            <label
              className="flex min-h-36 cursor-pointer flex-col justify-between rounded-md border border-slate-200 bg-slate-50 p-3 transition hover:border-workday-blue hover:bg-blue-50"
              key={dataset}
            >
              <span>
                <span className="flex items-center gap-2 text-sm font-semibold text-workday-ink">
                  <UploadCloud className="h-4 w-4 text-workday-blue" aria-hidden="true" />
                  {uploadDatasetLabels[dataset]}
                </span>
                <span className="mt-2 block text-xs leading-5 text-slate-500">
                  CSV with Workday-style headers or dashboard field names.
                </span>
              </span>
              {summary ? (
                <span className="mt-3 rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                  {summary.rowCount} rows loaded from {summary.fileName}
                </span>
              ) : (
                <span className="mt-3 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500">
                  No upload
                </span>
              )}
              {summary ? (
                <span className="mt-2 text-xs text-slate-500">Loaded {formatLoadedAt(summary.loadedAt)}</span>
              ) : null}
              <input
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    onFileUpload(dataset, file);
                    event.currentTarget.value = "";
                  }
                }}
                type="file"
              />
            </label>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-workday-ink">
            <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
            Active Data Status
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {mode === "uploaded"
              ? `${uploadedCount} uploaded dataset${uploadedCount === 1 ? "" : "s"} active. Missing datasets fall back to sample data.`
              : mode === "proxy"
                ? "Backend proxy data is active. Rows are scoped by the signed-in user's role before rendering."
                : "Sample fixtures are active. Upload CSV files or load backend proxy data for real export review."}
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-workday-ink">
            {errorCount > 0 ? (
              <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            )}
            Upload Validation
          </p>
          {messages.length > 0 ? (
            <div className="mt-2 max-h-28 space-y-1 overflow-y-auto">
              {messages.map((message, index) => (
                <p
                  className={`text-sm ${message.severity === "error" ? "text-red-700" : "text-amber-700"}`}
                  key={`${message.dataset}-${message.rowNumber ?? "header"}-${index}`}
                >
                  {uploadDatasetLabels[message.dataset]}: {message.message}
                  {message.rowNumber ? ` Row ${message.rowNumber}.` : ""}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              No validation issues found in the latest upload attempt.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
