(() => {
  const maps = {
    tokay: `<svg viewBox="0 0 900 500" aria-hidden="true"><g class="map-grid"><path d="M0 100H900M0 200H900M0 300H900M0 400H900M180 0V500M360 0V500M540 0V500M720 0V500"/></g><g class="map-land"><path d="M105 95 215 52 332 68 405 127 495 133 558 181 653 188 718 237 694 291 625 307 580 349 508 330 469 275 403 250 342 206 270 194 207 151 137 150Z"/><path d="M511 338 552 356 570 420 544 454 519 403Z"/><path d="M595 325 631 338 649 384 624 405 598 376Z"/><path d="M685 320 724 337 751 368 730 394 694 370Z"/><path d="M758 276 789 287 802 327 782 348 758 319Z"/></g><path class="map-range" d="M301 144 390 126 486 150 553 184 624 197 673 236 649 285 591 301 552 336 497 312 457 262 398 238 346 203 286 190 265 163Z"/><g class="map-points"><circle cx="365" cy="183" r="7"/><circle cx="468" cy="205" r="7"/><circle cx="563" cy="258" r="7"/><circle cx="620" cy="326" r="7"/></g><g class="map-labels"><text x="330" y="167">SOUTH CHINA</text><text x="451" y="190">MAINLAND SE ASIA</text><text x="580" y="247">PHILIPPINES</text><text x="603" y="350">INDONESIA</text></g></svg>`,
    marine: `<svg viewBox="0 0 900 500" aria-hidden="true"><g class="map-grid"><path d="M0 100H900M0 200H900M0 300H900M0 400H900M180 0V500M360 0V500M540 0V500M720 0V500"/></g><g class="map-ocean-label"><text x="58" y="70">EASTERN PACIFIC · GALÁPAGOS ARCHIPELAGO</text></g><g class="map-islands"><path d="M267 202 303 176 348 185 366 220 349 265 309 282 269 258 245 229Z"/><path d="M405 183 431 168 451 191 443 218 414 224 394 204Z"/><path d="M493 246 516 230 546 241 553 269 526 287 497 276Z"/><path d="M600 197 626 188 646 208 638 235 608 240 589 218Z"/><path d="M692 272 714 263 731 280 724 302 700 307 684 290Z"/><path d="M377 324 394 314 410 329 406 350 383 354 368 340Z"/></g><g class="map-rings"><circle cx="307" cy="228" r="56"/><circle cx="423" cy="197" r="35"/><circle cx="524" cy="260" r="39"/><circle cx="618" cy="215" r="37"/><circle cx="708" cy="285" r="34"/><circle cx="389" cy="335" r="30"/></g><g class="map-labels"><text x="244" y="310">ISABELA</text><text x="390" y="155">SANTIAGO</text><text x="487" y="316">SANTA CRUZ</text><text x="582" y="170">SAN CRISTÓBAL</text><text x="676" y="335">ESPAÑOLA</text><text x="338" y="385">FERNANDINA</text></g></svg>`,
    komodo: `<svg viewBox="0 0 900 500" aria-hidden="true"><g class="map-grid"><path d="M0 100H900M0 200H900M0 300H900M0 400H900M180 0V500M360 0V500M540 0V500M720 0V500"/></g><g class="map-ocean-label"><text x="55" y="70">LESSER SUNDA ISLANDS · INDONESIA</text></g><g class="map-land komodo-land"><path d="M128 193 208 170 294 183 333 212 297 239 215 235 150 220Z"/><path d="M360 235 415 215 472 227 488 253 445 276 388 267Z"/><path d="M502 203 548 188 590 201 601 224 563 242 518 230Z"/><path d="M624 182 698 167 793 180 835 207 802 234 714 230 649 215Z"/><path d="M526 301 550 293 569 310 557 332 531 330Z"/><path d="M594 279 615 273 630 291 620 309 598 305Z"/></g><g class="map-rings"><circle cx="418" cy="246" r="49"/><circle cx="548" cy="216" r="43"/><circle cx="608" cy="291" r="27"/><circle cx="546" cy="313" r="28"/><path d="M647 164 833 164 841 241 646 241Z"/></g><g class="map-labels"><text x="135" y="160">SUMBAWA</text><text x="375" y="305">KOMODO</text><text x="515" y="170">RINCA</text><text x="572" y="350">GILI MOTANG</text><text x="662" y="265">FLORES</text></g></svg>`,
  };

  const dossiers = {
    tokay: {
      count: "01 / 03", kicker: "FOCUS SPECIES · NIGHT FOREST", title: "蛤蚧", scientific: "Gekko gecko · 壁虎科",
      image: "assets/museum/species/tokay-gecko/hero-1600.webp", mobile: "assets/museum/species/tokay-gecko/hero-800.webp", alt: "墙面上的蛤蚧",
      status: "LC · 附录 II", statusNote: "IUCN 2019：无危；CITES 2019：附录 II",
      lead: "它的名字来自叫声，它的脚趾把墙面变成道路，而它所面对的风险，提醒我们“常见”并不等于可以无限获取。",
      facts: [["活动节律", "主要夜行"], ["生活方式", "树栖，也利用建筑"], ["分布", "南亚至东南亚"], ["取食", "伏击型肉食"]],
      range: "原生分布横跨南亚与东南亚，包括印度东北部、孟加拉国、中国南部、中南半岛、菲律宾与印度尼西亚多地；部分地区也出现人为引入种群。",
      mapTitle: "广阔分布，不等于风险均匀。", mapNote: "示意图突出南亚—东南亚连续范围和岛屿分布。不同国家的调查强度、贸易压力与种群趋势并不相同。",
      adaptations: [["01", "层级趾垫", "趾下薄片上的微小刚毛增加有效接触。附着性能还会受到表面粗糙度、污染和水膜影响。"], ["02", "低照度捕食", "宽大的眼和可显著变化的瞳孔帮助它在夜间监测移动目标；捕食仍依赖距离、背景和猎物行为。"], ["03", "响亮领地叫声", "“to-kay”式重复叫声参与个体间交流，也成为许多语言中名称的来源。"]],
      ecologyTitle: "一位在树干与墙面等待的夜行猎手。", ecologyCopy: "蛤蚧多采用等待与短距离突袭结合的方式，取食昆虫，也可能捕食其他小型脊椎动物。建筑灯光聚集昆虫，因此人类环境既可能提供食物，也可能增加捕捉与交易机会。",
      chain: ["灯光与森林边缘", "昆虫聚集", "伏击捕食", "蛇、鸟等更高营养级"],
      conservationIntro: "全球评估为无危，但贸易量、来源可追溯性与区域性下降仍是保护讨论的重点。CITES 附录 II 并不等于禁止贸易，而是要求国际贸易受到管理。",
      threats: [["HARVEST", "野外获取", "药用、宠物和其他用途可能形成大量贸易；关键问题是规模、合法性和可持续来源。"], ["HABITAT", "栖息地变化", "森林结构损失会减少树洞、垂直表面和隐蔽点，人造环境不能完全替代原生栖息地。"], ["ACTION", "负责任选择", "不购买来源不明个体；核查许可、繁育记录与可追溯文件。"]],
      sources: [["Reptile Database · Gekko gecko（分类与分布）", "https://reptile-database.reptarium.cz/front.front/species?genus=gekko&species=gecko"], ["CITES CoP18 · 蛤蚧列入附录 II 的会议记录", "https://cites.org/sites/default/files/eng/cop/18/Com_I/SR/E-CoP18-Com-I-Rec-14.pdf"], ["IUCN/TRAFFIC · CoP18 proposal analysis", "https://cites.org/sites/default/files/eng/cop/18/inf/E-CoP18-Inf-012.pdf"], ["Autumn et al. · Gecko setae adhesion", "https://pmc.ncbi.nlm.nih.gov/articles/PMC129431/"]],
      next: "海鬣蜥：把海洋变成餐桌", nextId: "marine",
    },
    marine: {
      count: "02 / 03", kicker: "FOCUS SPECIES · VOLCANIC SHORE", title: "海鬣蜥", scientific: "Amblyrhynchus cristatus · 鬣蜥科",
      image: "assets/museum/species/marine-iguana/hero-1600.webp", mobile: "assets/museum/species/marine-iguana/hero-800.webp", alt: "火山岩海岸上的海鬣蜥",
      status: "VU · 易危", statusNote: "IUCN 2020 全球评估",
      lead: "它生活在陆地，却到海里取食。每一次潜入冷水，都是食物收益与热量损失之间的计算。",
      facts: [["特有性", "仅见于加拉帕戈斯"], ["主要食物", "海藻"], ["活动", "日行、海岸生活"], ["热策略", "上岸后晒太阳复温"]],
      range: "海鬣蜥是加拉帕戈斯群岛特有种，分布于群岛多座岛屿的岩石海岸。不同岛屿种群在体型、颜色和保护状态上存在差异。",
      mapTitle: "同一物种，分散在不同岛屿海岸。", mapNote: "圆环标出部分代表性岛屿。海岸线、洋流和海藻供应会让相邻岛屿呈现不同的局部条件。",
      adaptations: [["01", "钝吻与取食", "较短而钝的吻部适合刮食岩面海藻，减少在浪涌环境中取食时的多余动作。"], ["02", "扁平尾部", "侧扁的尾巴提供水中推进力；游泳时四肢的作用相对有限。"], ["03", "盐腺与喷盐", "特殊腺体帮助排出随食物与海水摄入的多余盐分，形成醒目的“喷鼻盐”行为。"]],
      ecologyTitle: "海水提供食物，也快速带走热量。", ecologyCopy: "海鬣蜥在海岸岩面或水下取食藻类，离开冷水后需要在陆地吸收太阳辐射。厄尔尼诺事件改变海温和藻类供应时，食物可用性与身体状况会受到显著影响。",
      chain: ["冷水洋流", "海藻生产", "海鬣蜥取食", "海岸营养循环"],
      conservationIntro: "全球评估为易危。污染、入侵捕食者以及气候事件改变食物供应，都会影响不同岛屿种群；保护必须同时连接海洋和陆地。",
      threats: [["CLIMATE", "海洋温度变化", "强厄尔尼诺事件可能减少营养丰富的藻类，造成体况下降和死亡率上升。"], ["INVASIVE", "外来动物", "猫等引入捕食者会影响幼体和局部种群。"], ["ACTION", "保护海岸", "尊重繁殖区标识、保持观察距离，并减少塑料与近岸污染。"]],
      sources: [["IUCN Iguana Specialist Group · 2020 Red List assessment", "https://www.iucn-isg.org/publications/recent-red-list-assessments/"], ["Galápagos Conservancy · Marine iguana biodiversity profile", "https://www.galapagos.org/about_galapagos/biodiversity/"], ["Galápagos National Park · Nesting-area protection", "https://galapagos.gob.ec/llego-la-epoca-de-anidacion-de-iguanas-marinas/"], ["Reptile Database · Amblyrhynchus cristatus", "https://reptile-database.reptarium.cz/front.front/species?genus=Amblyrhynchus&species=cristatus"]],
      next: "科莫多巨蜥：岛屿上的大型捕食者", nextId: "komodo",
    },
    komodo: {
      count: "03 / 03", kicker: "FOCUS SPECIES · ISLAND PREDATOR", title: "科莫多巨蜥", scientific: "Varanus komodoensis · 巨蜥科",
      image: "assets/museum/species/komodo-dragon/hero-1600.webp", mobile: "assets/museum/species/komodo-dragon/hero-800.webp", alt: "林地中的科莫多巨蜥",
      status: "EN · 濒危", statusNote: "IUCN 2021 更新；CITES 附录 I",
      lead: "最大的现生蜥蜴，被限制在少数岛屿上。巨大体型带来捕食优势，也让有限分布与环境变化变得格外重要。",
      facts: [["原生范围", "印度尼西亚小巽他群岛"], ["栖息地", "稀树草原与季风林"], ["食性", "捕食与食腐"], ["保护", "国家公园与长期监测"]],
      range: "现存野生种群局限于印度尼西亚的科莫多、林卡、吉利莫唐等岛屿，以及弗洛勒斯岛部分地区。不同资料对帕达尔和努沙科德等小岛的现存或历史记录表述有所差异。",
      mapTitle: "狭窄岛屿范围放大了环境风险。", mapNote: "示意图标出科莫多国家公园核心岛屿和弗洛勒斯西部。海峡形成隔离，也限制种群在环境变化下迁移。",
      adaptations: [["01", "大型身体", "成体体型使其能够利用较大的猎物，但生长、繁殖和维持活动也需要稳定的食物与空间。"], ["02", "化学感知", "分叉舌把环境中的化学线索带入犁鼻器，帮助定位食物、同类与活动痕迹。"], ["03", "伏击与机会取食", "它们既会等待并突袭猎物，也会利用动物尸体；策略会随年龄、体型和猎物条件变化。"]],
      ecologyTitle: "大型捕食者的命运，取决于整座岛。", ecologyCopy: "鹿等猎物、季节性水源、植被结构、人类活动与海洋边界共同限定科莫多巨蜥的生活。保护单一物种，实际意味着维护完整的陆地食物网和岛屿过程。",
      chain: ["季风与植被", "草食动物", "科莫多巨蜥", "尸体与养分回到系统"],
      conservationIntro: "科莫多巨蜥被评估为濒危，并列入 CITES 附录 I。小范围分布、猎物变化、栖息地压力与气候相关海平面风险，使长期监测尤其重要。",
      threats: [["RANGE", "范围狭窄", "集中于少数岛屿意味着局部事件可能影响全球种群的重要部分。"], ["SYSTEM", "猎物与栖息地", "偷猎、土地利用和猎物数量变化会沿食物网传导到大型捕食者。"], ["ACTION", "保护完整生态系统", "支持依法管理的保护区与科学监测，不参与野生动物制品交易。"]],
      sources: [["IUCN SSC Monitor Lizard Specialist Group · species profile", "https://iucn-mlsg.org/species/southeast-asian-species-2/varanus-komodoensis/"], ["UNESCO World Heritage Centre · Komodo National Park", "https://whc.unesco.org/en/list/609"], ["UNESCO periodic report · distribution and monitoring", "https://whc.unesco.org/document/191588"], ["Reptile Database · Varanus komodoensis", "https://reptile-database.reptarium.cz/front.front/species?genus=Varanus&species=komodoensis"]],
      next: "蛤蚧：回到森林夜班", nextId: "tokay",
    },
  };

  const params = new URLSearchParams(location.search);
  const id = dossiers[params.get("id")] ? params.get("id") : "tokay";
  const data = dossiers[id];
  document.title = `${data.title} · 重点物种档案 · GECKO ATLAS`;
  document.querySelectorAll("[data-dossier-nav]").forEach((link) => link.classList.toggle("is-active", link.dataset.dossierNav === id));
  const image = document.querySelector("[data-dossier-image]");
  image.src = data.image; image.alt = data.alt;
  document.querySelector("[data-dossier-mobile]").srcset = data.mobile;
  const set = (selector, value) => { document.querySelector(selector).textContent = value; };
  set("[data-dossier-count]", data.count); set("[data-dossier-kicker]", data.kicker); set("[data-dossier-title]", data.title); set("[data-dossier-scientific]", data.scientific);
  set("[data-dossier-status]", data.status); set("[data-dossier-status-note]", data.statusNote); set("[data-dossier-lead]", data.lead); set("[data-dossier-range]", data.range);
  set("[data-map-title]", data.mapTitle); set("[data-map-note]", data.mapNote); set("[data-ecology-title]", data.ecologyTitle); set("[data-ecology-copy]", data.ecologyCopy); set("[data-conservation-intro]", data.conservationIntro); set("[data-next-title]", data.next);
  document.querySelector("[data-dossier-facts]").innerHTML = data.facts.map(([label, value]) => `<article><small>${label}</small><strong>${value}</strong></article>`).join("");
  const map = document.querySelector("[data-dossier-map]"); map.innerHTML = maps[id]; map.setAttribute("aria-label", `${data.title}示意分布地图`);
  document.querySelector("[data-dossier-adaptations]").innerHTML = data.adaptations.map(([index, title, copy]) => `<article><span>${index}</span><h3>${title}</h3><p>${copy}</p></article>`).join("");
  document.querySelector("[data-ecology-chain]").innerHTML = data.chain.map((item, index) => `<span><i>${String(index + 1).padStart(2, "0")}</i>${item}</span>`).join("");
  document.querySelector("[data-threats]").innerHTML = data.threats.map(([type, title, copy]) => `<article><small>${type}</small><h3>${title}</h3><p>${copy}</p></article>`).join("");
  document.querySelector("[data-dossier-sources]").innerHTML = data.sources.map(([label, url]) => `<li><a href="${url}" target="_blank" rel="noreferrer">${label}<span>↗</span></a></li>`).join("");
  document.querySelector("[data-next-link]").href = `species.html?id=${data.nextId}`;
})();
