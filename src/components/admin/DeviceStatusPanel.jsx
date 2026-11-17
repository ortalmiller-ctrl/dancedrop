import { CheckCircle2, Clock, Radio, XCircle } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { animationLabel, positionLabel } from "@/lib/characters";
import { formatDateTime } from "@/lib/format";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-medium">{value}</span>
    </div>
  );
}

export default function DeviceStatusPanel({ device, command }) {
  if (!command) {
    return (
      <div className="rounded-2xl border border-black/[0.07] bg-white p-5">
        <p className="font-heading text-sm font-semibold">Current status</p>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Radio className="h-4 w-4" /> No command has ever been sent to this device.
        </p>
      </div>
    );
  }

  const isStop = command.command_type === "stop";
  const delivered = Boolean(command.delivered_at);
  const acknowledged = Boolean(command.acknowledged_at);

  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="font-heading text-sm font-semibold">Current status</p>
        <StatusBadge status={command.status} />
      </div>

      <div className="mt-3 rounded-xl bg-[#FAFAF8] p-3">
        <p className="font-heading text-sm font-semibold">
          {isStop ? "Stop command" : `${command.character_name} · ${animationLabel(command.animation)}`}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {isStop
            ? "Clears any running overlay on this device"
            : `${command.duration_seconds}s · ${positionLabel(command.position)}`}
        </p>
      </div>

      <div className="mt-3 divide-y divide-black/[0.06]">
        <Row label="Issued by" value={command.issued_by_email || "—"} />
        <Row label="Issued at" value={formatDateTime(command.created_date)} />
        <div className="flex items-start justify-between gap-3 py-2">
          <span className="text-xs text-muted-foreground">Delivered</span>
          <span className="flex items-center gap-1.5 text-right text-xs font-medium">
            {delivered ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> {formatDateTime(command.delivered_at)}
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5 text-amber-500" /> waiting for heartbeat
              </>
            )}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3 py-2">
          <span className="text-xs text-muted-foreground">Acknowledged</span>
          <span className="flex items-center gap-1.5 text-right text-xs font-medium">
            {acknowledged ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {formatDateTime(command.acknowledged_at)}
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5 text-amber-500" /> not yet
              </>
            )}
          </span>
        </div>
        <Row label="Expires" value={formatDateTime(command.expires_at)} />
        {command.device_message && (
          <div className="flex items-start gap-2 py-2 text-xs text-red-600">
            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {command.device_message}
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Command {command.id.slice(0, 8)} is bound to {device.device_id}. Any other device ignores it.
      </p>
    </div>
  );
}