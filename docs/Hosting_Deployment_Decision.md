# Hosted Deployment Decision

## Decision Summary

The Payroll Exception Dashboard should be deployed as a full-stack Node.js application that serves the built React dashboard and the Workday backend proxy from the same HTTPS origin.

This is the selected production path because the dashboard now includes Workday RaaS/API access, server-side authentication, role-based filtering, and backend-only credentials. A static-only host is acceptable for portfolio sample-data demos, but it is not acceptable for real Workday data because it cannot protect Workday credentials or enforce backend row-level security.

## Selected Hosting Pattern

| Item | Decision |
| --- | --- |
| Hosting type | Node.js runtime with HTTPS |
| App entry point | `server/workdayProxy.js` |
| Frontend build | `npm run build` creates `dist/` |
| Runtime command | `npm start` |
| Health check | `/api/health` |
| Readiness check | `/api/readiness` |
| Public traffic | HTTPS reverse proxy or platform TLS |
| Workday traffic | Backend-only outbound HTTPS to Workday RaaS/API endpoints |
| Credentials | Runtime secret store only, never frontend code |
| Audit storage | Durable HTTPS audit API backed by an approved database/platform |
| Logs and monitoring | Structured stdout/stderr collection, authenticated `/api/metrics`, and hosted health/readiness probes |
| Alerting | Approved HTTPS incident webhook connected to the payroll systems on-call route |

## Recommended Platforms

Use any approved platform that supports a private Node.js service, environment secrets, HTTPS, health checks, and restricted deployment access.

| Platform Option | Fit | Notes |
| --- | --- | --- |
| Azure App Service | Strong fit | Best enterprise fit when HRIS/IT already uses Microsoft controls. |
| Render/Railway/Fly.io | Good portfolio fit | Fast setup for private demos, still supports backend secrets and health checks. |
| Private VM/container platform | Strong fit | Works when company policy requires network allowlists or private routing. |
| GitHub Pages/S3 static hosting | Not selected | Static-only hosting cannot safely proxy Workday API calls or store credentials. |

## Deployment Architecture

```text
User Browser
  |
  | HTTPS
  v
Node Dashboard Service
  |-- Serves React build from dist/
  |-- Handles /api/auth/* session endpoints
  |-- Handles /api/workday/dashboard-data
  |-- Applies backend role security before returning rows
  |
  | HTTPS with backend-only credentials
  v
Workday RaaS/API Reports
```

## Required Runtime Settings

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV=production` | Yes | Enables production runtime behavior. |
| `HOST=0.0.0.0` | Yes for containers | Allows the hosting platform to route traffic into the service. |
| `PORT` | Platform-dependent | Runtime port. Defaults to `8787` locally. |
| `SESSION_SECRET` | Yes | Signs HTTP-only session cookies. |
| `COOKIE_SECURE=true` | Yes for HTTPS | Adds the Secure flag to session cookies. |
| `DEPLOYMENT_PROFILE=live` | Yes for real payroll data | Enables strict startup validation; use `portfolio` only for synthetic deployments. |
| `AUTH_MODE=azure_easy_auth` | Yes | Uses the hosting platform's trusted Entra identity headers. |
| `WORKDAY_*_URL` | Production yes | RaaS/API report endpoints for workers, payroll, time, deductions, and tax. |
| `WORKDAY_BEARER_TOKEN` or `WORKDAY_USERNAME`/`WORKDAY_PASSWORD` | Production yes | Backend-only Workday authentication. |
| `AUDIT_STORE_MODE=http` and `AUDIT_STORE_*` | Live yes | Sends audit events to durable shared storage; local JSONL is not accepted for live deployments. |
| `MONITORING_TOKEN` and observability references | Live yes | Protects metrics and identifies the approved central log and monitoring resources. |
| `ALERT_WEBHOOK_*` and `ALERT_RUNBOOK_URL` | Live yes | Routes backend and scheduled-delivery failures to the operations platform. |
| Rotation, DR, and penetration policy settings | Live yes | Makes operational ownership, RTO/RPO, credential age, and security-test policy explicit. |

## Container Deployment

The repository includes a portable `Dockerfile` for Node-capable hosts.

```bash
docker build -t workday-payroll-dashboard .
docker run --env-file .env -p 8787:8787 workday-payroll-dashboard
```

The container serves the compiled dashboard and API proxy together. In production, use the host platform's secret manager instead of a local `.env` file.

Before routing traffic, run `npm run validate:config` with the deployment's resolved secrets and configure the platform readiness probe to `/api/readiness`. A live instance exits before listening when configuration is incomplete.

## Release Checklist

| Step | Owner | Completion Criteria |
| --- | --- | --- |
| Build app | Reporting/Systems Analyst | `npm run build` succeeds. |
| Configure secrets | IT/Security | Required runtime variables are present in the host secret store. |
| Validate runtime configuration | IT/Security | `npm run validate:config` passes for `DEPLOYMENT_PROFILE=live`. |
| Validate durable audit | IT/Security | Append/query tests pass, retention is configured, and backup/restore evidence is approved. |
| Validate observability | Platform Operations | Correlated logs, metrics, probes, and test alerts are visible in the approved services. |
| Exercise recovery | Platform Operations/Payroll | Backup restore and DR exercise meet approved RTO/RPO. |
| Rotate credentials | Security Operations | Rotation succeeds and retired credentials are rejected. |
| Complete penetration test | Application Security | Independent test is complete and Critical/High findings are remediated or accepted. |
| Configure Workday reports | Workday Reporting Analyst | RaaS/API URLs return expected datasets to the backend. |
| Validate authentication | HRIS/IT | Users can sign in and sessions use HTTP-only secure cookies. |
| Validate role security | Payroll/HRIS/Security | Manager, HR Partner, Finance, and Payroll Admin scopes return only authorized rows. |
| Run visual regression | Reporting Analyst | `npm run test:visual` passes against approved screenshots. |
| Run audit | Systems Analyst | `npm audit --audit-level=low` returns no vulnerabilities. |
| Approve go-live | Payroll Owner | No open Critical defects and approved disposition for High defects. |

## Rollback Plan

Keep the prior deployed image or service revision available. If authentication, Workday connectivity, role filtering, or dashboard rendering fails after release, roll back to the last verified image and disable scheduled Workday data refresh until the defect is corrected.

Detailed monitoring, backup, rotation, recovery, and penetration-test procedures are in `docs/Production_Operations_Runbook.md`.

## Final Decision

Proceed with a full-stack Node.js deployment for any real Workday data use. Use static hosting only for public portfolio demonstrations that rely exclusively on synthetic sample data and do not enable backend proxy mode.
