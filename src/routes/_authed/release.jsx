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
  setCompanionReleasePublished,
} from "@/lib/server-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";
import { base44 } from "@/api/base44Client";

const EMPTY_FORM = {
  version: "",
  fileUrl: "",
  fileName: "",
  sizeMb: "",
  sha256: "",
  status: "live",
};

export const Route = createFileRoute("/_authed/release")({
  ssr: false,
  head: () => ({ meta: [{ title: "Companion release · DanceDrop" }] }),
  component: ReleasePage,
});

function ReleasePage() {
  const load = useServerFn(listCompanionReleases);
  const publish = useServerFn(publishCompanionRelease);
  const setPublished = useServerFn(setCompanionReleasePublished);

  const [releases, setReleases] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedStatus, setSavedStatus] = useState("");

  const refresh = () => load().then(setReleases);

  useEffect(() => {
    refresh().catch((err) => setError(err.message || "Could not load releases"));
  }, []);

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSavedStatus("");
    try {
      const sizeMb = Number(form.sizeMb);
      let fileUrl = form.fileUrl.trim();
      let fileName = form.fileName.trim();
      let sizeBytes = Number.isFinite(sizeMb) && sizeMb > 0 ? Math.round(sizeMb * 1024 * 1024) : undefined;

      if (uploadedFile) {
        const result = await base44.integrations.Core.UploadPublicFile({ file: uploadedFile });
        fileUrl = result.file_url;
        fileName = fileName || uploadedFile.name;
        sizeBytes = uploadedFile.size;
      }

      await publish({
        data: {
          version: form.version.trim(),
          fileUrl,
          fileName: fileName || undefined,
          sizeBytes,
          sha256: form.sha256.trim() || undefined,
          published: form.status !== "hidden",
        },
      });
      setSavedStatus(form.status);
      setForm(EMPTY_FORM);
      setUploadedFile(null);
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
            <Label htmlFor="fileUrl">Installer URL (or upload a file below)</Label>
            <Input
              id="fileUrl"
              required={!uploadedFile}
              type="url"
              placeholder="https://github.com/owner/repo/releases/latest/download/DanceDrop-Setup.exe"
              value={form.fileUrl}
              onChange={update("fileUrl")}
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Paste the direct asset link from the GitHub release, the one ending in{" "}
              <span className="font-medium">.exe</span>. A ZIP or an Actions run page is refused.
            </p>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="installerFile">Or upload the installer</Label>
            <Input
              id="installerFile"
              type="file"
              accept=".exe,application/octet-stream"
              onChange={(event) => setUploadedFile(event.target.files?.[0] || null)}
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Pick the .exe from your build folder and it is hosted here, so the download works even
              while the GitHub repo stays private.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sizeMb">Size (MB)</Label>
            <Input id="sizeMb" inputMode="decimal" placeholder="84" value={form.sizeMb} onChange={update("sizeMb")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sha256">SHA-256 (optional)</Label>
            <Input id="sha256" placeholder="hash printed by the build" value={form.sha256} onChange={update("sha256")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Release status</Label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm({ ...form, status: value })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live — the website serves it now</SelectItem>
                <SelectItem value="hidden">Hidden — save without showing it</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        {savedStatus && (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {savedStatus === "hidden"
              ? "Saved as hidden. The website still says the download is coming soon."
              : "Published. The download button now serves it."}
          </p>
        )}

        <Button type="submit" disabled={busy} className="mt-5">
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.status === "hidden" ? "Save as hidden" : "Publish release"}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await setPublished({ data: { id: release.id, published: !release.published } });
                    refresh();
                  }}
                >
                  {release.published ? "Hide" : "Publish"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}