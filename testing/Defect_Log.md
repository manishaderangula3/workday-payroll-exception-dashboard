# Defect Log

## 1. Document Overview

| Item | Specification |
| --- | --- |
| Project | Workday Payroll Exception Dashboard |
| Document Purpose | Track defects identified during test execution and UAT, including severity, category, ownership, resolution status, and closure evidence. |
| Primary Audience | Payroll Product Owner, QA Lead, Workday Report Builder, Workday Security Administrator, Payroll Operations, HRIS |
| Test Phase | Day 18 - Execute Testing and Log Defects |
| Log Date | 2026-08-13 |
| Source Documents | `testing/Test_Cases.md`, `testing/UAT_Scenarios.md`, report specifications, dashboard specifications |
| Defect Tool Equivalent | This document can be used as a standalone defect log or imported into Jira, Azure DevOps, ServiceNow, or another issue tracker. |

## 2. Defect Log Format

| Field | Description |
| --- | --- |
| Defect ID | Unique identifier using `DEF-###` format. |
| Date Found | Date the issue was discovered. |
| Severity | Critical, High, Medium, or Low. |
| Category | Functional area, such as Calculated Field, Dashboard, Report, Security, Export, Performance, or UI. |
| Title | Short summary of the issue. |
| Description | Business impact and defect detail. |
| Steps to Reproduce | Repeatable user or tester actions that produce the defect. |
| Expected | Expected system behavior. |
| Actual | Actual observed behavior. |
| Status | Open, In Progress, Resolved, or Closed. |
| Assigned To | Owner responsible for resolution. |
| Resolution | Fixed, Won't Fix, Duplicate, By Design, Deferred, or blank while open. |
| Date Resolved | Date resolution was completed, if applicable. |

## 3. Defect Summary

### Severity Summary

| Total | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- |
| 15 | 1 | 4 | 5 | 5 |

### Status Summary

| Open | In Progress | Resolved | Closed |
| --- | --- | --- | --- |
| 5 | 4 | 4 | 2 |

### Category Summary

| Category | Count |
| --- | --- |
| Calculated Field | 3 |
| Dashboard | 3 |
| Report | 3 |
| Security | 1 |
| Export | 2 |
| Performance | 1 |
| Drill-down | 1 |
| UI | 1 |

## 4. Defect Log

| Defect ID | Date Found | Severity | Category | Title | Description | Steps to Reproduce | Expected | Actual | Status | Assigned To | Resolution | Date Resolved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEF-001 | 2026-08-13 | High | Calculated Field | Overtime CF not excluding PTO hours from total | `CF_Overtime_Hours` includes approved PTO hours when calculating weekly overtime, overstating overtime for workers with paid leave in the same week. | Run Overtime Report for a non-exempt worker with 36 worked hours and 8 approved PTO hours; review overtime calculation. | PTO hours should be excluded from worked hours used to calculate overtime unless tenant policy explicitly counts PTO toward OT. | Worker shows 4 overtime hours based on 44 total paid hours. | In Progress | Workday Report Builder |  |  |
| DEF-002 | 2026-08-13 | Medium | Dashboard | Dashboard KPI card showing stale data after period change | KPI cards retain prior pay period values after the user changes the Pay Period prompt until the page is manually refreshed twice. | Open dashboard; run for prior pay period; change Pay Period to current period; click Refresh; compare KPI cards to detail reports. | KPI cards should refresh once and display values for the selected pay period. | KPI row displays prior period values while detail tabs show current period rows. | In Progress | Dashboard Developer |  |  |
| DEF-003 | 2026-08-13 | Low | Export | Column alignment issue in exported Excel file | Exported Payroll Cost Report has misaligned subtotal labels in Excel when Department and Pay Group grouping are both enabled. | Run Payroll Cost Report grouped by Department and Pay Group; export to Excel; open workbook and inspect subtotal rows. | Subtotal labels and currency totals should align under the correct columns. | Subtotal label shifts one column to the right. | Resolved | Workday Report Builder | Fixed | 2026-08-13 |
| DEF-004 | 2026-08-13 | High | Security | Security filter not applying for HR Partner role | HR Partner can see workers outside assigned organization on the Missing Time tab when Department prompt is blank. | Log in as HR Partner; open composite dashboard; leave Department blank; open Missing Time tab. | HR Partner should see only workers in assigned organization security scope. | HR Partner sees missing time rows for other organizations. | In Progress | Workday Security Administrator |  |  |
| DEF-005 | 2026-08-13 | Medium | Calculated Field | Missing Time report counting holidays as missing | `CF_Missing_Time_Days` counts company holidays as expected work days for standard Monday-Friday schedules. | Run Missing Time report for a pay period containing a company holiday; review workers with no time entry on the holiday. | Company holidays should be excluded from expected work days when holiday calendar applies. | Holiday is counted as a missing day. | Open | Workday Report Builder |  |  |
| DEF-006 | 2026-08-13 | Low | Dashboard | Sorting resets when switching tabs | User-applied sort order in the detail table is lost when navigating away from and back to the tab. | Open Overtime tab; sort by OT Cost descending; switch to Payroll Costs tab; return to Overtime tab. | User sort preference should persist during the dashboard session where supported. | Sort returns to default OT Hours descending. | Open | Dashboard Developer |  |  |
| DEF-007 | 2026-08-13 | High | Calculated Field | Deduction variance calculation incorrect for bi-weekly deductions | Deduction variance compares actual bi-weekly deduction to monthly expected amount, incorrectly flagging under-deductions. | Run Deduction Exception Report for worker with monthly benefit rate split across two bi-weekly checks. | Expected amount should be normalized to the worker's pay frequency before variance calculation. | Report compares bi-weekly actual amount to full monthly rate. | In Progress | Benefits Configuration Analyst |  |  |
| DEF-008 | 2026-08-13 | Medium | Report | Tax exception not flagging expired W-4 forms | Tax Exception Report does not identify workers whose withholding election form has expired or is no longer valid. | Configure worker with expired W-4 or equivalent tax election; run Tax Exception Report. | Worker should be flagged with tax election review or invalid election exception. | Worker does not appear in Tax Exception Report. | Open | Payroll Tax Analyst |  |  |
| DEF-009 | 2026-08-13 | Low | UI | Report title shows internal name instead of display name | Composite dashboard Tab 1 header shows internal report name instead of user-facing dashboard title. | Open Composite Dashboard; open Overview tab; inspect page title. | Header should display `Payroll Exception Dashboard - Overview`. | Header displays `CR_PAY_EXC_DASH_OVERVIEW`. | Resolved | Dashboard Developer | Fixed | 2026-08-13 |
| DEF-010 | 2026-08-13 | Critical | Performance | Dashboard timeout for organizations with more than 500 workers | Composite Dashboard times out when Payroll Manager runs it for a large organization with more than 500 workers and all tabs enabled. | Log in as Payroll Manager; select large organization; run dashboard for current pay period. | Dashboard should load within 10 seconds or approved tenant SLA, or use pagination/lazy loading to prevent timeout. | Dashboard times out before Overview tab renders. | Open | Workday Reporting Lead |  |  |
| DEF-011 | 2026-08-13 | Medium | Drill-down | Drill-down link opens wrong worker record | Missing Time report drill-down opens the previous worker row when rows are sorted by Missing Days Count descending. | Run Missing Time report; sort by Missing Days Count; click Worker Time Entry Link for second worker. | Link should open the selected worker's time entry details. | Link opens the first worker's record. | Resolved | Workday Report Builder | Fixed | 2026-08-13 |
| DEF-012 | 2026-08-13 | Low | Report | Date format inconsistent between reports | Dashboard displays pay period dates as MM/DD/YYYY while Tax Exception export displays dates as DD/MM/YYYY. | Run dashboard and Tax Exception Report; export Tax report; compare date formats. | Date format should be consistent across dashboard, reports, and exports based on tenant locale. | Tax export uses DD/MM/YYYY while dashboard uses MM/DD/YYYY. | Open | Workday Report Builder |  |  |
| DEF-013 | 2026-08-13 | High | Dashboard | Composite report shared prompt not filtering Tab 3 | Pay Group shared prompt is not passed to the Overtime tab, causing out-of-scope workers to appear. | Open Composite Dashboard; set Pay Group to US Biweekly; open Overtime tab. | Overtime tab should show only workers in selected Pay Group. | Overtime tab includes US Weekly workers. | Open | Dashboard Developer |  |  |
| DEF-014 | 2026-08-13 | Medium | Export | Export missing subtotal rows | Excel export for Deduction Exception Report excludes Exception Type and Deduction Category subtotal rows. | Run Deduction Exception Report grouped by Exception Type and Deduction Category; export to Excel. | Export should preserve subtotal rows where supported. | Export includes detail rows but omits subtotal rows. | Resolved | Workday Report Builder | Fixed | 2026-08-13 |
| DEF-015 | 2026-08-13 | Low | UI | Color coding legend not displayed | Dashboard uses green, amber, and red indicators but does not display a legend explaining status colors. | Open Dashboard Overview; review KPI cards and alert section. | Dashboard should include legend or tooltip explaining Clear, Warning, and Critical states. | No legend appears; users must infer color meaning. | Closed | Dashboard Developer | Fixed | 2026-08-13 |

## 5. Severity Definitions

| Severity | Definition | Examples | Release Impact |
| --- | --- | --- | --- |
| Critical | System crash, data corruption, security breach, dashboard unavailable for core payroll users, or defect that blocks payroll approval. | Dashboard timeout for large organization, unauthorized payroll data exposure, materially incorrect payroll totals. | Blocks production release until resolved and verified. |
| High | Major function not working, incorrect calculations, broken shared prompts, or security issue with limited scope. | Incorrect deduction variance, HR Partner security filter issue, shared prompt not filtering a tab. | Blocks release unless business owner accepts documented workaround. |
| Medium | Feature works but has issues, data is incomplete in limited cases, workaround is available, or usability issue affects efficiency. | Stale KPI after prompt change, holiday counted as missing time, export missing subtotal rows. | Does not block release if workaround and remediation plan are approved. |
| Low | Cosmetic issue, minor formatting issue, minor usability issue, or documentation mismatch. | Misaligned export columns, inconsistent date format, missing legend. | Does not block release. |

## 6. Defect Lifecycle

```text
New -> Assigned -> In Progress -> Resolved -> Verified -> Closed
```

| Status | Definition | Owner |
| --- | --- | --- |
| New | Defect has been logged and awaits triage. | QA Lead |
| Assigned | Defect has been reviewed and assigned to an owner. | QA Lead |
| In Progress | Owner is actively investigating or fixing the defect. | Assigned Owner |
| Resolved | Fix or disposition has been provided and is ready for retest. | Assigned Owner |
| Verified | Tester has confirmed the expected result after retest. | QA Tester |
| Closed | Defect is verified, accepted, and no further action is required. | QA Lead |

### Status Mapping for Summary

| Summary Status | Included Lifecycle Statuses |
| --- | --- |
| Open | New and Assigned defects. |
| In Progress | In Progress defects. |
| Resolved | Resolved and Verified defects awaiting final closure. |
| Closed | Closed defects. |

## 7. Resolution Categories

| Resolution Category | Definition |
| --- | --- |
| Fixed | Code, configuration, calculated field, report, security, or dashboard setup was corrected. |
| Won't Fix | Issue will not be changed after business and technical review. |
| Duplicate | Defect is already tracked under another Defect ID. |
| By Design | Behavior matches approved design or Workday platform behavior. |
| Deferred | Issue is valid but moved to a later release or post-go-live backlog. |

## 8. Prioritization and Triage Rules

| Rule | Requirement |
| --- | --- |
| Critical Defects | Review immediately; assign owner same day; retest fix before production sign-off. |
| High Defects | Triage within 1 business day; resolve before release or document approved workaround. |
| Medium Defects | Triage within 2 business days; add remediation plan if not fixed before release. |
| Low Defects | Review during normal defect triage; fix before release if low effort or defer with approval. |
| Security Defects | Escalate to Workday Security Administrator and Payroll Product Owner immediately. |
| Calculation Defects | Reconcile against source payroll register, time tracking, benefit, or tax data before closure. |
| Export Defects | Confirm whether limitation is configuration issue, Excel rendering issue, or Workday platform limitation. |

## 9. Retest Requirements

| Retest Area | Requirement |
| --- | --- |
| Same Scenario | Retest using the same test case, role, prompt values, and worker data that produced the original defect. |
| Regression Check | Confirm fix does not break related reports, dashboard tabs, prompts, or exports. |
| Evidence | Capture retest date, tester, result, and evidence reference where allowed by payroll data policy. |
| Closure Approval | QA Lead closes defects after tester verification and business owner acceptance where required. |

## 10. Production Readiness Impact

Based on the current sample defect log, production readiness is not yet approved because:

- 1 Critical defect remains Open: `DEF-010`.
- 4 High defects remain Open or In Progress: `DEF-001`, `DEF-004`, `DEF-007`, and `DEF-013`.
- Security and prompt-filtering defects require verification before go-live.
- Performance remediation is required for large organizations before Payroll Manager production rollout.

Production migration can proceed only after Critical defects are resolved and High defects are either resolved or accepted with documented business workaround.
