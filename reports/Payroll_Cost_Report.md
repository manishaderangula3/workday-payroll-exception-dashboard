# Payroll Cost Report

## 1. Report Overview

| Item | Specification |
| --- | --- |
| Report Name | Payroll Cost Summary Report |
| Report Type | Workday Advanced Report |
| Primary Purpose | Provide a payroll cost breakdown by department, pay group, and pay period so Payroll and Finance can review labor cost, employee net pay, statutory taxes, deductions, and employer-paid costs in one consolidated view. |
| Audience | Payroll Manager, Finance Analyst |
| Output Format | Workday report grid with Excel export |
| Recommended Security | Payroll Administrator, Payroll Manager, Finance Analyst, or equivalent payroll results reporting security group |
| Refresh Cadence | On demand after payroll calculation, payroll completion, or period close |

## 2. Data Source

| Data Source Role | Workday Object or Source | Usage |
| --- | --- | --- |
| Primary Data Source | All Payroll Results | Returns payroll result rows for workers within the selected payroll period, company, pay group, and payroll status. |
| Related Business Object | Workers | Provides worker identification, employee name, active status, and worker-level drill-down context. |
| Related Business Object | Organizations | Provides department and company reporting attributes. |
| Related Business Object | Pay Groups | Provides payroll processing group and pay frequency context. |

### Data Source Notes

- The report should be built from completed or calculated payroll result data rather than worker compensation data so totals align to actual payroll processing.
- Worker, organization, and pay group fields should be joined through the payroll result worker and payroll relationship references.
- Cost values should use payroll result amounts in the company or payment currency selected by the tenant reporting standard.

## 3. Report Columns

| Column Name | Source Field | Format | Width |
| --- | --- | --- | --- |
| Employee ID | Worker > Employee ID | Text | 12 |
| Employee Name | Worker > Preferred Name or Legal Name | Text | 25 |
| Department | Worker Organization > Supervisory Organization or Cost Center Department | Text | 25 |
| Pay Group | Payroll Result > Pay Group | Text | 18 |
| Gross Pay | Payroll Result > Gross Pay Amount | Currency, 2 decimals | 14 |
| Net Pay | Payroll Result > Net Pay Amount | Currency, 2 decimals | 14 |
| Total Deductions | Payroll Result > Total Employee Deductions | Currency, 2 decimals | 16 |
| Total Taxes | Payroll Result > Total Employee Taxes | Currency, 2 decimals | 14 |
| Employer Costs | Calculated Field: Employer Benefit Costs + Employer Tax Costs | Currency, 2 decimals | 16 |
| Total Payroll Cost | Calculated Field: Gross Pay + Employer Costs | Currency, 2 decimals | 18 |
| Period-over-Period Variance | Calculated Field: Current Period Total Payroll Cost - Prior Period Total Payroll Cost | Currency, 2 decimals | 20 |
| Pay Period | Payroll Result > Pay Period | Date range or period name | 18 |
| Payment Date | Payroll Result > Payment Date | Date | 14 |
| Payroll Status | CF_Payroll_Status | Text | 16 |

### Calculated Field Requirements

| Calculated Field | Type | Logic |
| --- | --- | --- |
| CF_Payroll_Status | Lookup or Evaluate Expression | Return the payroll processing status for the payroll result, such as Completed, Pending, Error, Reversed, or Off Cycle. |
| CF_Employer_Costs | Arithmetic Calculation | Employer benefit costs + employer-paid tax costs. |
| CF_Total_Payroll_Cost | Arithmetic Calculation | Gross Pay + CF_Employer_Costs. |
| CF_Prior_Period_Total_Cost | Lookup Related Value or Aggregated Calculation | Retrieve total payroll cost for the same worker, company, and pay group in the prior comparable pay period. |
| CF_Period_Over_Period_Variance | Arithmetic Calculation | CF_Total_Payroll_Cost - CF_Prior_Period_Total_Cost. |

## 4. Grouping and Subtotals

### Grouping

1. Department
2. Pay Group

### Subtotals

Subtotals should display at both the Department and Pay Group levels for:

- Gross Pay
- Net Pay
- Total Deductions
- Total Taxes
- Employer Costs
- Total Payroll Cost
- Period-over-Period Variance

### Grand Total

Add a grand total row at the bottom of the report with summed totals for all currency columns. Employee ID, Employee Name, Pay Period, Payment Date, and Payroll Status should remain blank in the grand total row.

## 5. Filters and Prompts

| Filter | Type | Required | Prompt Behavior |
| --- | --- | --- | --- |
| Pay Period | Prompt-driven | Yes | User selects one or more pay periods. Default to the most recent completed pay period when available. |
| Company | Prompt-driven | Yes | User selects one or more companies. Restrict values by report security. |
| Pay Group | Prompt-driven | No | User may filter to one or more pay groups. Leave blank to include all eligible pay groups. |
| Department | Prompt-driven | No | User may filter to one or more departments. Leave blank to include all eligible departments. |
| Payroll Status | Optional prompt filter | No | User may filter by Completed, Pending, Error, Reversed, or Off Cycle. Leave blank to include all statuses. |

### Recommended Filter Logic

- Include payroll results where Pay Period is in the prompt selection.
- Include payroll results where Company is in the prompt selection.
- If Pay Group prompt is populated, include only selected pay groups.
- If Department prompt is populated, include only selected departments.
- If Payroll Status prompt is populated, include only selected statuses.

## 6. Sorting

| Sort Order | Field | Direction |
| --- | --- | --- |
| 1 | Department | A-Z |
| 2 | Pay Group | A-Z |
| 3 | Employee Name | A-Z |

## 7. Advanced Features

### Drill-down

Enable drill-down from each employee row to worker payroll detail pages:

- Worker profile
- Payroll result details
- Payslip or payment detail, subject to security
- Earning, deduction, and tax result line detail

The Employee ID, Employee Name, Gross Pay, Net Pay, Total Deductions, Total Taxes, Employer Costs, and Total Payroll Cost columns should support drill-down where Workday security allows.

### Export

Enable export to Excel with formatting preserved:

- Keep group headers and subtotal rows.
- Preserve currency formatting and date formatting.
- Preserve conditional formatting for Payroll Status.
- Freeze the header row in the exported workbook when supported.
- Include prompt values and run date in the export header or first worksheet notes.

### Conditional Formatting

| Condition | Formatting |
| --- | --- |
| Payroll Status = Error | Red fill or red text with bold emphasis |
| Payroll Status = Pending | Yellow fill or amber text |
| Negative Period-over-Period Variance | Optional green text if lower payroll cost is considered favorable |
| Positive Period-over-Period Variance | Optional red text if higher payroll cost requires review |

### Period-over-Period Comparison

Add a variance column comparing current period total payroll cost against the prior comparable pay period. For biweekly, semi-monthly, and monthly pay groups, the prior period should be selected based on the pay group calendar rather than a fixed number of days.

Recommended display:

- Current Period Total Payroll Cost
- Prior Period Total Payroll Cost, hidden by default if the report should remain concise
- Period-over-Period Variance

## 8. Sample Output Layout

```text
Payroll Cost Summary Report
Prompts: Pay Period = 2026-07-01 to 2026-07-15 | Company = US Company | Pay Group = All | Department = All

Department: Finance
  Pay Group: US Biweekly
  ------------------------------------------------------------------------------------------------------------------------------------
  Employee ID | Employee Name | Department | Pay Group    | Gross Pay | Net Pay  | Deductions | Taxes   | Employer Costs | Total Cost | Variance | Payment Date | Status
  ------------------------------------------------------------------------------------------------------------------------------------
  100245      | Avery Reed    | Finance    | US Biweekly | 4,250.00  | 3,005.21 | 425.00     | 819.79  | 725.50         | 4,975.50   | 125.00   | 2026-07-18   | Completed
  100388      | Jordan Lee    | Finance    | US Biweekly | 3,900.00  | 2,788.45 | 390.00     | 721.55  | 680.00         | 4,580.00   | -90.00   | 2026-07-18   | Completed
  ------------------------------------------------------------------------------------------------------------------------------------
  Pay Group Subtotal                                     8,150.00  5,793.66   815.00   1,541.34    1,405.50       9,555.50    35.00

Department: Operations
  Pay Group: US Weekly
  ------------------------------------------------------------------------------------------------------------------------------------
  Employee ID | Employee Name | Department | Pay Group | Gross Pay | Net Pay  | Deductions | Taxes   | Employer Costs | Total Cost | Variance | Payment Date | Status
  ------------------------------------------------------------------------------------------------------------------------------------
  100512      | Morgan Patel  | Operations | US Weekly | 1,850.00  | 1,312.90 | 185.00     | 352.10  | 325.25         | 2,175.25   | 40.00    | 2026-07-18   | Pending
  100744      | Riley Chen    | Operations | US Weekly | 2,125.00  | 1,455.63 | 212.50     | 456.87  | 380.75         | 2,505.75   | 215.00   | 2026-07-18   | Error
  ------------------------------------------------------------------------------------------------------------------------------------
  Pay Group Subtotal                                     3,975.00  2,768.53   397.50     808.97      706.00       4,681.00   255.00

Grand Total                                             12,125.00  8,562.19 1,212.50   2,350.31    2,111.50      14,236.50   290.00
```

## 9. Configuration Steps in Workday

1. Navigate to **Create Custom Report**.
2. Enter the report name **Payroll Cost Summary Report**.
3. Select **Advanced** as the report type.
4. Select **All Payroll Results** as the primary data source.
5. Confirm the report is enabled for prompts and available to authorized payroll and finance users.
6. Add related business objects for Worker, Organizations, and Pay Groups.
7. Add the report columns listed in the Report Columns section.
8. Create or attach the calculated field **CF_Payroll_Status**.
9. Create or attach **CF_Employer_Costs** to combine employer benefit costs and employer-paid tax costs.
10. Create or attach **CF_Total_Payroll_Cost** using Gross Pay + Employer Costs.
11. Create or attach prior-period lookup logic for the same worker, company, pay group, and comparable pay period.
12. Add **CF_Period_Over_Period_Variance** using Current Period Total Payroll Cost - Prior Period Total Payroll Cost.
13. Configure prompts for Pay Period, Company, Pay Group, Department, and Payroll Status.
14. Mark Pay Period and Company as required prompts.
15. Add filter logic so optional prompts are ignored when left blank.
16. Configure grouping by Department, then Pay Group.
17. Add subtotal rows for Gross Pay, Net Pay, Total Deductions, Total Taxes, Employer Costs, Total Payroll Cost, and Period-over-Period Variance.
18. Enable the grand total row for all currency total columns.
19. Set sorting by Department A-Z, Pay Group A-Z, and Employee Name A-Z.
20. Configure conditional formatting for Payroll Status values:
    - Error: red
    - Pending: yellow
21. Enable drill-down links to worker payroll result details and payslip details where permitted by security.
22. Configure Excel export options to preserve grouping, subtotal rows, date formatting, currency formatting, and conditional formatting.
23. Run the report with a completed pay period and compare totals to payroll register or payroll result audit totals.
24. Validate security by testing as Payroll Manager and Finance Analyst.
25. Move the report through tenant migration after functional validation and stakeholder approval.

## Acceptance Criteria

- Report returns payroll cost by employee with department and pay group context.
- Prompt filters support Pay Period, Company, Pay Group, Department, and Payroll Status.
- Grouping, subtotals, and grand totals are configured correctly.
- Payroll status conditional formatting clearly identifies Error and Pending rows.
- Drill-down links route authorized users to worker payroll details.
- Excel export preserves the report structure and key formatting.
