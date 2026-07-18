(() => {
  const root = document.documentElement;
  const nav = document.querySelector(".museum-nav");
  const hero = document.querySelector(".museum-hero");
  const searchOverlay = document.querySelector(".search-overlay");
  const searchInput = searchOverlay.querySelector("input");
  const searchResults = searchOverlay.querySelector(".search-results");
  const dialog = document.querySelector(".archive-dialog");
  const articles = {
    tokay: ["蛤蚧", "GEKKO GECKO · SPECIES FILE", "体型较大的树栖壁虎，以响亮叫声闻名。它的趾垫、夜视能力和领地行为共同构成了适应森林夜间环境的方式。", ["壁虎科", "夜行", "树栖", "东南亚"]],
    leopard: ["豹纹守宫", "EUBLEPHARIS MACULARIUS", "一种地栖壁虎。与许多攀爬型壁虎不同，它没有发达趾垫，却保留了可活动眼睑。", ["壁虎科", "地栖", "夜行", "干旱环境"]],
    crested: ["睫角守宫", "CORRELOPHUS CILIATUS", "眼部上方与背部连续的冠状突起形成鲜明轮廓，趾垫与尾部帮助它在植被间移动。", ["壁虎科", "树栖", "夜行", "岛屿特有"]],
    "blue-tongue": ["蓝舌石龙子", "TILIQUA · SPECIES GROUP", "身体粗壮、四肢较短。受到威胁时张口展示蓝色舌头，形成强烈的视觉警告。", ["石龙子科", "地栖", "杂食", "澳大利亚"]],
    marine: ["海鬣蜥", "AMBLYRHYNCHUS CRISTATUS", "能够进入海水取食藻类，并通过晒太阳恢复体温，是岛屿环境中极具代表性的适应案例。", ["鬣蜥科", "日行", "植食", "海岸"]],
    panther: ["豹纹变色龙", "FURCIFER PARDALIS", "独立转动的双眼、弹射式舌头和视觉交流色彩，使其成为观察感知与捕食机制的重要物种。", ["避役科", "树栖", "日行", "马达加斯加"]],
    komodo: ["科莫多巨蜥", "VARANUS KOMODOENSIS", "大型岛屿捕食者。强壮身体、灵敏化学感知和机会主义取食策略塑造了它的生态位置。", ["巨蜥科", "日行", "肉食", "印度尼西亚"]],
    feet: ["脚趾吸附", "ANATOMY 01 · ADHESION", "壁虎趾垫具有层级化微观结构。大量细小刚毛增加有效接触，使它们能在多种表面产生可靠附着。", ["微观结构", "表面接触", "运动适应"]],
    tail: ["断尾与再生", "ANATOMY 02 · AUTOTOMY", "部分蜥蜴能在特定断裂面主动舍弃尾部，以争取逃生时间。再生需要能量，新的尾部结构也不完全等同于原尾。", ["防御行为", "再生", "能量成本"]],
    vision: ["眼睛与夜视", "ANATOMY 03 · VISION", "夜行壁虎需要在低照度下分辨移动的小型猎物。眼部结构、瞳孔变化与视觉处理共同参与这一任务。", ["感知", "低照度", "捕食"]],
    color: ["皮肤与变色", "ANATOMY 04 · COLOR", "蜥蜴的颜色可能参与伪装、交流、求偶与体温调节。不同类群的机制和变化范围并不相同。", ["色素细胞", "交流", "体温调节"]],
    tongue: ["舌头与捕食", "ANATOMY 05 · FEEDING", "从视线锁定、距离判断到肌肉出力，捕食是感知与运动协作的结果。不同蜥蜴拥有截然不同的取食策略。", ["捕食", "预判", "运动控制"]],
    temperature: ["体温调节", "ANATOMY 06 · THERMOREGULATION", "蜥蜴主要通过行为选择管理热量：改变活动时段，在日照与阴影间移动，或利用洞穴和石缝缓冲温度。可用温区因物种、生理状态与环境而异，不应套用单一数值。", ["行为选择", "微栖息地", "热平衡"]],
  };
  const reptileDatabase = (genus, species) => `https://reptile-database.reptarium.cz/front.front/species?genus=${genus}&species=${species}`;
  const articleSources = {
    tokay: [["Reptile Database · Gekko gecko", reptileDatabase("Gekko", "gecko")], ["CITES · Tokay gecko trade information", "https://cites.org/sites/default/files/eng/cop/18/inf/E-CoP18-Inf-012.pdf"]],
    leopard: [["Reptile Database · Eublepharis macularius", reptileDatabase("Eublepharis", "macularius")]],
    crested: [["Reptile Database · Correlophus ciliatus", reptileDatabase("Correlophus", "ciliatus")]],
    "blue-tongue": [["Reptile Database · Tiliqua scincoides", reptileDatabase("Tiliqua", "scincoides")]],
    marine: [["Reptile Database · Amblyrhynchus cristatus", reptileDatabase("Amblyrhynchus", "cristatus")]],
    panther: [["Reptile Database · Furcifer pardalis", reptileDatabase("Furcifer", "pardalis")]],
    komodo: [["Reptile Database · Varanus komodoensis", reptileDatabase("Varanus", "komodoensis")]],
    feet: [["Autumn et al. · Gecko setae adhesion", "https://pmc.ncbi.nlm.nih.gov/articles/PMC129431/"], ["Higham et al. · Wet and rough substrates", "https://pmc.ncbi.nlm.nih.gov/articles/PMC9262901/"]],
    tail: [["Reptile Database · species records", "https://reptile-database.reptarium.cz/advsearch"]],
    vision: [["Reptile Database · Gekkota records", "https://reptile-database.reptarium.cz/advanced_search?taxon=Gekkota&submit=Search"]],
    color: [["Reptile Database · Furcifer pardalis", reptileDatabase("Furcifer", "pardalis")]],
    tongue: [["Reptile Database · Chamaeleonidae records", "https://reptile-database.reptarium.cz/advanced_search?taxon=Chamaeleonidae&submit=Search"]],
    temperature: [["Behavioral thermoregulation in leopard geckos", "https://pmc.ncbi.nlm.nih.gov/articles/PMC5411296/"], ["Thermoregulation and habitat use across lizards", "https://pmc.ncbi.nlm.nih.gov/articles/PMC3639756/"]],
  };
  const siteEntries = [
    ["蛤蚧长篇档案", "重点物种 · 分布、适应与贸易", "species.html?id=tokay", "蛤蚧 大壁虎 Gekko gecko 亚洲"],
    ["海鬣蜥长篇档案", "重点物种 · 海洋取食与岛屿分布", "species.html?id=marine", "海鬣蜥 Galapagos 加拉帕戈斯"],
    ["科莫多巨蜥长篇档案", "重点物种 · 岛屿巨型捕食者", "species.html?id=komodo", "科莫多巨蜥 印度尼西亚"],
    ["捕食追踪", "行为实验 · 危险距离、冲刺与逃脱", "lab.html#predation", "捕食 攻击 昆虫 危险距离"],
    ["脚趾吸附实验", "行为实验 · 表面、水膜、倾角与负载", "lab.html#adhesion", "吸附 脚趾 刚毛"],
    ["伪装测试", "行为实验 · 三类栖息地视觉搜索", "lab.html#camouflage", "伪装 搜索 栖息地"],
    ["体温管理", "行为实验 · 光照、阴影与热平衡", "lab.html#thermoregulation", "体温 温度 日照 阴影"],
    ["栖息地地图", "雨林、沙漠、岩壁、城市与岛屿", "index.html#habitats", "环境 地图 雨林 沙漠 岩壁 城市 岛屿"],
    ["保护与共处", "生态价值、常见误解与负责任贸易", "index.html#coexist", "保护 共处 家中 壁虎 贸易"],
    ["关于项目", "设计目标、技术实现、隐私与路线图", "about.html", "技术 隐私 作品集 项目"],
    ["图片来源与许可", "开放授权素材的作者、原始链接和许可证", "credits.html", "素材 署名 CC BY public domain"],
  ];
  const habitatCopy = {
    rainforest: ["01 / 05", "RAINFOREST", "一棵树，就是一座垂直城市。", "树冠、树干与林下拥有不同温湿度。趾垫、保护色与夜间活动，让壁虎能够占据其他动物难以利用的表面。"],
    desert: ["02 / 05", "DESERT", "白昼隐蔽，夜晚把热量还给沙地。", "洞穴与石缝缓冲极端温差。地栖种类以活动时间和行为选择管理体温与水分。"],
    rock: ["03 / 05", "ROCK FACE", "裂隙既是道路，也是庇护所。", "粗糙表面、垂直落差与有限藏身处，推动吸附能力、扁平体形与快速移动的组合。"],
    city: ["04 / 05", "URBAN", "人造灯光重组了夜间食物网。", "建筑表面提供类似岩壁的结构，灯光聚集昆虫，也让部分壁虎在城市中找到新的生态位。"],
    island: ["05 / 05", "ISLAND", "隔离，让演化走出独特路径。", "有限面积与长期隔离可能产生高度特有的物种，同时也让它们更容易受到入侵物种与环境变化影响。"],
  };

  const heroObserver = new IntersectionObserver(([entry]) => root.classList.toggle("hero-visible", entry.isIntersecting && entry.intersectionRatio > 0.18), { threshold: [0, .18, .5] });
  heroObserver.observe(hero);

  addEventListener("scroll", () => nav.classList.toggle("is-scrolled", scrollY > 28), { passive: true });
  document.querySelector(".nav-menu").addEventListener("click", () => nav.classList.toggle("menu-open"));
  nav.querySelectorAll("nav a").forEach((link) => link.addEventListener("click", () => nav.classList.remove("menu-open")));

  const revealTargets = document.querySelectorAll(".section-kicker, .section-heading, .intro-grid, .forest-stats, .feature-stage, .species-card, .anatomy-card, .lab-heading, .lab-row, .habitat-map, .habitat-readout, .coexist-grid, .museum-cta > *");
  revealTargets.forEach((element) => element.classList.add("reveal"));
  const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  }), { threshold: .1, rootMargin: "0px 0px -7%" });
  revealTargets.forEach((element) => revealObserver.observe(element));

  document.querySelectorAll("[data-family]").forEach((button) => {
    if (!button.closest(".collection-toolbar")) return;
    button.addEventListener("click", () => {
      const family = button.dataset.family;
      document.querySelectorAll(".collection-toolbar button").forEach((item) => item.classList.toggle("is-active", item === button));
      document.querySelectorAll(".species-card").forEach((card) => { card.hidden = family !== "all" && card.dataset.family !== family; });
    });
  });

  function openArticle(id) {
    const article = articles[id];
    if (!article) return;
    dialog.querySelector(".dialog-body > small").textContent = article[1];
    dialog.querySelector("h2").textContent = article[0];
    dialog.querySelector(".dialog-body > p").textContent = article[2];
    dialog.querySelector(".dialog-meta").innerHTML = article[3].map((tag) => `<span>${tag}</span>`).join("");
    const sources = articleSources[id] || [];
    dialog.querySelector(".dialog-sources > div").innerHTML = sources.map(([label, url]) => `<a href="${url}" target="_blank" rel="noreferrer">${label} ↗</a>`).join("");
    const deepLink = dialog.querySelector(".dialog-deep-link");
    const dossierId = ({ tokay: "tokay", marine: "marine", komodo: "komodo" })[id];
    deepLink.hidden = !dossierId;
    if (dossierId) deepLink.href = `species.html?id=${dossierId}`;
    dialog.querySelector(".dialog-index").dataset.article = id;
    dialog.showModal();
  }
  document.querySelectorAll("[data-article]").forEach((element) => {
    element.addEventListener("click", () => openArticle(element.dataset.article));
    if (!/^(BUTTON|A)$/.test(element.tagName)) {
      element.tabIndex = 0;
      element.setAttribute("role", "button");
      element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openArticle(element.dataset.article); }
      });
    }
  });
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

  function openSearch() { searchOverlay.classList.add("is-visible"); searchOverlay.setAttribute("aria-hidden", "false"); setTimeout(() => searchInput.focus(), 120); renderSearch(""); }
  function closeSearch() { searchOverlay.classList.remove("is-visible"); searchOverlay.setAttribute("aria-hidden", "true"); }
  document.querySelector("[data-search-open]").addEventListener("click", openSearch);
  document.querySelector("[data-search-close]").addEventListener("click", closeSearch);
  addEventListener("keydown", (event) => { if (event.key === "Escape") closeSearch(); if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); } });
  function renderSearch(query) {
    const normalized = query.trim().toLowerCase();
    const articleMatches = Object.entries(articles).filter(([, data]) => !normalized || data.join(" ").toLowerCase().includes(normalized)).map(([id, data]) => ({ kind: "article", id, title: data[0], caption: data[1] }));
    const pageMatches = siteEntries.filter((data) => !normalized || data.join(" ").toLowerCase().includes(normalized)).map((data) => ({ kind: "page", url: data[2], title: data[0], caption: data[1] }));
    const matches = [...articleMatches, ...pageMatches].slice(0, 8);
    searchResults.innerHTML = matches.map((item) => item.kind === "article" ? `<button type="button" data-result="${item.id}"><span>${item.title}</span><small>${item.caption}</small></button>` : `<a href="${item.url}"><span>${item.title}</span><small>${item.caption}</small></a>`).join("") || "<p>没有找到相关档案、实验或页面。</p>";
    searchResults.querySelectorAll("[data-result]").forEach((button) => button.addEventListener("click", () => { closeSearch(); openArticle(button.dataset.result); }));
  }
  searchInput.addEventListener("input", () => renderSearch(searchInput.value));

  document.querySelectorAll("[data-habitat]").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll("[data-habitat]").forEach((item) => item.classList.toggle("is-active", item === button));
    const copy = habitatCopy[button.dataset.habitat];
    const readout = document.querySelector(".habitat-readout");
    readout.children[0].textContent = copy[0]; readout.querySelector("small").textContent = copy[1]; readout.querySelector("h3").textContent = copy[2]; readout.children[2].textContent = copy[3];
  }));

  document.querySelector("[data-feedback-open]").addEventListener("click", () => window.__geckoAnalytics?.openPanel?.("feedback"));
  document.querySelector("[data-scroll-top]").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
})();
