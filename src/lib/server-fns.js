import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const ONLINE_WINDOW_MS = 75_000;
const MAX_DURATION_SECONDS = 120;

function asArray(result) {
  if (Array.isArray(result)) return result;
  return result?.items || [];
}

function nowIso() {
  return new Date().toISOString();
}

function isOnline(device) {
  if (!device || device.revoked) return false;
  const seen = new Date(device.last_seen || 0).getTime();
  return Number.isFinite(seen) && Date.now() - seen < ONLINE_WINDOW_MS;
}

function requireAdmin(context) {
  if (context.user?.role !== "admin") {
    const error = new Error("Administrator access required");
    error.status = 403;
    throw error;
  }
}

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parseInstallerUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw fail("Paste the full https link to the installer file");
  }
  if (parsed.protocol !== "https:") throw fail("The installer link must start with https://");
  const path = parsed.pathname.toLowerCase();
  if (path.endsWith(".zip")) {
    throw fail("That link is a ZIP archive. Paste the direct .exe download link instead.");
  }
  if (path.includes("/actions/runs/") || path.includes("/artifacts")) {
    throw fail("That is a GitHub Actions page, not a file. Open the release and copy the asset link that ends in .exe.");
  }
  if (!path.endsWith(".exe")) {
    throw fail("The link must point directly to the .exe file, so it has to end with .exe.");
  }
  return parsed;
}

function shapeDevice(device, latestCommand) {
  return {
    id: device.id,
    device_id: device.device_id,
    nickname: device.nickname,
    client_type: device.client_type,
    os: device.os,
    os_version: device.os_version,
    app_version: device.app_version,
    screen_width: device.screen_width,
    screen_height: device.screen_height,
    device_pixel_ratio: device.device_pixel_ratio,
    activation_code: device.activation_code,
    consent_status: device.consent_status,
    online: isOnline(device),
    revoked: Boolean(device.revoked),
    last_seen: device.last_seen,
    created_date: device.created_date,
    animation_status: latestCommand
      ? {
          status: latestCommand.status,
          character_name: latestCommand.character_name,
          animation: latestCommand.animation,
          command_type: latestCommand.command_type,
          expires_at: latestCommand.expires_at,
        }
      : null,
  };
}

export const getOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;

    const [devices, commands, activations, downloads] = await Promise.all([
      asArray(await db.entities.RegisteredDevice.list({ sort: "-created_date", limit: 500 })),
      asArray(await db.entities.AnimationCommand.list({ sort: "-created_date", limit: 200 })),
      asArray(await db.entities.DeviceActivation.list({ sort: "-activated_at", limit: 8 })),
      asArray(await db.entities.DeviceDownload.list({ sort: "-created_date", limit: 100 })),
    ]);

    const now = Date.now();
    const activeCommands = commands.filter(
      (command) =>
        ["delivered", "acknowledged"].includes(command.status) &&
        new Date(command.expires_at).getTime() > now
    );
    const onlineDevices = devices.filter(isOnline);

    return {
      total: devices.length,
      online: onlineDevices.length,
      offline: devices.length - onlineDevices.length,
      activeAnimations: activeCommands.length,
      consenting: devices.filter((d) => d.consent_status === "granted" && !d.revoked).length,
      pendingConsent: devices.filter((d) => d.consent_status === "pending" && !d.revoked).length,
      revoked: devices.filter((d) => d.revoked).length,
      downloads: downloads.length,
      activations,
      activeCommands: activeCommands.slice(0, 5).map((command) => ({
        id: command.id,
        device_id: command.device_id,
        device_nickname: command.device_nickname,
        character_name: command.character_name,
        animation: command.animation,
        expires_at: command.expires_at,
        status: command.status,
      })),
      devices: devices.slice(0, 6).map((device) => shapeDevice(device)),
    };
  });

export const listDevices = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ search: z.string().max(60).optional() }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;

    const [devices, commands] = await Promise.all([
      asArray(await db.entities.RegisteredDevice.list({ sort: "-created_date", limit: 400 })),
      asArray(await db.entities.AnimationCommand.list({ sort: "-created_date", limit: 400 })),
    ]);

    const latestByDevice = new Map();
    for (const command of commands) {
      if (!latestByDevice.has(command.device_id)) latestByDevice.set(command.device_id, command);
    }

    const term = (data.search || "").trim().toLowerCase();
    const shaped = devices.map((device) => shapeDevice(device, latestByDevice.get(device.device_id)));

    if (!term) return shaped;
    return shaped.filter((device) =>
      [device.device_id, device.nickname, device.activation_code, device.os, device.consent_status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  });

export const getDevice = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ deviceId: z.string().min(3).max(40) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;

    const rows = await db.entities.RegisteredDevice.filter({ device_id: data.deviceId });
    const device = rows[0];
    if (!device) return null;

    const [commands, events, consents, activations] = await Promise.all([
      asArray(await db.entities.AnimationCommand.filter({ device_id: data.deviceId })),
      asArray(await db.entities.AnimationEvent.filter({ device_id: data.deviceId })),
      asArray(await db.entities.DeviceConsent.filter({ device_id: data.deviceId })),
      asArray(await db.entities.DeviceActivation.filter({ device_id: data.deviceId })),
    ]);

    const byDate = (a, b) =>
      new Date(b.created_date || b.changed_at || 0) - new Date(a.created_date || a.changed_at || 0);

    return {
      device: shapeDevice(device, commands.sort(byDate)[0]),
      commands: commands.sort(byDate).slice(0, 25),
      events: events.sort(byDate).slice(0, 30),
      consents: consents.sort(byDate).slice(0, 10),
      activations: activations.sort(byDate).slice(0, 10),
    };
  });

export const sendAnimation = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      deviceId: z.string().min(3).max(40),
      characterSlug: z.string().min(1).max(40),
      animation: z.enum(["dance", "jump", "spin", "wave", "bounce"]),
      durationSeconds: z.number().min(3).max(MAX_DURATION_SECONDS),
      position: z.enum(["bottom-left", "bottom-right", "center", "random"]),
    })
  )
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;

    const rows = await db.entities.RegisteredDevice.filter({ device_id: data.deviceId });
    const device = rows[0];
    if (!device) throw fail("Device not found", 404);
    if (device.revoked) throw fail("This device has been disconnected", 409);
    if (device.consent_status !== "granted") {
      throw fail("This device has not granted consent for remote animations", 409);
    }
    if (!isOnline(device)) throw fail("This device is offline right now", 409);

    const previous = asArray(await db.entities.AnimationCommand.filter({ device_id: data.deviceId }));
    const newest = previous.sort(
      (a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)
    )[0];
    if (newest && Date.now() - new Date(newest.created_date).getTime() < 2500) {
      throw fail("Slow down: wait a couple of seconds between commands to one device", 429);
    }

    const characters = await db.entities.AnimationCharacter.filter({ slug: data.characterSlug });
    const character = characters[0];

    await db.entities.AnimationCommand.updateMany(
      { device_id: data.deviceId, status: { $in: ["pending", "delivered", "acknowledged"] } },
      { $set: { status: "stopped", completed_at: nowIso() } }
    );

    const expiresAt = new Date(Date.now() + 120_000).toISOString();
    const command = await db.entities.AnimationCommand.create({
      device_id: data.deviceId,
      device_nickname: device.nickname,
      command_type: "start",
      character_slug: data.characterSlug,
      character_name: character?.name || data.characterSlug,
      animation: data.animation,
      duration_seconds: data.durationSeconds,
      position: data.position,
      status: "pending",
      issued_by_email: context.user.email,
      expires_at: expiresAt,
    });

    await db.entities.AnimationEvent.create({
      device_id: data.deviceId,
      command_id: command.id,
      event_type: "command_created",
      actor: context.user.email,
      message: `Sent ${character?.name || data.characterSlug} (${data.animation}) for ${data.durationSeconds}s`,
    });

    return { id: command.id, status: command.status, expires_at: expiresAt };
  });

export const stopAnimation = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ deviceId: z.string().min(3).max(40) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;

    const rows = await db.entities.RegisteredDevice.filter({ device_id: data.deviceId });
    const device = rows[0];
    if (!device) throw fail("Device not found", 404);

    const timestamp = nowIso();
    await db.entities.AnimationCommand.updateMany(
      { device_id: data.deviceId, status: { $in: ["pending", "delivered", "acknowledged"] } },
      { $set: { status: "stopped", completed_at: timestamp } }
    );

    const command = await db.entities.AnimationCommand.create({
      device_id: data.deviceId,
      device_nickname: device.nickname,
      command_type: "stop",
      status: "pending",
      issued_by_email: context.user.email,
      expires_at: new Date(Date.now() + 120_000).toISOString(),
    });

    await db.entities.AnimationEvent.create({
      device_id: data.deviceId,
      command_id: command.id,
      event_type: "command_stopped",
      actor: context.user.email,
      message: "Stop command issued",
    });

    return { id: command.id };
  });

export const revokeDevice = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ deviceId: z.string().min(3).max(40) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;

    const rows = await db.entities.RegisteredDevice.filter({ device_id: data.deviceId });
    const device = rows[0];
    if (!device) throw fail("Device not found", 404);

    const timestamp = nowIso();
    await db.entities.RegisteredDevice.update(device.id, {
      consent_status: "revoked",
      revoked: true,
      online: false,
      paused: true,
    });

    await db.entities.AnimationCommand.updateMany(
      { device_id: data.deviceId, status: { $in: ["pending", "delivered", "acknowledged"] } },
      { $set: { status: "stopped", completed_at: timestamp } }
    );

    await db.entities.DeviceConsent.create({
      device_id: data.deviceId,
      status: "revoked",
      source: "admin",
      changed_at: timestamp,
      note: `Revoked by ${context.user.email}`,
    });

    await db.entities.DeviceActivation.create({
      device_id: data.deviceId,
      nickname: device.nickname,
      activation_code: device.activation_code,
      os: device.os,
      client_type: device.client_type,
      status: "revoked",
      activated_at: timestamp,
    });

    await db.entities.AnimationEvent.create({
      device_id: data.deviceId,
      event_type: "admin_revoked",
      actor: context.user.email,
      message: "Device authorization revoked from the admin console",
    });

    return { ok: true };
  });

export const listActivity = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;

    const [events, activations, commands] = await Promise.all([
      asArray(await db.entities.AnimationEvent.list({ sort: "-created_date", limit: 120 })),
      asArray(await db.entities.DeviceActivation.list({ sort: "-activated_at", limit: 60 })),
      asArray(await db.entities.AnimationCommand.list({ sort: "-created_date", limit: 60 })),
    ]);

    return { events, activations, commands };
  });

export const setCharacterEnabled = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1), enabled: z.boolean() }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    await db.entities.AnimationCharacter.update(data.id, { enabled: data.enabled });
    return { ok: true };
  });

/* ---------------- companion releases ---------------- */

export const getCompanionRelease = createServerFn({ method: "GET" })
  .validator(z.object({ platform: z.enum(["windows", "macos"]).optional() }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const rows = asArray(
      await db.entities.CompanionRelease.filter({
        platform: data.platform || "windows",
        published: true,
      })
    );
    const latest = rows
      .filter((release) => {
        try {
          const parsed = new URL(release.file_url);
          return parsed.protocol === "https:" && parsed.pathname.toLowerCase().endsWith(".exe");
        } catch {
          return false;
        }
      })
      .sort(
        (a, b) =>
          new Date(b.released_at || b.created_date || 0) - new Date(a.released_at || a.created_date || 0)
      )[0];
    if (!latest) return null;

    return {
      version: latest.version,
      platform: latest.platform,
      file_name: latest.file_name || "DanceDrop-Setup.exe",
      file_url: latest.file_url,
      size_bytes: latest.size_bytes || 0,
      sha256: latest.sha256 || "",
      notes: latest.notes || "",
      released_at: latest.released_at || latest.created_date,
    };
  });

export const listCompanionReleases = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    const rows = asArray(
      await db.entities.CompanionRelease.list({ sort: "-created_date", limit: 30 })
    );
    return rows;
  });

export const publishCompanionRelease = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      version: z.string().min(1).max(20),
      fileUrl: z.string().url().max(500),
      fileName: z.string().max(120).optional(),
      sizeBytes: z.number().min(0).max(2_000_000_000).optional(),
      sha256: z.string().max(64).optional(),
      notes: z.string().max(500).optional(),
      published: z.boolean().optional(),
    })
  )
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;

    const parsedUrl = parseInstallerUrl(data.fileUrl);
    const rawName = (data.fileName || "").trim() || "DanceDrop-Setup.exe";
    const fileName = rawName.toLowerCase().endsWith(".exe") ? rawName : `${rawName}.exe`;

    const record = await db.entities.CompanionRelease.create({
      version: data.version,
      platform: "windows",
      file_name: fileName,
      file_url: parsedUrl.toString(),
      size_bytes: data.sizeBytes || 0,
      sha256: (data.sha256 || "").toLowerCase(),
      notes: data.notes || "",
      published: data.published !== false,
      released_at: nowIso(),
    });

    return { ok: true, id: record.id };
  });

export const setCompanionReleasePublished = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1), published: z.boolean() }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const db = context.getBase44().asServiceRole;
    await db.entities.CompanionRelease.update(data.id, { published: data.published });
    return { ok: true, published: data.published };
  });

/* ---------------- public helpers ---------------- */

export const listCharacters = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const rows = await context.getBase44().entities.AnimationCharacter.list({
    sort: "sort_order",
    limit: 50,
  });
  return asArray(rows).map((character) => ({
    id: character.id,
    slug: character.slug,
    name: character.name,
    tagline: character.tagline,
    accent_color: character.accent_color,
    animations: character.animations || [],
    enabled: character.enabled !== false,
    sort_order: character.sort_order || 0,
  }));
});

export const trackDownload = createServerFn({ method: "POST" })
  .validator(
    z.object({
      platform: z.string().max(30).optional(),
      source: z.string().max(30).optional(),
      clientType: z.string().max(20).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    await context.getBase44().asServiceRole.entities.DeviceDownload.create({
      platform: data.platform || "unknown",
      source: data.source || "website",
      client_type: data.clientType || "desktop",
    });
    return { ok: true };
  });

export const lookupDeviceByCode = createServerFn({ method: "POST" })
  .validator(z.object({ code: z.string().min(4).max(20) }))
  .handler(async ({ data, context }) => {
    const code = data.code.trim().toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z0-9]{4}-?[A-Z0-9]{4}$/.test(code)) return null;

    const db = context.getBase44().asServiceRole;
    const rows = await db.entities.RegisteredDevice.filter({ activation_code: code });
    const device = rows[0];
    if (!device) return null;

    return {
      device_id: device.device_id,
      nickname: device.nickname,
      os: device.os,
      client_type: device.client_type,
      consent_status: device.consent_status,
      revoked: Boolean(device.revoked),
      online: isOnline(device),
      last_seen: device.last_seen,
    };
  });

export const revokeDeviceFromPortal = createServerFn({ method: "POST" })
  .validator(z.object({ code: z.string().min(4).max(20), disconnect: z.boolean().optional() }))
  .handler(async ({ data, context }) => {
    const code = data.code.trim().toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z0-9]{4}-?[A-Z0-9]{4}$/.test(code)) throw fail("Invalid activation code", 400);

    const db = context.getBase44().asServiceRole;
    const rows = await db.entities.RegisteredDevice.filter({ activation_code: code });
    const device = rows[0];
    if (!device) throw fail("No device matches that activation code", 404);

    const timestamp = nowIso();
    const disconnect = Boolean(data.disconnect);

    await db.entities.RegisteredDevice.update(device.id, {
      consent_status: "revoked",
      paused: true,
      online: false,
      revoked: device.revoked || disconnect,
    });

    await db.entities.DeviceConsent.create({
      device_id: device.device_id,
      status: "revoked",
      source: "device_portal",
      changed_at: timestamp,
      note: disconnect ? "Consent revoked and device disconnected from the portal" : "Consent revoked from the portal",
    });

    await db.entities.AnimationCommand.updateMany(
      { device_id: device.device_id, status: { $in: ["pending", "delivered", "acknowledged"] } },
      { $set: { status: "stopped", completed_at: timestamp } }
    );

    await db.entities.AnimationEvent.create({
      device_id: device.device_id,
      event_type: disconnect ? "device_disconnected" : "consent_revoked",
      actor: "device_portal",
      message: disconnect ? "Device disconnected from the device portal" : "Consent revoked from the device portal",
    });

    return { ok: true };
  });