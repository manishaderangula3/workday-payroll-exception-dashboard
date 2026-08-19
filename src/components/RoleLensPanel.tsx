import { BriefcaseBusiness } from "lucide-react";
import type { RoleKey } from "../types/dashboard";
import { roleLenses } from "../data/roleLenses";

interface RoleLensPanelProps {
  activeRole: RoleKey;
  onRoleChange: (role: RoleKey) => void;
}

export function RoleLensPanel({ activeRole, onRoleChange }: RoleLensPanelProps) {
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

      <div className="mt-4 flex flex-wrap gap-2">
        {selectedRole.proofPoints.map((point) => (
          <span
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
            key={point}
          >
            {point}
          </span>
        ))}
      </div>
    </section>
  );
}
