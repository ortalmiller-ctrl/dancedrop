import { Link } from "@tanstack/react-router";

export default function Footer() {
  return (
    <footer className="bg-[#0B0B0C] text-white">
      <div className="mx-auto w-full max-w-[1240px] px-6 py-14 sm:px-8 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0B0B0C]" />
              </span>
              <span className="font-heading text-[1.05rem] font-bold">DanceDrop</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              Consent-based remote animations. A device only dances after its owner installs the
              companion and switches it on. Never a screen recording, never a keystroke.
            </p>
          </div>

          <div className="text-sm">
            <p className="font-heading text-xs uppercase tracking-[0.22em] text-white/40">Product</p>
            <div className="mt-4 flex flex-col gap-3 text-white/60">
              <Link to="/preview" className="hover:text-white">Live demo</Link>
              <Link to="/download" className="hover:text-white">Download & install</Link>
              <a href="/#characters" className="hover:text-white">Character library</a>
              <Link to="/my-device" className="hover:text-white">My device</Link>
            </div>
          </div>

          <div className="text-sm">
            <p className="font-heading text-xs uppercase tracking-[0.22em] text-white/40">Platform</p>
            <div className="mt-4 flex flex-col gap-3 text-white/60">
              <Link to="/dashboard" className="hover:text-white">Admin dashboard</Link>
              <Link to="/desktop-app" className="hover:text-white">Companion architecture</Link>
              <a href="/#privacy" className="hover:text-white">Privacy & permissions</a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DanceDrop. Entertainment only.</p>
          <p>No screen capture · No remote control · Consent can be revoked instantly</p>
        </div>
      </div>
    </footer>
  );
}