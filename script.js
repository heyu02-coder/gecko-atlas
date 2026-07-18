const video = document.querySelector("#gecko-video");

let previousX = null;
let targetTime = 0;
let seekInProgress = false;
let metadataReady = false;
let seekCount = 0;
let seekableSourceReady = false;
let videoBlobUrl = null;

// The seek-optimized source is 24 fps, so browsers may snap requested times to
// the nearest 1/24-second frame. Half-frame tolerance prevents repeat seeking.
const SEEK_EPSILON = 1 / 48 + 0.001;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const trackingState = {
  ready: false,
  targetTime: 0,
  currentTime: 0,
  seeking: false,
  seekCount: 0,
  lastDelta: 0,
  sourceMode: "loading",
};
window.__geckoTracking = trackingState;

// The game may temporarily aim the paused head-turn footage at an absolute
// screen position. It still uses the same queued currentTime seek mechanism.
trackingState.aimAtX = (screenX) => {
  if (!metadataReady || window.innerWidth <= 0) return;
  const normalizedX = clamp(screenX / window.innerWidth, 0, 1);
  targetTime = (1 - normalizedX) * video.duration;
  updateTrackingState();
  seekToLatestTarget();
};

function resetInputOrigin() {
  previousX = null;
}

function updateTrackingState() {
  trackingState.ready = metadataReady;
  trackingState.targetTime = targetTime;
  trackingState.currentTime = video.currentTime;
  trackingState.seeking = seekInProgress;
  trackingState.seekCount = seekCount;
}

function seekToLatestTarget() {
  if (!metadataReady || seekInProgress) return;

  const nextTime = clamp(targetTime, 0, video.duration);
  targetTime = nextTime;
  if (Math.abs(video.currentTime - nextTime) < SEEK_EPSILON) {
    updateTrackingState();
    return;
  }

  seekInProgress = true;
  seekCount += 1;
  updateTrackingState();

  try {
    video.currentTime = nextTime;
    updateTrackingState();
  } catch {
    seekInProgress = false;
    updateTrackingState();
  }
}

function initializeTrackingFromMetadata() {
  if (!seekableSourceReady) return;
  metadataReady = Number.isFinite(video.duration) && video.duration > 0;
  if (!metadataReady) return;
  targetTime = 0;
  seekInProgress = false;
  video.currentTime = 0;
  resetInputOrigin();
  updateTrackingState();
}

video.addEventListener("loadedmetadata", initializeTrackingFromMetadata);

video.addEventListener("seeked", () => {
  seekInProgress = false;
  updateTrackingState();

  // During a seek, all intermediate pointer positions collapse into one latest
  // target. Continue only when that newest target still differs from the frame.
  if (Math.abs(video.currentTime - targetTime) >= SEEK_EPSILON) {
    seekToLatestTarget();
  }
});

window.addEventListener("mousemove", (event) => {
  if (previousX === null) {
    previousX = event.clientX;
    return;
  }

  const currentX = event.clientX;
  const delta = currentX - previousX;
  previousX = currentX;
  trackingState.lastDelta = delta;

  if (!metadataReady || delta === 0 || window.innerWidth <= 0) return;

  const timeOffset = (delta / window.innerWidth) * 0.8 * video.duration;

  // First frame looks right and last frame looks left, so input is reversed.
  targetTime = clamp(targetTime - timeOffset, 0, video.duration);
  updateTrackingState();
  seekToLatestTarget();
}, { passive: true });

window.addEventListener("blur", resetInputOrigin);
document.addEventListener("mouseleave", resetInputOrigin);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) resetInputOrigin();
});

async function prepareSeekableSource() {
  const source = video.querySelector("source");
  const sourceUrl = source?.getAttribute("src");
  if (!sourceUrl) return;

  // Browsers block fetch() for local file URLs. The video element itself can
  // seek a local MP4, so keep its original source in direct-file mode.
  if (window.location.protocol === "file:") {
    seekableSourceReady = true;
    trackingState.sourceMode = "file";
    if (video.readyState >= 1) initializeTrackingFromMetadata();
    else video.load();
    return;
  }

  try {
    const response = await fetch(sourceUrl, { cache: "force-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    videoBlobUrl = URL.createObjectURL(blob);
    seekableSourceReady = true;
    trackingState.sourceMode = "blob";
    video.src = videoBlobUrl;
    video.load();
  } catch {
    // A normal HTTP source remains usable when the host supports Range.
    seekableSourceReady = true;
    trackingState.sourceMode = "http";
    if (video.readyState >= 1) initializeTrackingFromMetadata();
    else video.load();
  }
}

window.addEventListener("beforeunload", () => {
  if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
});

prepareSeekableSource();
