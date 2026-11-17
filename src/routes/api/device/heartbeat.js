import { createFileRoute } from "@tanstack/react-router";
import {
  expireStaleCommands,
  findAuthenticatedDevice,
  jsonResponse,
  nowIso,
} from "@/lib/device.server";

export const Route = createFileRoute("/api/device/heartbeat")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const db = context.getBase44().asServiceRole;
        const auth = await findAuthenticatedDevice(db, request);
        if (auth.error) return jsonResponse({ error: auth.error }, auth.status);

        const body = await request.json().catch(() => ({}));
        const { device } = auth;

        await db.entities.RegisteredDevice.update(device.id, {
          online: true,
          last_seen: nowIso(),
          paused: typeof body.paused === "boolean" ? body.paused : Boolean(device.paused),
          app_version: typeof body.app_version === "string" ? body.app_version.slice(0, 20) : device.app_version,
          screen_width: Number(body.screen_width) > 0 ? Math.round(Number(body.screen_width)) : device.screen_width,
          screen_height:
            Number(body.screen_height) > 0 ? Math.round(Number(body.screen_height)) : device.screen_height,
        });

        await expireStaleCommands(db, { device_id: device.device_id });

        if (device.consent_status !== "granted") {
          return jsonResponse({ consent_status: device.consent_status, commands: [] });
        }

        const pending = await db.entities.AnimationCommand.filter({
          device_id: device.device_id,
          status: "pending",
          expires_at: { $gt: nowIso() },
        });

        const ordered = Array.isArray(pending) ? pending.slice(0, 5) : [];
        const timestamp = nowIso();

        if (ordered.length) {
          await db.entities.AnimationCommand.bulkUpdate(
            ordered.map((command) => ({
              id: command.id,
              status: "delivered",
              delivered_at: timestamp,
            }))
          );
        }

        return jsonResponse({
          consent_status: device.consent_status,
          server_time: timestamp,
          commands: ordered.map((command) => ({
            id: command.id,
            command_type: command.command_type,
            character_slug: command.character_slug,
            character_name: command.character_name,
            animation: command.animation,
            duration_seconds: command.duration_seconds,
            position: command.position,
            expires_at: command.expires_at,
          })),
        });
      },
    },
  },
});