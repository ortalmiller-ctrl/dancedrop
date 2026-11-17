import { Check, X } from "lucide-react";

const CAN = [
  "Draw an animated character in a transparent overlay",
  "Play for the exact duration the device owner allows",
  "Report that it is online and acknowledged a command",
  "Show its OS and screen size so the overlay scales correctly",
];

const NEVER = [
  "Record your screen, windows or microphone",
  "Read files, keystrokes, clipboard or browser history",
  "Control your mouse, keyboard or any other app",
  "Run commands, install anything, or hide from you",
];

export default function PrivacySection() {
  return (
    <section id="privacy" className="scroll-mt-20 border-t border-black/[0.06] bg-white">
      <div className="mx-auto w-full max-w-[1240px] px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
              Privacy & permissions
            </span>
            <h2 className="mt-4 font-heading text-[clamp(1.9rem,1rem+2.4vw,2.9rem)] font-bold leading-[1.08]">
              A cartoon layer, and nothing behind it.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
              The companion is a single-purpose overlay application. It talks to one endpoint, with
              its own device credential, and the only message it can receive is "play this character
              here for this long".
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Consent is stored per device and checked on every command. Pausing, revoking or
              quitting from the tray stops everything immediately, and uninstalling leaves nothing
              behind.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.08] bg-[#FAFAF8] p-5">
              <p className="font-heading text-sm font-semibold">What it can do</p>
              <ul className="mt-4 space-y-3">
                {CAN.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-snug text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-black/[0.08] bg-[#0B0B0C] p-5 text-white">
              <p className="font-heading text-sm font-semibold">What it never does</p>
              <ul className="mt-4 space-y-3">
                {NEVER.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-snug text-white/55">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}