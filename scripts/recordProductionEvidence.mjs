import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { approvalRequirements, recordApproval } from "./productionEvidence.js";

const [area, ...rawOptions] = process.argv.slice(2);
const options = Object.fromEntries(rawOptions.flatMap((option) => {
  const match = option.match(/^--([^=]+)=(.*)$/);
  return match ? [[match[1], match[2]]] : [];
}));

if (!approvalRequirements[area]) {
  console.error(`Usage: npm run evidence:record -- <${Object.keys(approvalRequirements).join("|")}> --name="..." --role="..." --environment="..." --change-ticket="..." --evidence="..."`);
  process.exit(1);
}

const evidencePath = resolve(process.env.PRODUCTION_EVIDENCE_FILE ?? "testing/production-evidence.json");
const evidence = JSON.parse(await readFile(evidencePath, "utf8"));
const updated = recordApproval(evidence, area, {
  name: options.name,
  role: options.role,
  environment: options.environment,
  changeTicket: options["change-ticket"],
  evidence: options.evidence
});
await writeFile(evidencePath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
console.log(`Recorded ${options.role} approval for ${area}. Current status: ${updated[area].status}.`);
