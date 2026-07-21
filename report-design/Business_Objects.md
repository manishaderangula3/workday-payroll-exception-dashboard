# Business Objects

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
| **Reference** | Data_Sources.md, Technical_Design.md |

---

## 1. Core Business Objects

### 1.1 Worker

| Attribute | Details |
|-----------|---------|
| **Workday Object Name** | `Worker` |
| **Business Object Type** | Core HCM |
| **Cardinality** | Central entity — referenced by all other objects |
| **Related Reports** | All reports (Dashboard Overview, Overtime, Tax, Missing Time, Deduction, Payroll Cost) |
| **Associated Calculated Fields** | CF_Payroll_Status, CF_Overtime_Hours, CF_Tax_Exception, CF_Missing_Time_Flag, CF_Deduction_Exception |

#### Field Definitions

| Field Name | Data Type | Description | Usage in Dashboard |
|------------|-----------|-------------|-------------------|
| Employee_ID | Text (10) | Unique worker identifier; primary key across all reports | Join key for all data sources; displayed on all exception reports |
| Legal_Name | Text (100) | Worker's legal full name (Last, First Middle) | Display field on all reports; searchable |
| Preferred_Name | Text (100) | Worker's preferred display name | Used in report display when configured |
| Hire_Date | Date | Original hire date | Missing Time CF (mid-period hire logic); tenure calculations |
| Termination_Date | Date | Date of termination (null if active) | Exclusion logic for terminated workers |
| Worker_Status | Text (15) | Active, Terminated, On Leave | Filter field; exclusion of inactive workers from exceptions |
| Department | Reference (Organization) | Home department assignment | Grouping, filtering, and drill-down on all reports |
| Cost_Center | Reference (Cost Center) | Financial cost center | Payroll Cost Summary grouping |
| Location | Reference (Location) | Primary work location | Tax jurisdiction determination; report filtering |
| Pay_Group | Reference (Pay Group) | Assigned pay group | Links worker to pay period/schedule; primary prompt filter |
| Pay_Rate_Type | Text (10) | Hourly or Salaried | Overtime eligibility determination |
| FLSA_Status | Text (10) | Exempt or Non-Exempt | Overtime CF inclusion/exclusion logic |
| Hourly_Rate | Currency (8,2) | Current hourly rate | OT cost calculation (rate × 1.5) |
| Annual_Salary | Currency (12,2) | Current annual salary | Cost reporting for salaried workers |
| Manager | Reference (Worker) | Direct manager | Escalation contact on exception reports |
| Manager_Name | Text (100) | Manager's display name | Displayed on exception reports for escalation |
| Supervisory_Org | Reference (Organization) | Supervisory organization | Row-level security; organizational filtering |
| Work_Schedule | Reference (Work Schedule) | Assigned work schedule | Missing Time CF (expected days calculation) |
| Benefits_Eligible | Boolean | Benefits eligibility flag | Deduction Exception — only flag eligible workers |
| Tax_Filing_Status | Text (20) | Federal filing status (Single, Married, etc.) | Tax Exception CF logic |

#### Security Considerations
- **Field-Level Security:** Hourly_Rate, Annual_Salary restricted to Payroll Administrators and Compensation Partners
- **Row-Level Security:** Filtered by supervisory organization based on user's security group
- **Sensitive Data:** SSN and bank details are NOT included in this object for dashboard purposes

---

### 1.2 Payroll Result

| Attribute | Details |
|-----------|---------|
| **Workday Object Name** | `Payroll Result` |
| **Business Object Type** | Payroll |
| **Cardinality** | Many:1 to Worker (one worker has many payroll results across periods) |
| **Related Reports** | Dashboard Overview, Payroll Cost Summary, Deduction Exception, Tax Exception |
| **Associated Calculated Fields** | CF_Payroll_Status, CF_Deduction_Exception, CF_Tax_Exception |

#### Field Definitions

| Field Name | Data Type | Description | Usage in Dashboard |
|------------|-----------|-------------|-------------------|
| Payroll_Result_ID | Text (20) | Unique identifier for the payroll result | Internal reference; join key |
| Worker | Reference (Worker) | Associated worker | Join to Worker object for demographics |
| Pay_Period | Date Range | Pay period start and end dates | Primary time-based filter; period-over-period comparison |
| Pay_Group | Reference (Pay Group) | Pay group for this result | Prompt filter; grouping |
| Run_Category | Text (20) | Regular, Off-Cycle, On-Demand | Filtering; separate off-cycle from regular analysis |
| Gross_Pay | Currency (12,2) | Total gross earnings | KPI display; cost summary; period comparison |
| Net_Pay | Currency (12,2) | Net pay after deductions and taxes | KPI display; cost summary |
| Total_Deductions | Currency (12,2) | Sum of all employee deduction amounts | KPI display; deduction exception comparison |
| Total_Taxes | Currency (12,2) | Sum of all employee tax withholdings | KPI display; tax exception analysis |
| Employer_Taxes | Currency (12,2) | Employer-paid tax total (FICA, FUTA, SUI) | Total cost of employment calculations |
| Employer_Contributions | Currency (12,2) | Employer benefit contribution total | Total cost of employment calculations |
| Payroll_Status | Text (20) | Complete, In Progress, Error | CF_Payroll_Status input; report filtering |
| Calculation_DateTime | DateTime | Timestamp of last calculation | Audit trail; freshness indicator |
| Payment_Date | Date | Scheduled payment/direct deposit date | Trend reporting; payment reconciliation |
| Period_Variance_Gross | Currency (12,2) | Gross pay change from prior period | Calculated at report level; anomaly detection |
| Period_Variance_Pct | Decimal (5,2) | Percentage change from prior period | KPI trend indicators |

#### Payroll Result Line Items (Child Object)

| Field Name | Data Type | Description | Usage in Dashboard |
|------------|-----------|-------------|-------------------|
| Line_Type | Text (20) | Earning, Deduction, or Tax | Categorization for exception analysis |
| Code | Reference | Earning Type, Deduction Def, or Tax Authority ref | Links to configuration objects |
| Description | Text (100) | Line item description | Display on drill-down reports |
| Amount | Currency (12,2) | Dollar amount for this line | Exception comparison (expected vs. actual) |
| Hours | Decimal (5,2) | Hours associated (earnings only) | Overtime calculation cross-reference |
| Rate | Currency (8,2) | Rate used for calculation | Audit/verification purposes |

#### Security Considerations
- **Field-Level Security:** All payroll amounts restricted to Payroll domain security
- **Row-Level Security:** Filtered by pay group assignment and supervisory org
- **Audit:** All access to payroll results is logged

---

### 1.3 Time Entry

| Attribute | Details |
|-----------|---------|
| **Workday Object Name** | `Time Entry` |
| **Business Object Type** | Time Tracking |
| **Cardinality** | Many:1 to Worker (one worker has many time entries per period) |
| **Related Reports** | Overtime Exception Report, Missing Time Entries Report |
| **Associated Calculated Fields** | CF_Overtime_Hours, CF_Missing_Time_Flag |

#### Field Definitions

| Field Name | Data Type | Description | Usage in Dashboard |
|------------|-----------|-------------|-------------------|
| Time_Entry_ID | Text (20) | Unique time entry identifier | Internal reference |
| Worker | Reference (Worker) | Associated worker | Join to Worker for demographics/FLSA |
| Date | Date | Calendar date of time entry | Date-level gap analysis (Missing Time CF) |
| Hours_Worked | Decimal (5,2) | Hours reported for this entry | Overtime CF summation; weekly total |
| Time_Type | Reference (Time Type) | Regular, Overtime, PTO, Holiday, Sick, Jury Duty | OT exclusion logic (PTO/Holiday not counted) |
| In_Time | Time | Clock-in timestamp | Detailed time audit |
| Out_Time | Time | Clock-out timestamp | Detailed time audit |
| Approval_Status | Text (15) | Draft, Submitted, Approved, Denied | Only Approved entries count for payroll; Missing Time flags non-Approved |
| Week_Number | Integer | ISO week number | Weekly OT threshold grouping (>40 hrs/week) |
| Pay_Period | Date Range | Associated pay period | Links time entries to payroll period |
| Cost_Center_Override | Reference (Cost Center) | Cost center allocation override | Cost allocation reporting |
| Project | Reference (Project) | Project/task association (if applicable) | Not used in exception dashboard |
| Comment | Text (500) | Worker or approver comments | Context for exceptions |

#### Security Considerations
- **Field-Level Security:** Time entries visible to worker, manager, and time tracking admins
- **Row-Level Security:** Managers see direct reports only; Payroll sees all in assigned pay groups
- **Self-Service:** Workers can view and edit their own time entries (Draft/Submitted status)

---

### 1.4 Deduction

| Attribute | Details |
|-----------|---------|
| **Workday Object Name** | `Payroll Deduction Result` / `Benefit Election` |
| **Business Object Type** | Payroll / Benefits |
| **Cardinality** | Many:1 to Worker; Many:1 to Payroll Result |
| **Related Reports** | Deduction Exception Report |
| **Associated Calculated Fields** | CF_Deduction_Exception |

#### Field Definitions

| Field Name | Data Type | Description | Usage in Dashboard |
|------------|-----------|-------------|-------------------|
| Deduction_ID | Text (20) | Unique deduction result identifier | Internal reference |
| Worker | Reference (Worker) | Associated worker | Join to Worker for demographics |
| Payroll_Result | Reference (Payroll Result) | Parent payroll result | Links deduction to specific pay period result |
| Deduction_Type | Reference (Deduction Definition) | Type of deduction (Medical, 401k, etc.) | Exception categorization |
| Deduction_Category | Text (30) | Health, Dental, Vision, Retirement, Garnishment, Voluntary | Grouping and filtering |
| Expected_Amount | Currency (10,2) | Amount expected per benefit election/plan | Comparison baseline for exception detection |
| Actual_Amount | Currency (10,2) | Amount actually deducted in payroll result | Compared against expected for variance |
| Variance | Currency (10,2) | Actual − Expected (calculated) | Exception threshold trigger |
| Variance_Pct | Decimal (5,2) | Percentage variance from expected | Threshold comparison (default: 10%) |
| Status | Text (20) | Success, Failed, Partial, Arrears | Exception type classification |
| Arrears_Balance | Currency (10,2) | Outstanding arrears amount (if applicable) | Arrears exception display |
| Effective_Date | Date | Date deduction election became effective | Context for new enrollments |
| Pre_Tax | Boolean | Whether deduction is pre-tax | Tax impact analysis |
| Employer_Match_Amount | Currency (10,2) | Employer match contribution (if applicable) | Total cost reporting |

#### Security Considerations
- **Field-Level Security:** Deduction amounts visible only to Payroll and Benefits Administrators
- **Row-Level Security:** Filtered by supervisory org and pay group
- **PII Concern:** Garnishment details may require additional restriction

---

### 1.5 Tax

| Attribute | Details |
|-----------|---------|
| **Workday Object Name** | `Payroll Tax Result` / `Worker Tax Election` |
| **Business Object Type** | Payroll (Tax) |
| **Cardinality** | Many:1 to Worker; Many:1 to Payroll Result |
| **Related Reports** | Tax Exception Report |
| **Associated Calculated Fields** | CF_Tax_Exception |

#### Field Definitions

| Field Name | Data Type | Description | Usage in Dashboard |
|------------|-----------|-------------|-------------------|
| Tax_Result_ID | Text (20) | Unique tax result line identifier | Internal reference |
| Worker | Reference (Worker) | Associated worker | Join to Worker for location/filing status |
| Payroll_Result | Reference (Payroll Result) | Parent payroll result | Links tax to specific pay period |
| Tax_Type | Text (30) | Federal Income, State Income, Local, FICA, Medicare, SUI, FUTA | Exception categorization |
| Tax_Authority | Reference (Tax Authority) | Taxing authority reference | Jurisdiction and rate lookup |
| Jurisdiction | Text (50) | State/local jurisdiction name | Multi-state analysis |
| Taxable_Wages | Currency (12,2) | Wages subject to this tax | Rate verification |
| Amount_Withheld | Currency (12,2) | Actual tax amount withheld | Exception detection (zero when expected) |
| Expected_Amount | Currency (12,2) | Expected withholding based on elections | Comparison baseline |
| Filing_Status | Text (20) | Single, Married, Head of Household, Exempt | Exception logic (Exempt > 1 year) |
| Allowances | Integer | Number of allowances/dependents claimed | Withholding calculation factor |
| Additional_Withholding | Currency (8,2) | Extra withholding amount elected by worker | Adjusts expected amount |
| YTD_Wages | Currency (12,2) | Year-to-date taxable wages | Wage base limit comparison |
| YTD_Tax | Currency (12,2) | Year-to-date tax withheld | Cumulative tracking |
| Election_Date | Date | Date of most recent W-4/state form | Expiration check (>1 year = flag) |
| Election_Expired | Boolean | Whether election is older than 1 year | Direct flag for Tax Exception CF |

#### Security Considerations
- **Field-Level Security:** Tax details restricted to Payroll Tax Administrators
- **Row-Level Security:** Filtered by pay group and supervisory org
- **Compliance:** Tax election data subject to IRS and state regulatory requirements

---

## 2. Object Relationship Map

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS OBJECT RELATIONSHIP MAP                            │
└─────────────────────────────────────────────────────────────────────────────────┘

                         ┌────────────────────────┐
                         │      PAY GROUP         │
                         │                        │
                         │  Pay_Group_Name        │
                         │  Pay_Frequency         │
                         │  Pay_Period            │
                         └───────────┬────────────┘
                                     │
                                     │ 1:Many
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              WORKER (Central Hub)                             │
│                                                                              │
│  Employee_ID | Legal_Name | Department | Location | Pay_Group | FLSA_Status  │
│  Hire_Date | Worker_Status | Manager | Work_Schedule | Hourly_Rate           │
└───────┬──────────────────────────┬───────────────────────────┬───────────────┘
        │                          │                           │
        │ 1:Many                   │ 1:Many                    │ 1:Many
        ▼                          ▼                           ▼
┌───────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐
│   TIME ENTRY      │   │   PAYROLL RESULT    │   │   TAX (Worker Election) │
│                   │   │                     │   │                         │
│  Date             │   │  Pay_Period         │   │  Tax_Type               │
│  Hours_Worked     │   │  Gross_Pay          │   │  Jurisdiction           │
│  Time_Type        │   │  Net_Pay            │   │  Filing_Status          │
│  Approval_Status  │   │  Total_Deductions   │   │  Election_Date          │
│  Week_Number      │   │  Total_Taxes        │   │  Amount_Withheld        │
│                   │   │  Payroll_Status      │   │                         │
└───────────────────┘   └──────────┬──────────┘   └─────────────────────────┘
                                   │
                          1:Many   │
                                   ▼
                        ┌─────────────────────┐
                        │    DEDUCTION        │
                        │                     │
                        │  Deduction_Type     │
                        │  Expected_Amount    │
                        │  Actual_Amount      │
                        │  Variance           │
                        │  Status             │
                        │  Arrears_Balance    │
                        └─────────────────────┘


    LEGEND:
    ─────────────────────────
    1:Many  = One parent record relates to many child records
    ──►     = Direction of relationship (parent → child)
```

---

## 3. Calculated Fields by Business Object

### 3.1 Calculated Field Mapping

| Calculated Field | Primary Object | Input Fields | Output | Used In Report |
|-----------------|----------------|--------------|--------|---------------|
| CF_Payroll_Status | Payroll Result | Payroll_Status, Gross_Pay, Net_Pay, Total_Deductions | Status classification (Normal, Warning, Error) | Dashboard Overview |
| CF_Overtime_Hours | Time Entry + Worker | Hours_Worked, Week_Number, FLSA_Status, Time_Type | OT hours, OT cost, alert level | Overtime Exception Report |
| CF_Missing_Time_Flag | Time Entry + Worker | Date, Work_Schedule, Hire_Date, Termination_Date, Approval_Status | Missing day count, specific dates | Missing Time Entries Report |
| CF_Deduction_Exception | Deduction + Payroll Result | Expected_Amount, Actual_Amount, Status, Arrears_Balance | Exception type, variance | Deduction Exception Report |
| CF_Tax_Exception | Tax + Worker | Amount_Withheld, Filing_Status, Election_Date, Jurisdiction | Exception type, severity | Tax Exception Report |

### 3.2 Calculated Field Dependencies

```
Worker (FLSA_Status, Work_Schedule, Hire_Date)
    │
    ├──► CF_Overtime_Hours ──► Overtime Exception Report
    │         ▲
    │         │
    │    Time Entry (Hours_Worked, Week_Number, Time_Type)
    │
    ├──► CF_Missing_Time_Flag ──► Missing Time Entries Report
    │         ▲
    │         │
    │    Time Entry (Date, Approval_Status)
    │
    ├──► CF_Tax_Exception ──► Tax Exception Report
    │         ▲
    │         │
    │    Tax (Amount_Withheld, Filing_Status, Election_Date)
    │
    └──► CF_Deduction_Exception ──► Deduction Exception Report
              ▲
              │
         Deduction (Expected_Amount, Actual_Amount, Status)
```

---

## 4. Field-Level Security Matrix

### 4.1 Security by Role and Object

| Field Category | Payroll Admin | Payroll Manager | HR Business Partner | Department Manager | Finance Analyst |
|---------------|:-------------:|:---------------:|:-------------------:|:------------------:|:---------------:|
| **Worker — Basic** (Name, Dept, Status) | ✓ | ✓ | ✓ | ✓ (direct reports) | ✓ |
| **Worker — Compensation** (Rate, Salary) | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Worker — Tax Elections** (Filing Status) | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Payroll Result — Amounts** (Gross, Net) | ✓ | ✓ | ✗ | ✗ | ✓ (aggregated) |
| **Payroll Result — Detail Lines** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Time Entry — Hours** | ✓ | ✓ | ✓ | ✓ (direct reports) | ✗ |
| **Deduction — Amounts** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Deduction — Garnishments** | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Tax — Withholding Amounts** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Tax — Filing Details** | ✓ | ✓ | ✗ | ✗ | ✗ |

### 4.2 Security Implementation Notes

| Consideration | Implementation |
|---------------|---------------|
| **Constrained security groups** | Reports use intersection of role-based and org-based security |
| **Aggregation access** | Finance Analyst sees department-level totals, not worker-level details |
| **Garnishment restriction** | Only Payroll Administrator can view garnishment type and amounts |
| **Self-service exclusion** | Workers cannot access this dashboard (payroll data is manager+ only) |
| **Audit logging** | All report executions logged with user, timestamp, and parameters |
| **Export controls** | Excel/PDF export respects same field-level security as on-screen |

---

## 5. Object Usage Summary

### 5.1 Objects by Report

| Report | Worker | Payroll Result | Time Entry | Deduction | Tax |
|--------|:------:|:--------------:|:----------:|:---------:|:---:|
| Dashboard Overview (KPIs) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Overtime Exception | ✓ | — | ✓ | — | — |
| Tax Exception | ✓ | ✓ | — | — | ✓ |
| Missing Time Entries | ✓ | — | ✓ | — | — |
| Deduction Exception | ✓ | ✓ | — | ✓ | — |
| Payroll Cost Summary | ✓ | ✓ | — | — | — |

### 5.2 Object Cardinality Summary

| Relationship | Type | Example |
|-------------|:----:|---------|
| Pay Group → Worker | 1:Many | "Bi-Weekly US" pay group contains 500 workers |
| Worker → Payroll Result | 1:Many | 1 worker has 26 results/year (bi-weekly) |
| Worker → Time Entry | 1:Many | 1 worker has ~10-22 entries/pay period |
| Worker → Tax Election | 1:Many | 1 worker has 2-5 tax elections (fed + state + local) |
| Payroll Result → Deduction Line | 1:Many | 1 result has 5-15 deduction lines |
| Payroll Result → Tax Line | 1:Many | 1 result has 3-8 tax lines |
| Worker → Deduction (via Election) | Many:Many | Workers enrolled in multiple plans; plans have multiple enrollees |
