import { Download, ShieldCheck, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: Download,
    title: "Install the companion",
    body: "A small tray app for Windows 10 and 11. It does not run at startup unless you say so, and it never asks for screen recording or accessibility permissions.",
  },
  {
    icon: ShieldCheck,
    title: "Activate and opt in",
    body: "Activation generates a device ID and a readable code you can revoke. Remote animations stay off until you tick the consent switch yourself.",
  },
  {
    icon: Sparkles,
    title: "Someone sends a dance",
    body: "An admin picks your device by ID, chooses a character and presses start. A transparent overlay plays for the duration you allow, then disappears.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-black/[0.06] bg-white">
      <div className="mx-auto w-full max-w-[1240px] px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
              How it works
            </span>
            <h2 className="mt-4 font-heading text-[clamp(1.9rem,1rem+2.4vw,2.9rem)] font-bold leading-[1.08]">
              Three steps, and one of them is the whole point.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            The opt-in is not a checkbox buried in a setup wizard. It is a switch on the device, and
            it is the only way a command ever reaches it.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="group relative overflow-hidden rounded-2xl border border-black/[0.08] bg-[#FAFAF8] p-6 transition-colors hover:border-black/20"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#0B0B0C] shadow-sm transition-colors group-hover:bg-primary group-hover:text-white">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="font-heading text-3xl font-bold text-black/[0.08]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-6 font-heading text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}