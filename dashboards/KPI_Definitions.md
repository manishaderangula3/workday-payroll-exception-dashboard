# KPI Definitions

## 1. Document Overview

| Item | Specification |
| --- | --- |
| Dashboard Name | Payroll Exception Dashboard |
| Document Purpose | Define KPI formulas, thresholds, data sources, refresh behavior, historical trending, and benchmark guidance for production dashboard configuration. |
| Primary Users | Payroll Manager, Payroll Administrator, HR Partner, Benefits Administrator, Payroll Tax Analyst, Finance Analyst |
| Related Specifications | `Dashboard_Layout.md`, `Dashboard_Overview.md`, `Composite_Dashboard.md` |
| Measurement Grain | Selected Pay Period, Company, Pay Group, and Department prompts |
| Refresh Frequency | Real-time on dashboard load and refresh button selection |

## 2. KPI Inventory

| KPI Name | Formula | Target | Yellow Threshold | Red Threshold | Data Source |
| --- | --- | --- | --- | --- | --- |
| Payroll Completion Rate | Workers with Status = Complete / Total Workers in Pay Group x 100 | 100% | < 95% | < 90% | Payroll Cost Report, All Payroll Results, Worker eligibility |
| Total Payroll Cost | SUM(Gross Pay + Employer Costs) for selected period | Within approved payroll forecast or prior-period tolerance | Variance > 3% and <= 5% from prior period | Variance > 5% from prior period | Payroll Cost Report |
| Exception Rate | Workers with any exception / Total Workers x 100 | < 2% | 2-5% | > 5% | Dashboard Overview, all exception reports |
| Overtime Cost Ratio | Total OT Cost / Total Payroll Cost x 100 | < 3% | 3-5% | > 5% | Overtime Report, Payroll Cost Report |
| Missing Time Entry Count | COUNT workers where CF_Missing_Time_Flag = True | 0 | 1-5 workers | > 5 workers | Missing Time Entries Report |
| Deduction Failure Rate | Failed Deductions / Total Deductions x 100 | < 1% | 1-3% | > 3% | Deduction Exception Report, Payroll Results deduction detail |
| Tax Exception Count | COUNT workers where CF_Tax_ExTol Cost Report by department, pay group, and worker to validate variance drivers. |

### C. Exception Rate

| Attribute | Definition |
| --- | --- |
| Business Purpose | Measures the share of workers with at least one open payroll exception. |
| Formula | `(Workers with any exception) / (Total Workers) x 100` |
| Numerator | Distinct workers appearing in one or more exception reports: Missing Time, Overtime, Deductions, or Tax Issues. |
| Denominator | Total workers expected for the selected pay period and prompt scope. |
| Target | Less than 2% |
| Yellow Threshold | 2-5% |
| Red Threshold | Greater than 5% |
| Display Format | Percent with worker count, example: `2.5% (31 workers)`. |
| Owner | Payroll Manager |
| Primary Action | Use exception breakdown to assign follow-up by category and owner. |

### D. Overtime Cost Ratio

| Attribute | Definition |
| --- | --- |
| Business Purpose | Measures overtime cost as a percentage of total payroll cost. |
| Formula | `(Total OT Cost) / (Total Payroll Cost) x 100` |
| Numerator | Total overtime cost from the Overtime Report. |
| Denominator | Total payroll cost from the Payroll Cost Report. |
| Target | Less than 3% |
| Yellow Threshold | 3-5% |
| Red Threshold | Greater than 5% |
| Display Format | Percent plus cost and hours, example: `4.1% ($18.4K, 324.75 hours)`. |
| Owner | Payroll Manager and Department Managers |
| Primary Action | Drill into Overtime Report by department, manager, and worker; review red overtime flags and recurring patterns. |

### E. Missing Time Entry Count

| Attribute | Definition |
| --- | --- |
| Business Purpose | Shows the number of workers missing required time entries for scheduled work days. |
| Formula | `COUNT(Workers where CF_Missing_Time_Flag = True)` |
| Count Rule | Count distinct workers, not missing dates. |
| Target | 0 workers |
| Yellow Threshold | 1-5 workers |
| Red Threshold | More than 5 workers |
| Display Format | Count plus total missing days, example: `8 workers, 18 missing days`. |
| Owner | Payroll Manager and Department Managers |
| Primary Action | Notify managers and drill into worker time entry details. |

### F. Deduction Failure Rate

| Attribute | Definition |
| --- | --- |
| Business Purpose | Measures failed deduction volume relative to total deduction result lines. |
| Formula | `(Failed Deductions) / (Total Deductions) x 100` |
| Numerator | Deduction result lines where CF_Deduction_Exception = Failed. |
| Denominator | Total deduction result lines processed for the selected pay period and prompt scope. |
| Target | Less than 1% |
| Yellow Threshold | 1-3% |
| Red Threshold | Greater than 3% |
| Display Format | Percent plus count and amount, example: `1.4% (14 failed, $2.1K variance)`. |
| Owner | Payroll Manager and Benefits Administrator |
| Primary Action | Review worker earnings, benefit elections, deduction setup, and arrears recovery. |

### G. Tax Exception Count

| Attribute | Definition |
| --- | --- |
| Business Purpose | Shows the number of workers with payroll tax issues requiring review before approval or filing. |
| Formula | `COUNT(Workers where CF_Tax_Exception != None)` |
| Count Rule | Count distinct workers with tax exceptions. Track row-level tax exceptions separately for detailed analysis. |
| Target | 0 workers |
| Yellow Threshold | 1-3 workers |
| Red Threshold | More than 3 workers |
| Display Format | Count with exception mix, example: `5 workers: 2 missing, 2 over-withheld, 1 invalid jurisdiction`. |
| Owner | Payroll Tax Analyst and Payroll Manager |
| Primary Action | Drill into Tax Exception Report and resolve tax elections, jurisdiction setup, or calculation failures. |

### H. Days to Payroll Deadline

| Attribute | Definition |
| --- | --- |
| Business Purpose | Indicates urgency remaining before payroll approval deadline. |
| Formula | `Payroll_Approval_Date - Current_Date` |
| Target | At least 2 days remaining while exceptions are open. |
| Yellow Threshold | 2 days remaining and open exceptions exist. |
| Red Threshold | Less than 2 days remaining and open exceptions exist. |
| Display Format | Number of days plus status, example: `1 day remaining, Critical`. |
| Owner | Payroll Manager |
| Primary Action | Prioritize all critical exceptions and escalate unresolved owner actions. |

## 4. Shared Calculation Rules

| Rule | Specification |
| --- | --- |
| Prompt Scope | All KPIs must respect Pay Period, Company, Pay Group, and Department prompts. |
| Worker Counts | Worker counts should use distinct worker count unless explicitly defined as row count. |
| Current Period | Selected Pay Period prompt value. |
| Prior Period | Prior comparable pay period based on the selected pay group calendar. |
| Currency | Use company payroll currency or configured reporting currency. |
| Rounding | Percent values display to 1 decimal; currency values display to 2 decimals in detail and compact notation in KPI cards. |
| Zero Denominator | If denominator is 0, display `N/A` and suppress status color except for validation warnings. |
| Security | KPI values must be calculated only from rows visible to the current user's security context. |

## 5. Threshold Status Model

| Status | Meaning | Visual Treatment |
| --- | --- | --- |
| Green | KPI is at target or no exception action is required. | Green indicator with `On Track` or `Clear` label. |
| Yellow | KPI requires attention but does not represent immediate payroll approval risk. | Amber indicator with `Attention` label. |
| Red | KPI requires immediate action before payroll approval or close. | Red indicator with `Critical` label. |
| Gray | KPI cannot be calculated because required data is missing or denominator is 0. | Neutral indicator with `N/A` label. |

### Threshold Precedence

- Red overrides yellow when both rules could apply.
- Deadline red status should elevate dashboard-level severity when open exceptions exist.
- Invalid jurisdiction tax issues should remain visible even when current tax variance is 0.
- Missing time criticality should increase as payroll deadline approaches.

## 6. Data Lineage

| KPI | Source Report | Key Fields |
| --- | --- | --- |
| Payroll Completion Rate | Payroll Cost Summary Report | Payroll Status, Worker, Pay Group, Pay Period |
| Total Payroll Cost | Payroll Cost Summary Report | Gross Pay, Employer Costs, Total Payroll Cost, Pay Period |
| Exception Rate | Dashboard Overview and exception reports | Worker, Exception Category, Exception Status |
| Overtime Cost Ratio | Overtime Hours Exception Report and Payroll Cost Summary Report | CF_OT_Cost, CF_Overtime_Hours, Total Payroll Cost |
| Missing Time Entry Count | Missing Time Entries Exception Report | CF_Missing_Time_Flag, CF_Missing_Time_Days, CF_Missing_Time_Dates |
| Deduction Failure Rate | Deduction Exception Report | CF_Deduction_Exception, Deduction Result, Total Deductions |
| Tax Exception Count | Tax Exception Report | CF_Tax_Exception, Tax Authority, Tax Variance |
| Days to Payroll Deadline | Payroll close calendar or payroll approval schedule | Payroll Approval Date, Current Date |

## 7. KPI Refresh Frequency

| Refresh Event | Behavior |
| --- | --- |
| Dashboard Load | Refresh all KPI values in real time using selected default prompts. |
| Manual Refresh | Recalculate all KPIs, charts, alerts, badges, and detail table rows. |
| Prompt Change | Refresh all dashboard components after user applies prompt changes. |
| Scheduled Refresh | Optional refresh during payroll processing windows or payroll cutoff day. |
| Export | Export should use the most recently refreshed values and include refresh timestamp. |

### Refresh Rules

- Show a loading state while KPI values refresh.
- Update the Last Updated timestamp only after all KPI queries complete successfully.
- If one KPI fails to refresh, show `N/A` for that KPI and retain successful KPI values with the same timestamp behavior clearly indicated.
- Avoid mixing values from different prompt selections in the same dashboard view.

## 8. Historical Trending

| Requirement | Specification |
| --- | --- |
| Retention Period | Store 12 months of KPI values for trend analysis. |
| Snapshot Grain | Pay Period, Company, Pay Group, Department, KPI Name, KPI Value, Status, Run Date/Time. |
| Trend Usage | Display trend arrows, period-over-period change, and long-term pattern analysis. |
| Storage Option | Workday reporting snapshot, Prism Analytics, worksheet extract, or approved payroll analytics repository. |
| Refresh Timing | Capture a KPI snapshot after each payroll calculation and after final payroll approval. |
| Audit Requirement | Preserve run date/time, user or process that captured the snapshot, prompt values, and source report version. |

### Historical Trend Metrics

Recommended trend metrics:

- Total Payroll Cost by pay period
- Payroll Completion Rate by pay period
- Exception Rate by pay period
- Overtime Cost Ratio by pay period
- Missing Time Entry Count by pay period
- Deduction Failure Rate by pay period
- Tax Exception Count by pay period

## 9. Benchmarking

Benchmarks should be used as directional guidance and should be calibrated against internal payroll history, workforce composition, pay frequency, and operational policy.

| KPI | Internal Benchmark | External or Industry Benchmark Guidance |
| --- | --- | --- |
| Payroll Completion Rate | Target 100% before payroll approval; monitor historical completion at payroll cutoff. | High-performing payroll operations typically target near-total completion before approval. |
| Total Payroll Cost | Compare to forecast, prior comparable period, and same period in prior year when available. | External benchmark varies by industry, headcount, overtime usage, and compensation changes. |
| Exception Rate | Target less than 2%; track by department and pay group. | Lower exception rates generally indicate mature time, benefits, tax, and payroll controls. |
| Overtime Cost Ratio | Target less than 3%; compare by department and seasonality. | Industry norms vary significantly for hourly, manufacturing, retail, healthcare, and support operations. |
| Missing Time Entry Count | Target 0 at payroll approval. | Any unresolved missing time at approval creates payroll accuracy risk. |
| Deduction Failure Rate | Target less than 1%; monitor benefit enrollment events and garnishment changes. | Mature payroll processes should keep failed deduction rates very low. |
| Tax Exception Count | Target 0 at approval. | Tax exceptions should be treated as compliance-sensitive and resolved or documented before final payroll. |
| Days to Payroll Deadline | Maintain at least 2 days for exception remediation. | Shorter remediation windows increase manual adjustment and off-cycle payment risk. |

## 10. Dashboard Rollup Logic

| Rollup | Calculation |
| --- | --- |
| Overall Dashboard Status | Red if any KPI is red; Yellow if no red KPIs and one or more yellow KPIs; Green if all KPIs are green; Gray if core payroll data is unavailable. |
| Total Open Exceptions | Distinct workers with at least one open exception plus optional row-level exception count in tooltip. |
| Critical Exception Count | Count exceptions with red severity across Missing Time, Overtime, Deduction, and Tax reports. |
| Exception Breakdown | Distinct workers by exception category. Workers with multiple categories may appear in multiple category counts; dashboard tooltip should disclose this. |
| Payroll Ready Indicator | Green only when Payroll Completion Rate = 100%, Missing Time Entry Count = 0, Tax Exception Count = 0, and no critical deduction exceptions remain. |

## 11. Validation and Reconciliation

| Validation Area | Requirement |
| --- | --- |
| Source Reconciliation | KPI values reconcile to source reports using identical prompt values. |
| Threshold Testing | Test values below, equal to, and above each threshold. |
| Prior Period Comparison | Validate prior period selection follows pay group calendar rules. |
| Worker Count Logic | Confirm distinct worker counts do not double-count workers with multiple exception rows. |
| Multi-Exception Workers | Confirm workers with multiple exception types appear correctly in category counts and overall exception count. |
| Security Testing | Validate KPI results by role and organization security. |
| Export Testing | Confirm exported KPI values match on-screen values and include timestamp and prompt values. |

## Acceptance Criteria

- KPI inventory includes formula, target, yellow threshold, red threshold, and data source for each KPI.
- Payroll Completion Rate, Total Payroll Cost, Exception Rate, Overtime Cost Ratio, Missing Time Entry Count, Deduction Failure Rate, Tax Exception Count, and Days to Payroll Deadline are fully defined.
- Refresh frequency, historical trending, and 12-month retention requirements are documented.
- Benchmarking guidance is included for all KPIs.
- Rollup logic and validation requirements are production-ready and traceable to source reports.
