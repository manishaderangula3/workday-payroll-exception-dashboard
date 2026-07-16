# Business Requirements Document (BRD)

## Payroll Exception & Reporting Dashboard

---

## Document Information

| Field | Details |
|-------|---------|
| **Project Name** | Workday Payroll Exception & Reporting Dashboard |
| **Document Version** | 1.0 |
| **Author** | Payroll Systems Team |
| **Date Created** | 2026-07-16 |
| **Status** | Approved |
| **Reference** | Project_Overview.md |

---

## 1. Business Need

Payroll managers currently rely on manual review of multiple disconnected reports and spreadsheets to identify payroll exceptions before approval. This process is time-consuming, error-prone, and risks allowing exceptions—such as failed deductions, tax withholding mismatches, missing time entries, and excessive overtime—to pass through to final payroll processing.

**Problem Statement:** There is no centralized, automated mechanism within Workday to detect, consolidate, and surface payroll exceptions in real time, resulting in delayed issue resolution, increased payroll corrections, compliance risks, and wasted administrative effort.

**Proposed Solution:** A Workday-native dashboard with automated exception detection using calculated fields, advanced reports for each exception category, and a composite interface that provides payroll managers with a daily, actionable view of all payroll issues requiring attention.

---

## 2. Stakeholders & Roles

| Stakeholder | Role | Interest | Involvement Level |
|-------------|------|----------|-------------------|
| **Payroll Manager** | Primary User & Decision Maker | Exception identification, payroll approval confidence | High — Daily use, UAT, sign-off |
| **HR Administrator** | Data Steward | Worker data accuracy, schedule maintenance | Medium — Data validation, testing |
| **HR Business Partner** | Department Liaison | Department-level exception awareness | Medium — Review, feedback |
| **Finance Analyst** | Cost Reporter | Payroll cost visibility for budgeting and close | Medium — Cost report validation |
| **IT / Workday Admin** | Technical Owner | Security, deployment, performance | High — Configuration, support |
| **Department Manager** | Self-Service User | Direct report time/exception oversight | Low — View access, time approval |
| **Compliance / Tax Team** | Advisory | Tax withholding accuracy and regulatory compliance | Medium — Tax logic validation |
| **Project Sponsor (VP HR/Finance)** | Executive Sponsor | ROI, strategic alignment, budget | Low — Milestone reviews, approval |

---

## 3. Functional Requirements

### FR-1: Payroll Cost Summary Dashboard

| Attribute | Details |
|-----------|---------|
| **ID** | FR-1 |
| **Priority** | P1 — Critical |
| **Description** | Dashboard shall display payroll cost summary with breakdowns by department, pay group, and pay period |
| **Details** | Show gross pay, net pay, total deductions, total taxes, and employer costs. Include period-over-period variance and trend indicators. |
| **Acceptance Criteria** | 1. Costs displayed match payroll results data within $0.01 tolerance<br>2. Department grouping matches org hierarchy<br>3. Period comparison shows $ and % variance<br>4. Data refreshes on dashboard load<br>5. Export to Excel produces formatted output with totals |

### FR-2: Overtime Hours Tracking with Threshold Alerts

| Attribute | Details |
|-----------|---------|
| **ID** | FR-2 |
| **Priority** | P1 — Critical |
| **Description** | System shall detect and report workers exceeding 40 hours/week with cost calculations |
| **Details** | Calculate overtime as hours exceeding 40/week for non-exempt workers. Show OT hours, OT cost (1.5x rate), and flag patterns (3+ consecutive weeks). Support daily OT rules where applicable. |
| **Acceptance Criteria** | 1. Only non-exempt workers included in calculation<br>2. OT hours = Total Hours − 40 (when positive)<br>3. OT cost = OT Hours × Hourly Rate × 1.5<br>4. Yellow alert at >5 OT hours, red at >10 OT hours<br>5. Exempt workers excluded regardless of hours worked<br>6. PTO/Holiday hours excluded from total |

### FR-3: Tax Exception Identification

| Attribute | Details |
|-----------|---------|
| **ID** | FR-3 |
| **Priority** | P1 — Critical |
| **Description** | System shall identify federal, state, and local tax withholding anomalies and compliance issues |
| **Details** | Detect: no withholding when expected, excess withholding, missing/expired tax elections (W-4, state forms), multi-state allocation issues. Flag workers claiming exempt status for >1 year. |
| **Acceptance Criteria** | 1. Workers with $0 federal tax and non-exempt filing status flagged<br>2. Multi-state workers without proper elections identified<br>3. Tax forms older than 1 year flagged as expired<br>4. Exception type clearly categorized (No Withholding, Multi-State, Missing Form, Expired Form, Excess Withholding)<br>5. Report shows actionable resolution steps |

### FR-4: Missing Time Entry Detection

| Attribute | Details |
|-----------|---------|
| **ID** | FR-4 |
| **Priority** | P1 — Critical |
| **Description** | System shall identify workers with incomplete or missing time entries before payroll close |
| **Details** | Compare expected work days (from schedule) vs. submitted time entries. Account for approved time-off, holidays, and leave. Flag workers with one or more missing days. Show specific missing dates. |
| **Acceptance Criteria** | 1. Missing days = Expected days − Submitted days − Approved time-off days<br>2. Workers on full-period leave excluded<br>3. Mid-period hires counted from start date only<br>4. Terminated workers excluded after termination date<br>5. Specific missing dates listed in report<br>6. Manager name and contact included for escalation |

### FR-5: Deduction Exception Reporting

| Attribute | Details |
|-----------|---------|
| **ID** | FR-5 |
| **Priority** | P2 — High |
| **Description** | System shall identify failed, over-deducted, under-deducted, and arrears deduction exceptions |
| **Details** | Compare expected vs. actual deduction amounts. Categorize exceptions (Failed, Over-Deducted, Under-Deducted, Arrears). Support configurable variance threshold (default $50 or 10%). Cover health, dental, 401k, garnishments, and voluntary deductions. |
| **Acceptance Criteria** | 1. Failed deductions (actual = $0, expected > $0) identified<br>2. Variance calculated as Actual − Expected<br>3. Over/Under determined by configurable threshold<br>4. Arrears balance displayed when applicable<br>5. Deduction category clearly labeled<br>6. Drill-down to worker's benefit elections available |

---

## 4. Functional Requirements Summary

| ID | Requirement | Priority | Report Type | Calculated Field |
|----|-------------|----------|-------------|-----------------|
| FR-1 | Payroll Cost Summary | P1 — Critical | Advanced Report | CF_Payroll_Status |
| FR-2 | Overtime Tracking | P1 — Critical | Advanced + Matrix | CF_Overtime_Hours |
| FR-3 | Tax Exception Detection | P1 — Critical | Advanced Report | CF_Tax_Exception |
| FR-4 | Missing Time Entries | P1 — Critical | Advanced Report | CF_Missing_Time_Flag |
| FR-5 | Deduction Exceptions | P2 — High | Advanced Report | CF_Deduction_Exception |
| FR-6 | Composite Dashboard | P1 — Critical | Composite Report | All CFs |
| FR-7 | Excel Export | P2 — High | All Reports | N/A |
| FR-8 | KPI Cards & Alerts | P2 — High | Dashboard Overview | All CFs |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Dashboard load time (up to 5,000 workers) | < 10 seconds |
| NFR-2 | Individual report load time | < 8 seconds |
| NFR-3 | Excel export completion | < 30 seconds |
| NFR-4 | Filter/prompt application | < 5 seconds |
| NFR-5 | Composite report tab switching | < 3 seconds |

### 5.2 Security

| ID | Requirement | Details |
|----|-------------|---------|
| NFR-6 | Role-based access control | Access restricted by security group (Payroll Admin, HR Partner, Manager) |
| NFR-7 | Row-level security | Users see only workers within their supervisory organization/pay group |
| NFR-8 | Data classification | Payroll data treated as confidential; no public sharing |
| NFR-9 | Audit trail | Report access logged via Workday audit framework |
| NFR-10 | No data export to unauthorized systems | Excel exports inherit same security restrictions |

### 5.3 Usability

| ID | Requirement | Details |
|----|-------------|---------|
| NFR-11 | Single entry point | All reports accessible from one composite dashboard |
| NFR-12 | Intuitive navigation | Drill-down from summary to detail with one click |
| NFR-13 | Consistent design | Uniform column naming, formatting, and color coding across all reports |
| NFR-14 | Mobile accessibility | Dashboard viewable on tablet (minimum); critical KPIs visible on mobile |
| NFR-15 | Minimal training | Users productive within 30 minutes of first access |

### 5.4 Reliability & Availability

| ID | Requirement | Details |
|----|-------------|---------|
| NFR-16 | Availability | Dashboard available during Workday uptime (99.5% SLA) |
| NFR-17 | Data freshness | Reflects most recent payroll calculation results |
| NFR-18 | Error handling | Graceful handling of missing data; no blank/broken reports |

---

## 6. Acceptance Criteria Matrix

| Requirement | Criteria | Verification Method |
|-------------|----------|---------------------|
| FR-1: Payroll Costs | Totals match payroll results ± $0.01 | Data comparison with Workday payroll results |
| FR-2: Overtime | OT hours match manual calculation for 10 test workers | Manual verification against time entries |
| FR-3: Tax Exceptions | All known test exceptions detected (5 scenarios) | Test case execution in sandbox |
| FR-4: Missing Time | Missing days match expected vs. actual audit | Schedule-to-entry comparison |
| FR-5: Deductions | Exception types correctly categorized for 10 test cases | Manual deduction review |
| FR-6: Dashboard | All tabs load, prompts filter correctly, drill-down works | UAT scenario execution |
| FR-7: Excel Export | Exported data matches on-screen data 100% | Row-by-row comparison |
| FR-8: KPIs | KPI values match underlying report totals | Cross-reference with individual reports |
| NFR: Performance | Load times within target on test dataset (5,000 workers) | Timed testing in sandbox |
| NFR: Security | Users see only permitted data | Multi-user security testing |

---

## 7. Priority Definitions

| Priority | Level | Description | Response |
|----------|-------|-------------|----------|
| **P1** | Critical | Core functionality; project cannot launch without it | Must be delivered in initial release |
| **P2** | High | Important functionality; significant business value | Should be delivered in initial release; may be simplified |
| **P3** | Medium | Nice-to-have; enhances user experience | Can be deferred to Phase 2 if timeline constrained |
| **P4** | Low | Future consideration | Backlog for future enhancement |

---

## 8. Business Rules

| # | Rule | Logic |
|---|------|-------|
| BR-1 | Overtime eligibility | Only non-exempt (FLSA) workers are eligible for OT calculation |
| BR-2 | OT threshold | Standard: 40 hours/week; California daily: 8 hours/day |
| BR-3 | Missing time applicability | Only workers with time-entry-required status (hourly, non-exempt salaried) |
| BR-4 | Deduction threshold | Exception flagged when variance exceeds $50 or 10% of expected amount |
| BR-5 | Tax form expiry | W-4 exempt status valid for 1 calendar year; flag after Feb 15 of following year |
| BR-6 | Multi-state threshold | Flag when work state ≠ resident state and no reciprocity agreement exists |
| BR-7 | Payroll status logic | "Error" status if any exception exists; "Complete" if all elements processed successfully |
| BR-8 | Pay period scope | All reports default to current open pay period; historical periods available via prompt |

---

## 9. Data Requirements

| Data Element | Source System | Refresh Frequency | Volume Estimate |
|--------------|---------------|-------------------|-----------------|
| Payroll Results | Workday Payroll | Per payroll calculation | ~5,000 rows/period |
| Time Entries | Workday Time Tracking | Real-time (as submitted) | ~25,000 rows/period |
| Worker Data | Workday HCM | Real-time | ~5,000 active workers |
| Deduction Details | Workday Benefits/Payroll | Per payroll calculation | ~15,000 rows/period |
| Tax Withholding | Workday Payroll | Per payroll calculation | ~10,000 rows/period |
| Work Schedules | Workday Time Tracking | As maintained | ~5,000 schedules |
| Tax Elections | Workday HCM | As updated by worker/admin | ~5,000 elections |

---

## 10. Constraints

1. Solution must be built entirely within Workday native reporting (no external tools except Excel export)
2. 4-week delivery timeline is fixed; scope will be managed to fit
3. Cannot modify core payroll calculation logic or business processes
4. Row-level security must be enforced; no user can access data outside their authorized scope
5. Report design limited to Workday Advanced, Matrix, and Composite report types

---

## 11. Dependencies

| # | Dependency | Owner | Required By |
|---|-----------|-------|-------------|
| 1 | Security groups created and configured | IT / Workday Admin | Week 1 |
| 2 | Test tenant with payroll data available | IT / Workday Admin | Week 2 |
| 3 | Business rules and thresholds confirmed | Payroll Manager | Week 1 |
| 4 | Organization hierarchy validated | HR Administrator | Week 1 |
| 5 | UAT participants available for testing | All Stakeholders | Week 4 |

---

## 12. Approval

| Role | Name | Date | Approval |
|------|------|------|----------|
| Project Sponsor | _______________ | ___/___/______ | ☐ Approved ☐ Rejected |
| Payroll Manager | _______________ | ___/___/______ | ☐ Approved ☐ Rejected |
| IT / Workday Admin | _______________ | ___/___/______ | ☐ Approved ☐ Rejected |

---

*Document End*
