// Overlay renderer: draws exactly one character, sized to the screen it runs on,
// and removes it on request or when its duration runs out.

const stage = document.getElementById('stage');
const CHARACTERS = window.DD_CHARACTERS || [];
const ANIMATIONS = ['dance', 'jump', 'spin', 'wave', 'bounce'];

let current = null;
let hideTimer = null;

function characterFor(slug) {
  for (let i = 0; i < CHARACTERS.length; i += 1) {
    if (CHARACTERS[i].slug === slug) return CHARACTERS[i];
  }
  return CHARACTERS[0] || null;
}

function actorSize() {
  const height = Math.min(window.innerHeight * 0.42, 460);
  const width = Math.min(window.innerWidth * 0.34, height);
  return Math.max(140, Math.min(height, width));
}

function place(actor, position) {
  const size = actorSize();
  actor.style.width = size + 'px';
  actor.style.height = size + 'px';

  const pad = Math.round(size * 0.12);
  const chosen = position === 'random' ? ['bottom-left', 'bottom-right', 'center'][Math.floor(Math.random() * 3)] : position;
  actor.dataset.position = chosen;

  if (chosen === 'bottom-left') {
    actor.style.left = pad + 'px';
    actor.style.top = '';
    actor.style.bottom = pad + 'px';
    actor.style.transform = 'none';
    return;
  }
  if (chosen === 'bottom-right') {
    actor.style.right = pad + 'px';
    actor.style.left = '';
    actor.style.top = '';
    actor.style.bottom = pad + 'px';
    actor.style.transform = 'none';
    return;
  }

  // center is the default for every command without an explicit position
  actor.style.left = '50%';
  actor.style.top = '50%';
  actor.style.right = '';
  actor.style.bottom = '';
  actor.style.transform = 'translate(-50%, -50%)';
}

function clear(immediate) {
  clearTimeout(hideTimer);
  hideTimer = null;
  if (!current) return;
  const actor = current;
  current = null;
  actor.classList.remove('in');
  if (immediate) {
    actor.remove();
    return;
  }
  setTimeout(function () {
    actor.remove();
  }, 200);
}

function play(payload) {
  if (!payload || !payload.command) return;
  const command = payload.command;
  const character = characterFor(command.character_slug);
  if (!character) return;

  clear(true);

  const animation = ANIMATIONS.indexOf(command.animation) >= 0 ? command.animation : 'dance';

  const actor = document.createElement('div');
  actor.className = 'actor' + (character.face ? ' has-face' : '');

  const art = document.createElement('div');
  art.className = 'art anim anim-' + animation;
  art.innerHTML = '<svg viewBox="0 0 200 200" role="img" aria-label="' + character.slug + '">' + character.art + '</svg>';

  actor.appendChild(art);

  if (character.face) {
    const face = document.createElement('img');
    face.className = 'face';
    face.src = character.face;
    face.alt = '';
    actor.appendChild(face);
  }

  place(actor, command.position);
  stage.appendChild(actor);
  current = actor;

  requestAnimationFrame(function () {
    actor.classList.add('in');
  });

  const seconds = Math.min(Math.max(Number(payload.seconds) || 10, 3), 120);
  hideTimer = setTimeout(function () {
    clear(false);
  }, seconds * 1000);
}

window.overlayBridge.onPlay(play);
window.overlayBridge.onClear(function () {
  clear(false);
});

window.addEventListener('resize', function () {
  if (current) place(current, current.dataset.position || 'center');
});