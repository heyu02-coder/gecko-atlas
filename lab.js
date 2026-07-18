(() => {
  const STORAGE_KEY = "gecko-404-experiments-v1";
  const controls = document.querySelector(".adhesion-controls");
  const plane = document.querySelector(".surface-plane");
  const scoreNode = document.querySelector("[data-adhesion-score]");
  const stateNode = document.querySelector("[data-adhesion-state]");
  const trialStrip = document.querySelector("[data-adhesion-trials]");
  const adhesionResult = document.querySelector("[data-adhesion-result]");
  const adhesionTrials = [];
  const surfaceNames = { glass: "玻璃", bark: "树皮", leaf: "叶片", ptfe: "低表面能材料" };
  const surfaceFactors = {
    glass: { dry: .96, wet: .30 }, bark: { dry: .78, wet: .62 },
    leaf: { dry: .68, wet: .76 }, ptfe: { dry: .15, wet: .45 },
  };

  function loadRecords() {
    try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(value) ? value : []; }
    catch { return []; }
  }

  function recordExperiment(result) {
    const records = loadRecords();
    records.unshift(result);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 50))); } catch { /* Storage may be disabled. */ }
    window.dispatchEvent(new CustomEvent("gecko:experiment-complete", { detail: result }));
    renderRecords();
  }

  function calculateAdhesion() {
    const data = new FormData(controls);
    const surface = data.get("surface");
    const wet = data.get("wet") === "on";
    const angle = Number(data.get("angle"));
    const load = Number(data.get("load"));
    const base = surfaceFactors[surface][wet ? "wet" : "dry"] * 100;
    const orientationCost = angle / 180 * 18;
    const loadCost = load * .38;
    const score = Math.max(0, Math.min(100, Math.round(base - orientationCost - loadCost + 18)));
    const state = score >= 42 ? "稳定附着" : score >= 20 ? "接近滑移" : "发生滑移";
    scoreNode.textContent = `${score}%`;
    stateNode.textContent = state;
    stateNode.dataset.state = score >= 42 ? "stable" : score >= 20 ? "marginal" : "slip";
    plane.dataset.surface = surface;
    plane.classList.toggle("is-wet", wet);
    plane.style.setProperty("--plane-angle", `${(angle - 90) * .42}deg`);
    plane.style.setProperty("--slip", score < 20 ? "52px" : "0px");
    controls.querySelector("[data-angle-output]").textContent = `${angle}°`;
    controls.querySelector("[data-load-output]").textContent = `${load}%`;
    return { surface, wet, angle, load, score, state };
  }

  controls.addEventListener("input", calculateAdhesion);
  controls.querySelector("[data-record-adhesion]").addEventListener("click", () => {
    const trial = calculateAdhesion();
    adhesionTrials.push(trial);
    const slot = trialStrip.children[Math.min(adhesionTrials.length - 1, 2)];
    slot.classList.add("is-recorded");
    slot.innerHTML = `<b>${trial.score}%</b><small>${surfaceNames[trial.surface]} · ${trial.wet ? "湿" : "干"}</small>`;
    if (adhesionTrials.length < 3) return;
    const stable = adhesionTrials.filter((item) => item.score >= 42).length;
    const average = Math.round(adhesionTrials.reduce((sum, item) => sum + item.score, 0) / adhesionTrials.length);
    const result = { type: "adhesion", completedAt: new Date().toISOString(), trials: adhesionTrials.slice(-3), stableTrials: stable, averageScore: average };
    recordExperiment(result);
    adhesionResult.hidden = false;
    adhesionResult.innerHTML = `<small>RESULT / TEACHING MODEL</small><h3>3 次中有 ${stable} 次保持稳定</h3><p>平均附着余量 ${average}%。尝试让相同表面在干燥与有水膜时各记录一次，比较变量组合，而不是把指数理解为真实力值。</p>`;
    adhesionTrials.splice(0, adhesionTrials.length);
  });
  calculateAdhesion();

  const camoStage = document.querySelector("[data-camouflage-stage]");
  const camoIntro = camoStage.querySelector(".camouflage-intro");
  const camoTarget = camoStage.querySelector(".camouflage-target");
  const camoResult = document.querySelector("[data-camouflage-result]");
  const rounds = [
    { habitat: "雨林", background: "assets/museum/habitats/rainforest/hero-1600.webp", target: "assets/museum/species/crested-gecko/hero-800.webp", x: 68, y: 43, blend: "luminosity" },
    { habitat: "荒漠", background: "assets/museum/habitats/desert/hero-1600.webp", target: "assets/museum/species/leopard-gecko/hero-800.webp", x: 24, y: 66, blend: "multiply" },
    { habitat: "岩壁", background: "assets/museum/habitats/rock/hero-1600.webp", target: "assets/museum/species/tokay-gecko/hero-800.webp", x: 77, y: 70, blend: "soft-light" },
  ];
  let camoActive = false;
  let camoRound = 0;
  let camoStartedAt = 0;
  let camoMisses = 0;
  let camoTimer = 0;
  const camoTimes = [];

  function showRound() {
    const round = rounds[camoRound];
    camoStage.style.backgroundImage = `linear-gradient(rgb(4 10 6 / 12%), rgb(4 10 6 / 28%)), url("${round.background}")`;
    camoTarget.style.backgroundImage = `url("${round.target}")`;
    camoTarget.style.left = `${round.x}%`; camoTarget.style.top = `${round.y}%`; camoTarget.style.mixBlendMode = round.blend;
    camoTarget.classList.add("is-visible");
    camoStage.querySelector("[data-camo-round]").textContent = `ROUND ${camoRound + 1} / 3 · ${round.habitat}`;
    camoStartedAt = performance.now();
  }

  function updateCamoTime() {
    if (!camoActive) return;
    camoStage.querySelector("[data-camo-time]").textContent = `${((performance.now() - camoStartedAt) / 1000).toFixed(1)}s`;
    camoTimer = requestAnimationFrame(updateCamoTime);
  }

  camoStage.querySelector("[data-camouflage-start]").addEventListener("click", (event) => {
    event.stopPropagation();
    camoActive = true; camoRound = 0; camoMisses = 0; camoTimes.length = 0;
    camoIntro.hidden = true; camoResult.innerHTML = "";
    camoStage.querySelector("[data-camo-misses]").textContent = "误点 0";
    showRound(); cancelAnimationFrame(camoTimer); updateCamoTime();
  });
  camoStage.addEventListener("click", () => {
    if (!camoActive) return;
    camoMisses += 1;
    camoStage.querySelector("[data-camo-misses]").textContent = `误点 ${camoMisses}`;
  });
  camoTarget.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!camoActive) return;
    camoTimes.push(Math.round(performance.now() - camoStartedAt));
    camoTarget.classList.remove("is-visible");
    camoRound += 1;
    if (camoRound < rounds.length) { setTimeout(showRound, 420); return; }
    camoActive = false; cancelAnimationFrame(camoTimer);
    const averageMs = Math.round(camoTimes.reduce((sum, value) => sum + value, 0) / camoTimes.length);
    const result = { type: "camouflage", completedAt: new Date().toISOString(), roundTimesMs: camoTimes.slice(), averageMs, misses: camoMisses };
    recordExperiment(result);
    camoIntro.hidden = false;
    camoIntro.querySelector("h3").textContent = "测试完成";
    camoIntro.querySelector("p").textContent = `平均发现时间 ${(averageMs / 1000).toFixed(1)} 秒，误点 ${camoMisses} 次。`;
    camoIntro.querySelector("button").textContent = "重新测试";
    camoResult.innerHTML = `<small>LAST RESULT</small><h4>${(averageMs / 1000).toFixed(1)} 秒</h4><p>三轮平均发现时间 · ${camoMisses} 次误点</p>`;
  });

  const thermoControls = document.querySelector(".thermo-controls");
  const thermoStage = document.querySelector("[data-thermo-stage]");
  const thermoGecko = thermoStage.querySelector(".thermo-gecko");
  const thermoTemp = document.querySelector("[data-thermo-temp]");
  const thermoState = document.querySelector("[data-thermo-state]");
  const thermoProgress = document.querySelector("[data-thermo-progress]");
  const thermoTime = document.querySelector("[data-thermo-time]");
  const thermoResult = document.querySelector("[data-thermo-result]");
  const targetRange = { min: 29, max: 33 };
  let thermoActive = false;
  let modelTemp = 22;
  let stableSeconds = 0;
  let thermoStartedAt = 0;
  let previousFrame = 0;
  let thermoFrame = 0;

  function thermoValues() {
    const data = new FormData(thermoControls);
    return { ambient: Number(data.get("ambient")), sun: Number(data.get("sun")), position: Number(data.get("position")) };
  }

  function updateThermoControls() {
    const values = thermoValues();
    thermoControls.querySelector("[data-ambient-output]").textContent = `${values.ambient}°C`;
    thermoControls.querySelector("[data-sun-output]").textContent = `${values.sun}%`;
    thermoControls.querySelector("[data-position-output]").textContent = `${values.position}%`;
    thermoGecko.style.left = `${8 + values.position * .84}%`;
    thermoStage.style.setProperty("--sun-strength", `${.2 + values.sun / 125}`);
    return values;
  }

  function finishThermo() {
    thermoActive = false;
    cancelAnimationFrame(thermoFrame);
    const values = thermoValues();
    const durationSeconds = Math.round((performance.now() - thermoStartedAt) / 100) / 10;
    const result = { type: "thermoregulation", completedAt: new Date().toISOString(), durationSeconds, finalTemperature: Math.round(modelTemp * 10) / 10, ambient: values.ambient, sunlight: values.sun, position: values.position, targetMin: targetRange.min, targetMax: targetRange.max };
    recordExperiment(result);
    thermoResult.hidden = false;
    thermoResult.innerHTML = `<small>RESULT / TEACHING MODEL</small><h3>热平衡维持完成</h3><p>用时 ${durationSeconds.toFixed(1)} 秒，最终模型体温 ${modelTemp.toFixed(1)}°C。结果描述的是本页简化规则，不是对真实动物体温的测量。</p>`;
    thermoControls.querySelector("[data-thermo-start]").textContent = "再做一轮";
  }

  function runThermo(now) {
    if (!thermoActive) return;
    const dt = Math.min(.08, Math.max(.001, (now - previousFrame) / 1000));
    previousFrame = now;
    const values = updateThermoControls();
    const equilibrium = values.ambient + (values.sun / 100) * (values.position / 100) * 14;
    modelTemp += (equilibrium - modelTemp) * Math.min(1, dt * .85);
    const inRange = modelTemp >= targetRange.min && modelTemp <= targetRange.max;
    stableSeconds = inRange ? stableSeconds + dt : Math.max(0, stableSeconds - dt * 1.8);
    thermoTemp.textContent = `${modelTemp.toFixed(1)}°C`;
    thermoState.textContent = inRange ? "目标温区内" : modelTemp < targetRange.min ? "低于任务温区" : "高于任务温区";
    thermoState.dataset.state = inRange ? "stable" : modelTemp < targetRange.min ? "cool" : "hot";
    thermoProgress.style.width = `${Math.min(100, stableSeconds / 12 * 100)}%`;
    thermoTime.textContent = `稳定 ${stableSeconds.toFixed(1)} / 12.0 秒`;
    if (stableSeconds >= 12) { finishThermo(); return; }
    thermoFrame = requestAnimationFrame(runThermo);
  }

  thermoControls.addEventListener("input", updateThermoControls);
  thermoControls.querySelector("[data-thermo-start]").addEventListener("click", () => {
    cancelAnimationFrame(thermoFrame);
    const values = updateThermoControls();
    modelTemp = values.ambient;
    stableSeconds = 0;
    thermoStartedAt = performance.now();
    previousFrame = thermoStartedAt;
    thermoActive = true;
    thermoResult.hidden = true;
    thermoProgress.style.width = "0%";
    thermoControls.querySelector("[data-thermo-start]").textContent = "重新开始";
    thermoFrame = requestAnimationFrame(runThermo);
  });
  updateThermoControls();

  function resultSummary(item) {
    if (item.type === "predation") return `逃脱率 ${item.escapeRate}% · ${item.attacks} 次攻击`;
    if (item.type === "adhesion") return `平均余量 ${item.averageScore}% · ${item.stableTrials}/3 稳定`;
    if (item.type === "thermoregulation") return `${item.durationSeconds.toFixed(1)} 秒完成 · ${item.finalTemperature.toFixed(1)}°C`;
    return `平均 ${(item.averageMs / 1000).toFixed(1)} 秒 · ${item.misses} 次误点`;
  }
  function resultName(type) { return ({ predation: "捕食追踪", adhesion: "脚趾吸附", camouflage: "伪装测试", thermoregulation: "体温管理" })[type] || type; }
  function renderRecords() {
    const records = loadRecords();
    const container = document.querySelector("[data-lab-records]");
    container.innerHTML = records.length ? records.map((item, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><small>${new Date(item.completedAt).toLocaleString("zh-CN")}</small><h3>${resultName(item.type)}</h3></div><b>${resultSummary(item)}</b></article>`).join("") : "<p>尚无实验记录。完成任意实验后，结果会出现在这里。</p>";
  }
  document.querySelector("[data-clear-lab]").addEventListener("click", () => { if (confirm("清除全部实验记录？")) { localStorage.removeItem(STORAGE_KEY); renderRecords(); } });
  renderRecords();
})();
