# Workday Payroll Exception & Reporting Dashboard

![Status](https://img.shields.io/badge/status-documentation_complete-brightgreen)
![Platform](https://img.shields.io/badge/platform-Workday-blue)
![Reports](https://img.shields.io/badge/reports-Advanced%20%7C%20Matrix%20%7C%20Composite-1976D2)
![Exports](https://img.shields.io/badge/export-Microsoft%20Excel-217346)
![Timeline](https://img.shields.io/badge/duration-4%20weeks-orange)

## Project Overview

The Workday Payroll Exception & Reporting Dashboard is a portfolio-ready documentation project for a Workday-native payroll reporting solution. It defines advanced reports, calculated fields, KPI logic, a composite dashboard, testing artifacts, UAT scenarios, defect tracking, assumptions, and sample outputs for payroll exception management.

Payroll managers often lack a single, reliable view of payroll exceptions before approval. Missing time, unexpected overtime, failed deductions, tax issues, and payroll cost variances may live in separate reports or manual spreadsheets. This project solves that problem with a centralized Workday dashboard that detects exceptions automatically, summarizes payroll readiness, and provides drill-down paths to detailed reports and resolution workflows.

## Tech Stack

- Workday Advanced Reports
- Workday Matrix Reports
- Workday Composite Reports
- Workday Calculated Fields
- Workday Time Tracking, Payroll, Benefits, and Tax data sources
- Microsoft Excel for export and offline analysis
- Markdown documentation for functional, technical, testing, and portfolio artifacts
- React, TypeScript, and Vite for the interactive portfolio dashboard
- Tailwind CSS for responsive dashboard styling
- Recharts for KPI and trend visualizations
- TanStack Table for sortable report-style tables
- Lucide React for dashboard actions and status icons
- Vitest for calculation and UI behavior tests

## Features

- Real-time payroll cost summary by department, pay group, and period
- Automated overtime detection and alerting for workers over 40 hours per week
- Missing time entry identification before payroll close
- Deduction exception tracking for failed, over-deducted, under-deducted, and arrears cases
- Tax withholding compliance monitoring for missing, failed, over-withheld, under-withheld, and jurisdiction issues
- Single composite dashboard with shared prompts and drill-down capability
- KPI cards for payroll cost, workers with exceptions, missing time, overtime, and payroll completion
- Matrix view for overtime trends across departments
- Excel export for Finance, audit, and offline analysis
- Security, UAT, performance, and defect documentation for production readiness
- Interactive dashboard shell with role-based presentation lens for payroll, HRIS, reporting, systems, and consulting roles

## Interactive Dashboard App

This repository now includes the start of a coded dashboard application that presents the Workday payroll reporting solution as an interview-ready portfolio experience.

The app is designed for these target roles:

- Workday Payroll Analyst
- HRIS Analyst
- Workday Functional Analyst
- Payroll Systems Analyst
- Workday Reporting Analyst
- Workday Consultant
- Workday Integration Analyst
- HR Systems Analyst
- Payroll Operations Analyst

Day 1 implementation includes:

- React + TypeScript + Vite project scaffold
- Global dashboard header with Workday-style prompts
- Overview tab with KPI cards and exception summary
- Role lens selector for tailoring the presentation to different analyst and consultant roles
- Tab shell for Payroll Costs, Overtime, Missing Time, Deductions, Tax Issues, and Documentation
- Responsive layout foundation for desktop, tablet, and mobile views

## Project Structure

```text
workday-payroll-exception-dashboard/
|-- README.md
|-- LICENSE
|-- package.json
|-- index.html
|-- vite.config.js
|-- tailwind.config.js
|-- assets/
|   |-- architecture.png
|   |-- workflow.png
|   `-- screenshots/
|-- calculated-fields/
|   |-- Payroll_Status_CF.md
|   |-- Overtime_Hours_CF.md
|   |-- Missing_Time_CF.md
|   |-- Deduction_Check_CF.md
|   `-- Tax_Exception_CF.md
|-- dashboards/
|   |-- Composite_Dashboard.md
|   |-- Dashboard_Layout.md
|   `-- KPI_Definitions.md
|-- docs/
|   |-- Project_Overview.md
|   |-- Business_Requirements.md
|   |-- Functional_Design.md
|   |-- Technical_Design.md
|   |-- Assumptions.md
|   `-- Lessons_Learned.md
|-- report-design/
|   |-- Business_Objects.md
|   |-- Data_Sources.md
|   |-- Filters.md
|   |-- Prompts.md
|   |-- Report_Matrix.md
|   `-- Security.md
|-- reports/
|   |-- Dashboard_Overview.md
|   |-- Payroll_Cost_Report.md
|   |-- Overtime_Report.md
|   |-- Missing_Time_Entries_Report.md
|   |-- Deduction_Exception_Report.md
|   `-- Tax_Exception_Report.md
|-- samples/
|   |-- sample-payroll-cost.xlsx
|   |-- sample-overtime.xlsx
|   |-- sample-tax-report.xlsx
|   `-- dashboard-screenshots/
|-- src/
|   |-- App.tsx
|   |-- main.tsx
|   |-- components/
|   |-- data/
|   |-- styles/
|   `-- types/
`-- testing/
    |-- Test_Cases.md
    |-- UAT_Scenarios.md
    `-- Defect_Log.md
```

## Reports Built

| Report | Type | Purpose |
| --- | --- | --- |
| Payroll Exception Dashboard - Overview | Workday Advanced Report, summary landing page | Provides KPI cards, exception counts, top highlights, status indicators, and navigation to detailed reports. |
| Payroll Cost Summary Report | Workday Advanced Report | Breaks down payroll cost by department, pay group, worker, and period, including gross pay, net pay, deductions, taxes, employer costs, and variance. |
| Overtime Hours Exception Report | Workday Advanced Report with Matrix option | Identifies non-exempt workers with overtime, calculates overtime cost, applies threshold alerts, and shows department trends. |
| Missing Time Entries Exception Report | Workday Advanced Report | Detects workers missing required time entries by comparing schedules, submitted time, and approved leave. |
| Deduction Exception Report | Workday Advanced Report | Tracks failed deductions, over/under deductions, deduction variance, and arrears balances. |
| Tax Exception Report | Workday Advanced Report | Monitors withholding exceptions, tax variance, expired or missing elections, and jurisdiction issues. |
| Payroll Exception & Reporting Composite Dashboard | Workday Composite Report | Combines all reports into a tabbed dashboard with shared prompts, tab badge counts, drill-downs, and export options. |

## Calculated Fields

| Calculated Field | Purpose | Core Logic |
| --- | --- | --- |
| `CF_Payroll_Status` | Consolidates payroll processing state for dashboard and Payroll Cost Report. | Returns Error, Pending, Complete, or Not Started based on payroll result status, time entry completeness, deduction failures, and tax exceptions. |
| `CF_Overtime_Hours` | Calculates overtime for eligible workers. | Returns overtime hours for non-exempt workers based on weekly threshold, eligible time types, and state-specific daily overtime rules. |
| `CF_Missing_Time_Flag` | Identifies workers with missing required time entries. | Compares expected scheduled work days to submitted or approved time entry days, excluding approved PTO, holidays, and leave. |
| `CF_Missing_Time_Days` | Counts missing time entry days. | Returns the number of scheduled days without submitted or approved time entries after exclusions. |
| `CF_Deduction_Exception` | Classifies deduction issues. | Returns Failed, Over-Deducted, Under-Deducted, Arrears, or None based on expected amount, actual amount, variance, and arrears balance. |
| `CF_Deduction_Variance` | Quantifies deduction difference. | Calculates actual deduction amount minus expected deduction amount. |
| `CF_Tax_Exception` | Classifies payroll tax issues. | Returns tax exception categories such as No Withholding, Missing Tax Election, Expired Tax Form, Multi-State Issue, Excess Withholding, Under Withholding, or None. |
| `CF_Tax_Variance` | Quantifies tax withholding difference. | Calculates actual tax withheld minus expected tax withholding. |

## Dashboard

The composite dashboard gives payroll stakeholders a single-pane-of-glass view of payroll readiness. It includes an Overview tab and detail tabs for Payroll Costs, Overtime, Missing Time, Deductions, and Tax Issues.

Primary dashboard KPIs:

- Total Payroll Cost with prior-period trend
- Workers with Exceptions
- Missing Time Entries
- Overtime Hours and Overtime Cost
- Payroll Completion Rate
- Exception Rate
- Overtime Cost Ratio
- Deduction Failure Rate
- Tax Exception Count
- Days to Payroll Deadline

The dashboard uses shared prompts for Pay Period, Company, Pay Group, and Department. Each tab includes relevant grouping, filtering, row limits, drill-downs, and Excel export behavior.

## Screenshots and Samples

This repository is documentation-first and does not include live Workday tenant screenshots. Placeholder descriptions for portfolio screenshots are documented in [docs/Assumptions.md](docs/Assumptions.md), with the intended storage location at `samples/dashboard-screenshots/`.

Recommended screenshot placeholders:

- [Main Dashboard Overview](samples/dashboard-screenshots/)
- [Payroll Cost Report](samples/dashboard-screenshots/)
- [Overtime Report](samples/dashboard-screenshots/)
- [Missing Time Entries Report](samples/dashboard-screenshots/)
- [Deduction Exception Report](samples/dashboard-screenshots/)
- [Tax Exception Report](samples/dashboard-screenshots/)
- [Composite Dashboard Tab View](samples/dashboard-screenshots/)
- [Excel Export Sample](samples/dashboard-screenshots/)
- [Filter and Prompt Configuration](samples/dashboard-screenshots/)
- [Mobile or Responsive View](samples/dashboard-screenshots/)

Sample Excel workbooks:

- [sample-payroll-cost.xlsx](samples/sample-payroll-cost.xlsx)
- [sample-overtime.xlsx](samples/sample-overtime.xlsx)
- [sample-tax-report.xlsx](samples/sample-tax-report.xlsx)

## Duration

4 weeks

## Role

Workday Report Developer / Functional Consultant

Responsibilities covered:

- Business requirements interpretation
- Workday report specification
- Calculated field design
- Dashboard layout and KPI definition
- Security and prompt design
- Testing and UAT documentation
- Defect logging and final project review

## How to Use This Repository

Start here:

1. Read [docs/Project_Overview.md](docs/Project_Overview.md) for project context.
2. Review [docs/Business_Requirements.md](docs/Business_Requirements.md) and [docs/Functional_Design.md](docs/Functional_Design.md) for scope and business requirements.
3. Use [report-design/](report-design/) for data sources, business objects, prompts, filters, matrix design, and security design.
4. Open [calculated-fields/](calculated-fields/) for reusable Workday calculated field specifications.
5. Review [reports/](reports/) for detailed Workday report specifications.
6. Review [dashboards/](dashboards/) for composite dashboard, layout, and KPI definitions.
7. Use [testing/](testing/) for QA test cases, UAT scenarios, and defect tracking.
8. See [samples/](samples/) for sample exports and portfolio screenshot placeholder location.
9. Read [docs/Assumptions.md](docs/Assumptions.md) and [docs/Lessons_Learned.md](docs/Lessons_Learned.md) for final review, constraints, risks, and retrospective notes.
10. Review [docs/Dashboard_App_Build_Plan.md](docs/Dashboard_App_Build_Plan.md) for the day-wise coded dashboard implementation plan.

Run the dashboard locally:

```bash
npm install
npm run dev
```

Build the dashboard:

```bash
npm run build
```

## Production Readiness Notes

Before implementing this design in a live Workday tenant:

- Validate all data sources in the target tenant.
- Confirm payroll, time tracking, benefits, tax, and organization security domains.
- Build and test calculated fields independently.
- Reconcile report totals to payroll register and source reports.
- Test row-level security, drill-downs, saved links, and Excel exports.
- Performance-test with realistic worker and payroll-result volumes.
- Complete UAT sign-off with Payroll, HR, Finance, Benefits, Tax, and Security stakeholders.

## Repository Status

This repository is a completed documentation and portfolio artifact. It is designed to demonstrate Workday reporting analysis, dashboard design, calculated field planning, QA/UAT documentation, and payroll operations understanding.
