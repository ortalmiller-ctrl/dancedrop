// Local device identity. The device secret is encrypted with the OS keychain
// (DPAPI on Windows) whenever Electron can do so.

const { app, safeStorage } = require('electron');
const fs = require('fs');
const path = require('path');

function configPath() {
  return path.join(app.getPath('userData'), 'device.json');
}

function save(config) {
  const payload = {
    device_id: config.device_id,
    activation_code: config.activation_code,
    nickname: config.nickname || '',
    saved_at: new Date().toISOString(),
  };

  if (safeStorage.isEncryptionAvailable()) {
    payload.secret_encrypted = safeStorage.encryptString(config.device_secret).toString('base64');
  } else {
    payload.secret_plain = config.device_secret;
  }

  fs.writeFileSync(configPath(), JSON.stringify(payload, null, 2), { mode: 0o600 });
}

function load() {
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(configPath(), 'utf8'));
  } catch (error) {
    return null;
  }
  if (!raw || !raw.device_id) return null;

  let secret = raw.secret_plain || '';
  if (raw.secret_encrypted && safeStorage.isEncryptionAvailable()) {
    try {
      secret = safeStorage.decryptString(Buffer.from(raw.secret_encrypted, 'base64'));
    } catch (error) {
      secret = '';
    }
  }
  if (!secret) return null;

  return {
    device_id: raw.device_id,
    device_secret: secret,
    activation_code: raw.activation_code || '',
    nickname: raw.nickname || '',
  };
}

function clear() {
  try {
    fs.rmSync(configPath(), { force: true });
  } catch (error) {
    // nothing stored: nothing to remove
  }
}

module.exports = { save: save, load: load, clear: clear };