# Assumptions & Constraints

## 1. Document Overview

| Item | Specification |
| --- | --- |
| Project | Workday Payroll Exception Dashboard |
| Document Purpose | Document assumptions, constraints, dependencies, risks, sample data expectations, and screenshot placeholders for the portfolio deliverable. |
| Primary Audience | Payroll Manager, Workday Report Builder, HRIS, IT/Security, Project Sponsor, Portfolio Reviewer |
| Project Phase | Day 19 - Screenshots, Samples & Assumptions |
| Related Artifacts | Reports, dashboard specifications, test cases, UAT scenarios, defect log, sample workbooks, and `samples/dashboard-screenshots` folder |

## 2. Project Assumptions

| Assumption | Description | Impact if False |
| --- | --- | --- |
| Advanced Reporting is available | Workday tenant is configured with Advanced Reporting license and report builder access. | Dashboard and detailed reports may require redesign using available reporting tools. |
| Payroll is implemented | Payroll module is fully implemented and actively processing payroll results. | Payroll cost, tax, deduction, and payroll status reports cannot be validated against actual results. |
| Time Tracking is active | Time Tracking module is active for hourly and non-exempt workers. | Overtime and missing time reports may need alternate time data sources. |
| Workers have schedules | All workers expected to submit time have assigned work schedules in Workday. | Missing time calculations may be incomplete or inaccurate. |
| Security groups exist | Security groups exist for Payroll Admin, Payroll Manager, HR Partner, Manager, Benefits Administrator, Tax Analyst, and Finance roles. | Role-based access and UAT security testing may be delayed. |
| Pay groups are configured | Pay groups, pay calendars, pay periods, and payroll runs are properly configured. | Shared prompts, prior-period comparisons, and payroll deadline logic may fail. |
| Tax elections are maintained | Federal, state, and local tax elections are maintained in Workday. | Tax exception logic may not identify expected withholding issues correctly. |
| Benefit elections are current | Benefit and deduction elections are current and active. | Deduction expected amount and variance logic may produce false exceptions. |
| Historical data exists | Historical payroll data exists for at least 3 prior pay periods. | Trend, variance, and prior-period comparison KPIs may be limited. |
| Test tenant is available | A sandbox or implementation tenant is available with realistic test data. | Development, QA, UAT, and defect validation may be blocked. |
| Business thresholds are approved | Payroll team can confirm thresholds for overtime, missing time, deductions, tax, and KPI severity. | Dashboard status colors and exception prioritization may need rework. |

## 3. Technical Assumptions

| Assumption | Description | Impact if False |
| --- | --- | --- |
| Composite Reports are supported | Workday version supports Composite Reports and tabbed sub-report presentation. | Composite dashboard may need to be implemented as separate reports or worklets. |
| Advanced calculated fields are supported | Tenant supports calculated fields required for status, variance, exception type, totals, and thresholds. | Some logic may need simplified formulas or manual validation. |
| Data is available in Workday | No custom integrations are required because payroll, time, benefits, tax, worker, and organization data are available in Workday. | Integration work may be required, increasing scope and timeline. |
| Native performance is sufficient | Report performance is acceptable for organizations up to 5,000 workers. | Report prompts, indexing, row limits, or report splitting may be required. |
| Excel export is available | Excel export functionality is available for all report types in scope. | Export evidence and Finance analysis may need alternate output options. |
| Supported browsers are current | Chrome, Edge, and Firefox latest versions are supported for dashboard use. | Browser-specific display or export issues may require testing and workaround. |
| Workday security applies consistently | Domain security, organization security, and role-based security apply to on-screen data, drill-downs, and exports. | Additional security validation or report-specific restrictions may be required. |
| Mobile access is available where needed | Workday mobile or responsive web access is available for manager review. | Mobile UAT scenarios may become optional or out of scope. |

## 4. Constraints

| Constraint | Description | Project Impact |
| --- | --- | --- |
| Four-week timeline | Project timeline limits scope to the defined reports, dashboard, testing, and documentation artifacts. | Enhancements beyond defined scope should be deferred to backlog. |
| No Workday Studio integrations | No custom Workday Studio integrations are included. | All logic must use Workday native reporting and calculated fields. |
| Native dashboard only | Dashboard is limited to Workday native capabilities and does not use external BI tools. | Visual layout and interactivity depend on Workday report/dashboard features. |
| Workday refresh limits | Real-time data is limited to Workday report refresh and payroll calculation timing. | Dashboard may not reflect changes until reports refresh or payroll recalculates. |
| Cannot modify payroll logic | Project cannot modify core payroll processing logic. | Reports identify exceptions but do not change payroll results directly. |
| Excel analysis is post-export | Excel analysis is post-export only, with no live workbook connection. | Users must re-export for updated data. |
| Security approvals required | Access changes require IT/Security and business approval. | Role setup delays may affect testing and deployment. |
| Portfolio screenshots are placeholders | No live Workday tenant screenshots are included in the documentation repository. | Screenshot descriptions are used for portfolio presentation until approved screenshots are available. |

## 5. Dependencies

| Dependency | Owner | Required For | Risk if Delayed |
| --- | --- | --- | --- |
| Payroll business rules and thresholds | Payroll Team | KPI severity, overtime, missing time, payroll completion, and payroll close logic | Incorrect prioritization or rework. |
| Security group configuration | IT/Security Team | Role-based report access, drill-downs, exports, and UAT | UAT and production readiness delays. |
| Organization hierarchy validation | HR / HRIS | Department grouping, manager reporting, HR Partner visibility | Incorrect grouping or security scope. |
| Test data in sandbox tenant | HRIS / Payroll / QA | System testing, UAT, and defect validation | Blocked or incomplete testing. |
| Payroll calendars and deadlines | Payroll Operations | Pay period prompts and deadline countdown | Incorrect deadline urgency. |
| Benefits and deduction configuration | Benefits Team | Deduction expected amounts and arrears logic | False deduction exceptions. |
| Tax election and jurisdiction setup | Payroll Tax / HRIS | Tax exception detection and jurisdiction validation | Missed tax compliance issues. |
| Export permissions | IT/Security Team | Excel evidence and Finance analysis | Export and audit scenarios blocked. |

## 6. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Data quality issues in test tenant | High | High | Define required test scenarios, validate sample worker population, and reconcile report output to known payroll/time/benefit/tax records before UAT. |
| Performance with large datasets | Medium | High | Use shared prompts, row limits, pagination, optimized calculated fields, and test performance with at least 1,000 workers; validate large-organization performance before go-live. |
| Changing requirements during build | Medium | Medium | Maintain change log, defer non-critical enhancements, and require Payroll Product Owner approval for scope changes. |
| Security configuration delays | Medium | High | Identify required roles early, schedule security validation before UAT, and prepare temporary test roles if approved. |
| Calculated field complexity | Medium | High | Build and test calculated fields incrementally; document formulas and edge cases in KPI and report specifications. |
| Inconsistent business rules by pay group | Medium | Medium | Validate pay group-specific overtime, payroll calendar, and deduction behavior with payroll SMEs. |
| Export formatting limitations | Medium | Low | Document Workday export limitations, provide sample workbooks, and define acceptable formatting criteria. |
| Missing historical payroll data | Low | Medium | Use available prior periods for validation and document limited trend history until more periods accumulate. |

## 7. Sample Data Descriptions

The repository includes sample workbook artifacts in the `samples` folder. These files are representative portfolio samples and should not contain production payroll data.

| Sample Artifact | Purpose | Expected Contents |
| --- | --- | --- |
| `samples/sample-payroll-cost.xlsx` | Demonstrates Payroll Cost Report output. | Department and pay group groupings, gross pay, net pay, taxes, deductions, employer costs, total payroll cost, and period-over-period variance. |
| `samples/sample-overtime.xlsx` | Demonstrates Overtime Report output. | Non-exempt workers, scheduled hours, actual hours, overtime hours, overtime cost, alert levels, and manager grouping. |
| `samples/sample-tax-report.xlsx` | Demonstrates Tax Exception Report output. | Worker tax exceptions, tax authority, tax type, expected tax, actual tax, variance, issue type, and resolution status. |
| `samples/dashboard-screenshots/` | Placeholder folder for portfolio screenshot descriptions or approved captured images. | Screenshots or placeholder notes for dashboard overview, report tabs, exports, prompts, and mobile views. |

### Sample Data Rules

- Use fictional worker names, IDs, departments, pay groups, and amounts.
- Do not include real employee, payroll, tax, deduction, benefit, or personally identifiable information.
- Values should be realistic enough to demonstrate calculations, grouping, filters, and thresholds.
- Sample files should align with report specifications and UAT scenarios.
- If real Workday screenshots are later added, they must be approved and sanitized before inclusion.

## 8. Screenshot Placeholder Guide

The following screenshot descriptions are intended for the `samples/dashboard-screenshots` folder. Because this is a documentation project and not a live Workday tenant export, these entries describe what screenshots would show in a portfolio presentation.

### Screenshot 01: Main Dashboard Overview

| Item | Description |
| --- | --- |
| What it shows | Main Payroll Exception Dashboard landing page with KPI cards, summary counts, critical alerts, and exception breakdown. |
| Key elements visible | Header prompts, total payroll cost card, workers with exceptions, missing time count, overtime hours/cost, payroll completion rate, critical alerts, exception breakdown chart. |
| Project value | Demonstrates a single operational command center for payroll readiness and exception management. |
| Suggested callouts | Highlight KPI cards, red/yellow/green status indicators, refresh timestamp, and drill-down-ready exception summaries. |

### Screenshot 02: Payroll Cost Report

| Item | Description |
| --- | --- |
| What it shows | Payroll Cost Report grouped by Department and Pay Group with subtotal and grand total rows. |
| Key elements visible | Employee rows, gross pay, net pay, deductions, taxes, employer costs, total payroll cost, variance vs prior period. |
| Project value | Demonstrates Finance-ready payroll cost review and reconciliation capability. |
| Suggested callouts | Highlight department subtotal, grand total, payroll cost variance, and Excel export option. |

### Screenshot 03: Overtime Report

| Item | Description |
| --- | --- |
| What it shows | Overtime Report sorted by highest overtime hours with threshold-based color coding. |
| Key elements visible | Employee name, department, manager, scheduled hours, actual hours, overtime hours, overtime cost, yellow/red alert status. |
| Project value | Shows how Payroll and managers can identify high-cost overtime before approval. |
| Suggested callouts | Highlight red overtime rows, OT cost calculation, department filter, and worker drill-down. |

### Screenshot 04: Missing Time Entries Report

| Item | Description |
| --- | --- |
| What it shows | Missing Time Entries Report filtered to show only workers with missing required time entries. |
| Key elements visible | Missing days count, missing dates, manager, manager email, work schedule, deadline countdown, worker time entry link. |
| Project value | Demonstrates actionable payroll exception resolution before payroll cutoff. |
| Suggested callouts | Highlight missing dates, manager notification action, PTO exclusion note, and red critical missing time status. |

### Screenshot 05: Deduction Exception Report

| Item | Description |
| --- | --- |
| What it shows | Deduction Exception Report showing failed deductions, variance, and arrears balance. |
| Key elements visible | Deduction name, category, expected amount, actual amount, variance, exception type, arrears balance, payroll run. |
| Project value | Shows Benefits and Payroll teams how deduction errors can be detected before payroll approval. |
| Suggested callouts | Highlight failed deduction row, arrears balance, variance calculation, and benefit election drill-down. |

### Screenshot 06: Tax Exception Report

| Item | Description |
| --- | --- |
| What it shows | Tax Exception Report showing payroll tax compliance issues and withholding variance. |
| Key elements visible | Tax authority, tax type, expected tax, actual tax, tax variance, exception type, tax election status, jurisdiction. |
| Project value | Demonstrates compliance-sensitive reporting for missing withholding, over/under withholding, and jurisdiction issues. |
| Suggested callouts | Highlight invalid jurisdiction or missing withholding row, tax variance, and tax election drill-down. |

### Screenshot 07: Composite Dashboard Tab View

| Item | Description |
| --- | --- |
| What it shows | Composite Dashboard with tabs for Overview, Payroll Costs, Overtime, Missing Time, Deductions, and Tax Issues. |
| Key elements visible | Shared prompts, tab badges, tab labels, selected Overview tab, exception counts. |
| Project value | Demonstrates a unified reporting experience instead of scattered standalone reports. |
| Suggested callouts | Highlight shared prompts applying to all tabs, badge counts, and tab navigation. |

### Screenshot 08: Excel Export Sample

| Item | Description |
| --- | --- |
| What it shows | Formatted Excel export from one of the reports, such as Payroll Cost or Deduction Exceptions. |
| Key elements visible | Prompt values, run timestamp, grouped rows, subtotal rows, grand total, formatted currency/date columns. |
| Project value | Shows audit evidence and downstream analysis capability for Payroll and Finance. |
| Suggested callouts | Highlight preserved grouping, totals, filters, and confidentiality note. |

### Screenshot 09: Filter and Prompt Configuration

| Item | Description |
| --- | --- |
| What it shows | Workday prompt panel or dashboard header showing Pay Period, Company, Pay Group, Department, and report-specific prompts. |
| Key elements visible | Required Pay Period and Company prompts, optional Pay Group and Department prompts, Refresh or Run button. |
| Project value | Demonstrates user-controlled filtering and reusable report configuration. |
| Suggested callouts | Highlight required vs optional prompts and "blank means all" behavior. |

### Screenshot 10: Mobile or Responsive View

| Item | Description |
| --- | --- |
| What it shows | Mobile-friendly dashboard layout with stacked KPI cards and simplified exception table. |
| Key elements visible | KPI cards, critical alert summary, simplified rows, drill-down link or action button. |
| Project value | Demonstrates manager accessibility for reviewing urgent issues away from desktop. |
| Suggested callouts | Highlight vertical card stack, readable action list, and role-secured worker visibility. |

## 9. Screenshot File Naming Convention

| Screenshot | Recommended Placeholder Filename |
| --- | --- |
| Main Dashboard Overview | `01-main-dashboard-overview.png` |
| Payroll Cost Report | `02-payroll-cost-report.png` |
| Overtime Report | `03-overtime-report.png` |
| Missing Time Entries Report | `04-missing-time-entries-report.png` |
| Deduction Exception Report | `05-deduction-exception-report.png` |
| Tax Exception Report | `06-tax-exception-report.png` |
| Composite Dashboard Tab View | `07-composite-dashboard-tab-view.png` |
| Excel Export Sample | `08-excel-export-sample.png` |
| Filter and Prompt Configuration | `09-filter-prompt-configuration.png` |
| Mobile or Responsive View | `10-mobile-responsive-view.png` |

## 10. Portfolio Presentation Notes

- Use screenshot annotations to explain business value, not only UI elements.
- Emphasize that the screenshots are representative placeholders unless captured from an approved sanitized tenant.
- Keep portfolio captions focused on payroll control, exception visibility, auditability, and stakeholder workflow.
- Pair each screenshot with the relevant specification document so reviewers can trace the design from requirement to report output.
- Do not include real employee names, payroll amounts, tax details, or company-identifying information in public portfolio materials.

## Acceptance Criteria

- Project assumptions cover Workday licensing, payroll, time tracking, schedules, security, pay periods, tax, benefits, history, and test tenant needs.
- Technical assumptions cover Composite Reports, calculated fields, native data availability, performance, export, and browser support.
- Constraints, dependencies, risks, and mitigations are documented in professional markdown tables.
- Sample data descriptions identify expected sample workbook and screenshot-folder contents.
- Screenshot placeholder guide describes what each portfolio screenshot would show, key elements, project value, and annotations.
