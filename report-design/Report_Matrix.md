# Report Matrix

## Payroll Exception & Reporting Dashboard

---

## Document Information

| Field | Details |
|-------|---------|
| Project Name | Workday Payroll Exception & Reporting Dashboard |
| Document Version | 1.0 |
| Author | Payroll Systems Team |
| Date Updated | 2026-07-29 |
| Status | Draft |
| Reference | Data_Sources.md, Business_Objects.md, Filters.md, Prompts.md, Security.md, Functional_Design.md, Technical_Design.md |

---

## 1. Report Inventory Matrix

| Report Name | Report Type | Data Source | Key Columns | Calculated Fields Used | Filters | Prompts | Output Format |
|-------------|-------------|-------------|-------------|-------------------------|---------|---------|---------------|
| Payroll Cost Report | Advanced (matrix-style summary) | All Payroll Results (+ Worker attributes) | Department, Pay Group, Worker Count, Gross Pay, Net Pay, Total Deductions, Total Taxes, Employer Costs, Period Variance $/% | CF_Payroll_Status | Static: Payroll Status in Complete/In Progress; Dynamic: Pay Period, Company, Pay Group, Department, Cost Center, Run Category | Pay Period, Company, Pay Group, Department, Cost Center, Include Employer Costs | Excel, PDF, CSV |
| Overtime Report | Advanced | All Time Entries + All Workers | Worker Name, Employee ID, Department, Manager, Hourly Rate, Weekly Hours, Overtime Hours, OT Cost, Consecutive Weeks | CF_Overtime_Hours | Static: Non-Exempt, Hourly, Time Type in OT-eligible set; Dynamic: Pay Period, Department, Pay Group, Hours Threshold | Pay Period, Company, Pay Group, Department, Overtime Hours Threshold | Excel, PDF, CSV |
| Missing Time Entries Report | Advanced | All Time Entries + All Workers + Work Schedule | Worker Name, Employee ID, Department, Manager, Expected Days, Submitted Days, Missing Days, Missing Dates, Time Entry Status | CF_Missing_Time_Flag (and CF_Missing_Time_Days) | Static: Active + Time Entry Required; Dynamic: Pay Period, Department, Pay Group, Minimum Missing Days, Time Entry Status | Pay Period, Company, Pay Group, Department, Minimum Missing Days | Excel, PDF, CSV |
| Deduction Exception Report | Advanced | Payroll Deduction Results + Benefit Elections + Payroll Results | Worker Name, Employee ID, Deduction Type, Deduction Category, Expected Amount, Actual Amount, Variance $, Variance %, Exception Type, Arrears Balance | CF_Deduction_Exception, CF_Deduction_Variance | Static: Exception != None/Normal; Dynamic: Pay Period, Deduction Category, Benefit Plan, Variance Thresholds | Pay Period, Company, Pay Group, Department, Exception Threshold %, Exception Threshold $, Deduction Category | Excel, PDF, CSV |
| Tax Exception Report | Advanced | Payroll Tax Results + Tax Elections + Workers + Payroll Results | Worker Name, Employee ID, Department, Exception Type, Tax Authority, Tax Type, Filing Status, Taxable Wages, Amount Withheld, Election Date, Work State, Resident State | CF_Tax_Exception, CF_Tax_Variance | Static: Exception != None/Normal; Dynamic: Pay Period, Tax Type, Jurisdiction, Thresholds, Exception Type | Pay Period, Company, Pay Group, Department, Exception Threshold %, Exception Threshold $, Tax Type | Excel, PDF, CSV |
| Dashboard Overview | Composite | Sub-reports: Dashboard Overview KPI + Overtime + Tax Exception + Missing Time + Deduction Exception + Payroll Cost | KPI tiles (Total Exceptions, OT Workers, Missing Time, Tax Exceptions, Deduction Exceptions, Payroll Cost, Processing Status), trend widgets, embedded detail tables | Uses all calculated fields through child reports | Global dashboard filters applied to all tabs; tab-level filters for exception category | Pay Period, Company, Pay Group, Department (+ tab-specific prompts) | On-screen composite, Excel/PDF export by child report |

---

## 2. Detailed Report Specifications

### 2.1 Payroll Cost Report

| Attribute | Detail |
|-----------|--------|
| Report Name | Payroll Cost Report |
| Report Type | Advanced (matrix-style summary/cross-tab) |
| Primary Data Source | All Payroll Results |
| Business Objects | Payroll Result, Worker, Pay Group |
| Fields Displayed | Department, Cost Center, Pay Group, Worker Count, Gross Pay, Net Pay, Total Deductions, Total Taxes, Employer Taxes, Employer Contributions, Total Employer Cost, Period Variance $, Period Variance % |
| Calculated Fields Referenced | CF_Payroll_Status |
| Static Filters | Payroll_Status in (Complete, In Progress); Active worker scope per security |
| Dynamic Filters | Pay Period, Company, Pay Group, Department/Supervisory Org, Cost Center, Run Category |
| Prompts | Pay Period (required), Company, Pay Group, Department, Cost Center, Include Employer Costs |
| Grouping and Sorting | Group by Department then Pay Group; sort Department ASC, Pay Group ASC |
| Totals/Subtotals | Subtotals by Pay Group; grand totals for all monetary columns and headcount |
| Drill-Down Targets | Department payroll detail; worker-level payroll results (security permitting) |
| Export Format | Excel, PDF, CSV |

### 2.2 Overtime Report

| Attribute | Detail |
|-----------|--------|
| Report Name | Overtime Report |
| Report Type | Advanced |
| Primary Data Source | All Time Entries |
| Business Objects | Time Entry, Worker |
| Fields Displayed | Worker Name, Employee ID, Department, Manager, Pay Rate Type, Hourly Rate, Week Number, Eligible Hours, Overtime Hours, OT Cost, Consecutive Weeks, Alert Level |
| Calculated Fields Referenced | CF_Overtime_Hours |
| Static Filters | Worker.FLSA_Status = Non-Exempt; Worker.Pay_Rate_Type = Hourly; Time_Type in (Regular, Training, Travel) |
| Dynamic Filters | Pay Period, Company, Pay Group, Department, OT Hours Threshold, Time Type |
| Prompts | Pay Period (required), Company, Pay Group, Department, Overtime Hours Threshold |
| Grouping and Sorting | Group by Department then Manager; sort Overtime Hours DESC |
| Totals/Subtotals | Subtotals by manager/department; totals for OT hours and OT cost |
| Drill-Down Targets | Worker time entry detail and weekly time blocks |
| Export Format | Excel, PDF, CSV |

### 2.3 Missing Time Entries Report

| Attribute | Detail |
|-----------|--------|
| Report Name | Missing Time Entries Report |
| Report Type | Advanced |
| Primary Data Source | All Time Entries (+ Work Schedule context) |
| Business Objects | Worker, Time Entry, Work Schedule, Time Off |
| Fields Displayed | Worker Name, Employee ID, Department, Manager, Manager Email, Expected Days, Submitted Days, Missing Days, Missing Date List, Last Submission Date, Entry Status |
| Calculated Fields Referenced | CF_Missing_Time_Flag, CF_Missing_Time_Days |
| Static Filters | Time_Entry_Required = Yes; Active workers; exclude full-period leave |
| Dynamic Filters | Pay Period, Company, Pay Group, Department, Minimum Missing Days, Time Entry Status |
| Prompts | Pay Period (required), Company, Pay Group, Department, Minimum Missing Days |
| Grouping and Sorting | Group by Department then Manager; sort Missing Days DESC then Worker Name ASC |
| Totals/Subtotals | Subtotals by manager; total missing days and impacted worker count |
| Drill-Down Targets | Worker time entry submission page; manager notification action |
| Export Format | Excel, PDF, CSV |

### 2.4 Deduction Exception Report

| Attribute | Detail |
|-----------|--------|
| Report Name | Deduction Exception Report |
| Report Type | Advanced |
| Primary Data Source | Payroll Deduction Results |
| Business Objects | Payroll Deduction Result, Worker, Benefit Election |
| Fields Displayed | Worker Name, Employee ID, Department, Deduction Plan/Code, Deduction Category, Expected Amount, Actual Amount, Variance $, Variance %, Exception Type, Arrears Balance, Effective Date |
| Calculated Fields Referenced | CF_Deduction_Exception, CF_Deduction_Variance |
| Static Filters | CF_Deduction_Exception != None/Normal |
| Dynamic Filters | Pay Period, Company, Pay Group, Department, Deduction Category, Benefit Plan, Variance Threshold %, Variance Threshold $ |
| Prompts | Pay Period (required), Company, Pay Group, Department, Exception Threshold %, Exception Threshold $, Deduction Category |
| Grouping and Sorting | Group by Exception Type then Deduction Category; sort ABS(Variance) DESC |
| Totals/Subtotals | Subtotals by exception type; totals for expected/actual/variance and arrears |
| Drill-Down Targets | Worker benefit elections and deduction line details |
| Export Format | Excel, PDF, CSV |

### 2.5 Tax Exception Report

| Attribute | Detail |
|-----------|--------|
| Report Name | Tax Exception Report |
| Report Type | Advanced |
| Primary Data Source | Payroll Tax Results |
| Business Objects | Payroll Tax Result, Worker, Tax Election, Tax Authority |
| Fields Displayed | Worker Name, Employee ID, Department, Tax Type, Tax Authority, Jurisdiction, Filing Status, Taxable Wages, Amount Withheld, Expected Amount, Variance $, Variance %, Exception Type, Election Date, Work State, Resident State |
| Calculated Fields Referenced | CF_Tax_Exception, CF_Tax_Variance |
| Static Filters | CF_Tax_Exception != None/Normal; Active workers |
| Dynamic Filters | Pay Period, Company, Pay Group, Department, Tax Type, Jurisdiction, Exception Type, Variance Threshold %, Variance Threshold $ |
| Prompts | Pay Period (required), Company, Pay Group, Department, Tax Type, Exception Threshold %, Exception Threshold $ |
| Grouping and Sorting | Group by Exception Type then Tax Authority; sort Exception Type ASC, Worker Name ASC |
| Totals/Subtotals | Subtotals by exception type/tax authority; totals for taxable wages and withholding variance |
| Drill-Down Targets | Worker tax elections and authority-level tax details |
| Export Format | Excel, PDF, CSV |

### 2.6 Dashboard Overview (Composite)

| Attribute | Detail |
|-----------|--------|
| Report Name | Dashboard Overview |
| Report Type | Composite |
| Primary Data Source | Child reports and Dashboard KPI report |
| Business Objects | Aggregate over Worker, Payroll Result, Time Entry, Deduction, Tax |
| Fields Displayed | KPI tiles: Total Exceptions, Overtime Workers, Missing Time Workers, Tax Exceptions, Deduction Exceptions, Total Payroll Cost, Payroll Processing Status; trend by pay period |
| Calculated Fields Referenced | CF_Payroll_Status, CF_Overtime_Hours, CF_Missing_Time_Flag, CF_Deduction_Exception, CF_Tax_Exception |
| Static Filters | Security-constrained row-level visibility by role |
| Dynamic Filters | Global: Pay Period, Company, Pay Group, Department; tab-level exception filters |
| Prompts | Pay Period, Company, Pay Group, Department (+ child report prompts) |
| Grouping and Sorting | KPI summary on overview; child report grouping inherited |
| Totals/Subtotals | Aggregate KPI totals; inherited totals from child reports |
| Drill-Down Targets | KPI card to corresponding detail report tab; row-level drill-through to worker pages |
| Export Format | Child report export to Excel/PDF/CSV; dashboard snapshots PDF |

---

## 3. Report Dependencies

### 3.1 Composite Dashboard Feed Map

| Composite Dashboard Tab | Feeding Report | Dependency Type |
|-------------------------|----------------|-----------------|
| Overview | Dashboard Overview KPI Report | Direct embedded sub-report |
| Overtime | Overtime Report | Direct embedded sub-report |
| Tax Exceptions | Tax Exception Report | Direct embedded sub-report |
| Missing Time | Missing Time Entries Report | Direct embedded sub-report |
| Deductions | Deduction Exception Report | Direct embedded sub-report |
| Cost | Payroll Cost Report | Direct embedded sub-report |

### 3.2 Calculated Field Dependency Matrix

| Calculated Field | Dependent Data Sources | Reports Using It |
|------------------|------------------------|------------------|
| CF_Payroll_Status | All Payroll Results, All Time Entries (status checks), Workers | Payroll Cost Report, Dashboard Overview |
| CF_Overtime_Hours | All Time Entries, Workers, Work Schedules | Overtime Report, Dashboard Overview |
| CF_Missing_Time_Flag / CF_Missing_Time_Days | All Time Entries, Work Schedule, Time Off, Worker employment dates | Missing Time Entries Report, Dashboard Overview |
| CF_Deduction_Exception / CF_Deduction_Variance | Payroll Deduction Results, Benefit Elections, Payroll Results | Deduction Exception Report, Dashboard Overview |
| CF_Tax_Exception / CF_Tax_Variance | Payroll Tax Results, Tax Elections, Tax Authorities, Worker location/state | Tax Exception Report, Dashboard Overview |

### 3.3 Shared Filters and Prompts

| Shared Element | Type | Used By |
|----------------|------|---------|
| Pay Period | Global prompt/filter | All reports + dashboard |
| Company | Global prompt/filter | All reports + dashboard |
| Pay Group | Global prompt/filter | All reports + dashboard |
| Department/Supervisory Org | Global prompt/filter | All reports + dashboard |
| Exception Threshold (%) | Prompt/filter | Tax Exception, Deduction Exception |
| Exception Threshold ($) | Prompt/filter | Tax Exception, Deduction Exception |
| Overtime Hours Threshold | Prompt/filter | Overtime Report |

---

## 4. Report Scheduling Matrix

| Report Name | Run Frequency | Distribution List | Delivery Mode | Scheduled vs On-Demand | Default Format |
|-------------|---------------|-------------------|---------------|------------------------|----------------|
| Payroll Cost Report | Bi-weekly aligned to pay period close; optional daily for finance | Payroll Administrators, Payroll Analysts, Finance stakeholders | Workday inbox + optional email attachment | Both (scheduled + on-demand) | Excel |
| Overtime Report | Daily during open pay period; weekly summary | Payroll Administrators, Payroll Analysts, HR Partners, Department Managers (scoped) | Workday inbox; manager digest | Both | Excel |
| Missing Time Entries Report | Daily; increased cadence in final 2 days before payroll close | Payroll Administrators, Payroll Analysts, HR Partners, Department Managers (direct reports) | Workday inbox + critical alert email when threshold breached | Both | Excel |
| Deduction Exception Report | Per payroll calculation run; optional daily re-check | Payroll Administrators, Payroll Analysts, Benefits Admins | Workday inbox + optional email | Both | Excel |
| Tax Exception Report | Per payroll calculation run; weekly compliance review | Payroll Administrators, Payroll Analysts (tax scope) | Workday inbox + optional email | Both | Excel |
| Dashboard Overview | Not batch-delivered by default; refreshes on access | Payroll Administrators, Payroll Analysts, HR Partners, Managers (scoped) | On-screen composite; optional PDF snapshot schedule for leadership | Primarily on-demand (optional scheduled snapshot) | PDF |

### 4.1 Scheduling Notes

| Parameter | Standard |
|-----------|----------|
| Default schedule time | 09:00 local tenant time |
| Empty report suppression | Enabled option: deliver only when exceptions exist |
| Security behavior | Distribution resolves row-level security per recipient |
| Escalation | Critical exception alerts escalate if unacknowledged |

---

## 5. Cross-Reference Matrices

### 5.1 Business Object to Report Usage

| Business Object | Reports Using It |
|-----------------|------------------|
| Worker | Payroll Cost Report, Overtime Report, Missing Time Entries Report, Deduction Exception Report, Tax Exception Report, Dashboard Overview |
| Payroll Result | Payroll Cost Report, Deduction Exception Report, Tax Exception Report, Dashboard Overview |
| Time Entry | Overtime Report, Missing Time Entries Report, Dashboard Overview |
| Work Schedule | Overtime Report, Missing Time Entries Report, Dashboard Overview |
| Payroll Deduction Result | Deduction Exception Report, Dashboard Overview |
| Benefit Election | Deduction Exception Report, Dashboard Overview |
| Payroll Tax Result | Tax Exception Report, Dashboard Overview |
| Tax Election | Tax Exception Report, Dashboard Overview |
| Tax Authority | Tax Exception Report |
| Pay Group | Payroll Cost Report, Overtime Report, Missing Time Entries Report, Deduction Exception Report, Tax Exception Report, Dashboard Overview |

### 5.2 Calculated Field to Report Usage

| Calculated Field | Payroll Cost | Overtime | Missing Time | Deduction Exception | Tax Exception | Dashboard Overview |
|------------------|:------------:|:--------:|:------------:|:-------------------:|:-------------:|:------------------:|
| CF_Payroll_Status | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| CF_Overtime_Hours | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| CF_Missing_Time_Flag / CF_Missing_Time_Days | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| CF_Deduction_Exception / CF_Deduction_Variance | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| CF_Tax_Exception / CF_Tax_Variance | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### 5.3 Security Group to Report Access Matrix

| Security Group | Payroll Cost | Overtime | Missing Time | Deduction Exception | Tax Exception | Dashboard Overview |
|----------------|:------------:|:--------:|:------------:|:-------------------:|:-------------:|:------------------:|
| Payroll Administrator | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Payroll Analyst | ✅ Scoped to assigned pay groups | ✅ Scoped to assigned pay groups | ✅ Scoped to assigned pay groups | ✅ Scoped to assigned pay groups | ✅ Scoped to assigned pay groups | ✅ Scoped to assigned pay groups |
| HR Partner | ❌ | ✅ Scoped to assigned supervisory orgs | ✅ Scoped to assigned supervisory orgs | ❌ | ❌ | ✅ Scoped to assigned supervisory orgs |
| Manager (Self-Service) | ❌ | ✅ Scoped to direct reports | ✅ Scoped to direct reports | ❌ | ❌ | ✅ Scoped to direct reports |

---

## 6. Operational Dependency Summary

| Dependency Area | Upstream Component | Downstream Impact |
|-----------------|--------------------|-------------------|
| Payroll calculation completion | Payroll engine updates All Payroll Results | Drives Payroll Cost, Tax, Deduction, and dashboard status KPIs |
| Time entry approval | Time Tracking updates All Time Entries | Drives Overtime and Missing Time exception counts |
| Benefit election changes | Benefit Elections + Deduction definitions | Alters expected deductions and exception classification |
| Tax election/form updates | Tax Elections + Tax Authority setup | Alters expected withholding and tax exception outcomes |
| Security assignment changes | Workday security groups and org assignments | Changes report access scope and row visibility across all reports |

---

## 7. Assumptions

| ID | Assumption |
|----|------------|
| A1 | Report column sets reflect current design baseline and may be refined during build sprint configuration. |
| A2 | Payroll Cost Report is modeled as an advanced report with matrix-style output in the dashboard cost tab. |
| A3 | Export format support follows Workday capabilities: Excel/PDF for all reports, CSV for advanced report outputs. |
| A4 | Scheduling and distribution are constrained by each recipient's security scope at runtime. |

