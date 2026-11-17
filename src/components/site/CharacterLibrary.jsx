import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import CharacterSprite from "@/components/characters/CharacterSprite";
import { CHARACTERS, animationLabel } from "@/lib/characters";

export default function CharacterLibrary() {
  return (
    <section id="characters" className="scroll-mt-20 bg-[#0B0B0C] text-white">
      <div className="mx-auto w-full max-w-[1240px] px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
              The cast
            </span>
            <h2 className="mt-4 font-heading text-[clamp(1.9rem,1rem+2.4vw,2.9rem)] font-bold leading-[1.08]">
              Six idiots. Twenty-five moves. No dignity.
            </h2>
          </div>
          <Link
            to="/preview"
            className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/80 transition-colors hover:border-white hover:text-white"
          >
            Preview them all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHARACTERS.map((character, index) => (
            <article
              key={character.slug}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 p-5 transition-colors hover:border-white/25 ${
                index === 0 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
              style={{
                background: `radial-gradient(120% 90% at 80% 0%, ${character.accent}22 0%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0.01) 100%)`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading text-lg font-semibold">{character.name}</h3>
                  <p className="mt-1 text-sm text-white/45">{character.tagline}</p>
                </div>
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: character.accent }}
                />
              </div>

              <div className="mx-auto my-6 aspect-square w-[58%] max-w-[190px]">
                <CharacterSprite
                  slug={character.slug}
                  animation={character.animations[0]}
                  style={{ animationDuration: `${1.1 + index * 0.12}s` }}
                  className="h-full w-full"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {character.animations.map((key) => (
                  <span
                    key={key}
                    className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55"
                  >
                    {animationLabel(key)}
                  </span>
                ))}
              </div>
            </article>
          ))}

          <article className="flex flex-col justify-between rounded-2xl border border-primary/40 bg-primary/[0.08] p-6">
            <div>
              <h3 className="font-heading text-lg font-semibold">More characters in the queue</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Every character is a transparent vector animation, so it stays sharp on a 4K TV and
                tiny on a 13-inch laptop. New cast members are added from the admin library.
              </p>
            </div>
            <Link
              to="/download"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-white"
            >
              Get the overlay <ArrowUpRight className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}