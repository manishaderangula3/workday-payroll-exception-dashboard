# Composite Dashboard

## 1. Dashboard Overview

| Item | Specification |
| --- | --- |
| Dashboard Name | Payroll Exception & Reporting Composite Dashboard |
| Dashboard Type | Workday Composite Report |
| Primary Purpose | Combine all payroll exception and payroll reporting outputs into a single tabbed interface with shared prompts, consistent navigation, and centralized payroll close review. |
| Audience | Payroll Manager, Payroll Administrator, HR Partner, Benefits Administrator, Payroll Tax Analyst, Finance Analyst, and Department Managers with restricted access. |
| Primary Owner | Payroll Operations |
| Output Format | Workday composite report with tabbed sub-reports, export options, saved links, and homepage worklet access. |
| Refresh Cadence | On demand with shared prompt refresh; optional scheduled refresh during payroll processing. |
| Production Criticality | High. Dashboard must reconcile to payroll detail reports before payroll approval. |

## 2. Tab Structure

| Tab | Tab Name | Sub-Report Reference | Primary Purpose |
| --- | --- | --- | --- |
| 1 | Overview | Payroll Exception Dashboard - Overview | Landing page with KPIs, exception counts, top exceptions, and navigation actions. |
| 2 | Payroll Costs | Payroll Cost Summary Report | Detailed payroll cost breakdown by department, pay group, worker, and pay period. |
| 3 | Overtime | Overtime Hours Exception Report | Overtime tracking, threshold alerts, trend matrix, and overtime cost review. |
| 4 | Missing Time | Missing Time Entries Exception Report | Workers missing required time entries, manager follow-up, and payroll deadline prioritization. |
| 5 | Deductions | Deduction Exception Report | Failed, over, under, and arrears deduction exception review. |
| 6 | Tax Issues | Tax Exception Report | Missing, failed, over-withheld, under-withheld, and jurisdiction tax exception review. |

### Tab Badge Counts

| Tab | Badge Source | Badge Meaning |
| --- | --- | --- |
| Overview | Total open exception count | Count of all open exception records or distinct workers, depending on dashboard configuration. |
| Payroll Costs | Payroll completion variance count | Count of cost variance or payroll status items requiring review. |
| Overtime | Overtime Report distinct worker count | Workers with overtime above the selected threshold. |
| Missing Time | Missing Time Entries Report distinct worker count | Workers with missing required time entries. |
| Deductions | Deduction Exception Report distinct worker count | Workers with deduction exceptions. |
| Tax Issues | Tax Exception Report distinct worker count | Workers with tax exceptions. |

Badge counts should respect shared prompts and user security. Use red badge styling when the count is greater than 5, yellow when the count is 1-5, and no badge or green indicator when the count is 0.

## 3. Shared Prompts

Shared prompts should appear once at dashboard launch and apply to every tab.

| Shared Prompt | Required | Applies To | Default Behavior |
| --- | --- | --- | --- |
| Pay Period | Yes | All tabs | Default to current open payroll period or most recent calculated payroll period. |
| Company | Yes | All tabs | Default to the user's primary company security context when available. |
| Pay Group | No | Overview, Payroll Costs, Overtime, Missing Time, Deductions, Tax Issues | Leave blank to include all eligible pay groups in scope. |
| Department | No | All tabs | Leave blank to include all eligible departments in scope. |

### Prompt Rules

- Shared prompts must pass identical values to each sub-report.
- Sub-report-specific prompts should be hidden or defaulted when the shared dashboard prompt already provides equivalent filtering.
- Optional shared prompts should use "blank means all" behavior.
- Prompt values should display in the dashboard header and in exported output.
- Prompt validation should prevent running the dashboard without Pay Period and Company.

## 4. Tab Configuration

### Tab 1: Overview

| Setting | Configuration |
| --- | --- |
| Sub-Report Reference | Payroll Exception Dashboard - Overview |
| Specific Filters | Shared Pay Period, Company, Pay Group, Department. Summary counts only include open exception rows. |
| Layout Settings | KPI cards at top, exception breakdown chart, top 5 highlight lists, quick actions. |
| Row Limit | 5 rows per highlight section. |
| Pagination | Not required for KPI sections; highlight tables limited to top 5. |
| Auto-Refresh | Refresh when shared prompts are changed; optional 15-minute refresh during payroll close day. |

### Tab 2: Payroll Costs

| Setting | Configuration |
| --- | --- |
| Sub-Report Reference | Payroll Cost Summary Report |
| Specific Filters | Shared Pay Period, Company, Pay Group, Department; optional Payroll Status filter defaulted to all statuses. |
| Layout Settings | Group by Department, then Pay Group; include subtotals and grand total. |
| Row Limit | 500 rows per page. |
| Pagination | Enabled for worker-level details. |
| Auto-Refresh | Manual refresh or refresh when shared prompts change. |

### Tab 3: Overtime

| Setting | Configuration |
| --- | --- |
| Sub-Report Reference | Overtime Hours Exception Report |
| Specific Filters | Non-Exempt workers only; Overtime Hours > 0; shared Pay Period, Company, Pay Group, Department; Minimum OT Threshold defaulted to 0. |
| Layout Settings | Detail grid grouped by Department, Manager, Employee; include matrix view for last 4 week ending dates where available. |
| Row Limit | 250 rows per page for detail grid; matrix view should show all departments in scope. |
| Pagination | Enabled for detail grid. |
| Auto-Refresh | Manual refresh or refresh when shared prompts change. |

### Tab 4: Missing Time

| Setting | Configuration |
| --- | --- |
| Sub-Report Reference | Missing Time Entries Exception Report |
| Specific Filters | CF_Missing_Time_Flag = True; exclude approved leave; shared Pay Period, Company, Pay Group, Department; Minimum Missing Days Threshold defaulted to 1. |
| Layout Settings | Group by Department, then Manager; show missing dates, manager email, worker time entry link, and payroll deadline countdown. |
| Row Limit | 250 rows per page. |
| Pagination | Enabled for exception details. |
| Auto-Refresh | Optional 15-minute refresh on payroll cutoff day; otherwise manual or prompt-based refresh. |

### Tab 5: Deductions

| Setting | Configuration |
| --- | --- |
| Sub-Report Reference | Deduction Exception Report |
| Specific Filters | CF_Deduction_Exception is not None; shared Pay Period, Company, Pay Group, Department; Deduction Category and Exception Type defaulted to all; Minimum Variance Threshold defaulted to 0. |
| Layout Settings | Group by Exception Type, Deduction Category, Employee; include variance and arrears totals. |
| Row Limit | 250 rows per page. |
| Pagination | Enabled for exception details. |
| Auto-Refresh | Manual refresh or refresh when shared prompts change. |

### Tab 6: Tax Issues

| Setting | Configuration |
| --- | --- |
| Sub-Report Reference | Tax Exception Report |
| Specific Filters | CF_Tax_Exception is not None; shared Pay Period, Company, Pay Group, Department; Tax Type, Tax Authority, and Exception Type defaulted to all; Minimum Variance Threshold defaulted to 0. |
| Layout Settings | Group by Exception Type, Tax Type, Tax Authority, Employee; include jurisdiction and tax election drill-down fields. |
| Row Limit | 250 rows per page. |
| Pagination | Enabled for exception details. |
| Auto-Refresh | Manual refresh or refresh when shared prompts change. |

## 5. Layout and Design

| Area | Requirement |
| --- | --- |
| Header | Show company logo, dashboard title, selected Pay Period, Company, Pay Group, Department, run date/time, and user name. |
| Tab Navigation | Display six tabs in the specified order with badge counts for exception tabs. |
| Content Width | Use full available Workday report canvas while preserving readable table widths. |
| Footer | Show page numbers for exported output, confidentiality notice, report owner, and run timestamp. |
| Confidentiality Notice | "Confidential Payroll Information. For authorized use only." |
| Export Header | Include prompt values, run date/time, user name, and dashboard name. |
| Status Colors | Green for clear, yellow for warning, red for critical; include text labels so meaning is not color-only. |
| Mobile Responsiveness | Prioritize Overview tab KPIs, badge counts, and top actions; allow detail grids to scroll horizontally where necessary. |

### Header Mockup

```text
[Company Logo] Payroll Exception & Reporting Composite Dashboard
Pay Period: 2026-07-19 to 2026-08-01 | Company: US Company | Pay Group: All | Department: All
Run Date/Time: 2026-08-10 09:15 AM | User: Payroll Manager
```

### Footer Mockup

```text
Page 1 of 6 | Confidential Payroll Information. For authorized use only. | Payroll Operations | Run: 2026-08-10 09:15 AM
```

## 6. Worklet Integration

| Worklet Requirement | Configuration |
| --- | --- |
| Homepage Placement | Add to Payroll Manager's homepage as a payroll exception worklet. |
| Worklet Title | Payroll Exception Dashboard |
| Worklet Summary | Show total open exceptions, payroll completion rate, missing time count, overtime count, deduction issue count, and tax issue count. |
| Click Behavior | Open the composite dashboard with default shared prompts. |
| Refresh Behavior | Refresh on login and when Payroll Manager manually refreshes the worklet. |
| Security | Worklet visibility limited to authorized payroll and stakeholder roles. |

### Mobile Considerations

- Display KPI summary and exception badge counts first.
- Keep tab labels short: Overview, Costs, OT, Missing, Deduct, Tax.
- Collapse top highlight sections below KPI cards.
- Preserve drill-down links for worker details, but rely on Workday security to restrict sensitive fields.
- Avoid wide text-heavy columns in the mobile default view; expose full details through drill-down or export.

## 7. Sharing and Distribution

| Distribution Method | Configuration | Audience |
| --- | --- | --- |
| Scheduled Email Distribution | Send dashboard snapshot or Overview tab summary after scheduled payroll calculation and before payroll approval. | Payroll Manager, Payroll Administrator, HR Partner leads, Finance Analyst. |
| Saved Report Links | Save filtered links for common pay groups, companies, or departments. | Payroll Operations and authorized stakeholders. |
| Favorites Configuration | Add the composite dashboard to Payroll Manager favorites and payroll close shortcuts. | Payroll Manager and Payroll Administrator. |
| Export to Excel | Allow authorized users to export each tab or selected report output. | Payroll, Finance, Benefits, Tax users with export permission. |
| Payroll Close Checklist | Link dashboard as required review item. | Payroll Operations. |

### Distribution Controls

- Scheduled emails should include summary counts and links, not sensitive worker-level detail, unless the audience is authorized.
- Export permissions should follow payroll data security policy.
- Saved links must preserve prompt values but still enforce current user security.
- Distribution should be disabled for departments or users without approved payroll reporting access.

## 8. Security Access

| Role | Recommended Access |
| --- | --- |
| Payroll Manager | Full dashboard and all tabs for assigned organizations. |
| Payroll Administrator | Full dashboard and all tabs for assigned organizations. |
| HR Partner | Overview, Overtime, Missing Time, and limited worker context for assigned organizations. |
| Department Manager | Overview summary and worker-level exceptions only for direct or organization-based reports. |
| Benefits Administrator | Deductions tab and benefit election drill-down access where authorized. |
| Payroll Tax Analyst | Tax Issues tab and tax setup drill-down access where authorized. |
| Finance Analyst | Overview and Payroll Costs tabs; restrict sensitive worker payroll detail unless explicitly authorized. |

### Security Notes

- Use Workday domain security to enforce payroll result, tax, benefit, and time tracking access.
- Do not rely on dashboard tab visibility alone to secure sensitive details.
- Validate each tab with representative user roles before production release.
- Confirm exported output respects the same security restrictions as on-screen report data.

## 9. Configuration Steps in Workday

1. Navigate to **Create Composite Report**.
2. Enter the dashboard name **Payroll Exception & Reporting Composite Dashboard**.
3. Select the composite report type that supports tabbed sub-reports.
4. Add Tab 1 as **Overview** and reference **Payroll Exception Dashboard - Overview**.
5. Add Tab 2 as **Payroll Costs** and reference **Payroll Cost Summary Report**.
6. Add Tab 3 as **Overtime** and reference **Overtime Hours Exception Report**.
7. Add Tab 4 as **Missing Time** and reference **Missing Time Entries Exception Report**.
8. Add Tab 5 as **Deductions** and reference **Deduction Exception Report**.
9. Add Tab 6 as **Tax Issues** and reference **Tax Exception Report**.
10. Configure shared prompts for Pay Period, Company, Pay Group, and Department.
11. Mark Pay Period and Company as required prompts.
12. Map shared prompt values to equivalent prompts or filters in each sub-report.
13. Hide duplicate sub-report prompts where shared prompts already apply.
14. Configure tab badge counts for Overview, Payroll Costs, Overtime, Missing Time, Deductions, and Tax Issues.
15. Set row limits and pagination for each tab according to the Tab Configuration section.
16. Configure auto-refresh behavior for prompt changes and optional payroll cutoff refresh.
17. Add dashboard header fields for company logo, report title, run date/time, user name, and selected prompt values.
18. Add footer fields for page numbers, confidentiality notice, report owner, and run timestamp.
19. Configure tab-specific layout settings, grouping, totals, and conditional formatting.
20. Configure drill-down and navigation links between tabs and source reports.
21. Configure export settings for individual tabs and full dashboard output where supported.
22. Set security access for Payroll Manager, Payroll Administrator, HR Partner, Department Manager, Benefits Administrator, Payroll Tax Analyst, and Finance Analyst roles.
23. Add the dashboard to the Payroll Manager homepage as a worklet.
24. Configure worklet summary counts and click-through behavior.
25. Configure scheduled email distribution for the Overview summary if approved by payroll data policy.
26. Create saved report links for common payroll close views.
27. Add the dashboard to Payroll Manager favorites and payroll close shortcuts.
28. Validate each tab against the standalone source report using the same prompt values.
29. Validate all totals, badge counts, and status indicators.
30. Test security, exports, saved links, scheduled distribution, and mobile layout.
31. Migrate the composite dashboard through the standard tenant migration path after stakeholder signoff.

## 10. Production Validation Checklist

| Validation Area | Requirement |
| --- | --- |
| Prompt Mapping | Shared prompts apply correctly to every tab. |
| Reconciliation | Overview counts and totals reconcile to detail reports. |
| Badge Counts | Tab badges reflect the same filtered exception counts as the source reports. |
| Performance | Dashboard opens within acceptable tenant reporting performance standards for the expected user population. |
| Security | Each role sees only authorized tabs, rows, fields, drill-downs, and exports. |
| Export | Exported output includes prompt values, run date/time, and the confidentiality notice. |
| Mobile | Overview and tab navigation remain usable on mobile Workday views. |
| Worklet | Homepage worklet opens the dashboard with expected default prompts. |
| Distribution | Scheduled email and saved links preserve security and prompt behavior. |

## Acceptance Criteria

- Composite dashboard includes all six required tabs in the specified order.
- Shared prompts for Pay Period, Company, Pay Group, and Department appear once and apply to all tabs.
- Each tab references the correct standalone report and preserves its key filters, grouping, totals, and drill-downs.
- Header, footer, badge counts, row limits, pagination, and refresh settings are documented.
- Worklet integration, mobile considerations, sharing, and distribution are included.
- Configuration steps are detailed enough for a Workday report builder to implement in production.
