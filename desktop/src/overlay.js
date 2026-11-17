// One transparent, click-through, always-on-top overlay window per display, so
// the character can be drawn anywhere on any monitor at any resolution.

const { BrowserWindow, screen } = require('electron');
const path = require('path');

const windows = new Map();

function createFor(display) {
  const bounds = display.bounds;
  const win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    roundedCorners: false,
    enableLargerThanScreen: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload-overlay.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setIgnoreMouseEvents(true, { forward: true });
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(__dirname, 'renderer', 'overlay.html'));
  win.once('ready-to-show', function () {
    win.showInactive();
  });

  return win;
}

function rebuild() {
  windows.forEach(function (win) {
    if (!win.isDestroyed()) win.destroy();
  });
  windows.clear();
  screen.getAllDisplays().forEach(function (display) {
    windows.set(display.id, createFor(display));
  });
}

function send(channel, payload) {
  windows.forEach(function (win) {
    if (!win.isDestroyed() && win.webContents) win.webContents.send(channel, payload);
  });
}

function play(command, seconds) {
  send('overlay:play', { command: command, seconds: seconds });
}

function clear() {
  send('overlay:clear', null);
}

function watchDisplays() {
  screen.on('display-added', rebuild);
  screen.on('display-removed', rebuild);
  screen.on('display-metrics-changed', rebuild);
}

function destroy() {
  windows.forEach(function (win) {
    if (!win.isDestroyed()) win.destroy();
  });
  windows.clear();
}

module.exports = {
  rebuild: rebuild,
  play: play,
  clear: clear,
  watchDisplays: watchDisplays,
  destroy: destroy,
};