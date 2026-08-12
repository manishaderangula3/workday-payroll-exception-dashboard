# Test Cases

## 1. Document Overview

| Item | Specification |
| --- | --- |
| Project | Workday Payroll Exception Dashboard |
| Document Purpose | Define comprehensive system, report, dashboard, security, and performance test cases for production readiness. |
| Test Scope | Calculated fields, payroll reports, composite dashboard, shared prompts, drill-downs, exports, security, and performance. |
| Out of Scope | Workday delivered payroll calculation engine validation, upstream integration unit testing, and production data correction. |
| Primary Test Environment | Workday implementation or sandbox tenant with payroll, time tracking, benefits, tax, and security configuration enabled. |
| Entry Criteria | Report specifications completed; calculated fields configured; test workers loaded; payroll and time data available for test pay periods. |
| Exit Criteria | All Critical and High priority tests pass; Medium defects have approved workaround or remediation plan; UAT sign-off completed. |

## 2. Test Case Format

| Field | Description |
| --- | --- |
| TC ID | Unique test case identifier. |
| Category | Calculated Field, Report, Dashboard, Security, Performance, or Data Setup. |
| Description | Business or technical behavior being validated. |
| Preconditions | Data, security, or configuration needed before execution. |
| Steps | Tester actions to execute the case. |
| Expected Result | Required outcome for the test to pass. |
| Priority | Critical, High, Medium, or Low. |

## 3. Calculated Field Tests

| TC ID | Category | Description | Preconditions | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| CF-001 | Calculated Field | Payroll Status shows `Complete` for fully processed worker. | Worker has completed payroll result for selected pay period. | Run Payroll Cost Report; locate worker; review `CF_Payroll_Status`. | Status displays `Complete`. | Critical |
| CF-002 | Calculated Field | Payroll Status shows `Error` when deduction fails. | Worker has failed deduction in payroll calculation. | Run Payroll Cost Report; locate worker; compare payroll calculation messages. | `CF_Payroll_Status` displays `Error`. | Critical |
| CF-003 | Calculated Field | Overtime correctly calculates 5 OT hours for 45-hour week. | Non-exempt worker has 45 approved hours in one week. | Run Overtime Report; locate worker; review `CF_Overtime_Hours`. | Overtime Hours = 5.00. | Critical |
| CF-004 | Calculated Field | Overtime shows 0 for exempt worker with 50 hours. | Exempt worker has 50 time-tracked hours. | Run Overtime Report; confirm worker exclusion or calculated OT value. | Worker is excluded or OT Hours = 0.00 according to report design. | Critical |
| CF-005 | Calculated Field | Missing Time flags worker missing 3 days. | Worker schedule has 10 expected days and submitted entries for 7 days. | Run Missing Time Entries Report; locate worker. | `CF_Missing_Time_Flag` = True and Missing Days Count = 3. | Critical |
| CF-006 | Calculated Field | Missing Time excludes worker on approved PTO. | Worker has approved PTO covering all missing scheduled dates. | Run Missing Time Entries Report for the period. | Worker does not appear as a missing time exception. | Critical |
| CF-007 | Calculated Field | Deduction Exception shows `Failed` for zero deduction. | Worker expected deduction > 0; actual deduction = 0. | Run Deduction Exception Report; locate deduction row. | `CF_Deduction_Exception` = Failed. | Critical |
| CF-008 | Calculated Field | Tax Exception flags worker with no withholding. | Worker has taxable wages and expected tax withholding; actual withholding = 0. | Run Tax Exception Report; locate worker tax row. | `CF_Tax_Exception` = Missing or Failed per configuration. | Critical |
| CF-009 | Calculated Field | Deduction variance calculates actual minus expected. | Worker expected deduction = 125.00; actual = 100.00. | Run Deduction Exception Report; review variance. | `CF_Deduction_Variance` = -25.00. | High |
| CF-010 | Calculated Field | Over-deduction is identified when actual exceeds expected threshold. | Worker expected deduction = 100.00; actual = 150.00; threshold <= 50.00. | Run Deduction Exception Report. | Exception Type = Over-Deducted and variance = 50.00. | High |
| CF-011 | Calculated Field | Under-deduction is identified when actual is below expected threshold. | Worker expected deduction = 100.00; actual = 60.00. | Run Deduction Exception Report. | Exception Type = Under-Deducted and variance = -40.00. | High |
| CF-012 | Calculated Field | Arrears exception appears when arrears balance > 0. | Worker has active deduction arrears balance. | Run Deduction Exception Report filtered to Arrears. | Worker appears with arrears balance and Exception Type = Arrears. | High |
| CF-013 | Calculated Field | OT Cost calculates OT Hours x 1.5 x Hourly Rate. | Worker has 5 OT hours and hourly rate 30.00. | Run Overtime Report; review OT Cost. | OT Cost = 225.00. | High |
| CF-014 | Calculated Field | Double-time hours calculate separately from overtime. | Worker has approved time entries triggering double-time rules. | Run Overtime Report; review OT and double-time columns. | Double-Time Hours populate separately and are not double-counted in OT Hours. | High |
| CF-015 | Calculated Field | Missing dates list includes each missing scheduled work date. | Worker missing three specific scheduled dates. | Run Missing Time Entries Report; review `CF_Missing_Time_Dates`. | Missing Dates contains all expected missing dates and excludes submitted or PTO dates. | High |
| CF-016 | Calculated Field | Payroll cost variance compares current period to prior comparable period. | Current and prior period payroll costs exist for same pay group. | Run Payroll Cost Report; review variance column. | Variance equals current total payroll cost minus prior comparable period cost. | High |
| CF-017 | Calculated Field | Tax jurisdiction mismatch is flagged. | Worker home/work location conflicts with assigned tax authority setup. | Run Tax Exception Report; review jurisdiction exception. | `CF_Tax_Jurisdiction_Mismatch` = True and `CF_Tax_Exception` = Invalid Jurisdiction. | High |
| CF-018 | Calculated Field | Payroll deadline countdown calculates days remaining. | Payroll approval deadline date is configured. | Run dashboard or Missing Time report; review countdown. | Days to Payroll Deadline equals approval date minus current date. | Medium |
| CF-019 | Calculated Field | Zero denominator returns `N/A` instead of error. | Prompt combination produces zero expected workers. | Run dashboard with zero-worker prompt scope. | KPI displays `N/A` and no calculation error occurs. | Medium |
| CF-020 | Calculated Field | Multi-exception worker counted once in overall worker exception count. | Worker has missing time and deduction exception in same period. | Run dashboard overview; compare category and overall counts. | Worker appears in both category counts but once in total distinct workers with exceptions. | High |

## 4. Report Tests

| TC ID | Category | Description | Preconditions | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| RPT-001 | Report | Payroll Cost Report shows correct totals. | Payroll results exist with known gross, net, deduction, tax, and employer cost totals. | Run Payroll Cost Report; compare totals to payroll register. | Totals reconcile to payroll register within approved tolerance. | Critical |
| RPT-002 | Report | Payroll Cost Report filters by department correctly. | Workers exist in at least two departments. | Run report with Department prompt populated. | Only selected department workers and totals appear. | High |
| RPT-003 | Report | Overtime Report only shows non-exempt workers. | Exempt and non-exempt workers have hours above threshold. | Run Overtime Report. | Only non-exempt eligible workers appear. | Critical |
| RPT-004 | Report | Missing Time Report excludes terminated workers. | Terminated worker has no time entries after termination date. | Run Missing Time report for period after termination. | Terminated worker is excluded unless payroll policy requires inclusion. | Critical |
| RPT-005 | Report | Deduction Report shows correct variance calculation. | Known expected and actual deduction amounts exist. | Run Deduction Report; compare variance. | Variance equals actual amount taken minus expected amount. | High |
| RPT-006 | Report | Tax Report groups by exception type correctly. | Multiple tax exception types exist. | Run Tax Report; review grouping. | Rows group under correct exception type. | High |
| RPT-007 | Report | Payroll Cost Report groups by Department then Pay Group. | Multiple departments and pay groups exist. | Run report with all departments and pay groups. | Group hierarchy is Department > Pay Group with subtotals. | Medium |
| RPT-008 | Report | Payroll Cost Report grand total is accurate. | Multiple workers and pay groups included. | Run report; compare grand total to subtotal sum. | Grand total equals sum of report rows and subtotals. | Critical |
| RPT-009 | Report | Payroll Cost Report sorts Department A-Z and Employee Name A-Z. | Report includes multiple departments and workers. | Run report and review order. | Departments and employee names appear in expected sort order. | Low |
| RPT-010 | Report | Overtime Report sorts highest overtime first. | Multiple overtime workers exist. | Run Overtime Report. | Rows sort by OT Hours descending. | High |
| RPT-011 | Report | Overtime threshold prompt filters rows. | Workers have OT values above and below threshold. | Run report with Minimum OT Threshold = 5. | Only workers above threshold appear. | High |
| RPT-012 | Report | Overtime matrix shows last 4 week ending dates. | Four weeks of time data exists. | Open matrix view. | Columns show last four week ending dates and total overtime hours. | Medium |
| RPT-013 | Report | Missing Time threshold prompt works. | Workers missing 1, 2, and 5 days. | Run report with threshold = 3. | Only workers missing 3 or more days appear. | High |
| RPT-014 | Report | Missing Time approved leave exclusion works at date level. | Worker has PTO for some but not all missing dates. | Run report; inspect missing dates. | PTO dates are excluded; truly missing dates remain. | Critical |
| RPT-015 | Report | Missing Time drill-down opens worker time entry details. | User has time tracking drill-down security. | Click Worker Time Entry Link. | Workday opens the worker time entry page or related detail. | High |
| RPT-016 | Report | Deduction category prompt filters categories. | Deduction exceptions exist across Medical, Dental, 401k, Garnishment. | Run Deduction Report with category Medical. | Only Medical deduction exceptions appear. | Medium |
| RPT-017 | Report | Deduction exception type prompt filters rows. | Failed, Over, Under, and Arrears rows exist. | Run Deduction Report with Exception Type = Arrears. | Only arrears exceptions appear. | High |
| RPT-018 | Report | Deduction totals by category are correct. | Known deduction category totals exist. | Run report; compare category subtotal to row sum. | Category totals equal sum of included rows. | High |
| RPT-019 | Report | Tax Type prompt filters tax rows. | Federal, state, and local tax exceptions exist. | Run Tax Report with Tax Type = State. | Only state tax exceptions appear. | Medium |
| RPT-020 | Report | Tax invalid jurisdiction rows appear even with zero variance. | Worker has jurisdiction mismatch and zero current variance. | Run Tax Report. | Invalid Jurisdiction row appears. | High |
| RPT-021 | Report | Drill-down links respect user security. | Test users have different security roles. | Click drill-downs as each role. | Authorized users open details; unauthorized users are blocked. | Critical |
| RPT-022 | Report | Excel export preserves formatting. | User has export permission. | Export each report to Excel. | Currency, dates, grouping, totals, and prompt values are preserved where supported. | Medium |
| RPT-023 | Report | Required prompts prevent report run when blank. | Pay Period or required Company prompt blank. | Attempt to run report. | Workday prompts for required values or blocks execution. | High |
| RPT-024 | Report | Optional prompts use blank means all. | Optional prompt left blank. | Run reports without optional Department or Pay Group. | All eligible values in user security scope appear. | Medium |
| RPT-025 | Report | Report totals reconcile to dashboard overview. | Dashboard and reports run with same prompts. | Compare detail report totals to dashboard KPIs. | Values reconcile within documented tolerance. | Critical |

## 5. Dashboard Tests

| TC ID | Category | Description | Preconditions | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| DSH-001 | Dashboard | All tabs load without error. | Composite dashboard configured with six tabs. | Open dashboard; click each tab. | Overview, Payroll Costs, Overtime, Missing Time, Deductions, and Tax Issues tabs load. | Critical |
| DSH-002 | Dashboard | KPIs show correct values. | Source reports contain known expected values. | Open Overview tab; compare KPIs to source reports. | KPI values match source reports. | Critical |
| DSH-003 | Dashboard | Shared prompts filter all tabs. | Multiple companies, pay groups, and departments exist. | Select shared prompts; open each tab. | Every tab reflects selected prompt scope. | Critical |
| DSH-004 | Dashboard | Drill-down navigation works. | User has drill-down security. | Click KPI card, chart segment, alert link, and table drill-down. | Correct detail report or worker detail opens. | High |
| DSH-005 | Dashboard | Export to Excel produces correct file. | User has export permission. | Export current view and full dashboard. | Excel file downloads with current filters, prompt values, and expected rows. | High |
| DSH-006 | Dashboard | KPI card click filters detail table. | Dashboard has exception detail rows. | Click Missing Time KPI card. | Detail table filters to Missing Time exceptions. | High |
| DSH-007 | Dashboard | Chart segment click filters or drills to detailed report. | Exception breakdown chart has category segments. | Click Overtime segment. | Detail table filters to Overtime or Overtime tab opens. | Medium |
| DSH-008 | Dashboard | Critical alerts display only urgent exceptions. | Critical and non-critical exception data exists. | Open dashboard alert section. | Only critical exceptions appear in alert section. | High |
| DSH-009 | Dashboard | Status colors match thresholds. | KPI values exist in green, yellow, and red ranges. | Review dashboard status indicators. | Colors and labels match KPI threshold rules. | High |
| DSH-010 | Dashboard | Last updated timestamp changes after refresh. | Dashboard loaded. | Click Refresh. | Timestamp updates after successful refresh. | Medium |
| DSH-011 | Dashboard | Filter reset returns table to all exceptions. | Detail table filtered by KPI card. | Click Reset Filters. | Detail table returns to all exceptions for current prompts. | Medium |
| DSH-012 | Dashboard | Tab badge counts match source reports. | Exception counts exist in source reports. | Compare tab badges to source report distinct worker counts. | Badge counts reconcile to source reports. | High |
| DSH-013 | Dashboard | Mobile layout is usable. | Mobile or responsive emulator available. | Open dashboard on mobile viewport. | KPI cards stack vertically and simplified table is usable. | Medium |
| DSH-014 | Dashboard | Tablet layout stacks charts. | Tablet viewport available. | Open dashboard on tablet viewport. | Charts stack and table remains scrollable. | Low |
| DSH-015 | Dashboard | Overall dashboard status follows rollup logic. | At least one KPI red, one yellow, and all green scenarios available. | Run dashboard for each scenario. | Overall status is Red, Yellow, or Green according to rollup rules. | High |

## 6. Security Tests

| TC ID | Category | Description | Preconditions | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| SEC-001 | Security | Payroll Admin sees all workers in assigned payroll scope. | Payroll Admin role assigned. | Log in as Payroll Admin; run dashboard and reports. | User sees all authorized workers in assigned payroll organizations. | Critical |
| SEC-002 | Security | Manager sees only direct reports. | Manager has direct reports with exceptions. | Log in as Manager; run dashboard or assigned report. | Only direct or organization-authorized reports appear. | Critical |
| SEC-003 | Security | HR Partner sees only their organization. | HR Partner assigned to one organization. | Log in as HR Partner; run dashboard. | Results limited to HR Partner organization security. | Critical |
| SEC-004 | Security | Unauthorized user cannot access dashboard. | User has no payroll reporting security. | Attempt to open dashboard link. | Access is denied. | Critical |
| SEC-005 | Security | Finance Analyst has restricted worker-level payroll detail. | Finance Analyst role configured with limited detail access. | Log in as Finance Analyst; open Payroll Costs and drill-downs. | Summary/cost access works; restricted worker details are blocked. | High |
| SEC-006 | Security | Benefits Administrator can access deduction details only where authorized. | Benefits role assigned. | Open Deductions tab and benefit election drill-down. | Authorized deduction details open; unrelated payroll/tax details are restricted. | High |
| SEC-007 | Security | Payroll Tax Analyst can access tax details only where authorized. | Tax role assigned. | Open Tax Issues tab and tax election drill-down. | Authorized tax details open; unrelated restricted details are blocked. | High |
| SEC-008 | Security | Export respects row-level security. | Multiple users with different security scopes exist. | Export same report as each user. | Export contains only rows visible to that user. | Critical |
| SEC-009 | Security | Saved report links enforce current user security. | Saved dashboard link exists. | Open saved link as authorized and unauthorized users. | Authorized users see scoped data; unauthorized users are denied or see no data. | High |
| SEC-010 | Security | Scheduled email distribution excludes unauthorized recipients. | Distribution list configured. | Review scheduled report recipients and sample output. | Only approved recipients receive allowed summary/detail content. | Critical |

## 7. Performance Tests

| TC ID | Category | Description | Preconditions | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| PERF-001 | Performance | Dashboard loads within 10 seconds for 1000 workers. | Test tenant has at least 1000 workers and representative payroll data. | Open composite dashboard with standard prompts. | Initial dashboard load completes within 10 seconds or approved tenant SLA. | High |
| PERF-002 | Performance | Report export completes within 30 seconds. | Report has at least 1000 rows and export permission enabled. | Export Payroll Cost Report and exception reports. | Export completes within 30 seconds or approved SLA. | Medium |
| PERF-003 | Performance | Filters apply within 5 seconds. | Dashboard loaded with large dataset. | Change Department or Pay Group prompt; apply. | Filtered results return within 5 seconds or approved SLA. | High |
| PERF-004 | Performance | Tab navigation completes within 3 seconds after dashboard load. | Dashboard loaded. | Click each tab. | Each tab renders within 3 seconds when data is available. | Medium |
| PERF-005 | Performance | Critical alert section loads without delaying full dashboard. | Critical alerts exist across categories. | Open dashboard and observe alert rendering. | Alert section loads with dashboard and does not block other components beyond SLA. | Medium |

## 8. Test Data Requirements

### Minimum Test Worker Population

| Worker Type | Minimum Count | Required Scenario |
| --- | --- | --- |
| Fully processed workers | 10 | Complete payroll status, payroll cost totals, completion rate. |
| Non-exempt hourly workers | 10 | Overtime, missing time, time entry status, manager visibility. |
| Exempt workers | 5 | Overtime exclusion and worker eligibility logic. |
| Workers with approved PTO | 5 | Missing time exclusion. |
| Workers with deduction elections | 10 | Expected vs actual deductions, benefits drill-down. |
| Workers with garnishments or arrears | 3 | Deduction arrears and recovery workflow. |
| Workers with tax election variations | 8 | Federal, state, local, invalid jurisdiction, no withholding. |
| Terminated workers | 3 | Missing time and eligibility exclusion. |
| Multi-exception workers | 3 | Distinct count and category count validation. |
| Department managers | 3 | Security, manager filtering, notification workflows. |

### Required Test Tenant Scenarios

| Scenario | Setup Requirement |
| --- | --- |
| Complete payroll population | At least one pay period with completed payroll results. |
| Payroll error population | Workers with payroll calculation errors or failed deduction/tax results. |
| Overtime population | Non-exempt workers with 41-45 hours, > 45 hours, and > 50 hours. |
| Exempt overtime exclusion | Exempt worker with more than 40 hours. |
| Missing time population | Workers missing 1, 2, 3, and more than 5 scheduled days. |
| Approved PTO exclusion | Approved time off overlapping scheduled work days. |
| Deduction exceptions | Failed, over-deducted, under-deducted, and arrears cases. |
| Tax exceptions | Missing withholding, failed tax calculation, over-withheld, under-withheld, and invalid jurisdiction cases. |
| Security roles | Payroll Admin, Payroll Manager, HR Partner, Department Manager, Benefits Administrator, Payroll Tax Analyst, Finance Analyst, unauthorized user. |
| Historical trending | At least 3 prior pay periods for trend testing; 12-month test data preferred for production rehearsal. |

## 9. Pass/Fail Criteria

| Result | Criteria |
| --- | --- |
| Pass | Actual result matches expected result; no unresolved defect affects test objective. |
| Pass with Observation | Test passes, but tester records usability, performance, or documentation feedback. |
| Blocked | Test cannot be executed due to missing data, configuration, access, or environment issue. |
| Fail | Actual result does not match expected result or produces inaccurate payroll, security, or dashboard behavior. |

### Defect Severity

| Severity | Definition | Production Impact |
| --- | --- | --- |
| Critical | Incorrect payroll totals, security exposure, dashboard unavailable, or exception logic materially wrong. | Blocks production release. |
| High | Major report, KPI, drill-down, or workflow issue with limited workaround. | Blocks release unless approved workaround exists. |
| Medium | Usability, formatting, or non-critical calculation issue with workaround. | May proceed with approved remediation plan. |
| Low | Cosmetic or documentation issue. | Does not block release. |

## 10. Execution Sign-off

| Sign-off Item | Requirement |
| --- | --- |
| Test Execution Complete | All planned test cases executed or formally marked blocked with reason. |
| Defect Review Complete | All Critical and High defects resolved or approved for workaround. |
| Reconciliation Complete | Dashboard KPIs reconcile to source reports and payroll register. |
| Security Validation Complete | Role-based access and export security validated. |
| UAT Ready | QA lead and Payroll Product Owner approve move to UAT. |
