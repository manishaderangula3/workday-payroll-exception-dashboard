# Production Readiness Checklist

## Readiness Summary

| Area | Portfolio Dashboard Status | Workday Production Status |
| --- | --- | --- |
| React dashboard app | Ready | Host through the selected full-stack Node deployment path when backend proxy mode is enabled. |
| Sample data mode | Ready | Use only synthetic data for public demos. |
| CSV upload mode | Ready for controlled demos | Use sanitized exports only unless the app is hosted in an approved secure environment. |
| Workday RaaS/API integration | Validating proxy implemented | Configure tenant URLs and validate normalized rows, pagination, and retry behavior against live RaaS output. |
| Enterprise authentication | Entra Easy Auth adapter implemented | Configure the App Service identity provider, app roles, user scopes, and security tests. |
| Workday tenant reports | Specified | Must be configured and validated in the target tenant. |
| Workday security | Documented | Must be tested with actual Payroll, HRIS, Manager, Finance, Benefits, and Tax roles. |
| Tenant go-live execution pack | Complete | Runbooks and sign-off templates are documented for live tenant execution. |

## Coded Dashboard Checklist

| Check | Status | Evidence |
| --- | --- | --- |
| Production build succeeds | Complete | `npm run build` |
| Unit tests pass | Complete | `npm test` |
| Dependency audit is clean | Complete | `npm audit --audit-level=low` |
| Upload validation exists | Complete | CSV type, empty file, and 5 MB size checks. |
| Formatted Excel export | Complete | The app generates `.xlsx` workbooks with report metadata, frozen headers, filters, widths, and number formats. |
| Runtime errors fail gracefully | Complete | React error boundary wraps the app. |
| Real payroll credentials excluded | Complete | No Workday credentials, tokens, passwords, or API keys in frontend code. |
| Backend proxy exists | Complete | Node proxy serves `/api` endpoints and built dashboard assets. |
| External role security exists | Complete in code | Entra Easy Auth adapter, local development sessions, backend RBAC, masking, and server-enforced export authorization are implemented. |
| RaaS runtime validation | Complete in code | Alias normalization, required-field validation, invalid-row rejection, retry, bounded pagination, and same-origin pagination checks. |
| Workflow persistence | Complete in code | Append/query audit adapter and role-scoped APIs; live profile requires a durable HTTPS audit service. |
| Workday actions | Configuration required | Time-entry deep links use source URLs; Inbox task creation uses `WORKDAY_INBOX_TASK_URL`. |
| Saved report links | Complete | Current tab and prompts are URL-backed and copyable. |
| Scheduled distribution | Complete in code; configuration required | Interval scheduler attaches a server-generated readiness workbook, requires a provider receipt, and audits idempotent delivered/failed/bounced callbacks. |
| Hosted deployment decision | Complete | Full-stack Node.js hosting selected; see `docs/Hosting_Deployment_Decision.md`. |
| Browser visual regression tests | Complete | Playwright desktop, mobile, and proxy role-scope screenshots are configured. |
| Documentation linked | Complete | README links build plan, QA audit, and real-time data integration guide. |
| Tenant build runbook | Complete | `docs/Workday_Tenant_Build_Runbook.md` |
| Production security test plan | Complete | `testing/Security_Testing_Plan.md` |
| Payroll/GL reconciliation plan | Complete | `testing/Payroll_GL_Reconciliation_Plan.md` |
| Performance test plan | Complete | `testing/Performance_Testing_Plan.md` |
| UAT sign-off packet | Complete | `testing/UAT_Signoff_Packet.md` |
| Production evidence gate | Complete | `npm run validate:production` blocks release until all ten tenant, business, and operations approval areas are recorded. |
| Runtime configuration gate | Complete | `npm run validate:config` and server startup reject incomplete live SSO, Workday, action, delivery, secret, or audit settings. |
| Structured operations telemetry | Complete in code | Redacted JSON request logs, correlation IDs, authenticated metrics, health/readiness probes, and alert webhook adapter. |
| Rotation overlap | Complete in code | Current and previous session/delivery secrets are accepted during a controlled rotation window. |
| Production operations execution | External evidence required | Central sink, dashboards, paging, restore test, rotation drill, DR exercise, and penetration test require the hosting/security teams. |

## Enforced Release Gate

Run `npm run validate:production` before deployment. The command intentionally fails while `testing/production-evidence.json` contains pending items. Each approval requires a tenant/environment, change ticket, evidence reference, timestamped authorized approver, and approved status. Payroll/GL reconciliation and disaster recovery each require two-role sign-off. Use `npm run evidence:record` only after the approver has reviewed the evidence; see `testing/Production_Approval_Runbook.md`.

Run `npm run validate:config` in the target hosting environment after its secret manager has resolved settings. For real payroll data, set `DEPLOYMENT_PROFILE=live`; the backend will not listen unless Entra, every Workday dataset, Inbox action, delivery webhook, and durable audit configuration passes validation. This gate validates configuration presence and transport security, while the production evidence gate records actual tenant connectivity and business approval.

## Workday Tenant Go-Live Checklist

| Check | Owner | Execution Artifact | Required Before Production |
| --- | --- | --- | --- |
| Validate report data sources | Workday Reporting Analyst | `docs/Workday_Tenant_Build_Runbook.md` | Confirm Payroll Results, Time Tracking, Worker, Benefit, and Tax objects return expected rows. |
| Build calculated fields | Workday Report Builder | `docs/Workday_Tenant_Build_Runbook.md` | Build and unit test payroll status, overtime, missing time, deduction, and tax exception logic. |
| Configure report prompts | Workday Report Builder | `docs/Workday_Tenant_Build_Runbook.md` | Confirm Pay Period, Company, Pay Group, Department, Status, and threshold prompts work across reports. |
| Configure dashboard/composite report | Workday Report Builder | `docs/Workday_Tenant_Build_Runbook.md` | Confirm tab structure, shared prompts, badges, drill-downs, and exports. |
| Validate role security | Workday Security Administrator | `testing/Security_Testing_Plan.md` | Test Payroll Admin, HR Partner, Department Manager, Finance Analyst, Benefits Administrator, and Tax Analyst access. |
| Validate export security | Payroll/IT Security | `testing/Security_Testing_Plan.md` | Confirm exports contain only rows and fields allowed by the user's security context. |
| Reconcile payroll totals | Payroll Manager and Finance Analyst | `testing/Payroll_GL_Reconciliation_Plan.md` | Tie payroll cost totals to payroll register and general ledger control totals. |
| Performance test large populations | Workday Reporting Lead | `testing/Performance_Testing_Plan.md` | Validate target load time with realistic worker and payroll result volume. |
| Complete UAT sign-off | Payroll Product Owner | `testing/UAT_Signoff_Packet.md` | Confirm business acceptance and documented defect disposition. |
| Approve production migration | Payroll, HRIS, IT Security | `testing/UAT_Signoff_Packet.md` | Confirm no open Critical defects and approved plan for High defects. |
| Validate production operations | Platform Operations, Security, Payroll | `docs/Production_Operations_Runbook.md` | Validate central telemetry, alerting, restore, rotation, DR, and independent penetration-test evidence. |

## Production Data Rules

- Do not commit real employee, payroll, tax, benefit, or deduction data.
- Mask employee IDs, names, manager emails, and pay details before portfolio use.
- Store Workday credentials only in an approved backend secret store.
- Never place Workday tenant credentials or bearer tokens in React frontend code.
- Use HTTPS and approved hosting controls for any environment that handles real payroll exports.
- Set `AUTH_MODE=azure_easy_auth`, `SESSION_SECRET`, `COOKIE_SECURE=true`, and Workday credentials through the hosting platform's secret manager.

## Final Recommendation

The coded dashboard is ready for portfolio presentation and controlled hosted validation. Production release remains blocked by the evidence gate until approved tenant users execute and sign the Workday build validation, security tests, payroll/GL reconciliation, volume tests, and UAT. The repository does not fabricate those external approvals.
