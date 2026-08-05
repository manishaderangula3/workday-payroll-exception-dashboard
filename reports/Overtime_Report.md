# Overtime Report

## 1. Report Overview

| Item | Specification |
| --- | --- |
| Report Name | Overtime Hours Exception Report |
| Report Type | Workday Advanced Report with Matrix option |
| Primary Purpose | Track workers exceeding overtime thresholds, identify overtime patterns, and support payroll, HR, and department-level labor cost review. |
| Audience | Payroll Manager, HR Business Partner, Department Managers |
| Output Format | Workday report grid, matrix view, and Excel export |
| Recommended Security | Payroll Manager, Time Tracking Administrator, HR Business Partner, Department Manager, or equivalent time and payroll reporting security group |
| Refresh Cadence | Weekly, per pay period, and on demand before payroll close |

## 2. Data Source

| Data Source Role | Workday Object or Source | Usage |
| --- | --- | --- |
| Primary Data Source | All Time Entries / Time Tracking | Returns reported, calculated, and approved time entry details used to identify overtime. |
| Related Business Object | Workers | Provides worker identification, employee name, exemption status, department, manager, and hourly rate context. |
| Related Business Object | Schedules | Provides scheduled hours for comparison against actual hours worked. |
| Related Business Object | Pay Groups | Provides payroll processing group, pay frequency, and pay period context. |

### Data Source Notes

- The report should use time tracking data after time calculation rules have evaluated regular, overtime, and double-time hours.
- Overtime eligibility should be based on worker exemption status and applicable time calculation rules.
- Hourly rate should be pulled from the worker compensation or payroll result source that aligns with the organization's payroll costing standard.

## 3. Report Columns

| Column Name | Source Field | Format |
| --- | --- | --- |
| Employee ID | Worker > Employee ID | Text |
| Employee Name | Worker > Preferred Name or Legal Name | Text |
| Department | Worker Organization > Supervisory Organization or Cost Center Department | Text |
| Manager | Worker > Manager | Text |
| Scheduled Hours | Worker Schedule > Scheduled Weekly Hours | Number, 2 decimals |
| Actual Hours Worked | Time Tracking > Total Hours Worked | Number, 2 decimals |
| Regular Hours | Time Tracking > Regular Hours | Number, 2 decimals |
| Overtime Hours | CF_Overtime_Hours | Number, 2 decimals |
| Double-Time Hours | Time Tracking > Double-Time Hours or CF_Double_Time_Hours | Number, 2 decimals |
| Hourly Rate | Worker Compensation > Hourly Rate | Currency, 2 decimals |
| OT Cost | Calculated Field: OT Hours x 1.5 x Hourly Rate | Currency, 2 decimals |
| Week Ending Date | Time Entry Week > Week Ending Date | Date |
| Pay Period | Pay Group Calendar > Pay Period | Date range or period name |
| Alert Level | CF_OT_Alert_Level | Text |
| Pattern Alert | CF_Consecutive_OT_Pattern | Text |

### Calculated Field Requirements

| Calculated Field | Type | Logic |
| --- | --- | --- |
| CF_Overtime_Hours | Sum Related Instances or Arithmetic Calculation | Sum all calculated overtime time entry quantities for the worker and week. |
| CF_Double_Time_Hours | Sum Related Instances or Arithmetic Calculation | Sum double-time hours when double-time rules apply. Return 0 when not applicable. |
| CF_OT_Cost | Arithmetic Calculation | CF_Overtime_Hours x 1.5 x Hourly Rate. |
| CF_OT_Alert_Level | Evaluate Expression | Red when weekly overtime is greater than 10 hours; Yellow when weekly overtime is greater than 5 hours; None when overtime is 5 hours or less. |
| CF_Consecutive_OT_Pattern | Evaluate Expression or Trending Calculation | Return Pattern Alert when the worker has overtime in 3 or more consecutive weeks. |

## 4. Matrix View Configuration

| Matrix Setting | Configuration |
| --- | --- |
| Matrix Rows | Department |
| Matrix Columns | Week Ending Dates for the last 4 weeks |
| Matrix Values | Total Overtime Hours |
| Aggregation | Sum |
| Purpose | Show overtime trends across departments over time so managers can identify recurring workload pressure, staffing gaps, or scheduling issues. |

### Matrix Layout Example

```text
Department       | Week Ending 07/11 | Week Ending 07/18 | Week Ending 07/25 | Week Ending 08/01 | 4-Week Total
-----------------|-------------------|-------------------|-------------------|-------------------|-------------
Finance          | 8.50              | 10.25             | 6.00              | 4.00              | 28.75
Operations       | 42.00             | 51.50             | 48.25             | 55.75             | 197.50
Customer Support | 21.75             | 19.00             | 26.50             | 31.25             | 98.50
Company Total    | 72.25             | 80.75             | 80.75             | 91.00             | 324.75
```

## 5. Filters and Prompts

| Filter | Type | Required | Prompt Behavior |
| --- | --- | --- | --- |
| Worker Exemption Status | Fixed filter | Yes | Include only Non-Exempt workers. |
| Overtime Hours | Fixed filter | Yes | Include only workers where CF_Overtime_Hours > 0. |
| Pay Period | Prompt-driven | Yes | User selects one or more pay periods. Default to the current or most recent open pay period when available. |
| Department | Prompt-driven | No | User may select one or more departments. Leave blank to include all eligible departments. |
| Minimum OT Threshold | Prompt-driven | No | Default value is 0. Include rows where CF_Overtime_Hours is greater than the entered threshold. |

### Recommended Filter Logic

- Worker exemption status equals Non-Exempt.
- CF_Overtime_Hours is greater than 0.
- Pay Period is in the prompt selection.
- If Department prompt is populated, include only selected departments.
- CF_Overtime_Hours is greater than the Minimum OT Threshold prompt value.

## 6. Alerting Logic

| Alert | Trigger | Display Behavior |
| --- | --- | --- |
| Yellow Flag | Overtime Hours > 5 hours per week and <= 10 hours per week | Show Alert Level as Yellow; apply yellow or amber conditional formatting to Overtime Hours and Alert Level. |
| Red Flag | Overtime Hours > 10 hours per week | Show Alert Level as Red; apply red conditional formatting to Overtime Hours, OT Cost, and Alert Level. |
| Pattern Alert | Overtime appears in 3 or more consecutive weeks for the same worker | Show Pattern Alert as Yes or Pattern Alert; optionally apply bold text or a warning icon indicator. |

### Alerting Notes

- Alert thresholds should evaluate by worker and week, not by pay period total, unless the pay period is weekly.
- Pattern alert logic should use consecutive week ending dates from the worker's time tracking history.
- Department managers should only see workers and departments permitted by their Workday security role.

## 7. Grouping

Group the detailed report in this hierarchy:

1. Department
2. Manager
3. Employee

Recommended subtotal placement:

- Department subtotal after each department group.
- Manager subtotal after each manager group.
- Employee subtotal when the report includes multiple weeks or pay periods per employee.

## 8. Sorting

| Sort Order | Field | Direction |
| --- | --- | --- |
| 1 | Overtime Hours | Descending |
| 2 | OT Cost | Descending |
| 3 | Department | A-Z |
| 4 | Manager | A-Z |
| 5 | Employee Name | A-Z |

The default view should prioritize highest overtime first so Payroll and HR can review the largest exceptions immediately.

## 9. Totals

| Total | Fields Included | Purpose |
| --- | --- | --- |
| Department OT Total | Overtime Hours, Double-Time Hours, OT Cost | Shows overtime volume and cost by department. |
| Manager OT Total | Overtime Hours, Double-Time Hours, OT Cost | Identifies overtime concentration by manager team. |
| Employee OT Total | Overtime Hours, Double-Time Hours, OT Cost | Summarizes multiple week or pay period rows for the same worker. |
| Company OT Total | Overtime Hours, Double-Time Hours, OT Cost | Provides overall overtime exposure for the selected prompts. |

## 10. Sample Output

```text
Overtime Hours Exception Report
Prompts: Pay Period = 2026-07-19 to 2026-08-01 | Department = All | Minimum OT Threshold = 0

Department: Operations
  Manager: Dana Brooks
  -------------------------------------------------------------------------------------------------------------------------------
  Employee ID | Employee Name | Scheduled | Actual | Regular | OT Hours | DT Hours | Hourly Rate | OT Cost | Week Ending | Alert | Pattern
  -------------------------------------------------------------------------------------------------------------------------------
  200184      | Taylor Kim    | 40.00     | 53.25  | 40.00   | 13.25    | 0.00     | 32.00       | 636.00  | 2026-08-01  | Red   | Yes
  200219      | Casey Moore   | 40.00     | 48.50  | 40.00   | 8.50     | 0.00     | 28.50       | 363.38  | 2026-08-01  | Yellow| No
  -------------------------------------------------------------------------------------------------------------------------------
  Manager Subtotal                               21.75    0.00                  999.38

  Manager: Priya Shah
  -------------------------------------------------------------------------------------------------------------------------------
  Employee ID | Employee Name | Scheduled | Actual | Regular | OT Hours | DT Hours | Hourly Rate | OT Cost | Week Ending | Alert | Pattern
  -------------------------------------------------------------------------------------------------------------------------------
  200365      | Morgan Diaz   | 40.00     | 51.00  | 40.00   | 11.00    | 0.00     | 30.00       | 495.00  | 2026-08-01  | Red   | Yes
  -------------------------------------------------------------------------------------------------------------------------------
  Manager Subtotal                               11.00    0.00                  495.00

Department Subtotal                              32.75    0.00                1,494.38

Company Total                                    32.75    0.00                1,494.38
```

## 11. Configuration Steps in Workday

1. Navigate to **Create Custom Report**.
2. Enter the report name **Overtime Hours Exception Report**.
3. Select **Advanced** as the report type.
4. Select **All Time Entries** or the tenant's primary Time Tracking data source.
5. Enable the report for prompts and confirm it is available to authorized payroll, HR, and department manager security groups.
6. Add related business objects for Workers, Schedules, and Pay Groups.
7. Add Employee ID, Employee Name, Department, Manager, Scheduled Hours, Actual Hours Worked, Regular Hours, Week Ending Date, and Pay Period.
8. Create or attach **CF_Overtime_Hours** to sum calculated overtime hours by worker and week.
9. Create or attach **CF_Double_Time_Hours** if double-time rules are applicable in the tenant.
10. Add Hourly Rate from the approved compensation or payroll costing source.
11. Create **CF_OT_Cost** using Overtime Hours x 1.5 x Hourly Rate.
12. Create **CF_OT_Alert_Level** with Yellow and Red alert thresholds.
13. Create **CF_Consecutive_OT_Pattern** to identify workers with overtime in 3 or more consecutive weeks.
14. Add fixed filter criteria for Non-Exempt workers only.
15. Add fixed filter criteria where CF_Overtime_Hours > 0.
16. Configure prompts for Pay Period, Department, and Minimum OT Threshold.
17. Set Minimum OT Threshold default value to 0.
18. Configure grouping by Department, Manager, and Employee.
19. Configure sorting by Overtime Hours descending, then OT Cost descending.
20. Add subtotal rows for Department, Manager, and Employee groups.
21. Add a company total row for Overtime Hours, Double-Time Hours, and OT Cost.
22. Configure conditional formatting for Yellow, Red, and Pattern Alert conditions.
23. Create an optional matrix view using Department as rows, Week Ending Dates for the last 4 weeks as columns, and Total Overtime Hours as values.
24. Validate matrix totals against detailed report totals for the same date range.
25. Test the report with Payroll Manager, HR Business Partner, and Department Manager security roles.
26. Export to Excel and confirm totals, grouping, conditional formatting, and matrix values are preserved where supported.

## Acceptance Criteria

- Report includes only non-exempt workers with overtime greater than the selected threshold.
- Overtime, double-time, and OT cost values are calculated consistently with tenant time calculation rules.
- Yellow and red alerts display based on weekly overtime thresholds.
- Pattern alerts identify workers with overtime in 3 or more consecutive weeks.
- Department, manager, employee, and company totals are available.
- Matrix view shows department overtime trends across the last 4 week ending dates.
