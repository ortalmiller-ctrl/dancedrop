import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Activity, LayoutDashboard, LogOut, Menu, MonitorSmartphone, Sparkles, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/devices", label: "Devices", icon: MonitorSmartphone },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/characters", label: "Characters", icon: Sparkles },
];

export default function AdminShell({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isAdmin = user?.role === "admin";

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            <item.icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-svh bg-[#F5F5F2] lg:flex">
      <aside className="sticky top-0 hidden h-svh w-[236px] shrink-0 flex-col justify-between border-r border-white/10 bg-[#0B0B0C] px-3 py-5 text-white lg:flex">
        <div>
          <Link to="/dashboard" className="mb-7 flex items-center gap-2.5 px-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0B0B0C]" />
            </span>
            <span className="font-heading text-[1rem] font-bold">DanceDrop</span>
          </Link>
          {nav}
        </div>
        <div className="space-y-3 border-t border-white/10 pt-4">
          <Link to="/" className="block px-3 text-xs text-white/40 hover:text-white/70">
            ← Public site
          </Link>
          <div className="px-3">
            <p className="truncate text-xs text-white/70">{user?.full_name || user?.email}</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">{user?.role || "user"}</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-white/50 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0B0B0C] px-4 py-3 text-white lg:hidden">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary">
              <span className="h-2 w-2 rounded-full bg-[#0B0B0C]" />
            </span>
            <span className="font-heading text-sm font-bold">DanceDrop</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </header>

        {open && (
          <div className="border-b border-white/10 bg-[#0B0B0C] px-3 py-4 text-white lg:hidden">
            {nav}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <p className="px-3 text-xs text-white/50">{user?.email}</p>
              <button type="button" onClick={() => logout()} className="px-3 text-xs text-white/50">
                Sign out
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {!isAdmin && user && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              This console is administrator-only. Your account is signed in as{" "}
              <span className="font-medium">{user.role}</span>, so device data stays hidden.
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}