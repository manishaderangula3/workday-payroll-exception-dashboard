# Backend Proxy and Authentication Guide

## Purpose

The dashboard now includes a backend proxy pattern for Workday RaaS/API data and external role security. This keeps Workday credentials out of React code and applies role scoping before rows reach the browser.

## Architecture

```text
React Dashboard
   |
Same-origin /api calls
   |
Node Backend Proxy
   |
Microsoft Entra Easy Auth or local development session
   |
Server-side Role Security
   |
Workday RaaS/API Report Endpoints
```

## Local Scripts

| Command | Purpose |
| --- | --- |
| `npm run proxy` | Starts the backend proxy on `http://127.0.0.1:8787`. |
| `npm run dev` | Starts the Vite dashboard on `http://127.0.0.1:5173` and proxies `/api` to the backend. |
| `npm run build` | Builds the production dashboard bundle. |
| `npm start` | Runs the backend proxy and serves the built `dist` dashboard plus `/api` endpoints. |

For local development, run the backend proxy and the Vite app in separate terminals.

## API Endpoints

| Endpoint | Method | Authentication | Purpose |
| --- | --- | --- | --- |
| `/api/health` | GET | No | Confirms the process is running and returns secret-free integration status. |
| `/api/readiness` | GET | No | Returns `200` when runtime configuration is valid and `503` when deployment settings are incomplete. |
| `/api/metrics` | GET | Monitoring bearer token | Returns aggregate request, error, latency, uptime, route, and memory metrics without payroll rows. |
| `/api/auth/session` | GET | Optional | Returns the current signed-in user and active authentication mode. |
| `/api/auth/login` | POST | No | Validates user credentials and sets an HTTP-only signed session cookie. |
| `/api/auth/logout` | POST | Session | Clears the session cookie. |
| `/api/workday/dashboard-data` | GET | Required | Fetches Workday/demo data, applies role security, and returns scoped dashboard datasets. |
| `/api/exports/report` | POST | Export permission | Rebuilds a requested report from server-scoped data, creates the XLSX workbook, and audits the export. |
| `/api/acknowledgements` | GET/POST | Required | Reads or writes persistent, role-scoped exception acknowledgements. |
| `/api/actions/workday-inbox` | POST | Required | Creates a task through the configured Workday action endpoint and audits the action. |
| `/api/audit-events` | GET | Payroll/Auditor | Returns role-scoped append-only workflow history. |
| `/api/delivery/trigger` | POST | Payroll Admin/Manager | Sends the current readiness workbook, aggregate summary, and dashboard link to the approved delivery webhook. |
| `/api/delivery/receipt` | POST | Delivery secret | Accepts idempotent delivered, failed, or bounced callbacks and writes them to the audit trail. |

## Demo Users

The backend includes local demo users so the security flow can be tested without a Workday tenant.

| Username | Password | Role | Scope |
| --- | --- | --- | --- |
| `payroll.admin` | `PayrollDemo123!` | Payroll Admin | All departments, companies, and pay groups. |
| `finance.analyst` | `FinanceDemo123!` | Finance Analyst | All demo departments with worker details masked. |
| `operations.manager` | `ManagerDemo123!` | Department Manager | Operations only, export restricted. |

Local users are development-only. Production defaults to blocking local authentication.

## Enterprise Authentication

The production implementation supports Microsoft Entra ID through Azure App Service Authentication (Easy Auth):

1. Configure the App Service identity provider and require authentication for all requests.
2. Set `AUTH_MODE=azure_easy_auth`, `COOKIE_SECURE=true`, and a secret-store-backed `SESSION_SECRET`.
3. Assign Entra app roles such as `Payroll.Admin`, `Payroll.Manager`, and `Department.Manager`.
4. Configure `ENTRA_ROLE_MAPPINGS_JSON` to map Entra app roles to dashboard security roles.
5. Optionally configure `ENTRA_USER_SCOPES_JSON` for department, company, and pay-group restrictions.
6. Validate that the platform strips client-supplied `X-MS-CLIENT-PRINCIPAL` headers before forwarding trusted identity headers.

The Node service decodes the trusted principal, requires a mapped app role, applies backend row security, and exposes no local password form in enterprise mode. Okta or Workday SSO can be used through an equivalent trusted reverse-proxy/OIDC pattern, but are not silently treated as configured.

## Role Security Behavior

| Rule | Applied On Backend |
| --- | --- |
| Department scope | Workers outside `allowedDepartments` are removed. Empty scope means all departments allowed. |
| Company scope | Workers outside `allowedCompanies` are removed. Empty scope means all companies allowed. |
| Pay group scope | Workers outside `allowedPayGroups` are removed. Empty scope means all pay groups allowed. |
| Related rows | Payroll, time, deduction, and tax rows are filtered to visible workers only. |
| Worker-detail masking | Finance and read-only roles can receive masked worker names, emails, and locations. |
| Export permission | Export controls are absent when `canExport=false`; direct export API requests also return `403`. Proxy-mode workbooks are rebuilt from server-scoped data rather than browser-supplied rows. |
| Session security | Local sessions use signed HTTP-only cookies; production identity is supplied by Entra Easy Auth. |
| Audit history | Live deployments append to and query a durable audit API. JSONL is limited to local development and portfolio deployments. |

## Environment Configuration

Copy `.env.example` to `.env` for local configuration. Do not commit `.env`.

Required for production-style security:

- `SESSION_SECRET`
- `AUTH_MODE=azure_easy_auth` and Entra app-role mappings
- `DEPLOYMENT_PROFILE=live` for real Workday data

Required for Workday RaaS/API data:

- `WORKDAY_WORKERS_URL`
- `WORKDAY_PAYROLL_RESULTS_URL`
- `WORKDAY_TIME_ENTRIES_URL`
- `WORKDAY_DEDUCTION_RESULTS_URL`
- `WORKDAY_TAX_RESULTS_URL`
- `WORKDAY_BEARER_TOKEN` or controlled backend-only `WORKDAY_USERNAME` / `WORKDAY_PASSWORD`

Required for a live deployment:

- HTTPS `WORKDAY_INBOX_TASK_URL`, `PUBLIC_APP_URL`, and `REPORT_DELIVERY_WEBHOOK_URL`
- `REPORT_DELIVERY_RECIPIENTS`, `REPORT_DELIVERY_INTERVAL_MINUTES` of at least 15, and a secret-store-backed `REPORT_DELIVERY_SECRET` of at least 32 characters
- `REPORT_DELIVERY_REQUIRE_RECEIPT=true` and an attachment limit appropriate for the selected webhook platform
- `AUDIT_STORE_MODE=http`, HTTPS `AUDIT_STORE_URL`, `AUDIT_STORE_TOKEN`, `AUDIT_RETENTION_DAYS` of at least 365, and an approved `AUDIT_BACKUP_POLICY_REFERENCE`
- JSON logging, central-log and monitoring references, `MONITORING_TOKEN`, and the HTTPS alert webhook/runbook settings
- Secret-rotation timestamp/policy, disaster-recovery plan with RTO/RPO, and penetration-test policy reference

Run `npm run validate:config` in the deployment environment before starting the service. The same validation runs automatically at server startup. Production requires an explicit `portfolio` or `live` deployment profile, preventing an accidental fallback to demo data.

## Scheduled Delivery Contract

The scheduler selects the latest payroll period by payment date unless `REPORT_DELIVERY_PAY_PERIOD` is set. It generates the same Payroll Approval Readiness `.xlsx` workbook used by server exports and sends JSON containing the aggregate summary, saved dashboard link, receipt callback URL, and this attachment shape:

```json
{
  "attachments": [{
    "fileName": "payroll-approval-readiness-center-period.xlsx",
    "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "contentBase64": "..."
  }]
}
```

The webhook must return a `2xx` response with `receiptId`, `deliveryId`, `messageId`, or `id`. It should later call `POST /api/delivery/receipt` with the same `deliveryId`, the `X-Delivery-Secret` header, and a status of `delivered`, `failed`, or `bounced`. Acceptance and final receipt events include the pay period, provider receipt, recipient count, workbook size, and SHA-256 digest; attachment bytes and recipient addresses are not stored in the audit trail.

## Durable Audit API Contract

The backing API can front Azure SQL, Cosmos DB, PostgreSQL, Microsoft Sentinel, or another approved audit platform. It must provide:

| Operation | Contract |
| --- | --- |
| Append | `POST AUDIT_STORE_URL` with bearer authentication and body `{ "event": { ... } }`; return any `2xx` status only after durable write acceptance. |
| Query | `GET AUDIT_STORE_URL?type=...&payPeriod=...&limit=...` with bearer authentication; return `{ "events": [...] }` or an array. |
| Integrity | Preserve the application-generated UUID and UTC timestamp; restrict update/delete access. |
| Operations | Enforce the configured retention, encryption, backup, restore testing, access logging, and least-privilege service identity outside this application. |

## Workday Report Contract

Configure Workday report field aliases to match the dashboard data contract:

- Workers
- Payroll Results
- Time Entries
- Deduction Results
- Tax Results

The recommended columns and CSV/API field contract are documented in `docs/Real_Time_Data_Integration.md`.

## Security Notes

- Never place Workday credentials in React code.
- Never expose Workday bearer tokens to the browser.
- Use HTTPS and secure cookies in hosted environments.
- Keep App Service authentication set to require login; do not expose the Node app directly around Easy Auth.
- Keep Workday row-level security active even when the external backend also filters rows.
- Treat backend RBAC as an additional protection layer, not a replacement for Workday security.
- During rotation, `SESSION_SECRET_PREVIOUS` and `REPORT_DELIVERY_SECRET_PREVIOUS` provide a temporary overlap window; remove retired values after validation.
