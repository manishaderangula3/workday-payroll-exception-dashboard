import { randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

function auditFilePath() {
  return resolve(process.env.DATA_DIR ?? ".data", "audit-events.jsonl");
}

export async function appendAuditEvent(event) {
  const record = {
    id: randomUUID(),
    occurredAt: new Date().toISOString(),
    ...event
  };
  const filePath = auditFilePath();
  await mkdir(dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o600 });
  return record;
}

export async function readAuditEvents() {
  try {
    const contents = await readFile(auditFilePath(), "utf8");
    return contents
      .split(/\r?\n/)
      .filter(Boolean)
      .flatMap((line) => {
        try {
          return [JSON.parse(line)];
        } catch {
          return [];
        }
      });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
}
