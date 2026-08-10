# Dashboard Overview

## 1. Report Overview

| Item | Specification |
| --- | --- |
| Report Name | Payroll Exception Dashboard - Overview |
| Report Type | Workday Advanced Report, Summary/Landing Page |
| Primary Purpose | Provide a single-page summary of payroll exceptions, payroll processing KPIs, and high-priority action items for the selected pay period. |
| Audience | Payroll Manager as the primary daily view; secondary audience includes Payroll Administrator, HR Partner, Benefits Administrator, Payroll Tax Analyst, and Finance Analyst. |
| Output Format | Workday summary report embedded in the composite dashboard and available as a standalone report. |
| Recommended Security | Payroll Manager, Payroll Administrator, and restricted stakeholder roles with organization-based security. |
| Refresh Cadence | On demand, daily during payroll processing, and before payroll approval. |
| Criticality | High. The overview should be reviewed before payroll completion and used as the first checkpoint in the payroll close process. |

## 2. Data Sources and Sub-Report Inputs

| Source | Reference Report or Object | Purpose |
| --- | --- | --- |
| Payroll Cost Report | `Payroll Cost Summary Report` | Supplies total payroll cost, prior-period comparison, worker processed counts, and payroll completion totals. |
| Overtime Report | `Overtime Hours Exception Report` | Supplies overtime exception counts, top overtime workers, overtime hours, and overtime cost. |
| Missing Time Entries Report | `Missing Time Entries Exception Report` | Supplies missing time counts, missing day counts, and manager follow-up priorities. |
| Deduction Exception Report | `Deduction Exception Report` | Supplies deduction exception counts, failed deductions, variance amounts, and arrears balances. |
| Tax Exception Report | `Tax Exception Report` | Supplies tax exception counts, recent tax issues, jurisdiction issues, and tax variance totals. |
| Workers and Pay Groups | Worker, Company, Department, Pay Group | Supplies expected worker counts, security context, and prompt filtering attributes. |

### Data Source Notes

- The overview should summarize validated detail reports rather than reimplementing each exception calculation independently.
- All KPI cards and highlight lists must respect shared prompts for Pay Period, Company, Pay Group, and Department.
- Counts should be based on distinct workers unless a KPI explicitly states it counts exception rows.
- Detail report totals should reconcile to the overview by using the same prompts, filters, and security context.

## 3. KPI Summary Section

### KPI Cards

| KPI | Source | Calculation | Display Format |
| --- | --- | --- | --- |
| Total Payroll Cost | Payroll Cost Report | Current period total payroll cost compared with prior comparable period total payroll cost. | Currency with prior-period delta and percent change. |
| Payroll Cost % Change | Payroll Cost Report | `(Current Period Total Payroll Cost - Prior Period Total Payroll Cost) / Prior Period Total Payroll Cost`. | Percent, 1 decimal. |
| Total Workers Processed | Payroll Cost Report or Payroll Results | Distinct workers with payroll results in the selected pay period. | Number with denominator. |
| Total Workers Expected | Worker and Pay Group eligibility | Distinct workers expected for the selected pay period, company, pay group, and department. | Number. |
| Exception Count by Type | Exception detail reports | Distinct workers by exception category. | Donut or pie breakdown plus count labels. |
| Payroll Completion Rate | Payroll status calculation | Completed payroll results divided by total expected payroll results. | Percent with completion numerator and denominator. |

### KPI Layout

Recommended first-row KPI cards:

1. Total Payroll Cost
2. Workers Processed / Expected
3. Payroll Completion Rate
4. Total Open Exceptions

Recommended second-row visual:

- Exception Count by Type donut chart:
  - Missing Time: X workers
  - Overtime: X workers
  - Deduction Issues: X workers
  - Tax Exceptions: X workers

### KPI Definitions

| KPI | Business Definition |
| --- | --- |
| Total Payroll Cost | Gross pay plus employer costs for all workers in scope. |
| Prior Period Cost | Total payroll cost for the prior comparable pay period using the same company, pay group, and department prompts. |
| Workers Processed | Workers with calculated, completed, or approved payroll results for the selected pay period. |
| Workers Expected | Workers eligible for payroll processing in the selected pay period. |
| Payroll Completion Rate | Completed payroll results divided by expected payroll results. |
| Total Open Exceptions | Distinct open exception rows across missing time, overtime, deduction, and tax issue categories. |

## 4. Exception Highlights

Each highlight section should show the top 5 records by severity and provide a direct link to the detailed report.

### Top 5 Overtime Workers

| Field | Source |
| --- | --- |
| Employee Name | Overtime Report |
| Department | Overtime Report |
| Manager | Overtime Report |
| Overtime Hours | `CF_Overtime_Hours` |
| Overtime Cost | `CF_OT_Cost` |
| Alert Level | `CF_OT_Alert_Level` |

Sort by Overtime Hours descending, then Overtime Cost descending.

### Top 5 Missing Time

| Field | Source |
| --- | --- |
| Employee Name | Missing Time Entries Report |
| Department | Missing Time Entries Report |
| Manager | Missing Time Entries Report |
| Days Missing | `CF_Missing_Time_Days` |
| Missing Dates | `CF_Missing_Time_Dates` |
| Days Until Payroll Deadline | `CF_Days_Until_Payroll_Deadline` |

Sort by Missing Days Count descending, then Days Until Payroll Deadline ascending.

### Top 5 Deduction Failures

| Field | Source |
| --- | --- |
| Employee Name | Deduction Exception Report |
| Deduction Name | Deduction Exception Report |
| Deduction Category | Deduction Exception Report |
| Amount | `CF_Deduction_Variance` or Arrears Balance |
| Exception Type | `CF_Deduction_Exception` |
| Resolution Status | `CF_Deduction_Resolution_Status` |

Sort by absolute deduction variance descending, then arrears balance descending.

### Recent Tax Exceptions

| Field | Source |
| --- | --- |
| Employee Name | Tax Exception Report |
| Tax Type | Tax Exception Report |
| Tax Authority | Tax Exception Report |
| Issue Type | `CF_Tax_Exception` |
| Tax Variance | `CF_Tax_Variance` |
| Resolution Status | `CF_Tax_Resolution_Status` |

Sort by most recent payroll calculation date, then absolute tax variance descending.

## 5. Status Indicators

| Status | Rule | Display |
| --- | --- | --- |
| Green | 0 exceptions in the category | Green status indicator with "Clear" label. |
| Yellow | 1-5 exceptions in the category | Yellow status indicator with exception count. |
| Red | More than 5 exceptions in the category | Red status indicator with exception count and priority flag. |

### Category Status Cards

| Category | Count Source | Status Rule |
| --- | --- | --- |
| Missing Time | Missing Time Entries Report distinct worker count | Green = 0, Yellow = 1-5, Red > 5 |
| Overtime | Overtime Report distinct worker count | Green = 0, Yellow = 1-5, Red > 5 |
| Deduction Issues | Deduction Exception Report distinct worker count | Green = 0, Yellow = 1-5, Red > 5 |
| Tax Exceptions | Tax Exception Report distinct worker count | Green = 0, Yellow = 1-5, Red > 5 |

## 6. Navigation Links and Quick Actions

| Section | Link Target | Purpose |
| --- | --- | --- |
| Total Payroll Cost | Payroll Cost Report tab | Review payroll cost breakdown by department, pay group, and worker. |
| Overtime Highlights | Overtime Report tab | Review overtime workers, cost, thresholds, and trends. |
| Missing Time Highlights | Missing Time Entries Report tab | Review workers missing required time entries and notify managers. |
| Deduction Highlights | Deduction Exception Report tab | Review failed, over, under, and arrears deduction issues. |
| Tax Highlights | Tax Exception Report tab | Review tax withholding, jurisdiction, and tax calculation issues. |

### Quick Action Buttons

| Quick Action | Target | Usage |
| --- | --- | --- |
| Run All Detail Reports | Composite dashboard with shared prompts | Opens the full tabbed dashboard for the same prompt values. |
| Notify Managers | Missing Time Entries Report action workflow | Starts manager follow-up for missing time exceptions. |
| Review Payroll Cost Variance | Payroll Cost Report | Opens cost details filtered to current prompts. |
| Review Critical Overtime | Overtime Report | Opens overtime report filtered to red alert rows where overtime is greater than 10 hours. |
| Review Deduction Arrears | Deduction Exception Report | Opens deduction report filtered to Arrears exception type. |
| Review Tax Jurisdictions | Tax Exception Report | Opens tax report filtered to Invalid Jurisdiction exceptions. |

## 7. Layout and Design Requirements

| Area | Requirement |
| --- | --- |
| Header | Display report name, selected pay period, company, pay group, department, run date/time, and user name. |
| KPI Section | Use compact summary cards with consistent labels, current value, prior value when applicable, and status color. |
| Exception Breakdown | Use a donut or pie chart for exception count by type, with accessible count labels. |
| Highlight Lists | Display four compact top-5 tables with drill-down links and status formatting. |
| Navigation | Each card and table title should link to the corresponding detail report or composite dashboard tab. |
| Export | Excel export should include KPI values, prompt values, run date/time, and highlight tables. |
| Accessibility | Do not rely on color alone; include status text such as Clear, Warning, and Critical. |

## 8. Security and Access

- Payroll Managers should see all payroll exception categories within their assigned organization security.
- Department Managers should only see workers and departments allowed by manager security when the overview is exposed outside Payroll.
- Finance Analysts may see payroll cost and summarized exception counts but should be restricted from sensitive worker-level details unless authorized.
- Benefits Administrators should have drill-down access to deduction and benefit election details where role security permits.
- Payroll Tax Analysts should have drill-down access to tax elections and tax authority setup where role security permits.

## 9. Sample Output Layout

```text
Payroll Exception Dashboard - Overview
Prompts: Pay Period = 2026-07-19 to 2026-08-01 | Company = US Company | Pay Group = All | Department = All
Run Date/Time: 2026-08-10 09:15 AM | User: Payroll Manager

KPI Summary
----------------------------------------------------------------------------------------------------------
Total Payroll Cost       $14,236,500     Prior: $13,925,100     Change: +2.2%      Status: Yellow
Workers Processed        1,244 / 1,260   Completion Rate: 98.7%                    Status: Yellow
Total Open Exceptions    31              Missing Time 8 | Overtime 12 | Deductions 6 | Tax 5

Exception Highlights
----------------------------------------------------------------------------------------------------------
Top Overtime Workers
Employee Name       Department     OT Hours    OT Cost     Alert
Taylor Kim          Operations     13.25       $636.00     Red
Morgan Diaz         Operations     11.00       $495.00     Red

Top Missing Time
Employee Name       Department        Missing Days   Missing Dates                 Deadline
Jordan Patel        Customer Support  5              2026-07-24, 07-28, 07-29...   1 day
Taylor Kim          Operations        3              2026-07-25, 07-26, 08-01      1 day

Top Deduction Failures
Employee Name       Deduction       Amount      Type
Avery Reed          Medical PPO     -$125.00    Failed
Jordan Lee          401k Pre-Tax    $240.00     Over-Deducted

Recent Tax Exceptions
Employee Name       Tax Authority   Issue Type          Variance
Morgan Patel        CA SIT          Missing             -$145.00
Riley Chen          NYC Local       Over-Withheld        $58.50
```

## 10. Configuration Steps in Workday

1. Navigate to **Create Custom Report**.
2. Enter the report name **Payroll Exception Dashboard - Overview**.
3. Select **Advanced Report** and configure it as a summary or landing page style report.
4. Select the primary summary data source or reporting object that can reference payroll results and exception sub-report outputs.
5. Enable prompts for Pay Period, Company, Pay Group, and Department.
6. Create summary fields for Total Payroll Cost, Prior Period Payroll Cost, Payroll Cost Percent Change, Workers Processed, Workers Expected, and Payroll Completion Rate.
7. Add summary fields for distinct exception worker counts by Missing Time, Overtime, Deduction Issues, and Tax Exceptions.
8. Configure a donut or pie visualization for exception counts by type.
9. Add status indicator calculated fields for each exception category using Green, Yellow, and Red rules.
10. Add the top 5 overtime highlight section from the Overtime Report.
11. Add the top 5 missing time highlight section from the Missing Time Entries Report.
12. Add the top 5 deduction failures highlight section from the Deduction Exception Report.
13. Add the recent tax exceptions highlight section from the Tax Exception Report.
14. Configure each highlight table with row limit 5 and the appropriate sort order.
15. Add navigation links from each KPI and highlight section to the matching detail report.
16. Add quick action links for manager notification, critical overtime review, deduction arrears review, and tax jurisdiction review.
17. Configure conditional formatting for category status and payroll completion rate.
18. Configure the header to display prompt values, run date/time, and user name.
19. Configure Excel export to include KPI values, prompt values, and highlight tables.
20. Validate the overview totals against each detail report using identical prompt values.
21. Test security as Payroll Manager, Finance Analyst, Benefits Administrator, Payroll Tax Analyst, and Department Manager if exposed.
22. Add the overview report as Tab 1 in the composite dashboard.
23. Add the overview to the payroll close checklist as the first review step.

## Acceptance Criteria

- Overview displays payroll cost, worker processing, payroll completion, and exception count KPIs.
- Exception counts reconcile to the detailed reports using the same prompt values.
- Top 5 exception highlight lists display with drill-down links.
- Green, Yellow, and Red status indicators follow the specified threshold rules.
- Navigation links route users to detailed reports or composite dashboard tabs.
- The report is usable as the main Payroll Manager daily landing page.
