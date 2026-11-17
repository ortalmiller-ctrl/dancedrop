import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Loader2, ShieldOff, Unplug } from "lucide-react";
import { lookupDeviceByCode, revokeDeviceFromPortal } from "@/lib/server-fns";

export const Route = createFileRoute("/_site/my-device")({
  head: () => ({
    meta: [
      { title: "My device · DanceDrop" },
      {
        name: "description",
        content: "Look up a DanceDrop device with its activation code, pause remote animations or disconnect it.",
      },
    ],
  }),
  component: MyDevicePage,
});

function MyDevicePage() {
  const [code, setCode] = useState("");
  const [device, setDevice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const lookup = useServerFn(lookupDeviceByCode);
  const revoke = useServerFn(revokeDeviceFromPortal);

  const handleLookup = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await lookup({ data: { code } });
      if (!result) {
        setDevice(null);
        setError("No device matches that activation code.");
      } else {
        setDevice(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async (disconnect) => {
    setBusy(true);
    setError(null);
    try {
      await revoke({ data: { code, disconnect } });
      const result = await lookup({ data: { code } });
      setDevice(result);
      setNotice(
        disconnect
          ? "This device is disconnected. It has to be activated again to receive anything."
          : "Remote animations are off for this device until it is switched back on locally."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const live = device && device.consent_status === "granted" && !device.revoked;
  const offline = device && !device.online;

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-[900px] px-6 py-16 sm:px-8 lg:py-24">
        <span className="text-[11px] uppercase tracking-[0.24em] text-primary">Device portal</span>
        <h1 className="mt-4 font-heading text-[clamp(2rem,1rem+3vw,3rem)] font-bold leading-[1.06]">
          Your code, your switch.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Every activation gets a code. You do not need an account, the companion does not need to be
          running, and nothing here can turn animations back on for you.
        </p>

        <form onSubmit={handleLookup} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="ABCD-1234"
              maxLength={12}
              className="w-full rounded-full border border-black/12 bg-[#FAFAF8] py-3.5 pl-11 pr-4 font-mono text-sm tracking-[0.18em] placeholder:tracking-[0.18em] placeholder:text-black/25 focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy || code.trim().length < 4}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B0B0C] px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#26262A] disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Look up device
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        {notice && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </p>
        )}

        {device && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-black/[0.08]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] bg-[#FAFAF8] px-5 py-4">
              <div>
                <p className="font-heading text-sm font-semibold">{device.nickname}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{device.device_id}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${
                  device.revoked
                    ? "bg-red-100 text-red-700"
                    : live
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {device.revoked ? "Disconnected" : live ? "Animations on" : "Animations off"}
              </span>
            </div>

            <div className="grid gap-4 px-5 py-5 sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Platform</p>
                <p className="mt-1 text-sm capitalize">{device.os} · {device.client_type}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Connection</p>
                <p className="mt-1 text-sm">{offline ? "Offline" : "Online"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Last seen</p>
                <p className="mt-1 text-sm">
                  {device.last_seen
                    ? new Date(device.last_seen).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-black/[0.06] px-5 py-4 sm:flex-row">
              <button
                type="button"
                disabled={busy || !live}
                onClick={() => handleRevoke(false)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0B0B0C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#26262A] disabled:opacity-40"
              >
                <ShieldOff className="h-4 w-4" /> Turn off remote animations
              </button>
              <button
                type="button"
                disabled={busy || device.revoked}
                onClick={() => handleRevoke(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-black/12 px-5 py-2.5 text-sm font-medium hover:border-red-300 hover:text-red-600 disabled:opacity-40"
              >
                <Unplug className="h-4 w-4" /> Disconnect this device
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}