import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Monitor, ShieldCheck, Waypoints } from "lucide-react";
import CompanionSource from "@/components/companion/CompanionSource";

export const Route = createFileRoute("/_site/desktop-app")({
  head: () => ({
    meta: [
      { title: "DanceDrop companion architecture & API contract" },
      {
        name: "description",
        content:
          "How the DanceDrop desktop companion works: device credentials, heartbeat, overlay renderer, and the device API contract.",
      },
    ],
  }),
  component: DesktopAppPage,
});

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/device/register",
    auth: "None (creates the credential)",
    body: "nickname, os, screen_width, screen_height, client_type",
    returns: "device_id, device_secret, activation_code. The secret is shown once and stored hashed.",
  },
  {
    method: "POST",
    path: "/api/device/heartbeat",
    auth: "x-device-id + x-device-secret",
    body: "paused, screen_width, screen_height",
    returns: "consent_status plus the pending commands for this device, marked delivered.",
  },
  {
    method: "POST",
    path: "/api/device/ack",
    auth: "x-device-id + x-device-secret",
    body: "command_id, status",
    returns: "Delivery proof. A command is only ever acked by the device it was issued to.",
  },
  {
    method: "POST",
    path: "/api/device/consent",
    auth: "x-device-id + x-device-secret",
    body: "status: granted | revoked",
    returns: "Flips consent instantly and expires anything already queued.",
  },
  {
    method: "DELETE",
    path: "/api/device/consent",
    auth: "x-device-id + x-device-secret",
    body: "—",
    returns: "Permanent disconnect. The device is refused until it registers again.",
  },
];

const LAYERS = [
  {
    icon: Monitor,
    title: "Renderer",
    body: "A transparent, frameless, always-on-top window sized to the active display's usable area. setIgnoreMouseEvents keeps every click going to whatever is underneath, so the overlay can never trap your cursor.",
  },
  {
    icon: Waypoints,
    title: "Transport",
    body: "An 8 second heartbeat with a per-device secret. Commands are pulled for that device ID only, expire after 120 seconds, and are acknowledged back so the console can prove delivery.",
  },
  {
    icon: Lock,
    title: "Isolation",
    body: "contextIsolation on, nodeIntegration off. The overlay page only receives two events: play this character, and clear. There is no shell, no file access, no IPC command channel.",
  },
  {
    icon: ShieldCheck,
    title: "Consent",
    body: "Consent is checked server side before a command is queued and again before it is delivered. Pause, Disconnect and Quit in the tray are always local and immediate.",
  },
];

function DesktopAppPage() {
  return (
    <div className="bg-[#0B0B0C] text-white">
      <div className="mx-auto w-full max-w-[1240px] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <span className="text-[11px] uppercase tracking-[0.24em] text-primary">Companion app</span>
        <h1 className="mt-4 max-w-3xl font-heading text-[clamp(2.1rem,1rem+3.6vw,3.4rem)] font-bold leading-[1.05]">
          The desktop client, in the open.
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/60">
          DanceDrop does not ship a signed installer today, so this page gives you the thing that
          actually matters: the architecture, the device API contract and the Electron source. The
          browser companion runs the same protocol, for real, against the same backend.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {LAYERS.map((layer) => (
            <div key={layer.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/[0.04]">
                <layer.icon className="h-4 w-4 text-primary" />
              </span>
              <p className="mt-4 font-heading text-sm font-semibold">{layer.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/50">{layer.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="font-heading text-xl font-semibold">Device API contract</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/50">
            Device endpoints are separate from the admin console. They never accept a user session,
            and they never accept a device ID in the body: identity always comes from the credential
            headers.
          </p>
          <div className="dd-scroll mt-5 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.14em] text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Path</th>
                  <th className="px-4 py-3 font-medium">Auth</th>
                  <th className="px-4 py-3 font-medium">Body</th>
                  <th className="px-4 py-3 font-medium">Returns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {ENDPOINTS.map((endpoint) => (
                  <tr key={endpoint.path + endpoint.method} className="align-top">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{endpoint.method}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/80">{endpoint.path}</td>
                    <td className="px-4 py-3 text-xs text-white/45">{endpoint.auth}</td>
                    <td className="px-4 py-3 text-xs text-white/45">{endpoint.body}</td>
                    <td className="px-4 py-3 text-xs text-white/55">{endpoint.returns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-14">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-heading text-xl font-semibold">Electron source</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/50">
                Copy or download each file into a folder, run npm install, then npm start. Point
                DANCEDROP_API at this app's URL.
              </p>
            </div>
            <Link
              to="/preview"
              className="self-start rounded-full border border-white/20 px-5 py-2 text-sm text-white/75 hover:border-white/40"
            >
              Try the browser client
            </Link>
          </div>
          <div className="mt-5">
            <CompanionSource />
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-primary/30 bg-primary/[0.07] p-6">
          <p className="font-heading text-sm font-semibold">What this build deliberately does not do</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">
            No screen capture, no input injection, no remote shell, no arbitrary code execution, no
            auto-start without consent, no hiding from the tray or from operating system permission
            prompts. Commands carry a character, an animation, a duration and a position. That is the
            entire vocabulary.
          </p>
        </div>
      </div>
    </div>
  );
}