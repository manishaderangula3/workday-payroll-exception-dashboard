# Technical Design Document (TDD)

## Payroll Exception & Reporting Dashboard

---

## Document Information

| Field | Details |
|-------|---------|
| **Project Name** | Workday Payroll Exception & Reporting Dashboard |
| **Document Version** | 1.0 |
| **Author** | Payroll Systems Team |
| **Date Created** | 2026-07-18 |
| **Status** | Draft |
| **Reference** | Business_Requirements.md, Functional_Design.md |

---

## 1. Architecture Overview

### 1.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WORKDAY TENANT                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    DATA SOURCE LAYER                             │   │
│  │                                                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │   │
│  │  │  Payroll    │  │  Time       │  │  HCM Core               │ │   │
│  │  │  Results    │  │  Tracking   │  │  (Worker, Org, Benefits) │ │   │
│  │  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘ │   │
│  └─────────┼────────────────┼───────────────────────┼──────────────┘   │
│            │                │                       │                   │
│            ▼                ▼                       ▼                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                 CALCULATED FIELDS LAYER                          │   │
│  │                                                                  │   │
│  │  ┌───────────────┐  ┌──────────────────┐  ┌─────────────────┐  │   │
│  │  │ Payroll_      │  │ Overtime_        │  │ Missing_        │  │   │
│  │  │ Status_CF     │  │ Hours_CF         │  │ Time_CF         │  │   │
│  │  └───────────────┘  └──────────────────┘  └─────────────────┘  │   │
│  │  ┌───────────────┐  ┌──────────────────┐                       │   │
│  │  │ Deduction_    │  │ Tax_             │                       │   │
│  │  │ Check_CF      │  │ Exception_CF     │                       │   │
│  │  └───────────────┘  └──────────────────┘                       │   │
│  └────────────────────────────┬────────────────────────────────────┘   │
│                               │                                        │
│                               ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                 REPORT LAYER                                     │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │  ADVANCED REPORTS                                          │ │   │
│  │  │  • Dashboard Overview (KPI Summary)                        │ │   │
│  │  │  • Overtime Exception Report                               │ │   │
│  │  │  • Tax Exception Report                                    │ │   │
│  │  │  • Missing Time Entries Report                             │ │   │
│  │  │  • Deduction Exception Report                              │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │  MATRIX REPORT                                             │ │   │
│  │  │  • Payroll Cost Summary (cross-tab by Dept × Pay Period)   │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  └────────────────────────────┬────────────────────────────────────┘   │
│                               │                                        │
│                               ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                 COMPOSITE DASHBOARD                              │   │
│  │                                                                  │   │
│  │  Tab 1: Overview (KPI Tiles + Charts)                           │   │
│  │  Tab 2: Overtime Exceptions                                     │   │
│  │  Tab 3: Tax Exceptions                                          │   │
│  │  Tab 4: Missing Time Entries                                    │   │
│  │  Tab 5: Deduction Exceptions                                    │   │
│  │  Tab 6: Payroll Cost Summary                                    │   │
│  └────────────────────────────┬────────────────────────────────────┘   │
│                               │                                        │
│                               ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                 SECURITY & DELIVERY LAYER                        │   │
│  │                                                                  │   │
│  │  • Role-Based Security Groups       • Scheduled Report Delivery │   │
│  │  • Row-Level Org-Based Filtering    • Workday Notifications     │   │
│  │  • Domain Security Policies         • Excel/PDF Export          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Workday Report Types Used

| Report Type | Usage | Justification |
|-------------|-------|---------------|
| **Advanced** | Exception detail reports (Overtime, Tax, Missing Time, Deduction) | Supports calculated fields, complex filters, prompts, grouping, conditional formatting |
| **Matrix** | Payroll Cost Summary | Cross-tabulation of costs by department and pay period; supports row/column/value configuration |
| **Composite** | Main Dashboard | Combines multiple sub-reports into a single tabbed interface; supports KPI tiles and navigation |

### 1.3 Calculated Fields Layer

Calculated fields serve as the business logic layer between raw data sources and the report output. They encapsulate exception detection rules so that:

- Logic is reusable across multiple reports
- Changes to thresholds or rules are centralized
- No custom code or integrations are required

### 1.4 Dashboard Composition Structure

```
Composite Dashboard: "Payroll Exception Dashboard"
│
├── Tab 1: Dashboard Overview
│   ├── Sub-report: KPI_Summary_Report (Advanced)
│   ├── Tile: Total Exceptions Count
│   ├── Tile: Overtime Workers Count
│   ├── Tile: Tax Exceptions Count
│   ├── Tile: Missing Time Count
│   └── Tile: Deduction Exceptions Count
│
├── Tab 2: Overtime Exceptions
│   └── Sub-report: Overtime_Exception_Report (Advanced)
│
├── Tab 3: Tax Exceptions
│   └── Sub-report: Tax_Exception_Report (Advanced)
│
├── Tab 4: Missing Time Entries
│   └── Sub-report: Missing_Time_Entries_Report (Advanced)
│
├── Tab 5: Deduction Exceptions
│   └── Sub-report: Deduction_Exception_Report (Advanced)
│
└── Tab 6: Payroll Costs
    └── Sub-report: Payroll_Cost_Report (Matrix)
```

---

## 2. Data Model

### 2.1 Primary Data Sources

| Data Source | Workday Module | Description | Update Frequency |
|-------------|----------------|-------------|------------------|
| **All Payroll Results** | Payroll | Completed payroll calculation results including gross, net, deductions, taxes | Per payroll run |
| **All Time Entries** | Time Tracking | Worker-submitted time blocks with hours, type, and approval status | Real-time (worker submission) |
| **All Workers** | HCM Core | Active worker records with employment details, org assignment, compensation | Real-time (HR transactions) |
| **Worker Schedules** | Time Tracking | Expected work patterns and scheduled hours | On schedule change |
| **Benefit Elections** | Benefits | Active benefit plan enrollments and deduction amounts | On enrollment event |
| **Tax Elections** | Payroll | Federal, state, and local tax withholding elections (W-4, state forms) | On worker update |

### 2.2 Business Objects & Key Fields

#### Worker

| Field | Type | Description |
|-------|------|-------------|
| Worker_ID | Reference | Unique worker identifier |
| Worker_Name | Text | Full legal name |
| Employee_Type | Enum | Regular, Temporary, Contractor |
| Pay_Rate_Type | Enum | Salaried, Hourly |
| FLSA_Status | Enum | Exempt, Non-Exempt |
| Supervisory_Org | Reference | Manager's organizational unit |
| Pay_Group | Reference | Payroll processing group |
| Hire_Date | Date | Employment start date |
| Termination_Date | Date | Employment end date (null if active) |
| Work_Location | Reference | Primary work state/location |
| Manager | Reference | Direct supervisor |

#### Pay Group

| Field | Type | Description |
|-------|------|-------------|
| Pay_Group_ID | Reference | Unique pay group identifier |
| Pay_Group_Name | Text | Display name (e.g., "US Biweekly", "US Monthly") |
| Pay_Frequency | Enum | Weekly, Biweekly, Semi-Monthly, Monthly |
| Pay_Period_Start | Date | Current period start date |
| Pay_Period_End | Date | Current period end date |
| Payment_Date | Date | Check/deposit date |
| Run_Category | Enum | Regular, Off-Cycle, Correction |

#### Payroll Result

| Field | Type | Description |
|-------|------|-------------|
| Payroll_Result_ID | Reference | Unique result identifier |
| Worker | Reference | → Worker.Worker_ID |
| Pay_Group | Reference | → Pay_Group.Pay_Group_ID |
| Pay_Period | Reference | Associated pay period |
| Gross_Pay | Currency | Total gross earnings |
| Net_Pay | Currency | Net take-home pay |
| Total_Deductions | Currency | Sum of all deductions |
| Total_Taxes | Currency | Sum of all tax withholdings |
| Employer_Taxes | Currency | Employer tax contributions |
| Payroll_Status | Enum | Complete, In Progress, Error |
| Calculation_DateTime | DateTime | When payroll was calculated |

#### Time Entry

| Field | Type | Description |
|-------|------|-------------|
| Time_Entry_ID | Reference | Unique time entry identifier |
| Worker | Reference | → Worker.Worker_ID |
| Date | Date | Day of time entry |
| Hours | Decimal | Hours reported |
| Time_Type | Enum | Regular, Overtime, PTO, Holiday, Sick |
| Approval_Status | Enum | Approved, Pending, Denied |
| Week_Number | Integer | ISO week for aggregation |
| Time_Block_Start | Time | Clock-in time |
| Time_Block_End | Time | Clock-out time |

#### Deduction

| Field | Type | Description |
|-------|------|-------------|
| Deduction_ID | Reference | Unique deduction identifier |
| Worker | Reference | → Worker.Worker_ID |
| Payroll_Result | Reference | → Payroll_Result.Payroll_Result_ID |
| Deduction_Code | Reference | Deduction plan/type |
| Deduction_Category | Enum | Health, Dental, Vision, 401k, Garnishment, Voluntary |
| Expected_Amount | Currency | Per-period expected deduction |
| Actual_Amount | Currency | Amount actually withheld |
| Arrears_Balance | Currency | Outstanding arrears amount |
| Deduction_Status | Enum | Taken, Partial, Failed, Arrears |

#### Tax

| Field | Type | Description |
|-------|------|-------------|
| Tax_ID | Reference | Unique tax record identifier |
| Worker | Reference | → Worker.Worker_ID |
| Payroll_Result | Reference | → Payroll_Result.Payroll_Result_ID |
| Tax_Authority | Enum | Federal, State, Local |
| Tax_Type | Enum | Income, Social Security, Medicare, SUI, SDI |
| Filing_Status | Text | Married, Single, Head of Household |
| Withholding_Amount | Currency | Amount withheld |
| Taxable_Wages | Currency | Wages subject to tax |
| Election_Date | Date | Date of last W-4/state form |
| Exempt_Status | Boolean | Worker claims exempt |
| Work_State | Text | State where work performed |
| Resident_State | Text | Worker's home state |

### 2.3 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   Worker     │1─────*│  Payroll_Result   │*─────1│   Pay_Group      │
│              │       │                   │       │                  │
│ Worker_ID    │       │ Payroll_Result_ID │       │ Pay_Group_ID     │
│ Worker_Name  │       │ Gross_Pay         │       │ Pay_Group_Name   │
│ FLSA_Status  │       │ Net_Pay           │       │ Pay_Frequency    │
│ Pay_Group ───┼───────│ Total_Deductions  │       │ Pay_Period_Start │
│ Sup_Org      │       │ Total_Taxes       │       │ Pay_Period_End   │
└──────┬───────┘       └────────┬──────────┘       └──────────────────┘
       │                        │
       │                        │1
       │                        │
       │               ┌────────┴──────────┐
       │               │                   │
       │          *    ▼              *    ▼
       │   ┌──────────────────┐  ┌──────────────────┐
       │   │   Deduction      │  │    Tax            │
       │   │                  │  │                   │
       │   │ Deduction_ID     │  │ Tax_ID            │
       │   │ Deduction_Code   │  │ Tax_Authority     │
       │   │ Expected_Amount  │  │ Filing_Status     │
       │   │ Actual_Amount    │  │ Withholding_Amt   │
       │   │ Arrears_Balance  │  │ Election_Date     │
       │   └──────────────────┘  └──────────────────┘
       │
       │1
       │
       ▼*
┌──────────────────┐       ┌──────────────────┐
│  Time_Entry      │       │  Worker_Schedule  │
│                  │       │                   │
│ Time_Entry_ID    │       │ Schedule_ID       │
│ Date             │       │ Worker ──────────*│──── Worker
│ Hours            │       │ Day_of_Week       │
│ Time_Type        │       │ Expected_Hours    │
│ Approval_Status  │       │ Schedule_Pattern  │
└──────────────────┘       └──────────────────┘
```

### 2.4 Relationship Summary

| Parent Object | Child Object | Cardinality | Join Key |
|---------------|--------------|-------------|----------|
| Worker | Payroll_Result | 1:Many | Worker_ID |
| Worker | Time_Entry | 1:Many | Worker_ID |
| Worker | Worker_Schedule | 1:Many | Worker_ID |
| Pay_Group | Payroll_Result | 1:Many | Pay_Group_ID |
| Pay_Group | Worker | 1:Many | Pay_Group_ID |
| Payroll_Result | Deduction | 1:Many | Payroll_Result_ID |
| Payroll_Result | Tax | 1:Many | Payroll_Result_ID |
| Worker | Benefit_Election | 1:Many | Worker_ID |

---

## 3. Calculated Fields Design

### 3.1 Payroll_Status_CF

**Purpose:** Determines the payroll processing status for each worker in the current pay period.

**Return Type:** Text (Enum: "Complete", "Pending", "Error")

**Input Fields:**
- `Payroll_Result.Payroll_Status`
- `Payroll_Result.Calculation_DateTime`
- `Pay_Group.Payment_Date`

**Logic:**

```
IF Payroll_Result.Payroll_Status = "Error"
    THEN RETURN "Error"
ELSE IF Payroll_Result IS NULL
    THEN RETURN "Pending"
ELSE IF Payroll_Result.Payroll_Status = "Complete" 
    AND Payroll_Result.Calculation_DateTime IS NOT NULL
    THEN RETURN "Complete"
ELSE
    RETURN "Pending"
```

**Dependencies:**
- Requires Payroll Results data source
- Must reference current pay period (latest non-voided result)

**Used In:** Dashboard Overview KPI, Payroll Cost Report

---

### 3.2 Overtime_Hours_CF

**Purpose:** Calculates weekly overtime hours for non-exempt workers and flags threshold violations.

**Return Type:** Decimal (hours)

**Input Fields:**
- `Time_Entry.Hours` (aggregated per week)
- `Time_Entry.Time_Type`
- `Worker.FLSA_Status`

**Logic:**

```
IF Worker.FLSA_Status = "Exempt"
    THEN RETURN 0

-- Sum only Regular hours (exclude PTO, Holiday, Sick)
SET Total_Regular_Hours = SUM(Time_Entry.Hours) 
    WHERE Time_Entry.Time_Type = "Regular"
    AND Time_Entry.Week_Number = [Current_Week]
    AND Time_Entry.Approval_Status IN ("Approved", "Pending")

IF Total_Regular_Hours > 40
    THEN RETURN Total_Regular_Hours - 40
ELSE
    RETURN 0
```

**Alert Thresholds:**
- `> 0 hours`: Informational (OT exists)
- `> 5 hours`: Yellow alert
- `> 10 hours`: Red alert

**Dependencies:**
- Time Entry data source (current week)
- Worker FLSA status from HCM Core
- Excludes PTO, Holiday, and Sick time types

**Used In:** Overtime Exception Report, Dashboard Overview KPI

---

### 3.3 Missing_Time_CF

**Purpose:** Identifies workers with fewer time entries than expected based on their work schedule.

**Return Type:** Integer (count of missing days)

**Input Fields:**
- `Worker_Schedule.Expected_Hours` (per day)
- `Time_Entry.Date`
- `Time_Off_Request` (approved)
- `Worker.Hire_Date`
- `Worker.Termination_Date`

**Logic:**

```
-- Determine expected work days in the pay period
SET Expected_Days = COUNT(Worker_Schedule.Day_of_Week)
    WHERE Day BETWEEN Pay_Period_Start AND Pay_Period_End
    AND Day >= Worker.Hire_Date
    AND (Worker.Termination_Date IS NULL OR Day <= Worker.Termination_Date)

-- Subtract approved time-off days
SET Time_Off_Days = COUNT(Approved_Time_Off)
    WHERE Date BETWEEN Pay_Period_Start AND Pay_Period_End

-- Count actual submitted time entries
SET Submitted_Days = COUNT(DISTINCT Time_Entry.Date)
    WHERE Time_Entry.Date BETWEEN Pay_Period_Start AND Pay_Period_End
    AND Time_Entry.Approval_Status IN ("Approved", "Pending")

-- Calculate missing days
SET Missing_Days = Expected_Days - Time_Off_Days - Submitted_Days

IF Missing_Days > 0
    THEN RETURN Missing_Days
ELSE
    RETURN 0
```

**Dependencies:**
- Worker Schedule data source
- Time Entry data source
- Time Off / Leave data source
- Worker employment dates from HCM Core

**Used In:** Missing Time Entries Report, Dashboard Overview KPI

---

### 3.4 Deduction_Check_CF

**Purpose:** Calculates the variance between expected and actual deductions, categorizing the exception type.

**Return Type:** Text (Enum: "Normal", "Failed", "Over-Deducted", "Under-Deducted", "Arrears")

**Input Fields:**
- `Deduction.Expected_Amount`
- `Deduction.Actual_Amount`
- `Deduction.Arrears_Balance`

**Logic:**

```
SET Variance = Deduction.Actual_Amount - Deduction.Expected_Amount
SET Variance_Pct = ABS(Variance) / Deduction.Expected_Amount * 100

-- Configurable thresholds
SET Dollar_Threshold = 50.00
SET Percent_Threshold = 10

IF Deduction.Actual_Amount = 0 AND Deduction.Expected_Amount > 0
    THEN RETURN "Failed"
ELSE IF Deduction.Arrears_Balance > 0
    THEN RETURN "Arrears"
ELSE IF Variance > Dollar_Threshold OR Variance_Pct > Percent_Threshold
    THEN RETURN "Over-Deducted"
ELSE IF Variance < -Dollar_Threshold OR Variance_Pct > Percent_Threshold
    THEN RETURN "Under-Deducted"
ELSE
    RETURN "Normal"
```

**Dependencies:**
- Payroll Result → Deduction data
- Benefit Election data (for expected amounts)
- Configurable threshold values (maintained via custom report field)

**Used In:** Deduction Exception Report, Dashboard Overview KPI

---

### 3.5 Tax_Exception_CF

**Purpose:** Validates tax filing status and identifies withholding anomalies.

**Return Type:** Text (Enum: "Normal", "No Withholding", "Multi-State", "Missing Form", "Expired Form", "Excess Withholding")

**Input Fields:**
- `Tax.Withholding_Amount`
- `Tax.Filing_Status`
- `Tax.Exempt_Status`
- `Tax.Election_Date`
- `Tax.Work_State`
- `Tax.Resident_State`
- `Worker.Work_Location`

**Logic:**

```
-- Check for no withholding when not exempt
IF Tax.Withholding_Amount = 0 
    AND Tax.Exempt_Status = FALSE
    AND Tax.Taxable_Wages > 0
    THEN RETURN "No Withholding"

-- Check for expired tax forms (older than 1 year)
IF Tax.Election_Date < DATE_ADD(Current_Date, -365)
    THEN RETURN "Expired Form"

-- Check for missing forms
IF Tax.Election_Date IS NULL
    AND Worker.Hire_Date < DATE_ADD(Current_Date, -30)
    THEN RETURN "Missing Form"

-- Check for multi-state issues
IF Tax.Work_State != Tax.Resident_State
    AND NOT EXISTS(Tax_Election WHERE Tax_Authority = "State" 
                   AND State = Tax.Work_State)
    THEN RETURN "Multi-State"

-- Check for exempt status exceeding 1 year
IF Tax.Exempt_Status = TRUE
    AND Tax.Election_Date < DATE_ADD(Current_Date, -365)
    THEN RETURN "Expired Form"

-- Check for excess withholding (> 50% of taxable wages)
IF Tax.Withholding_Amount > (Tax.Taxable_Wages * 0.50)
    THEN RETURN "Excess Withholding"

RETURN "Normal"
```

**Dependencies:**
- Tax election data from Payroll module
- Worker location data from HCM Core
- Current date for expiration calculations

**Used In:** Tax Exception Report, Dashboard Overview KPI

---

## 4. Report Technical Specifications

### 4.1 Dashboard Overview Report (KPI Summary)

| Attribute | Specification |
|-----------|---------------|
| **Report Type** | Advanced |
| **Data Source** | All Payroll Results + All Workers |
| **Purpose** | Aggregate KPI counts for dashboard tiles |

**Columns:**

| Column | Source | Calculation |
|--------|--------|-------------|
| Total Workers in Pay Period | Worker | COUNT where active in current period |
| Payroll Completion % | Payroll_Status_CF | COUNT(Complete) / COUNT(All) × 100 |
| Overtime Exception Count | Overtime_Hours_CF | COUNT where value > 0 |
| Tax Exception Count | Tax_Exception_CF | COUNT where value != "Normal" |
| Missing Time Count | Missing_Time_CF | COUNT where value > 0 |
| Deduction Exception Count | Deduction_Check_CF | COUNT where value != "Normal" |
| Total Payroll Cost | Payroll_Result.Gross_Pay | SUM |

**Filters:**
- Pay Period = Current (system-derived)
- Worker Status = Active

**Prompts:** None (auto-populated)

**Grouping:** None (single aggregate row)

**Sorting:** N/A

---

### 4.2 Overtime Exception Report

| Attribute | Specification |
|-----------|---------------|
| **Report Type** | Advanced |
| **Data Source** | All Workers + All Time Entries |
| **Purpose** | List workers exceeding 40 hours/week with cost impact |

**Columns:**

| Column | Source | Width |
|--------|--------|-------|
| Worker Name | Worker.Worker_Name | 180px |
| Employee ID | Worker.Worker_ID | 100px |
| Department | Worker.Supervisory_Org | 150px |
| Manager | Worker.Manager | 150px |
| Pay Rate | Worker.Hourly_Rate | 80px |
| Total Hours | SUM(Time_Entry.Hours) | 80px |
| Overtime Hours | Overtime_Hours_CF | 80px |
| OT Cost | Overtime_Hours_CF × Rate × 1.5 | 100px |
| Consecutive Weeks | Custom aggregation | 80px |
| Alert Level | Threshold evaluation | 80px |

**Filters:**
- Overtime_Hours_CF > 0
- Worker.FLSA_Status = "Non-Exempt"
- Time_Entry.Approval_Status IN ("Approved", "Pending")
- Pay Period = Prompted

**Prompts:**

| Prompt | Type | Default | Required |
|--------|------|---------|----------|
| Pay Period | Date Range | Current Period | Yes |
| Pay Group | Multi-select | All | No |
| Department | Multi-select (Org hierarchy) | All | No |
| Minimum OT Hours | Decimal | 0 | No |

**Grouping:** Department → Manager

**Sorting:** Overtime Hours DESC

**Conditional Formatting:**
- OT Hours 5–10: Yellow background
- OT Hours > 10: Red background
- Consecutive Weeks ≥ 3: Bold + Red text

---

### 4.3 Tax Exception Report

| Attribute | Specification |
|-----------|---------------|
| **Report Type** | Advanced |
| **Data Source** | All Workers + Tax Elections + Payroll Results |
| **Purpose** | Identify tax withholding anomalies and compliance risks |

**Columns:**

| Column | Source | Width |
|--------|--------|-------|
| Worker Name | Worker.Worker_Name | 180px |
| Employee ID | Worker.Worker_ID | 100px |
| Department | Worker.Supervisory_Org | 150px |
| Exception Type | Tax_Exception_CF | 120px |
| Tax Authority | Tax.Tax_Authority | 100px |
| Filing Status | Tax.Filing_Status | 100px |
| Withholding Amount | Tax.Withholding_Amount | 100px |
| Taxable Wages | Tax.Taxable_Wages | 100px |
| Election Date | Tax.Election_Date | 100px |
| Work State | Tax.Work_State | 80px |
| Resident State | Tax.Resident_State | 80px |
| Resolution Action | Derived | 200px |

**Filters:**
- Tax_Exception_CF != "Normal"
- Worker Status = Active
- Pay Period = Prompted

**Prompts:**

| Prompt | Type | Default | Required |
|--------|------|---------|----------|
| Pay Period | Date Range | Current Period | Yes |
| Exception Type | Multi-select | All | No |
| Tax Authority | Multi-select | All | No |
| Department | Multi-select | All | No |

**Grouping:** Exception Type → Tax Authority

**Sorting:** Exception Type ASC, Worker Name ASC

**Conditional Formatting:**
- "No Withholding": Red row
- "Expired Form": Orange row
- "Multi-State": Yellow row

---

### 4.4 Missing Time Entries Report

| Attribute | Specification |
|-----------|---------------|
| **Report Type** | Advanced |
| **Data Source** | All Workers + All Time Entries + Worker Schedules |
| **Purpose** | Identify workers with incomplete time submissions |

**Columns:**

| Column | Source | Width |
|--------|--------|-------|
| Worker Name | Worker.Worker_Name | 180px |
| Employee ID | Worker.Worker_ID | 100px |
| Department | Worker.Supervisory_Org | 150px |
| Manager | Worker.Manager | 150px |
| Expected Days | Worker_Schedule calculation | 80px |
| Submitted Days | Time_Entry count | 80px |
| Missing Days | Missing_Time_CF | 80px |
| Missing Dates | Derived date list | 200px |
| Last Submission Date | MAX(Time_Entry.Date) | 100px |

**Filters:**
- Missing_Time_CF > 0
- Worker Status = Active
- Worker not on full-period leave
- Pay Period = Prompted

**Prompts:**

| Prompt | Type | Default | Required |
|--------|------|---------|----------|
| Pay Period | Date Range | Current Period | Yes |
| Pay Group | Multi-select | All | No |
| Department | Multi-select | All | No |
| Minimum Missing Days | Integer | 1 | No |

**Grouping:** Department → Manager

**Sorting:** Missing Days DESC, Worker Name ASC

**Conditional Formatting:**
- Missing Days 1–2: Yellow background
- Missing Days ≥ 3: Red background

---

### 4.5 Deduction Exception Report

| Attribute | Specification |
|-----------|---------------|
| **Report Type** | Advanced |
| **Data Source** | All Payroll Results + Deductions + Benefit Elections |
| **Purpose** | Surface deduction failures and variances |

**Columns:**

| Column | Source | Width |
|--------|--------|-------|
| Worker Name | Worker.Worker_Name | 180px |
| Employee ID | Worker.Worker_ID | 100px |
| Department | Worker.Supervisory_Org | 150px |
| Deduction Type | Deduction.Deduction_Code | 150px |
| Category | Deduction.Deduction_Category | 100px |
| Expected Amount | Deduction.Expected_Amount | 100px |
| Actual Amount | Deduction.Actual_Amount | 100px |
| Variance ($) | Actual - Expected | 100px |
| Variance (%) | ABS(Variance)/Expected × 100 | 80px |
| Exception Type | Deduction_Check_CF | 120px |
| Arrears Balance | Deduction.Arrears_Balance | 100px |

**Filters:**
- Deduction_Check_CF != "Normal"
- Pay Period = Prompted

**Prompts:**

| Prompt | Type | Default | Required |
|--------|------|---------|----------|
| Pay Period | Date Range | Current Period | Yes |
| Exception Type | Multi-select | All | No |
| Deduction Category | Multi-select | All | No |
| Department | Multi-select | All | No |
| Minimum Variance ($) | Currency | 0 | No |

**Grouping:** Exception Type → Deduction Category

**Sorting:** ABS(Variance) DESC

**Conditional Formatting:**
- "Failed": Red row
- "Arrears": Orange row
- Variance > $100: Bold text

---

### 4.6 Payroll Cost Summary Report (Matrix)

| Attribute | Specification |
|-----------|---------------|
| **Report Type** | Matrix |
| **Data Source** | All Payroll Results |
| **Purpose** | Cross-tabulate payroll costs by department and pay period |

**Matrix Configuration:**

| Dimension | Source | Description |
|-----------|--------|-------------|
| **Rows** | Worker.Supervisory_Org (Department) | Organizational hierarchy level 2–3 |
| **Columns** | Pay_Group.Pay_Period | Last 6 pay periods |
| **Values** | Payroll_Result aggregations | Multiple measures (see below) |

**Value Measures:**

| Measure | Aggregation | Format |
|---------|-------------|--------|
| Gross Pay | SUM(Payroll_Result.Gross_Pay) | Currency |
| Net Pay | SUM(Payroll_Result.Net_Pay) | Currency |
| Total Deductions | SUM(Payroll_Result.Total_Deductions) | Currency |
| Total Taxes | SUM(Payroll_Result.Total_Taxes) | Currency |
| Employer Costs | SUM(Payroll_Result.Employer_Taxes) | Currency |
| Headcount | COUNT(DISTINCT Worker) | Integer |
| Avg Cost/Employee | Gross Pay / Headcount | Currency |

**Filters:**
- Payroll_Status = "Complete"
- Pay Period within last 6 periods

**Prompts:**

| Prompt | Type | Default | Required |
|--------|------|---------|----------|
| Number of Periods | Integer | 6 | No |
| Pay Group | Multi-select | All | No |
| Department Level | Single-select | Level 2 | No |

**Row Totals:** Yes (Grand Total row)

**Column Totals:** Yes (Grand Total column)

**Variance Display:** Period-over-period $ and % change in final column

---

### 4.7 Composite Dashboard Configuration

| Attribute | Specification |
|-----------|---------------|
| **Report Type** | Composite |
| **Report Name** | Payroll Exception & Reporting Dashboard |
| **Number of Tabs** | 6 |
| **Default Tab** | Tab 1 — Overview |
| **Prompt Behavior** | Shared prompts cascade to all sub-reports |

**Shared Prompts (Dashboard Level):**

| Prompt | Type | Cascading |
|--------|------|-----------|
| Pay Period | Date Range | Yes — all tabs |
| Pay Group | Multi-select | Yes — all tabs |
| Department | Multi-select | Yes — all tabs |

**Tab Configuration:**

| Tab # | Tab Label | Sub-Report | Display Mode |
|--------|-----------|------------|--------------|
| 1 | Overview | Dashboard_Overview_Report | Tile + Chart layout |
| 2 | Overtime | Overtime_Exception_Report | Table with conditional formatting |
| 3 | Tax Exceptions | Tax_Exception_Report | Grouped table |
| 4 | Missing Time | Missing_Time_Entries_Report | Grouped table |
| 5 | Deductions | Deduction_Exception_Report | Grouped table |
| 6 | Payroll Costs | Payroll_Cost_Report | Matrix grid |

---

## 5. Security Model

### 5.1 Security Groups

| Security Group | Type | Description | Access Level |
|----------------|------|-------------|--------------|
| **Payroll_Exception_Dashboard_Admin** | Role-Based | Payroll Managers, Sr. Payroll Analysts | Full access — all reports, all data, configuration |
| **Payroll_Exception_Dashboard_Analyst** | Role-Based | Payroll Analysts, HR Admins | View all reports, all data, no configuration |
| **Payroll_Exception_Dashboard_Manager** | Role-Based | Department Managers, HRBPs | View reports filtered to their org only |
| **Payroll_Exception_Dashboard_Finance** | Role-Based | Finance Analysts | Payroll Cost Report only (Tab 6) |
| **Payroll_Exception_Dashboard_Viewer** | Role-Based | Compliance Team | Read-only, all exception reports |

### 5.2 Domain Security Policies

| Domain | Security Group | Access |
|--------|----------------|--------|
| Worker Data: Payroll Results | Admin, Analyst, Manager (constrained) | View |
| Worker Data: Time Tracking | Admin, Analyst, Manager (constrained) | View |
| Worker Data: Personal Information | Admin, Analyst | View |
| Worker Data: Compensation | Admin, Analyst, Finance | View |
| Payroll: Deductions | Admin, Analyst | View |
| Payroll: Taxes | Admin, Analyst, Viewer | View |
| Reports: Custom Reports | Admin | Put (modify), View |
| Reports: Custom Reports | Analyst, Manager, Finance, Viewer | View |

### 5.3 Row-Level Security (Supervisory Org Constraint)

**Implementation:** Instance-based security using Supervisory Organization hierarchy.

```
Security Rule: Payroll_Exception_Dashboard_Manager
├── Constraint: Worker.Supervisory_Org
├── Scope: Worker and subordinate organizations (include subordinates = TRUE)
├── Result: Manager sees only workers in their org tree
└── Cascade: Applied to all sub-reports within composite dashboard
```

**Behavior by Role:**

| Role | Data Scope | Org Visibility |
|------|-----------|----------------|
| Admin | All organizations | Full hierarchy |
| Analyst | All organizations | Full hierarchy |
| Manager | Own org + subordinates | Filtered to org tree |
| Finance | All organizations (cost data only) | Full hierarchy (restricted fields) |
| Viewer | All organizations | Full hierarchy (read-only) |

### 5.4 Report Access Controls

| Control | Implementation |
|---------|----------------|
| Dashboard Visibility | Security group membership determines menu/search visibility |
| Export Permissions | Admin + Analyst: Excel/PDF export enabled; Manager: Excel only; Viewer: No export |
| Drill-Through | Enabled for Admin + Analyst to worker profile; disabled for Manager/Viewer |
| Scheduled Delivery | Admin only can configure scheduled report delivery |
| Prompt Restriction | Manager role auto-populates Department prompt (no override) |

---

## 6. Performance Considerations

### 6.1 Data Volume Estimates

| Object | Estimated Row Count (per period) | Growth Rate |
|--------|----------------------------------|-------------|
| Workers (active) | 5,000–15,000 | +5% annually |
| Payroll Results | 5,000–15,000 per run | Per period |
| Time Entries | 50,000–150,000 per period | Per period |
| Deductions | 25,000–75,000 per period | Per period |
| Tax Records | 15,000–45,000 per period | Per period |

### 6.2 Index Usage & Optimization

| Data Source | Indexed Fields | Purpose |
|-------------|---------------|---------|
| Payroll Results | Pay_Period, Worker_ID, Payroll_Status | Period-based filtering, worker lookups |
| Time Entries | Worker_ID, Date, Week_Number, Approval_Status | Weekly aggregation, missing time detection |
| Workers | Supervisory_Org, Pay_Group, FLSA_Status, Active_Status | Row-level security, exception filtering |
| Deductions | Payroll_Result_ID, Deduction_Status | Exception detection |
| Tax | Worker_ID, Tax_Authority, Election_Date | Expiration checks |

### 6.3 Filter Optimization Strategy

| Optimization | Implementation | Impact |
|--------------|----------------|--------|
| **Pre-filter on Pay Period** | All reports require Pay Period as first filter condition | Reduces dataset 90%+ before CF evaluation |
| **Active Workers Only** | Default filter excludes terminated/inactive workers | Reduces worker pool by 15–30% |
| **Exception-Only Results** | Reports filter to CF != "Normal" after calculation | Display subset only |
| **Limit Historical Periods** | Matrix report capped at 6 periods default | Prevents large cross-tab generation |
| **Supervisory Org Pre-filter** | Manager role applies org filter before data retrieval | Row-level security reduces data at query level |

### 6.4 Report Timeout Handling

| Scenario | Threshold | Mitigation |
|----------|-----------|------------|
| Report execution | 120 seconds | Timeout warning to user; suggest narrower filters |
| Dashboard load (composite) | 180 seconds | Lazy-load tabs (only active tab executes on load) |
| Matrix calculation | 90 seconds | Limit periods, suggest department filter |
| Scheduled delivery | 300 seconds | Extended timeout for batch; alert admin on failure |

**Timeout Mitigation Strategies:**

1. **Lazy Tab Loading:** Composite dashboard loads only the active tab on initial render. Remaining tabs execute on click.
2. **Prompt Defaults:** Default prompts pre-filter to current period, reducing initial data load.
3. **Pagination:** Exception reports paginate at 100 rows per page; user can request "Load All" for export.
4. **Caching:** Dashboard Overview (Tab 1) caches KPI aggregates for 15 minutes to reduce recalculation.

### 6.5 Calculated Field Performance

| Calculated Field | Complexity | Performance Risk | Mitigation |
|------------------|-----------|------------------|------------|
| Payroll_Status_CF | Low | Minimal | Simple null/status check |
| Overtime_Hours_CF | Medium | Moderate — weekly aggregation | Pre-aggregate at Time Entry level |
| Missing_Time_CF | High | High — schedule comparison + time-off | Limit to current period; cache schedule data |
| Deduction_Check_CF | Medium | Moderate — comparison logic | Filter to non-zero expected amounts first |
| Tax_Exception_CF | High | High — multiple sub-queries | Evaluate sequentially; exit on first match |

### 6.6 Scalability Recommendations

| Recommendation | Details |
|----------------|---------|
| Report field limit | Keep each report under 20 columns to avoid horizontal scroll and render delays |
| Sub-report independence | Each composite tab report should be independently runnable for debugging |
| Calculated field nesting | Avoid nesting CFs more than 2 levels deep (CF referencing another CF) |
| Prompt cascading | Use related value prompts to limit dropdown options based on prior selections |
| Scheduled pre-computation | For organizations > 10,000 workers, consider scheduled report delivery over real-time |

---

## 7. Deployment & Environment Strategy

### 7.1 Workday Tenant Promotion Path

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Sandbox     │────▶│  Preview     │────▶│  Production  │
│  (Dev/Build) │     │  (UAT/Test)  │     │  (Live)      │
└──────────────┘     └──────────────┘     └──────────────┘
     Build &              Test &               Go-Live
     Configure            Validate             Deploy
```

### 7.2 Migration Checklist

| # | Component | Migration Method | Dependencies |
|---|-----------|-----------------|--------------|
| 1 | Calculated Fields (5) | Migrate via Object Transporter | None |
| 2 | Advanced Reports (5) | Migrate via Object Transporter | Calculated Fields |
| 3 | Matrix Report (1) | Migrate via Object Transporter | None |
| 4 | Composite Dashboard (1) | Migrate via Object Transporter | All sub-reports |
| 5 | Security Groups (5) | Manual configuration per tenant | Domain policies |
| 6 | Domain Security Policies | Manual configuration per tenant | Security groups |
| 7 | Scheduled Deliveries | Manual configuration (Production only) | Reports + Security |
| 8 | Custom Notifications | Manual configuration per tenant | Reports |

---

## 8. Dependencies & Assumptions

### 8.1 Technical Dependencies

| Dependency | Required For | Risk if Unavailable |
|------------|--------------|---------------------|
| Payroll module licensed and configured | All payroll data | Project cannot proceed |
| Time Tracking module active | OT and Missing Time reports | 2 of 5 exception reports unavailable |
| Worker schedules maintained | Missing Time CF | False positives in missing time |
| Benefit elections current | Deduction CF | Incorrect expected amounts |
| Tax elections entered | Tax Exception CF | Missing form detection unreliable |
| Org hierarchy up to date | Row-level security | Incorrect data access |

### 8.2 Technical Assumptions

1. Workday tenant is on a supported release (2024R1 or later)
2. Calculated fields can reference cross-data-source objects via related business objects
3. Composite reports support up to 10 tabs (6 required)
4. Report performance is acceptable for organizations up to 15,000 workers
5. Matrix reports support period-over-period variance columns
6. Security groups can be constrained to supervisory org with subordinate inclusion
7. Scheduled delivery supports daily frequency with pre-7:00 AM completion

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-18 | Payroll Systems Team | Initial technical design |
