(() => {
  if (new URLSearchParams(location.search).get("experiment") !== "predation") return;

  const experiment = { active: false, startedAt: 0, attacks: 0, escaped: 0, caught: 0 };
  window.__predationExperiment = experiment;
  const panel = document.createElement("section");
  panel.className = "predation-lab-panel";
  panel.innerHTML = `<header><small>EXP / 01</small><b>捕食追踪实验</b><button type="button" data-lab-close>×</button></header><div class="predation-lab-body"><p>完成三次壁虎攻击。尝试普通移动、静止和 Shift 冲刺。</p><div><span>攻击 <b data-lab-attacks>0 / 3</b></span><span>逃脱 <b data-lab-escapes>0</b></span><span>被捕 <b data-lab-caught>0</b></span></div><button type="button" data-lab-start>开始记录</button></div><div class="predation-lab-result" hidden></div>`;
  document.body.append(panel);

  const startButton = panel.querySelector("[data-lab-start]");
  function render() {
    panel.querySelector("[data-lab-attacks]").textContent = `${experiment.attacks} / 3`;
    panel.querySelector("[data-lab-escapes]").textContent = experiment.escaped;
    panel.querySelector("[data-lab-caught]").textContent = experiment.caught;
  }
  function finish() {
    experiment.active = false;
    const duration = Date.now() - experiment.startedAt;
    const result = { type: "predation", completedAt: new Date().toISOString(), durationMs: duration, attacks: experiment.attacks, escaped: experiment.escaped, caught: experiment.caught, escapeRate: Math.round(experiment.escaped / Math.max(experiment.attacks, 1) * 100) };
    try {
      const records = JSON.parse(localStorage.getItem("gecko-404-experiments-v1") || "[]");
      records.unshift(result);
      localStorage.setItem("gecko-404-experiments-v1", JSON.stringify(records.slice(0, 50)));
    } catch { /* Local storage can be disabled. */ }
    window.dispatchEvent(new CustomEvent("gecko:experiment-complete", { detail: result }));
    const output = panel.querySelector(".predation-lab-result");
    output.hidden = false;
    output.innerHTML = `<small>RESULT</small><h3>逃脱率 ${result.escapeRate}%</h3><p>${Math.round(duration / 1000)} 秒内完成 ${result.attacks} 次攻击：逃脱 ${result.escaped} 次，被捕 ${result.caught} 次。</p><a href="lab.html#records">查看实验记录 ↗</a>`;
    startButton.textContent = "重新实验";
  }
  startButton.addEventListener("click", () => {
    Object.assign(experiment, { active: true, startedAt: Date.now(), attacks: 0, escaped: 0, caught: 0 });
    panel.querySelector(".predation-lab-result").hidden = true;
    startButton.textContent = "记录中…";
    render();
  });
  panel.querySelector("[data-lab-close]").addEventListener("click", () => { location.href = "lab.html#predation"; });
  window.addEventListener("gecko:outcome", (event) => {
    if (!experiment.active) return;
    if (event.detail.type === "escaped" && event.detail.attacked === false) return;
    experiment.attacks += 1;
    if (event.detail.type === "escaped") experiment.escaped += 1;
    if (event.detail.type === "caught") experiment.caught += 1;
    render();
    if (experiment.attacks >= 3) finish();
  });
})();
