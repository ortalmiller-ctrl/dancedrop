import { useState } from "react";
import { Check, Copy, Loader2, Power, Radio, ShieldCheck, ShieldOff, TriangleAlert } from "lucide-react";
import useCompanion from "@/components/companion/useCompanion";
import RemoteOverlay from "@/components/companion/RemoteOverlay";

function StatusDot({ live }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${live ? "bg-emerald-500" : "bg-white/30"}`} />
    </span>
  );
}

function CopyCode({ code }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch (err) {
          setCopied(false);
        }
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono text-sm tracking-widest text-white/85 transition-colors hover:border-white/35"
    >
      {code}
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-white/40" />}
    </button>
  );
}

export default function CompanionPanel() {
  const companion = useCompanion();
  const [nickname, setNickname] = useState("");
  const { device, consent, busy, error, active, log } = companion;

  const live = consent === "granted";

  return (
    <div className="relative">
      <RemoteOverlay active={companion.active} />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101013] text-white">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <StatusDot live={live} />
            <span className="font-heading text-sm font-semibold">
              {device ? device.nickname : "Browser companion"}
            </span>
          </div>
          <span className="rounded-full border border-white/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
            {device ? (live ? "Listening" : "Paused") : "Not activated"}
          </span>
        </div>

        <div className="p-5">
          {!companion.hydrated && (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking this browser…
            </div>
          )}

          {companion.hydrated && !device && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-white/60">
                Activate this browser tab as a device. It gets its own device ID, its own credential and
                an activation code, exactly like the desktop companion.
              </p>
              <label className="block text-xs uppercase tracking-[0.18em] text-white/40">
                Device nickname
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="Living room browser"
                  maxLength={40}
                  className="mt-2 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm tracking-normal text-white placeholder:text-white/25 focus:border-primary focus:outline-none"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => companion.activate(nickname)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                Activate this browser
              </button>
              <p className="text-[11px] leading-relaxed text-white/35">
                Nothing is recorded. Activation only creates a device record so an admin can send one
                animation at a time, and only after you switch consent on.
              </p>
            </div>
          )}

          {device && consent === "pending" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-heading text-sm font-semibold">Allow remote animations?</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">
                    Keep this off and this device ignores every command. Switch it on and an admin can
                    play a character overlay here for up to 120 seconds at a time.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={busy}
                  onClick={companion.enable}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
                >
                  <ShieldCheck className="h-4 w-4" /> Enable remote animations
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={companion.disconnect}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm text-white/75 hover:border-white/40"
                >
                  Not now
                </button>
              </div>
            </div>
          )}

          {device && consent !== "pending" && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Device ID</p>
                  <p className="mt-1 font-mono text-sm text-white/85">{device.device_id}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Activation code</p>
                  <div className="mt-1.5">
                    <CopyCode code={device.activation_code} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {live ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={companion.pause}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#0B0B0C] hover:bg-white/90"
                  >
                    <ShieldOff className="h-4 w-4" /> Pause animations
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={companion.enable}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    <ShieldCheck className="h-4 w-4" /> Resume animations
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={companion.disconnect}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/75 hover:border-red-400/60 hover:text-red-300"
                >
                  Disconnect this browser
                </button>
              </div>

              {live && (
                <p className="flex items-center gap-2 text-[11px] text-white/35">
                  <Radio className="h-3.5 w-3.5 text-primary" />
                  Heartbeat every 8 seconds · commands are accepted only for {device.device_id}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 flex items-start gap-2 text-xs text-red-300">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
            </p>
          )}

          {log.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Companion log</p>
              <ul className="mt-2 space-y-1.5 text-xs text-white/45">
                {log.map((entry) => (
                  <li key={entry.id} className="flex gap-2">
                    <span className="font-mono text-[10px] text-white/25">
                      {entry.at.toLocaleTimeString("en-GB", { hour12: false })}
                    </span>
                    {entry.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {active && (
            <p className="mt-4 text-[11px] text-primary">
              Playing {active.name} now, on this page, in a pointer-transparent overlay.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}