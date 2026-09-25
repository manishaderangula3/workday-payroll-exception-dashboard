import { describe, expect, it } from "vitest";
import { approvalRequirements, recordApproval, validateProductionEvidence } from "./productionEvidence.js";

const base = Object.fromEntries(Object.keys(approvalRequirements).map((key) => [key, { status: "pending", approvals: [] }]));

describe("production approval evidence", () => {
  it("rejects empty approval records", () => {
    expect(validateProductionEvidence(base)).toHaveLength(10);
  });

  it("requires both Payroll and Finance approval for reconciliation", () => {
    const fields = { environment: "WD-PROD", changeTicket: "CHG-100", evidence: "evidence://payroll-gl/100" };
    const first = recordApproval(base, "payrollGl", { ...fields, name: "Payroll Owner", role: "Payroll Manager" });
    expect(first.payrollGl.status).toBe("pending");
    const second = recordApproval(first, "payrollGl", { ...fields, name: "Finance Owner", role: "Finance Approver" });
    expect(second.payrollGl.status).toBe("approved");
  });

  it("passes only after every required role has approved", () => {
    const fields = { environment: "WD-PROD", changeTicket: "CHG-200", evidence: "evidence://release/200" };
    const approvals = [
      ["tenantBuild", "Workday Reporting Lead"],
      ["security", "Workday Security Administrator"],
      ["payrollGl", "Payroll Manager"],
      ["payrollGl", "Finance Approver"],
      ["performance", "Workday Systems Lead"],
      ["uat", "Payroll Product Owner"],
      ["observability", "Platform Operations Lead"],
      ["backupRestore", "Platform Data Administrator"],
      ["secretRotation", "Security Operations Lead"],
      ["disasterRecovery", "Platform Operations Lead"],
      ["disasterRecovery", "Payroll Product Owner"],
      ["penetration", "Application Security Lead"]
    ];
    const complete = approvals.reduce(
      (evidence, [area, role]) => recordApproval(evidence, area, { ...fields, name: `${role} Name`, role }),
      base
    );
    expect(validateProductionEvidence(complete)).toEqual([]);
  });
});
