# Workday Tenant Build Runbook

## Purpose

This runbook defines the controlled steps to build the Payroll Exception Dashboard solution inside a real Workday tenant. It is intended for a Workday Reporting Analyst, HRIS Analyst, Payroll Systems Analyst, or Workday Consultant moving the portfolio design into sandbox, implementation, and production tenants.

## Scope

Included:

- Calculated field build
- Advanced report build
- Matrix overtime report build
- Composite dashboard build
- Shared prompts, drill-downs, exports, and dashboard worklet setup
- Build validation evidence

Excluded:

- Core payroll processing changes
- Workday Studio integrations
- External BI tools
- Unapproved production data extraction

## Entry Criteria

| Requirement | Owner | Evidence |
| --- | --- | --- |
| Sandbox tenant available | HRIS/IT | Tenant URL and access approved |
| Reporting security assigned | Security Admin | User can create calculated fields and reports |
| Payroll test data available | Payroll | At least three pay periods with realistic payroll results |
| Time Tracking data available | Payroll/HRIS | Hourly workers have schedules and time entries |
| Benefits and tax data available | Benefits/Tax | Deductions and tax elections exist for test population |
| Business rules approved | Payroll Manager | Thresholds and exception logic signed off |

## Build Sequence

### Step 1: Confirm Source Data

Validate these Workday business objects and report data sources before building reports:

| Data Area | Workday Source | Validation |
| --- | --- | --- |
| Payroll results | All Payroll Results | Current and prior pay periods return worker-level rows |
| Worker attributes | Workers | Worker, department, manager, company, and pay group fields populate |
| Time entries | All Time Entries / Time Tracking | Scheduled, submitted, approved, PTO, and holiday entries are visible |
| Deductions | Payroll Results deduction detail | Expected, actual, variance, and arrears values are available |
| Taxes | Payroll Results tax detail | Tax authority, tax form status, withholding, and variance fields are available |
| Organizations | Supervisory and company organizations | Department and company prompts match business usage |

Build evidence:

- Screenshot of each validated source data field
- Row count by pay period
- List of missing fields or tenant-specific field replacements

### Step 2: Build Calculated Fields

Create and unit test the calculated fields documented in `calculated-fields/`.

| Calculated Field | Required For | Build Notes |
| --- | --- | --- |
| `CF_Payroll_Status` | Payroll Cost, Overview, Composite Dashboard | Return Complete, Pending, Error, or Not Started |
| `CF_Overtime_Hours` | Overtime Report and KPI | Exclude exempt workers, PTO, holiday, and non-work hours |
| `CF_Missing_Time_Flag` | Missing Time Report and KPI | Exclude approved leave, holidays, and terminated workers |
| `CF_Missing_Time_Days` | Missing Time Report | Count specific scheduled days without time |
| `CF_Deduction_Exception` | Deduction Exception Report | Classify Failed, Over, Under, Arrears, or None |
| `CF_Deduction_Variance` | Deduction Exception Report | Actual amount minus expected amount |
| `CF_Tax_Exception` | Tax Exception Report | Classify withholding, election, form, and jurisdiction issues |
| `CF_Tax_Variance` | Tax Exception Report | Actual tax minus expected tax |

Build evidence:

- Calculated field definition screenshots
- Test worker screenshots for true, false, and edge cases
- Peer review notes from Payroll SME

### Step 3: Build Detailed Reports

Build these reports in sandbox and validate row-level results.

| Report | Workday Type | Specification |
| --- | --- | --- |
| Payroll Cost Summary Report | Advanced Report | `reports/Payroll_Cost_Report.md` |
| Overtime Hours Exception Report | Advanced Report with Matrix option | `reports/Overtime_Report.md` |
| Missing Time Entries Exception Report | Advanced Report | `reports/Missing_Time_Entries_Report.md` |
| Deduction Exception Report | Advanced Report | `reports/Deduction_Exception_Report.md` |
| Tax Exception Report | Advanced Report | `reports/Tax_Exception_Report.md` |

Required configuration:

- Add prompt-driven filters for pay period, company, pay group, and department.
- Add optional exception-type/status filters where specified.
- Configure subtotals and grand totals.
- Enable Excel export where permitted by security.
- Add drill-down links to worker payroll, time entry, benefits, and tax details.

Build evidence:

- Report definition screenshot
- Prompt screenshot
- Sample output screenshot
- Exported Excel sample from sandbox using masked data

### Step 4: Build Overview and Composite Dashboard

Build the overview report and composite dashboard after detailed reports are validated.

| Component | Specification |
| --- | --- |
| Payroll Exception Dashboard - Overview | `reports/Dashboard_Overview.md` |
| Payroll Exception and Reporting Composite Dashboard | `dashboards/Composite_Dashboard.md` |
| Layout and KPI definitions | `dashboards/Dashboard_Layout.md`, `dashboards/KPI_Definitions.md` |

Required configuration:

- Add six tabs: Overview, Payroll Costs, Overtime, Missing Time, Deductions, Tax Issues.
- Configure shared prompts once at the composite level where Workday supports it.
- Confirm tab-specific filters do not conflict with shared prompts.
- Add tab badges or visible exception counts if supported.
- Add the dashboard/worklet to the Payroll Manager homepage.

Build evidence:

- Composite report setup screenshot
- Each tab screenshot
- Shared prompt test screenshot
- Worklet homepage screenshot

### Step 5: Validate Build Migration

Move configuration through the approved Workday migration path.

| Tenant Stage | Activity | Exit Criteria |
| --- | --- | --- |
| Sandbox | Build and peer review | Reports return expected rows and calculations |
| Implementation/Test | Formal QA and UAT | No open Critical defects; High defects approved |
| Production | Deploy after approval | Smoke test passes with production security |

## Smoke Test After Migration

| Test | Expected Result |
| --- | --- |
| Open composite dashboard | Dashboard loads without error |
| Select current pay period | All tabs update consistently |
| Open Payroll Cost tab | Totals match payroll register sample |
| Open Overtime tab | Only non-exempt overtime workers appear |
| Open Missing Time tab | Approved PTO and holidays are excluded |
| Open Deductions tab | Only deduction exceptions appear |
| Open Tax Issues tab | Withholding and tax form exceptions appear |
| Export each report | Excel output opens and respects security |
| Test manager access | Manager sees only permitted organization scope |

## Exit Criteria

The tenant build is ready for production approval when:

- All reports are built and peer reviewed.
- Calculated fields pass independent worker-level validation.
- Security tests pass for Payroll Admin, HR Partner, Manager, Finance Analyst, Benefits Administrator, and Tax Analyst.
- Payroll cost totals reconcile to payroll register and GL control totals within approved tolerance.
- Performance tests meet dashboard and export targets.
- UAT sign-off is complete.
- No open Critical defects remain.
- Open High defects have approved disposition.

