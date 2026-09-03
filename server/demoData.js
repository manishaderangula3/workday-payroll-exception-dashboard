export const demoDashboardData = {
  workers: [
    {
      employeeId: "W-2001",
      employeeName: "Alex Rivera",
      department: "Operations",
      manager: "Casey Smith",
      managerEmail: "casey.smith@example.com",
      company: "Northstar Services Inc.",
      payGroup: "US Weekly Hourly",
      workerType: "Employee",
      exemptStatus: "Non-Exempt",
      hourlyRate: 35,
      workSchedule: "Mon-Fri, 8hrs",
      location: "Remote - Texas",
      state: "TX",
      active: true
    },
    {
      employeeId: "W-2002",
      employeeName: "Nina Shah",
      department: "Customer Support",
      manager: "Robin Carter",
      managerEmail: "robin.carter@example.com",
      company: "Northstar Services Inc.",
      payGroup: "US Weekly Hourly",
      workerType: "Employee",
      exemptStatus: "Non-Exempt",
      hourlyRate: 29,
      workSchedule: "Mon-Fri, 8hrs",
      location: "Remote - Florida",
      state: "FL",
      active: true
    },
    {
      employeeId: "W-2003",
      employeeName: "Daniel Morgan",
      department: "Finance",
      manager: "Morgan Smith",
      managerEmail: "morgan.smith@example.com",
      company: "Northstar Services Inc.",
      payGroup: "US Semi-Monthly",
      workerType: "Employee",
      exemptStatus: "Exempt",
      hourlyRate: 61,
      workSchedule: "Mon-Fri, 8hrs",
      location: "Chicago HQ",
      state: "IL",
      active: true
    },
    {
      employeeId: "W-2004",
      employeeName: "Priya Thomas",
      department: "Human Resources",
      manager: "Taylor Reed",
      managerEmail: "taylor.reed@example.com",
      company: "Northstar Services Inc.",
      payGroup: "US Semi-Monthly",
      workerType: "Employee",
      exemptStatus: "Exempt",
      hourlyRate: 54,
      workSchedule: "Mon-Fri, 8hrs",
      location: "Chicago HQ",
      state: "IL",
      active: true
    }
  ],
  payrollResults: [
    {
      employeeId: "W-2001",
      payPeriod: "2026-09-15 Semi-Monthly",
      paymentDate: "2026-09-20",
      payrollRun: "PR-2026-09A",
      grossPay: 5000,
      netPay: 3600,
      totalDeductions: 600,
      totalTaxes: 800,
      employerBenefitCost: 450,
      employerTaxCost: 382,
      payrollStatus: "Complete"
    },
    {
      employeeId: "W-2002",
      payPeriod: "2026-09-15 Semi-Monthly",
      paymentDate: "2026-09-20",
      payrollRun: "PR-2026-09A",
      grossPay: 3480,
      netPay: 2520,
      totalDeductions: 420,
      totalTaxes: 540,
      employerBenefitCost: 390,
      employerTaxCost: 266,
      payrollStatus: "Error"
    },
    {
      employeeId: "W-2003",
      payPeriod: "2026-09-15 Semi-Monthly",
      paymentDate: "2026-09-20",
      payrollRun: "PR-2026-09A",
      grossPay: 6100,
      netPay: 4120,
      totalDeductions: 760,
      totalTaxes: 1220,
      employerBenefitCost: 710,
      employerTaxCost: 467,
      payrollStatus: "Complete"
    },
    {
      employeeId: "W-2004",
      payPeriod: "2026-09-15 Semi-Monthly",
      paymentDate: "2026-09-20",
      payrollRun: "PR-2026-09A",
      grossPay: 5400,
      netPay: 3670,
      totalDeductions: 650,
      totalTaxes: 1080,
      employerBenefitCost: 650,
      employerTaxCost: 413,
      payrollStatus: "Pending"
    },
    {
      employeeId: "W-2001",
      payPeriod: "2026-08-31 Semi-Monthly",
      paymentDate: "2026-09-05",
      payrollRun: "PR-2026-08B",
      grossPay: 4550,
      netPay: 3290,
      totalDeductions: 580,
      totalTaxes: 680,
      employerBenefitCost: 450,
      employerTaxCost: 348,
      payrollStatus: "Complete"
    }
  ],
  timeEntries: [
    {
      employeeId: "W-2001",
      payPeriod: "2026-09-15 Semi-Monthly",
      weekEndingDate: "2026-09-15",
      scheduledHours: 40,
      actualHoursWorked: 47,
      regularHours: 40,
      overtimeHours: 7,
      doubleTimeHours: 0,
      submittedDays: 5,
      expectedDays: 5,
      missingDates: [],
      approvedLeaveDates: [],
      lastSubmissionDate: "2026-09-15",
      timeEntryStatus: "Approved"
    },
    {
      employeeId: "W-2002",
      payPeriod: "2026-09-15 Semi-Monthly",
      weekEndingDate: "2026-09-15",
      scheduledHours: 40,
      actualHoursWorked: 24,
      regularHours: 24,
      overtimeHours: 0,
      doubleTimeHours: 0,
      submittedDays: 3,
      expectedDays: 5,
      missingDates: ["2026-09-12", "2026-09-13"],
      approvedLeaveDates: [],
      lastSubmissionDate: "2026-09-11",
      timeEntryStatus: "Submitted"
    }
  ],
  deductionResults: [
    {
      employeeId: "W-2002",
      payPeriod: "2026-09-15 Semi-Monthly",
      payrollRun: "PR-2026-09A",
      deductionName: "Medical PPO Employee",
      deductionCategory: "Medical",
      expectedAmount: 238,
      actualAmount: 0,
      arrearsBalance: 238,
      exceptionType: "Failed"
    }
  ],
  taxResults: [
    {
      employeeId: "W-2002",
      payPeriod: "2026-09-15 Semi-Monthly",
      taxAuthority: "Federal W-4",
      taxFormStatus: "Missing",
      expectedTax: 540,
      actualTax: 0,
      exceptionType: "No Withholding"
    }
  ]
};
