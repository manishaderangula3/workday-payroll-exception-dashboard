import { sanitizeFileName, type CsvRow } from "./csvExport";

export interface WorkbookMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

function displayLabel(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function excelValue(value: CsvRow[string]): string | number | boolean {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value === null || typeof value === "undefined") {
    return "";
  }

  return value;
}

function downloadBlob(fileName: string, bytes: Uint8Array) {
  const link = document.createElement("a");
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const url = URL.createObjectURL(
    new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    })
  );

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function createWorkbookBuffer(
  reportName: string,
  rows: CsvRow[],
  metadata: WorkbookMetadata = {}
): Promise<Uint8Array> {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Payroll Exception Dashboard";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Report", {
    views: [{ state: "frozen", ySplit: Object.keys(metadata).length + 3 }]
  });
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const width = Math.max(columns.length, 1);

  worksheet.mergeCells(1, 1, 1, width);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = reportName;
  titleCell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 16 };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1976D2" } };
  titleCell.alignment = { vertical: "middle" };
  worksheet.getRow(1).height = 28;

  let currentRow = 2;
  Object.entries(metadata).forEach(([key, value]) => {
    worksheet.getCell(currentRow, 1).value = displayLabel(key);
    worksheet.getCell(currentRow, 1).font = { bold: true, color: { argb: "FF475569" } };
    worksheet.getCell(currentRow, 2).value = value === null || typeof value === "undefined" ? "" : String(value);
    currentRow += 1;
  });

  currentRow += 1;
  const headerRow = worksheet.getRow(currentRow);
  headerRow.values = columns.map(displayLabel);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
  headerRow.alignment = { vertical: "middle" };
  headerRow.height = 22;

  rows.forEach((row) => {
    const worksheetRow = worksheet.addRow(columns.map((column) => excelValue(row[column])));
    worksheetRow.eachCell((cell, columnIndex) => {
      const columnName = columns[columnIndex - 1] ?? "";
      if (typeof cell.value === "number" && /(amount|cost|pay|tax|deduction|variance|balance|rate)/i.test(columnName)) {
        cell.numFmt = "$#,##0.00;[Red]-$#,##0.00";
      } else if (typeof cell.value === "number" && /(percent|ratio|rate)/i.test(columnName)) {
        cell.numFmt = "0.00";
      }
      cell.alignment = { vertical: "top", wrapText: true };
    });
  });

  if (columns.length > 0) {
    worksheet.autoFilter = {
      from: { row: currentRow, column: 1 },
      to: { row: currentRow, column: columns.length }
    };
  }

  worksheet.columns.forEach((column, index) => {
    const values = [displayLabel(columns[index] ?? "")]
      .concat(rows.slice(0, 100).map((row) => String(excelValue(row[columns[index] ?? ""]))))
      .map((value) => value.length);
    column.width = Math.min(Math.max(...values, 10) + 2, 36);
  });

  const output = await workbook.xlsx.writeBuffer();
  return new Uint8Array(output as ArrayBuffer);
}

export async function downloadXlsx(
  fileName: string,
  reportName: string,
  rows: CsvRow[],
  metadata: WorkbookMetadata = {}
) {
  const safeName = `${sanitizeFileName(fileName.replace(/\.xlsx$/i, ""))}.xlsx`;
  const bytes = await createWorkbookBuffer(reportName, rows, metadata);
  downloadBlob(safeName, bytes);
}
