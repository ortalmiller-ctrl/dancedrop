import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  ArrowRight,
  CircleSlash,
  Download,
  Loader2,
  MonitorSmartphone,
  PlayCircle,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { getOverview } from "@/lib/server-fns";
import { formatDateTime, formatUntil } from "@/lib/format";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({ meta: [{ title: "Overview · DanceDrop admin" }] }),
  component: OverviewPage,
});

function OverviewPage() {
  const overview = useServerFn(getOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["overview"],
    queryFn: () => overview(),
    refetchInterval: 6000,
    retry: false,
  });

  return (
    <AdminShell>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Control center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every device, every consent state, every command in flight.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live · refreshes every 6s
        </span>
      </div>

      {isLoading && (
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading the network…
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {error.message}
        </div>
      )}

      {data && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Registered devices" value={data.total} icon={MonitorSmartphone} hint={`${data.consenting} consenting`} />
            <StatCard label="Online now" value={data.online} icon={Wifi} tone="dark" hint="Heartbeat within 75s" />
            <StatCard label="Offline" value={data.offline} icon={CircleSlash} hint="No heartbeat right now" />
            <StatCard label="Active animations" value={data.activeAnimations} icon={PlayCircle} hint="Delivered and running" />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-black/[0.07] bg-white px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Consent pending</p>
              <p className="mt-1 font-heading text-lg font-semibold">{data.pendingConsent}</p>
            </div>
            <div className="rounded-2xl border border-black/[0.07] bg-white px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Revoked</p>
              <p className="mt-1 font-heading text-lg font-semibold">{data.revoked}</p>
            </div>
            <div className="rounded-2xl border border-black/[0.07] bg-white px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Downloads logged</p>
              <p className="mt-1 font-heading text-lg font-semibold">{data.downloads}</p>
            </div>
            <div className="rounded-2xl border border-black/[0.07] bg-white px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Recent activations</p>
              <p className="mt-1 font-heading text-lg font-semibold">{data.activations.length}</p>
            </div>
          </div>

          {data.total === 0 && (
            <div className="mt-6 rounded-2xl border border-black/[0.07] bg-white px-6 py-10 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#FAFAF8]">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </span>
              <p className="mt-4 font-heading text-lg font-semibold">No devices on the network yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Open the browser companion in another tab and press activate. It registers with its own
                device ID and activation code, and shows up here within one heartbeat.
              </p>
              <Link
                to="/preview"
                target="_blank"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white"
              >
                Activate a browser device <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.07] bg-white">
              <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
                <p className="font-heading text-sm font-semibold">Animations in flight</p>
                <Activity className="h-4 w-4 text-black/25" />
              </div>
              <div className="divide-y divide-black/[0.06]">
                {data.activeCommands.length === 0 && (
                  <p className="px-5 py-6 text-sm text-muted-foreground">Nothing playing right now.</p>
                )}
                {data.activeCommands.map((command) => (
                  <div key={command.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium">{command.device_nickname}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {command.character_name} · {command.animation}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={command.status} />
                      <p className="mt-1 text-[10px] text-muted-foreground">{formatUntil(command.expires_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-black/[0.07] bg-white">
              <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
                <p className="font-heading text-sm font-semibold">Activation history</p>
                <Download className="h-4 w-4 text-black/25" />
              </div>
              <div className="divide-y divide-black/[0.06]">
                {data.activations.length === 0 && (
                  <p className="px-5 py-6 text-sm text-muted-foreground">No activations yet.</p>
                )}
                {data.activations.map((activation) => (
                  <div key={activation.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium">{activation.nickname || activation.device_id}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {activation.device_id} · {activation.activation_code}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={activation.status} />
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatDateTime(activation.activated_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-black/[0.07] bg-white">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
              <p className="font-heading text-sm font-semibold">Recent devices</p>
              <Link to="/devices" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-black/[0.06]">
              {data.devices.map((device) => (
                <Link
                  key={device.id}
                  to="/devices/$deviceId"
                  params={{ deviceId: device.device_id }}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#FAFAF8]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{device.nickname}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{device.device_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={device.consent_status} />
                    <StatusBadge status={device.online ? "online" : "offline"} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}