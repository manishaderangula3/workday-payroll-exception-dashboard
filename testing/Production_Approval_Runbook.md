# Production Approval Runbook

## Purpose

The production gate represents executed Workday tenant validation, not documentation completion. Evidence remains `pending` until an authorized stakeholder reviews results and records approval.

## Required Approvals

| Area | Required Approver Role | Required Evidence |
| --- | --- | --- |
| Tenant build | Workday Reporting Lead | Tenant report/calculated-field results and migration ticket |
| Security | Workday Security Administrator | Role, row, field, direct-link, and export-security results |
| Payroll/GL | Payroll Manager and Finance Approver | Signed control-total reconciliation with explained variances |
| Performance | Workday Systems Lead | Production-volume timings against approved targets |
| UAT | Payroll Product Owner | Completed UAT results and accepted defect disposition |

## Recording Evidence

Run this only after the named role has reviewed the linked evidence:

```powershell
npm run evidence:record -- security --name="Approver Name" --role="Workday Security Administrator" --environment="WD-PROD" --change-ticket="CHG-12345" --evidence="evidence://security/CHG-12345"
```

Payroll/GL reconciliation requires two commands: one with `--role="Payroll Manager"` and one with `--role="Finance Approver"`. It remains pending until both are recorded.

Run `npm run validate:production` for the release decision. Never replace pending records with invented names, dates, or evidence.
