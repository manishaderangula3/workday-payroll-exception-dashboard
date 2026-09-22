import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateProductionEvidence } from "./productionEvidence.js";

const evidencePath = resolve(process.env.PRODUCTION_EVIDENCE_FILE ?? "testing/production-evidence.json");

let evidence;
try {
  evidence = JSON.parse(await readFile(evidencePath, "utf8"));
} catch (error) {
  console.error(`Production readiness evidence could not be read from ${evidencePath}.`);
  process.exitCode = 1;
  throw error;
}

const failures = validateProductionEvidence(evidence);

if (failures.length > 0) {
  console.error("Production release blocked:\n- " + failures.join("\n- "));
  process.exitCode = 1;
} else {
  console.log(`Production evidence gate passed (${evidencePath}).`);
}
