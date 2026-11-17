import CharacterSprite from "@/components/characters/CharacterSprite";
import useCharacterMusic from "@/hooks/useCharacterMusic";

const ALIGN = {
  "bottom-left": "items-end justify-start",
  "bottom-right": "items-end justify-end",
  center: "items-center justify-center",
};

export default function RemoteOverlay({ active }) {
  useCharacterMusic(active?.slug);
  if (!active) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[60] flex p-6 sm:p-10 ${ALIGN[active.position] || ALIGN["bottom-right"]}`}
      aria-live="polite"
    >
      <div className="relative flex flex-col items-center gap-3">
        <CharacterSprite
          slug={active.slug}
          animation={active.animation}
          className="aspect-square"
          style={{
            width: "clamp(160px, 26vmin, 420px)",
            filter: "drop-shadow(0 24px 28px rgba(0,0,0,0.35))",
          }}
        />
        <span className="rounded-full bg-[#0B0B0C]/85 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur">
          {active.name} · {active.animation} · {active.duration}s
        </span>
      </div>
    </div>
  );
}