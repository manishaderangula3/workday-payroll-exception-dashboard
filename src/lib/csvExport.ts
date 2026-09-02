type CsvValue = boolean | number | string | null | undefined | CsvValue[];

export type CsvRow = Record<string, CsvValue>;
export type CsvMetadata = Record<string, boolean | number | string | null | undefined>;

function escapeCsvValue(value: CsvValue): string {
  if (Array.isArray(value)) {
    return escapeCsvValue(value.join("; "));
  }

  if (value === null || typeof value === "undefined") {
    return "";
  }

  const stringValue = String(value);
  const safeStringValue = /^[=+\-@\t\r]/.test(stringValue) ? `'${stringValue}` : stringValue;
  const escapedValue = safeStringValue.replace(/"/g, '""');

  return /[",\n\r]/.test(escapedValue) ? `"${escapedValue}"` : escapedValue;
}

export function buildCsvContent(rows: CsvRow[], metadata: CsvMetadata = {}): string {
  const metadataLines = Object.entries(metadata).map(
    ([key, value]) => `${escapeCsvValue(key)},${escapeCsvValue(value)}`
  );

  if (rows.length === 0) {
    return [...metadataLines, "", "No rows"].join("\n");
  }

  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(escapeCsvValue).join(",");
  const dataLines = rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(","));

  return [...metadataLines, "", headerLine, ...dataLines].join("\n");
}

export function sanitizeFileName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function downloadCsv(fileName: string, rows: CsvRow[], metadata: CsvMetadata = {}): void {
  const csvContent = buildCsvContent(rows, metadata);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
