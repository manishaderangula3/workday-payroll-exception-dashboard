# UAT Sign-Off Packet

## Purpose

This packet provides the final business acceptance structure for the Payroll Exception Dashboard before production release.

## UAT Scope

Included:

- Dashboard overview and KPI validation
- Payroll Cost, Overtime, Missing Time, Deduction, and Tax report validation
- Shared prompts and filters
- Drill-downs and action workflows
- Excel exports
- Role-based access behavior
- Payroll/GL reconciliation evidence review

Excluded:

- Changes to payroll processing calculations outside reporting
- New integrations not included in the approved scope
- Future enhancements outside the release backlog

## Participants

| Role | Responsibility | Sign-Off Required |
| --- | --- | --- |
| Payroll Manager | Validates payroll readiness workflow and approval usability | Yes |
| Payroll Analyst | Validates worker-level payroll details and exceptions | Yes |
| HR Business Partner | Validates organization and worker exception visibility | Yes |
| Department Manager | Validates manager notification and missing time workflows | Yes |
| Finance Analyst | Validates payroll cost and GL reconciliation outputs | Yes |
| Benefits Administrator | Validates deduction exceptions and arrears workflow | Yes |
| Tax Analyst | Validates tax exception logic and withholding issues | Yes |
| Workday Security Admin | Validates access and security restrictions | Yes |
| HRIS/Workday Reporting Analyst | Confirms build readiness and defect disposition | Yes |

## Required Evidence

| Evidence | Owner | Status |
| --- | --- | --- |
| Completed UAT scenario results | UAT Lead | Pending |
| Test case execution summary | QA/Reporting Analyst | Pending |
| Defect log with final dispositions | UAT Lead | Pending |
| Security testing evidence | Security Admin | Pending |
| Payroll/GL reconciliation sign-off | Payroll and Finance | Pending |
| Performance testing results | Reporting/Systems Analyst | Pending |
| Production migration approval | Payroll Product Owner | Pending |

## Business Acceptance Checklist

| Area | Acceptance Criteria | Status | Notes |
| --- | --- | --- | --- |
| Dashboard overview | KPIs are accurate and understandable for daily payroll review | Pending |  |
| Payroll cost report | Totals match payroll control reports and GL reconciliation | Pending |  |
| Overtime report | Non-exempt overtime and cost calculations are accurate | Pending |  |
| Missing time report | Missing entries exclude approved PTO, holidays, and leave | Pending |  |
| Deduction report | Failed, over, under, and arrears exceptions are correctly classified | Pending |  |
| Tax report | Withholding, tax form, and jurisdiction exceptions are correctly flagged | Pending |  |
| Shared prompts | Pay Period, Company, Pay Group, and Department filter reports consistently | Pending |  |
| Drill-downs | Worker details open only for authorized users | Pending |  |
| Exports | Excel/CSV outputs match on-screen data and security scope | Pending |  |
| Security | Role-based visibility matches approved access matrix | Pending |  |
| Performance | Reports meet agreed timing targets | Pending |  |

## Defect Acceptance Rules

| Severity | Release Rule |
| --- | --- |
| Critical | Must be fixed and verified before go-live |
| High | Must be fixed or have written business approval to defer |
| Medium | May go live with documented workaround and owner approval |
| Low | May go live if cosmetic or minor usability issue is accepted |

## Final Sign-Off

By signing, each approver confirms that the Payroll Exception Dashboard is acceptable for production use within their area of responsibility, subject to the documented defect disposition and release notes.

| Approver Role | Name | Approval Status | Signature | Date | Notes |
| --- | --- | --- | --- | --- | --- |
| Payroll Manager |  | Pending |  |  |  |
| Payroll Analyst |  | Pending |  |  |  |
| HR Business Partner |  | Pending |  |  |  |
| Department Manager |  | Pending |  |  |  |
| Finance Analyst |  | Pending |  |  |  |
| Benefits Administrator |  | Pending |  |  |  |
| Tax Analyst |  | Pending |  |  |  |
| Workday Security Admin |  | Pending |  |  |  |
| HRIS/Workday Reporting Analyst |  | Pending |  |  |  |
| Payroll Product Owner |  | Pending |  |  | Final release approval |

## Go-Live Recommendation

| Decision | Criteria |
| --- | --- |
| Approve | All required sign-offs complete, no open Critical defects, High defects fixed or approved |
| Conditional approval | No Critical defects, High defects have accepted workaround and owner |
| Do not approve | Any Critical defect remains or reconciliation/security evidence is incomplete |

