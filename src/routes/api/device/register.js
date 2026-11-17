import { createFileRoute } from "@tanstack/react-router";
import {
  expireStaleCommands,
  findAuthenticatedDevice,
  isOnline,
  jsonResponse,
  logEvent,
  makeActivationCode,
  makeDeviceId,
  nowIso,
  randomHex,
  sha256Hex,
} from "@/lib/device.server";

const CLIENT_TYPES = ["desktop", "browser"];
const OS_VALUES = ["windows", "macos", "linux", "chromeos", "other"];

function cleanString(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 && num < 20000 ? Math.round(num) : fallback;
}

export const Route = createFileRoute("/api/device/register")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const db = context.getBase44().asServiceRole;
        const body = await request.json().catch(() => ({}));

        const clientType = CLIENT_TYPES.includes(body.client_type) ? body.client_type : "desktop";
        const os = OS_VALUES.includes(body.os) ? body.os : "other";
        const nickname =
          cleanString(body.nickname, 40) || (clientType === "browser" ? "Browser companion" : "Desktop companion");

        const deviceSecret = randomHex(24);
        const deviceId = makeDeviceId();
        const activationCode = makeActivationCode();
        const timestamp = nowIso();

        const device = await db.entities.RegisteredDevice.create({
          device_id: deviceId,
          nickname,
          client_type: clientType,
          os,
          os_version: cleanString(body.os_version, 40),
          app_version: cleanString(body.app_version, 20) || "1.0.0-preview",
          screen_width: cleanNumber(body.screen_width, 1920),
          screen_height: cleanNumber(body.screen_height, 1080),
          device_pixel_ratio: Number(body.device_pixel_ratio) > 0 ? Number(body.device_pixel_ratio) : 1,
          activation_code: activationCode,
          device_secret_hash: await sha256Hex(deviceSecret),
          consent_status: "pending",
          online: true,
          paused: false,
          revoked: false,
          last_seen: timestamp,
        });

        await db.entities.DeviceActivation.create({
          device_id: deviceId,
          nickname,
          activation_code: activationCode,
          os,
          client_type: clientType,
          app_version: "1.0.0-preview",
          source: clientType === "browser" ? "browser-demo" : "companion",
          status: "activated",
          activated_at: timestamp,
        });

        await logEvent(db, {
          device_id: deviceId,
          event_type: "device_registered",
          actor: deviceId,
          message: `${nickname} registered as a ${clientType} device`,
        });

        await expireStaleCommands(db);

        return jsonResponse({
          device_id: deviceId,
          device_secret: deviceSecret,
          activation_code: activationCode,
          nickname,
          consent_status: "pending",
          online: isOnline(device),
        });
      },
    },
  },
});