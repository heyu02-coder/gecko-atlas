(() => {
  const list = document.querySelector("[data-credit-list]");
  const count = document.querySelector("[data-credit-count]");

  fetch("assets/museum/image-manifest.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((manifest) => {
      count.textContent = manifest.items.length;
      list.innerHTML = manifest.items.map((item, index) => `
        <article class="credit-row">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div class="credit-subject"><img src="${item.mobile}" alt="${item.alt}" loading="lazy"><div><b>${item.subject}</b><small>${item.fileTitle}</small></div></div>
          <div class="credit-author">${item.author}</div>
          <div class="credit-license"><b>${item.license}</b><a href="${item.sourcePage}" target="_blank" rel="noreferrer">原始文件页 ↗</a>${item.licenseUrl ? `<a href="${item.licenseUrl}" target="_blank" rel="noreferrer">许可文本 ↗</a>` : ""}<small>${item.changes}</small></div>
        </article>`).join("");
    })
    .catch(() => {
      list.innerHTML = "<p>无法读取本地授权清单。请通过项目服务器打开本页面。</p>";
    });
})();
