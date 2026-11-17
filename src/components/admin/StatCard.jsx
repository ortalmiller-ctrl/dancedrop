import { cn } from "@/lib/utils";

export default function StatCard({ label, value, hint, icon: Icon, tone = "light" }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        tone === "dark" ? "border-transparent bg-[#0B0B0C] text-white" : "border-black/[0.07] bg-white"
      )}
    >
      <div className="flex items-start justify-between">
        <p
          className={cn(
            "text-[10px] uppercase tracking-[0.2em]",
            tone === "dark" ? "text-white/45" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        {Icon && (
          <Icon
            className={cn("h-4 w-4", tone === "dark" ? "text-primary" : "text-black/25")}
          />
        )}
      </div>
      <p className={cn("mt-3 font-heading text-3xl font-bold tabular-nums", tone === "dark" && "text-white")}>
        {value}
      </p>
      {hint && (
        <p className={cn("mt-1 text-xs", tone === "dark" ? "text-white/40" : "text-muted-foreground")}>{hint}</p>
      )}
    </div>
  );
}