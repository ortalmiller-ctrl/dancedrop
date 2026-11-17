// DanceDrop desktop companion.
// One job: when the owner has granted consent, draw a character in a
// transparent, click-through, always-on-top overlay on top of other windows.
// No screen capture, no input control, no auto-start, no silent activation.

const { app, BrowserWindow, Tray, Menu, screen, nativeImage, ipcMain, shell } = require('electron');
const path = require('path');
const api = require('./api');
const store = require('./store');
const overlay = require('./overlay');

const HEARTBEAT_MS = 5000;
const SITE_URL = 'https://dance-drop-live.base44.app';

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const state = {
  config: store.load(),
  consent: 'pending',
  paused: false,
  online: false,
  busylocal: false,
  lastError: '',
  activeCommand: null,
};

let tray = null;
let mainWindow = null;
let heartbeatTimer = null;
let finishTimer = null;
let quitting = false;

function snapshot() {
  return {
    activated: Boolean(state.config),
    device_id: state.config ? state.config.device_id : '',
    activation_code: state.config ? state.config.activation_code : '',
    nickname: state.config ? state.config.nickname : '',
    consent: state.consent,
    paused: state.paused,
    online: state.online,
    active: Boolean(state.activeCommand),
    active_name: state.activeCommand ? state.activeCommand.character_name : '',
    active_animation: state.activeCommand ? state.activeCommand.animation : '',
    last_error: state.lastError,
    version: app.getVersion(),
    api_base: api.baseUrl(),
  };
}

function broadcast() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('dancedrop:state', snapshot());
  }
  updateTray();
}

/* ---------------- overlay playback ---------------- */

function clearOverlay() {
  clearTimeout(finishTimer);
  finishTimer = null;
  overlay.clear();
}

function stopNow(reason) {
  const active = state.activeCommand;
  clearOverlay();
  state.activeCommand = null;
  if (active && state.config) {
    api.ack(state.config, active.id, 'completed', reason || 'Stopped locally by the device owner').catch(function () {});
  }
  broadcast();
}

function playCommand(command) {
  const seconds = Math.min(Math.max(Number(command.duration_seconds) || 10, 3), 120);
  state.activeCommand = command;
  overlay.play(
    {
      id: command.id,
      command_type: command.command_type,
      character_slug: command.character_slug,
      character_name: command.character_name,
      animation: command.animation,
      position: command.position,
    },
    seconds
  );
  broadcast();

  clearTimeout(finishTimer);
  finishTimer = setTimeout(function () {
    if (!state.activeCommand || state.activeCommand.id !== command.id) return;
    clearOverlay();
    state.activeCommand = null;
    if (state.config) api.ack(state.config, command.id, 'completed').catch(function () {});
    broadcast();
  }, seconds * 1000);
}

async function handleCommand(command) {
  if (!state.config) return;

  if (command.command_type === 'stop') {
    stopNow('Stopped remotely');
    api.ack(state.config, command.id, 'acknowledged').catch(function () {});
    return;
  }

  if (state.consent !== 'granted' || state.paused) {
    api.ack(state.config, command.id, 'rejected', 'Remote animations are turned off on this device').catch(function () {});
    return;
  }

  api.ack(state.config, command.id, 'acknowledged').catch(function () {});
  playCommand(command);
}

/* ---------------- heartbeat ---------------- */

async function heartbeat() {
  if (!state.config || state.busylocal) return;
  const display = screen.getPrimaryDisplay();
  try {
    const data = await api.heartbeat(state.config, {
      paused: state.paused,
      app_version: app.getVersion(),
      screen_width: display.bounds.width,
      screen_height: display.bounds.height,
      device_pixel_ratio: display.scaleFactor,
    });
    state.online = true;
    state.lastError = '';
    if (data.consent_status) state.consent = data.consent_status;
    if (state.consent === 'revoked' && state.activeCommand) stopNow('Consent withdrawn on this device');
    for (const command of data.commands || []) {
      await handleCommand(command);
    }
    broadcast();
  } catch (error) {
    state.online = false;
    state.lastError = error.message || 'Not reachable';
    if (error.status === 403 || error.status === 401) {
      // The device was disconnected or removed in the admin console.
      stopHeartbeat();
      store.clear();
      state.config = null;
      state.activeCommand = null;
      clearOverlay();
      state.lastError = 'This device was disconnected. Activate it again to reconnect.';
    }
    broadcast();
  }
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeat();
  heartbeatTimer = setInterval(heartbeat, HEARTBEAT_MS);
}

function stopHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

/* ---------------- activation and consent ---------------- */

async function activate(payload) {
  const nickname = String((payload && payload.nickname) || '').slice(0, 40);
  const display = screen.getPrimaryDisplay();
  const os = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'macos' : 'linux';

  state.busylocal = true;
  try {
    const response = await api.register({
      nickname: nickname,
      client_type: 'desktop',
      os: os,
      os_version: process.getSystemVersion ? process.getSystemVersion() : '',
      app_version: app.getVersion(),
      screen_width: display.bounds.width,
      screen_height: display.bounds.height,
      device_pixel_ratio: display.scaleFactor,
    });

    state.config = {
      device_id: response.device_id,
      device_secret: response.device_secret,
      activation_code: response.activation_code,
      nickname: response.nickname || nickname,
    };
    store.save(state.config);
    state.consent = 'pending';
    state.paused = true;
    state.online = true;

    if (payload && payload.consent) {
      await grantConsent(true);
    }

    startHeartbeat();
    broadcast();
    return { ok: true, snapshot: snapshot() };
  } catch (error) {
    state.lastError = error.message || 'Activation failed';
    broadcast();
    return { ok: false, error: state.lastError };
  } finally {
    state.busylocal = false;
  }
}

async function grantConsent(granted) {
  if (!state.config) return { ok: false, error: 'This device is not activated yet' };
  try {
    const response = await api.consent(state.config, granted ? 'granted' : 'revoked');
    state.consent = response.consent_status || (granted ? 'granted' : 'revoked');
    state.paused = !granted;
    if (!granted) stopNow('Remote animations turned off on this device');
    state.lastError = '';
    broadcast();
    return { ok: true, snapshot: snapshot() };
  } catch (error) {
    state.lastError = error.message || 'Could not change consent';
    broadcast();
    return { ok: false, error: state.lastError };
  }
}

async function forgetDevice() {
  if (!state.config) return { ok: true };
  stopHeartbeat();
  await api.disconnect(state.config).catch(function () {});
  store.clear();
  state.config = null;
  state.consent = 'pending';
  state.online = false;
  state.activeCommand = null;
  clearOverlay();
  broadcast();
  return { ok: true, snapshot: snapshot() };
}

/* ---------------- windows ---------------- */

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 470,
    height: 700,
    minWidth: 420,
    minHeight: 560,
    show: false,
    title: 'DanceDrop',
    backgroundColor: '#FAFAF8',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', function () {
    mainWindow.show();
  });

  mainWindow.on('close', function (event) {
    if (quitting) return;
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.webContents.setWindowOpenHandler(function () {
    return { action: 'deny' };
  });
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
    return;
  }
  mainWindow.show();
  mainWindow.focus();
}

/* ---------------- tray ---------------- */

function trayImage() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
  return icon.isEmpty() ? nativeImage.createEmpty() : icon.resize({ width: 16, height: 16 });
}

function updateTray() {
  if (!tray) return;
  const active = Boolean(state.activeCommand);
  const consentGranted = state.consent === 'granted';

  const template = [
    {
      label: state.config ? 'Device ' + state.config.device_id : 'Not activated',
      enabled: false,
    },
    {
      label: state.config ? 'Activation code ' + state.config.activation_code : 'Open DanceDrop to activate',
      enabled: false,
    },
    { type: 'separator' },
    { label: 'Stop animation now', enabled: active, click: function () { stopNow('Stopped from the tray'); } },
    {
      label: consentGranted ? 'Pause remote animations' : 'Allow remote animations',
      enabled: Boolean(state.config),
      click: function () { grantConsent(!consentGranted); },
    },
    { type: 'separator' },
    { label: 'Open DanceDrop', click: showMainWindow },
    { label: 'Quit DanceDrop', click: function () { quitApp(); } },
  ];

  tray.setToolTip(state.activeCommand ? 'DanceDrop - animating' : 'DanceDrop companion');
  tray.setContextMenu(Menu.buildFromTemplate(template));
}

function createTray() {
  tray = new Tray(trayImage());
  tray.on('click', showMainWindow);
  updateTray();
}

function quitApp() {
  quitting = true;
  stopHeartbeat();
  clearOverlay();
  app.quit();
}

/* ---------------- ipc ---------------- */

function registerIpc() {
  ipcMain.handle('dancedrop:state', function () {
    return snapshot();
  });
  ipcMain.handle('dancedrop:activate', function (_event, payload) {
    return activate(payload || {});
  });
  ipcMain.handle('dancedrop:consent', function (_event, granted) {
    return grantConsent(Boolean(granted));
  });
  ipcMain.handle('dancedrop:stop', function () {
    stopNow('Stopped locally by the device owner');
    return snapshot();
  });
  ipcMain.handle('dancedrop:forget', function () {
    return forgetDevice();
  });
  ipcMain.handle('dancedrop:quit', function () {
    quitApp();
    return true;
  });
  ipcMain.handle('dancedrop:open-site', function (_event, pathname) {
    const url = SITE_URL + String(pathname || '/');
    shell.openExternal(url);
    return true;
  });
}

/* ---------------- lifecycle ---------------- */

app.setAppUserModelId('app.dancedrop.companion');

app.on('second-instance', showMainWindow);

app.whenReady().then(function () {
  overlay.rebuild();
  overlay.watchDisplays();
  createTray();
  createMainWindow();
  registerIpc();
  if (state.config) startHeartbeat();
  else state.paused = true;
});

app.on('before-quit', function () {
  quitting = true;
  stopHeartbeat();
  clearOverlay();
  overlay.destroy();
});

app.on('activate', function () {
  showMainWindow();
});

app.on('window-all-closed', function () {
  // Tray application: it keeps running until the owner picks Quit DanceDrop.
});