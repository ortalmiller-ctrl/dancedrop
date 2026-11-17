import { cn } from "@/lib/utils";

const VARIANTS = {
  online: "bg-emerald-100 text-emerald-700",
  offline: "bg-black/[0.06] text-black/50",
  granted: "bg-emerald-100 text-emerald-700",
  revoked: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-800",
  delivered: "bg-blue-100 text-blue-700",
  acknowledged: "bg-violet-100 text-violet-700",
  completed: "bg-emerald-100 text-emerald-700",
  expired: "bg-black/[0.06] text-black/45",
  stopped: "bg-black/[0.06] text-black/45",
  rejected: "bg-red-100 text-red-700",
  desktop: "bg-blue-100 text-blue-700",
  browser: "bg-violet-100 text-violet-700",
};

export default function StatusBadge({ status, children, className }) {
  const key = String(status || "").toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
        VARIANTS[key] || "bg-black/[0.06] text-black/50",
        className
      )}
    >
      {children || key}
    </span>
  );
}