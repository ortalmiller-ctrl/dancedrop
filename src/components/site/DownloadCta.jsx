import { Link } from "@tanstack/react-router";
import { ArrowRight, MonitorDown } from "lucide-react";

export default function DownloadCta({ onTrack }) {
  return (
    <section className="bg-white pb-20 lg:pb-28">
      <div className="mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-[28px] bg-primary px-6 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[26px] border-white/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 right-24 h-72 w-72 rounded-full border-[18px] border-black/10"
          />
          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
              <MonitorDown className="h-3.5 w-3.5" /> Desktop companion
            </span>
            <h2 className="mt-5 font-heading text-[clamp(1.9rem,1rem+2.6vw,3rem)] font-bold leading-[1.05]">
              Invite the banana to your own screen.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/85">
              Free for one device, activation code included. Installation and activation are tracked
              separately, so you always know who actually opted in.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/download"
                onClick={onTrack}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-primary transition-transform hover:-translate-y-0.5"
              >
                Download for Desktop
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/desktop-app"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Read the architecture
              </Link>
            </div>
            <p className="mt-5 text-xs text-white/70">
              Windows 10/11, 64-bit. Installation and consent stay separate, so the overlay only runs
              on screens that opted in.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}