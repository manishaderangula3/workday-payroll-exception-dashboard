import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ actionLabel, message, onAction, title }: EmptyStateProps) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-panel">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-600">
        <SearchX className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-workday-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">{message}</p>
      {actionLabel && onAction ? (
        <button
          className="mt-5 rounded-md bg-workday-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-workday-blue focus:ring-offset-2"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
