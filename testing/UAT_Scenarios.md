# UAT Scenarios

## 1. UAT Overview

| Item | Specification |
| --- | --- |
| UAT Name | Payroll Exception Dashboard User Acceptance Testing |
| Purpose | Confirm that payroll stakeholders can use the dashboard and reports to review payroll readiness, identify exceptions, resolve issues, export evidence, and approve payroll with confidence. |
| Scope | Dashboard Overview, Composite Dashboard tabs, Payroll Cost Report, Overtime Report, Missing Time Entries Report, Deduction Exception Report, Tax Exception Report, KPI definitions, exports, drill-downs, notifications, and role-based access. |
| Out of Scope | Workday delivered payroll engine validation, payroll policy redesign, production data correction, and external system remediation. |
| UAT Timeline | Recommended 5 business days: Day 1 orientation and smoke test, Days 2-4 scenario execution, Day 5 defect retest and sign-off. |
| UAT Environment | Workday implementation or sandbox tenant with representative payroll, time tracking, benefits, tax, worker, organization, and security data. |
| Entry Criteria | QA test cases passed for Critical and High items; UAT users provisioned; test data loaded; source reports and composite dashboard available. |
| Exit Criteria | All required UAT scenarios pass or have approved workaround; Critical defects resolved; business sign-off captured. |

## 2. UAT Participants

| Name/Role | Department | Test Scenarios Assigned |
| --- | --- | --- |
| Payroll Manager | Payroll Operations | Scenario 1, Scenario 2, Scenario 4, Scenario 10 |
| Payroll Administrator | Payroll Operations | Scenario 1, Scenario 4, Scenario 6, Scenario 10 |
| HR Business Partner | Human Resources | Scenario 1, Scenario 3, Scenario 8 |
| Finance Analyst | Finance | Scenario 5, Scenario 10 |
| Department Manager | Operations or Business Unit | Scenario 2, Scenario 3, Scenario 8, Scenario 9 |
| Benefits Administrator | Benefits | Scenario 6, Scenario 10 |
| Payroll Tax Analyst | Payroll Tax | Scenario 7, Scenario 10 |
| Security Administrator | HRIS or Workday Security | Scenario 8 |

## 3. Sign-off Criteria

| Area | Required Outcome |
| --- | --- |
| Business Fit | Users confirm the dashboard supports payroll close and daily exception review. |
| Accuracy | KPI values, report totals, exception counts, and exports match source payroll data and expected results. |
| Workflow | Users can identify exceptions, drill into details, assign follow-up, and confirm resolution. |
| Security | Users see only the workers, fields, tabs, and exports appropriate to their role. |
| Performance | Dashboard and report response times are acceptable for payroll processing windows. |
| Documentation | Users confirm report purpose, filters, and action workflow are understandable. |
| Defects | No open Critical defects; High defects resolved or accepted with documented workaround. |

## 4. UAT Scenarios

### Scenario 1: Daily Payroll Review

| Field | Detail |
| --- | --- |
| Primary Role | Payroll Manager |
| Business Goal | Review current payroll readiness from one dashboard view. |
| Scenario | As a Payroll Manager, I open the dashboard on Monday morning to review the current pay period's completion status and identify departments with pending issues. |
| Preconditions | Current pay period payroll has been calculated; exceptions exist across at least two categories. |
| Steps | Open the Payroll Exception Dashboard; confirm Pay Period prompt defaults correctly; review KPI cards; review exception breakdown; identify departments with pending issues; drill down to a worker exception. |
| Expected Result | Dashboard opens successfully; completion status is visible; exception categories and departments are accurate; drill-down opens the correct worker detail or report. |
| Pass/Fail Criteria | Pass if dashboard values match payroll system and the Payroll Manager can identify and open specific worker exceptions. |

### Scenario 2: Overtime Management

| Field | Detail |
| --- | --- |
| Primary Role | Payroll Manager |
| Business Goal | Identify excessive overtime before payroll approval. |
| Scenario | As a Payroll Manager, I need to identify workers with excessive overtime and notify department managers before approval. |
| Preconditions | Non-exempt workers have overtime entries; at least one worker exceeds red threshold. |
| Steps | Open dashboard; navigate to Overtime tab; confirm workers are sorted by highest OT hours; filter by department; review overtime cost; open worker detail. |
| Expected Result | OT hours match time system; OT cost calculates correctly; red and yellow flags display accurately; department filter limits rows. |
| Pass/Fail Criteria | Pass if overtime rows, totals, cost, sorting, filtering, and drill-down behavior are accurate. |

### Scenario 3: Missing Time Resolution

| Field | Detail |
| --- | --- |
| Primary Role | Department Manager |
| Business Goal | Resolve missing time before payroll cutoff. |
| Scenario | As a Manager, I receive a notification about missing time entries and need to see which workers and dates require action. |
| Preconditions | Manager has direct reports with missing time; notification or report link is available. |
| Steps | Open Missing Time report from notification or dashboard; confirm report is filtered to manager's team; review missing workers and dates; use manager email or contact workflow; open worker time entry detail. |
| Expected Result | Missing time accurately reflects unsubmitted entries; approved PTO is excluded; manager sees only authorized workers. |
| Pass/Fail Criteria | Pass if manager can identify missing dates, contact workers, and access only authorized team records. |

### Scenario 4: Pre-Approval Checklist

| Field | Detail |
| --- | --- |
| Primary Role | Payroll Manager |
| Business Goal | Confirm payroll is ready for approval or identify unresolved exceptions. |
| Scenario | As a Payroll Manager, before approving payroll I check all exception reports and export evidence for audit documentation. |
| Preconditions | Payroll calculation completed; dashboard and all tabs available. |
| Steps | Open composite dashboard; review Overview tab; open each detail tab; confirm all exceptions are zero, resolved, or acknowledged; export summary. |
| Expected Result | Dashboard shows real-time status; all exception categories are clear or documented; export works correctly. |
| Pass/Fail Criteria | Pass if Payroll Manager can complete the review and produce an accurate export for audit support. |

### Scenario 5: Month-End Reporting

| Field | Detail |
| --- | --- |
| Primary Role | Finance Analyst |
| Business Goal | Use payroll cost data for month-end close analysis. |
| Scenario | As a Finance Analyst, I need payroll cost data for month-end close and want to export it for analysis. |
| Preconditions | Payroll cost data exists for the full month; Finance Analyst has approved access. |
| Steps | Open Payroll Costs tab or Payroll Cost Report; select month or relevant pay periods; review department and pay group totals; export to Excel; compare to general ledger or payroll register. |
| Expected Result | Totals match payroll register and general ledger expectations within approved tolerance; export preserves formatting. |
| Pass/Fail Criteria | Pass if cost totals, prompts, grouping, and export meet Finance needs. |

### Scenario 6: Deduction Issue Resolution

| Field | Detail |
| --- | --- |
| Primary Role | Benefits Administrator |
| Business Goal | Review and resolve benefit deduction issues before payroll approval. |
| Scenario | As a Benefits Administrator, I need to identify failed, over-deducted, under-deducted, and arrears deductions and determine the next action. |
| Preconditions | Deduction exceptions exist for benefit and non-benefit deductions. |
| Steps | Open Deductions tab; filter by Exception Type; review expected amount, actual amount, variance, and arrears balance; drill into benefit election; document resolution action. |
| Expected Result | Deduction exceptions are classified correctly; variance and arrears are accurate; benefit election drill-down works for authorized users. |
| Pass/Fail Criteria | Pass if Benefits Administrator can identify the cause and next action for each deduction exception. |

### Scenario 7: Tax Exception Review

| Field | Detail |
| --- | --- |
| Primary Role | Payroll Tax Analyst |
| Business Goal | Identify payroll tax exceptions before approval or filing. |
| Scenario | As a Payroll Tax Analyst, I need to review missing withholding, over-withholding, under-withholding, and invalid jurisdiction issues. |
| Preconditions | Tax exceptions exist for federal, state, local, or jurisdiction scenarios. |
| Steps | Open Tax Issues tab; filter by Tax Type and Exception Type; review tax authority, expected tax, actual tax, and variance; drill into worker tax election or jurisdiction setup. |
| Expected Result | Tax exceptions are classified correctly; jurisdiction mismatch is visible; drill-down opens authorized tax details. |
| Pass/Fail Criteria | Pass if Payroll Tax Analyst can validate issue type and determine required correction. |

### Scenario 8: Security Validation by Role

| Field | Detail |
| --- | --- |
| Primary Role | Security Administrator |
| Business Goal | Confirm users only see data appropriate to their role. |
| Scenario | As a Security Administrator, I need to confirm Payroll, HR, Manager, Finance, Benefits, and Tax users have correct access. |
| Preconditions | Test users exist for each role with representative organization assignments. |
| Steps | Log in or proxy as each role; open dashboard; review visible tabs, rows, worker details, drill-downs, and exports. |
| Expected Result | Payroll users see authorized payroll scope; managers see only direct or organization-authorized workers; unauthorized users cannot access dashboard. |
| Pass/Fail Criteria | Pass if all role-based access and export restrictions behave as expected. |

### Scenario 9: Mobile Access for Manager Follow-up

| Field | Detail |
| --- | --- |
| Primary Role | Department Manager |
| Business Goal | Review urgent exceptions from a mobile device. |
| Scenario | As a Department Manager, I need to open the dashboard or report on mobile and quickly identify actions for my team. |
| Preconditions | Mobile Workday access available; manager has direct reports with exceptions. |
| Steps | Open dashboard on mobile; review KPI cards or alert list; open Missing Time or Overtime details; verify simplified table is readable; open drill-down. |
| Expected Result | Mobile layout is usable; KPI cards stack vertically; critical actions are visible; no unauthorized rows appear. |
| Pass/Fail Criteria | Pass if manager can complete review and follow-up from mobile without layout blocking the workflow. |

### Scenario 10: Scheduled Reports and Audit Evidence

| Field | Detail |
| --- | --- |
| Primary Role | Payroll Manager |
| Business Goal | Confirm scheduled reports and saved outputs support audit documentation. |
| Scenario | As a Payroll Manager, I need scheduled dashboard summaries and saved report links for recurring payroll close review. |
| Preconditions | Scheduled distribution and saved links configured in test tenant. |
| Steps | Trigger or wait for scheduled distribution; open saved report link; confirm prompt values; review confidentiality notice; export or save report evidence. |
| Expected Result | Scheduled report includes approved summary content; saved links open with correct prompts and security; export contains timestamp and prompt values. |
| Pass/Fail Criteria | Pass if scheduled distribution, saved links, and exports are accurate and secure. |

## 5. UAT Defect Reporting Process

| Step | Action | Owner |
| --- | --- | --- |
| 1 | Tester identifies issue during scenario execution. | UAT Tester |
| 2 | Tester captures scenario number, user role, prompt values, screenshot if allowed, expected result, actual result, and business impact. | UAT Tester |
| 3 | Tester logs defect in the approved tracking tool or UAT defect log. | UAT Tester |
| 4 | UAT Lead triages severity and assigns owner. | UAT Lead |
| 5 | Report builder, Workday analyst, or security administrator investigates and resolves or proposes workaround. | Assigned Owner |
| 6 | Tester retests the defect using the same scenario and prompt values. | UAT Tester |
| 7 | UAT Lead updates defect status to Closed, Deferred, or Accepted with Workaround. | UAT Lead |

### Defect Severity Definitions

| Severity | Definition | UAT Impact |
| --- | --- | --- |
| Critical | Dashboard unavailable, incorrect payroll-critical totals, security exposure, or blocker to payroll approval workflow. | Must be resolved before sign-off. |
| High | Major report, KPI, drill-down, export, or workflow issue with limited workaround. | Must be resolved or formally accepted with workaround. |
| Medium | Usability, formatting, or non-critical data issue with workaround. | May proceed with remediation plan. |
| Low | Cosmetic or documentation issue. | Does not block sign-off. |

## 6. UAT Execution Log Template

| Scenario ID | Scenario Name | Tester | Role Tested | Date | Result | Defect ID | Comments |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UAT-001 | Daily Payroll Review |  | Payroll Manager |  | Pass / Fail / Blocked |  |  |
| UAT-002 | Overtime Management |  | Payroll Manager |  | Pass / Fail / Blocked |  |  |
| UAT-003 | Missing Time Resolution |  | Department Manager |  | Pass / Fail / Blocked |  |  |
| UAT-004 | Pre-Approval Checklist |  | Payroll Manager |  | Pass / Fail / Blocked |  |  |
| UAT-005 | Month-End Reporting |  | Finance Analyst |  | Pass / Fail / Blocked |  |  |
| UAT-006 | Deduction Issue Resolution |  | Benefits Administrator |  | Pass / Fail / Blocked |  |  |
| UAT-007 | Tax Exception Review |  | Payroll Tax Analyst |  | Pass / Fail / Blocked |  |  |
| UAT-008 | Security Validation by Role |  | Security Administrator |  | Pass / Fail / Blocked |  |  |
| UAT-009 | Mobile Access for Manager Follow-up |  | Department Manager |  | Pass / Fail / Blocked |  |  |
| UAT-010 | Scheduled Reports and Audit Evidence |  | Payroll Manager |  | Pass / Fail / Blocked |  |  |

## 7. UAT Sign-off Template

| Sign-off Area | Confirmation |
| --- | --- |
| All assigned scenarios executed | Yes / No |
| Critical defects resolved | Yes / No / Not Applicable |
| High defects resolved or workaround approved | Yes / No / Not Applicable |
| Dashboard and reports meet business needs | Yes / No |
| Security behavior accepted | Yes / No |
| Export and audit evidence accepted | Yes / No |
| Ready for production migration | Yes / No |

### Business Sign-off

| Name | Role | Department | Sign-off Decision | Date | Comments |
| --- | --- | --- | --- | --- | --- |
|  | Payroll Manager | Payroll Operations | Approve / Reject |  |  |
|  | HR Business Partner | Human Resources | Approve / Reject |  |  |
|  | Finance Analyst | Finance | Approve / Reject |  |  |
|  | Department Manager | Operations or Business Unit | Approve / Reject |  |  |
|  | Benefits Administrator | Benefits | Approve / Reject |  |  |
|  | Payroll Tax Analyst | Payroll Tax | Approve / Reject |  |  |

## 8. Final UAT Acceptance Criteria

- Payroll Manager can complete daily review and pre-approval checklist using the dashboard.
- Department Managers can identify and act on missing time and overtime exceptions for their teams.
- Finance Analyst can validate and export payroll cost data for close activities.
- Benefits Administrator can review deduction failures, variances, and arrears.
- Payroll Tax Analyst can identify and investigate tax exceptions.
- Security validation confirms role-appropriate access for dashboard, reports, drill-downs, saved links, and exports.
- Scheduled reports and exports provide usable audit evidence with prompt values and run timestamps.
- Business stakeholders approve the dashboard for production use.
