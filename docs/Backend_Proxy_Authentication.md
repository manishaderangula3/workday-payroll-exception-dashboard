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
Signed HTTP-only Session Cookie
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
| `/api/auth/session` | GET | Optional | Returns the current signed-in user, if a valid session cookie exists. |
| `/api/auth/login` | POST | No | Validates user credentials and sets an HTTP-only signed session cookie. |
| `/api/auth/logout` | POST | Session | Clears the session cookie. |
| `/api/workday/dashboard-data` | GET | Required | Fetches Workday/demo data, applies role security, and returns scoped dashboard datasets. |

## Demo Users

The backend includes local demo users so the security flow can be tested without a Workday tenant.

| Username | Password | Role | Scope |
| --- | --- | --- | --- |
| `payroll.admin` | `PayrollDemo123!` | Payroll Admin | All departments, companies, and pay groups. |
| `finance.analyst` | `FinanceDemo123!` | Finance Analyst | All demo departments with worker details masked. |
| `operations.manager` | `ManagerDemo123!` | Department Manager | Operations only, export restricted. |

For production-style use, configure `AUTH_USERS_JSON` in `.env` and provide `passwordHash` values instead of demo passwords.

## Role Security Behavior

| Rule | Applied On Backend |
| --- | --- |
| Department scope | Workers outside `allowedDepartments` are removed. Empty scope means all departments allowed. |
| Company scope | Workers outside `allowedCompanies` are removed. Empty scope means all companies allowed. |
| Pay group scope | Workers outside `allowedPayGroups` are removed. Empty scope means all pay groups allowed. |
| Related rows | Payroll, time, deduction, and tax rows are filtered to visible workers only. |
| Worker-detail masking | Finance and read-only roles can receive masked worker names, emails, and locations. |
| Session security | Session is stored in a signed HTTP-only cookie with `SameSite=Lax`. |

## Environment Configuration

Copy `.env.example` to `.env` for local configuration. Do not commit `.env`.

Required for production-style security:

- `SESSION_SECRET`
- `AUTH_USERS_JSON` or an identity-provider integration replacing local users

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
- Replace demo authentication with SSO or managed identity for true production.
- Keep Workday row-level security active even when the external backend also filters rows.
- Treat backend RBAC as an additional protection layer, not a replacement for Workday security.
