const gameVideo = document.querySelector("#gecko-video");
const gameMedia = document.querySelector(".hero__media");
const predationLabMode = new URLSearchParams(window.location.search).get("experiment") === "predation";

const dangerFeedback = document.createElement("div");
dangerFeedback.className = "danger-feedback";
dangerFeedback.setAttribute("aria-hidden", "true");

const attackReticle = document.createElement("div");
attackReticle.className = "attack-reticle";
attackReticle.setAttribute("aria-hidden", "true");

const attackPulse = document.createElement("div");
attackPulse.className = "attack-pulse";
attackPulse.setAttribute("aria-hidden", "true");

const mouthOverlay = document.createElement("div");
mouthOverlay.className = "gecko-mouth";
mouthOverlay.setAttribute("aria-hidden", "true");

const tongueLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
tongueLayer.classList.add("tongue-layer");
tongueLayer.setAttribute("aria-hidden", "true");
tongueLayer.innerHTML = `
  <path class="tongue tongue-shadow" pathLength="1" />
  <path class="tongue tongue-main" pathLength="1" />
  <path class="tongue tongue-highlight" pathLength="1" />
`;

const tonguePaths = [...tongueLayer.querySelectorAll(".tongue")];
document.body.append(dangerFeedback, mouthOverlay, tongueLayer, attackReticle, attackPulse);

const STATES = Object.freeze({
  IDLE: "idle",
  TRACKING: "tracking",
  ALERT: "alert",
  PREPARING: "preparing",
  ATTACK: "attack",
  RECOVERING: "recovering",
  CAUGHT: "caught",
});

const PREPARE_DURATION = 0.68;
const ATTACK_DURATION = 0.48;
const RECOVERY_DURATION = 1.05;
const CAUGHT_DURATION = 1.25;

let state = STATES.IDLE;
let stateElapsed = 0;
let alertLevel = 0;
let hasPointerMoved = false;
let attackHit = false;
let attackResolved = false;
let lastFrame = performance.now();
let lastPointerTime = performance.now();
let lastPointerX = window.innerWidth / 2;
let lastPointerY = window.innerHeight / 2;
let pointerVelocityX = 0;
let pointerVelocityY = 0;
const lockedTarget = { x: 0, y: 0 };

const gameState = {
  state,
  alertLevel: 0,
  proximity: 0,
  distance: Infinity,
  outerRadius: 0,
  innerRadius: 0,
  head: { x: 0, y: 0 },
  mouth: { x: 0, y: 0 },
  target: { x: 0, y: 0 },
  attackHit: false,
  attacks: 0,
  dodged: 0,
  caught: 0,
  lastOutcome: null,
  safe: false,
};
window.__geckoGame = gameState;

function clampGame(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getInsectPosition() {
  const cursor = window.__insectCursor;
  return cursor?.renderedPointer ?? cursor?.pointer ?? { x: lastPointerX, y: lastPointerY };
}

function isInSafeZone(position) {
  return Boolean(window.__geckoExploration?.isSafeAt?.(position.x, position.y));
}

function getHeadPosition() {
  const rect = gameMedia.getBoundingClientRect();
  const duration = Number.isFinite(gameVideo.duration) && gameVideo.duration > 0 ? gameVideo.duration : 1;
  const progress = clampGame(gameVideo.currentTime / duration, 0, 1);

  // The source moves from right three-quarter view toward left three-quarter
  // view. Interpolate the visible head center without moving the video layer.
  return {
    x: rect.left + rect.width * (0.6 - progress * 0.14),
    y: rect.top + rect.height * 0.405,
  };
}

function getMouthPosition(head, target) {
  const dx = target.x - head.x;
  const dy = target.y - head.y;
  const angle = Math.atan2(dy, dx);
  const horizontalReach = 64;
  const verticalReach = clampGame(Math.abs(dy) * 0.09, 7, 25);
  return {
    x: head.x + Math.cos(angle) * horizontalReach,
    y: head.y + Math.sin(angle) * verticalReach + 20,
    angle: angle * 180 / Math.PI,
  };
}

function updatePredationGeometry(mouth) {
  mouthOverlay.style.left = `${mouth.x}px`;
  mouthOverlay.style.top = `${mouth.y}px`;
  mouthOverlay.style.setProperty("--mouth-angle", `${mouth.angle}deg`);

  const dx = lockedTarget.x - mouth.x;
  const dy = lockedTarget.y - mouth.y;
  const length = Math.max(Math.hypot(dx, dy), 1);
  const bend = clampGame(length * 0.075, 10, 28);
  const normalX = -dy / length;
  const normalY = dx / length;
  const controlX = mouth.x + dx * 0.52 + normalX * bend;
  const controlY = mouth.y + dy * 0.52 + normalY * bend;
  const path = `M ${mouth.x.toFixed(1)} ${mouth.y.toFixed(1)} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${lockedTarget.x.toFixed(1)} ${lockedTarget.y.toFixed(1)}`;
  for (const tonguePath of tonguePaths) tonguePath.setAttribute("d", path);
}

function setTargetPosition(x, y) {
  lockedTarget.x = clampGame(x, 44, window.innerWidth - 44);
  lockedTarget.y = clampGame(y, 44, window.innerHeight - 44);
  attackReticle.style.left = `${lockedTarget.x}px`;
  attackReticle.style.top = `${lockedTarget.y}px`;
  gameState.target.x = Math.round(lockedTarget.x);
  gameState.target.y = Math.round(lockedTarget.y);
}

function enterState(nextState) {
  if (state === nextState) return;
  const previousState = state;
  state = nextState;
  stateElapsed = 0;
  gameState.state = nextState;
  document.documentElement.dataset.geckoState = nextState;

  if (nextState !== STATES.PREPARING) {
    attackReticle.classList.remove("is-visible");
  }

  if (nextState === STATES.PREPARING) {
    const insect = getInsectPosition();
    const predictionMs = window.__insectCursor?.sprinting ? 85 : 125;
    setTargetPosition(
      insect.x + pointerVelocityX * predictionMs,
      insect.y + pointerVelocityY * predictionMs,
    );
    attackReticle.classList.add("is-visible");
    attackPulse.classList.remove("is-active");
  }

  if (nextState === STATES.ATTACK) {
    gameState.attacks += 1;
    attackHit = false;
    attackResolved = false;
    gameState.attackHit = false;
    tongueLayer.classList.remove("is-striking");
    void tongueLayer.getBoundingClientRect();
    tongueLayer.classList.add("is-striking");
  }

  if (nextState === STATES.CAUGHT) {
    alertLevel = 0;
    gameState.caught += 1;
    gameState.lastOutcome = "caught";
    document.documentElement.classList.add("game-caught");
    window.dispatchEvent(new CustomEvent("gecko:outcome", { detail: { type: "caught" } }));
  }

  if (nextState === STATES.RECOVERING) {
    alertLevel = Math.min(alertLevel, 0.32);
    gameState.dodged += 1;
    gameState.lastOutcome = "escaped";
    document.documentElement.classList.add("game-escaped");
    window.dispatchEvent(new CustomEvent("gecko:outcome", { detail: { type: "escaped", attacked: previousState === STATES.ATTACK } }));
  }
}

window.addEventListener("pointermove", (event) => {
  const now = performance.now();
  const elapsed = Math.max(now - lastPointerTime, 1);
  const instantX = (event.clientX - lastPointerX) / elapsed;
  const instantY = (event.clientY - lastPointerY) / elapsed;
  pointerVelocityX = pointerVelocityX * 0.62 + instantX * 0.38;
  pointerVelocityY = pointerVelocityY * 0.62 + instantY * 0.38;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  lastPointerTime = now;
  hasPointerMoved = true;
}, { passive: true });

function updateGame(now) {
  requestAnimationFrame(updateGame);
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  stateElapsed += dt;
  pointerVelocityX *= Math.exp(-dt * 8);
  pointerVelocityY *= Math.exp(-dt * 8);

  if (!document.documentElement.classList.contains("hero-visible")) {
    alertLevel = 0;
    dangerFeedback.style.setProperty("--danger", 0);
    tongueLayer.classList.remove("is-striking");
    enterState(STATES.IDLE);
    return;
  }
  if (predationLabMode && !window.__predationExperiment?.active) {
    alertLevel = 0;
    dangerFeedback.style.setProperty("--danger", 0);
    enterState(STATES.IDLE);
    return;
  }

  const insect = getInsectPosition();
  const head = getHeadPosition();
  const aimTarget = state === STATES.ATTACK ? lockedTarget : insect;
  const mouth = getMouthPosition(head, aimTarget);
  const viewportUnit = Math.min(window.innerWidth, window.innerHeight);
  const outerRadius = clampGame(viewportUnit * 0.36, 210, 290);
  const innerRadius = outerRadius * 0.5;
  const distance = Math.hypot(insect.x - head.x, insect.y - head.y);
  const proximity = clampGame(1 - distance / outerRadius, 0, 1);
  const safe = isInSafeZone(insect);

  gameState.head.x = Math.round(head.x);
  gameState.head.y = Math.round(head.y);
  gameState.mouth.x = Math.round(mouth.x);
  gameState.mouth.y = Math.round(mouth.y);
  gameState.distance = Math.round(distance * 10) / 10;
  gameState.outerRadius = Math.round(outerRadius);
  gameState.innerRadius = Math.round(innerRadius);
  gameState.proximity = Math.round(proximity * 1000) / 1000;
  gameState.safe = safe;
  document.documentElement.classList.toggle("in-safe-zone", safe);

  if (!hasPointerMoved) {
    enterState(STATES.IDLE);
  } else if (state === STATES.IDLE) {
    enterState(STATES.TRACKING);
  }

  if (state === STATES.TRACKING || state === STATES.ALERT) {
    if (safe) {
      alertLevel = Math.max(0, alertLevel - dt * 1.8);
    } else if (distance < outerRadius) {
      const movementAttention = Math.min(Math.hypot(pointerVelocityX, pointerVelocityY) * 0.08, 0.18);
      alertLevel = Math.min(1, alertLevel + dt * (0.24 + proximity * 0.9 + movementAttention));
    } else {
      alertLevel = Math.max(0, alertLevel - dt * 0.34);
    }

    if (alertLevel >= 0.18) enterState(STATES.ALERT);
    if (alertLevel < 0.12) enterState(STATES.TRACKING);
    if (alertLevel >= 1 && distance <= innerRadius) enterState(STATES.PREPARING);
  } else if (state === STATES.PREPARING) {
    const charge = clampGame(stateElapsed / PREPARE_DURATION, 0, 1);
    attackReticle.style.setProperty("--charge", `${charge * 360}deg`);
    // Follow the live insect while charging; lock only when the strike starts.
    const predictionMs = window.__insectCursor?.sprinting ? 70 : 105;
    setTargetPosition(
      insect.x + pointerVelocityX * predictionMs,
      insect.y + pointerVelocityY * predictionMs,
    );
    window.__geckoTracking?.aimAtX?.(insect.x);

    if (safe) {
      enterState(STATES.RECOVERING);
    } else if (distance > outerRadius * 1.08 && stateElapsed < PREPARE_DURATION * 0.76) {
      enterState(STATES.RECOVERING);
    } else if (stateElapsed >= PREPARE_DURATION) {
      enterState(STATES.ATTACK);
    }
  } else if (state === STATES.ATTACK) {
    updatePredationGeometry(mouth);
    window.__geckoTracking?.aimAtX?.(lockedTarget.x);

    if (!attackResolved && stateElapsed >= 0.28) {
      attackResolved = true;
      const hitDistance = Math.hypot(insect.x - lockedTarget.x, insect.y - lockedTarget.y);
      const hitRadius = window.__insectCursor?.sprinting ? 56 : 70;
      attackHit = hitDistance <= hitRadius && !isInSafeZone(insect);
      gameState.attackHit = attackHit;

      attackPulse.style.left = `${lockedTarget.x}px`;
      attackPulse.style.top = `${lockedTarget.y}px`;
      attackPulse.classList.remove("is-active");
      void attackPulse.offsetWidth;
      attackPulse.classList.add("is-active");
    }

    if (stateElapsed >= ATTACK_DURATION) {
      tongueLayer.classList.remove("is-striking");
      enterState(attackHit ? STATES.CAUGHT : STATES.RECOVERING);
    }
  } else if (state === STATES.CAUGHT && stateElapsed >= CAUGHT_DURATION) {
    document.documentElement.classList.remove("game-caught");
    gameState.attackHit = false;
    enterState(STATES.TRACKING);
  } else if (state === STATES.RECOVERING && stateElapsed >= RECOVERY_DURATION) {
    document.documentElement.classList.remove("game-escaped");
    gameState.attackHit = false;
    enterState(STATES.TRACKING);
  }

  alertLevel = clampGame(alertLevel, 0, 1);
  gameState.alertLevel = Math.round(alertLevel * 1000) / 1000;
  dangerFeedback.style.setProperty("--danger", alertLevel);

  if (state === STATES.PREPARING) updatePredationGeometry(mouth);
}

document.documentElement.dataset.geckoState = state;
requestAnimationFrame(updateGame);
