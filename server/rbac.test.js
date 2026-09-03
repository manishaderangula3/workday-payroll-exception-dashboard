import { describe, expect, it } from "vitest";
import { demoDashboardData } from "./demoData.js";
import { applyRoleSecurity } from "./rbac.js";

describe("backend role security", () => {
  it("filters rows to allowed departments before returning dashboard data", () => {
    const scopedData = applyRoleSecurity(demoDashboardData, {
      username: "operations.manager",
      displayName: "Operations Manager",
      role: "department_manager",
      allowedDepartments: ["Operations"],
      allowedCompanies: [],
      allowedPayGroups: []
    });

    expect(scopedData.workers.map((worker) => worker.department)).toEqual(["Operations"]);
    expect(scopedData.payrollResults.every((row) => row.employeeId === "W-2001")).toBe(true);
  });

  it("masks worker detail for finance style roles", () => {
    const scopedData = applyRoleSecurity(demoDashboardData, {
      username: "finance.analyst",
      displayName: "Finance Analyst",
      role: "finance_analyst",
      allowedDepartments: [],
      allowedCompanies: [],
      allowedPayGroups: []
    });

    expect(scopedData.workers[0]).toMatchObject({
      employeeId: "W-2001",
      employeeName: "Worker W-2001",
      managerEmail: "masked@example.com"
    });
  });
});
