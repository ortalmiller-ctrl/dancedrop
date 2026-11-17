import { createFileRoute } from "@tanstack/react-router";
import { findAuthenticatedDevice, jsonResponse, logEvent, nowIso } from "@/lib/device.server";

const STATUSES = ["acknowledged", "completed", "rejected"];

export const Route = createFileRoute("/api/device/ack")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const db = context.getBase44().asServiceRole;
        const auth = await findAuthenticatedDevice(db, request);
        if (auth.error) return jsonResponse({ error: auth.error }, auth.status);

        const body = await request.json().catch(() => ({}));
        const commandId = typeof body.command_id === "string" ? body.command_id.slice(0, 64) : "";
        const status = STATUSES.includes(body.status) ? body.status : "acknowledged";
        if (!commandId) return jsonResponse({ error: "missing_command_id" }, 400);

        const command = await db.entities.AnimationCommand.get(commandId).catch(() => null);
        if (!command) return jsonResponse({ error: "command_not_found" }, 404);
        if (command.device_id !== auth.device.device_id) {
          return jsonResponse({ error: "command_belongs_to_another_device" }, 403);
        }

        const timestamp = nowIso();
        const patch = { status, device_message: String(body.message || "").slice(0, 120) };
        if (status === "acknowledged") patch.acknowledged_at = timestamp;
        if (status === "completed") {
          patch.acknowledged_at = command.acknowledged_at || timestamp;
          patch.completed_at = timestamp;
        }

        await db.entities.AnimationCommand.update(command.id, patch);
        await logEvent(db, {
          device_id: command.device_id,
          command_id: command.id,
          event_type: status === "rejected" ? "command_rejected" : `command_${status}`,
          actor: command.device_id,
          message: status === "rejected" ? patch.device_message || "Rejected by device" : `Command ${status}`,
        });

        return jsonResponse({ ok: true, status });
      },
    },
  },
});