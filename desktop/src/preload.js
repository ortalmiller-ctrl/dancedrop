const { contextBridge, ipcRenderer } = require('electron');

// The settings window gets a short, explicit list of actions. Nothing else.
contextBridge.exposeInMainWorld('dancedrop', {
  state: function () {
    return ipcRenderer.invoke('dancedrop:state');
  },
  activate: function (payload) {
    return ipcRenderer.invoke('dancedrop:activate', payload);
  },
  setConsent: function (granted) {
    return ipcRenderer.invoke('dancedrop:consent', granted);
  },
  stop: function () {
    return ipcRenderer.invoke('dancedrop:stop');
  },
  forget: function () {
    return ipcRenderer.invoke('dancedrop:forget');
  },
  quit: function () {
    return ipcRenderer.invoke('dancedrop:quit');
  },
  openSite: function (pathname) {
    return ipcRenderer.invoke('dancedrop:open-site', pathname);
  },
  onState: function (callback) {
    const handler = function (_event, snapshot) {
      callback(snapshot);
    };
    ipcRenderer.on('dancedrop:state', handler);
    return function () {
      ipcRenderer.removeListener('dancedrop:state', handler);
    };
  },
});