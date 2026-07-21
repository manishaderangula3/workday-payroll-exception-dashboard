# Data Sources

## Payroll Exception & Reporting Dashboard

---

## Document Information

| Field | Details |
|-------|---------|
| **Project Name** | Workday Payroll Exception & Reporting Dashboard |
| **Document Version** | 1.0 |
| **Author** | Payroll Systems Team |
| **Date Created** | 2026-07-21 |
| **Status** | Draft |
| **Reference** | Technical_Design.md, Business_Requirements.md |

---

## 1. Primary Data Sources

### 1.1 All Payroll Results

| Attribute | Details |
|-----------|---------|
| **Workday Data Source Name** | `All Payroll Results` |
| **Module** | Payroll |
| **Description** | Contains all completed and in-progress payroll calculation results for workers across all pay groups and pay periods |
| **Refresh Frequency** | Real-time (updated on each payroll calculation run) |
| **Estimated Volume** | ~50,000–200,000 rows per pay period (varies by org size) |
| **Retention** | Current year + 3 prior years |

#### Fields

| Field Name | Data Type | Description | Filterable | Sortable |
|------------|-----------|-------------|:----------:|:--------:|
| Worker | Reference (Worker) | Reference to the worker record | Yes | Yes |
| Employee_ID | Text (10) | Unique worker identifier | Yes | Yes |
| Pay_Period | Date Range | Start and end date of the pay period | Yes | Yes |
| Pay_Group | Reference (Pay Group) | Pay group assignment for the worker | Yes | Yes |
| Run_Category | Reference (Run Category) | Regular, Off-Cycle, On-Demand | Yes | Yes |
| Gross_Pay | Currency (12,2) | Total gross earnings before deductions | Yes | Yes |
| Net_Pay | Currency (12,2) | Take-home pay after all deductions and taxes | Yes | Yes |
| Total_Deductions | Currency (12,2) | Sum of all employee deductions | Yes | Yes |
| Total_Taxes | Currency (12,2) | Sum of all tax withholdings | Yes | Yes |
| Employer_Taxes | Currency (12,2) | Sum of all employer-paid taxes | No | Yes |
| Employer_Contributions | Currency (12,2) | Sum of employer benefit contributions | No | Yes |
| Payroll_Status | Text (20) | Calculation status (Complete, In Progress, Error) | Yes | No |
| Calculation_DateTime | DateTime | Timestamp of last calculation | Yes | Yes |
| Payment_Date | Date | Scheduled payment date | Yes | Yes |

#### Filter Capabilities
- Pay Period (date range selection)
- Pay Group (multi-select)
- Run Category (Regular, Off-Cycle, On-Demand)
- Payroll Status (Complete, In Progress, Error)
- Company / Organization
- Worker (individual lookup)

---

### 1.2 All Time Entries

| Attribute | Details |
|-----------|---------|
| **Workday Data Source Name** | `All Time Entries` |
| **Module** | Time Tracking |
| **Description** | Contains all submitted time entries for time-tracked (non-exempt) workers including hours, time type, and approval status |
| **Refresh Frequency** | Real-time (updated on worker submission/manager approval) |
| **Estimated Volume** | ~100,000–500,000 rows per pay period |
| **Retention** | Current year + 2 prior years |

#### Fields

| Field Name | Data Type | Description | Filterable | Sortable |
|------------|-----------|-------------|:----------:|:--------:|
| Worker | Reference (Worker) | Reference to the worker record | Yes | Yes |
| Employee_ID | Text (10) | Unique worker identifier | Yes | Yes |
| Date | Date | Calendar date of the time entry | Yes | Yes |
| Hours_Worked | Decimal (5,2) | Number of hours reported | No | Yes |
| Time_Type | Reference (Time Type) | Regular, Overtime, PTO, Holiday, Sick, etc. | Yes | Yes |
| In_Time | Time | Clock-in time (if applicable) | No | Yes |
| Out_Time | Time | Clock-out time (if applicable) | No | Yes |
| Approval_Status | Text (15) | Submitted, Approved, Denied, Draft | Yes | No |
| Week_Number | Integer | ISO week number for the entry | Yes | Yes |
| Pay_Period | Date Range | Associated pay period | Yes | Yes |
| Time_Entry_Group | Reference (Time Entry Group) | Worker's time entry template/group | Yes | No |
| Comment | Text (500) | Worker or manager comments | No | No |

#### Filter Capabilities
- Date Range
- Worker / Manager
- Approval Status
- Time Type
- Pay Period
- Supervisory Organization

---

### 1.3 All Workers

| Attribute | Details |
|-----------|---------|
| **Workday Data Source Name** | `All Workers` |
| **Module** | HCM Core |
| **Description** | Contains all active and recently terminated worker records with demographic, organizational, and compensation details |
| **Refresh Frequency** | Real-time (event-driven on worker changes) |
| **Estimated Volume** | ~5,000–50,000 rows (active workers) |
| **Retention** | Active + terminated within last 12 months |

#### Fields

| Field Name | Data Type | Description | Filterable | Sortable |
|------------|-----------|-------------|:----------:|:--------:|
| Employee_ID | Text (10) | Unique worker identifier | Yes | Yes |
| Legal_Name | Text (100) | Worker's legal full name | Yes | Yes |
| Preferred_Name | Text (100) | Worker's preferred/display name | No | Yes |
| Hire_Date | Date | Original hire date | Yes | Yes |
| Termination_Date | Date | Termination date (null if active) | Yes | Yes |
| Worker_Status | Text (15) | Active, Terminated, On Leave | Yes | No |
| Department | Reference (Organization) | Worker's home department | Yes | Yes |
| Cost_Center | Reference (Cost Center) | Assigned cost center | Yes | Yes |
| Location | Reference (Location) | Primary work location | Yes | Yes |
| Pay_Group | Reference (Pay Group) | Assigned pay group | Yes | Yes |
| Pay_Rate_Type | Text (10) | Hourly or Salaried | Yes | No |
| FLSA_Status | Text (10) | Exempt or Non-Exempt | Yes | No |
| Hourly_Rate | Currency (8,2) | Current hourly rate (hourly workers) | No | Yes |
| Annual_Salary | Currency (12,2) | Current annual salary (salaried workers) | No | Yes |
| Manager | Reference (Worker) | Direct manager reference | Yes | Yes |
| Manager_Name | Text (100) | Manager's display name | No | Yes |
| Supervisory_Org | Reference (Organization) | Supervisory organization | Yes | Yes |
| Work_Schedule | Reference (Work Schedule) | Assigned work schedule/calendar | Yes | No |
| Benefits_Eligible | Boolean | Whether worker is benefits-eligible | Yes | No |

#### Filter Capabilities
- Worker Status (Active, Terminated, On Leave)
- Department / Supervisory Organization
- Pay Group
- Location
- Pay Rate Type / FLSA Status
- Manager
- Hire Date range

---

### 1.4 All Pay Groups

| Attribute | Details |
|-----------|---------|
| **Workday Data Source Name** | `All Pay Groups` |
| **Module** | Payroll |
| **Description** | Configuration reference for all pay groups defining pay frequency, run categories, and processing schedules |
| **Refresh Frequency** | Configuration-driven (updated on admin changes) |
| **Estimated Volume** | ~5–50 rows |
| **Retention** | All active and inactive pay groups |

#### Fields

| Field Name | Data Type | Description | Filterable | Sortable |
|------------|-----------|-------------|:----------:|:--------:|
| Pay_Group_Name | Text (50) | Display name of the pay group | Yes | Yes |
| Pay_Group_ID | Text (20) | Unique identifier | Yes | Yes |
| Pay_Frequency | Text (20) | Weekly, Bi-Weekly, Semi-Monthly, Monthly | Yes | No |
| Run_Category | Reference (Run Category) | Associated run category | Yes | No |
| Pay_Period_Start | Date | Current period start date | Yes | Yes |
| Pay_Period_End | Date | Current period end date | Yes | Yes |
| Payment_Date | Date | Scheduled payment date | Yes | Yes |
| Time_Entry_Cutoff | Date | Deadline for time entry submission | No | No |
| Payroll_Close_Date | Date | Deadline for payroll processing | No | No |
| Country | Reference (Country) | Country association | Yes | No |
| Company | Reference (Company) | Legal entity association | Yes | Yes |
| Worker_Count | Integer | Number of workers in pay group | No | Yes |

#### Filter Capabilities
- Pay Frequency
- Country / Company
- Run Category
- Active status

---

## 2. Secondary Data Sources

### 2.1 Tax Authorities

| Attribute | Details |
|-----------|---------|
| **Workday Data Source Name** | `All Tax Authorities` |
| **Module** | Payroll (Tax) |
| **Description** | Reference data for federal, state, and local tax authorities and their withholding rules |
| **Refresh Frequency** | Configuration-driven (updated during tax updates) |
| **Estimated Volume** | ~100–500 rows |

#### Fields

| Field Name | Data Type | Description | Filterable | Sortable |
|------------|-----------|-------------|:----------:|:--------:|
| Tax_Authority_Name | Text (100) | Name of the taxing authority | Yes | Yes |
| Tax_Type | Text (30) | Federal, State, Local, FICA, Medicare, SUI | Yes | No |
| Jurisdiction | Text (50) | Geographic jurisdiction (state/locality) | Yes | Yes |
| Tax_Code | Text (20) | Unique tax authority code | Yes | No |
| Effective_Date | Date | Date the authority/rate became effective | Yes | Yes |
| Rate | Decimal (6,4) | Tax rate percentage | No | Yes |
| Wage_Base_Limit | Currency (12,2) | Annual wage base limit (if applicable) | No | No |
| Filing_Status_Required | Boolean | Whether filing status election is required | Yes | No |

---

### 2.2 Deduction Definitions

| Attribute | Details |
|-----------|---------|
| **Workday Data Source Name** | `All Deduction Definitions` |
| **Module** | Benefits / Payroll |
| **Description** | Master reference of all configured deduction types including benefit plans, garnishments, and voluntary deductions |
| **Refresh Frequency** | Configuration-driven (updated on plan changes) |
| **Estimated Volume** | ~50–300 rows |

#### Fields

| Field Name | Data Type | Description | Filterable | Sortable |
|------------|-----------|-------------|:----------:|:--------:|
| Deduction_Name | Text (100) | Display name of the deduction | Yes | Yes |
| Deduction_Code | Text (20) | Unique deduction identifier | Yes | No |
| Deduction_Category | Text (30) | Health, Dental, Vision, 401k, Garnishment, Voluntary | Yes | No |
| Pre_Tax | Boolean | Whether deduction is pre-tax | Yes | No |
| Frequency | Text (20) | Per-pay-period, Monthly, Annual | Yes | No |
| Default_Amount | Currency (10,2) | Default deduction amount (if flat) | No | Yes |
| Percentage_Based | Boolean | Whether amount is percentage-based | Yes | No |
| Employer_Match | Boolean | Whether employer contributes a match | Yes | No |
| Effective_Date | Date | Date deduction became active | Yes | Yes |
| End_Date | Date | Date deduction was discontinued (if applicable) | Yes | No |

---

### 2.3 Earning Types

| Attribute | Details |
|-----------|---------|
| **Workday Data Source Name** | `All Earning Types` |
| **Module** | Payroll |
| **Description** | Master reference of all earning types (regular, overtime, bonus, shift differential, etc.) |
| **Refresh Frequency** | Configuration-driven |
| **Estimated Volume** | ~20–100 rows |

#### Fields

| Field Name | Data Type | Description | Filterable | Sortable |
|------------|-----------|-------------|:----------:|:--------:|
| Earning_Name | Text (100) | Display name of the earning type | Yes | Yes |
| Earning_Code | Text (20) | Unique earning type identifier | Yes | No |
| Earning_Category | Text (30) | Regular, Overtime, Bonus, Allowance, Shift, Other | Yes | No |
| Rate_Multiplier | Decimal (4,2) | Pay rate multiplier (e.g., 1.5 for OT) | No | Yes |
| Taxable | Boolean | Whether earning is subject to tax | Yes | No |
| Include_In_Gross | Boolean | Whether included in gross pay calculation | Yes | No |
| Effective_Date | Date | Date earning type became active | Yes | Yes |

---

## 3. Data Source Relationships

### 3.1 Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        DATA SOURCE RELATIONSHIP MAP                              │
└─────────────────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────────┐
                          │   All Pay Groups    │
                          │   (Configuration)   │
                          └─────────┬───────────┘
                                    │
                           1:Many   │  (Workers assigned to Pay Groups)
                                    │
┌──────────────────┐       ┌────────▼────────────┐       ┌──────────────────────┐
│  Tax Authorities │       │                     │       │  Deduction           │
│                  │◄──────┤    All Workers      ├──────►│  Definitions         │
│  (Worker has     │ 1:Many│   (Central Hub)     │1:Many │  (Worker enrolled    │
│   tax elections) │       │                     │       │   in deductions)     │
└──────────────────┘       └──┬──────────────┬───┘       └──────────────────────┘
                              │              │
                     1:Many   │              │   1:Many
                              │              │
               ┌──────────────▼──┐     ┌─────▼──────────────────┐
               │                 │     │                        │
               │ All Time Entries│     │  All Payroll Results   │
               │                 │     │                        │
               └─────────────────┘     └────────────┬───────────┘
                                                    │
                                           1:Many   │
                                                    │
                                       ┌────────────▼───────────┐
                                       │                        │
                                       │   Earning Types        │
                                       │   (Result line items)  │
                                       │                        │
                                       └────────────────────────┘
```

### 3.2 Relationship Details

| Parent Data Source | Child Data Source | Relationship | Join Field | Description |
|-------------------|-------------------|:------------:|------------|-------------|
| All Workers | All Payroll Results | 1:Many | Worker (Employee_ID) | Each worker has multiple payroll results across pay periods |
| All Workers | All Time Entries | 1:Many | Worker (Employee_ID) | Each worker submits multiple time entries per pay period |
| All Pay Groups | All Workers | 1:Many | Pay_Group | Each pay group contains multiple workers |
| All Pay Groups | All Payroll Results | 1:Many | Pay_Group, Pay_Period | Each pay group generates results per period |
| All Workers | Tax Authorities | Many:Many | Worker Tax Elections (linking object) | Workers have elections for multiple tax authorities |
| All Workers | Deduction Definitions | Many:Many | Benefit Elections (linking object) | Workers enrolled in multiple deduction plans |
| All Payroll Results | Earning Types | 1:Many | Payroll Result Lines | Each result contains multiple earning line items |
| All Payroll Results | Deduction Definitions | 1:Many | Payroll Result Lines | Each result contains multiple deduction line items |

---

## 4. Data Source Usage by Report

| Report | Primary Data Source | Secondary Data Sources | Join Strategy |
|--------|--------------------|-----------------------|---------------|
| Dashboard Overview (KPIs) | All Payroll Results | All Workers, All Pay Groups | Worker reference → Worker details; Pay Group reference → period info |
| Overtime Exception Report | All Time Entries | All Workers | Worker reference → FLSA status, department, manager |
| Tax Exception Report | All Payroll Results | All Workers, Tax Authorities | Worker reference → tax elections; Tax Authority → withholding rules |
| Missing Time Entries Report | All Time Entries | All Workers, All Pay Groups | Worker reference → schedule; Pay Group → expected work days |
| Deduction Exception Report | All Payroll Results | All Workers, Deduction Definitions | Worker reference → benefit elections; Deduction Def → expected amounts |
| Payroll Cost Summary (Matrix) | All Payroll Results | All Workers, All Pay Groups | Worker reference → department; Pay Group → period grouping |

---

## 5. Data Volume & Performance Considerations

### 5.1 Volume Estimates

| Data Source | Rows per Period | Annual Growth | Query Complexity |
|-------------|:--------------:|:-------------:|:----------------:|
| All Payroll Results | 50,000–200,000 | ~10% | High (aggregations, comparisons) |
| All Time Entries | 100,000–500,000 | ~10% | Medium (date filtering, grouping) |
| All Workers | 5,000–50,000 | ~5% | Low (reference lookups) |
| All Pay Groups | 5–50 | Minimal | Low (configuration reference) |
| Tax Authorities | 100–500 | ~2% | Low (reference lookups) |
| Deduction Definitions | 50–300 | ~5% | Low (reference lookups) |
| Earning Types | 20–100 | Minimal | Low (reference lookups) |

### 5.2 Performance Optimization Strategies

| Strategy | Implementation | Impact |
|----------|---------------|--------|
| **Prompt-based filtering** | Require Pay Period and Pay Group at report runtime | Reduces initial data scan by 90%+ |
| **Indexed fields** | Filter on Worker, Pay Period, Pay Group, Status | Leverages Workday's native indexing |
| **Limit date ranges** | Default to current period; max lookback of 6 periods | Prevents full-table scans on historical data |
| **Aggregation at source** | Use summary-level data sources where available | Reduces row-level processing |
| **Calculated field caching** | Workday caches CF results per calculation run | Avoids re-computation on each report load |
| **Pagination** | Limit report output to 500 rows per page | Maintains UI responsiveness |

### 5.3 Refresh Frequency Summary

| Data Source | Update Trigger | Staleness Risk | Mitigation |
|-------------|---------------|:--------------:|------------|
| All Payroll Results | Payroll calculation run | Low (batch process) | Reports prompt for most recent completed run |
| All Time Entries | Worker submission / manager approval | Medium (continuous updates) | Dashboard refreshes on load; status filter for Approved only |
| All Workers | HR transaction (hire, term, transfer) | Low (event-driven) | Real-time in Workday; no additional sync needed |
| All Pay Groups | Admin configuration change | Very Low | Static reference; rarely changes |
| Tax Authorities | Tax update cycle (annual/legislative) | Very Low | Updated during Workday tax update releases |
| Deduction Definitions | Benefits configuration change | Low | Updated during open enrollment or plan changes |

---

## 6. Data Source Security

### 6.1 Domain Security Policies

| Data Source | Security Domain | Access Control |
|-------------|----------------|----------------|
| All Payroll Results | Worker Data: Payroll | Payroll Administrators, Payroll Managers |
| All Time Entries | Worker Data: Time Tracking | Time Tracking Administrators, Managers (own reports) |
| All Workers | Worker Data: Public Worker Reports | Broad access (filtered by org) |
| All Pay Groups | Set Up: Payroll | Payroll Administrators |
| Tax Authorities | Set Up: Payroll Tax | Payroll Administrators |
| Deduction Definitions | Set Up: Benefits | Benefits Administrators, Payroll Administrators |

### 6.2 Row-Level Security

All data sources support organization-based row-level security:
- **Payroll Manager** sees workers in their assigned pay groups and supervisory organizations
- **Department Manager** sees only direct reports
- **HR Business Partner** sees workers in their assigned organizations
- **Payroll Administrator** sees all workers (unrestricted)

---

## 7. Data Quality Considerations

| Concern | Data Source | Impact | Mitigation |
|---------|------------|--------|------------|
| Missing time entries | All Time Entries | Incomplete overtime calculations | Missing Time CF flags gaps before payroll run |
| Retroactive pay changes | All Payroll Results | Historical comparisons may shift | Use payment date (not period) for trend reports |
| Mid-period transfers | All Workers | Worker appears in multiple orgs | Use as-of-date logic tied to pay period end |
| Terminated workers with pending pay | All Payroll Results | May appear in exception reports | Filter by Worker Status; include terminated workers in final pay period only |
| Duplicate time entries | All Time Entries | Inflated hours | Filter for Approved status only; Workday prevents true duplicates |
