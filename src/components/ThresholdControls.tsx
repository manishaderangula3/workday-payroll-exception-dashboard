import { Gauge, RotateCcw } from "lucide-react";
import type { DashboardThresholds } from "../types/dashboard";

interface ThresholdControlsProps {
  onReset: () => void;
  onThresholdChange: (updates: Partial<DashboardThresholds>) => void;
  thresholds: DashboardThresholds;
}

interface NumberControl {
  field: keyof DashboardThresholds;
  label: string;
  suffix: string;
  min: number;
  max: number;
  step: number;
  kind: "percent" | "number";
}

const controls: NumberControl[] = [
  {
    field: "payrollCostVarianceWarning",
    label: "Cost variance alert",
    suffix: "%",
    min: 0,
    max: 25,
    step: 0.5,
    kind: "percent"
  },
  {
    field: "completionYellow",
    label: "Completion yellow",
    suffix: "%",
    min: 0,
    max: 100,
    step: 1,
    kind: "percent"
  },
  {
    field: "completionRed",
    label: "Completion red",
    suffix: "%",
    min: 0,
    max: 100,
    step: 1,
    kind: "percent"
  },
  {
    field: "exceptionRed",
    label: "Exception red",
    suffix: "workers",
    min: 0,
    max: 50,
    step: 1,
    kind: "number"
  },
  {
    field: "missingTimeRed",
    label: "Missing time red",
    suffix: "workers",
    min: 0,
    max: 50,
    step: 1,
    kind: "number"
  },
  {
    field: "overtimeWarningHours",
    label: "OT warning",
    suffix: "hours",
    min: 0,
    max: 200,
    step: 1,
    kind: "number"
  },
  {
    field: "overtimeCriticalHours",
    label: "OT critical",
    suffix: "hours",
    min: 0,
    max: 200,
    step: 1,
    kind: "number"
  }
];

function getDisplayValue(thresholds: DashboardThresholds, control: NumberControl) {
  const value = thresholds[control.field];

  return control.kind === "percent" ? Number((value * 100).toFixed(2)) : value;
}

export function ThresholdControls({ onReset, onThresholdChange, thresholds }: ThresholdControlsProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <Gauge className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Dynamic KPI Thresholds</p>
            <h2 className="text-lg font-semibold text-workday-ink">Live calculation controls</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Adjust alert thresholds to show how payroll KPIs, severity colors, and target labels recalculate without
              changing the underlying worker data.
            </p>
          </div>
        </div>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2"
          onClick={onReset}
          type="button"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {controls.map((control) => (
          <label className="rounded-md border border-slate-200 bg-slate-50 p-3" key={control.field}>
            <span className="block text-xs font-semibold uppercase text-slate-500">{control.label}</span>
            <span className="mt-2 flex items-center gap-2">
              <input
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm font-semibold text-workday-ink focus:border-workday-blue focus:outline-none focus:ring-1 focus:ring-workday-blue"
                max={control.max}
                min={control.min}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  onThresholdChange({
                    [control.field]: control.kind === "percent" ? nextValue / 100 : nextValue
                  });
                }}
                step={control.step}
                type="number"
                value={getDisplayValue(thresholds, control)}
              />
              <span className="min-w-12 text-xs font-medium text-slate-500">{control.suffix}</span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
