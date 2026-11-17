import { useEffect } from "react";
import { CHARACTERS } from "@/lib/characters";

// Plays a character's own theme for as long as that character is on screen.
export default function useCharacterMusic(slug, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const character = CHARACTERS.find((item) => item.slug === slug);
    if (!character?.music) return undefined;

    const audio = new Audio(character.music);
    audio.volume = 0.85;

    const attempt = () => {
      const playing = audio.play();
      if (playing && playing.catch) playing.catch(() => {});
    };

    // Browsers block autoplay until the visitor has interacted once, so retry on that first input.
    attempt();
    window.addEventListener("pointerdown", attempt, { once: true });
    window.addEventListener("keydown", attempt, { once: true });

    return () => {
      window.removeEventListener("pointerdown", attempt);
      window.removeEventListener("keydown", attempt);
      audio.pause();
      audio.src = "";
    };
  }, [slug, enabled]);
}