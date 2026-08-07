# Tax Exception Report

## 1. Report Overview

| Item | Specification |
| --- | --- |
| Report Name | Tax Exception Report |
| Report Type | Workday Advanced Report |
| Primary Purpose | Identify missing, failed, over-withheld, under-withheld, and invalid payroll tax results so Payroll can resolve tax issues before payroll approval and tax filing. |
| Audience | Payroll Manager, Payroll Tax Analyst, Finance Analyst |
| Output Format | Workday report grid with drill-down links and Excel export |
| Recommended Security | Payroll Manager, Payroll Administrator, Payroll Tax Analyst, or equivalent payroll tax reporting security group |
| Refresh Cadence | On demand after payroll calculation, after tax updates, and before payroll approval |

## 2. Data Source

| Data Source Role | Workday Object or Source | Usage |
| --- | --- | --- |
| Primary Data Source | All Payroll Results, Tax detail | Returns employee and employer tax result lines from payroll calculations and completed payroll runs. |
| Related Business Object | Workers | Provides employee identity, department, work location, home address, payroll relationship, and tax eligibility context. |
| Related Business Object | Tax Elections | Provides worker federal, state, local, and other jurisdictional withholding elections. |
| Related Business Object | Tax Authorities | Provides tax jurisdiction, tax code, tax type, and authority setup. |
| Related Business Object | Pay Groups | Provides payroll run, pay period, and processing calendar context. |

### Data Source Notes

- The report should use payroll result tax detail so exception amounts align to calculated payroll.
- Tax elections and worker location data should be used to validate whether expected tax withholding should exist.
- Employer tax exceptions should be included when employer tax cost is missing, unexpectedly high, or jurisdiction setup is incomplete.

## 3. Report Columns

| Column Name | Source Field | Format |
| --- | --- | --- |
| Employee ID | Worker > Employee ID | Text |
| Employee Name | Worker > Preferred Name or Legal Name | Text |
| Department | Worker Organization > Supervisory Organization or Cost Center Department | Text |
| Company | Payroll Result > Company | Text |
| Work Location | Worker > Primary Work Address or Location | Text |
| Resident State or Jurisdiction | Worker > Home Address Tax Jurisdiction | Text |
| Tax Authority | Payroll Result Tax > Tax Authority | Text |
| Tax Name | Payroll Result Tax > Tax | Text |
| Tax Type | Tax Authority or Tax Definition > Tax Type | Text, examples: Federal, State, Local, Medicare, Social Security |
| Expected Tax Amount | Tax calculation estimate, prior-period expected value, or configured tax rule expected amount | Currency, 2 decimals |
| Actual Tax Amount | Payroll Result Tax > Employee Tax Amount or Employer Tax Amount | Currency, 2 decimals |
| Tax Variance | CF_Tax_Variance | Currency, 2 decimals |
| Exception Type | CF_Tax_Exception | Text, values: Missing, Failed, Over-Withheld, Under-Withheld, Invalid Jurisdiction, None |
| Tax Election Status | Worker Tax Elections > Status | Text |
| Pay Period | Payroll Result > Pay Period | Date range or period name |
| Payroll Run | Payroll Result > Payroll Run | Text |
| Resolution Status | CF_Tax_Resolution_Status | Text |
| Worker Payroll Details Link | Worker Payroll Result related action | URL or Drill-down |
| Tax Elections Link | Worker Tax Elections related action | URL or Drill-down |

### Calculated Field Requirements

| Calculated Field | Type | Logic |
| --- | --- | --- |
| CF_Tax_Variance | Arithmetic Calculation | Actual Tax Amount - Expected Tax Amount. Use absolute value for sorting if largest issue first is required. |
| CF_Absolute_Tax_Variance | Arithmetic Calculation | Absolute value of CF_Tax_Variance for descending sort and threshold filtering. |
| CF_Tax_Exception | Evaluate Expression | Missing when expected tax exists and actual tax is 0; Failed when tax calculation error exists; Over-Withheld when actual exceeds expected by threshold; Under-Withheld when actual is below expected by threshold; Invalid Jurisdiction when worker tax jurisdiction does not match expected home or work location setup; otherwise None. |
| CF_Tax_Resolution_Status | Evaluate Expression | Return recommended status such as Review Tax Election, Correct Jurisdiction, Recalculate Payroll, Refund or Adjust, or No Action. |
| CF_Tax_Jurisdiction_Mismatch | True/False Condition | True when worker home, work, company, or assigned tax authority does not align with expected jurisdiction rules. |

## 4. Filters and Prompts

| Filter | Type | Required | Prompt Behavior |
| --- | --- | --- | --- |
| Tax Exception | Fixed filter | Yes | Include only rows where CF_Tax_Exception is not None. |
| Pay Period | Prompt-driven | Yes | User selects the pay period or periods to review. Default to current calculated payroll period when available. |
| Company | Prompt-driven | No | User may select one or more companies. Leave blank to include all eligible companies. |
| Tax Type | Prompt-driven | No | User may select Federal, State, Local, Medicare, Social Security, or other configured tax types. |
| Tax Authority | Prompt-driven | No | User may select one or more tax authorities or jurisdictions. |
| Exception Type | Prompt-driven | No | User may select Missing, Failed, Over-Withheld, Under-Withheld, or Invalid Jurisdiction. |
| Minimum Variance Threshold | Prompt-driven | No | User enters the minimum tax variance amount. Default to 0.00 or the organization's tax review tolerance. |

### Recommended Filter Logic

- CF_Tax_Exception is not equal to None.
- Pay Period is in the prompt selection.
- If Company prompt is populated, include only selected companies.
- If Tax Type prompt is populated, include only selected tax types.
- If Tax Authority prompt is populated, include only selected authorities.
- If Exception Type prompt is populated, include only selected exception types.
- CF_Absolute_Tax_Variance is greater than or equal to the Minimum Variance Threshold prompt value.
- Include invalid jurisdiction exceptions even when variance is 0 because setup issues can affect future payrolls and filings.

## 5. Grouping

Group the detailed report in this hierarchy:

1. Exception Type
2. Tax Type
3. Tax Authority
4. Employee

Recommended subtotal placement:

- Exception Type subtotal showing total tax variance and exception count.
- Tax Type subtotal showing total expected tax, actual tax, and variance.
- Tax Authority subtotal showing jurisdiction-level impact.

## 6. Sorting

| Sort Order | Field | Direction |
| --- | --- | --- |
| 1 | CF_Absolute_Tax_Variance | Descending |
| 2 | Exception Type | A-Z |
| 3 | Tax Type | A-Z |
| 4 | Tax Authority | A-Z |
| 5 | Employee Name | A-Z |

The default view should prioritize the largest withholding or employer tax differences first, followed by jurisdiction setup issues.

## 7. Resolution Workflow

| Exception Type | Review Steps | Recommended Action |
| --- | --- | --- |
| Missing | Confirm worker tax eligibility, taxable wages, tax elections, tax authority setup, and whether wages are exempt. | Correct tax elections or setup; recalculate payroll; validate tax line appears as expected. |
| Failed | Review payroll calculation messages, tax engine response, worker address, company tax setup, and authority registration. | Correct setup or calculation issue; rerun payroll calculation; escalate to payroll tax support if needed. |
| Under-Withheld | Compare expected and actual tax; check tax elections, additional withholding, reciprocity, tax limits, and taxable wage basis. | Correct worker election or jurisdiction setup; calculate adjustment if required; document under-withholding handling. |
| Over-Withheld | Confirm expected tax, worker elections, taxable wages, and duplicate tax lines. | Flag for refund or adjustment processing; correct setup before next payroll. |
| Invalid Jurisdiction | Compare worker home address, work location, company registration, and assigned tax authority. | Correct worker address, work location, or company tax setup; recalculate payroll and validate jurisdiction. |

### Workflow Notes

- Payroll Tax Analyst owns jurisdiction and tax authority setup review.
- Payroll Manager owns payroll recalculation and adjustment approval.
- Worker tax election corrections should follow HR/payroll policy and audit requirements.
- Any refund or adjustment must be validated against tax compliance and filing rules before final payroll approval.

## 8. Totals

| Total | Fields Included | Purpose |
| --- | --- | --- |
| Total Variance by Tax Type | Expected Tax Amount, Actual Tax Amount, Tax Variance | Quantifies withholding or employer tax impact by federal, state, local, and other tax types. |
| Total Variance by Tax Authority | Expected Tax Amount, Actual Tax Amount, Tax Variance | Identifies jurisdiction-level impact and filing risk. |
| Exception Type Total | Tax Variance, Count of Employees, Count of Exceptions | Shows issue volume by missing, failed, over, under, and invalid jurisdiction categories. |
| Company Total | Expected Tax Amount, Actual Tax Amount, Tax Variance, Count of Exceptions | Provides total tax exception exposure for selected prompts. |

## 9. Drill-down

Enable drill-down or related actions from the report to:

- Worker payroll result details
- Worker payslip or payment detail, subject to security
- Worker federal, state, and local tax elections
- Worker home address and work location details
- Company tax authority registration or tax setup
- Payroll calculation messages and tax result detail

Employee ID, Employee Name, Tax Authority, Tax Name, Actual Tax Amount, Tax Variance, Worker Payroll Details Link, and Tax Elections Link should support drill-down where Workday security allows.

## 10. Sample Output

```text
Tax Exception Report
Prompts: Pay Period = 2026-07-19 to 2026-08-01 | Tax Type = All | Exception Type = All | Minimum Variance = 0.00

Exception Type: Missing
  Tax Type: State
    Tax Authority: CA SIT
  ------------------------------------------------------------------------------------------------------------------------------------------
  Employee ID | Employee Name | Department | Work Location | Tax Name | Expected | Actual | Variance | Election Status | Payroll Run
  ------------------------------------------------------------------------------------------------------------------------------------------
  500118      | Morgan Patel  | Operations | San Jose, CA  | CA SIT   | 145.00   | 0.00   | -145.00  | Active          | US Biweekly 16
  ------------------------------------------------------------------------------------------------------------------------------------------
  Tax Authority Subtotal                                   145.00     0.00   -145.00

Exception Type: Over-Withheld
  Tax Type: Local
    Tax Authority: NYC Local
  ------------------------------------------------------------------------------------------------------------------------------------------
  Employee ID | Employee Name | Department | Work Location | Tax Name  | Expected | Actual | Variance | Election Status | Payroll Run
  ------------------------------------------------------------------------------------------------------------------------------------------
  500266      | Riley Chen    | Finance    | New York, NY  | NYC Local | 58.50    | 117.00 | 58.50    | Active          | US Biweekly 16
  ------------------------------------------------------------------------------------------------------------------------------------------
  Tax Authority Subtotal                                    58.50   117.00     58.50

Company Total                                              203.50   117.00    -86.50
```

## 11. Configuration Steps in Workday

1. Navigate to **Create Custom Report**.
2. Enter the report name **Tax Exception Report**.
3. Select **Advanced** as the report type.
4. Select **All Payroll Results** with tax detail as the primary data source.
5. Enable report prompts.
6. Confirm the report is available to Payroll Manager and Payroll Tax Analyst security groups.
7. Add related business objects for Workers, Tax Elections, Tax Authorities, and Pay Groups.
8. Add Employee ID, Employee Name, Department, Company, Work Location, Resident State or Jurisdiction, Tax Authority, Tax Name, Tax Type, Expected Tax Amount, Actual Tax Amount, Tax Election Status, Pay Period, and Payroll Run columns.
9. Create or attach **CF_Tax_Variance** using Actual Tax Amount - Expected Tax Amount.
10. Create or attach **CF_Absolute_Tax_Variance** for sorting and threshold filtering.
11. Create **CF_Tax_Jurisdiction_Mismatch** to identify home, work, company, or tax authority setup mismatch.
12. Create **CF_Tax_Exception** to classify Missing, Failed, Over-Withheld, Under-Withheld, Invalid Jurisdiction, or None.
13. Create **CF_Tax_Resolution_Status** to display the recommended review path.
14. Add a fixed filter where CF_Tax_Exception is not equal to None.
15. Configure prompts for Pay Period, Company, Tax Type, Tax Authority, Exception Type, and Minimum Variance Threshold.
16. Configure grouping by Exception Type, Tax Type, Tax Authority, and Employee.
17. Configure sorting by absolute tax variance descending.
18. Add subtotal rows for Exception Type, Tax Type, and Tax Authority.
19. Add grand totals for expected tax, actual tax, tax variance, and exception count.
20. Enable drill-down to worker payroll details, worker tax elections, worker address details, tax authority setup, and payroll calculation messages.
21. Add conditional formatting for Missing, Failed, Over-Withheld, Under-Withheld, and Invalid Jurisdiction exception types if desired.
22. Run the report after payroll calculation and compare totals to payroll register tax totals.
23. Validate each exception type with known test cases.
24. Confirm invalid jurisdiction rows appear even when the current variance is 0.
25. Export to Excel and confirm grouping, currency formatting, totals, and drill-down columns are preserved where supported.
26. Add the report to the payroll close checklist for tax review before payroll approval.

## Acceptance Criteria

- Report displays only tax exceptions where CF_Tax_Exception is not None.
- Missing, failed, over-withheld, under-withheld, and invalid jurisdiction exceptions are classified clearly.
- Tax variance is visible and totaled by exception type, tax type, tax authority, and company.
- Prompts support pay period, company, tax type, tax authority, exception type, and minimum variance threshold.
- Resolution workflow documents the required actions for each tax exception type.
- Drill-down links support review of payroll details, tax elections, location data, and tax authority setup.
