import { useEffect } from "react";
import { CHARACTERS } from "@/lib/characters";

// Plays a character's own theme for as long as that character is on screen.
export default function useCharacterMusic(slug) {
  useEffect(() => {
    const character = CHARACTERS.find((item) => item.slug === slug);
    if (!character?.music) return undefined;

    const audio = new Audio(character.music);
    audio.volume = 0.85;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [slug]);
}