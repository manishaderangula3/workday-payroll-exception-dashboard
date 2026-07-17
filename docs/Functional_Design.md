# Functional Design Document (FDD)

## Payroll Exception & Reporting Dashboard

---

## Document Information

| Field | Details |
|-------|---------|
| **Project Name** | Workday Payroll Exception & Reporting Dashboard |
| **Document Version** | 1.0 |
| **Author** | Payroll Systems Team |
| **Date Created** | 2026-07-17 |
| **Status** | Draft |
| **Reference** | Business_Requirements.md, Project_Overview.md |

---

## 1. System Overview

### 1.1 Purpose

This Functional Design Document (FDD) translates the business requirements defined in the BRD into a detailed functional specification for implementation within the Workday HCM platform. It defines user workflows, report structures, navigation patterns, alert mechanisms, and data flow for the Payroll Exception & Reporting Dashboard.

### 1.2 Position Within the Workday Ecosystem

```
┌─────────────────────────────────────────────────────────────────────┐
│                       WORKDAY HCM PLATFORM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │ Payroll      │    │ Time         │    │ Benefits             │  │
│  │ Module       │    │ Tracking     │    │ Module               │  │
│  │              │    │ Module       │    │                      │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬───────────┘  │
│         │                   │                       │              │
│         ▼                   ▼                       ▼              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              CALCULATED FIELDS LAYER                         │   │
│  │  CF_Payroll_Status | CF_Overtime_Hours | CF_Tax_Exception    │   │
│  │  CF_Missing_Time_Flag | CF_Deduction_Exception              │   │
│  └────────────────────────────┬────────────────────────────────┘   │
│                               │                                    │
│                               ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  ADVANCED REPORTS LAYER                      │   │
│  │  Payroll Cost | Overtime | Tax Exception | Missing Time     │   │
│  │  Deduction Exception | Dashboard Overview (KPI)             │   │
│  └────────────────────────────┬────────────────────────────────┘   │
│                               │                                    │
│                               ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              COMPOSITE DASHBOARD (Single Entry Point)        │   │
│  │  Tabs: Overview | Overtime | Tax | Time | Deductions | Cost │   │
│  └────────────────────────────┬────────────────────────────────┘   │
│                               │                                    │
│                               ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              SECURITY & DELIVERY LAYER                       │   │
│  │  Role-Based Access | Row-Level Security | Notifications     │   │
│  │  Scheduled Delivery | Excel/PDF Export                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 Integration Points

| Integration | Direction | Description |
|-------------|-----------|-------------|
| Workday Payroll Engine | Inbound | Payroll calculation results, deduction outcomes, tax withholdings |
| Workday Time Tracking | Inbound | Time entries, schedules, time-off approvals |
| Workday HCM Core | Inbound | Worker profiles, org hierarchy, employment status, tax elections |
| Workday Benefits | Inbound | Benefit elections, deduction plans, enrollment status |
| Workday Security Framework | Bidirectional | Security group enforcement, audit logging |
| Workday Notifications | Outbound | Alert delivery to users via Workday inbox |
| Excel/PDF Export | Outbound | Report data export for offline analysis |

### 1.4 Design Principles

1. **Workday-Native** — All components built using standard Workday reporting tools (Advanced Reports, Composite Reports, Calculated Fields)
2. **Single Entry Point** — Users access all functionality through one composite dashboard
3. **Exception-Driven** — Surface only items requiring attention; suppress "normal" results by default
4. **Drill-Down Architecture** — Summary → Detail → Worker-level with one-click navigation
5. **Security-First** — Row-level security enforced at every layer; no data leakage between orgs

---

## 2. User Roles & Access

### 2.1 Role Definitions

| Role | Security Group | Access Level | Primary Use Case |
|------|---------------|--------------|------------------|
| **Payroll Manager** | `Payroll_Admin_SG` | Full Access | Exception resolution, payroll approval, all reports |
| **HR Business Partner** | `HRBP_SG` | Department View | Department-level exception monitoring, manager coordination |
| **Finance Analyst** | `Finance_Analyst_SG` | Cost Reports Only | Payroll cost reporting, budget variance analysis |
| **Department Manager** | `Manager_Self_Service_SG` | Direct Reports Only | View direct report exceptions, time approval |
| **IT / Workday Admin** | `Workday_Admin_SG` | Full Access + Config | Report maintenance, security config, performance monitoring |

### 2.2 Access Matrix

| Report/Feature | Payroll Manager | HR Business Partner | Finance Analyst | Dept Manager |
|---------------|:---:|:---:|:---:|:---:|
| Composite Dashboard | ✅ | ✅ | ✅ | ❌ |
| Dashboard Overview (KPIs) | ✅ | ✅ | ✅ | ❌ |
| Payroll Cost Report | ✅ | ❌ | ✅ | ❌ |
| Overtime Report | ✅ | ✅ | ❌ | ✅ |
| Tax Exception Report | ✅ | ❌ | ❌ | ❌ |
| Missing Time Entries Report | ✅ | ✅ | ❌ | ✅ |
| Deduction Exception Report | ✅ | ❌ | ❌ | ❌ |
| Excel/PDF Export | ✅ | ✅ | ✅ | ❌ |
| Alert Notifications | ✅ | ✅ (dept only) | ❌ | ✅ (direct reports) |
| Filter: All Pay Groups | ✅ | ❌ | ✅ | ❌ |
| Filter: Own Department Only | — | ✅ | — | ✅ |

### 2.3 Row-Level Security

| Role | Data Scope | Enforcement Mechanism |
|------|-----------|----------------------|
| Payroll Manager | All workers within assigned pay group(s) | Pay Group security segment |
| HR Business Partner | Workers within assigned supervisory organization(s) | Supervisory Org security segment |
| Finance Analyst | Aggregated cost data (no worker-level PII) | Constrained security group — no drill-to-worker |
| Department Manager | Direct reports only | Manager hierarchy security |

### 2.4 Security Implementation Notes

- Security groups are assigned via Workday security configuration (not within reports)
- Reports use `Get Workers` or `Get Payroll Results` data sources which inherit tenant security
- Composite report inherits the most restrictive security of its child reports
- Export functionality respects the same row-level security as on-screen display
- Audit trail captures: user, report name, access timestamp, filter parameters, export events

---

## 3. Report-to-Requirement Mapping

### 3.1 Mapping Table

| Business Requirement | Workday Report | Report Type | Primary Data Source | Calculated Field(s) | Layout |
|---------------------|----------------|-------------|--------------------|--------------------|--------|
| FR-1: Payroll Cost Summary | `RPT_Payroll_Cost_Summary` | Advanced Report | Payroll Results | CF_Payroll_Status | Tabular with subtotals |
| FR-2: Overtime Tracking | `RPT_Overtime_Exception` | Advanced Report | Time Tracking + Payroll | CF_Overtime_Hours | Matrix (dept × week) |
| FR-3: Tax Exception Detection | `RPT_Tax_Exception` | Advanced Report | Tax Withholding + Elections | CF_Tax_Exception | Tabular grouped by type |
| FR-4: Missing Time Entries | `RPT_Missing_Time_Entries` | Advanced Report | Time Entries + Schedules | CF_Missing_Time_Flag | Tabular grouped by manager |
| FR-5: Deduction Exceptions | `RPT_Deduction_Exception` | Advanced Report | Payroll Deductions + Benefits | CF_Deduction_Exception | Tabular grouped by category |
| FR-6: Composite Dashboard | `COMP_Payroll_Dashboard` | Composite Report | All above reports | All CFs | Tabbed multi-report |
| FR-8: KPI Cards | `RPT_Dashboard_Overview` | Advanced Report | All payroll data | All CFs | KPI card layout |

### 3.2 Report Specifications Summary

#### 3.2.1 Payroll Cost Report (`RPT_Payroll_Cost_Summary`)

| Attribute | Specification |
|-----------|--------------|
| **Type** | Advanced Report |
| **Data Source** | All Payroll Results for a Company |
| **Primary Object** | Payroll Result |
| **Prompts** | Pay Period (required), Company, Pay Group, Department |
| **Columns** | Department, Pay Group, Worker Count, Gross Pay, Net Pay, Total Deductions, Total Taxes, Employer Costs, Period Variance ($), Period Variance (%) |
| **Grouping** | Group by Department, subtotal by Pay Group |
| **Sorting** | Department (alpha), then Pay Group |
| **Totals** | Grand total row for all monetary columns |
| **Filters** | Payroll Status = Completed or In-Progress |
| **Calculated Fields** | CF_Payroll_Status (error/complete indicator) |
| **Export** | Excel with formatted headers and totals |

#### 3.2.2 Overtime Report (`RPT_Overtime_Exception`)

| Attribute | Specification |
|-----------|--------------|
| **Type** | Advanced Report with Matrix layout |
| **Data Source** | Workers with Time Entries |
| **Primary Object** | Worker |
| **Prompts** | Pay Period (required), Department, Minimum OT Hours threshold |
| **Matrix Rows** | Worker Name, Employee ID, Department, Manager, Hourly Rate |
| **Matrix Columns** | Week 1 OT Hours, Week 2 OT Hours (dynamic by pay period weeks) |
| **Summary Columns** | Total OT Hours, OT Cost (Hours × Rate × 1.5), Consecutive Weeks Count |
| **Conditional Formatting** | Yellow: >5 OT hrs/week; Red: >10 OT hrs/week |
| **Filters** | FLSA Status = Non-Exempt; CF_Overtime_Hours > 0 |
| **Calculated Fields** | CF_Overtime_Hours |
| **Related Action** | Navigate to worker's time entry detail |

#### 3.2.3 Tax Exception Report (`RPT_Tax_Exception`)

| Attribute | Specification |
|-----------|--------------|
| **Type** | Advanced Report |
| **Data Source** | Workers with Payroll Results |
| **Primary Object** | Worker |
| **Prompts** | Pay Period (required), Exception Type (multi-select), Department |
| **Columns** | Worker Name, Employee ID, Department, Exception Type, Exception Detail, Tax Authority, Filing Status, Last Form Date, Recommended Action |
| **Grouping** | Group by Exception Type |
| **Filters** | CF_Tax_Exception = True |
| **Calculated Fields** | CF_Tax_Exception |
| **Exception Types** | No Withholding, Multi-State, Missing Form, Expired Form, Excess Withholding |
| **Related Action** | Navigate to worker's tax elections |

#### 3.2.4 Missing Time Entries Report (`RPT_Missing_Time_Entries`)

| Attribute | Specification |
|-----------|--------------|
| **Type** | Advanced Report |
| **Data Source** | Workers with Schedules |
| **Primary Object** | Worker |
| **Prompts** | Pay Period (required), Department, Manager |
| **Columns** | Worker Name, Employee ID, Department, Manager, Manager Email, Expected Days, Submitted Days, Missing Days Count, Missing Dates (list), Time Entry Status |
| **Grouping** | Group by Manager |
| **Sorting** | Missing Days Count (descending) |
| **Filters** | CF_Missing_Time_Flag = True; Employment Status = Active; Time Entry Required = Yes |
| **Calculated Fields** | CF_Missing_Time_Flag |
| **Related Action** | Navigate to worker's time entry; send notification to manager |

#### 3.2.5 Deduction Exception Report (`RPT_Deduction_Exception`)

| Attribute | Specification |
|-----------|--------------|
| **Type** | Advanced Report |
| **Data Source** | Payroll Deduction Results |
| **Primary Object** | Payroll Deduction Line |
| **Prompts** | Pay Period (required), Exception Category (multi-select), Deduction Type, Department |
| **Columns** | Worker Name, Employee ID, Deduction Plan, Expected Amount, Actual Amount, Variance ($), Variance (%), Exception Category, Arrears Balance, Benefit Plan |
| **Grouping** | Group by Exception Category |
| **Sorting** | Variance ($) descending |
| **Filters** | CF_Deduction_Exception = True |
| **Calculated Fields** | CF_Deduction_Exception |
| **Exception Categories** | Failed, Over-Deducted, Under-Deducted, Arrears |
| **Related Action** | Navigate to worker's benefit elections |

#### 3.2.6 Dashboard Overview (`RPT_Dashboard_Overview`)

| Attribute | Specification |
|-----------|--------------|
| **Type** | Advanced Report (KPI format) |
| **Data Source** | All Active Workers + Payroll Results |
| **Primary Object** | Aggregate (single-row summary) |
| **Prompts** | Pay Period (required), Company |
| **KPI Cards** | Total Exceptions, OT Workers, Missing Time Workers, Tax Exceptions, Deduction Exceptions, Total Payroll Cost, Processing Status |
| **Visual Indicators** | Green (0 exceptions), Yellow (1–5), Red (>5) per category |
| **Calculated Fields** | All CFs (aggregated counts) |
| **Drill-Down** | Each KPI links to corresponding detail report |

---

## 4. User Workflow

### 4.1 Primary Workflow — Payroll Manager Daily Review

```
┌──────────┐    ┌──────────────────┐    ┌───────────────────┐    ┌─────────────┐    ┌──────────────┐
│  Login   │───▶│  Dashboard Home  │───▶│ Identify Exception│───▶│  Drill-Down │───▶│ Take Action  │
│  (SSO)   │    │  (KPI Overview)  │    │  (Red/Yellow KPI) │    │  (Detail)   │    │  (Resolve)   │
└──────────┘    └──────────────────┘    └───────────────────┘    └─────────────┘    └──────────────┘
                         │                                               │                    │
                         │                                               │                    │
                         ▼                                               ▼                    ▼
                 ┌──────────────┐                              ┌──────────────┐    ┌──────────────┐
                 │ Review KPIs: │                              │ Worker Detail│    │ • Edit time  │
                 │ • Exception  │                              │ • Name       │    │ • Fix deduct │
                 │   counts     │                              │ • Exception  │    │ • Update tax │
                 │ • Status     │                              │ • Root cause │    │ • Send alert │
                 │ • Trends     │                              │ • History    │    │ • Approve    │
                 └──────────────┘                              └──────────────┘    └──────────────┘
```

### 4.2 Detailed Workflow Steps

| Step | Action | System Response | Next Step |
|------|--------|----------------|-----------|
| 1 | User logs into Workday | SSO authentication; homepage displayed | 2 |
| 2 | User clicks "Payroll Exception Dashboard" link | Composite dashboard loads with Overview tab active | 3 |
| 3 | User reviews KPI cards | KPI cards show counts with color coding (Green/Yellow/Red) | 4 |
| 4 | User clicks a Red/Yellow KPI card | System navigates to corresponding detail report tab | 5 |
| 5 | User reviews exception list | Filtered list of workers with exceptions displayed | 6 |
| 6 | User clicks worker name | Related Action opens worker's relevant Workday page | 7 |
| 7 | User resolves exception | Worker data updated (time entry, tax form, deduction fix) | 8 |
| 8 | User returns to dashboard | KPI counts refresh to reflect resolution | 3 (loop) |
| 9 | All exceptions resolved | All KPIs green; user approves payroll | End |

### 4.3 Secondary Workflows

#### 4.3.1 HR Business Partner — Department Monitoring

1. Login → Dashboard (auto-filtered to assigned department)
2. Review department-level KPIs (Overtime, Missing Time)
3. Identify department trends and patterns
4. Coordinate with department managers for resolution
5. Export department summary for management review

#### 4.3.2 Finance Analyst — Cost Reporting

1. Login → Dashboard → Payroll Cost tab
2. Select pay period and optional filters
3. Review cost breakdown by department and pay group
4. Compare period-over-period variances
5. Export to Excel for budget integration
6. Flag unusual variances for payroll team follow-up

#### 4.3.3 Department Manager — Direct Report Review

1. Receive notification of direct report exception
2. Click notification link → Opens relevant report (filtered to direct reports)
3. Review exception details
4. Take action (approve time, follow up with employee)
5. Confirm resolution

---

## 5. Navigation Structure & Report Linking

### 5.1 Navigation Hierarchy

```
Workday Homepage
└── Payroll Exception Dashboard (Composite Report)
    ├── Tab 1: Overview (KPI Cards)
    │   ├── [Click] Total OT Workers → Tab 2
    │   ├── [Click] Tax Exceptions → Tab 3
    │   ├── [Click] Missing Time → Tab 4
    │   ├── [Click] Deduction Exceptions → Tab 5
    │   └── [Click] Total Payroll Cost → Tab 6
    ├── Tab 2: Overtime Report
    │   └── [Related Action] Worker Name → Worker Time Entry Detail
    ├── Tab 3: Tax Exception Report
    │   └── [Related Action] Worker Name → Worker Tax Elections
    ├── Tab 4: Missing Time Entries
    │   ├── [Related Action] Worker Name → Worker Time Entry
    │   └── [Related Action] Manager Name → Send Notification
    ├── Tab 5: Deduction Exceptions
    │   └── [Related Action] Worker Name → Worker Benefit Elections
    └── Tab 6: Payroll Cost Report
        └── [Related Action] Department → Department Detail Drill-down
```

### 5.2 Related Actions (Drill-Down Links)

| Source Report | Clickable Element | Target Destination | Navigation Type |
|--------------|-------------------|-------------------|----------------|
| Dashboard Overview | OT KPI Card | Overtime Report tab | Tab switch within composite |
| Dashboard Overview | Tax KPI Card | Tax Exception Report tab | Tab switch within composite |
| Dashboard Overview | Missing Time KPI Card | Missing Time Report tab | Tab switch within composite |
| Dashboard Overview | Deduction KPI Card | Deduction Exception Report tab | Tab switch within composite |
| Dashboard Overview | Cost KPI Card | Payroll Cost Report tab | Tab switch within composite |
| Overtime Report | Worker Name | Worker's Time Entry history | Related Action (new window) |
| Tax Exception Report | Worker Name | Worker's Tax Elections page | Related Action (new window) |
| Missing Time Report | Worker Name | Worker's Time Entry submission | Related Action (new window) |
| Missing Time Report | Manager Name | Manager's Workday inbox (send alert) | Related Action (new window) |
| Deduction Exception | Worker Name | Worker's Benefit Elections page | Related Action (new window) |
| Payroll Cost Report | Department Name | Department-filtered payroll detail | Report re-execution with filter |

### 5.3 Entry Points

| Entry Method | Description | User Action |
|-------------|-------------|-------------|
| Homepage Worklet | Custom worklet on Workday homepage | Click worklet icon |
| Favorites | User-saved report shortcut | Click favorite link |
| Search | Workday global search | Search "Payroll Exception Dashboard" |
| Notification Link | Alert-driven deep link | Click notification in Workday inbox |
| Scheduled Delivery | Report delivered to inbox | Open from Workday notifications |

---

## 6. Notification & Alert Logic

### 6.1 Alert Rules

| Alert ID | Trigger Condition | Severity | Recipients | Frequency | Channel |
|----------|------------------|----------|------------|-----------|---------|
| ALT-01 | Total exceptions > 20 in current period | Critical | Payroll Manager | Once per trigger | Workday Inbox + Email |
| ALT-02 | Any worker with >10 OT hours in a week | High | Payroll Manager, Dept Manager | Daily (if condition persists) | Workday Inbox |
| ALT-03 | Missing time entries > 5 workers, < 2 days before payroll close | Critical | Payroll Manager, HR Admin | Once per trigger | Workday Inbox + Email |
| ALT-04 | Tax exception (no withholding) detected | High | Payroll Manager | Immediate on calculation | Workday Inbox |
| ALT-05 | Deduction failure (>$500 total variance) | High | Payroll Manager | Per payroll calculation | Workday Inbox |
| ALT-06 | Payroll processing status = Error | Critical | Payroll Manager, IT Admin | Immediate | Workday Inbox + Email |
| ALT-07 | Direct report has missing time entry | Medium | Department Manager | Daily digest | Workday Inbox |

### 6.2 Notification Delivery Mechanism

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Payroll           │     │ Workday           │     │ Notification     │
│ Calculation       │────▶│ Business Process  │────▶│ Delivery         │
│ Completes         │     │ Condition Rules   │     │                  │
└──────────────────┘     └──────────────────┘     ├── Workday Inbox  │
                                                    ├── Email          │
                                                    └── Mobile Push    │
                                                    └──────────────────┘
```

### 6.3 Alert Configuration Details

| Parameter | Value |
|-----------|-------|
| **Trigger Event** | Payroll calculation completion (on-demand or scheduled) |
| **Evaluation Method** | Calculated field output evaluated against threshold |
| **Suppression** | Do not re-send same alert within 24 hours unless condition worsens |
| **Escalation** | If Critical alert unacknowledged for 4 hours, escalate to Payroll Manager's manager |
| **Delivery Format** | Subject: `[PAYROLL ALERT] {Severity}: {Alert Description}` |
| **Deep Link** | Alert contains direct URL to relevant dashboard tab |
| **Audit** | All alerts logged with timestamp, recipient, and acknowledgement status |

### 6.4 Alert Content Template

```
Subject: [PAYROLL ALERT] CRITICAL: 25 Exceptions Detected — Pay Period 2026-07-01 to 2026-07-15

Body:
  Alert Type: Total Exception Threshold Exceeded
  Pay Period: July 1–15, 2026
  Exception Count: 25
  Breakdown:
    - Overtime: 8 workers
    - Missing Time: 10 workers
    - Tax Exceptions: 4 workers
    - Deduction Failures: 3 workers
  
  Action Required: Review and resolve exceptions before payroll approval deadline.
  
  [View Dashboard] ← deep link to COMP_Payroll_Dashboard
```

---

## 7. Data Refresh Frequency

### 7.1 Refresh Strategy

| Data Category | Refresh Type | Frequency | Trigger | Staleness Tolerance |
|--------------|-------------|-----------|---------|-------------------|
| Payroll Results | Event-Driven | Per payroll calculation | Payroll calc completion | 0 minutes (real-time post-calc) |
| Time Entries | Real-Time | Continuous | Worker submits/edits time | < 1 minute |
| Worker Data (HCM) | Real-Time | Continuous | Any worker profile change | < 1 minute |
| Tax Elections | Real-Time | Continuous | Worker/admin updates form | < 1 minute |
| Benefit Elections | Real-Time | Continuous | Enrollment/change event | < 1 minute |
| Calculated Fields | On-Demand | Per report execution | Dashboard/report load | Recalculated on each view |
| KPI Aggregations | On-Demand | Per dashboard load | User opens dashboard | Recalculated on each view |

### 7.2 Refresh Behavior Notes

- **Dashboard Load**: All calculated fields re-evaluate on each page load — no caching of exception counts
- **Report Execution**: Reports pull live data from Workday data warehouse at execution time
- **No Scheduled Pre-Computation**: Workday Advanced Reports do not support background pre-computation; all data is live
- **Performance Trade-off**: Real-time accuracy prioritized over load speed; target <10 seconds for up to 5,000 workers
- **Payroll Calculation Dependency**: Exception reports are most meaningful AFTER payroll calculation runs; dashboard displays "Last Calculation: {timestamp}" indicator

### 7.3 Data Freshness Indicator

The Dashboard Overview tab displays:
```
┌─────────────────────────────────────────────────┐
│ Last Payroll Calculation: 2026-07-17 08:30 AM   │
│ Data as of: Real-time (refreshed on load)       │
│ Pay Period: July 1–15, 2026                     │
└─────────────────────────────────────────────────┘
```

---

## 8. Export Capabilities

### 8.1 Export Options

| Export Format | Availability | Content | Security | Max Rows |
|--------------|-------------|---------|----------|----------|
| **Excel (.xlsx)** | All reports | Full data with formatting, headers, totals | Inherits user's row-level security | 10,000 rows |
| **PDF** | All reports | Formatted for print; pagination applied | Inherits user's row-level security | 500 rows (paginated) |
| **CSV** | Advanced Reports only | Raw data, no formatting | Inherits user's row-level security | 10,000 rows |

### 8.2 Excel Export Specifications

| Feature | Specification |
|---------|--------------|
| **Header Row** | Report name, pay period, generation timestamp, user name |
| **Column Headers** | Match on-screen column names exactly |
| **Data Formatting** | Currency with 2 decimals, dates as MM/DD/YYYY, percentages with 1 decimal |
| **Subtotals** | Match on-screen grouping subtotals |
| **Grand Total** | Final row with summed monetary/count columns |
| **Conditional Formatting** | Color coding NOT exported (noted in header row) |
| **Sheet Naming** | Sheet name = Report name (truncated to 31 chars) |
| **File Naming** | `{ReportName}_{PayPeriod}_{ExportDate}.xlsx` |

### 8.3 PDF Export Specifications

| Feature | Specification |
|---------|--------------|
| **Orientation** | Landscape for reports with >6 columns; Portrait otherwise |
| **Page Size** | Letter (8.5" × 11") |
| **Header/Footer** | Header: Report name + Pay Period; Footer: Page X of Y + timestamp |
| **Branding** | Company logo in header (configurable) |
| **Page Breaks** | Break on group change (e.g., new department) |

### 8.4 Scheduled Delivery

| Parameter | Specification |
|-----------|--------------|
| **Delivery Method** | Workday Report Delivery (inbox) or email attachment |
| **Schedule Options** | Daily, Weekly, Bi-weekly (aligned to pay periods), Monthly |
| **Default Schedule** | Daily at 9:00 AM (configurable per user) |
| **Format** | Excel or PDF (user preference) |
| **Condition** | Deliver only when exceptions exist (optional; suppresses empty reports) |
| **Recipients** | Configured per security group; users can self-subscribe |

---

## 9. Composite Dashboard Layout

### 9.1 Tab Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Overview] [Overtime] [Tax Exceptions] [Missing Time] [Deductions] [Cost]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌── Global Prompts ─────────────────────────────────────────────────┐  │
│  │ Pay Period: [July 1-15, 2026 ▼]  Company: [All ▼]  Dept: [All ▼] │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌── Tab Content Area ───────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  (Content varies by selected tab — see sections below)            │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Overview Tab Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PAYROLL EXCEPTION DASHBOARD                       │
│                    Pay Period: July 1–15, 2026                           │
│                    Last Calculation: July 17, 2026 08:30 AM             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │ TOTAL     │  │ OVERTIME  │  │ TAX       │  │ MISSING   │           │
│  │ EXCEPTIONS│  │ WORKERS   │  │ EXCEPTIONS│  │ TIME      │           │
│  │           │  │           │  │           │  │           │           │
│  │    25     │  │     8     │  │     4     │  │    10     │           │
│  │  [RED]    │  │  [YELLOW] │  │  [RED]    │  │  [RED]    │           │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘           │
│                                                                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────────────────────┐           │
│  │ DEDUCTION │  │ PAYROLL   │  │ PROCESSING STATUS         │           │
│  │ EXCEPTIONS│  │ COST      │  │                           │           │
│  │           │  │           │  │ ████████░░ 80% Complete   │           │
│  │     3     │  │  $2.4M    │  │                           │           │
│  │  [YELLOW] │  │  [GREEN]  │  │ 4,000/5,000 workers OK   │           │
│  └───────────┘  └───────────┘  └───────────────────────────┘           │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  EXCEPTION TREND (Last 6 Pay Periods)                                    │
│  ┌───────────────────────────────────────────────────────────┐          │
│  │  30│ *                                                     │          │
│  │  25│      *                           *                    │          │
│  │  20│           *         *                                 │          │
│  │  15│                *                       *              │          │
│  │  10│                                                       │          │
│  │   5│                                                       │          │
│  │   0└──────────────────────────────────────────────         │          │
│  │    PP1   PP2   PP3   PP4   PP5   PP6 (Current)            │          │
│  └───────────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Prompt Behavior

| Prompt | Type | Default | Scope | Behavior |
|--------|------|---------|-------|----------|
| Pay Period | Single-select (required) | Current open period | Global (all tabs) | Changing re-executes all reports |
| Company | Single-select | All | Global | Filters all reports to selected company |
| Department | Multi-select | All | Global | Filters to selected department(s) |
| Pay Group | Multi-select | All (per user security) | Cost & Overview tabs | Filters payroll cost data |
| Exception Type | Multi-select | All | Tab-specific | Filters within active tab only |

---

## 10. Data Flow Architecture

### 10.1 End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SOURCE DATA                                                              │
├──────────────┬──────────────┬──────────────┬───────────────────────────┤
│ Payroll      │ Time         │ HCM          │ Benefits                  │
│ Results      │ Entries      │ Worker Data  │ Elections                 │
└──────┬───────┴──────┬───────┴──────┬───────┴───────────┬───────────────┘
       │              │              │                   │
       ▼              ▼              ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ CALCULATED FIELDS (Transformation Layer)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CF_Payroll_Status:      Evaluates overall payroll health per worker    │
│  CF_Overtime_Hours:      Hours > 40/week for non-exempt workers        │
│  CF_Tax_Exception:       Tax withholding anomaly detection             │
│  CF_Missing_Time_Flag:   Expected days vs. submitted days gap          │
│  CF_Deduction_Exception: Expected vs. actual deduction variance        │
│                                                                          │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ REPORT LAYER (Presentation)                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  RPT_Dashboard_Overview  ──┐                                            │
│  RPT_Overtime_Exception  ──┼──▶  COMP_Payroll_Dashboard                 │
│  RPT_Tax_Exception       ──┤     (Composite Report)                     │
│  RPT_Missing_Time_Entries──┤                                            │
│  RPT_Deduction_Exception ──┤                                            │
│  RPT_Payroll_Cost_Summary──┘                                            │
│                                                                          │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ DELIVERY LAYER                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ On-Screen   │  │ Excel/PDF   │  │ Scheduled   │  │ Alerts &    │   │
│  │ Dashboard   │  │ Export      │  │ Delivery    │  │ Notifications│   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Calculated Field Dependencies

| Calculated Field | Input Data Sources | Output | Consumers |
|-----------------|-------------------|--------|-----------|
| CF_Payroll_Status | Payroll Results, all other CFs | "Complete" / "Error" / "Pending" | RPT_Payroll_Cost_Summary, RPT_Dashboard_Overview |
| CF_Overtime_Hours | Time Entries, Worker Schedule, FLSA Status | Numeric (hours over threshold) | RPT_Overtime_Exception, RPT_Dashboard_Overview |
| CF_Tax_Exception | Tax Withholdings, Tax Elections, Filing Status | Boolean (true/false) + Exception Type | RPT_Tax_Exception, RPT_Dashboard_Overview |
| CF_Missing_Time_Flag | Time Entries, Work Schedule, Time Off, Employment Status | Boolean + Missing Day Count | RPT_Missing_Time_Entries, RPT_Dashboard_Overview |
| CF_Deduction_Exception | Payroll Deductions, Benefit Elections, Deduction Plans | Boolean + Exception Category | RPT_Deduction_Exception, RPT_Dashboard_Overview |

### 10.3 Report Dependencies

```
CF_Payroll_Status ─────────────▶ RPT_Payroll_Cost_Summary ──┐
CF_Overtime_Hours ─────────────▶ RPT_Overtime_Exception ────┤
CF_Tax_Exception ──────────────▶ RPT_Tax_Exception ─────────┼──▶ COMP_Payroll_Dashboard
CF_Missing_Time_Flag ──────────▶ RPT_Missing_Time_Entries ──┤
CF_Deduction_Exception ────────▶ RPT_Deduction_Exception ───┤
All CFs (aggregated) ─────────▶ RPT_Dashboard_Overview ─────┘
```

---

## 11. Business Rules Implementation

### 11.1 Exception Detection Logic

| Rule ID | Business Rule | Implementation in Calculated Field |
|---------|--------------|-----------------------------------|
| BR-1 | Only non-exempt workers for OT | CF_Overtime_Hours: `IF FLSA_Status = "Non-Exempt" THEN calculate ELSE return 0` |
| BR-2 | OT threshold = 40 hrs/week | CF_Overtime_Hours: `MAX(0, Total_Hours - 40)` |
| BR-3 | Time entry required workers only | CF_Missing_Time_Flag: `IF Time_Entry_Required = TRUE THEN evaluate ELSE FALSE` |
| BR-4 | Deduction variance threshold | CF_Deduction_Exception: `IF ABS(Actual - Expected) > MAX($50, Expected * 0.10) THEN TRUE` |
| BR-5 | Tax form expiry (1 year) | CF_Tax_Exception: `IF Form_Date < Current_Date - 365 days THEN "Expired Form"` |
| BR-6 | Multi-state detection | CF_Tax_Exception: `IF Work_State ≠ Resident_State AND No_Reciprocity THEN "Multi-State"` |
| BR-7 | Payroll status logic | CF_Payroll_Status: `IF ANY_Exception = TRUE THEN "Error" ELSE "Complete"` |
| BR-8 | Default to current period | All report prompts: Default value = current open pay period |

### 11.2 Color Coding Standards

| Color | Meaning | Threshold | Application |
|-------|---------|-----------|-------------|
| 🟢 Green | Normal / No action | 0 exceptions; values within expected range | KPI cards, status indicators |
| 🟡 Yellow | Warning / Monitor | 1–5 exceptions; approaching threshold | KPI cards, OT 5–10 hrs |
| 🔴 Red | Critical / Action Required | >5 exceptions; threshold exceeded | KPI cards, OT >10 hrs |
| ⚪ Gray | Not Applicable / No Data | No payroll calculated; worker excluded | Status indicators |

---

## 12. Error Handling & Edge Cases

### 12.1 Data Availability Scenarios

| Scenario | System Behavior | User Message |
|----------|----------------|--------------|
| No payroll calculated for period | Dashboard shows "No Data" state | "Payroll has not been calculated for this period. Run payroll calculation to populate dashboard." |
| Worker with no schedule assigned | Excluded from Missing Time report | Worker not shown (silent exclusion with audit log) |
| Mid-period hire | Pro-rated expected days from hire date | Expected days calculated from hire date, not period start |
| Terminated worker | Excluded after termination date | Worker not shown for dates after termination |
| Worker on full-period leave | Excluded from Missing Time | Worker not shown (approved leave covers all expected days) |
| Payroll calculation in progress | Show last completed calculation | "Calculation in progress. Showing results from: {last calc timestamp}" |
| Report timeout (>30 seconds) | Display timeout message | "Report timed out. Try narrowing filters or contact IT support." |
| Zero workers match filters | Empty report with message | "No exceptions found matching your filter criteria." |

### 12.2 Data Validation Rules

| Validation | Rule | Action on Failure |
|-----------|------|-------------------|
| Pay Period prompt | Must be a valid, existing pay period | Block report execution; show error |
| Numeric fields | Cannot be negative (hours, costs) | Display as $0.00 with warning icon |
| Worker status | Must be Active or On Leave | Exclude terminated/inactive silently |
| Date fields | Cannot be future-dated beyond current period end | Flag for review |
| Security scope | User must have access to at least one worker | Show "No data available" (not error) |

---

## 13. Performance Considerations

### 13.1 Optimization Strategies

| Strategy | Implementation | Expected Impact |
|----------|---------------|----------------|
| Prompt-driven filtering | Required Pay Period prompt limits data scope | Reduces dataset from all-time to single period |
| Indexed data sources | Use primary business objects (not custom) | Leverages Workday query optimization |
| Calculated field efficiency | Simple conditional logic; avoid nested lookups | Sub-second CF evaluation per worker |
| Composite report lazy loading | Tabs load only when selected | Initial load = Overview only (~2 seconds) |
| Limit default result set | Default filter shows exceptions only (not all workers) | Reduces rows from 5,000 to ~50–200 |
| Column minimization | Only include business-critical columns | Reduces query width and render time |

### 13.2 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard initial load (Overview tab) | < 5 seconds | From click to full KPI display |
| Tab switch (within composite) | < 8 seconds | From tab click to full data display |
| Report with 5,000 workers in scope | < 10 seconds | Full execution with default filters |
| Excel export (500 rows) | < 15 seconds | From export click to file ready |
| Excel export (5,000 rows) | < 30 seconds | From export click to file ready |
| Prompt filter change | < 5 seconds | From apply to refreshed results |

---

## 14. Future Enhancements (Phase 2 Backlog)

| ID | Enhancement | Description | Priority |
|----|-------------|-------------|----------|
| FE-1 | Predictive Analytics | ML-based prediction of likely exceptions based on historical patterns | P3 |
| FE-2 | Automated Resolution | Auto-send notifications and create tasks for common exceptions | P3 |
| FE-3 | Custom Thresholds per Org | Allow departments to set their own OT/deduction thresholds | P3 |
| FE-4 | Historical Trend Dashboard | 12-month trend analysis with seasonal patterns | P3 |
| FE-5 | Integration with Prism Analytics | Advanced visualizations and cross-functional analytics | P4 |
| FE-6 | Mobile-Optimized View | Dedicated mobile layout for manager self-service | P3 |
| FE-7 | Bulk Action Capability | Resolve multiple exceptions simultaneously | P3 |

---

## 15. Traceability Matrix

| Business Requirement | Functional Design Section | Report/Component | Calculated Field | Test Case Reference |
|---------------------|--------------------------|-----------------|-----------------|-------------------|
| FR-1: Payroll Cost Summary | §3.2.1 | RPT_Payroll_Cost_Summary | CF_Payroll_Status | TC-01 through TC-05 |
| FR-2: Overtime Tracking | §3.2.2 | RPT_Overtime_Exception | CF_Overtime_Hours | TC-06 through TC-10 |
| FR-3: Tax Exception Detection | §3.2.3 | RPT_Tax_Exception | CF_Tax_Exception | TC-11 through TC-15 |
| FR-4: Missing Time Entries | §3.2.4 | RPT_Missing_Time_Entries | CF_Missing_Time_Flag | TC-16 through TC-20 |
| FR-5: Deduction Exceptions | §3.2.5 | RPT_Deduction_Exception | CF_Deduction_Exception | TC-21 through TC-25 |
| FR-6: Composite Dashboard | §9 | COMP_Payroll_Dashboard | All CFs | TC-26 through TC-30 |
| FR-7: Excel Export | §8 | All reports | N/A | TC-31 through TC-35 |
| FR-8: KPI Cards & Alerts | §3.2.6, §6 | RPT_Dashboard_Overview | All CFs | TC-36 through TC-40 |

---

## 16. Approval

| Role | Name | Date | Approval |
|------|------|------|----------|
| Project Sponsor | _______________ | ___/___/______ | ☐ Approved ☐ Rejected |
| Payroll Manager | _______________ | ___/___/______ | ☐ Approved ☐ Rejected |
| IT / Workday Admin | _______________ | ___/___/______ | ☐ Approved ☐ Rejected |
| Lead Developer | _______________ | ___/___/______ | ☐ Approved ☐ Rejected |

---

*Document End*
