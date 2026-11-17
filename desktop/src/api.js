// HTTP client for the DanceDrop device API.
// Only the four device endpoints are reachable from here: the companion can
// register itself, report a heartbeat, acknowledge a command and change consent.

const DEFAULT_BASE = 'https://dance-drop-live.base44.app';
const TIMEOUT_MS = 12000;

function baseUrl() {
  return (process.env.DANCEDROP_API || DEFAULT_BASE).replace(/\/+$/, '');
}

async function request(pathname, options) {
  const opts = options || {};
  const headers = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.credentials) {
    headers['x-device-id'] = opts.credentials.device_id;
    headers['x-device-secret'] = opts.credentials.device_secret;
  }

  const controller = new AbortController();
  const timeout = setTimeout(function () {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const response = await fetch(baseUrl() + pathname, {
      method: opts.method || 'POST',
      headers: headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: controller.signal,
    });
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      data = {};
    }
    if (!response.ok) {
      const failure = new Error(data.error || 'DanceDrop API ' + response.status);
      failure.status = response.status;
      throw failure;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('The DanceDrop service did not answer in time');
      timeoutError.status = 0;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function register(payload) {
  return request('/api/device/register', { body: payload });
}

function heartbeat(credentials, payload) {
  return request('/api/device/heartbeat', { credentials: credentials, body: payload });
}

function ack(credentials, commandId, status, message) {
  return request('/api/device/ack', {
    credentials: credentials,
    body: { command_id: commandId, status: status, message: message || '' },
  });
}

function consent(credentials, status) {
  return request('/api/device/consent', { credentials: credentials, body: { status: status } });
}

function disconnect(credentials) {
  return request('/api/device/consent', { method: 'DELETE', credentials: credentials });
}

module.exports = {
  baseUrl: baseUrl,
  register: register,
  heartbeat: heartbeat,
  ack: ack,
  consent: consent,
  disconnect: disconnect,
};