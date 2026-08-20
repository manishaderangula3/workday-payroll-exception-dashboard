import type { PayrollStatus, Severity } from "../types/dashboard";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1
});

const numberFormatter = new Intl.NumberFormat("en-US");

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatHours(value: number): string {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)} hrs`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatVariancePercent(current: number, prior: number): string {
  if (prior === 0) {
    return "No prior period";
  }

  const variance = (current - prior) / prior;
  const sign = variance >= 0 ? "+" : "";
  return `${sign}${formatPercent(variance)} vs prior period`;
}

export function formatDateShort(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

export function getStatusSeverity(status: PayrollStatus): Severity {
  if (status === "Complete") {
    return "success";
  }

  if (status === "Error") {
    return "critical";
  }

  if (status === "Pending") {
    return "warning";
  }

  return "neutral";
}
