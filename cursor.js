import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import MODEL_URL from "./assets/insect-cursor.glb";

const CURSOR_SIZE = 152;
const LOAD_STARTED_AT = performance.now();

const canvas = document.createElement("canvas");
canvas.className = "insect-cursor";
canvas.setAttribute("aria-hidden", "true");
document.body.append(canvas);

const fallbackCursor = document.querySelector("#insect-cursor-fallback");
const staminaRing = document.createElement("div");
staminaRing.className = "insect-stamina";
staminaRing.setAttribute("aria-hidden", "true");
document.body.append(staminaRing);

const trailDots = Array.from({ length: 5 }, (_, index) => {
  const dot = document.createElement("i");
  dot.className = "insect-trail";
  dot.style.setProperty("--trail-index", index);
  dot.style.setProperty("--trail-opacity", Math.max(0.12, 0.42 - index * 0.06));
  document.body.append(dot);
  return { element: dot, x: window.innerWidth / 2, y: window.innerHeight / 2 };
});
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(CURSOR_SIZE, CURSOR_SIZE, false);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-0.72, 0.72, 0.72, -0.72, 0.01, 100);
camera.position.set(0, 12, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x6d8190, 2.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
keyLight.position.set(-3, 8, 5);
scene.add(keyLight);

const cursorRoot = new THREE.Group();
const turnRoot = new THREE.Group();
const pitchRoot = new THREE.Group();
cursorRoot.add(turnRoot);
turnRoot.add(pitchRoot);
scene.add(cursorRoot);

const pointer = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
const smoothedPointer = pointer.clone();
const velocity = new THREE.Vector2();
let lastPointer = pointer.clone();
let desiredYaw = 0;
let desiredPitch = 0;
let modelReady = false;
let contextAvailable = true;
let sprintRequested = false;
let sprinting = false;
let exhausted = false;
let stamina = 100;
let lastFrame = performance.now();
const wings = [];
const legs = [];

const cursorState = {
  loaded: false,
  progress: 0,
  loadMs: null,
  modelBytes: 2251932,
  wingNames: [],
  legNames: [],
  yaw: 0,
  pitch: 0,
  wingAngles: [],
  sprinting: false,
  stamina: 100,
  exhausted: false,
  speed: 0,
  pointer: { x: pointer.x, y: pointer.y },
  renderedPointer: { x: smoothedPointer.x, y: smoothedPointer.y },
};
window.__insectCursor = cursorState;

function makePivot(model, mesh, rootPoint) {
  const pivot = new THREE.Group();
  pivot.position.copy(rootPoint);
  model.add(pivot);
  pivot.attach(mesh);
  return pivot;
}

function localBounds(mesh, model) {
  const worldBox = new THREE.Box3().setFromObject(mesh);
  const min = model.worldToLocal(worldBox.min.clone());
  const max = model.worldToLocal(worldBox.max.clone());
  return new THREE.Box3(
    new THREE.Vector3(Math.min(min.x, max.x), Math.min(min.y, max.y), Math.min(min.z, max.z)),
    new THREE.Vector3(Math.max(min.x, max.x), Math.max(min.y, max.y), Math.max(min.z, max.z)),
  );
}

function showFallback() {
  document.documentElement.classList.remove("insect-cursor-ready");
}

function showModel() {
  if (!modelReady || !contextAvailable) return;
  cursorState.loaded = true;
  document.documentElement.classList.add("insect-cursor-ready");
}

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
loader.load(
  MODEL_URL,
  ({ scene: model }) => {
    model.updateMatrixWorld(true);
    const modelSize = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    model.scale.multiplyScalar(0.92 / Math.max(modelSize.x, modelSize.z));
    model.updateMatrixWorld(true);
    model.position.sub(new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3()));
    pitchRoot.add(model);
    model.updateMatrixWorld(true);

    const meshes = [];
    model.traverse((object) => {
      if (!object.isMesh) return;
      object.frustumCulled = false;
      meshes.push(object);
    });

    for (const name of ["part_13", "part_14"]) {
      const mesh = meshes.find((item) => item.name === name);
      if (!mesh) continue;
      const box = localBounds(mesh, model);
      const isRight = box.getCenter(new THREE.Vector3()).x > 0;
      const rootPoint = new THREE.Vector3(
        isRight ? box.min.x : box.max.x,
        box.min.y + box.getSize(new THREE.Vector3()).y * 0.35,
        box.max.z,
      );
      wings.push({ pivot: makePivot(model, mesh, rootPoint), side: isRight ? 1 : -1 });
      cursorState.wingNames.push(mesh.name);
    }

    model.updateMatrixWorld(true);
    const legMeshNames = ["part_0", "part_1", "part_3", "part_8", "part_4", "part_5"];
    for (const mesh of meshes) {
      if (!legMeshNames.includes(mesh.name)) continue;
      const box = localBounds(mesh, model);
      const center = box.getCenter(new THREE.Vector3());
      const side = center.x > 0 ? 1 : -1;
      const rootPoint = new THREE.Vector3(side > 0 ? box.min.x : box.max.x, box.max.y, center.z);
      legs.push({ pivot: makePivot(model, mesh, rootPoint), side, phase: legs.length * 1.7 });
      cursorState.legNames.push(mesh.name);
    }

    modelReady = true;
    cursorState.progress = 1;
    cursorState.loadMs = Math.round(performance.now() - LOAD_STARTED_AT);
    showModel();
  },
  (event) => {
    if (!event.total) return;
    cursorState.progress = THREE.MathUtils.clamp(event.loaded / event.total, 0, 1);
    fallbackCursor.style.setProperty("--load-progress", `${cursorState.progress * 360}deg`);
  },
  (error) => {
    cursorState.loaded = false;
    showFallback();
    console.error("昆虫模型加载失败，已保留轻量光标。", error);
  },
);

window.addEventListener("pointermove", (event) => {
  pointer.set(event.clientX, event.clientY);
  cursorState.pointer.x = event.clientX;
  cursorState.pointer.y = event.clientY;

  const dx = event.clientX - lastPointer.x;
  const dy = event.clientY - lastPointer.y;
  lastPointer.copy(pointer);

  if (Math.abs(dx) > 1.5) desiredYaw = dx > 0 ? -Math.PI / 2 : Math.PI / 2;
  desiredPitch = THREE.MathUtils.clamp(dy * 0.004, -0.09, 0.09);
}, { passive: true });

window.addEventListener("pointerdown", (event) => {
  if (event.button === 0) sprintRequested = true;
});

window.addEventListener("pointerup", (event) => {
  if (event.button === 0) sprintRequested = false;
});

window.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || event.repeat) return;
  sprintRequested = true;
  event.preventDefault();
});

window.addEventListener("keyup", (event) => {
  if (event.code === "Space") sprintRequested = false;
});

window.addEventListener("blur", () => {
  sprintRequested = false;
});

canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  contextAvailable = false;
  cursorState.loaded = false;
  showFallback();
});

canvas.addEventListener("webglcontextrestored", () => {
  contextAvailable = true;
  showModel();
});

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;

  velocity.subVectors(pointer, smoothedPointer);
  if (exhausted && !sprintRequested && stamina >= 20) exhausted = false;
  sprinting = sprintRequested && !exhausted && stamina > 0;

  if (sprinting) {
    stamina = Math.max(0, stamina - 38 * dt);
    if (stamina === 0) {
      exhausted = true;
      sprinting = false;
    }
  } else {
    stamina = Math.min(100, stamina + 22 * dt);
  }

  const followRate = sprinting ? 24 : 14;
  smoothedPointer.lerp(pointer, 1 - Math.exp(-dt * followRate));
  canvas.style.left = `${smoothedPointer.x}px`;
  canvas.style.top = `${smoothedPointer.y}px`;
  cursorState.renderedPointer.x = Math.round(smoothedPointer.x * 10) / 10;
  cursorState.renderedPointer.y = Math.round(smoothedPointer.y * 10) / 10;
  staminaRing.style.left = `${smoothedPointer.x}px`;
  staminaRing.style.top = `${smoothedPointer.y}px`;
  staminaRing.style.setProperty("--stamina", `${stamina * 3.6}deg`);
  staminaRing.classList.toggle("is-active", sprinting || stamina < 99.5);

  let trailX = smoothedPointer.x;
  let trailY = smoothedPointer.y;
  for (const trail of trailDots) {
    trail.x += (trailX - trail.x) * (1 - Math.exp(-dt * 18));
    trail.y += (trailY - trail.y) * (1 - Math.exp(-dt * 18));
    trail.element.style.left = `${trail.x}px`;
    trail.element.style.top = `${trail.y}px`;
    trail.element.classList.toggle("is-active", sprinting && velocity.lengthSq() > 9);
    trailX = trail.x;
    trailY = trail.y;
  }

  const movementSpeed = Math.min(1, velocity.length() / 14);
  const hover = Math.sin(now * (sprinting ? 0.007 : 0.0045)) * (sprinting ? 0.012 : 0.018);
  cursorRoot.position.set(0, 0.35, hover);
  const targetScale = sprinting ? 1.08 : 1;
  cursorRoot.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 1 - Math.exp(-dt * 10));
  turnRoot.rotation.y = THREE.MathUtils.lerp(turnRoot.rotation.y, desiredYaw, 1 - Math.exp(-dt * 9));
  pitchRoot.rotation.x = THREE.MathUtils.lerp(pitchRoot.rotation.x, desiredPitch, 1 - Math.exp(-dt * 10));
  desiredPitch *= Math.exp(-dt * 7);

  if (modelReady) {
    const flap = now * (sprinting ? 0.055 : 0.034 + movementSpeed * 0.006);
    for (const wing of wings) {
      wing.pivot.rotation.z = wing.side * (0.14 + Math.sin(flap) * 0.62);
    }
    cursorState.wingAngles = wings.map((wing) => wing.pivot.rotation.z);

    const movement = Math.min(1, velocity.length() / 8);
    const crawl = now * 0.012;
    for (const leg of legs) {
      leg.pivot.rotation.y = Math.sin(crawl + leg.phase) * 0.16 * movement;
      leg.pivot.rotation.z = leg.side * Math.cos(crawl + leg.phase) * 0.07 * movement;
    }
  }

  cursorState.yaw = turnRoot.rotation.y;
  cursorState.pitch = pitchRoot.rotation.x;
  cursorState.sprinting = sprinting;
  cursorState.stamina = Math.round(stamina * 10) / 10;
  cursorState.exhausted = exhausted;
  cursorState.speed = Math.round(velocity.length() * 10) / 10;
  if (contextAvailable) renderer.render(scene, camera);
}

requestAnimationFrame(animate);
