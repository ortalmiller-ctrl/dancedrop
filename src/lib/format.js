export function formatRelative(iso) {
  if (!iso) return "—";
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return "—";
  const diff = Math.round((Date.now() - time) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatUntil(iso) {
  if (!iso) return "—";
  const diff = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  if (!Number.isFinite(diff)) return "—";
  if (diff <= 0) return "expired";
  if (diff < 60) return `${diff}s left`;
  return `${Math.ceil(diff / 60)}m left`;
}

export function formatResolution(width, height) {
  if (!width || !height) return "—";
  return `${Math.round(width)} × ${Math.round(height)}`;
}