import { cn } from "@/lib/utils";
import CharacterArt from "@/components/characters/CharacterArt";
import { characterBySlug } from "@/lib/characters";

export default function CharacterSprite({
  slug = "banana",
  animation = "dance",
  className,
  style,
}) {
  const character = characterBySlug(slug);
  const safeAnimation = character.animations.includes(animation) ? animation : character.animations[0];

  return (
    <div
      className={cn("dd-stage relative", `dd-anim-${safeAnimation}`, className)}
      style={style}
      aria-hidden="true"
    >
      <CharacterArt slug={slug} />
    </div>
  );
}