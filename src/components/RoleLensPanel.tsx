import { ArrowRight, BriefcaseBusiness, CheckCircle2, Presentation } from "lucide-react";
import type { RoleKey } from "../types/dashboard";
import { roleLenses } from "../data/roleLenses";

interface RoleLensPanelProps {
  activeRole: RoleKey;
  onRoleChange: (role: RoleKey) => void;
  onTabChange: (tabId: string) => void;
}

export function RoleLensPanel({ activeRole, onRoleChange, onTabChange }: RoleLensPanelProps) {
  const selectedRole = roleLenses.find((role) => role.key === activeRole) ?? roleLenses[0];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-workday-blue">
            <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Presentation Lens</p>
            <h2 className="text-lg font-semibold text-workday-ink">{selectedRole.title}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{selectedRole.focus}</p>
          </div>
        </div>

        <label className="flex min-w-64 flex-col gap-1 text-sm font-medium text-slate-700">
          Target Role
          <select
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-workday-blue focus:outline-none focus:ring-1 focus:ring-workday-blue"
            value={activeRole}
            onChange={(event) => onRoleChange(event.target.value as RoleKey)}
          >
            {roleLenses.map((role) => (
              <option key={role.key} value={role.key}>
                {role.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_0.85fr]">
        <div className="rounded-md bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-workday-ink">
            <Presentation className="h-4 w-4 text-workday-blue" aria-hidden="true" />
            Interview Pitch
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{selectedRole.interviewPitch}</p>
          <p className="mt-3 text-xs font-semibold uppercase text-slate-500">Portfolio Value</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{selectedRole.presentationValue}</p>
        </div>

        <div className="rounded-md bg-slate-50 p-4">
          <p className="text-sm font-semibold text-workday-ink">Workflow to Demonstrate</p>
          <div className="mt-3 space-y-2">
            {selectedRole.workflow.map((step, index) => (
              <div className="flex items-start gap-2 text-sm text-slate-600" key={step}>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white text-xs font-semibold text-workday-blue">
                  {index + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md bg-slate-50 p-4">
          <p className="text-sm font-semibold text-workday-ink">Best Tabs for This Role</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedRole.primaryTabs.map((tab) => (
              <button
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-white px-2.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-workday-blue focus:outline-none focus:ring-2 focus:ring-workday-blue"
                key={tab.tabId}
                onClick={() => onTabChange(tab.tabId)}
                type="button"
              >
                {tab.label}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Proof Points</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedRole.proofPoints.map((point) => (
              <span
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                key={point}
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Metrics to Watch</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedRole.metricsToWatch.map((metric) => (
              <span
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                key={metric}
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {metric}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
