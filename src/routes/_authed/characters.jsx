import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import CharacterSprite from "@/components/characters/CharacterSprite";
import { Switch } from "@/components/ui/switch";
import { listCharacters, setCharacterEnabled } from "@/lib/server-fns";
import { animationLabel } from "@/lib/characters";

export const Route = createFileRoute("/_authed/characters")({
  head: () => ({ meta: [{ title: "Character library · DanceDrop admin" }] }),
  component: CharactersPage,
});

function CharactersPage() {
  const queryClient = useQueryClient();
  const charactersFn = useServerFn(listCharacters);
  const toggleFn = useServerFn(setCharacterEnabled);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["characters"],
    queryFn: () => charactersFn(),
    staleTime: 30_000,
    retry: false,
  });

  const toggleMutation = useMutation({
    mutationFn: (payload) => toggleFn({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      toast.success("Character library updated.");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <AdminShell>
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Character library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Disabled characters disappear from the control panel. Assets are transparent vector
          animations, so they stay sharp from a 13-inch laptop to a 4K television.
        </p>
      </div>

      {isLoading && (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading the cast…
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {error.message}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.map((character) => (
          <div
            key={character.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white"
          >
            <div
              className="relative aspect-[4/3] overflow-hidden"
              style={{
                background: `radial-gradient(120% 100% at 80% 0%, ${character.accent_color}33 0%, #FAFAF8 60%, #FFFFFF 100%)`,
              }}
            >
              <div className="absolute inset-0 grid place-items-center">
                <CharacterSprite
                  slug={character.slug}
                  animation={character.animations?.[0] || "dance"}
                  className="aspect-square w-[46%]"
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-sm font-semibold">{character.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{character.tagline}</p>
                </div>
                <Switch
                  checked={character.enabled}
                  onCheckedChange={(checked) =>
                    toggleMutation.mutate({ id: character.id, enabled: checked })
                  }
                  aria-label={`Toggle ${character.name}`}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(character.animations || []).map((key) => (
                  <span
                    key={key}
                    className="rounded-full bg-[#F4F4F1] px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-black/50"
                  >
                    {animationLabel(key)}
                  </span>
                ))}
              </div>
              <p className="mt-auto pt-3 font-mono text-[10px] text-muted-foreground">
                slug: {character.slug}
              </p>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}