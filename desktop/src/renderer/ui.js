// Settings window logic. Plain DOM, no bundler: this file ships as-is.

const bridge = window.dancedrop;

const setupView = document.getElementById('setupView');
const deviceView = document.getElementById('deviceView');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const setupError = document.getElementById('setupError');
const globalError = document.getElementById('globalError');
const activateBtn = document.getElementById('activateBtn');
const consentBtn = document.getElementById('consentBtn');
const consentState = document.getElementById('consentState');
const consentHint = document.getElementById('consentHint');
const consentCheck = document.getElementById('consentCheck');
const stopBtn = document.getElementById('stopBtn');
const forgetBtn = document.getElementById('forgetBtn');
const quitBtn = document.getElementById('quitBtn');
const apiLabel = document.getElementById('apiLabel');

let latest = null;

function render(snapshot) {
  if (!snapshot) return;
  latest = snapshot;

  const activated = Boolean(snapshot.activated);
  setupView.classList.toggle('hide', activated);
  deviceView.classList.toggle('hide', !activated);

  if (snapshot.online) {
    statusDot.className = 'dot on';
    statusText.textContent = snapshot.active ? 'Animating' : 'Online';
  } else if (activated) {
    statusDot.className = 'dot warn';
    statusText.textContent = 'Not reachable';
  } else {
    statusDot.className = 'dot';
    statusText.textContent = 'Not activated';
  }

  apiLabel.textContent = snapshot.api_base || '';
  globalError.textContent = activated || snapshot.last_error ? snapshot.last_error || '' : '';
  setupError.textContent = activated ? '' : snapshot.last_error || '';

  if (!activated) return;

  document.getElementById('deviceId').textContent = snapshot.device_id;
  document.getElementById('deviceCode').textContent = snapshot.activation_code;
  document.getElementById('deviceNickname').textContent = snapshot.nickname || 'This PC';
  document.getElementById('deviceVersion').textContent = snapshot.version;

  const granted = snapshot.consent === 'granted';
  consentState.textContent = granted ? 'Remote animations are on' : 'Remote animations are off';
  consentState.className = 'state ' + (granted ? 'on' : 'off');
  consentHint.textContent = granted
    ? 'An admin can send a character to this PC until you turn this off.'
    : 'Nothing can be drawn on this PC while this is off.';
  consentBtn.textContent = granted ? 'Turn off' : 'Turn on';
  consentBtn.className = granted ? 'ghost' : 'primary';
}

async function refresh() {
  render(await bridge.state());
}

activateBtn.addEventListener('click', async function () {
  activateBtn.disabled = true;
  activateBtn.textContent = 'Activating...';
  setupError.textContent = '';
  try {
    const nickname = document.getElementById('nickname').value.trim();
    const result = await bridge.activate({ nickname: nickname, consent: consentCheck.checked });
    if (!result || !result.ok) {
      setupError.textContent = (result && result.error) || 'Activation failed. Check your connection.';
    }
    render(result && result.snapshot);
  } finally {
    activateBtn.disabled = false;
    activateBtn.textContent = 'Activate this PC';
  }
});

consentBtn.addEventListener('click', async function () {
  consentBtn.disabled = true;
  try {
    const granted = !latest || latest.consent !== 'granted';
    const result = await bridge.setConsent(granted);
    if (result && !result.ok) globalError.textContent = result.error || '';
    render(result && result.snapshot);
  } finally {
    consentBtn.disabled = false;
  }
});

stopBtn.addEventListener('click', async function () {
  render(await bridge.stop());
});

forgetBtn.addEventListener('click', async function () {
  forgetBtn.disabled = true;
  try {
    const result = await bridge.forget();
    render(result && result.snapshot);
    await refresh();
  } finally {
    forgetBtn.disabled = false;
  }
});

quitBtn.addEventListener('click', function () {
  bridge.quit();
});

Array.prototype.forEach.call(document.querySelectorAll('#portalBtn, #portalBtnSetup'), function (button) {
  button.addEventListener('click', function () {
    bridge.openSite('/my-device');
  });
});

bridge.onState(render);
refresh();
setInterval(refresh, 4000);