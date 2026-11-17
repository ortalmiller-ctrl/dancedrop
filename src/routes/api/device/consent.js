import { createFileRoute } from "@tanstack/react-router";
import {
  expireStaleCommands,
  findAuthenticatedDevice,
  jsonResponse,
  logEvent,
  nowIso,
} from "@/lib/device.server";

export const Route = createFileRoute("/api/device/consent")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const db = context.getBase44().asServiceRole;
        const auth = await findAuthenticatedDevice(db, request);
        if (auth.error) return jsonResponse({ error: auth.error }, auth.status);

        const body = await request.json().catch(() => ({}));
        if (!["granted", "revoked"].includes(body.status)) {
          return jsonResponse({ error: "invalid_status" }, 400);
        }

        const timestamp = nowIso();
        const { device } = auth;

        await db.entities.RegisteredDevice.update(device.id, {
          consent_status: body.status,
          paused: body.status !== "granted",
          last_seen: timestamp,
        });

        await db.entities.DeviceConsent.create({
          device_id: device.device_id,
          status: body.status,
          source: device.client_type === "browser" ? "browser" : "desktop",
          changed_at: timestamp,
          note: body.status === "granted" ? "Owner enabled remote animations" : "Owner disabled remote animations",
        });

        await logEvent(db, {
          device_id: device.device_id,
          event_type: body.status === "granted" ? "consent_granted" : "consent_revoked",
          actor: device.device_id,
          message:
            body.status === "granted"
              ? "Remote animations enabled by the device owner"
              : "Remote animations disabled by the device owner",
        });

        if (body.status === "revoked") {
          await db.entities.AnimationCommand.updateMany(
            { device_id: device.device_id, status: { $in: ["pending", "delivered", "acknowledged"] } },
            { $set: { status: "stopped", completed_at: timestamp } }
          );
          await expireStaleCommands(db, { device_id: device.device_id });
        }

        return jsonResponse({ ok: true, consent_status: body.status });
      },

      // Permanent disconnect: the device stops being reachable until it registers again.
      DELETE: async ({ request, context }) => {
        const db = context.getBase44().asServiceRole;
        const auth = await findAuthenticatedDevice(db, request);
        if (auth.error) return jsonResponse({ error: auth.error }, auth.status);

        const timestamp = nowIso();
        const { device } = auth;

        await db.entities.RegisteredDevice.update(device.id, {
          consent_status: "revoked",
          revoked: true,
          online: false,
          paused: true,
          last_seen: timestamp,
        });

        await db.entities.DeviceConsent.create({
          device_id: device.device_id,
          status: "revoked",
          source: device.client_type === "browser" ? "browser" : "desktop",
          changed_at: timestamp,
          note: "Device disconnected from the DanceDrop network",
        });

        await db.entities.AnimationCommand.updateMany(
          { device_id: device.device_id, status: { $in: ["pending", "delivered", "acknowledged"] } },
          { $set: { status: "stopped", completed_at: timestamp } }
        );

        await logEvent(db, {
          device_id: device.device_id,
          event_type: "device_disconnected",
          actor: device.device_id,
          message: "Device disconnected by its owner",
        });

        return jsonResponse({ ok: true });
      },
    },
  },
});