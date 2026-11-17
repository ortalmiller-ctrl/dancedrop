import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MonitorSmartphone, Plus, Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import DeviceTable from "@/components/admin/DeviceTable";
import { listDevices } from "@/lib/server-fns";
import useRealtimeRefresh from "@/hooks/useRealtimeRefresh";

export const Route = createFileRoute("/_authed/devices/")({
  head: () => ({ meta: [{ title: "Devices · DanceDrop admin" }] }),
  component: DevicesPage,
});

function DevicesPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const list = useServerFn(listDevices);
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["devices", debounced],
    queryFn: () => list({ data: { search: debounced } }),
    refetchInterval: 6000,
    retry: false,
  });

  useRealtimeRefresh([["devices", debounced], ["overview"]]);

  const online = data.filter((device) => device.online).length;

  return (
    <AdminShell>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Devices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.length} registered · {online} online now · every command targets one row
          </p>
        </div>
        <Link
          to="/preview"
          target="_blank"
          className="inline-flex items-center gap-2 self-start rounded-full border border-black/12 bg-white px-4 py-2 text-xs font-medium hover:border-black/30"
        >
          <Plus className="h-3.5 w-3.5" /> Connect a device
        </Link>
      </div>

      <div className="relative mt-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by nickname, device ID, activation code or OS"
          className="w-full rounded-full border border-black/10 bg-white py-3 pl-11 pr-4 text-sm placeholder:text-black/30 focus:border-primary focus:outline-none"
        />
      </div>

      <div className="mt-5">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-2xl border border-black/[0.07] bg-white px-5 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading devices…
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            {error.message}
          </div>
        )}

        {!isLoading && !error && data.length === 0 && (
          <div className="rounded-2xl border border-black/[0.07] bg-white px-6 py-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#FAFAF8]">
              <MonitorSmartphone className="h-5 w-5 text-black/40" />
            </span>
            <p className="mt-4 font-heading text-base font-semibold">
              {debounced ? "No device matches that search" : "No devices registered yet"}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Activate the browser companion in another tab, or install the desktop app. The moment a
              device registers it appears here.
            </p>
            <Link
              to="/preview"
              target="_blank"
              className="mt-5 inline-flex rounded-full bg-[#0B0B0C] px-5 py-2.5 text-sm font-medium text-white"
            >
              Activate this browser
            </Link>
          </div>
        )}

        {!isLoading && !error && data.length > 0 && <DeviceTable devices={data} />}
      </div>
    </AdminShell>
  );
}