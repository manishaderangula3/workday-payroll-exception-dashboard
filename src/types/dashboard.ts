export type RoleKey =
  | "workday-payroll-analyst"
  | "hris-analyst"
  | "workday-functional-analyst"
  | "payroll-systems-analyst"
  | "workday-reporting-analyst"
  | "workday-consultant"
  | "workday-integration-analyst"
  | "hr-systems-analyst"
  | "payroll-operations-analyst";

export interface RoleLens {
  key: RoleKey;
  title: string;
  focus: string;
  proofPoints: string[];
}

export interface DashboardTab {
  id: string;
  label: string;
  badge?: number;
}

export type Severity = "success" | "warning" | "critical" | "neutral";

export interface KpiCard {
  label: string;
  value: string;
  detail: string;
  severity: Severity;
  trend: string;
}
