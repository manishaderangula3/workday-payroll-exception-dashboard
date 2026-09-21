function uniqueCount(values) {
  return new Set(values).size;
}

export function buildDeliverySummary(data) {
  const effectiveMissing = data.timeEntries.filter((entry) => {
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
    payrollErrors: uniqueCount(data.payrollResults.filter((row) => row.payrollStatus === "Error").map((row) => row.employeeId)),
    overtimeExceptions: uniqueCount(data.timeEntries.filter((row) => row.overtimeHours > 0).map((row) => row.employeeId)),
    missingTimeExceptions: uniqueCount(effectiveMissing.map((row) => row.employeeId)),
    deductionExceptions: uniqueCount(data.deductionResults.filter((row) => row.exceptionType !== "None").map((row) => row.employeeId)),
    taxExceptions: uniqueCount(data.taxResults.filter((row) => row.exceptionType !== "None").map((row) => row.employeeId))
  };
}

export async function sendScheduledDelivery(data, options = {}) {
  const webhookUrl = options.webhookUrl ?? process.env.REPORT_DELIVERY_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("REPORT_DELIVERY_WEBHOOK_URL is not configured");
  const parsedUrl = new URL(webhookUrl);
  if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
    throw new Error("REPORT_DELIVERY_WEBHOOK_URL must use HTTPS in production");
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const appUrl = options.appUrl ?? process.env.PUBLIC_APP_URL ?? "http://127.0.0.1:8787";
  const payload = {
    subject: "Payroll Exception Dashboard scheduled summary",
    generatedAt: new Date().toISOString(),
    recipients: String(process.env.REPORT_DELIVERY_RECIPIENTS ?? "").split(",").map((item) => item.trim()).filter(Boolean),
    dashboardUrl: `${appUrl.replace(/\/$/, "")}/?tab=readiness`,
    summary: buildDeliverySummary(data)
  };
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
  return payload;
}

export function startScheduledDelivery(loadData, onDelivered) {
  const intervalMinutes = Number(process.env.REPORT_DELIVERY_INTERVAL_MINUTES ?? 0);
  if (!process.env.REPORT_DELIVERY_WEBHOOK_URL || !Number.isFinite(intervalMinutes) || intervalMinutes < 15) return null;

  const timer = setInterval(async () => {
    try {
      const { data } = await loadData();
      const payload = await sendScheduledDelivery(data);
      await onDelivered?.(payload);
    } catch (error) {
      console.error("Scheduled report delivery failed:", error instanceof Error ? error.message : error);
    }
  }, intervalMinutes * 60_000);
  timer.unref();
  return timer;
}
