# Performance Testing Plan

## Purpose

This plan validates that the Payroll Exception Dashboard and Workday reports perform acceptably with realistic worker, payroll result, time entry, deduction, and tax volumes.

## Performance Targets

| Scenario | Target | Maximum Acceptable |
| --- | --- | --- |
| Dashboard initial load | 10 seconds or less | 15 seconds |
| Shared prompt change | 5 seconds or less | 8 seconds |
| Detail report tab load | 8 seconds or less | 12 seconds |
| Worker drill-down | 3 seconds or less | 5 seconds |
| Excel export | 30 seconds or less | 60 seconds |
| Backend proxy data load | 10 seconds or less | 20 seconds |

## Test Data Volumes

| Dataset Size | Worker Count | Pay Periods | Purpose |
| --- | --- | --- | --- |
| Small | 250 | 2 | Smoke validation |
| Standard | 1,000 | 3 | Baseline target |
| Large | 5,000 | 6 | Expected production ceiling |
| Stress | 10,000 | 6+ | Capacity risk assessment only |

## Test Scenarios

| PERF ID | Scenario | Steps | Target | Evidence |
| --- | --- | --- | --- | --- |
| PERF-PROD-001 | Initial dashboard load | Open dashboard for current pay period | <= 10 seconds | Timing screenshot/log |
| PERF-PROD-002 | Pay period prompt | Change pay period and wait for all tabs/KPIs | <= 5 seconds | Timing screenshot/log |
| PERF-PROD-003 | Department prompt | Filter to largest department | <= 5 seconds | Timing screenshot/log |
| PERF-PROD-004 | Payroll Cost tab | Open Payroll Costs with full population | <= 8 seconds | Timing screenshot/log |
| PERF-PROD-005 | Overtime tab | Open Overtime matrix and detail | <= 8 seconds | Timing screenshot/log |
| PERF-PROD-006 | Missing Time tab | Open Missing Time exceptions | <= 8 seconds | Timing screenshot/log |
| PERF-PROD-007 | Deduction tab | Open Deduction exceptions | <= 8 seconds | Timing screenshot/log |
| PERF-PROD-008 | Tax tab | Open Tax Issues exceptions | <= 8 seconds | Timing screenshot/log |
| PERF-PROD-009 | Worker drill-down | Select worker row from each tab | <= 3 seconds | Timing screenshot/log |
| PERF-PROD-010 | Export | Export each report for standard population | <= 30 seconds | Export timestamp |
| PERF-PROD-011 | Backend proxy | Load Workday RaaS/API data through backend | <= 10 seconds | Server log/API timing |
| PERF-PROD-012 | Concurrent users | Five payroll users load dashboard at same time | No errors; target maintained | Test log |

## Workday Report Optimization Checks

| Optimization | Required Action |
| --- | --- |
| Prompt-first design | Require pay period prompt before broad report execution |
| Indexed/filterable fields | Use Workday-supported prompt fields where possible |
| Date limits | Avoid unbounded historical payroll result queries |
| Row limits | Use pagination and reasonable row limits for dashboard tabs |
| Calculated fields | Avoid unnecessary nested calculated fields in high-volume rows |
| Detail reports | Keep drill-down reports scoped to selected worker/context |
| Composite tabs | Avoid auto-loading all expensive tabs if tenant performance is poor |

## Backend Proxy Performance Checks

| Check | Expected Result |
| --- | --- |
| `/api/health` response | Returns within 1 second |
| Workday endpoint timeout handling | Slow Workday report returns clear warning or controlled failure |
| Role filtering | Applied server-side before response is sent |
| Payload size | Large responses stay within approved platform limits |
| Logs | No payroll details or credentials logged |

## Result Log Template

| PERF ID | Dataset Size | Run Date | Tester | Result Time | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| PERF-PROD-001 | TBD | TBD | TBD | TBD | Pending |  |
| PERF-PROD-002 | TBD | TBD | TBD | TBD | Pending |  |
| PERF-PROD-003 | TBD | TBD | TBD | TBD | Pending |  |
| PERF-PROD-004 | TBD | TBD | TBD | TBD | Pending |  |
| PERF-PROD-005 | TBD | TBD | TBD | TBD | Pending |  |

## Exit Criteria

Performance testing is complete when:

- Standard dataset meets target timings.
- Large dataset meets maximum acceptable timings or has documented optimization actions.
- Export performance is acceptable for Payroll and Finance users.
- No timeout occurs for the approved production population.
- Any performance limitation is documented in the release notes and accepted by the Payroll Product Owner.

