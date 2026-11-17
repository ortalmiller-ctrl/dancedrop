import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Terminal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PendingBuildDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">The Windows installer is not published yet</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            The companion is built as a real Windows installer by a GitHub Actions build step, not by
            the website. No placeholder file will ever be handed to you as a download.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-xl border border-black/10 bg-[#FAFAF8] p-4">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" /> What is left to do
            </p>
            <ol className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-[#0B0B0C]">
              <li>1. Sync this app to a GitHub repository.</li>
              <li>
                2. Run the "Build Windows installer" workflow, or push a version tag such as{" "}
                <span className="font-mono text-[12px]">v1.0.0</span>.
              </li>
              <li>3. Add the built installer's URL as a CompanionRelease record.</li>
            </ol>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              The workflow, the full Electron source and the exact record to fill in are on the
              companion build page.
            </p>
          </div>

          <Link
            to="/desktop-app"
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-between rounded-xl border border-black/10 p-3 text-sm hover:border-black/25"
          >
            <span>Build pipeline and app source</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            to="/preview"
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-between rounded-xl border border-black/10 p-3 text-sm hover:border-black/25"
          >
            <span>Use this browser as a companion instead</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}