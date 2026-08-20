import type { TaxResult } from "../types/dashboard";

export const taxResults: TaxResult[] = [
  {
    employeeId: "W-1003",
    payPeriod: "2026-08-15 Semi-Monthly",
    taxAuthority: "Federal W-4",
    taxFormStatus: "Missing",
    expectedTax: 464,
    actualTax: 0,
    exceptionType: "No Withholding"
  },
  {
    employeeId: "W-1008",
    payPeriod: "2026-08-15 Semi-Monthly",
    taxAuthority: "California State Withholding",
    taxFormStatus: "Expired",
    expectedTax: 142,
    actualTax: 91,
    exceptionType: "Expired Tax Form"
  },
  {
    employeeId: "W-1009",
    payPeriod: "2026-08-15 Semi-Monthly",
    taxAuthority: "Colorado Local Tax",
    taxFormStatus: "Pending Review",
    expectedTax: 74,
    actualTax: 15,
    exceptionType: "Under Withholding"
  },
  {
    employeeId: "W-1011",
    payPeriod: "2026-08-15 Semi-Monthly",
    taxAuthority: "New Jersey / Illinois Work State",
    taxFormStatus: "Pending Review",
    expectedTax: 1024,
    actualTax: 870,
    exceptionType: "Multi-State Issue"
  },
  {
    employeeId: "W-1005",
    payPeriod: "2026-08-15 Semi-Monthly",
    taxAuthority: "Federal W-4",
    taxFormStatus: "Current",
    expectedTax: 1207,
    actualTax: 1207,
    exceptionType: "None"
  }
];
