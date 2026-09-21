import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const reportDocuments = [
  "reports/Dashboard_Overview.md",
  "reports/Payroll_Cost_Report.md",
  "reports/Overtime_Report.md",
  "reports/Missing_Time_Entries_Report.md",
  "reports/Deduction_Exception_Report.md",
  "reports/Tax_Exception_Report.md"
];

await Promise.all(reportDocuments.map(async (fileName) => {
  const destination = resolve("dist", fileName);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(fileName), destination);
}));
