import { cn } from "@/lib/utils";
import CharacterArt from "@/components/characters/CharacterArt";
import { Image } from "@/components/ui/image";
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
      {character.photo && (
        <div className="absolute left-[29%] top-[13%] h-[44%] w-[42%] overflow-hidden rounded-full border-[3px] border-[#141110] bg-white">
          <Image
            src={character.photo}
            alt=""
            className="h-full w-full object-cover object-top"
            focalPointX={0.5}
            focalPointY={0.12}
          />
        </div>
      )}
    </div>
  );
}