import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "How it works", to: "/", hash: "#how-it-works" },
  { label: "Characters", to: "/", hash: "#characters" },
  { label: "Live demo", to: "/preview" },
  { label: "Desktop app", to: "/desktop-app" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0B0C]/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between gap-6 px-6 sm:px-8 lg:px-12">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-primary">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0B0B0C] transition-transform duration-300 group-hover:scale-125" />
          </span>
          <span className="font-heading text-[1.05rem] font-bold tracking-tight">DanceDrop</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-white/60 md:flex">
          {NAV.map((item) =>
            item.hash ? (
              <a key={item.label} href={`/${item.hash}`} className="transition-colors hover:text-white">
                {item.label}
              </a>
            ) : (
              <Link key={item.label} to={item.to} className="transition-colors hover:text-white">
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/my-device" className="text-sm text-white/60 transition-colors hover:text-white">
            My device
          </Link>
          <Link
            to="/dashboard"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#0B0B0C] transition-colors hover:bg-primary hover:text-white"
          >
            Admin dashboard
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/15 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#0B0B0C] px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4 text-sm">
            {NAV.map((item) =>
              item.hash ? (
                <a key={item.label} href={`/${item.hash}`} onClick={() => setOpen(false)} className="text-white/70">
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} to={item.to} onClick={() => setOpen(false)} className="text-white/70">
                  {item.label}
                </Link>
              )
            )}
            <Link to="/my-device" onClick={() => setOpen(false)} className="text-white/70">
              My device
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-full bg-primary px-4 py-2.5 text-center font-medium text-white"
            >
              Admin dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}