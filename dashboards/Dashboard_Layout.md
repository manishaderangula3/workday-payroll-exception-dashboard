# Dashboard Layout

## 1. Document Overview

| Item | Specification |
| --- | --- |
| Dashboard Name | Payroll Exception Dashboard |
| Document Purpose | Define the production visual layout, responsive behavior, and interaction model for the Payroll Exception Dashboard. |
| Primary Users | Payroll Manager, Payroll Administrator, HR Partner, Department Manager, Benefits Administrator, Payroll Tax Analyst, Finance Analyst |
| Primary Use Case | Daily payroll exception monitoring, payroll close readiness review, and rapid drill-down into exception categories. |
| Related Specifications | `Dashboard_Overview.md`, `Composite_Dashboard.md`, `KPI_Definitions.md` |

## 2. Layout Structure

The dashboard should present a concise operational view first, followed by actionable exception details. The layout should help Payroll Managers answer four questions quickly:

- Is payroll ready to approve?
- Which exception categories need immediate action?
- Which workers or departments are driving the risk?
- What detail report or action should be opened next?

### Page Regions

| Region | Placement | Required Elements | Behavior |
| --- | --- | --- | --- |
| Header Bar | Top of page, persistent while viewing dashboard when supported | Company logo, dashboard title, Pay Period selector, Company selector, Pay Group selector, Department selector, Refresh button | Provides context and shared prompt control for the full dashboard. |
| KPI Row | Directly below header | 4-5 KPI cards in a horizontal row on desktop | Shows payroll health at a glance with status color and trend indicators. |
| Alert Section | Below KPI row | Critical exceptions requiring immediate action | Displays high-risk exceptions across missing time, red overtime, deduction failures, and tax issues. |
| Chart Section | Middle of page | Payroll Trend chart and Exception Breakdown chart side by side | Supports trend review and exception mix analysis. |
| Detail Table | Below charts | Scrollable table with exception details | Shows filtered exception records and drill-down links. |
| Footer | Bottom of page or export footer | Last updated timestamp, export buttons, confidentiality notice | Supports auditability, export, and compliance. |

## 3. Header Bar

| Header Element | Requirement |
| --- | --- |
| Logo | Display company logo at the far left. Use a compact logo treatment so it does not compete with dashboard content. |
| Title | Display `Payroll Exception Dashboard` prominently in the header. |
| Pay Period Selector | Required prompt. Default to current open payroll period or most recent calculated period. |
| Company Selector | Required prompt. Default to the user's primary company security context when available. |
| Pay Group Selector | Optional prompt. Blank means all eligible pay groups. |
| Department Selector | Optional prompt. Blank means all eligible departments. |
| Refresh Button | Re-runs dashboard data using current prompt values. Display last refreshed time after refresh completes. |

### Header Behavior

- Shared prompt values should apply to all KPI cards, charts, alerts, and detail table rows.
- The Refresh button should show a loading or processing state while the dashboard is reloading.
- If a required prompt is missing, disable refresh and show a validation message near the prompt area.
- Header should remain compact enough to preserve first-screen visibility of KPI cards.

## 4. KPI Row

The KPI row should contain five cards on desktop and should preserve the same ordering across all screen sizes.

| Card | KPI | Primary Display | Secondary Display | Status Treatment |
| --- | --- | --- | --- | --- |
| 1 | Total Payroll Cost | `$X.XXM` | Prior period amount and percent change | Trend arrow, color based on variance threshold. |
| 2 | Workers with Exceptions | `X` workers | Percent of total workers | Severity color based on exception rate. |
| 3 | Missing Time Entries | `X` workers | Total missing days | Green, amber, or red based on missing worker count. |
| 4 | OT Hours | `X` total hours | `$X` overtime cost | Green, amber, or red based on overtime cost ratio and red overtime flags. |
| 5 | Payroll Completion | `X%` | Complete workers / expected workers | Green, amber, or red based on completion threshold. |

### KPI Card Design

| Design Element | Requirement |
| --- | --- |
| Card Size | Equal width cards on desktop; stable height so status changes do not shift layout. |
| Primary Number | Largest text on the card. Use currency, count, hours, or percent format as appropriate. |
| Label | Short and consistent, placed above or beside primary number. |
| Trend Indicator | Use up, down, or flat arrow icon with percent change where applicable. |
| Severity Color | Use left border, top border, or small status indicator. Do not rely on background color alone. |
| Tooltip | On hover, show formula, data source, refresh time, and threshold status. |
| Click Action | Filters the detail table to the KPI category. |

## 5. Alert Section

The Alert Section should show only exceptions requiring immediate action. It should be visually distinct from normal detail rows but should remain compact.

| Alert Type | Inclusion Rule | Required Fields | Action |
| --- | --- | --- | --- |
| Critical Missing Time | Missing Days Count > 3 or Days Until Payroll Deadline < 2 | Employee, Department, Manager, Missing Days, Missing Dates, Deadline | Open Missing Time tab or notify manager. |
| Critical Overtime | Overtime Hours > 10 per week | Employee, Department, Manager, OT Hours, OT Cost | Open Overtime tab filtered to worker. |
| Deduction Failure | Exception Type = Failed or Arrears Balance > 0 | Employee, Deduction, Amount, Arrears Balance | Open Deduction tab filtered to worker. |
| Tax Critical | Exception Type = Failed, Missing, or Invalid Jurisdiction | Employee, Tax Authority, Issue Type, Variance | Open Tax Issues tab filtered to worker. |

### Alert Section Behavior

- Sort alerts by severity first, then payroll deadline urgency, then financial impact.
- Show a maximum of 10 critical alerts by default.
- Provide a `View All Critical Exceptions` link to the filtered detail table.
- Include status text such as `Critical` or `Action Required` in addition to color.

## 6. Chart Section

The chart section should contain two charts side by side on desktop.

### Chart 1: Payroll Trend

| Setting | Specification |
| --- | --- |
| Chart Type | Line chart or column chart with current and prior period comparison. |
| X-Axis | Pay periods, preferably last 12 periods when available. |
| Y-Axis | Total Payroll Cost. |
| Secondary Series | Optional exception count or payroll completion rate. |
| Tooltip | Pay period, total payroll cost, percent change, worker count, exception count. |
| Click Behavior | Opens Payroll Cost Report for the selected pay period. |

### Chart 2: Exception Breakdown

| Setting | Specification |
| --- | --- |
| Chart Type | Donut chart, pie chart, or stacked bar when donut is not available. |
| Segments | Missing Time, Overtime, Deduction Issues, Tax Exceptions. |
| Value | Distinct workers with exceptions by category. |
| Tooltip | Category name, worker count, percent of all exceptions, status threshold. |
| Click Behavior | Filters detail table and opens relevant report tab when drill-down is selected. |

## 7. Detail Table

The detail table should show the currently selected exception category or all exceptions by default.

| Column | Source | Format |
| --- | --- | --- |
| Exception Category | Source detail report | Text |
| Severity | KPI or exception threshold calculation | Text with status color |
| Employee ID | Worker | Text |
| Employee Name | Worker | Text with drill-down |
| Department | Worker organization | Text |
| Manager | Worker manager | Text |
| Pay Period | Payroll period | Date range or period name |
| Exception Detail | Source exception message or calculated field | Text |
| Amount or Hours | Source report amount or hours | Currency or number |
| Required Action | Resolution workflow | Text |
| Owner | Manager, Payroll, Benefits, Tax, or HR | Text |
| Status | Open, In Review, Resolved | Text |
| Drill-down | Detail report link | URL or related action |

### Table Behavior

- Default sort: Severity descending, then Amount or Hours descending, then Employee Name A-Z.
- Rows per page: 50 on desktop, 25 on tablet, 10 on mobile.
- Table should support horizontal scrolling for narrow screens.
- Table should preserve current filters when exported.
- Clicking an employee opens the relevant worker detail or source exception report.

## 8. Footer

| Footer Element | Requirement |
| --- | --- |
| Last Updated Timestamp | Display the most recent successful refresh time. |
| Export Current View | Exports the currently filtered dashboard detail table to Excel. |
| Export Full Dashboard | Exports KPI summary, charts where supported, and all current detail tabs. |
| Confidentiality Notice | Display `Confidential Payroll Information. For authorized use only.` |
| Support Contact | Optional payroll operations contact or shared mailbox. |

## 9. Responsive Design

| Breakpoint | Layout Behavior |
| --- | --- |
| Desktop | Full layout with header prompts, five KPI cards in one row, side-by-side charts, full alert section, and full detail table. |
| Tablet | Header prompts may wrap to a second row; KPI row remains visible using equal-width cards; charts stack vertically; detail table remains scrollable. |
| Mobile | KPI cards stack vertically; charts stack vertically; alert section shows top 3 critical alerts first; detail table switches to simplified columns with drill-down for full details. |

### Mobile Detail Table Columns

Recommended mobile columns:

- Severity
- Employee Name
- Exception Category
- Amount or Hours
- Required Action

All other details should remain accessible through drill-down or export.

## 10. Color Scheme

| Token | Color | Usage |
| --- | --- | --- |
| Primary | `#1976D2` | Header bar, dashboard title, selected tab indicator, primary action button. |
| Success | `#4CAF50` | On-track metrics, clear categories, successful completion indicators. |
| Warning | `#FF9800` | Attention-needed metrics, yellow exception categories, draft or pending items. |
| Critical | `#F44336` | Immediate action, critical alerts, red exception status, failed payroll items. |
| Neutral Text | `#263238` | Primary body text and table values. |
| Muted Text | `#607D8B` | Secondary labels, helper text, timestamp text. |
| Divider | `#E0E0E0` | Table borders, card separators, section dividers. |
| Surface | `#FFFFFF` | Card and table backgrounds. |

### Accessibility Rules

- Every colored status must include a text label: Clear, Warning, Critical, Complete, Pending, Failed, or Action Required.
- Use sufficient contrast for all status text and card labels.
- Avoid using only red and green to communicate meaning.
- Tooltips should be available for icons, trend arrows, and chart segments.

## 11. Interaction Design

| Interaction | Expected Behavior |
| --- | --- |
| Click KPI card | Filters the detail table to the relevant category and updates active filter chips. |
| Click Total Payroll Cost card | Opens or filters to the Payroll Costs view. |
| Click Workers with Exceptions card | Shows all exception categories in the detail table. |
| Click Missing Time Entries card | Filters table to Missing Time and provides manager notification actions. |
| Click OT Hours card | Filters table to Overtime and sorts by Overtime Hours descending. |
| Click Payroll Completion card | Opens payroll status details and incomplete worker list where available. |
| Click chart segment | Opens the related detailed report or filters the table to that segment. |
| Hover over KPI card | Shows tooltip with formula, data source, threshold, and last refresh time. |
| Hover over chart point or segment | Shows tooltip with period, value, percent change, and count. |
| Export Current View | Downloads the current filtered view to Excel with prompt values and timestamp. |
| Refresh Button | Re-runs all KPI, chart, alert, and detail table queries with current prompts. |

### Filter State

- Active filters should display as removable chips above the detail table.
- Reset Filters should return the detail table to all exception categories for the current shared prompts.
- Filter state should persist when users move between dashboard tabs during the same session.

## 12. ASCII Wireframe

```text
+----------------------------------------------------------------------------------------------------+
| [Logo] Payroll Exception Dashboard            Pay Period [v] Company [v] Pay Group [v] Dept [v] [Refresh] |
+----------------------------------------------------------------------------------------------------+
| Total Payroll Cost | Workers w/ Exceptions | Missing Time | OT Hours / Cost | Payroll Completion  |
| $14.24M  +2.2%     | 31 Critical           | 8 workers    | 324.75 / $18.4K | 98.7%              |
+----------------------------------------------------------------------------------------------------+
| Critical Alerts                                                                                     |
| [Red] Jordan Patel - Missing 5 days - Deadline 1 day  [Notify Manager] [Open Detail]                |
| [Red] Taylor Kim - OT 13.25 hours - $636.00       [Open Overtime]                                  |
+----------------------------------------------------------------------------------------------------+
| Payroll Trend                                    | Exception Breakdown                              |
| [Line/Column Chart: 12 periods]                  | [Donut: Missing, OT, Deductions, Tax]           |
+----------------------------------------------------------------------------------------------------+
| Active Filters: Pay Period 2026-07-19 to 2026-08-01 | Company US Company | All Exceptions [x]       |
+----------------------------------------------------------------------------------------------------+
| Exception Detail Table                                                                           [Export] |
| Category | Severity | Employee | Department | Manager | Period | Detail | Amount/Hours | Action | Link |
| Missing  | Critical | Jordan P | Support    | Avery B | 08/01  | 5 days | 5 days       | Notify | Open |
| Overtime | Critical | Taylor K | Ops        | Dana B  | 08/01  | OT >10 | 13.25 hrs    | Review | Open |
+----------------------------------------------------------------------------------------------------+
| Last Updated: 2026-08-11 09:15 AM | Export Current View | Export Full Dashboard | Confidential Payroll Info |
+----------------------------------------------------------------------------------------------------+
```

## 13. Production Readiness Checklist

| Area | Requirement |
| --- | --- |
| Prompt Behavior | Header prompt values apply consistently to KPIs, charts, alerts, and table rows. |
| KPI Accuracy | KPI values reconcile to `KPI_Definitions.md` and source reports. |
| Navigation | KPI cards, chart segments, alert actions, and table links route to correct detailed reports. |
| Responsiveness | Desktop, tablet, and mobile layouts remain usable without overlapping content. |
| Accessibility | Color, text labels, and tooltips meet accessibility expectations. |
| Export | Exported files preserve current filters, prompt values, timestamp, and confidentiality notice. |
| Performance | Dashboard load and refresh times are acceptable for the payroll close user population. |
| Security | User role security controls all visible rows, fields, drill-down links, and export output. |

## Acceptance Criteria

- Dashboard layout includes header, KPI row, alert section, chart section, detail table, and footer.
- Five KPI card designs are documented with display values, trend or severity treatments, and click behavior.
- Desktop, tablet, and mobile responsive layouts are specified.
- Color scheme uses the required Workday-friendly blue, green, amber, and red values.
- Interaction rules define KPI filtering, chart drill-down, hover tooltips, refresh, and Excel export.
- ASCII wireframe provides a clear implementation guide for the dashboard layout.
