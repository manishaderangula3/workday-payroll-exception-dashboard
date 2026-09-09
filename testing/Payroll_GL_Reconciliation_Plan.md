# Payroll and General Ledger Reconciliation Plan

## Purpose

This plan defines how payroll dashboard totals are reconciled to Workday payroll registers, payroll result detail, and general ledger control totals before production approval.

## Reconciliation Scope

| Area | Dashboard Source | Control Source |
| --- | --- | --- |
| Gross Pay | Payroll Cost Report | Workday Payroll Register |
| Net Pay | Payroll Cost Report | Workday Payroll Register |
| Employee Deductions | Payroll Cost and Deduction Reports | Payroll Register and deduction result detail |
| Employee Taxes | Payroll Cost and Tax Reports | Payroll Register and tax result detail |
| Employer Costs | Payroll Cost Report | Payroll accounting results and GL payroll clearing |
| Total Payroll Cost | Dashboard KPI | Gross pay plus employer costs |
| Overtime Cost | Overtime Report | Time Tracking and payroll earnings detail |
| Arrears Balance | Deduction Exception Report | Deduction arrears balance report |

## Reconciliation Tolerance

| Measure | Tolerance | Notes |
| --- | --- | --- |
| Worker count | 0 variance | Counts must match included pay group population |
| Gross pay | 0.00 variance | Any difference requires worker-level investigation |
| Net pay | 0.00 variance | Any difference requires worker-level investigation |
| Taxes | 0.00 variance | Validate federal, state, local, and employer tax grouping |
| Deductions | 0.00 variance | Validate benefit, retirement, garnishment, and arrears handling |
| Employer costs | Approved accounting tolerance | Confirm accounting configuration and fringe/benefit timing |
| GL total | Approved finance tolerance | Finance signs off on timing and mapping differences |

## Reconciliation Procedure

### Step 1: Define Population

Document:

- Pay period
- Company
- Pay group
- Department scope
- Payroll run
- Worker population count
- Included and excluded worker statuses

### Step 2: Export Dashboard Reports

Export:

- Payroll Cost Summary Report
- Overtime Hours Exception Report
- Deduction Exception Report
- Tax Exception Report
- Missing Time Entries Exception Report if payroll is not complete

Store exports in the approved secure project location. Do not store real payroll exports in this repository.

### Step 3: Pull Control Reports

Pull these Workday control reports for the same population and period:

| Control Report | Owner | Purpose |
| --- | --- | --- |
| Payroll Register | Payroll Manager | Gross, net, tax, and deduction control totals |
| Payroll Results Detail | Payroll Analyst | Worker-level tie-out |
| Payroll Accounting Results | Finance Analyst | GL and employer cost validation |
| Deduction Results Detail | Benefits Administrator | Deduction variance and arrears validation |
| Tax Results Detail | Tax Analyst | Tax withholding and employer tax validation |

### Step 4: Compare Totals

| Metric | Dashboard Total | Control Total | Variance | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Worker Count | TBD | TBD | TBD | Pending |  |
| Gross Pay | TBD | TBD | TBD | Pending |  |
| Net Pay | TBD | TBD | TBD | Pending |  |
| Employee Deductions | TBD | TBD | TBD | Pending |  |
| Employee Taxes | TBD | TBD | TBD | Pending |  |
| Employer Costs | TBD | TBD | TBD | Pending |  |
| Total Payroll Cost | TBD | TBD | TBD | Pending |  |
| Overtime Cost | TBD | TBD | TBD | Pending |  |
| Arrears Balance | TBD | TBD | TBD | Pending |  |

### Step 5: Investigate Variances

| Variance Type | Investigation Path |
| --- | --- |
| Worker count mismatch | Compare active/inactive/terminated worker inclusion rules |
| Pay amount mismatch | Validate payroll result status and off-cycle run inclusion |
| Overtime mismatch | Confirm PTO, holiday, and non-work hour exclusions |
| Deduction mismatch | Confirm expected amount logic and arrears handling |
| Tax mismatch | Confirm tax authority grouping and multi-state rules |
| Employer cost mismatch | Confirm benefit cost timing and payroll accounting mappings |
| GL mismatch | Confirm account posting date, journal status, and cost center mapping |

## Sign-Off Template

| Area | Owner | Status | Signature | Date |
| --- | --- | --- | --- | --- |
| Payroll totals | Payroll Manager | Pending |  |  |
| Worker population | Payroll Analyst | Pending |  |  |
| Deductions | Benefits Administrator | Pending |  |  |
| Taxes | Tax Analyst | Pending |  |  |
| GL/accounting | Finance Analyst | Pending |  |  |

## Exit Criteria

Reconciliation is complete when:

- Worker population matches the approved payroll population.
- Payroll dashboard totals tie to Workday payroll control reports.
- Deduction and tax exception totals tie to source detail reports.
- Payroll cost totals tie to GL/accounting control totals or documented timing differences.
- All material variances are resolved or formally approved.

