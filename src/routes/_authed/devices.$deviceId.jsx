import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShieldOff, TriangleAlert } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import StatusBadge from "@/components/admin/StatusBadge";
import DeviceControls from "@/components/admin/DeviceControls";
import DeviceStatusPanel from "@/components/admin/DeviceStatusPanel";
import { getDevice, listCharacters, revokeDevice } from "@/lib/server-fns";
import { formatDateTime, formatRelative, formatResolution } from "@/lib/format";
import useRealtimeRefresh from "@/hooks/useRealtimeRefresh";

export const Route = createFileRoute("/_authed/devices/$deviceId")({
  head: () => ({ meta: [{ title: "Device control · DanceDrop admin" }] }),
  component: DeviceDetailPage,
});

function DeviceDetailPage() {
  const { deviceId } = Route.useParams();
  const queryClient = useQueryClient();

  const getDeviceFn = useServerFn(getDevice);
  const charactersFn = useServerFn(listCharacters);
  const revokeFn = useServerFn(revokeDevice);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["device", deviceId],
    queryFn: () => getDeviceFn({ data: { deviceId } }),
    refetchInterval: 5000,
    retry: false,
  });

  const charactersQuery = useQuery({
    queryKey: ["characters"],
    queryFn: () => charactersFn(),
    staleTime: 60_000,
  });

  useRealtimeRefresh([["device", deviceId], ["overview"], ["devices"]]);

  const revokeMutation = useMutation({
    mutationFn: () => revokeFn({ data: { deviceId } }),
    onSuccess: () => {
      toast.success("Device authorization revoked.");
      queryClient.invalidateQueries({ queryKey: ["device", deviceId] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const device = data?.device;

  return (
    <AdminShell>
      <Link to="/devices" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All devices
      </Link>

      {isLoading && (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading device…
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {error.message}
        </div>
      )}

      {!isLoading && !error && !device && (
        <div className="mt-6 rounded-2xl border border-black/[0.07] bg-white px-6 py-12 text-center">
          <p className="font-heading text-lg font-semibold">Device not found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing is registered under {deviceId}. Check the ID or search the device list.
          </p>
          <Link to="/devices" className="mt-5 inline-flex rounded-full bg-[#0B0B0C] px-5 py-2.5 text-sm text-white">
            Back to devices
          </Link>
        </div>
      )}

      {device && (
        <>
          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-bold tracking-tight">{device.nickname}</h1>
                <StatusBadge status={device.online ? "online" : "offline"} />
                <StatusBadge status={device.consent_status} />
                <StatusBadge status={device.client_type} />
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {device.device_id} · code {device.activation_code}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={() => refetch()}
                className="min-h-11 touch-manipulation rounded-full border border-black/12 bg-white px-4 text-xs font-medium hover:border-black/30"
              >
                Refresh
              </button>
              <button
                type="button"
                disabled={revokeMutation.isPending || device.revoked}
                onClick={() => {
                  if (window.confirm(`Revoke ${device.nickname}? It will have to activate again to receive anything.`)) {
                    revokeMutation.mutate();
                  }
                }}
                className="inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 text-xs font-medium text-red-700 hover:border-red-300 disabled:opacity-40"
              >
                <ShieldOff className="h-3.5 w-3.5" /> Revoke authorization
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl border border-black/[0.07] bg-white px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">OS</p>
              <p className="mt-1 text-sm capitalize">{device.os}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Screen</p>
              <p className="mt-1 font-mono text-sm">
                {formatResolution(device.screen_width, device.screen_height)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Last seen</p>
              <p className="mt-1 text-sm">{formatRelative(device.last_seen)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Activated</p>
              <p className="mt-1 text-sm">{formatDateTime(device.created_date)}</p>
            </div>
          </div>

          {device.revoked && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
              <TriangleAlert className="h-3.5 w-3.5" /> This device is disconnected and cannot receive commands.
            </p>
          )}

          <div className="mt-6 rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-heading text-sm font-semibold">Remote animation controls</p>
              <span className="truncate font-mono text-[10px] text-muted-foreground">target: {device.device_id}</span>
            </div>
            <DeviceControls
              device={device}
              characters={(charactersQuery.data || []).filter((character) => character.enabled)}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <DeviceStatusPanel device={device} command={data.commands[0]} />

            <div className="rounded-2xl border border-black/[0.07] bg-white p-5">
              <p className="font-heading text-sm font-semibold">Audit trail</p>
              <ul className="mt-4 space-y-3">
                {(data.events || []).length === 0 && (
                  <li className="text-sm text-muted-foreground">No events recorded yet.</li>
                )}
                {(data.events || []).map((event) => (
                  <li key={event.id} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{event.message}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {event.event_type.replaceAll("_", " ")} · {event.actor} · {formatDateTime(event.created_date)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-black/[0.07] bg-white p-5">
            <p className="font-heading text-sm font-semibold">Command history</p>
            <div className="dd-scroll mt-3 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <tr>
                    <th className="py-2 font-medium">Command</th>
                    <th className="py-2 font-medium">Character</th>
                    <th className="py-2 font-medium">Duration</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Issued</th>
                    <th className="py-2 font-medium">Acknowledged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {(data.commands || []).map((command) => (
                    <tr key={command.id}>
                      <td className="py-2 font-mono text-[11px]">{command.id.slice(0, 8)}</td>
                      <td className="py-2">
                        {command.command_type === "stop" ? "—" : command.character_name}
                      </td>
                      <td className="py-2">{command.duration_seconds ? `${command.duration_seconds}s` : "—"}</td>
                      <td className="py-2">
                        <StatusBadge status={command.status} />
                      </td>
                      <td className="py-2 text-muted-foreground">{formatDateTime(command.created_date)}</td>
                      <td className="py-2 text-muted-foreground">
                        {command.acknowledged_at ? formatDateTime(command.acknowledged_at) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}