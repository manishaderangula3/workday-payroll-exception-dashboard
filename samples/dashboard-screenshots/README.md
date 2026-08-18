# Dashboard Screenshot Placeholder Guide

## 1. Purpose

This folder is reserved for portfolio screenshots and annotated sample images for the Workday Payroll Exception & Reporting Dashboard project. Because this repository documents a Workday reporting build rather than connecting to a live tenant, the entries below describe the screenshots that would be captured from a configured Workday tenant.

Use these placeholder descriptions to guide future screenshot creation, portfolio presentation, and stakeholder walkthroughs.

## 2. Screenshot Inventory

| Screenshot | Proposed File Name | What It Would Show | Key Elements Visible | Project Value Demonstrated | Suggested Annotations |
| --- | --- | --- | --- | --- | --- |
| Main Dashboard Overview | `01-main-dashboard-overview.png` | The Payroll Exception Dashboard landing page for the selected pay period. | KPI cards, exception counts, completion rate, top exception highlights, run timestamp. | Shows the single-page operating view payroll managers use before approval. | Call out payroll completion rate, total exceptions, and critical issue count. |
| Payroll Cost Report | `02-payroll-cost-report.png` | Payroll Cost Summary grouped by Department and Pay Group. | Gross pay, net pay, deductions, taxes, employer costs, total payroll cost, subtotals, grand total. | Demonstrates finance-ready payroll cost visibility and exportable totals. | Highlight department subtotal rows and prior-period variance column. |
| Overtime Report | `03-overtime-report.png` | Overtime Hours Exception Report sorted by highest overtime hours. | Worker, department, manager, scheduled hours, actual hours, overtime hours, OT cost, alert color. | Shows proactive identification of labor cost and compliance risks. | Call out yellow/red threshold flags and top overtime worker. |
| Missing Time Entries Report | `04-missing-time-entries-report.png` | Exception-only report filtered to workers with missing time. | Missing days count, missing dates, manager email, time entry status, payroll deadline countdown. | Demonstrates pre-payroll close issue detection and manager follow-up workflow. | Highlight missing dates and manager notification action. |
| Deduction Exception Report | `05-deduction-exception-report.png` | Deduction issues grouped by exception type and deduction category. | Expected amount, actual amount, variance, arrears balance, payroll run, drill-down links. | Shows payroll/benefits reconciliation support for failed, over, under, and arrears deductions. | Call out variance and resolution workflow link. |
| Tax Exception Report | `06-tax-exception-report.png` | Tax compliance exceptions for worker tax setup and withholding. | Exception type, tax authority, expected tax, actual tax, variance, tax form status. | Demonstrates compliance monitoring and pre-approval tax review. | Highlight expired/missing tax form and withholding variance. |
| Composite Dashboard | `07-composite-dashboard-tabs.png` | Workday Composite Report with tabbed navigation across all report views. | Overview, Payroll Costs, Overtime, Missing Time, Deductions, Tax Issues tabs with badges. | Shows how separate reports are combined into one stakeholder dashboard. | Call out shared prompts and exception count badges. |
| Excel Export Sample | `08-excel-export-sample.png` | Formatted Excel export from one of the Workday reports. | Frozen header row, subtotal rows, currency formatting, filter dropdowns, export timestamp. | Demonstrates offline finance analysis and audit evidence readiness. | Highlight preserved formatting and subtotal validation. |
| Filter/Prompt Configuration | `09-filter-prompt-configuration.png` | Workday prompt screen before running the report/dashboard. | Pay Period, Company, Pay Group, Department, minimum threshold prompts. | Shows configurable report execution without report redesign. | Call out shared prompts that apply across dashboard tabs. |
| Mobile/Responsive View | `10-mobile-responsive-view.png` | Dashboard rendered on a phone or narrow viewport. | Stacked KPI cards, simplified detail table, tab access, key exception indicators. | Demonstrates usability for managers reviewing exceptions away from desktop. | Highlight compact KPI stack and preserved drill-down access. |

## 3. Screenshot Standards

| Standard | Guidance |
| --- | --- |
| Data Privacy | Use fictional workers, masked employee IDs, and sanitized company names. |
| Consistency | Use the same pay period, company, and department filters across related screenshots. |
| Visual Quality | Capture full-width images where possible and crop only when focusing on a specific interaction. |
| Annotations | Use numbered callouts or short labels to identify the business value of each area. |
| File Naming | Prefix files with two-digit sequence numbers so they appear in walkthrough order. |
| Accessibility | Ensure screenshots have descriptive alt text when embedded in portfolio pages or README files. |

## 4. Recommended Portfolio Flow

1. Start with the main dashboard overview to establish the payroll manager experience.
2. Show the composite dashboard tabs to demonstrate report navigation.
3. Walk through the four exception categories: overtime, missing time, deductions, and tax.
4. Show payroll cost reporting for finance and reconciliation use cases.
5. End with Excel export and prompt configuration to demonstrate operational readiness.

## 5. Placeholder Notes

The screenshots are intentionally described rather than captured from a real tenant. When a sandbox or demo tenant becomes available, replace each placeholder with a sanitized screenshot that follows the naming convention and standards above.
