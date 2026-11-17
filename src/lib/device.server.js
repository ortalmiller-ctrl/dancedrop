const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const ONLINE_WINDOW_MS = 75_000;

export function nowIso() {
  return new Date().toISOString();
}

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function randomHex(bytes = 24) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomChars(length) {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map((b) => ALPHABET[b % ALPHABET.length])
    .join("");
}

export function makeDeviceId() {
  const hex = randomHex(4).toUpperCase();
  return `DD-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

export function makeActivationCode() {
  const code = randomChars(8);
  return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
}

export function normalizeCode(code) {
  return String(code || "").trim().toUpperCase().replace(/\s+/g, "");
}

export function isOnline(device) {
  if (!device || device.revoked) return false;
  const seen = new Date(device.last_seen || 0).getTime();
  return Number.isFinite(seen) && Date.now() - seen < ONLINE_WINDOW_MS;
}

export async function findAuthenticatedDevice(db, request) {
  const deviceId = request.headers.get("x-device-id");
  const secret = request.headers.get("x-device-secret");
  if (!deviceId || !secret) return { error: "missing_device_credentials", status: 401 };

  const rows = await db.entities.RegisteredDevice.filter({ device_id: deviceId });
  const device = rows[0];
  if (!device) return { error: "unknown_device", status: 401 };
  if (device.revoked) return { error: "device_revoked", status: 403 };

  const hash = await sha256Hex(secret);
  if (hash !== device.device_secret_hash) return { error: "invalid_device_credentials", status: 401 };

  return { device };
}

export async function logEvent(db, payload) {
  await db.entities.AnimationEvent.create(payload);
}

export async function expireStaleCommands(db, extra = {}) {
  await db.entities.AnimationCommand.updateMany(
    { ...extra, status: "pending", expires_at: { $lt: nowIso() } },
    { $set: { status: "expired" } }
  );
}

export function jsonResponse(payload, status = 200) {
  return Response.json(payload, { status });
}