# Dashboard App Build Plan

## 1. Objective

Convert the Workday Payroll Exception & Reporting Dashboard documentation project into a presentable, portfolio-ready web dashboard that demonstrates payroll operations insight, Workday reporting knowledge, HRIS analysis, systems thinking, and stakeholder-ready data presentation.

The coded dashboard should make the project useful for interviews and portfolio reviews for roles such as:

| Target Role | Dashboard Should Demonstrate |
| --- | --- |
| Workday Payroll Analyst | Payroll exception review, payroll cost validation, pay period readiness, and approval support. |
| HRIS Analyst | HR/payroll data structure, worker attributes, organization hierarchy, prompts, filters, and security awareness. |
| Workday Functional Analyst | Business process understanding, requirement translation, report configuration logic, and user workflows. |
| Payroll Systems Analyst | Exception monitoring, system controls, reconciliation views, and operational metrics. |
| Workday Reporting Analyst | Advanced reports, matrix views, calculated fields, dashboards, exports, and drill-down logic. |
| Workday Consultant | End-to-end solution storytelling, stakeholder design, implementation roadmap, UAT, and adoption support. |
| Workday Integration Analyst | Data export readiness, integration-style sample datasets, field mapping, and downstream handoff points. |
| HR Systems Analyst | Workforce data quality, manager visibility, role-based access, and HR/payroll process alignment. |
| Payroll Operations Analyst | Daily exception triage, deadline tracking, aging issues, and resolution prioritization. |

## 2. Recommended Tech Stack

| Layer | Tooling | Why It Fits This Portfolio |
| --- | --- | --- |
| Frontend Framework | React + TypeScript + Vite | Fast to build, easy to present, and strongly typed for analyst-friendly data modeling. |
| Styling | Tailwind CSS | Clean dashboard UI, responsive layouts, fast iteration, and professional portfolio polish. |
| Charts | Recharts | KPI trends, exception breakdowns, overtime matrix visuals, and payroll cost charts. |
| Tables | TanStack Table | Sortable, filterable, paginated report-style tables similar to Workday report outputs. |
| Icons | Lucide React | Professional UI controls for refresh, export, filters, alerts, and drill-downs. |
| Mock Data | TypeScript seed data or JSON fixtures | Simulates Workday report output without needing a live Workday tenant. |
| Export | SheetJS/XLSX or CSV export | Demonstrates Excel export workflows used by Finance and Payroll teams. |
| Testing | Vitest + React Testing Library | Validates KPI calculations, filters, and exception logic. |
| Browser QA | Playwright | Confirms dashboard loads, tabs work, filters apply, and responsive views display correctly. |
| Documentation | Existing Markdown docs | Preserves the Workday functional/reporting specifications already created. |
| Optional Backend | None for MVP | A static dashboard is enough for portfolio presentation; simulated Workday exports can live in the app. |

## 3. Data Model Plan

The dashboard should use realistic sample data modeled after Workday report outputs.

| Dataset | Example Fields | Supports |
| --- | --- | --- |
| Workers | Employee ID, Name, Department, Manager, Worker Type, Exempt Status, Pay Group | Security, filtering, exception grouping. |
| Payroll Results | Gross Pay, Net Pay, Taxes, Deductions, Employer Costs, Payroll Status, Pay Period | Payroll cost report and completion KPIs. |
| Time Entries | Scheduled Hours, Actual Hours, Regular Hours, OT Hours, Missing Dates, Week Ending | Overtime and missing time reports. |
| Deduction Results | Deduction Name, Category, Expected Amount, Actual Amount, Variance, Exception Type | Deduction exception tracking. |
| Tax Results | Tax Authority, Expected Tax, Actual Tax, Tax Form Status, Exception Type | Tax exception monitoring. |
| KPI History | Period, Payroll Cost, Exception Rate, OT Cost Ratio, Completion Rate | Trend charts and period-over-period comparison. |

## 4. Day-Wise Build Tasks

### Day 1 - Dashboard Scope, Persona Mapping, and App Setup

**Goal:** Define the presentation angle and scaffold the dashboard app.

**Tasks:**
- Confirm the dashboard is a portfolio simulation using Workday-style sample data.
- Map dashboard sections to the target roles listed above.
- Choose app stack: React, TypeScript, Vite, Tailwind CSS, Recharts, TanStack Table.
- Create app folder structure.
- Set up routing or tab-based navigation for Overview, Payroll Costs, Overtime, Missing Time, Deductions, Tax Issues, and Documentation.

**Deliverables:**
- App scaffold running locally.
- Initial layout shell with header, navigation, and placeholder dashboard sections.
- Updated README section describing the coded dashboard layer.

### Day 2 - Sample Workday Data Model and Fixtures

**Goal:** Create realistic sample payroll data that supports all dashboard views.

**Tasks:**
- Build TypeScript types for workers, payroll results, time entries, deduction exceptions, tax exceptions, and KPI history.
- Create sample data for multiple departments, managers, pay groups, and pay periods.
- Include edge cases: missing time, overtime, failed deductions, tax issues, pending payroll, and no-exception workers.
- Add helper functions for currency, percentages, dates, and status labels.

**Deliverables:**
- `src/data/` sample datasets.
- `src/types/` dashboard data contracts.
- Reusable calculation utilities.

### Day 3 - Dashboard Layout and Global Filters

**Goal:** Build the main dashboard frame and filter experience.

**Tasks:**
- Implement header bar with title, role-focused subtitle, pay period selector, company/pay group/department filters, and refresh action.
- Create responsive layout for desktop, tablet, and mobile.
- Add filter state shared across all dashboard tabs.
- Add empty, loading, and no-exception states.

**Deliverables:**
- Global dashboard shell.
- Shared prompt/filter controls.
- Responsive foundation.

### Day 4 - KPI Cards and Executive Overview

**Goal:** Build the dashboard landing page for payroll readiness.

**Tasks:**
- Add KPI cards for Total Payroll Cost, Workers with Exceptions, Missing Time Entries, OT Hours/Cost, and Payroll Completion.
- Implement KPI calculations from sample data.
- Add severity colors: green, amber, red.
- Add period-over-period variance indicators.
- Add top exception highlights for overtime, missing time, deductions, and tax.

**Deliverables:**
- Overview tab with working KPI cards.
- Role-friendly summary for Payroll Manager and Payroll Operations Analyst use cases.

### Day 5 - Charts and Trend Visualizations

**Goal:** Make the dashboard visually presentable and useful for trend analysis.

**Tasks:**
- Add payroll cost trend chart by pay period.
- Add exception breakdown chart by exception type.
- Add overtime trend matrix by department and week.
- Add tooltips and click-to-filter behavior where practical.

**Deliverables:**
- Recharts visualizations.
- Trend-focused visuals for Finance, HRIS, and Reporting Analyst interviews.

### Day 6 - Report Tabs and Workday-Style Tables

**Goal:** Convert each markdown report specification into an interactive report view.

**Tasks:**
- Build Payroll Cost table with department/pay group grouping and totals.
- Build Overtime table sorted by OT hours descending.
- Build Missing Time table with missing dates and manager follow-up fields.
- Build Deduction Exception table grouped by exception type/category.
- Build Tax Exception table grouped by issue type.
- Add search, sorting, pagination, and row count summaries.

**Deliverables:**
- Five report tabs matching the Workday report specs.
- Workday-inspired analytical table experience.

### Day 7 - Drill-Downs, Action States, and Export

**Goal:** Add analyst workflows that show practical system usage.

**Tasks:**
- Add worker drill-down panel with payroll, time, deduction, and tax details.
- Add action buttons for manager notification, worker time entry review, export, and issue acknowledgement.
- Implement CSV or XLSX export for current filtered view.
- Add audit-friendly export metadata: pay period, filters, run timestamp, generated by.

**Deliverables:**
- Interactive drill-down experience.
- Exportable dashboard/report views.
- Clear operational workflow for payroll exception resolution.

### Day 8 - Role-Based Presentation Views

**Goal:** Make the dashboard speak directly to the target job titles.

**Tasks:**
- Add a "Role Lens" selector or presentation panel.
- Create concise role-specific summaries:
  - Payroll Analyst: payroll readiness and exception triage.
  - HRIS Analyst: data quality, org hierarchy, and security.
  - Workday Reporting Analyst: report outputs, calculated fields, and prompts.
  - Functional Analyst/Consultant: business process and UAT flow.
  - Integration Analyst: export fields and downstream handoff.
- Add a documentation tab linking to the existing markdown specs.

**Deliverables:**
- Role-based portfolio presentation layer.
- Interview-ready talking points inside the dashboard.

### Day 9 - Testing, Accessibility, and Responsive QA

**Goal:** Verify the dashboard behaves reliably and looks professional.

**Tasks:**
- Add unit tests for KPI calculations and exception thresholds.
- Add UI tests for filters, tabs, drill-downs, and exports.
- Check desktop, tablet, and mobile layouts.
- Validate color contrast and keyboard navigation.
- Confirm no table text overlaps or breaks on narrow screens.

**Deliverables:**
- Passing test suite.
- Responsive QA notes.
- Accessibility cleanup.

### Day 10 - Portfolio Polish and Final Review

**Goal:** Make the project ready to show to recruiters, hiring managers, and Workday teams.

**Tasks:**
- Add polished README instructions for running the dashboard.
- Add screenshots or screenshot placeholders from the running app.
- Add final project summary focused on business value and role relevance.
- Clean up unused files, inconsistent names, and stale placeholder text.
- Run final lint/build/test checks.

**Deliverables:**
- Completed coded dashboard.
- Updated README.
- Final screenshot guide.
- Clean local build ready for presentation.

## 5. Suggested App Folder Structure

```text
workday-payroll-exception-dashboard/
|-- src/
|   |-- app/
|   |   |-- App.tsx
|   |   `-- routes.tsx
|   |-- components/
|   |   |-- dashboard/
|   |   |-- filters/
|   |   |-- kpi/
|   |   |-- reports/
|   |   `-- ui/
|   |-- data/
|   |   |-- workers.ts
|   |   |-- payrollResults.ts
|   |   |-- timeEntries.ts
|   |   |-- deductionExceptions.ts
|   |   |-- taxExceptions.ts
|   |   `-- kpiHistory.ts
|   |-- lib/
|   |   |-- calculations.ts
|   |   |-- export.ts
|   |   |-- filters.ts
|   |   `-- formatters.ts
|   |-- types/
|   |   `-- dashboard.ts
|   |-- styles/
|   |   `-- globals.css
|   `-- main.tsx
|-- tests/
|   |-- calculations.test.ts
|   `-- dashboard.test.tsx
|-- docs/
|-- reports/
|-- dashboards/
|-- calculated-fields/
`-- README.md
```

## 6. Minimum Viable Dashboard

For the first coded version, prioritize:

1. Overview dashboard with KPI cards.
2. Shared filters for pay period, company, pay group, and department.
3. Three charts: payroll trend, exception breakdown, overtime trend.
4. Five report tabs with sortable/filterable tables.
5. Worker drill-down panel.
6. CSV/XLSX export.
7. Role-based presentation notes.

## 7. Success Criteria

| Criteria | Target |
| --- | --- |
| Dashboard Loads | Local app opens without console errors. |
| KPI Accuracy | KPI calculations match documented formulas. |
| Report Coverage | All five detailed reports are represented as dashboard tabs. |
| Role Alignment | Dashboard can be explained for each target analyst/consultant role. |
| Presentation Quality | UI is clean, responsive, and suitable for a portfolio walkthrough. |
| Export Support | User can export filtered report data for Excel-style analysis. |
| Documentation Linkage | Dashboard references the existing Workday report specs and calculated field docs. |

## 8. Build Order Recommendation

Start with a static React dashboard using sample data. Do not add backend complexity until the portfolio version is polished. The value of this project is showing Workday payroll reporting knowledge, exception logic, data analysis, and stakeholder-ready presentation.

After the MVP is complete, optional enhancements can include simulated Workday RaaS imports, JSON upload, CSV upload, authentication mockups, or integration mapping views.
