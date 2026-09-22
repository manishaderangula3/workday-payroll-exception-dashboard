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
| `/api/health` | GET | No | Confirms backend proxy is running and whether Workday URLs are configured. |
| `/api/auth/session` | GET | Optional | Returns the current signed-in user and active authentication mode. |
| `/api/auth/login` | POST | No | Validates user credentials and sets an HTTP-only signed session cookie. |
| `/api/auth/logout` | POST | Session | Clears the session cookie. |
| `/api/workday/dashboard-data` | GET | Required | Fetches Workday/demo data, applies role security, and returns scoped dashboard datasets. |
| `/api/exports/report` | POST | Export permission | Rebuilds a requested report from server-scoped data, creates the XLSX workbook, and audits the export. |
| `/api/acknowledgements` | GET/POST | Required | Reads or writes persistent, role-scoped exception acknowledgements. |
| `/api/actions/workday-inbox` | POST | Required | Creates a task through the configured Workday action endpoint and audits the action. |
| `/api/audit-events` | GET | Payroll/Auditor | Returns role-scoped append-only workflow history. |
| `/api/delivery/trigger` | POST | Payroll Admin/Manager | Sends a summary and saved dashboard link to the approved delivery webhook. |

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
| Audit history | Acknowledgements, Workday task requests, and scheduled deliveries are appended to a server-side JSONL audit store. |

## Environment Configuration

Copy `.env.example` to `.env` for local configuration. Do not commit `.env`.

Required for production-style security:

- `SESSION_SECRET`
- `AUTH_MODE=azure_easy_auth` and Entra app-role mappings

Required for Workday RaaS/API data:

- `WORKDAY_WORKERS_URL`
- `WORKDAY_PAYROLL_RESULTS_URL`
- `WORKDAY_TIME_ENTRIES_URL`
- `WORKDAY_DEDUCTION_RESULTS_URL`
- `WORKDAY_TAX_RESULTS_URL`
- `WORKDAY_BEARER_TOKEN` or controlled backend-only `WORKDAY_USERNAME` / `WORKDAY_PASSWORD`

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
