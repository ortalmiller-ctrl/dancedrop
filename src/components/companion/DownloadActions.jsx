import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Copy, Download, ExternalLink, Loader2 } from "lucide-react";
import { trackDownload } from "@/lib/server-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("windows")) return "windows";
  if (ua.includes("mac os")) return "macos";
  if (ua.includes("linux")) return "linux";
  return "unknown";
}

export default function DownloadActions({ variant = "solid" }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const track = useServerFn(trackDownload);

  const handleClick = async () => {
    setBusy(true);
    try {
      await track({ data: { platform: detectPlatform(), source: "download", clientType: "desktop" } });
    } catch (err) {
      // a failed analytics write must not block the user
    } finally {
      setBusy(false);
      setOpen(true);
    }
  };

  const command = "git clone https://github.com/dancedrop/companion && cd companion && npm install && npm start";

  return (
    <>
      <Button
        onClick={handleClick}
        size="lg"
        className={
          variant === "solid"
            ? "h-12 rounded-full bg-primary px-7 text-[15px] font-medium text-white hover:bg-primary/90"
            : "h-12 rounded-full px-7 text-[15px] font-medium"
        }
        variant={variant === "solid" ? "default" : "outline"}
      >
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Download for Desktop
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Companion app: developer preview</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              There is no signed Windows installer yet, and DanceDrop will not pretend otherwise. The
              desktop companion source, the overlay renderer and the device API contract are all
              available now, and the browser companion on this site is the same client logic running
              for real.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-xl border border-black/10 bg-[#FAFAF8] p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Run it locally</p>
              <div className="mt-2 flex items-start gap-2">
                <code className="flex-1 break-all font-mono text-[11px] leading-relaxed text-[#0B0B0C]">
                  {command}
                </code>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(command);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch (err) {
                      setCopied(false);
                    }
                  }}
                  className="rounded-md border border-black/10 bg-white p-1.5 text-muted-foreground hover:text-[#0B0B0C]"
                  aria-label="Copy command"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              {copied && <p className="mt-2 text-[11px] text-emerald-600">Copied</p>}
            </div>

            <Link
              to="/desktop-app"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl border border-black/10 p-3 text-sm hover:border-black/25"
            >
              <span>Read the source and API contract</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/preview"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl border border-black/10 p-3 text-sm hover:border-black/25"
            >
              <span>Activate this browser as a device instead</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}