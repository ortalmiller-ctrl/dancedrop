const { contextBridge, ipcRenderer } = require('electron');

// The overlay page can only receive a command and clear itself.
contextBridge.exposeInMainWorld('overlayBridge', {
  onPlay: function (callback) {
    ipcRenderer.on('overlay:play', function (_event, payload) {
      callback(payload);
    });
  },
  onClear: function (callback) {
    ipcRenderer.on('overlay:clear', function () {
      callback();
    });
  },
});