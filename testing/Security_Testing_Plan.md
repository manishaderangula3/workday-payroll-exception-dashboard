# Security Testing Plan

## Purpose

This plan validates that the Payroll Exception Dashboard respects Workday security, external dashboard role security, drill-down permissions, and export controls before production use.

## Security Objectives

| Objective | Validation |
| --- | --- |
| Least privilege | Users see only the reports, rows, and fields required for their role |
| Row-level security | Department, company, pay group, and supervisory organization scope is enforced |
| Field-level security | Sensitive payroll, tax, and worker details are masked or hidden where required |
| Export security | Downloaded files contain only authorized rows and fields |
| Session security | Hosted app sessions use signed HTTP-only secure cookies |
| Credential safety | Workday credentials remain backend-only and are stored in approved secrets |

## Roles to Test

| Role | Expected Access |
| --- | --- |
| Payroll Admin | All dashboard tabs, all workers, all payroll detail, export allowed |
| Payroll Manager | Payroll exception data for assigned pay groups and companies |
| HR Business Partner | Worker exceptions for assigned organization scope |
| Department Manager | Direct or scoped worker exceptions only |
| Finance Analyst | Payroll costs and summary data, worker detail masked where required |
| Benefits Administrator | Deduction exceptions and benefit election drill-downs |
| Tax Analyst | Tax exceptions and tax election drill-downs |
| Unauthorized User | No dashboard access |

## Test Cases

| SEC ID | Role | Scenario | Steps | Expected Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| SEC-PROD-001 | Payroll Admin | Full access validation | Sign in, run all tabs, export all reports | All authorized rows and fields appear | Screenshot and export sample |
| SEC-PROD-002 | Department Manager | Manager row scope | Sign in as manager, run dashboard | Only scoped workers appear | Screenshot with row count |
| SEC-PROD-003 | HR Business Partner | Organization scope | Sign in as HRBP, filter across departments | Only assigned org data appears | Screenshot with org scope |
| SEC-PROD-004 | Finance Analyst | Masked worker detail | Open Payroll Cost and drill-down | Payroll cost visible; restricted worker detail masked | Screenshot |
| SEC-PROD-005 | Benefits Administrator | Deduction access | Open Deductions tab and benefit election drill-down | Deduction rows visible; unrelated tax detail restricted | Screenshot |
| SEC-PROD-006 | Tax Analyst | Tax access | Open Tax Issues tab and tax drill-down | Tax rows visible; unrelated benefit detail restricted | Screenshot |
| SEC-PROD-007 | Unauthorized User | Access denied | Attempt dashboard access without approved role | Access denied or no report available | Screenshot |
| SEC-PROD-008 | Export scope | Export per role | Export each report for each role | Export matches on-screen authorized data | Export comparison |
| SEC-PROD-009 | Prompt tampering | Change department/pay group prompts | Attempt selecting outside assigned scope | Unauthorized scope returns no rows or hidden options | Screenshot |
| SEC-PROD-010 | Direct URL access | Open saved report links directly | Use deep links to reports and drill-downs | Workday security still applies | Screenshot |
| SEC-PROD-011 | Session cookie | Hosted app cookie check | Inspect app session cookie in browser dev tools | Cookie is HttpOnly, SameSite=Lax, Secure over HTTPS | Screenshot |
| SEC-PROD-012 | Credential exposure | Source and browser check | Search frontend bundle and network responses | No Workday token, username, or password exposed | Scan results |

## Export Validation Matrix

| Report | Payroll Admin | Manager | HRBP | Finance | Benefits | Tax |
| --- | --- | --- | --- | --- | --- | --- |
| Payroll Cost | Full allowed rows | Scoped rows | Scoped rows | Summary or masked detail | Restricted unless approved | Restricted unless approved |
| Overtime | Full allowed rows | Scoped rows | Scoped rows | Summary only | Restricted | Restricted |
| Missing Time | Full allowed rows | Scoped rows | Scoped rows | Restricted | Restricted | Restricted |
| Deductions | Full allowed rows | Restricted/scoped | Scoped if approved | Summary only | Full deduction scope | Restricted |
| Tax Issues | Full allowed rows | Restricted/scoped | Scoped if approved | Summary only | Restricted | Full tax scope |

## Pass Criteria

- No user can see workers outside their authorized organization, company, department, pay group, or supervisory scope.
- No restricted field appears on screen, in drill-down, in exported Excel/CSV, or in API responses.
- Unauthorized users cannot open dashboard reports or direct report links.
- Hosted session cookies are signed, HTTP-only, and secure over HTTPS.
- Workday API credentials are not visible in frontend source, network responses, browser storage, exports, or logs.

## Failure Handling

| Failure Type | Severity |
| --- | --- |
| Unauthorized payroll, tax, or worker data visible | Critical |
| Export contains unauthorized rows or fields | Critical |
| Manager sees another manager's workers | High |
| Field masking missing for Finance or read-only role | High |
| Prompt allows confusing but empty unauthorized scope | Medium |
| Cosmetic security label issue | Low |

