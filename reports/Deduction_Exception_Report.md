# Deduction Exception Report

## 1. Report Overview

| Item | Specification |
| --- | --- |
| Report Name | Deduction Exception Report |
| Report Type | Workday Advanced Report |
| Primary Purpose | Identify failed deductions, over-deductions, under-deductions, and arrears so Payroll and Benefits can resolve issues before payroll completion or downstream accounting. |
| Audience | Payroll Manager, Benefits Administrator |
| Output Format | Workday report grid with drill-down links and Excel export |
| Recommended Security | Payroll Manager, Payroll Administrator, Benefits Administrator, or equivalent payroll and benefits reporting security group |
| Refresh Cadence | On demand after payroll calculation and before payroll approval |

## 2. Data Source

| Data Source Role | Workday Object or Source | Usage |
| --- | --- | --- |
| Primary Data Source | All Payroll Results, Deduction detail | Returns deduction result lines from payroll calculations and completed payroll runs. |
| Related Business Object | Workers | Provides employee identification, department, payroll relationship, and worker payroll context. |
| Related Business Object | Benefit Elections | Provides expected deduction amounts for elected benefit plans. |
| Related Business Object | Deduction Definitions | Provides deduction name, category, calculation rules, arrears settings, and priority. |

### Data Source Notes

- The report should use payroll result deduction detail rather than enrollment-only data so exceptions reflect actual payroll processing.
- Benefit election data should be used to validate expected employee deduction amounts where the deduction is benefit-driven.
- Garnishment, retirement, and other non-benefit deductions may require expected amount logic from deduction definitions, court orders, payroll inputs, or worker deductions.

## 3. Report Columns

| Column Name | Source Field | Format |
| --- | --- | --- |
| Employee ID | Worker > Employee ID | Text |
| Employee Name | Worker > Preferred Name or Legal Name | Text |
| Department | Worker Organization > Supervisory Organization or Cost Center Department | Text |
| Deduction Name | Payroll Result Deduction > Deduction | Text |
| Deduction Category | Deduction Definition > Deduction Category | Text, examples: Medical, Dental, 401k, Garnishment |
| Expected Amount | Benefit Election, Worker Deduction, or Deduction Definition expected amount | Currency, 2 decimals |
| Actual Amount Taken | Payroll Result Deduction > Amount | Currency, 2 decimals |
| Variance | CF_Deduction_Variance | Currency, 2 decimals |
| Exception Type | CF_Deduction_Exception | Text, values: Failed, Over-Deducted, Under-Deducted, Arrears, None |
| Arrears Balance | Payroll Result or Deduction Arrears > Arrears Balance | Currency, 2 decimals |
| Pay Period | Payroll Result > Pay Period | Date range or period name |
| Payroll Run | Payroll Result > Payroll Run | Text |
| Resolution Status | CF_Deduction_Resolution_Status | Text |
| Worker Payroll Details Link | Worker Payroll Result related action | URL or Drill-down |
| Benefit Elections Link | Worker Benefit Elections related action | URL or Drill-down |

### Calculated Field Requirements

| Calculated Field | Type | Logic |
| --- | --- | --- |
| CF_Deduction_Variance | Arithmetic Calculation | Actual Amount Taken - Expected Amount. Use absolute value for sorting if largest issue first is required. |
| CF_Deduction_Exception | Evaluate Expression | Failed when expected amount is greater than 0 and actual amount is 0; Over-Deducted when actual is greater than expected by the threshold; Under-Deducted when actual is less than expected by the threshold; Arrears when arrears balance is greater than 0; otherwise None. |
| CF_Deduction_Resolution_Status | Evaluate Expression | Return recommended status such as Review Earnings, Review Election, Process Refund, Recover Arrears, or No Action. |
| CF_Absolute_Deduction_Variance | Arithmetic Calculation | Absolute value of CF_Deduction_Variance for descending sort and threshold filtering. |

## 4. Filters and Prompts

| Filter | Type | Required | Prompt Behavior |
| --- | --- | --- | --- |
| Deduction Exception | Fixed filter | Yes | Include only rows where CF_Deduction_Exception is not None. |
| Pay Period | Prompt-driven | Yes | User selects the pay period or periods to review. Default to current calculated payroll period when available. |
| Deduction Category | Prompt-driven | No | User may select Medical, Dental, 401k, Garnishment, or other configured categories. Leave blank to include all categories. |
| Exception Type | Prompt-driven | No | User may select Failed, Over-Deducted, Under-Deducted, or Arrears. Leave blank to include all exception types. |
| Minimum Variance Threshold | Prompt-driven | No | User enters the minimum variance amount. Default to 0.00 or the organization's payroll review tolerance. |

### Recommended Filter Logic

- CF_Deduction_Exception is not equal to None.
- Pay Period is in the prompt selection.
- If Deduction Category prompt is populated, include only selected categories.
- If Exception Type prompt is populated, include only selected exception types.
- CF_Absolute_Deduction_Variance is greater than or equal to the Minimum Variance Threshold prompt value.
- Include deductions with arrears balance greater than 0 even when current-period variance is 0, unless the user filters arrears out.

## 5. Grouping

Group the detailed report in this hierarchy:

1. Exception Type
2. Deduction Category
3. Employee

Recommended subtotal placement:

- Exception Type subtotal showing total variance and total arrears balance.
- Deduction Category subtotal showing total variance and total arrears balance.
- Employee subtotal when the worker has multiple deduction exceptions.

## 6. Sorting

| Sort Order | Field | Direction |
| --- | --- | --- |
| 1 | CF_Absolute_Deduction_Variance | Descending |
| 2 | Arrears Balance | Descending |
| 3 | Exception Type | A-Z |
| 4 | Deduction Category | A-Z |
| 5 | Employee Name | A-Z |

The default view should surface the largest deduction issues first so Payroll and Benefits can prioritize the highest financial impact.

## 7. Resolution Workflow

| Exception Type | Review Steps | Recommended Action |
| --- | --- | --- |
| Failed | Check whether the worker has sufficient earnings, whether the deduction is active, whether deduction priority blocked the deduction, and whether the deduction is eligible for the payroll run. | Correct payroll inputs or deduction setup; recalculate payroll; create arrears if recovery should occur later. |
| Under-Deducted | Compare expected amount to actual deduction; confirm benefit election, deduction limits, pay frequency, and partial-period eligibility. | Correct deduction setup or benefit election; recalculate payroll; create arrears recovery if needed. |
| Over-Deducted | Confirm expected amount, worker election, deduction caps, and duplicate deduction setup. | Flag for refund processing or payroll adjustment; correct setup before the next payroll run. |
| Arrears | Review arrears balance, recovery rules, maximum recovery per period, and worker earnings availability. | Show arrears recovery schedule; confirm recovery does not exceed policy limits; monitor future payroll runs until balance clears. |

### Workflow Notes

- Payroll Manager owns payroll recalculation and refund or adjustment processing.
- Benefits Administrator owns benefit election validation and plan-level deduction setup review.
- Garnishment deductions may require legal or compliance review before changes are made.
- All corrections should be validated in payroll calculation results before payroll approval.

## 8. Totals

| Total | Fields Included | Purpose |
| --- | --- | --- |
| Total Variance by Category | Expected Amount, Actual Amount Taken, Variance | Quantifies deduction impact by benefit or deduction category. |
| Total Arrears Balance | Arrears Balance | Shows outstanding recovery exposure. |
| Exception Type Total | Variance, Arrears Balance, Count of Employees | Shows volume and financial impact by failed, over, under, and arrears categories. |
| Company Total | Variance, Arrears Balance, Count of Exceptions | Provides total deduction exception exposure for selected prompts. |

## 9. Drill-down

Enable drill-down or related actions from the report to:

- Worker payroll result details
- Worker payslip or payment detail, subject to security
- Worker benefit elections
- Worker deduction setup
- Deduction definition
- Arrears balance and recovery schedule

Employee ID, Employee Name, Deduction Name, Actual Amount Taken, Variance, Arrears Balance, Worker Payroll Details Link, and Benefit Elections Link should support drill-down where Workday security allows.

## 10. Sample Output

```text
Deduction Exception Report
Prompts: Pay Period = 2026-07-19 to 2026-08-01 | Deduction Category = All | Exception Type = All | Minimum Variance = 0.00

Exception Type: Failed
  Deduction Category: Medical
  -------------------------------------------------------------------------------------------------------------------------------------
  Employee ID | Employee Name | Department | Deduction Name | Expected | Actual | Variance | Arrears | Pay Period              | Payroll Run
  -------------------------------------------------------------------------------------------------------------------------------------
  400128      | Avery Reed    | Finance    | Medical PPO    | 125.00   | 0.00   | -125.00  | 125.00  | 2026-07-19 to 2026-08-01| US Biweekly 16
  -------------------------------------------------------------------------------------------------------------------------------------
  Category Subtotal                                      125.00     0.00   -125.00   125.00

Exception Type: Over-Deducted
  Deduction Category: 401k
  -------------------------------------------------------------------------------------------------------------------------------------
  Employee ID | Employee Name | Department | Deduction Name | Expected | Actual | Variance | Arrears | Pay Period              | Payroll Run
  -------------------------------------------------------------------------------------------------------------------------------------
  400244      | Jordan Lee    | Operations | 401k Pre-Tax   | 240.00   | 480.00 | 240.00   | 0.00    | 2026-07-19 to 2026-08-01| US Biweekly 16
  -------------------------------------------------------------------------------------------------------------------------------------
  Category Subtotal                                      240.00   480.00    240.00     0.00

Company Total                                            365.00   480.00    115.00   125.00
```

## 11. Configuration Steps in Workday

1. Navigate to **Create Custom Report**.
2. Enter the report name **Deduction Exception Report**.
3. Select **Advanced** as the report type.
4. Select **All Payroll Results** with deduction detail as the primary data source.
5. Enable report prompts.
6. Confirm the report is available to Payroll Manager and Benefits Administrator security groups.
7. Add related business objects for Workers, Benefit Elections, and Deduction Definitions.
8. Add Employee ID, Employee Name, Department, Deduction Name, Deduction Category, Expected Amount, Actual Amount Taken, Arrears Balance, Pay Period, and Payroll Run columns.
9. Create or attach **CF_Deduction_Variance** using Actual Amount Taken - Expected Amount.
10. Create or attach **CF_Absolute_Deduction_Variance** for sorting and threshold filtering.
11. Create **CF_Deduction_Exception** to classify Failed, Over-Deducted, Under-Deducted, Arrears, or None.
12. Create **CF_Deduction_Resolution_Status** to display the recommended review path.
13. Add a fixed filter where CF_Deduction_Exception is not equal to None.
14. Configure prompts for Pay Period, Deduction Category, Exception Type, and Minimum Variance Threshold.
15. Configure grouping by Exception Type, Deduction Category, and Employee.
16. Configure sorting by absolute variance descending and arrears balance descending.
17. Add subtotal rows for Exception Type and Deduction Category.
18. Add grand totals for variance, arrears balance, and exception count.
19. Enable drill-down to worker payroll details, worker benefit elections, deduction setup, and arrears recovery schedule.
20. Add conditional formatting for Failed, Over-Deducted, Under-Deducted, and Arrears exception types if desired.
21. Run the report after payroll calculation and compare totals to payroll register deduction totals.
22. Validate each exception type with known test cases.
23. Export to Excel and confirm grouping, currency formatting, totals, and drill-down columns are preserved where supported.
24. Add the report to the payroll close checklist for pre-approval review.

## Acceptance Criteria

- Report displays only deduction exceptions where CF_Deduction_Exception is not None.
- Failed, over-deducted, under-deducted, and arrears exceptions are classified clearly.
- Variance and arrears balances are visible and totaled by category and exception type.
- Prompts support pay period, deduction category, exception type, and minimum variance threshold.
- Resolution workflow documents the required actions for failed, arrears, and over-deducted cases.
- Drill-down links support review of payroll details and benefit elections.
