import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ExternalLink, Loader2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listCompanionReleases,
  publishCompanionRelease,
  unpublishCompanionRelease,
} from "@/lib/server-fns";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/release")({
  ssr: false,
  head: () => ({ meta: [{ title: "Companion release · DanceDrop" }] }),
  component: ReleasePage,
});

function ReleasePage() {
  const load = useServerFn(listCompanionReleases);
  const publish = useServerFn(publishCompanionRelease);
  const unpublish = useServerFn(unpublishCompanionRelease);

  const [releases, setReleases] = useState(null);
  const [form, setForm] = useState({ version: "", fileUrl: "", fileName: "", sizeMb: "", sha256: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const refresh = () => load().then(setReleases);

  useEffect(() => {
    refresh().catch((err) => setError(err.message || "Could not load releases"));
  }, []);

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const sizeMb = Number(form.sizeMb);
      await publish({
        data: {
          version: form.version.trim(),
          fileUrl: form.fileUrl.trim(),
          fileName: form.fileName.trim() || undefined,
          sizeBytes: Number.isFinite(sizeMb) && sizeMb > 0 ? Math.round(sizeMb * 1024 * 1024) : undefined,
          sha256: form.sha256.trim() || undefined,
        },
      });
      setForm({ version: "", fileUrl: "", fileName: "", sizeMb: "", sha256: "" });
      setSaved(true);
      await refresh();
    } catch (err) {
      setError(err.message || "Could not publish this release");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Companion</p>
        <h1 className="mt-1 font-heading text-2xl font-bold">Windows installer release</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The website's Download button serves the newest published release. Build the installer with
          the GitHub Actions workflow, then paste its download URL here.
        </p>
        <a
          href="/desktop-app"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Build pipeline and app source <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </header>

      <form onSubmit={submit} className="rounded-2xl border border-black/[0.08] bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="version">Version</Label>
            <Input id="version" required placeholder="1.0.0" value={form.version} onChange={update("version")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fileName">File name</Label>
            <Input
              id="fileName"
              placeholder="DanceDrop-Setup.exe"
              value={form.fileName}
              onChange={update("fileName")}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fileUrl">Installer URL</Label>
            <Input
              id="fileUrl"
              required
              type="url"
              placeholder="https://github.com/owner/repo/releases/latest/download/DanceDrop-Setup.exe"
              value={form.fileUrl}
              onChange={update("fileUrl")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sizeMb">Size (MB)</Label>
            <Input id="sizeMb" inputMode="decimal" placeholder="84" value={form.sizeMb} onChange={update("sizeMb")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sha256">SHA-256 (optional)</Label>
            <Input id="sha256" placeholder="hash printed by the build" value={form.sha256} onChange={update("sha256")} />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        {saved && (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Published. The download button now serves it.
          </p>
        )}

        <Button type="submit" disabled={busy} className="mt-5">
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publish release
        </Button>
      </form>

      <section className="rounded-2xl border border-black/[0.08] bg-white">
        <div className="flex items-center gap-2 border-b border-black/[0.06] px-5 py-3.5">
          <PackageOpen className="h-4 w-4 text-primary" />
          <p className="font-heading text-sm font-semibold">Published releases</p>
        </div>
        {!releases && <p className="px-5 py-6 text-sm text-muted-foreground">Loading…</p>}
        {releases && releases.length === 0 && (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            No installer published yet. Until one is, the download button says so instead of shipping a
            placeholder file.
          </p>
        )}
        {releases && releases.length > 0 && (
          <ul className="divide-y divide-black/[0.06]">
            {releases.map((release) => (
              <li key={release.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    v{release.version}{" "}
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                        release.published ? "bg-emerald-100 text-emerald-700" : "bg-black/[0.06] text-black/50"
                      }`}
                    >
                      {release.published ? "live" : "hidden"}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{release.file_url}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {release.released_at ? formatDateTime(release.released_at) : ""}
                  </p>
                </div>
                {release.published && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await unpublish({ data: { id: release.id } });
                      refresh();
                    }}
                  >
                    Hide
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}