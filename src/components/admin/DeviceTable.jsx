import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { animationLabel } from "@/lib/characters";
import { formatRelative, formatResolution } from "@/lib/format";

function AnimationCell({ device }) {
  const status = device.animation_status;
  if (!status) return <span className="text-xs text-muted-foreground">Idle</span>;
  const isStop = status.command_type === "stop";
  return (
    <div className="flex flex-col gap-1">
      <StatusBadge status={isStop ? "stopped" : status.status}>{isStop ? "stop" : status.status}</StatusBadge>
      {status.character_name && !isStop && (
        <span className="text-[11px] text-muted-foreground">
          {status.character_name} · {animationLabel(status.animation)}
        </span>
      )}
    </div>
  );
}

export default function DeviceTable({ devices }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-black/[0.07] bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAFAF8] text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Device</th>
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">Screen</th>
              <th className="px-4 py-3 font-medium">Connection</th>
              <th className="px-4 py-3 font-medium">Consent</th>
              <th className="px-4 py-3 font-medium">Animation</th>
              <th className="px-4 py-3 font-medium">Last seen</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.06]">
            {devices.map((device) => (
              <tr key={device.id} className="transition-colors hover:bg-[#FAFAF8]">
                <td className="px-4 py-3">
                  <Link to="/devices/$deviceId" params={{ deviceId: device.device_id }} className="block">
                    <p className="font-medium">{device.nickname}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{device.device_id}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/70">code {device.activation_code}</p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs capitalize">{device.os}</span>
                    <StatusBadge status={device.client_type} className="w-fit" />
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {formatResolution(device.screen_width, device.screen_height)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={device.online ? "online" : "offline"}>
                    {device.online ? "online" : "offline"}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={device.consent_status} />
                </td>
                <td className="px-4 py-3">
                  <AnimationCell device={device} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelative(device.last_seen)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to="/devices/$deviceId"
                    params={{ deviceId: device.device_id }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Control <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {devices.map((device) => (
          <div
            key={device.id}
            className="rounded-2xl border border-black/[0.07] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-semibold">{device.nickname}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{device.device_id}</p>
              </div>
              <StatusBadge status={device.online ? "online" : "offline"} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <StatusBadge status={device.consent_status} />
              <span className="capitalize">{device.os}</span>
              <span>·</span>
              <span className="font-mono">{formatResolution(device.screen_width, device.screen_height)}</span>
              <span>·</span>
              <span>{formatRelative(device.last_seen)}</span>
            </div>
            <div className="mt-3">
              <AnimationCell device={device} />
            </div>
            <Link
              to="/devices/$deviceId"
              params={{ deviceId: device.device_id }}
              className="mt-3 flex h-11 w-full touch-manipulation items-center justify-center gap-1.5 rounded-full bg-[#0B0B0C] text-sm font-medium text-white active:bg-primary"
            >
              Control <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}