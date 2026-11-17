import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "dancedrop.companion.v1";
const HEARTBEAT_MS = 8000;
const APP_VERSION = "1.0.0-browser";

function detectOS() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("windows")) return "windows";
  if (ua.includes("mac os")) return "macos";
  if (ua.includes("cros")) return "chromeos";
  if (ua.includes("linux")) return "linux";
  return "other";
}

function detectBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/")) return "Safari";
  return "Browser";
}

async function deviceRequest(path, body, device, method = "POST") {
  const headers = { "Content-Type": "application/json" };
  if (device) {
    headers["x-device-id"] = device.device_id;
    headers["x-device-secret"] = device.device_secret;
  }
  const response = await fetch(`/api/device/${path}`, {
    method,
    headers,
    body: method === "DELETE" ? undefined : JSON.stringify(body || {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function resolvePosition(position) {
  if (position !== "random") return position || "center";
  const options = ["bottom-left", "bottom-right", "center"];
  return options[Math.floor(Math.random() * options.length)];
}

export default function useCompanion() {
  const [hydrated, setHydrated] = useState(false);
  const [device, setDevice] = useState(null);
  const [consent, setConsent] = useState("pending");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);
  const [log, setLog] = useState([]);

  const deviceRef = useRef(null);
  const timers = useRef([]);

  const remember = useCallback((next) => {
    deviceRef.current = next;
    setDevice(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const addLog = useCallback((message) => {
    setLog((entries) =>
      [{ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, message, at: new Date() }, ...entries].slice(0, 12)
    );
  }, []);

  const acknowledge = useCallback(
    async (commandId, status) => {
      const current = deviceRef.current;
      if (!current) return;
      try {
        await deviceRequest("ack", { command_id: commandId, status }, current);
      } catch (err) {
        // a missed acknowledgement is retried on the next heartbeat of the real client
      }
    },
    []
  );

  const runCommand = useCallback(
    (command) => {
      if (command.command_type === "stop") {
        setActive(null);
        addLog("Stop command received");
        acknowledge(command.id, "acknowledged");
        return;
      }

      acknowledge(command.id, "acknowledged");
      setActive({
        id: command.id,
        slug: command.character_slug,
        name: command.character_name || command.character_slug,
        animation: command.animation || "dance",
        position: resolvePosition(command.position),
        duration: command.duration_seconds || 8,
      });
      addLog(`Received ${command.character_name || command.character_slug} · ${command.animation}`);

      const timer = setTimeout(() => {
        setActive((current) => (current?.id === command.id ? null : current));
        acknowledge(command.id, "completed");
        addLog("Animation finished");
      }, (command.duration_seconds || 8) * 1000);
      timers.current.push(timer);
    },
    [acknowledge, addLog]
  );

  const beat = useCallback(async () => {
    const current = deviceRef.current;
    if (!current) return;
    try {
      const result = await deviceRequest(
        "heartbeat",
        {
          app_version: APP_VERSION,
          screen_width: window.screen?.width || window.innerWidth,
          screen_height: window.screen?.height || window.innerHeight,
        },
        current
      );
      setConsent(result.consent_status || "pending");
      setError(null);
      (result.commands || []).forEach(runCommand);
    } catch (err) {
      setError(err.message);
      if (/unknown_device|invalid_device_credentials|device_revoked/.test(err.message)) {
        remember(null);
        setConsent("pending");
      }
    }
  }, [remember, runCommand]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        deviceRef.current = parsed;
        setDevice(parsed);
        setConsent(parsed.consent_status || "pending");
      }
    } catch (err) {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !device) return undefined;
    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);
    return () => clearInterval(interval);
  }, [hydrated, device, beat]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  const activate = useCallback(
    async (nickname) => {
      setBusy(true);
      setError(null);
      try {
        const created = await deviceRequest("register", {
          nickname: nickname?.trim() || `${detectBrowserName()} companion`,
          client_type: "browser",
          os: detectOS(),
          os_version: navigator.platform || "unknown",
          app_version: APP_VERSION,
          screen_width: window.screen?.width || window.innerWidth,
          screen_height: window.screen?.height || window.innerHeight,
          device_pixel_ratio: window.devicePixelRatio || 1,
        });
        const next = {
          device_id: created.device_id,
          device_secret: created.device_secret,
          activation_code: created.activation_code,
          nickname: created.nickname,
          consent_status: "pending",
        };
        remember(next);
        setConsent("pending");
        addLog(`Activated as ${created.device_id}`);
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    },
    [addLog, remember]
  );

  const changeConsent = useCallback(
    async (status) => {
      const current = deviceRef.current;
      if (!current) return;
      setBusy(true);
      setError(null);
      try {
        await deviceRequest("consent", { status }, current);
        setConsent(status);
        if (status === "revoked") setActive(null);
        addLog(status === "granted" ? "Remote animations enabled" : "Remote animations paused");
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    },
    [addLog]
  );

  const disconnect = useCallback(async () => {
    const current = deviceRef.current;
    setBusy(true);
    try {
      if (current) await deviceRequest("consent", null, current, "DELETE");
    } catch (err) {
      // even if the network call fails, the local credential is discarded
    } finally {
      remember(null);
      setConsent("pending");
      setActive(null);
      addLog("Disconnected from this browser");
      setBusy(false);
    }
  }, [addLog, remember]);

  return {
    hydrated,
    device,
    consent,
    busy,
    error,
    active,
    log,
    activate,
    enable: () => changeConsent("granted"),
    pause: () => changeConsent("revoked"),
    disconnect,
  };
}