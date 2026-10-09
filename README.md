# Workday Payroll Exception Dashboard

This project is an interactive payroll review dashboard for finding issues before payroll approval. It brings payroll cost, overtime, missing time, deduction, and tax information into one place, then lets an analyst filter, investigate, acknowledge, and export the results.

The repository contains two connected pieces:

- A React dashboard that presents KPIs, charts, detailed reports, worker drill-downs, and Excel exports.
- A Node.js backend that handles authentication, role-based data scope, Workday RaaS/API requests, audit events, workflow actions, and protected exports.

It also includes the Workday report specifications, calculated-field designs, test plans, UAT material, and production-readiness runbooks behind the dashboard.

> The included data and local accounts are for demonstration. A real deployment still needs approved Entra ID configuration, Workday endpoints, tenant security testing, reconciliation, performance evidence, and business sign-off.

## What the Dashboard Covers

- Payroll cost and period-over-period variance
- Payroll completion and readiness
- Overtime hours, cost, thresholds, and department trends
- Missing time entries derived from schedules, submissions, leave, and holidays
- Failed, over, under, and arrears deduction exceptions
- Tax form, withholding, and jurisdiction exceptions
- Role-scoped worker details and payroll actions
- Formatted Excel exports for the current filtered view

The interface is useful for Payroll Analysts, HRIS Analysts, Workday Reporting Analysts, Payroll Systems Analysts, Functional Analysts, Integration Analysts, Operations Analysts, and Workday Consultants.

## How the Application Flows

```text
Choose a data source
        |
        +-- Sample data: synthetic records included in the project
        +-- Uploaded data: CSV exports selected in the browser
        +-- Backend proxy: authenticated Workday RaaS/API or scoped demo data
        |
Validate and normalize rows
        |
Apply authenticated role scope when proxy mode is used
        |
Apply pay period, company, pay group, department, and search filters
        |
Calculate KPIs, trends, exception counts, and report rows
        |
Review overview, readiness, cost, overtime, missing-time, deduction, and tax tabs
        |
Open worker details, acknowledge issues, create Workday tasks, or export Excel
```

The **Presentation Lens** helps explain the dashboard from different job perspectives. It does not grant access. Actual permissions come from the authenticated backend role.

## Run It Locally

### Requirements

- Node.js 24
- npm
- A current Chrome or Edge browser

### 1. Install dependencies

From the repository folder:

```powershell
npm ci
```

### 2. Start the backend

Open one terminal and run:

```powershell
npm run proxy
```

The backend starts at [http://127.0.0.1:8787](http://127.0.0.1:8787).

### 3. Start the dashboard

Open a second terminal and run:

```powershell
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

The dashboard can display sample data without the backend, but login, role-scoped proxy data, protected actions, and server-generated exports require both processes.

### 4. Use a local demo account

| User | Password | What it demonstrates |
|---|---|---|
| `payroll.admin` | `PayrollDemo123!` | Full payroll view, exports, acknowledgements, and actions |
| `finance.analyst` | `FinanceDemo123!` | Finance-oriented scoped access with restricted payroll actions |
| `operations.manager` | `ManagerDemo123!` | Operations-only worker scope and restricted export access |

These accounts are disabled as a production authentication strategy. Production mode expects Microsoft Entra ID unless an explicit emergency override is configured.

## Use the Dashboard

### Sample Data

Sample Data is active when the dashboard first opens. Use it to explore every KPI, report tab, chart, threshold, drill-down, and presentation lens without uploading files.

### Uploaded Workday Exports

1. Scroll to **Dashboard controls**.
2. Find the **Data Source** panel.
3. Upload one or more CSV files for Workers, Payroll Results, Time Entries, Deduction Results, or Tax Results.
4. Review any validation messages.
5. The dashboard switches to **Uploaded Data** after a valid upload.
6. KPIs, filters, charts, reports, and worker details recalculate immediately.
7. Select **Clear Uploads** to return to sample data.

Uploaded files stay in browser memory and are not mixed with sample records. Missing datasets remain empty. Upload Workers when you need worker names, departments, managers, and report joins.

Required columns and example CSV rows are documented in [Real-Time Data Integration](docs/Real_Time_Data_Integration.md).

### Backend Proxy Data

1. Start both local processes.
2. Sign in from the **Authentication and Role Security** panel.
3. Select **Load Proxy Data**.
4. The backend authenticates the user and applies company, department, and pay-group scope.
5. If Workday URLs are configured, the server loads Workday data. Otherwise it returns role-scoped demonstration data.
6. Select **Refresh** to fetch the active proxy data again.

Raw Workday credentials never belong in the browser. The backend retrieves, validates, limits, normalizes, and scopes Workday responses before returning data to React.

## Production-Style Local Run

Build the frontend and serve it through the Node backend:

```powershell
npm run build
npm start
```

Open [http://127.0.0.1:8787](http://127.0.0.1:8787).

This is the closest local match to the deployed container. The build also copies the Markdown report specifications into `dist/reports` so links in the Documentation tab work after deployment.

## Configuration

Local sample and demo-proxy use works without an `.env` file. For custom settings, create one from the example:

```powershell
Copy-Item .env.example .env
```

The backend loads `.env` automatically. Never commit it. Keep real Workday, Entra, webhook, monitoring, and audit credentials in an approved secret store.

The most important settings are:

| Setting | Purpose |
|---|---|
| `AUTH_MODE` | `local` for development or `azure_easy_auth` for production |
| `SESSION_SECRET` | Signs backend sessions; use a strong secret-store value |
| `DEPLOYMENT_PROFILE` | `portfolio` for synthetic data or `live` for real integrations |
| `WORKDAY_*_URL` | RaaS/API endpoints for workers, payroll, time, deductions, and tax |
| `WORKDAY_BEARER_TOKEN` | Preferred backend credential for Workday requests |
| `ENTRA_ROLE_MAPPINGS_JSON` | Maps Entra application roles to dashboard roles |
| `ENTRA_USER_SCOPES_JSON` | Assigns allowed departments, companies, and pay groups |
| `AUDIT_STORE_*` | Configures local JSONL or durable audit storage |
| `WORKDAY_INBOX_TASK_URL` | Enables real Workday Inbox task creation |
| `REPORT_DELIVERY_*` | Controls scheduled Excel delivery and delivery receipts |

See [.env.example](.env.example) for every supported value and [Backend Proxy Authentication](docs/Backend_Proxy_Authentication.md) for the security model.

Before a live deployment, run:

```powershell
npm run validate:config
npm run validate:production
```

`validate:production` is supposed to fail until authorized evidence and approvals are recorded. Do not replace pending records with invented approvals.

## Workday Connection Flow

For a real tenant:

1. Build the required Workday Advanced and Matrix reports.
2. Enable the approved reports as web services.
3. Create a least-privilege Integration System User or approved OAuth client.
4. Configure the five `WORKDAY_*_URL` values and backend credentials in the host secret store.
5. Configure Entra authentication, role mappings, and user scopes.
6. Run `npm run validate:config` in the target environment.
7. Test each role with real tenant security.
8. Complete payroll/GL reconciliation, volume testing, UAT, operational exercises, and penetration testing.
9. Record genuine evidence with `npm run evidence:record`.
10. Run `npm run validate:production` before release.

The detailed tenant sequence is in [Workday Tenant Build Runbook](docs/Workday_Tenant_Build_Runbook.md).

## Testing

```powershell
# Unit, calculation, security, and server tests
npm test

# TypeScript compilation, production bundle, budget, and report-document copy
npm run build

# Authentication, authorization, export, workflow, and link checks
npm run test:functional

# Desktop and mobile screenshot comparisons
npm run test:visual

# Throttled browser performance checks
npm run test:performance

# Production runtime dependency audit
npm audit --omit=dev --audit-level=low
```

Only run `npm run test:visual:update` after reviewing an intentional UI change. It replaces approved screenshot baselines.

## Common Problems

### "Backend proxy is not running"

Start `npm run proxy` in a separate terminal and keep it running while using the Vite dashboard.

### Port 5173 or 8787 is already in use

Stop the earlier Node process or terminal session before starting another instance.

### Login fails repeatedly

Confirm the demo username and password exactly. Login attempts are rate-limited; wait for the local lockout window to expire after repeated failures.

### An upload is rejected

Use CSV format, keep the file below 5 MB, include the required headers, and use ISO dates such as `2026-09-15`. The validation panel identifies missing columns and invalid rows.

### Uploaded reports are empty

Check that all related datasets use the same Employee ID and Pay Period values. Upload the Workers dataset for names, departments, managers, and organization filters.

### The build warns about a large Excel chunk

ExcelJS is loaded only when export is used. The warning is expected, and the project's enforced initial-load and lazy-chunk budgets still determine whether the build passes.

## Project Structure

```text
src/                 React dashboard, components, calculations, uploads, and exports
server/              Authentication, RBAC, Workday proxy, audit, actions, and delivery
e2e/                 Playwright functional, visual, and performance tests
reports/             Workday report specifications
calculated-fields/   Calculated-field definitions used by the reports
dashboards/          Dashboard layout, composite report, and KPI specifications
report-design/       Report inventory, matrix, security, and design material
testing/             Test cases, UAT, defects, and production evidence plans
docs/                Architecture, runbooks, assumptions, and project decisions
samples/             Example Excel outputs and screenshot guidance
scripts/             Build budgets and production/configuration evidence checks
```

Start with these documents when reviewing the project:

- [Project Overview](docs/Project_Overview.md)
- [Business Requirements](docs/Business_Requirements.md)
- [Technical Design](docs/Technical_Design.md)
- [Real-Time Data Integration](docs/Real_Time_Data_Integration.md)
- [Production Readiness Checklist](docs/Production_Readiness_Checklist.md)
- [Dashboard QA and Security Audit](testing/Dashboard_QA_Security_Audit.md)

## Security and Data Handling

- Use synthetic data for public demonstrations.
- Treat Workday payroll exports as confidential information.
- Never commit `.env` files, credentials, tokens, real employee data, or production evidence containing secrets.
- Keep Workday requests and exports behind backend authentication and role checks.
- Use HTTPS, secure cookies, Entra ID, durable audit storage, centralized monitoring, and an approved secret manager in production.
- A passing local build does not replace tenant security testing or business approval.

## Current Status

The dashboard, local proxy, uploads, calculations, exports, tests, documentation links, and production gates are implemented. Local sample and scoped-demo workflows are ready to run.

A live rollout remains intentionally blocked until real Entra and Workday configuration is connected and all required tenant, reconciliation, performance, UAT, operations, recovery, and security evidence is approved.
