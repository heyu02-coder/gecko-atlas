(() => {
  const STORAGE_KEY = "gecko-404-phase3-v1";
  const hotspots = [
    { id: "signal", x: 0.23, y: 0.34, radius: 0.075, label: "失落信号", note: "404 并非终点，它是一段尚未接通的信号。", mark: "01" },
    { id: "footprint", x: 0.36, y: 0.78, radius: 0.085, label: "地面足迹", note: "细小足迹绕开壁虎，通向画面之外。", mark: "02" },
    { id: "watcher", x: 0.71, y: 0.37, radius: 0.08, label: "捕食者视线", note: "壁虎并不追逐速度，它预测你的下一步。", mark: "03" },
    { id: "horizon", x: 0.84, y: 0.68, radius: 0.075, label: "边界裂隙", note: "边界并不牢固，也许昆虫能够从这里离开。", mark: "04" },
  ];
  const safeZones = [
    { id: "left-nook", x: 0.1, y: 0.82, radius: 0.115, label: "苔藓安全区" },
    { id: "upper-nook", x: 0.9, y: 0.16, radius: 0.1, label: "高处安全区" },
  ];
  const state = loadState();
  let pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  let activeHotspot = null;
  let dwellStarted = 0;
  let escapedThisVisit = 0;
  let eggStep = 0;
  let toastTimer = 0;

  const root = document.createElement("section");
  root.className = "exploration-ui";
  root.setAttribute("aria-label", "404 探索系统");
  root.innerHTML = `
    <header class="exploration-hud">
      <button class="return-entry" type="button" aria-label="返回上一页"><span>←</span> 返回入口</button>
      <div class="discovery-counter"><b>探索</b><span class="discovery-count">0 / ${hotspots.length}</span></div>
    </header>
    <div class="safe-zone safe-zone--left"><span>SAFE</span></div>
    <div class="safe-zone safe-zone--upper"><span>SAFE</span></div>
    <div class="hotspot-layer" aria-hidden="true"></div>
    <div class="exploration-toast" role="status"></div>
    <div class="ending-panel" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="ending-card">
        <small>404 // ENDING</small><h2></h2><p></p>
        <div class="ending-actions"><button type="button" data-action="continue">继续探索</button><button type="button" data-action="return">返回入口</button></div>
      </div>
    </div>`;
  document.body.append(root);

  const count = root.querySelector(".discovery-count");
  const layer = root.querySelector(".hotspot-layer");
  const toast = root.querySelector(".exploration-toast");
  const panel = root.querySelector(".ending-panel");
  const returnButtons = root.querySelectorAll(".return-entry, [data-action='return']");

  for (const spot of hotspots) {
    const node = document.createElement("i");
    node.className = "exploration-hotspot";
    node.dataset.id = spot.id;
    node.style.left = `${spot.x * 100}%`;
    node.style.top = `${spot.y * 100}%`;
    node.innerHTML = `<span>${spot.mark}</span>`;
    layer.append(node);
  }
  renderProgress();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { found: Array.isArray(saved.found) ? saved.found : [], endings: Array.isArray(saved.endings) ? saved.endings : [] };
    } catch { return { found: [], endings: [] }; }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Private/file mode can deny storage. */ }
  }

  function returnHome() {
    if (history.length > 1) history.back();
    else window.location.href = "./";
  }

  function showToast(title, text) {
    clearTimeout(toastTimer);
    toast.innerHTML = `<b>${title}</b><span>${text}</span>`;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  function showEnding(type, title, text) {
    const firstUnlock = !state.endings.includes(type);
    if (firstUnlock) state.endings.push(type);
    saveState();
    window.dispatchEvent(new CustomEvent("gecko:ending", { detail: { type, title, firstUnlock } }));
    panel.dataset.ending = type;
    panel.querySelector("h2").textContent = title;
    panel.querySelector("p").textContent = text;
    panel.classList.add("is-visible");
    panel.setAttribute("aria-hidden", "false");
  }

  function discover(spot) {
    if (state.found.includes(spot.id)) return;
    state.found.push(spot.id);
    saveState();
    window.dispatchEvent(new CustomEvent("gecko:discovery", { detail: { id: spot.id, label: spot.label } }));
    renderProgress();
    showToast(`发现：${spot.label}`, spot.note);
    if (state.found.length === hotspots.length) {
      setTimeout(() => showEnding("archivist", "结局：404 档案员", "你读取了场景里的全部痕迹。错误页面被重新解释为一座微型生态档案馆。"), 800);
    }
  }

  function renderProgress() {
    count.textContent = `${state.found.length} / ${hotspots.length}`;
    for (const node of layer.querySelectorAll(".exploration-hotspot")) {
      node.classList.toggle("is-found", state.found.includes(node.dataset.id));
    }
  }

  function normalizedDistance(item, x, y) {
    const nx = x / innerWidth;
    const ny = y / innerHeight;
    return Math.hypot(nx - item.x, (ny - item.y) * (innerHeight / innerWidth));
  }

  function isSafeAt(x, y) {
    return safeZones.some((zone) => normalizedDistance(zone, x, y) <= zone.radius);
  }

  function update(now) {
    requestAnimationFrame(update);
    if (!document.documentElement.classList.contains("hero-visible")) {
      activeHotspot = null;
      document.documentElement.classList.remove("exploration-safe");
      return;
    }
    const rendered = window.__insectCursor?.renderedPointer;
    if (rendered) pointer = rendered;
    const nearby = hotspots.find((spot) => !state.found.includes(spot.id) && normalizedDistance(spot, pointer.x, pointer.y) <= spot.radius);
    if (nearby?.id !== activeHotspot?.id) {
      activeHotspot = nearby || null;
      dwellStarted = now;
    } else if (nearby && now - dwellStarted > 720) {
      discover(nearby);
      activeHotspot = null;
    }
    document.documentElement.classList.toggle("exploration-safe", isSafeAt(pointer.x, pointer.y));
  }

  // Secret sequence: visit hotspots in the visual 4 → 0 → 4 order after finding any clue.
  window.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    if (!state.found.length || state.endings.includes("loop")) return;
    const nx = event.clientX / innerWidth;
    const expected = [0.82, 0.5, 0.18][eggStep];
    if (Math.abs(nx - expected) < 0.025) {
      eggStep += 1;
      if (eggStep === 3) {
        eggStep = 0;
        showEnding("loop", "彩蛋：404 循环之外", "你画出了 4—0—4。壁虎停顿了一瞬，仿佛意识到自己也被困在页面里。" );
      }
    }
  }, { passive: true });

  window.addEventListener("gecko:outcome", (event) => {
    if (event.detail.type === "caught") showEnding("prey", "结局：成为猎物", "一次迟疑足以改变食物链。继续探索，安全区仍会保护下一次尝试。" );
    if (event.detail.type === "escaped") {
      if (event.detail.attacked === false) return;
      escapedThisVisit += 1;
      if (escapedThisVisit >= 3) showEnding("survivor", "结局：逃脱专家", "你连续三次骗过壁虎的预判。这里不再是错误页面，而是你的训练场。" );
    }
  });

  returnButtons.forEach((button) => button.addEventListener("click", returnHome));
  root.querySelector("[data-action='continue']").addEventListener("click", () => {
    panel.classList.remove("is-visible");
    panel.setAttribute("aria-hidden", "true");
  });

  window.__geckoExploration = { state, hotspots, safeZones, isSafeAt, showEnding };
  requestAnimationFrame(update);
})();
