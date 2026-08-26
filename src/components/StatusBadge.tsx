type BadgeTone = "green" | "amber" | "red" | "slate" | "blue";

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  green: "bg-green-50 text-green-700 ring-green-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  slate: "bg-slate-100 text-slate-700 ring-slate-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20"
};

export function StatusBadge({ label, tone = "slate" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}
