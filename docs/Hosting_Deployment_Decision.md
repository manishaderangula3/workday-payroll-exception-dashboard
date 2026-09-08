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
| Public traffic | HTTPS reverse proxy or platform TLS |
| Workday traffic | Backend-only outbound HTTPS to Workday RaaS/API endpoints |
| Credentials | Runtime secret store only, never frontend code |

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
| `AUTH_USERS_JSON` | Production yes | Defines approved users, roles, and security scopes. |
| `WORKDAY_*_URL` | Production yes | RaaS/API report endpoints for workers, payroll, time, deductions, and tax. |
| `WORKDAY_BEARER_TOKEN` or `WORKDAY_USERNAME`/`WORKDAY_PASSWORD` | Production yes | Backend-only Workday authentication. |

## Container Deployment

The repository includes a portable `Dockerfile` for Node-capable hosts.

```bash
docker build -t workday-payroll-dashboard .
docker run --env-file .env -p 8787:8787 workday-payroll-dashboard
```

The container serves the compiled dashboard and API proxy together. In production, use the host platform's secret manager instead of a local `.env` file.

## Release Checklist

| Step | Owner | Completion Criteria |
| --- | --- | --- |
| Build app | Reporting/Systems Analyst | `npm run build` succeeds. |
| Configure secrets | IT/Security | Required runtime variables are present in the host secret store. |
| Configure Workday reports | Workday Reporting Analyst | RaaS/API URLs return expected datasets to the backend. |
| Validate authentication | HRIS/IT | Users can sign in and sessions use HTTP-only secure cookies. |
| Validate role security | Payroll/HRIS/Security | Manager, HR Partner, Finance, and Payroll Admin scopes return only authorized rows. |
| Run visual regression | Reporting Analyst | `npm run test:visual` passes against approved screenshots. |
| Run audit | Systems Analyst | `npm audit --audit-level=low` returns no vulnerabilities. |
| Approve go-live | Payroll Owner | No open Critical defects and approved disposition for High defects. |

## Rollback Plan

Keep the prior deployed image or service revision available. If authentication, Workday connectivity, role filtering, or dashboard rendering fails after release, roll back to the last verified image and disable scheduled Workday data refresh until the defect is corrected.

## Final Decision

Proceed with a full-stack Node.js deployment for any real Workday data use. Use static hosting only for public portfolio demonstrations that rely exclusively on synthetic sample data and do not enable backend proxy mode.
