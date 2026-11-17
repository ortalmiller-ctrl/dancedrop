import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Radio, ShieldCheck } from "lucide-react";
import CompanionPanel from "@/components/companion/CompanionPanel";

export const Route = createFileRoute("/_site/preview")({
  head: () => ({
    meta: [
      { title: "Live demo · DanceDrop browser companion" },
      {
        name: "description",
        content:
          "Turn this browser into a real DanceDrop device and let an admin console send it an animation.",
      },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  return (
    <div className="bg-[#0B0B0C] text-white">
      <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16 lg:px-12 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/60">
            <Radio className="h-3.5 w-3.5 text-primary" /> Browser companion
          </span>
          <h1 className="mt-5 font-heading text-[clamp(2.1rem,1rem+3.6vw,3.4rem)] font-bold leading-[1.05]">
            This tab can be a real device.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/60">
            The desktop companion is an Electron shell around this exact renderer. Activate this
            browser and it registers, heartbeats and accepts commands through the same device API.
            Sign in to the admin console in another tab, pick this device and hit start.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                icon: ShieldCheck,
                title: "Consent is a switch, not a checkbox",
                body: "The device stays silent until you enable remote animations, and the admin console refuses to send anything otherwise.",
              },
              {
                icon: Radio,
                title: "One device, one credential",
                body: "Every activation gets a device ID, a hashed secret and its own activation code. Commands are scoped to that ID.",
              },
              {
                icon: ArrowRight,
                title: "Delivery is proven",
                body: "Each command is logged, delivered on the next heartbeat, then acknowledged and completed by the device.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.04]">
                  <item.icon className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#0B0B0C] hover:bg-white/90"
            >
              Open admin console <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/my-device"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/75 hover:border-white/40"
            >
              Look up a device by code
            </Link>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <CompanionPanel />
          <p className="mt-3 text-[11px] leading-relaxed text-white/35">
            The animation you receive is drawn on a pointer-transparent layer above this page. Your
            clicks keep working, and the character disappears when its duration ends. Keep this tab
            open: the browser companion stops answering when the page is closed.
          </p>
        </div>
      </div>
    </div>
  );
}