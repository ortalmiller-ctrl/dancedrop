import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCompanionRelease, trackDownload } from "@/lib/server-fns";
import PendingBuildDialog from "@/components/companion/PendingBuildDialog";

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("windows")) return "windows";
  if (ua.includes("mac os")) return "macos";
  if (ua.includes("linux")) return "linux";
  return "unknown";
}

function formatSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
}

export default function DownloadActions({ variant = "solid" }) {
  const [release, setRelease] = useState(undefined);
  const [pendingOpen, setPendingOpen] = useState(false);
  const load = useServerFn(getCompanionRelease);
  const track = useServerFn(trackDownload);

  useEffect(() => {
    let alive = true;
    load({ data: { platform: "windows" } })
      .then((result) => {
        if (alive) setRelease(result || null);
      })
      .catch(() => {
        if (alive) setRelease(null);
      });
    return () => {
      alive = false;
    };
  }, [load]);

  const className =
    variant === "solid"
      ? "h-12 rounded-full bg-primary px-7 text-[15px] font-medium text-white hover:bg-primary/90"
      : "h-12 rounded-full px-7 text-[15px] font-medium";
  const buttonVariant = variant === "solid" ? "default" : "outline";
  const metaClass = variant === "solid" ? "text-white/45" : "text-muted-foreground";

  const recordDownload = () => {
    track({
      data: { platform: detectPlatform(), source: "download", clientType: "desktop" },
    }).catch(() => {});
  };

  if (release) {
    const size = formatSize(release.size_bytes);
    return (
      <div>
        <Button asChild size="lg" variant={buttonVariant} className={className}>
          <a href={release.file_url} download={release.file_name} onClick={recordDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download for Windows
          </a>
        </Button>
        <p className={`mt-3 text-xs leading-relaxed ${metaClass}`}>
          Version {release.version} · {release.file_name}
          {size ? ` · ${size}` : ""} · Windows 10/11 (64-bit)
          {release.sha256 && (
            <>
              <br />
              SHA-256 {release.sha256.slice(0, 32)}…
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div>
      <Button
        onClick={() => (release === null ? setPendingOpen(true) : null)}
        disabled={release === undefined}
        size="lg"
        variant={buttonVariant}
        className={className}
      >
        {release === undefined ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {release === undefined ? "Checking installer" : "Download for Windows"}
      </Button>
      <p className={`mt-3 text-xs leading-relaxed ${metaClass}`}>
        Windows 10/11, 64-bit. A normal installer: double-click, install, and the app asks for consent
        on first launch.
      </p>
      <PendingBuildDialog open={pendingOpen} onOpenChange={setPendingOpen} />
    </div>
  );
}