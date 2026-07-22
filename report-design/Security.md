# Security Design

## Payroll Exception & Reporting Dashboard

---

## Document Information

| Field | Details |
|-------|---------|
| **Project Name** | Workday Payroll Exception & Reporting Dashboard |
| **Document Version** | 1.0 |
| **Author** | Payroll Systems Team |
| **Date Created** | 2026-07-22 |
| **Status** | Draft |
| **Reference** | Technical_Design.md, Business_Objects.md, Data_Sources.md |

---

## 1. Security Groups

### 1.1 Security Group Summary

| Security Group | Type | Access Level | Data Scope | Report Access |
|----------------|------|--------------|------------|---------------|
| Payroll Administrator | Role-Based | Full (View, Run, Export, Schedule) | All workers across all companies/pay groups | All reports and dashboard tabs |
| Payroll Analyst | Role-Based | View (View, Run, Export) | Workers in assigned pay groups only | All reports and dashboard tabs (scoped to pay groups) |
| HR Partner | Role-Based | View (View, Run) | Workers in assigned supervisory organizations | Overview, Missing Time, Overtime reports only |
| Manager (Self-Service) | Role-Based | View (View only) | Direct reports only | Overview, Missing Time, Overtime reports only |

---

### 1.2 Payroll Administrator

| Attribute | Details |
|-----------|---------|
| **Security Group Name** | `Payroll_Exception_Dashboard_Admin` |
| **Group Type** | Role-Based Security Group |
| **Assigned Via** | Payroll Administrator role on Supervisory Organization |
| **Constrained By** | None — unconstrained access |

#### Permissions

| Permission | Granted | Notes |
|------------|:-------:|-------|
| View Dashboard | Yes | All tabs visible |
| Run Reports | Yes | All sub-reports |
| Export to Excel/PDF | Yes | Full data export with no field restrictions |
| Schedule Reports | Yes | Can configure scheduled delivery |
| View Compensation Fields | Yes | Hourly_Rate, Annual_Salary, Gross_Pay, Net_Pay visible |
| Modify Dashboard Layout | No | Requires Workday Report Administrator |
| Edit Calculated Fields | No | Requires Workday Report Administrator |

#### Data Scope

- All workers across all companies
- All pay groups, all supervisory organizations
- All locations and cost centers
- Current year + 3 prior years of payroll data

---

### 1.3 Payroll Analyst

| Attribute | Details |
|-----------|---------|
| **Security Group Name** | `Payroll_Exception_Dashboard_Analyst` |
| **Group Type** | Role-Based Security Group |
| **Assigned Via** | Payroll Analyst role on Pay Group |
| **Constrained By** | Pay Group assignment |

#### Permissions

| Permission | Granted | Notes |
|------------|:-------:|-------|
| View Dashboard | Yes | All tabs visible |
| Run Reports | Yes | All sub-reports, filtered to assigned pay groups |
| Export to Excel/PDF | Yes | Export limited to assigned pay group data |
| Schedule Reports | No | — |
| View Compensation Fields | Yes | Hourly_Rate, Annual_Salary visible for assigned workers |
| Modify Dashboard Layout | No | — |

#### Data Scope

- Workers in assigned pay groups only
- All departments and cost centers within assigned pay groups
- All locations associated with assigned pay group workers
- Current year + 2 prior years of payroll data

---

### 1.4 HR Partner

| Attribute | Details |
|-----------|---------|
| **Security Group Name** | `Payroll_Exception_Dashboard_HR_Partner` |
| **Group Type** | Role-Based Security Group |
| **Assigned Via** | HR Partner role on Supervisory Organization |
| **Constrained By** | Supervisory Organization hierarchy |

#### Permissions

| Permission | Granted | Notes |
|------------|:-------:|-------|
| View Dashboard | Yes | Overview, Missing Time, and Overtime tabs only |
| Run Reports | Yes | Dashboard Overview, Missing Time Entries, Overtime Report only |
| Export to Excel/PDF | Yes | Limited to visible reports and scoped data |
| Schedule Reports | No | — |
| View Compensation Fields | No | Hourly_Rate, Annual_Salary are masked/hidden |
| View Tax/Deduction Details | No | Tax Exception and Deduction Exception tabs not visible |

#### Data Scope

- Workers in assigned supervisory organizations (including subordinate orgs)
- Department and location data for workers in scope
- Current year + 1 prior year of data

---

### 1.5 Manager (Self-Service)

| Attribute | Details |
|-----------|---------|
| **Security Group Name** | `Payroll_Exception_Dashboard_Manager_SS` |
| **Group Type** | Role-Based Security Group |
| **Assigned Via** | Manager role on Supervisory Organization (Self-Service) |
| **Constrained By** | Direct reports only (no subordinate org rollup) |

#### Permissions

| Permission | Granted | Notes |
|------------|:-------:|-------|
| View Dashboard | Yes | Overview, Missing Time, and Overtime tabs only |
| Run Reports | Yes | Dashboard Overview, Missing Time Entries, Overtime Report only |
| Export to Excel/PDF | No | — |
| Schedule Reports | No | — |
| View Compensation Fields | No | Hourly_Rate, Annual_Salary are hidden |
| View Tax/Deduction Details | No | Tax Exception and Deduction Exception tabs not visible |

#### Data Scope

- Direct reports only (workers where the user is the primary manager)
- No subordinate organization rollup
- Current period + last 3 periods only

---

## 2. Domain Security Policies

### 2.1 Payroll Domain

| Policy Name | Domain | Security Groups with Access | Access Type |
|-------------|--------|----------------------------|-------------|
| `Payroll Results` | Payroll | Payroll Administrator, Payroll Analyst | Get (View) |
| `Payroll Deductions` | Payroll | Payroll Administrator, Payroll Analyst | Get (View) |
| `Payroll Taxes` | Payroll | Payroll Administrator, Payroll Analyst | Get (View) |
| `Payroll Earnings` | Payroll | Payroll Administrator, Payroll Analyst, HR Partner | Get (View) |
| `Pay Group Assignments` | Payroll | Payroll Administrator, Payroll Analyst | Get (View) |

> **Note:** Manager (Self-Service) does not have direct payroll domain access. Dashboard Overview KPIs for managers are delivered via a pre-aggregated summary that does not expose individual payroll detail.

### 2.2 Time Tracking Domain

| Policy Name | Domain | Security Groups with Access | Access Type |
|-------------|--------|----------------------------|-------------|
| `Time Entry` | Time Tracking | Payroll Administrator, Payroll Analyst, HR Partner, Manager (Self-Service) | Get (View) |
| `Time Approval` | Time Tracking | Payroll Administrator, HR Partner, Manager (Self-Service) | Get (View) |
| `Time Tracking Eligibility` | Time Tracking | Payroll Administrator, Payroll Analyst | Get (View) |
| `Work Schedule` | Time Tracking | Payroll Administrator, Payroll Analyst, HR Partner | Get (View) |

### 2.3 Worker Data Domain

| Policy Name | Domain | Security Groups with Access | Access Type |
|-------------|--------|----------------------------|-------------|
| `Worker Data: Public` | HCM Core | Payroll Administrator, Payroll Analyst, HR Partner, Manager (Self-Service) | Get (View) |
| `Worker Data: Organization` | HCM Core | Payroll Administrator, Payroll Analyst, HR Partner, Manager (Self-Service) | Get (View) |
| `Worker Data: Compensation` | HCM Core | Payroll Administrator, Payroll Analyst | Get (View) |
| `Worker Data: Benefits` | HCM Core | Payroll Administrator, Payroll Analyst | Get (View) |
| `Worker Data: Employment` | HCM Core | Payroll Administrator, Payroll Analyst, HR Partner | Get (View) |

### 2.4 Domain Security Matrix (Cross-Reference)

| Domain Policy | Payroll Admin | Payroll Analyst | HR Partner | Manager (SS) |
|---------------|:------------:|:---------------:|:----------:|:------------:|
| Payroll Results | ✅ | ✅ | ❌ | ❌ |
| Payroll Deductions | ✅ | ✅ | ❌ | ❌ |
| Payroll Taxes | ✅ | ✅ | ❌ | ❌ |
| Payroll Earnings | ✅ | ✅ | ✅ | ❌ |
| Time Entry | ✅ | ✅ | ✅ | ✅ |
| Time Approval | ✅ | ❌ | ✅ | ✅ |
| Worker Data: Public | ✅ | ✅ | ✅ | ✅ |
| Worker Data: Compensation | ✅ | ✅ | ❌ | ❌ |
| Worker Data: Benefits | ✅ | ✅ | ❌ | ❌ |

---

## 3. Row-Level Security

### 3.1 Supervisory Organization Hierarchy

Row-level security is enforced via the Workday Supervisory Organization hierarchy. Each user's security profile determines which workers they can see.

| Security Group | Row-Level Filter Logic |
|----------------|----------------------|
| Payroll Administrator | No row-level filter — all workers visible |
| Payroll Analyst | `Worker.Pay_Group IN (User's assigned Pay Groups)` |
| HR Partner | `Worker.Supervisory_Org IN (User's assigned Supervisory Orgs + subordinate orgs)` |
| Manager (Self-Service) | `Worker.Manager = Current User` (direct reports only) |

#### Hierarchy Traversal Rules

```
Payroll Administrator:
  └── No filter applied — full visibility

Payroll Analyst:
  └── Pay Group: Biweekly Salaried
      ├── All workers in Biweekly Salaried pay group
      └── Regardless of supervisory org or location

HR Partner (assigned to Division A):
  └── Division A (Supervisory Org)
      ├── Department A1
      │   ├── Team A1-1 (workers visible)
      │   └── Team A1-2 (workers visible)
      └── Department A2
          └── Team A2-1 (workers visible)

Manager (Self-Service):
  └── Team A1-1 (if manager of this team)
      ├── Worker 001 (direct report — visible)
      ├── Worker 002 (direct report — visible)
      └── Worker 003 (direct report — visible)
      (Workers in subordinate teams NOT visible)
```

### 3.2 Pay Group Based Restrictions

| Rule | Description |
|------|-------------|
| **Scope** | Applies to Payroll Analyst role only |
| **Implementation** | Workday role assignment on Pay Group object |
| **Filter** | Report data source filtered by `Pay_Group = User's assigned Pay Group(s)` |
| **Multiple Assignments** | A Payroll Analyst assigned to multiple pay groups sees the union of all assigned groups |
| **Cross-Company** | If pay groups span companies, the analyst sees cross-company data for those groups |

### 3.3 Location-Based Filtering

| Rule | Description |
|------|-------------|
| **Scope** | Supplementary filter, not primary security mechanism |
| **Implementation** | Applied as a report filter when location-based restrictions are configured |
| **Usage** | Used for Tax Exception Report to scope tax jurisdictions by worker location |
| **Configuration** | Location filter is configurable per report prompt; not enforced at the security group level |

---

## 4. Report Security Configuration

### 4.1 Security Enforcement per Report

| Report | Payroll Admin | Payroll Analyst | HR Partner | Manager (SS) | Row-Level Filter |
|--------|:------------:|:---------------:|:----------:|:------------:|------------------|
| Dashboard Overview | ✅ Full | ✅ Pay Group scoped | ✅ Sup Org scoped | ✅ Direct reports | Per security group |
| Overtime Exception Report | ✅ Full | ✅ Pay Group scoped | ✅ Sup Org scoped | ✅ Direct reports | Per security group |
| Tax Exception Report | ✅ Full | ✅ Pay Group scoped | ❌ No access | ❌ No access | Pay Group / All |
| Missing Time Entries Report | ✅ Full | ✅ Pay Group scoped | ✅ Sup Org scoped | ✅ Direct reports | Per security group |
| Deduction Exception Report | ✅ Full | ✅ Pay Group scoped | ❌ No access | ❌ No access | Pay Group / All |
| Payroll Cost Summary | ✅ Full | ✅ Pay Group scoped | ❌ No access | ❌ No access | Pay Group / All |

### 4.2 Field-Level Security per Report

| Field | Payroll Admin | Payroll Analyst | HR Partner | Manager (SS) |
|-------|:------------:|:---------------:|:----------:|:------------:|
| Employee_ID | ✅ | ✅ | ✅ | ✅ |
| Legal_Name | ✅ | ✅ | ✅ | ✅ |
| Department | ✅ | ✅ | ✅ | ✅ |
| Hourly_Rate | ✅ | ✅ | ❌ Hidden | ❌ Hidden |
| Annual_Salary | ✅ | ✅ | ❌ Hidden | ❌ Hidden |
| Gross_Pay | ✅ | ✅ | ❌ Hidden | ❌ Hidden |
| Net_Pay | ✅ | ✅ | ❌ Hidden | ❌ Hidden |
| Total_Deductions | ✅ | ✅ | ❌ Hidden | ❌ Hidden |
| Total_Taxes | ✅ | ✅ | ❌ Hidden | ❌ Hidden |
| Tax_Jurisdiction | ✅ | ✅ | ❌ N/A | ❌ N/A |
| Deduction_Type | ✅ | ✅ | ❌ N/A | ❌ N/A |
| Hours_Worked | ✅ | ✅ | ✅ | ✅ |
| OT_Hours | ✅ | ✅ | ✅ | ✅ |
| Time_Entry_Status | ✅ | ✅ | ✅ | ✅ |

### 4.3 Composite Dashboard Tab Visibility

| Tab | Payroll Admin | Payroll Analyst | HR Partner | Manager (SS) |
|-----|:------------:|:---------------:|:----------:|:------------:|
| Tab 1: Overview | ✅ | ✅ | ✅ | ✅ |
| Tab 2: Overtime Exceptions | ✅ | ✅ | ✅ | ✅ |
| Tab 3: Tax Exceptions | ✅ | ✅ | ❌ Hidden | ❌ Hidden |
| Tab 4: Missing Time | ✅ | ✅ | ✅ | ✅ |
| Tab 5: Deduction Exceptions | ✅ | ✅ | ❌ Hidden | ❌ Hidden |
| Tab 6: Payroll Cost | ✅ | ✅ | ❌ Hidden | ❌ Hidden |

---

## 5. Security Test Scenarios

### 5.1 Test Matrix

| Test ID | Scenario | Security Group | Expected Result | Pass/Fail |
|---------|----------|----------------|-----------------|:---------:|
| SEC-001 | Payroll Admin views all dashboard tabs | Payroll Administrator | All 6 tabs visible; all data across all workers | |
| SEC-002 | Payroll Admin exports Tax Exception Report | Payroll Administrator | Full data export including all pay groups and tax jurisdictions | |
| SEC-003 | Payroll Analyst views dashboard scoped to assigned pay group | Payroll Analyst (Biweekly) | Only Biweekly pay group workers appear; all 6 tabs visible | |
| SEC-004 | Payroll Analyst attempts to view workers in unassigned pay group | Payroll Analyst (Biweekly) | Workers in Monthly/Weekly pay groups are not visible | |
| SEC-005 | HR Partner views dashboard scoped to supervisory org | HR Partner (Division A) | Only workers in Division A (and subordinate orgs) appear | |
| SEC-006 | HR Partner attempts to access Tax Exception tab | HR Partner | Tab 3 (Tax Exceptions) is hidden/not accessible | |
| SEC-007 | HR Partner attempts to access Deduction Exception tab | HR Partner | Tab 5 (Deduction Exceptions) is hidden/not accessible | |
| SEC-008 | HR Partner cannot see compensation fields | HR Partner | Hourly_Rate, Annual_Salary, Gross_Pay, Net_Pay columns hidden | |
| SEC-009 | Manager views dashboard for direct reports only | Manager (Self-Service) | Only direct reports are visible; no subordinate org rollup | |
| SEC-010 | Manager attempts to export report | Manager (Self-Service) | Export option is disabled/not visible | |
| SEC-011 | Manager cannot see Payroll Cost tab | Manager (Self-Service) | Tab 6 (Payroll Cost) is hidden/not accessible | |
| SEC-012 | Manager cannot see compensation fields | Manager (Self-Service) | Salary, rate, and pay detail fields hidden | |
| SEC-013 | User with no security group accesses dashboard | No assigned role | Access denied — dashboard not visible in navigation | |
| SEC-014 | Payroll Analyst assigned to 2 pay groups sees union of data | Payroll Analyst (Biweekly + Monthly) | Workers from both pay groups visible | |
| SEC-015 | HR Partner org change reflects in dashboard scope | HR Partner (reassigned from Div A to Div B) | Only Division B workers visible after reassignment | |

### 5.2 Security Validation Checklist

- [ ] All security groups created and activated in Workday
- [ ] Domain security policies updated with correct group assignments
- [ ] Row-level security validated for each security group
- [ ] Field-level security confirmed — hidden fields return no data (not blank)
- [ ] Composite dashboard tab visibility confirmed per security group
- [ ] Export permissions validated (Admin and Analyst only)
- [ ] Schedule permissions validated (Admin only)
- [ ] Cross-company data isolation confirmed for multi-company tenants
- [ ] Security group intersection rules tested (user in multiple groups)
- [ ] Terminated worker exclusion confirmed across all security contexts

---

## 6. Security Implementation Notes

### 6.1 Workday Configuration Steps

1. **Create Security Groups** — Navigate to `Create Security Group` task; define role-based groups per Section 1
2. **Assign Domain Policies** — Use `Maintain Permissions for Security Group` to grant domain access per Section 2
3. **Configure Row-Level Security** — Set role assignments on Supervisory Organization and Pay Group objects per Section 3
4. **Apply to Reports** — On each Advanced Report, set "Authorized Security Groups" to the appropriate groups
5. **Configure Composite Dashboard** — Set tab-level visibility using conditional security on each worklet
6. **Activate Security Changes** — Run `Activate Pending Security Policy Changes` task

### 6.2 Security Group Intersection Rules

When a user belongs to multiple security groups, Workday applies the **union** of permissions:

| Scenario | Effective Access |
|----------|-----------------|
| User is both Payroll Admin and HR Partner | Full Payroll Admin access (Admin supersedes HR Partner) |
| User is Payroll Analyst for Pay Group A and HR Partner for Division B | Sees Pay Group A workers (via Analyst) + Division B workers (via HR Partner); union of visible reports |
| User is Manager and HR Partner | HR Partner access (broader scope than Manager Self-Service) |

### 6.3 Sensitive Data Handling

| Data Element | Classification | Protection |
|--------------|---------------|------------|
| SSN / National ID | Restricted — **NOT included** in dashboard | Excluded from all data sources and reports |
| Bank Account Details | Restricted — **NOT included** in dashboard | Excluded from all data sources and reports |
| Hourly Rate / Salary | Confidential | Field-level security; visible to Payroll Admin and Analyst only |
| Gross/Net Pay | Confidential | Field-level security; visible to Payroll Admin and Analyst only |
| Tax Withholding Details | Confidential | Report-level security; Tax Exception tab restricted to Payroll roles |
| Deduction Amounts | Confidential | Report-level security; Deduction tab restricted to Payroll roles |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-22 | Payroll Systems Team | Initial security design document |
