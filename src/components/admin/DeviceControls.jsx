import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Play, Square } from "lucide-react";
import { sendAnimation, stopAnimation } from "@/lib/server-fns";
import { ANIMATIONS, POSITIONS, animationLabel, positionLabel } from "@/lib/characters";
import CharacterSprite from "@/components/characters/CharacterSprite";
import { Slider } from "@/components/ui/slider";

const ALIGN = {
  "bottom-left": "items-end justify-start",
  "bottom-right": "items-end justify-end",
  center: "items-center justify-center",
};

export default function DeviceControls({ device, characters = [], onDone }) {
  const [slug, setSlug] = useState("banana");
  const [animation, setAnimation] = useState("dance");
  const [duration, setDuration] = useState(8);
  const [position, setPosition] = useState("bottom-right");
  const [previewing, setPreviewing] = useState(false);

  const queryClient = useQueryClient();
  const send = useServerFn(sendAnimation);
  const stop = useServerFn(stopAnimation);

  const character = characters.find((item) => item.slug === slug) || characters[0];
  const blocked = device.revoked
    ? "This device is disconnected. It has to activate again first."
    : device.consent_status !== "granted"
      ? "This device has not granted consent for remote animations."
      : !device.online
        ? "This device is offline. Nothing can be delivered until its next heartbeat."
        : null;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["device", device.device_id] });
    queryClient.invalidateQueries({ queryKey: ["overview"] });
    queryClient.invalidateQueries({ queryKey: ["devices"] });
    onDone?.();
  };

  const startMutation = useMutation({
    mutationFn: (payload) => send({ data: payload }),
    onSuccess: () => {
      toast.success("Command queued. Status updates when the device acknowledges it.");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const stopMutation = useMutation({
    mutationFn: () => stop({ data: { deviceId: device.device_id } }),
    onSuccess: () => {
      toast.success("Stop command queued for this device.");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleStart = () => {
    if (!character) return;
    startMutation.mutate({
      deviceId: device.device_id,
      characterSlug: character.slug,
      animation,
      durationSeconds: duration,
      position,
    });
    setPreviewing(true);
    setTimeout(() => setPreviewing(false), duration * 1000);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
      <div className="space-y-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Character</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {characters.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => {
                  setSlug(item.slug);
                  if (!item.animations.includes(animation)) setAnimation(item.animations[0]);
                }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition-colors ${
                  character?.slug === item.slug
                    ? "border-[#0B0B0C] bg-[#0B0B0C] text-white"
                    : "border-black/10 bg-white hover:border-black/30"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.accent_color }}
                />
                <span className="truncate">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Animation</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ANIMATIONS.filter((item) => (character?.animations || []).includes(item.key)).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setAnimation(item.key)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  animation === item.key
                    ? "border-primary bg-primary text-white"
                    : "border-black/10 bg-white hover:border-black/30"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Duration</p>
            <span className="font-heading text-sm font-semibold tabular-nums">{duration}s</span>
          </div>
          <Slider
            className="mt-3"
            value={[duration]}
            min={3}
            max={120}
            step={1}
            onValueChange={(value) => setDuration(value[0])}
          />
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>3s</span>
            <span>Maximum 120s</span>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Position</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {POSITIONS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPosition(item.key)}
                className={`rounded-lg border px-2.5 py-2 text-xs transition-colors ${
                  position === item.key
                    ? "border-[#0B0B0C] bg-[#0B0B0C] text-white"
                    : "border-black/10 bg-white hover:border-black/30"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-black/[0.07] pt-5 sm:flex-row">
          <button
            type="button"
            disabled={Boolean(blocked) || startMutation.isPending}
            onClick={handleStart}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {startMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Start animation
          </button>
          <button
            type="button"
            disabled={stopMutation.isPending}
            onClick={() => stopMutation.mutate()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-black/15 px-6 py-3.5 text-sm font-semibold transition-colors hover:border-black/40 disabled:opacity-40"
          >
            {stopMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
            Stop animation
          </button>
        </div>

        {blocked && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">{blocked}</p>
        )}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Preview</p>
        <div className="mt-3 overflow-hidden rounded-2xl border border-black/10 bg-[#141418]">
          <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(140deg,#23262E_0%,#2E323C_45%,#171A20_100%)]">
            <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-white/50">
              device area
            </span>
            <div className={`pointer-events-none absolute inset-0 flex p-4 ${ALIGN[position] || ALIGN["bottom-right"]}`}>
              {character && (
                <CharacterSprite
                  slug={character.slug}
                  animation={animation}
                  className="aspect-square w-[34%] min-w-[74px] max-w-[170px]"
                />
              )}
            </div>
          </div>
          <div className="px-4 py-3 text-[11px] text-white/45">
            {character ? `${character.name} · ${animationLabel(animation)} · ${positionLabel(position)}` : "Loading cast"}
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Preview renders locally. The command only reaches the device once its next heartbeat picks it
          up, and only if consent is still granted at that moment.
        </p>
      </div>
    </div>
  );
}