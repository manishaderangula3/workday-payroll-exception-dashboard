const roleDefaults = {
  payroll_admin: {
    canAcknowledge: true,
    canCreateInboxTask: true,
    canExport: true,
    canTriggerDelivery: true,
    canViewWorkerDetail: true
  },
  payroll_manager: {
    canAcknowledge: true,
    canCreateInboxTask: true,
    canExport: true,
    canTriggerDelivery: true,
    canViewWorkerDetail: true
  },
  hris_analyst: {
    canAcknowledge: true,
    canCreateInboxTask: true,
    canExport: true,
    canTriggerDelivery: false,
    canViewWorkerDetail: true
  },
  finance_analyst: {
    canAcknowledge: false,
    canCreateInboxTask: false,
    canExport: true,
    canTriggerDelivery: false,
    canViewWorkerDetail: false
  },
  department_manager: {
    canAcknowledge: true,
    canCreateInboxTask: true,
    canExport: false,
    canTriggerDelivery: false,
    canViewWorkerDetail: true
  },
  read_only_auditor: {
    canAcknowledge: false,
    canCreateInboxTask: false,
    canExport: true,
    canTriggerDelivery: false,
    canViewWorkerDetail: false
  }
};

export function isSupportedRole(role) {
  return typeof role === "string" && Object.hasOwn(roleDefaults, role);
}

function listIncludes(scope, value) {
  return scope.length === 0 || scope.includes(value);
}

function maskWorker(worker, user) {
  if (user.canViewWorkerDetail) {
    return worker;
  }

  return {
    ...worker,
    employeeName: `Worker ${worker.employeeId}`,
    managerEmail: "masked@example.com",
    location: "Masked"
  };
}

export function publicUser(user) {
  if (!user || !isSupportedRole(user.role)) throw new Error("Unsupported security role");
  const defaults = roleDefaults[user.role];
  const scope = (value, name) => {
    if (typeof value === "undefined") return [];
    if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
      throw new Error(`${name} must be an array of strings`);
    }
    return value;
  };

  return {
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    allowedDepartments: scope(user.allowedDepartments, "allowedDepartments"),
    allowedCompanies: scope(user.allowedCompanies, "allowedCompanies"),
    allowedPayGroups: scope(user.allowedPayGroups, "allowedPayGroups"),
    canAcknowledge: user.canAcknowledge ?? defaults.canAcknowledge,
    canCreateInboxTask: user.canCreateInboxTask ?? defaults.canCreateInboxTask,
    canViewWorkerDetail: user.canViewWorkerDetail ?? defaults.canViewWorkerDetail,
    canExport: user.canExport ?? defaults.canExport,
    canTriggerDelivery: user.canTriggerDelivery ?? defaults.canTriggerDelivery
  };
}

export function applyRoleSecurity(data, rawUser) {
  const user = publicUser(rawUser);
  const scopedWorkers = data.workers
    .filter(
      (worker) =>
        listIncludes(user.allowedDepartments, worker.department) &&
        listIncludes(user.allowedCompanies, worker.company) &&
        listIncludes(user.allowedPayGroups, worker.payGroup)
    )
    .map((worker) => maskWorker(worker, user));
  const visibleWorkerIds = new Set(scopedWorkers.map((worker) => worker.employeeId));

  return {
    workers: scopedWorkers,
    payrollResults: data.payrollResults.filter((row) => visibleWorkerIds.has(row.employeeId)),
    timeEntries: data.timeEntries.filter((row) => visibleWorkerIds.has(row.employeeId)),
    deductionResults: data.deductionResults.filter((row) => visibleWorkerIds.has(row.employeeId)),
    taxResults: data.taxResults.filter((row) => visibleWorkerIds.has(row.employeeId))
  };
}
