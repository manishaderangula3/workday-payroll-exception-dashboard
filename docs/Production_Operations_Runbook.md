# Production Operations Runbook

## Scope

This runbook defines the application controls and hosting evidence required for the live Payroll Exception Dashboard. The application emits operational signals; the approved hosting platform owns collection, retention, paging, backup, recovery, and independent security testing.

## Observability

| Control | Application Behavior | Hosting Requirement |
| --- | --- | --- |
| Central logs | Writes one redacted JSON event per request to stdout/stderr with request ID, route, status, and duration. | Forward container/application logs to the central sink named by `CENTRAL_LOG_SINK_REFERENCE`; restrict payroll-log access and apply approved retention. |
| Correlation | Accepts a safe `X-Request-ID` or generates a UUID and returns it in the response. | Preserve the request ID through the reverse proxy, alert platform, and support ticket. |
| Health | `/api/health` reports process and configuration state without secrets. | Probe every minute; alert after three consecutive failures. |
| Readiness | `/api/readiness` returns `503` when required live configuration is incomplete. | Remove unready instances from traffic. |
| Metrics | Authenticated `/api/metrics` returns request counts, server errors, average latency, route metrics, uptime, and memory. | Poll with `Authorization: Bearer MONITORING_TOKEN`; do not expose the token or endpoint publicly. |
| Alerts | Unexpected backend and scheduled-delivery failures post a redacted event to `ALERT_WEBHOOK_URL`. | Route Critical/High events to the payroll systems on-call group and link `ALERT_RUNBOOK_URL`. |

Recommended alerts:

| Signal | Threshold | Severity |
| --- | --- | --- |
| Readiness failures | 3 consecutive probes | Critical |
| HTTP 5xx rate | More than 2% for 5 minutes | High |
| Dashboard p95 latency | More than 10 seconds for 10 minutes | High |
| Scheduled delivery failure | Any production failure | High |
| Memory | More than 85% of instance limit for 10 minutes | High |
| No request/log heartbeat | 10 minutes during expected service hours | High |

## Backup Validation

The application is stateless except for the approved durable audit/event platform. Back up the audit data, platform configuration, deployment manifest, and secret references according to `AUDIT_BACKUP_POLICY_REFERENCE`.

1. Restore the latest backup into an isolated recovery environment.
2. Confirm event counts, newest and oldest timestamps, delivery receipts, and acknowledgement records.
3. Verify encryption, access controls, retention, and immutable identifiers.
4. Measure the achieved recovery point and restore duration against `DR_RPO_MINUTES` and `DR_RTO_MINUTES`.
5. Store the restore report in the approved evidence system.
6. Record `backupRestore` approval only after the Platform Data Administrator reviews the evidence.

Run restore tests at least quarterly and after material storage changes.

## Secret Rotation

Store secrets only in the hosting secret manager. Rotate Workday credentials, audit tokens, monitoring tokens, webhook secrets, and session secrets at or before `SECRET_ROTATION_MAX_AGE_DAYS`.

1. Create the replacement secret and update the dependent external service.
2. For session and delivery callback secrets, place the old value in `SESSION_SECRET_PREVIOUS` or `REPORT_DELIVERY_SECRET_PREVIOUS` and the replacement in the primary variable.
3. Restart instances and validate authentication, callback receipts, metrics, alerts, Workday reads, and audit writes.
4. Remove the previous value after the approved overlap window.
5. Update `SECRETS_ROTATED_AT`, retain the rotation ticket, and run `npm run validate:config`.
6. Record `secretRotation` approval after Security Operations verifies the retired credential no longer works.

Never log, attach, or place actual secret values in evidence.

## Disaster Recovery

1. Declare the exercise or incident and start the recovery clock.
2. Deploy the last approved image into the recovery region/environment.
3. Resolve secret-manager references and restore or reconnect the durable audit platform.
4. Validate `/api/readiness`, Entra authentication, role scoping, Workday connectivity, exports, Inbox actions, scheduled delivery, audit writes, metrics, and alert routing.
5. Reconcile a controlled payroll period before opening traffic.
6. Record actual RTO/RPO, data loss, failed checks, and remediation owners.
7. Obtain Platform Operations and Payroll Product Owner approval before closing the exercise.

Exercise recovery at least annually and after material architecture changes. Keep DNS/routing and rollback procedures in the hosting platform runbook referenced by `DISASTER_RECOVERY_PLAN_REFERENCE`.

## Penetration Testing

An independent authorized tester must assess the deployed environment, including Entra/Easy Auth boundaries, direct API access, RBAC and export controls, file upload handling, SSRF exposure, webhook authentication, secret leakage, security headers, dependency risk, rate limiting, and audit tampering.

- Test only under an approved scope and change window.
- Do not use real payroll data unless explicitly authorized.
- Resolve Critical and High findings before release unless the risk owner grants documented acceptance.
- Retest remediated findings and retain the final report under `PENETRATION_TEST_POLICY_REFERENCE`.
- Record `penetration` approval only after Application Security reviews the final report.

## Release Gate

Run both commands in the target environment:

```powershell
npm run validate:config
npm run validate:production
```

The first validates operational configuration without exposing secrets. The second remains blocked until tenant, security, reconciliation, performance, UAT, observability, backup/restore, rotation, disaster-recovery, and penetration-test evidence has genuine approval.
