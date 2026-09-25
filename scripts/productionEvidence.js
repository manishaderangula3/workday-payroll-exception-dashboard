export const approvalRequirements = {
  tenantBuild: { label: "Workday tenant build validation", roles: ["Workday Reporting Lead"] },
  security: { label: "role and row-level security testing", roles: ["Workday Security Administrator"] },
  payrollGl: { label: "payroll-to-GL reconciliation", roles: ["Payroll Manager", "Finance Approver"] },
  performance: { label: "production-volume performance testing", roles: ["Workday Systems Lead"] },
  uat: { label: "business UAT sign-off", roles: ["Payroll Product Owner"] },
  observability: { label: "central logging, monitoring, and alert validation", roles: ["Platform Operations Lead"] },
  backupRestore: { label: "backup and restore validation", roles: ["Platform Data Administrator"] },
  secretRotation: { label: "production secret rotation drill", roles: ["Security Operations Lead"] },
  disasterRecovery: { label: "disaster recovery exercise", roles: ["Platform Operations Lead", "Payroll Product Owner"] },
  penetration: { label: "independent penetration test and remediation review", roles: ["Application Security Lead"] }
};

function validApproval(approval, now) {
  const approvedAt = new Date(approval?.approvedAt ?? "");
  return Boolean(approval?.name && approval?.role && Number.isFinite(approvedAt.getTime()) && approvedAt <= now);
}

export function validateProductionEvidence(evidence, now = new Date()) {
  return Object.entries(approvalRequirements).flatMap(([key, requirement]) => {
    const item = evidence?.[key];
    const missingRoles = requirement.roles.filter(
      (role) => !item?.approvals?.some((approval) => approval.role === role && validApproval(approval, now))
    );
    const missing = [];
    if (item?.status !== "approved") missing.push("status=approved");
    if (!item?.environment) missing.push("environment");
    if (!item?.changeTicket) missing.push("changeTicket");
    if (!item?.evidence) missing.push("evidence");
    if (missingRoles.length > 0) missing.push(`approvals from ${missingRoles.join(" and ")}`);
    return missing.length > 0 ? [`${requirement.label}: requires ${missing.join(", ")}`] : [];
  });
}

export function recordApproval(evidence, key, input, approvedAt = new Date().toISOString()) {
  const requirement = approvalRequirements[key];
  if (!requirement) throw new Error(`Unknown approval area: ${key}`);
  if (!requirement.roles.includes(input.role)) throw new Error(`${key} requires: ${requirement.roles.join(", ")}`);
  for (const field of ["name", "role", "environment", "changeTicket", "evidence"]) {
    if (!String(input[field] ?? "").trim()) throw new Error(`${field} is required`);
  }

  const current = evidence[key] ?? {};
  const approvals = [
    ...(Array.isArray(current.approvals) ? current.approvals.filter((approval) => approval.role !== input.role) : []),
    { name: input.name.trim(), role: input.role, approvedAt }
  ];
  const complete = requirement.roles.every((role) => approvals.some((approval) => approval.role === role));
  return {
    ...evidence,
    [key]: {
      status: complete ? "approved" : "pending",
      environment: input.environment.trim(),
      changeTicket: input.changeTicket.trim(),
      evidence: input.evidence.trim(),
      approvals
    }
  };
}
