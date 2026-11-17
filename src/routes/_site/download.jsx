import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, MonitorDown, MousePointerClick, ShieldCheck, Terminal } from "lucide-react";
import DownloadActions from "@/components/companion/DownloadActions";

export const Route = createFileRoute("/_site/download")({
  head: () => ({
    meta: [
      { title: "Install DanceDrop · Windows companion" },
      {
        name: "description",
        content:
          "Install the DanceDrop companion, activate your device, and choose whether remote animations are allowed.",
      },
    ],
  }),
  component: DownloadPage,
});

const STEPS = [
  {
    icon: MonitorDown,
    title: "1 · Get the companion",
    body: "Windows 10 or 11, 64-bit. The companion is a single tray application with no background services and no startup entry unless you create one.",
  },
  {
    icon: Terminal,
    title: "2 · Launch and activate",
    body: "Pressing Activate creates a device ID and a hashed credential on your machine. Nothing is registered until you press it.",
  },
  {
    icon: KeyRound,
    title: "3 · Keep your activation code",
    body: "The code (four and four characters) links this installation to its record. Use it on the device portal to pause or disconnect from anywhere.",
  },
  {
    icon: ShieldCheck,
    title: "4 · Decide on consent",
    body: "Remote animations are off by default. Flip the switch inside the companion to allow overlays, and flip it back whenever you like.",
  },
];

function DownloadPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-black/[0.06] bg-[#0B0B0C] text-white">
        <div className="mx-auto w-full max-w-[1240px] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
          <span className="text-[11px] uppercase tracking-[0.24em] text-primary">Download & install</span>
          <h1 className="mt-4 max-w-2xl font-heading text-[clamp(2.1rem,1rem+3.6vw,3.4rem)] font-bold leading-[1.05]">
            Four steps, and a switch you control.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/60">
            Installation and activation are tracked separately, so the platform can tell the
            difference between "someone downloaded the app" and "someone opted in".
          </p>
          <div className="mt-8">
            <DownloadActions />
          </div>
          <p className="mt-4 max-w-lg text-xs leading-relaxed text-white/40">
            The browser companion on this site is fully functional today. The Electron build shares
            the same renderer and the same device API.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="space-y-4">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-2xl border border-black/[0.08] bg-[#FAFAF8] p-5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white shadow-sm">
                  <step.icon className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold">{step.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-black/[0.08] p-6">
              <p className="font-heading text-sm font-semibold">Permissions it asks for</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  Network access to the DanceDrop device API only.
                </li>
                <li className="flex gap-2.5">
                  <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  Drawing an always-on-top, click-through window.
                </li>
                <li className="flex gap-2.5">
                  <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  Reading its own device credential from local storage.
                </li>
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                No screen recording, no accessibility control, no microphone, no file access. The
                companion never asks the operating system for anything that would let it watch or
                operate your computer.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0B0B0C] p-6 text-white">
              <p className="font-heading text-sm font-semibold">Already activated?</p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Pause or disconnect any device with its activation code, even if the companion is not
                running.
              </p>
              <Link
                to="/my-device"
                className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#0B0B0C] hover:bg-white/90"
              >
                Open the device portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}