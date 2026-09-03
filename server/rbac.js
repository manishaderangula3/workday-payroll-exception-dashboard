const roleDefaults = {
  payroll_admin: {
    canExport: true,
    canViewWorkerDetail: true
  },
  payroll_manager: {
    canExport: true,
    canViewWorkerDetail: true
  },
  hris_analyst: {
    canExport: true,
    canViewWorkerDetail: true
  },
  finance_analyst: {
    canExport: true,
    canViewWorkerDetail: false
  },
  department_manager: {
    canExport: false,
    canViewWorkerDetail: true
  },
  read_only_auditor: {
    canExport: true,
    canViewWorkerDetail: false
  }
};

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
  const defaults = roleDefaults[user.role] ?? roleDefaults.read_only_auditor;

  return {
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    allowedDepartments: user.allowedDepartments ?? [],
    allowedCompanies: user.allowedCompanies ?? [],
    allowedPayGroups: user.allowedPayGroups ?? [],
    canViewWorkerDetail: user.canViewWorkerDetail ?? defaults.canViewWorkerDetail,
    canExport: user.canExport ?? defaults.canExport
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
