import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const evidencePath = resolve(process.env.PRODUCTION_EVIDENCE_FILE ?? "testing/production-evidence.json");
const requiredApprovals = [
  ["tenantBuild", "Workday tenant build validation"],
  ["security", "role and row-level security testing"],
  ["payrollGl", "payroll-to-GL reconciliation"],
  ["performance", "production-volume performance testing"],
  ["uat", "business UAT sign-off"]
];

let evidence;
try {
  evidence = JSON.parse(await readFile(evidencePath, "utf8"));
} catch (error) {
  console.error(`Production readiness evidence could not be read from ${evidencePath}.`);
  process.exitCode = 1;
  throw error;
}

const failures = requiredApprovals.flatMap(([key, label]) => {
  const item = evidence[key];
  if (item?.status === "approved" && item.approvedBy && item.approvedAt && item.evidence) return [];
  return [`${label}: requires status=approved, approvedBy, approvedAt, and evidence`];
});

if (failures.length > 0) {
  console.error("Production release blocked:\n- " + failures.join("\n- "));
  process.exitCode = 1;
} else {
  console.log(`Production evidence gate passed (${evidencePath}).`);
}
