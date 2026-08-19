import { useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { DashboardShell } from "./components/DashboardShell";
import { RoleLensPanel } from "./components/RoleLensPanel";
import type { RoleKey } from "./types/dashboard";

export function App() {
  const [payPeriod, setPayPeriod] = useState("2026-08-15 Semi-Monthly");
  const [department, setDepartment] = useState("All Departments");
  const [activeRole, setActiveRole] = useState<RoleKey>("workday-payroll-analyst");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader
        department={department}
        onDepartmentChange={setDepartment}
        onPayPeriodChange={setPayPeriod}
        payPeriod={payPeriod}
      />

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        <RoleLensPanel activeRole={activeRole} onRoleChange={setActiveRole} />
        <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-panel">
          Viewing <span className="font-semibold text-workday-ink">{payPeriod}</span> for{" "}
          <span className="font-semibold text-workday-ink">{department}</span>
        </section>
        <DashboardShell activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
}
