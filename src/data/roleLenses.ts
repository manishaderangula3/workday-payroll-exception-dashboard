import type { RoleLens } from "../types/dashboard";

export const roleLenses: RoleLens[] = [
  {
    key: "workday-payroll-analyst",
    title: "Workday Payroll Analyst",
    focus: "Payroll readiness, exception triage, payroll cost checks, and approval support.",
    proofPoints: ["Pay period completion", "Missing time exceptions", "Deduction and tax review"]
  },
  {
    key: "hris-analyst",
    title: "HRIS Analyst",
    focus: "Data quality, worker attributes, organization hierarchy, and security-aware reporting.",
    proofPoints: ["Worker and manager dimensions", "Department prompts", "Role-based access design"]
  },
  {
    key: "workday-functional-analyst",
    title: "Workday Functional Analyst",
    focus: "Business process translation, report requirements, and payroll issue resolution workflows.",
    proofPoints: ["Functional specs", "UAT scenarios", "Manager notification path"]
  },
  {
    key: "payroll-systems-analyst",
    title: "Payroll Systems Analyst",
    focus: "Controls, exceptions, reconciliation, and operating metrics across payroll systems.",
    proofPoints: ["Exception severity", "Audit export", "Deadline countdown"]
  },
  {
    key: "workday-reporting-analyst",
    title: "Workday Reporting Analyst",
    focus: "Advanced report logic, calculated fields, prompts, filters, and dashboard composition.",
    proofPoints: ["Composite dashboard tabs", "Calculated field catalog", "Matrix overtime view"]
  },
  {
    key: "workday-consultant",
    title: "Workday Consultant",
    focus: "End-to-end design narrative from requirements through testing and adoption.",
    proofPoints: ["4-week roadmap", "Stakeholder dashboard", "Production readiness documentation"]
  },
  {
    key: "workday-integration-analyst",
    title: "Workday Integration Analyst",
    focus: "Export-ready datasets, field mappings, and downstream payroll or finance handoff points.",
    proofPoints: ["Excel export", "Report output fields", "Integration-style source mapping"]
  },
  {
    key: "hr-systems-analyst",
    title: "HR Systems Analyst",
    focus: "HR/payroll system alignment, workforce data controls, and manager visibility.",
    proofPoints: ["Organization filters", "Manager view", "Worker exception profile"]
  },
  {
    key: "payroll-operations-analyst",
    title: "Payroll Operations Analyst",
    focus: "Daily exception review, aging issue prioritization, and payroll close support.",
    proofPoints: ["Top exceptions", "Critical alerts", "Open issue counts"]
  }
];
