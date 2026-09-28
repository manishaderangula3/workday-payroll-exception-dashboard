import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const assetsDir = resolve("dist/assets");
const files = await readdir(assetsDir);
const budgets = [
  { label: "application", pattern: /^index-.*\.js$/, raw: 230_000, gzip: 60_000 },
  { label: "charts", pattern: /^charts-.*\.js$/, raw: 600_000, gzip: 180_000 },
  { label: "Excel (lazy)", pattern: /^exceljs.*\.js$/, raw: 1_000_000, gzip: 300_000 }
];
const failures = [];
const measurements = [];

for (const budget of budgets) {
  const fileName = files.find((file) => budget.pattern.test(file));
  if (!fileName) {
    failures.push(`${budget.label} chunk was not found`);
    continue;
  }
  const contents = await readFile(resolve(assetsDir, fileName));
  const measurement = { label: budget.label, fileName, rawBytes: contents.length, gzipBytes: gzipSync(contents).length };
  measurements.push(measurement);
  if (measurement.rawBytes > budget.raw) failures.push(`${budget.label} raw size ${measurement.rawBytes} exceeds ${budget.raw}`);
  if (measurement.gzipBytes > budget.gzip) failures.push(`${budget.label} gzip size ${measurement.gzipBytes} exceeds ${budget.gzip}`);
}

const html = await readFile(resolve("dist/index.html"), "utf8");
const initialFiles = [...html.matchAll(/(?:src|href)="\/assets\/([^"]+\.js)"/g)].map((match) => match[1]);
const initialGzipBytes = measurements
  .filter((measurement) => initialFiles.includes(measurement.fileName))
  .reduce((total, measurement) => total + measurement.gzipBytes, 0);
if (initialGzipBytes > 250_000) failures.push(`initial JavaScript gzip size ${initialGzipBytes} exceeds 250000`);

console.table(measurements.map(({ label, fileName, rawBytes, gzipBytes }) => ({ label, fileName, rawBytes, gzipBytes })));
console.log(`Initial JavaScript gzip bytes: ${initialGzipBytes}`);
if (failures.length) {
  console.error(`Bundle budget failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("Bundle budget passed.");
}
