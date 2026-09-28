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

## Frontend Network Baseline

The repository includes an automated Chromium test using 150 ms latency, 1.6 Mbps download, 750 Kbps upload, and a disabled browser cache. Run it locally with `npm run test:performance`. To measure the deployed environment, set `PERFORMANCE_BASE_URL` to the approved HTTPS deployment before running the same command.

| Measurement | September 28, 2026 Baseline | Automated Budget |
| --- | --- | --- |
| First Contentful Paint | 1,924 ms | <= 5,000 ms |
| Load event | 1,695 ms | <= 8,000 ms |
| Initial compressed JavaScript | 211,530 bytes | <= 300,000 bytes |
| Excel chunk requested during initial load | No | Must remain No |
| Lazy Excel transfer | 271,327 bytes compressed | <= 350,000 bytes |
| Lazy Excel network duration | 1,557 ms | Informational |
| Export ready for download | 1,891 ms | <= 12,000 ms |

The Node server now gzip-compresses text assets and gives fingerprinted `/assets` files a one-year immutable cache policy. The raw chart and Excel chunk sizes remain larger because of Recharts and ExcelJS, but the measured network transfers meet the current budgets. The production run remains required because CDN/proxy behavior, TLS, geographic latency, and enterprise network controls are external to the local simulation.

## Bundle Budgets

`npm run build` now runs `scripts/checkBundleBudget.mjs` and fails when a bundle exceeds its approved raw or gzip budget.

| Chunk | Raw Budget | Gzip Budget | Current Gzip Size |
| --- | --- | --- | --- |
| Application | 230 KB | 60 KB | 51.5 KB |
| Charts | 600 KB | 180 KB | 160.0 KB |
| ExcelJS, lazy | 1,000 KB | 300 KB | 271.3 KB |
| Initial JavaScript total | N/A | 250 KB | 211.5 KB |

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
