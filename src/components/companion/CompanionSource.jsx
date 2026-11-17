import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { characterBySlug } from "@/lib/characters";

const BIBI_PHOTO = characterBySlug("bibi").photo;

const FILES = [
  {
    name: "main.js",
    language: "javascript",
    content: `// DanceDrop desktop companion (Electron, Windows first, macOS later).
// One job: draw a transparent, click-through overlay when the admin console
// sends THIS device an animation. No screen capture, no input control.

const { app, BrowserWindow, Tray, Menu, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const API_BASE = process.env.DANCEDROP_API || 'https://your-app.base44.app';
const CONFIG_PATH = path.join(app.getPath('userData'), 'device.json');

let tray = null;
let overlay = null;
let paused = false;
let timer = null;
let heartbeat = null;

function readConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch (error) { return null; }
}

function writeConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });
}

async function request(pathname, body, method) {
  const config = readConfig();
  if (!config) throw new Error('not activated');
  const response = await fetch(API_BASE + pathname, {
    method: method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-device-id': config.device_id,
      'x-device-secret': config.device_secret,
    },
    body: method === 'DELETE' ? undefined : JSON.stringify(body || {}),
  });
  if (!response.ok) throw new Error('DanceDrop API ' + response.status);
  return response.json();
}

function createOverlay() {
  const { workArea } = screen.getPrimaryDisplay();
  overlay = new BrowserWindow({
    x: workArea.x,
    y: workArea.y,
    width: workArea.width,
    height: workArea.height,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  overlay.setAlwaysOnTop(true, 'screen-saver');
  overlay.setIgnoreMouseEvents(true, { forward: true });
  overlay.setVisibleOnAllWorkspaces(true);
  overlay.loadFile('overlay.html');
}

function play(command, seconds) {
  clearTimeout(timer);
  if (!overlay) return;
  if (!command) {
    overlay.webContents.send('overlay:clear');
    return;
  }
  overlay.webContents.send('overlay:play', command);
  timer = setTimeout(() => {
    overlay.webContents.send('overlay:clear');
    request('/api/device/ack', { command_id: command.id, status: 'completed' }).catch(() => {});
  }, Math.min(seconds || 8, 120) * 1000);
}

async function handleCommand(command) {
  if (command.command_type === 'stop') {
    play(null);
    request('/api/device/ack', { command_id: command.id, status: 'acknowledged' }).catch(() => {});
    return;
  }
  await request('/api/device/ack', { command_id: command.id, status: 'acknowledged' }).catch(() => {});
  play(command, command.duration_seconds);
}

async function beat() {
  const display = screen.getPrimaryDisplay();
  try {
    const data = await request('/api/device/heartbeat', {
      paused: paused,
      screen_width: display.workAreaSize.width,
      screen_height: display.workAreaSize.height,
    });
    if (data.consent_status !== 'granted') return;
    for (const command of data.commands) await handleCommand(command);
  } catch (error) {
    // offline: the next heartbeat retries. Nothing is queued locally.
  }
}

function startHeartbeat() {
  if (heartbeat) clearInterval(heartbeat);
  heartbeat = setInterval(beat, 8000);
  beat();
}

function buildTray() {
  const config = readConfig();
  tray = new Tray(nativeImage.createEmpty());
  tray.setToolTip('DanceDrop');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: config ? 'Device ' + config.device_id : 'Not activated', enabled: false },
    { label: config ? 'Code ' + config.activation_code : 'Run activation', enabled: false },
    { type: 'separator' },
    {
      label: paused ? 'Resume animations' : 'Pause animations',
      click: async () => {
        paused = !paused;
        play(null);
        await request('/api/device/consent', { status: paused ? 'revoked' : 'granted' }).catch(() => {});
        buildTray();
      },
    },
    {
      label: 'Disconnect device',
      click: async () => {
        await request('/api/device/consent', null, 'DELETE').catch(() => {});
        fs.rmSync(CONFIG_PATH, { force: true });
        play(null);
        buildTray();
      },
    },
    { type: 'separator' },
    { label: 'Quit DanceDrop', click: () => app.quit() },
  ]));
}

app.dock?.hide();
app.whenReady().then(() => {
  createOverlay();
  buildTray();
  if (readConfig()) startHeartbeat();
});

app.on('window-all-closed', () => {
  // tray application: keep running until the user quits
});
`,
  },
  {
    name: "preload.js",
    language: "javascript",
    content: `const { contextBridge, ipcRenderer } = require('electron');

// The overlay page gets a tiny, read-only bridge. No Node, no IPC back into the
// main process beyond these two subscriptions.
contextBridge.exposeInMainWorld('dancedrop', {
  onPlay: (callback) => ipcRenderer.on('overlay:play', (_event, command) => callback(command)),
  onClear: (callback) => ipcRenderer.on('overlay:clear', () => callback()),
});
`,
  },
  {
    name: "overlay.html",
    language: "html",
    content: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; height: 100%; background: transparent; overflow: hidden; }
      #stage { position: fixed; inset: 0; pointer-events: none; }
      .actor { position: absolute; transition: opacity 120ms ease; }
      .actor svg { width: 100%; height: 100%; display: block; }
      .dance { animation: dance 1.1s ease-in-out infinite; transform-origin: 50% 92%; }
      @keyframes dance {
        0%, 100% { transform: rotate(-7deg); }
        50% { transform: rotate(7deg) translateY(-4%); }
      }
    </style>
  </head>
  <body>
    <div id="stage"></div>
    <script>
      var stage = document.getElementById('stage');
      var current = null;

      // Relative sizing: a share of the shorter usable edge, never distorted.
      function sizeFor(position) {
        var base = Math.min(window.innerWidth, window.innerHeight);
        return { px: Math.round(Math.min(Math.max(base * 0.26, 160), 460)) };
      }

      var BIBI_PHOTO = '${BIBI_PHOTO}';

      function place(position) {
        var px = sizeFor(position).px;
        var centered = position === 'center';
        current.dataset.position = position;
        current.style.width = px + 'px';
        current.style.height = px + 'px';
        var pad = Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.04);
        current.style.left = centered ? '50%' : (position === 'bottom-right' ? '' : pad + 'px');
        current.style.right = position === 'bottom-right' ? pad + 'px' : '';
        current.style.top = centered ? '50%' : '';
        current.style.bottom = centered ? '' : pad + 'px';
        current.style.transform = centered ? 'translate(-50%, -50%)' : '';
      }

      window.dancedrop.onPlay(function (command) {
        var position = command.position === 'random'
          ? ['bottom-left', 'bottom-right', 'center'][Math.floor(Math.random() * 3)]
          : (command.position || 'center');
        if (current) current.remove();
        current = document.createElement('div');
        current.className = 'actor';
        current.innerHTML = command.character_slug === 'bibi'
          ? '<img class="dance" alt="" src="' + BIBI_PHOTO + '" style="width:100%;height:100%;object-fit:contain;border-radius:50%" />'
          : '<svg viewBox="0 0 200 200" class="dance">' +
            '<path d="M100 22 C130 32 146 64 140 104 C134 144 120 172 100 180 C80 172 66 144 60 104 C54 64 70 32 100 22 Z" fill="#FFC53D" stroke="#141110" stroke-width="6"/>' +
            '<circle cx="85" cy="96" r="5" fill="#141110"/><circle cx="115" cy="96" r="5" fill="#141110"/>' +
            '</svg>';
        stage.appendChild(current);
        place(position);
      });

      window.dancedrop.onClear(function () {
        if (current) current.remove();
        current = null;
      });

      window.addEventListener('resize', function () {
        if (!current) return;
        place(current.dataset.position || 'center');
      });
    </script>
  </body>
</html>
`,
  },
  {
    name: "package.json",
    language: "json",
    content: `{
  "name": "dancedrop-companion",
  "version": "1.0.0-preview",
  "private": true,
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build:win": "electron-builder --win nsis"
  },
  "devDependencies": {
    "electron": "^33.0.0",
    "electron-builder": "^25.0.0"
  },
  "build": {
    "appId": "app.dancedrop.companion",
    "productName": "DanceDrop",
    "win": { "target": "nsis" },
    "files": ["main.js", "preload.js", "overlay.html"]
  }
}
`,
  },
];

export default function CompanionSource() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const active = FILES[activeIndex];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(active.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  const download = () => {
    const blob = new Blob([active.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = active.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F0F12]">
      <div className="dd-scroll flex items-center gap-1 overflow-x-auto border-b border-white/10 px-2 py-2">
        {FILES.map((file, index) => (
          <button
            key={file.name}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
              index === activeIndex
                ? "bg-white/10 text-white"
                : "text-white/40 hover:bg-white/5 hover:text-white/70"
            }`}
          >
            {file.name}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={copy}
            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Copy file"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={download}
            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Download file"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      <pre className="dd-scroll max-h-[520px] overflow-auto p-5 text-[11px] leading-relaxed text-white/70">
        <code>{active.content}</code>
      </pre>
    </div>
  );
}