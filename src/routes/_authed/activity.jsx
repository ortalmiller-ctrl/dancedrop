import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge from "@/components/admin/StatusBadge";
import { listActivity } from "@/lib/server-fns";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/activity")({
  head: () => ({ meta: [{ title: "Activity · DanceDrop admin" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  const activityFn = useServerFn(listActivity);
  const { data, isLoading, error } = useQuery({
    queryKey: ["activity"],
    queryFn: () => activityFn(),
    refetchInterval: 8000,
    retry: false,
  });

  return (
    <AdminShell>
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every activation, consent change and command, with the actor that caused it.
        </p>
      </div>

      {isLoading && (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading the audit trail…
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {error.message}
        </div>
      )}

      {data && (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-black/[0.07] bg-white">
            <div className="border-b border-black/[0.06] px-5 py-4">
              <p className="font-heading text-sm font-semibold">Event log</p>
            </div>
            <ul className="divide-y divide-black/[0.06]">
              {data.events.length === 0 && (
                <li className="px-5 py-6 text-sm text-muted-foreground">Nothing logged yet.</li>
              )}
              {data.events.map((event) => (
                <li key={event.id} className="flex items-start justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm">{event.message}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {event.device_id || "system"} · {event.actor} · {formatDateTime(event.created_date)}
                    </p>
                  </div>
                  <StatusBadge status="offline" className="shrink-0 bg-[#F4F4F1] text-black/50">
                    {event.event_type.replaceAll("_", " ")}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-black/[0.07] bg-white">
              <div className="border-b border-black/[0.06] px-5 py-4">
                <p className="font-heading text-sm font-semibold">Activation history</p>
              </div>
              <ul className="divide-y divide-black/[0.06]">
                {data.activations.length === 0 && (
                  <li className="px-5 py-6 text-sm text-muted-foreground">No activations yet.</li>
                )}
                {data.activations.map((activation) => (
                  <li key={activation.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to="/devices/$deviceId"
                        params={{ deviceId: activation.device_id }}
                        className="font-mono text-[11px] text-primary hover:underline"
                      >
                        {activation.device_id}
                      </Link>
                      <StatusBadge status={activation.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activation.activation_code} · {activation.os || "unknown"} ·{" "}
                      {formatDateTime(activation.activated_at)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-black/[0.07] bg-white">
              <div className="border-b border-black/[0.06] px-5 py-4">
                <p className="font-heading text-sm font-semibold">Latest commands</p>
              </div>
              <ul className="divide-y divide-black/[0.06]">
                {data.commands.map((command) => (
                  <li key={command.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">
                        {command.command_type === "stop"
                          ? "Stop"
                          : `${command.character_name} · ${command.animation}`}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">{command.device_id}</p>
                    </div>
                    <StatusBadge status={command.status} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}