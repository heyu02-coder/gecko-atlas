(() => {
  const STORAGE_KEY = "gecko-404-analytics-v1";
  const sessionStartedAt = Date.now();
  const session = {
    durationMs: 0,
    pointerDistance: 0,
    maxAlert: 0,
    attacks: 0,
    escaped: 0,
    caught: 0,
    sprints: 0,
    safeEntries: 0,
    discoveries: 0,
    endings: 0,
    experiments: 0,
    averageFps: 0,
  };
  const lifetime = loadLifetime();
  let previousPointer = null;
  let previousSprint = false;
  let previousSafe = false;
  let previousAttacks = 0;
  let frameCount = 0;
  let frameWindowStarted = performance.now();
  let fpsTotal = 0;
  let fpsSamples = 0;
  let lastPersisted = 0;

  const root = document.createElement("aside");
  root.className = "analytics-ui";
  root.setAttribute("aria-label", "体验数据与反馈");
  root.innerHTML = `
    <div class="analytics-launchers">
      <button type="button" data-open="data"><span class="live-dot"></span> 数据</button>
      <button type="button" data-open="feedback">反馈</button>
    </div>
    <div class="analytics-drawer" aria-hidden="true">
      <header><div><small>PHASE 4</small><h2>体验数据</h2></div><button type="button" data-close aria-label="关闭">×</button></header>
      <p class="privacy-note">数据仅保存在这个浏览器中，不会上传。</p>
      <nav class="analytics-tabs"><button class="is-active" data-tab="session">本次体验</button><button data-tab="lifetime">累计数据</button></nav>
      <div class="metric-grid" data-metrics></div>
      <div class="analytics-actions"><button type="button" data-export>导出 JSON</button><button type="button" data-clear>清除数据</button></div>
    </div>
    <div class="feedback-panel" aria-hidden="true">
      <header><div><small>QUICK FEEDBACK</small><h2>体验反馈</h2></div><button type="button" data-close aria-label="关闭">×</button></header>
      <form>
        <fieldset><legend>整体体验</legend><div class="rating-row">${[1,2,3,4,5].map((n) => `<label><input type="radio" name="rating" value="${n}" required><span>${n}</span></label>`).join("")}</div></fieldset>
        <fieldset><legend>最有价值的部分</legend><div class="feedback-tags"><label><input type="checkbox" name="tag" value="insect"><span>昆虫操控</span></label><label><input type="checkbox" name="tag" value="hunt"><span>捕食反馈</span></label><label><input type="checkbox" name="tag" value="explore"><span>探索彩蛋</span></label><label><input type="checkbox" name="tag" value="visual"><span>视觉氛围</span></label></div></fieldset>
        <label class="feedback-copy">还可以怎样改进？<textarea name="comment" maxlength="300" placeholder="选填，最多 300 字"></textarea></label>
        <div class="feedback-submit"><span></span><button type="submit">保存反馈</button></div>
      </form>
    </div>`;
  document.body.append(root);

  const drawer = root.querySelector(".analytics-drawer");
  const feedback = root.querySelector(".feedback-panel");
  const metrics = root.querySelector("[data-metrics]");
  const form = root.querySelector("form");
  let activeTab = "session";

  function loadLifetime() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        sessions: Number(value.sessions) || 0,
        durationMs: Number(value.durationMs) || 0,
        pointerDistance: Number(value.pointerDistance) || 0,
        attacks: Number(value.attacks) || 0,
        escaped: Number(value.escaped) || 0,
        caught: Number(value.caught) || 0,
        sprints: Number(value.sprints) || 0,
        safeEntries: Number(value.safeEntries) || 0,
        discoveries: Number(value.discoveries) || 0,
        endings: Number(value.endings) || 0,
        experiments: Number(value.experiments) || 0,
        feedback: Array.isArray(value.feedback) ? value.feedback : [],
        lastVisit: value.lastVisit || null,
      };
    } catch { return { sessions: 0, durationMs: 0, pointerDistance: 0, attacks: 0, escaped: 0, caught: 0, sprints: 0, safeEntries: 0, discoveries: 0, endings: 0, experiments: 0, feedback: [], lastVisit: null }; }
  }

  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function formatDistance(px) {
    return px >= 10000 ? `${(px / 1000).toFixed(1)}k px` : `${Math.round(px)} px`;
  }

  function renderMetrics() {
    const aggregate = activeTab === "session" ? session : {
      ...lifetime,
      durationMs: lifetime.durationMs + session.durationMs,
      pointerDistance: lifetime.pointerDistance + session.pointerDistance,
      attacks: lifetime.attacks + session.attacks,
      escaped: lifetime.escaped + session.escaped,
      caught: lifetime.caught + session.caught,
      sprints: lifetime.sprints + session.sprints,
      safeEntries: lifetime.safeEntries + session.safeEntries,
      discoveries: lifetime.discoveries + session.discoveries,
      endings: lifetime.endings + session.endings,
      experiments: lifetime.experiments + session.experiments,
    };
    const values = [
      [activeTab === "session" ? "体验时间" : "累计时间", formatTime(aggregate.durationMs)],
      ["移动距离", formatDistance(aggregate.pointerDistance)],
      ["壁虎攻击", aggregate.attacks], ["成功逃脱", aggregate.escaped],
      ["被捕次数", aggregate.caught], ["冲刺次数", aggregate.sprints],
      ["进入安全区", aggregate.safeEntries], ["发现热点", aggregate.discoveries],
      ["解锁结局", aggregate.endings], [activeTab === "session" ? "平均帧率" : "历史会话", activeTab === "session" ? `${session.averageFps} FPS` : lifetime.sessions + 1],
      ["完成实验", aggregate.experiments],
    ];
    metrics.innerHTML = values.map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join("");
  }

  function persist() {
    const snapshot = {
      ...lifetime,
      sessions: lifetime.sessions + 1,
      durationMs: lifetime.durationMs + session.durationMs,
      pointerDistance: lifetime.pointerDistance + session.pointerDistance,
      attacks: lifetime.attacks + session.attacks,
      escaped: lifetime.escaped + session.escaped,
      caught: lifetime.caught + session.caught,
      sprints: lifetime.sprints + session.sprints,
      safeEntries: lifetime.safeEntries + session.safeEntries,
      discoveries: lifetime.discoveries + session.discoveries,
      endings: lifetime.endings + session.endings,
      experiments: lifetime.experiments + session.experiments,
      lastVisit: new Date().toISOString(),
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* Storage may be disabled. */ }
  }

  function openPanel(kind) {
    drawer.classList.toggle("is-visible", kind === "data");
    feedback.classList.toggle("is-visible", kind === "feedback");
    drawer.setAttribute("aria-hidden", kind === "data" ? "false" : "true");
    feedback.setAttribute("aria-hidden", kind === "feedback" ? "false" : "true");
    if (kind === "data") renderMetrics();
  }

  root.querySelectorAll("[data-open]").forEach((button) => button.addEventListener("click", () => openPanel(button.dataset.open)));
  root.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => openPanel(null)));
  root.querySelectorAll("[data-tab]").forEach((button) => button.addEventListener("click", () => {
    activeTab = button.dataset.tab;
    root.querySelectorAll("[data-tab]").forEach((tab) => tab.classList.toggle("is-active", tab === button));
    renderMetrics();
  }));

  root.querySelector("[data-export]").addEventListener("click", () => {
    let experimentRecords = [];
    try { experimentRecords = JSON.parse(localStorage.getItem("gecko-404-experiments-v1") || "[]"); } catch { /* Ignore unavailable records. */ }
    const payload = { exportedAt: new Date().toISOString(), session, lifetime, exploration: window.__geckoExploration?.state || null, experiments: experimentRecords };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `gecko-404-data-${Date.now()}.json`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  root.querySelector("[data-clear]").addEventListener("click", () => {
    if (!window.confirm("清除累计数据和已保存反馈？探索结局记录不会被删除。")) return;
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(lifetime, loadLifetime());
    renderMetrics();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    lifetime.feedback.push({ rating: Number(data.get("rating")), tags: data.getAll("tag"), comment: String(data.get("comment") || "").trim(), createdAt: new Date().toISOString() });
    persist();
    form.reset();
    root.querySelector(".feedback-submit span").textContent = "已保存在本地";
    setTimeout(() => openPanel(null), 900);
  });

  window.addEventListener("gecko:outcome", (event) => {
    if (event.detail.type === "caught") session.caught += 1;
    if (event.detail.type === "escaped" && event.detail.attacked !== false) session.escaped += 1;
  });
  window.addEventListener("gecko:discovery", () => { session.discoveries += 1; });
  window.addEventListener("gecko:ending", (event) => { if (event.detail.firstUnlock) session.endings += 1; });
  window.addEventListener("gecko:experiment-complete", () => { session.experiments += 1; persist(); });
  window.addEventListener("pagehide", persist);

  function update(now) {
    requestAnimationFrame(update);
    session.durationMs = Date.now() - sessionStartedAt;
    const cursor = window.__insectCursor;
    const game = window.__geckoGame;
    const point = cursor?.renderedPointer;
    if (point && previousPointer) session.pointerDistance += Math.hypot(point.x - previousPointer.x, point.y - previousPointer.y);
    if (point) previousPointer = { x: point.x, y: point.y };
    if (cursor?.sprinting && !previousSprint) session.sprints += 1;
    previousSprint = Boolean(cursor?.sprinting);
    if (game?.safe && !previousSafe) session.safeEntries += 1;
    previousSafe = Boolean(game?.safe);
    if ((game?.attacks || 0) > previousAttacks) session.attacks += game.attacks - previousAttacks;
    previousAttacks = game?.attacks || 0;
    session.maxAlert = Math.max(session.maxAlert, game?.alertLevel || 0);

    frameCount += 1;
    if (now - frameWindowStarted >= 1000) {
      const fps = frameCount * 1000 / (now - frameWindowStarted);
      fpsTotal += fps; fpsSamples += 1;
      session.averageFps = Math.round(fpsTotal / fpsSamples);
      frameCount = 0; frameWindowStarted = now;
      if (drawer.classList.contains("is-visible")) renderMetrics();
    }
    if (now - lastPersisted > 15000) { persist(); lastPersisted = now; }
  }

  window.__geckoAnalytics = { session, lifetime, persist, openPanel };
  requestAnimationFrame(update);
})();
