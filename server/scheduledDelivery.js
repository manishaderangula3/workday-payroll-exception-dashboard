import { createHash, randomUUID } from "node:crypto";
import { createReportExport } from "./reportExport.js";

function uniqueCount(values) {
  return new Set(values).size;
}

export function latestPayPeriod(data) {
  const periods = data.payrollResults
    .filter((row) => row.payPeriod)
    .map((row) => ({ payPeriod: row.payPeriod, date: row.paymentDate ?? "" }))
    .sort((a, b) => b.date.localeCompare(a.date) || b.payPeriod.localeCompare(a.payPeriod));
  return periods[0]?.payPeriod ?? "";
}

export function buildDeliverySummary(data, payPeriod = latestPayPeriod(data)) {
  const forPeriod = (rows) => rows.filter((row) => row.payPeriod === payPeriod);
  const payroll = forPeriod(data.payrollResults);
  const timeEntries = forPeriod(data.timeEntries);
  const deductions = forPeriod(data.deductionResults);
  const taxes = forPeriod(data.taxResults);
  const effectiveMissing = timeEntries.filter((entry) => {
    const leave = new Set(entry.approvedLeaveDates ?? []);
    const holidays = new Set(entry.holidayDates ?? []);
    const submitted = new Set(entry.submittedWorkDates ?? []);
    const candidates = entry.expectedWorkDates?.length
      ? entry.expectedWorkDates.filter((date) => !submitted.has(date))
      : entry.missingDates ?? [];
    return candidates.some((date) => !leave.has(date) && !holidays.has(date));
  });

  return {
    workers: data.workers.filter((worker) => worker.active).length,
    payrollErrors: uniqueCount(payroll.filter((row) => row.payrollStatus === "Error").map((row) => row.employeeId)),
    overtimeExceptions: uniqueCount(timeEntries.filter((row) => row.overtimeHours > 0).map((row) => row.employeeId)),
    missingTimeExceptions: uniqueCount(effectiveMissing.map((row) => row.employeeId)),
    deductionExceptions: uniqueCount(deductions.filter((row) => row.exceptionType !== "None").map((row) => row.employeeId)),
    taxExceptions: uniqueCount(taxes.filter((row) => row.exceptionType !== "None").map((row) => row.employeeId))
  };
}

async function readProviderReceipt(response) {
  let body = {};
  try {
    if (typeof response.json === "function") body = await response.json();
  } catch {
    body = {};
  }
  return {
    providerReceiptId:
      body.receiptId ?? body.deliveryId ?? body.messageId ?? body.id ?? response.headers?.get?.("x-delivery-id") ?? null,
    status: String(body.status ?? "accepted"),
    acceptedAt: String(body.acceptedAt ?? new Date().toISOString()),
    httpStatus: response.status ?? 200
  };
}

export async function sendScheduledDelivery(data, options = {}) {
  const webhookUrl = options.webhookUrl ?? process.env.REPORT_DELIVERY_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("REPORT_DELIVERY_WEBHOOK_URL is not configured");
  const parsedUrl = new URL(webhookUrl);
  if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
    throw new Error("REPORT_DELIVERY_WEBHOOK_URL must use HTTPS in production");
  }

  const payPeriod = options.payPeriod ?? process.env.REPORT_DELIVERY_PAY_PERIOD ?? latestPayPeriod(data);
  if (!payPeriod) throw new Error("No payroll period is available for scheduled delivery");
  const deliveryId = randomUUID();
  const generatedAt = new Date().toISOString();
  const appUrl = options.appUrl ?? process.env.PUBLIC_APP_URL ?? "http://127.0.0.1:8787";
  const report = await createReportExport(
    {
      reportType: "readiness",
      filters: {
        payPeriod,
        company: "All Companies",
        payGroup: "All Pay Groups",
        department: "All Departments"
      }
    },
    data,
    "Scheduled Delivery"
  );
  const maxAttachmentBytes = Number(process.env.REPORT_DELIVERY_MAX_ATTACHMENT_BYTES ?? 5 * 1024 * 1024);
  if (!Number.isFinite(maxAttachmentBytes) || maxAttachmentBytes < 1024) {
    throw new Error("REPORT_DELIVERY_MAX_ATTACHMENT_BYTES must be at least 1024");
  }
  if (report.buffer.length > maxAttachmentBytes) throw new Error("Scheduled report attachment exceeds the configured size limit");
  const attachment = {
    fileName: report.fileName,
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    contentBase64: report.buffer.toString("base64")
  };
  const payload = {
    deliveryId,
    subject: `Payroll Exception Dashboard - ${payPeriod}`,
    generatedAt,
    payPeriod,
    recipients: String(process.env.REPORT_DELIVERY_RECIPIENTS ?? "").split(",").map((item) => item.trim()).filter(Boolean),
    dashboardUrl: `${appUrl.replace(/\/$/, "")}/?tab=readiness`,
    receiptCallbackUrl: `${appUrl.replace(/\/$/, "")}/api/delivery/receipt`,
    summary: buildDeliverySummary(data, payPeriod),
    attachments: [attachment]
  };
  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.REPORT_DELIVERY_SECRET ? { "X-Delivery-Secret": process.env.REPORT_DELIVERY_SECRET } : {})
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`Delivery webhook failed with status ${response.status}`);
  const receipt = await readProviderReceipt(response);
  const requireReceipt = options.requireReceipt ?? process.env.REPORT_DELIVERY_REQUIRE_RECEIPT === "true";
  if (requireReceipt && !receipt.providerReceiptId) throw new Error("Delivery webhook did not return a receipt identifier");

  return {
    deliveryId,
    generatedAt,
    payPeriod,
    recipients: payload.recipients,
    dashboardUrl: payload.dashboardUrl,
    summary: payload.summary,
    attachment: {
      fileName: report.fileName,
      contentType: attachment.contentType,
      sizeBytes: report.buffer.length,
      sha256: createHash("sha256").update(report.buffer).digest("hex")
    },
    receipt
  };
}

export function startScheduledDelivery(loadData, onDelivered) {
  const intervalMinutes = Number(process.env.REPORT_DELIVERY_INTERVAL_MINUTES ?? 0);
  if (!process.env.REPORT_DELIVERY_WEBHOOK_URL || !Number.isFinite(intervalMinutes) || intervalMinutes < 15) return null;

  const timer = setInterval(async () => {
    try {
      const { data } = await loadData();
      const delivery = await sendScheduledDelivery(data);
      await onDelivered?.(delivery);
    } catch (error) {
      console.error("Scheduled report delivery failed:", error instanceof Error ? error.message : error);
    }
  }, intervalMinutes * 60_000);
  timer.unref();
  return timer;
}
