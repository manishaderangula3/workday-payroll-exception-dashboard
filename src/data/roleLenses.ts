import type { RoleLens } from "../types/dashboard";

export const roleLenses: RoleLens[] = [
  {
    key: "workday-payroll-analyst",
    title: "Workday Payroll Analyst",
    focus: "Payroll readiness, exception triage, payroll cost checks, and approval support.",
    proofPoints: ["Pay period completion", "Missing time exceptions", "Deduction and tax review"],
    interviewPitch:
      "I built this view to help payroll teams identify blockers before approval and reduce manual spreadsheet review.",
    primaryTabs: [
      { tabId: "overview", label: "Overview" },
      { tabId: "readiness", label: "Readiness" },
      { tabId: "missing-time", label: "Missing Time" },
    ],
    metricsToWatch: ["Readiness Score", "Payroll Completion", "Workers with Exceptions", "Missing Time"],
    workflow: ["Run shared prompts", "Check readiness decision", "Review red exceptions", "Acknowledge or notify manager"],
    presentationValue: "Shows daily payroll close readiness and exception ownership."
  },
  {
    key: "hris-analyst",
    title: "HRIS Analyst",
    focus: "Data quality, worker attributes, organization hierarchy, and security-aware reporting.",
    proofPoints: ["Worker and manager dimensions", "Department prompts", "Role-based access design"],
    interviewPitch:
      "I modeled the dashboard around clean worker master data, organizational filters, and manager visibility.",
    primaryTabs: [
      { tabId: "overview", label: "Overview" },
      { tabId: "missing-time", label: "Missing Time" },
      { tabId: "documentation", label: "Documentation" }
    ],
    metricsToWatch: ["Active workers", "Department filters", "Manager assignments", "Missing dates"],
    workflow: ["Validate worker population", "Filter by organization", "Check manager contact fields", "Confirm exclusions"],
    presentationValue: "Highlights HRIS data governance and payroll-facing worker data quality."
  },
  {
    key: "workday-functional-analyst",
    title: "Workday Functional Analyst",
    focus: "Business process translation, report requirements, and payroll issue resolution workflows.",
    proofPoints: ["Functional specs", "UAT scenarios", "Manager notification path"],
    interviewPitch:
      "I translated payroll close requirements into dashboards, prompts, calculated logic, test scenarios, and action paths.",
    primaryTabs: [
      { tabId: "overview", label: "Overview" },
      { tabId: "overtime", label: "Overtime" },
      { tabId: "documentation", label: "Documentation" }
    ],
    metricsToWatch: ["Exception mix", "Payroll deadline", "Alert thresholds", "Acknowledged issues"],
    workflow: ["Confirm requirement", "Review output", "Trace to specification", "Validate UAT scenario"],
    presentationValue: "Connects business requirements to configurable Workday-style reporting behavior."
  },
  {
    key: "payroll-systems-analyst",
    title: "Payroll Systems Analyst",
    focus: "Controls, exceptions, reconciliation, and operating metrics across payroll systems.",
    proofPoints: ["Exception severity", "Audit export", "Deadline countdown"],
    interviewPitch:
      "I designed the dashboard as an operating control for payroll close, with exception status, audit export, and drill-down review.",
    primaryTabs: [
      { tabId: "overview", label: "Overview" },
      { tabId: "readiness", label: "Readiness" },
      { tabId: "payroll-costs", label: "Payroll Costs" },
    ],
    metricsToWatch: ["Readiness Score", "Total Payroll Cost", "Payroll Status", "Tax variance"],
    workflow: ["Check approval blockers", "Review status exceptions", "Export readiness", "Document acknowledgement"],
    presentationValue: "Demonstrates payroll systems controls and reconciliation readiness."
  },
  {
    key: "workday-reporting-analyst",
    title: "Workday Reporting Analyst",
    focus: "Advanced report logic, calculated fields, prompts, filters, and dashboard composition.",
    proofPoints: ["Composite dashboard tabs", "Calculated field catalog", "Matrix overtime view"],
    interviewPitch:
      "I created Workday-style report outputs and connected them through shared prompts, dynamic tab badges, and reusable row builders.",
    primaryTabs: [
      { tabId: "overview", label: "Overview" },
      { tabId: "payroll-costs", label: "Payroll Costs" },
      { tabId: "overtime", label: "Overtime Matrix" }
    ],
    metricsToWatch: ["Shared prompts", "Tab badges", "Calculated KPIs", "Sortable report tables"],
    workflow: ["Select prompts", "Validate badge counts", "Open detail tab", "Compare to report specification"],
    presentationValue: "Proves reporting design, calculated logic, and dashboard composition skills."
  },
  {
    key: "workday-consultant",
    title: "Workday Consultant",
    focus: "End-to-end design narrative from requirements through testing and adoption.",
    proofPoints: ["4-week roadmap", "Stakeholder dashboard", "Production readiness documentation"],
    interviewPitch:
      "I can walk stakeholders from payroll pain point to solution design, build plan, UAT, adoption, and portfolio demo.",
    primaryTabs: [
      { tabId: "overview", label: "Executive View" },
      { tabId: "readiness", label: "Readiness" },
      { tabId: "documentation", label: "Documentation" },
    ],
    metricsToWatch: ["Business value", "Exception trend", "Readiness status", "Documentation traceability"],
    workflow: ["Frame the problem", "Show the dashboard", "Open proof documents", "Explain deployment readiness"],
    presentationValue: "Positions the dashboard as an end-to-end Workday consulting case study."
  },
  {
    key: "workday-integration-analyst",
    title: "Workday Integration Analyst",
    focus: "Export-ready datasets, field mappings, and downstream payroll or finance handoff points.",
    proofPoints: ["CSV export", "Report output fields", "Integration-style source mapping"],
    interviewPitch:
      "I structured report rows so they can support audit exports, downstream file handoffs, and future Workday RaaS simulation.",
    primaryTabs: [
      { tabId: "payroll-costs", label: "Payroll Costs" },
      { tabId: "tax-issues", label: "Tax Issues" },
      { tabId: "documentation", label: "Documentation" }
    ],
    metricsToWatch: ["Export columns", "Generated metadata", "Source mappings", "Worker keys"],
    workflow: ["Filter dataset", "Export current view", "Validate employee IDs", "Map downstream fields"],
    presentationValue: "Shows how reporting output can feed controlled integration-style handoffs."
  },
  {
    key: "hr-systems-analyst",
    title: "HR Systems Analyst",
    focus: "HR/payroll system alignment, workforce data controls, and manager visibility.",
    proofPoints: ["Organization filters", "Manager view", "Worker exception profile"],
    interviewPitch:
      "I use the dashboard to show how HR data quality directly affects payroll operations and manager follow-up.",
    primaryTabs: [
      { tabId: "overview", label: "Overview" },
      { tabId: "missing-time", label: "Missing Time" },
      { tabId: "overtime", label: "Overtime" }
    ],
    metricsToWatch: ["Department exceptions", "Manager email", "Work schedule", "Worker profile"],
    workflow: ["Filter by HR organization", "Open worker detail", "Confirm manager data", "Review time status"],
    presentationValue: "Connects HR systems data stewardship with payroll operational outcomes."
  },
  {
    key: "payroll-operations-analyst",
    title: "Payroll Operations Analyst",
    focus: "Daily exception review, aging issue prioritization, and payroll close support.",
    proofPoints: ["Top exceptions", "Critical alerts", "Open issue counts"],
    interviewPitch:
      "I designed this as a daily operations cockpit for prioritizing urgent payroll close issues.",
    primaryTabs: [
      { tabId: "overview", label: "Overview" },
      { tabId: "readiness", label: "Readiness" },
      { tabId: "overtime", label: "Overtime" },
    ],
    metricsToWatch: ["Readiness Score", "Red alerts", "Top exception workers", "Deadline"],
    workflow: ["Start with readiness blockers", "Sort by severity", "Notify owners", "Track acknowledgement"],
    presentationValue: "Shows practical close-cycle triage and action tracking."
  }
];
