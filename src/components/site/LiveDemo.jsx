import { useState } from "react";
import { Play, Square, MousePointer2 } from "lucide-react";
import CharacterSprite from "@/components/characters/CharacterSprite";
import useCharacterMusic from "@/hooks/useCharacterMusic";
import { ANIMATIONS, CHARACTERS, POSITIONS, characterBySlug } from "@/lib/characters";

const ALIGN = {
  "bottom-left": "items-end justify-start",
  "bottom-right": "items-end justify-end",
  center: "items-center justify-center",
};

export default function LiveDemo() {
  const [slug, setSlug] = useState("banana");
  const [animation, setAnimation] = useState("dance");
  const [position, setPosition] = useState("center");
  const [playing, setPlaying] = useState(true);

  const character = characterBySlug(slug);

  useCharacterMusic(slug, playing);

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[1240px] px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
            Live preview
          </span>
          <h2 className="mt-4 font-heading text-[clamp(1.9rem,1rem+2.4vw,2.9rem)] font-bold leading-[1.08]">
            This is exactly what lands in the corner.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Same overlay, same sizing rules. The desktop companion draws this on a transparent layer
            above your wallpaper while your mouse and keyboard keep working.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-start">
          <div>
            <div className="rounded-[26px] border border-black/10 bg-[#131316] p-2.5 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.6)]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-[linear-gradient(140deg,#23262E_0%,#2E323C_45%,#171A20_100%)]">
                <div className="absolute inset-x-0 top-0 flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-white/25" />
                  <span className="h-2 w-2 rounded-full bg-white/25" />
                  <span className="h-2 w-2 rounded-full bg-white/25" />
                  <span className="ml-2 text-[10px] tracking-wide text-white/40">
                    someone's desktop · nothing being recorded
                  </span>
                </div>

                <div className="absolute left-6 right-6 top-14 rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm sm:left-10 sm:right-auto sm:w-[46%]">
                  <div className="h-2 w-24 rounded-full bg-white/25" />
                  <div className="mt-3 space-y-2">
                    <div className="h-1.5 w-full rounded-full bg-white/12" />
                    <div className="h-1.5 w-5/6 rounded-full bg-white/12" />
                    <div className="h-1.5 w-2/3 rounded-full bg-white/12" />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-white/40">
                    <MousePointer2 className="h-3 w-3" /> still fully interactive
                  </div>
                </div>

                <div
                  className={`pointer-events-none absolute inset-0 flex p-5 sm:p-8 ${ALIGN[position]}`}
                >
                  {playing ? (
                    <CharacterSprite
                      slug={slug}
                      animation={animation}
                      className="aspect-square w-[26%] max-w-[190px] min-w-[92px] drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)]"
                    />
                  ) : null}
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 border-t border-white/10 bg-black/40 px-4 py-1.5 text-[10px] text-white/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  DanceDrop companion · overlay active
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Preview only. Nothing here is remote: it's the same renderer the companion app uses.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-[#FAFAF8] p-5">
            <p className="font-heading text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Character
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CHARACTERS.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => {
                    setSlug(c.slug);
                    setAnimation(c.animations[0]);
                  }}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    slug === c.slug
                      ? "border-[#0B0B0C] bg-[#0B0B0C] text-white"
                      : "border-black/10 bg-white text-[#0B0B0C] hover:border-black/30"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.accent }} />
                  {c.name}
                </button>
              ))}
            </div>

            <p className="mt-6 font-heading text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Animation
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ANIMATIONS.filter((a) => character.animations.includes(a.key)).map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setAnimation(a.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    animation === a.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-black/10 bg-white text-[#0B0B0C] hover:border-black/30"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <p className="mt-6 font-heading text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Position
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {POSITIONS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPosition(p.key === "random" ? "center" : p.key)}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                    position === (p.key === "random" ? "center" : p.key)
                      ? "border-[#0B0B0C] bg-white text-[#0B0B0C]"
                      : "border-black/10 bg-white/60 text-muted-foreground hover:border-black/30"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-colors ${
                playing
                  ? "bg-[#0B0B0C] text-white hover:bg-[#26262A]"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {playing ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Stop animation" : "Start animation"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}