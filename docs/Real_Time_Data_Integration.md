# Real-Time Data Integration Guide

## Purpose

This dashboard now supports two data source modes:

| Mode | Use Case | Notes |
| --- | --- | --- |
| Sample Data | Portfolio demo using synthetic Workday-style fixtures | Default mode. No real worker data required. |
| Uploaded Data | Review current Workday report exports from CSV files | Uploaded datasets replace matching sample datasets and recalculate the dashboard. |

The upload feature is the safest first step before a Workday RaaS or API connection. It lets a Payroll Analyst, HRIS Analyst, Workday Reporting Analyst, or Consultant demonstrate real report-output analysis without storing Workday credentials in the browser.

## Supported Uploads

| Dataset | Replaces | Required Columns |
| --- | --- | --- |
| Workers | Worker master data | `Employee ID`, `Employee Name`, `Department`, `Manager`, `Company`, `Pay Group` |
| Payroll Results | Payroll cost, status, completion, and trend data | `Employee ID`, `Pay Period`, `Gross Pay`, `Net Pay`, `Payroll Status` |
| Time Entries | Overtime and missing time exception data | `Employee ID`, `Pay Period`, `Week Ending Date`, `Scheduled Hours`, `Actual Hours Worked` |
| Deduction Results | Deduction exception data | `Employee ID`, `Pay Period`, `Deduction Name`, `Expected Amount`, `Actual Amount`, `Exception Type` |
| Tax Results | Tax exception data | `Employee ID`, `Pay Period`, `Tax Authority`, `Expected Tax`, `Actual Tax`, `Exception Type` |

The parser accepts user-friendly Workday-style headers such as `Employee ID` and dashboard field names such as `employeeId`.

## Upload Workflow

1. Open the dashboard.
2. Go to the `Data Source` panel.
3. Upload one or more CSV files.
4. The dashboard automatically switches to `Uploaded Data` mode after a valid file loads.
5. Review validation messages for missing columns or invalid rows.
6. Use the global prompts to filter by pay period, company, pay group, department, or worker search.
7. Review recalculated KPIs, exception badges, report tabs, trend charts, and worker drill-downs.
8. Use `Clear Uploads` to return to sample data.

## Recommended CSV Templates

### Workers

```csv
Employee ID,Employee Name,Department,Manager,Manager Email,Company,Pay Group,Worker Type,Exempt Status,Hourly Rate,Work Schedule,Location,State,Active
W-2001,Alex Rivera,Payroll Ops,Casey Smith,casey.smith@example.com,Uploaded Co,US Weekly Hourly,Employee,Non-Exempt,35,Mon-Fri 8hrs,Remote,TX,true
```

### Payroll Results

```csv
Employee ID,Pay Period,Payment Date,Payroll Run,Gross Pay,Net Pay,Total Deductions,Total Taxes,Employer Benefit Cost,Employer Tax Cost,Payroll Status
W-2001,2026-09-15 Semi-Monthly,2026-09-20,PR-2026-09A,5000,3600,600,800,450,382,Complete
```

### Time Entries

```csv
Employee ID,Pay Period,Week Ending Date,Scheduled Hours,Actual Hours Worked,Regular Hours,Overtime Hours,Double Time Hours,Submitted Days,Expected Days,Missing Dates,Approved Leave Dates,Last Submission Date,Time Entry Status
W-2001,2026-09-15 Semi-Monthly,2026-09-15,40,46,40,6,0,5,5,,,2026-09-15,Approved
```

Use semicolons for multiple dates:

```csv
Missing Dates
2026-09-12;2026-09-13
```

### Deduction Results

```csv
Employee ID,Pay Period,Payroll Run,Deduction Name,Deduction Category,Expected Amount,Actual Amount,Arrears Balance,Exception Type
W-2001,2026-09-15 Semi-Monthly,PR-2026-09A,Medical PPO Employee,Medical,238,0,238,Failed
```

### Tax Results

```csv
Employee ID,Pay Period,Tax Authority,Tax Form Status,Expected Tax,Actual Tax,Exception Type
W-2001,2026-09-15 Semi-Monthly,Federal W-4,Missing,800,0,No Withholding
```

## What Recalculates

| Dashboard Area | Recalculation Behavior |
| --- | --- |
| KPI cards | Payroll cost, completion, exception counts, missing time, and overtime recalculate from active data. |
| Filters | Pay period, company, pay group, and department prompts rebuild from active workers and pay periods. |
| Tab badges | Overtime, missing time, deduction, tax, and overview counts recalculate from active exceptions. |
| Report tabs | Payroll cost, overtime, missing time, deductions, and tax rows rebuild from active data. |
| Trend charts | Payroll KPI history and overtime matrix are derived from active uploaded payroll/time data. |
| Worker drill-down | Selected worker detail joins active worker, payroll, time, deduction, and tax rows. |
| CSV export | Exports the current filtered view from the active dataset. |

## Future Workday RaaS/API Integration

For production use, connect to Workday through a backend service:

```text
React Dashboard
   |
Secure Backend Proxy
   |
Workday RaaS or REST API
   |
Workday Payroll, Time Tracking, Benefits, and Tax Reports
```

Do not place Workday credentials, bearer tokens, Integration System User passwords, tenant secrets, or API keys in frontend code.

Recommended production pattern:

1. Create Workday custom reports and enable them as web services where appropriate.
2. Configure an Integration System User with least-privilege report access.
3. Store credentials only in a backend secret manager.
4. Fetch Workday report output through a backend proxy.
5. Normalize API/RaaS responses into the same `DashboardData` structure used by the upload feature.
6. Add server-side logging, error handling, retry logic, and audit controls.
7. Keep row-level security and real employee data controls inside Workday and the backend layer.

## Security Notes

- Use synthetic data for public portfolio demos.
- Treat exported Workday CSV files as confidential payroll data.
- Do not commit real worker, payroll, tax, benefit, or deduction data.
- Do not upload production files to a public deployment.
- Mask employee identifiers and names before sharing screenshots externally.
