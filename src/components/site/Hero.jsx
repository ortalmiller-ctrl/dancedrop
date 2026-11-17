import { Link } from "@tanstack/react-router";
import { ArrowRight, MonitorPlay, ShieldCheck } from "lucide-react";
import { CHARACTERS } from "@/lib/characters";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0B0B0C] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 42% at 50% 74%, rgba(255,92,26,0.55) 0%, rgba(255,92,26,0) 70%), radial-gradient(40% 26% at 50% 8%, rgba(255,92,26,0.18) 0%, rgba(255,92,26,0) 70%), linear-gradient(180deg, #150A05 0%, #0B0B0C 58%, #0B0B0C 100%)",
          }}
        />
        <div
          className="absolute left-1/2 top-[72%] w-[150%] max-w-none"
          style={{
            aspectRatio: "1",
            transform: "translate(-50%, -50%) perspective(680px) rotateX(61deg)",
            background:
              "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0 13px, rgba(255,150,90,0.34) 13.5px 14.6px, rgba(255,255,255,0) 15px 16px)",
            maskImage: "radial-gradient(closest-side, #000 54%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "radial-gradient(closest-side, #000 54%, rgba(0,0,0,0) 100%)",
            animation: "dd-glow 7s ease-in-out infinite",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[92svh] w-full max-w-[1240px] flex-col justify-between gap-12 px-6 pb-8 pt-16 sm:px-8 lg:px-12 lg:pt-20">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/70">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Consent first, always
          </span>

          <h1 className="max-w-[17em] font-heading text-[clamp(2.5rem,1rem+6.2vw,4.75rem)] font-bold leading-[1.02] tracking-[-0.035em]">
            Make any screen
            <br className="hidden sm:block" /> break into dance.
          </h1>

          <p className="max-w-[58ch] text-[clamp(0.95rem,1rem+0.3vw,1.1rem)] leading-relaxed text-white/60">
            DanceDrop brings a cartoon crew to the screens of devices that opted in. Someone installs
            the companion, presses activate, and you send a banana, a chicken or a robot into their
            corner: for six seconds of nonsense, then nothing.
          </p>

          <div className="mt-2 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/download"
              className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-[15px] font-medium text-white transition-all hover:bg-white hover:text-[#0B0B0C] sm:w-auto"
            >
              Download for Desktop
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/preview"
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-white/30 px-8 text-[15px] font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-[#0B0B0C] sm:w-auto"
            >
              <MonitorPlay className="h-4 w-4" />
              Try the live demo
            </Link>
          </div>

          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">
            Free · Windows 10 & 11 · Revoke anytime
          </p>
        </div>

        <div className="flex flex-col gap-5 border-t border-white/10 pt-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">The cast</span>
          <div className="flex flex-wrap items-center justify-between gap-5 text-white/70">
            {CHARACTERS.map((character) => (
              <div key={character.slug} className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: character.accent }}
                />
                <span className="font-heading text-[0.85rem] font-semibold tracking-tight sm:text-[0.95rem]">
                  {character.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}